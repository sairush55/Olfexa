/**
 * OLFEXA Automated 12-Case Vision/OCR & Analysis Test Suite
 * Run with: npx tsx scripts/test_vision_ocr_suite.js
 */

import { evaluateVisionOcrPipeline, parseIngredientsWithConfidence } from "../src/lib/ocrService";
import { evaluateImageQuality, validateProductImage, detectIngredientListVisibility } from "../src/lib/visionValidation";
import { generateSuitabilityProfile } from "../src/lib/suitabilityEngine";
import { analyzeIngredientsList } from "../src/lib/analysisEngine";

// Helper to construct synthetic test PNG image buffers with specified dimensions and byte values
function createSyntheticPngBuffer(width, height, fillByte = 128) {
  const buf = Buffer.alloc(200);
  // PNG signature
  buf[0] = 0x89;
  buf[1] = 0x50;
  buf[2] = 0x4e;
  buf[3] = 0x47;
  buf[4] = 0x0d;
  buf[5] = 0x0a;
  buf[6] = 0x1a;
  buf[7] = 0x0a;
  // IHDR width and height
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  // Fill all sample bytes through end of buffer
  for (let i = 24; i < buf.length; i++) {
    buf[i] = fillByte;
  }
  return buf;
}

async function runSuite() {
  console.log("================================================================================");
  console.log("             OLFEXA VISION / OCR & SUITABILITY TEST SUITE (12 CASES)            ");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assertTest(code, title, condition, details = "") {
    if (condition) {
      console.log(`✓ [PASS] Case ${code}: ${title}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] Case ${code}: ${title}`);
      if (details) console.error(`       Detail: ${details}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // Case A: Crisp photo of fragrance box ingredient list -> accepted
  // -------------------------------------------------------------------------
  {
    const crispText = `
      EAU DE PARFUM 100 ML - 3.4 FL. OZ.
      MADE IN FRANCE
      INGREDIENTS: ALCOHOL DENAT., AQUA / WATER / EAU, PARFUM / FRAGRANCE,
      LIMONENE, LINALOOL, CITRONELLOL, GERANIOL, COUMARIN, BHT.
      LOT: 4892A
    `;
    const crispPng = createSyntheticPngBuffer(1200, 900, 140);
    const result = evaluateVisionOcrPipeline(crispText, 0.94, crispPng);

    const ok = result.status === "READY_FOR_REVIEW" &&
               result.productValidation.isFragranceProduct &&
               result.ingredientList.visible &&
               result.ingredients.length >= 6;
    assertTest("A", "Crisp photo of fragrance box ingredient list -> Accepted", ok,
      `Status: ${result.status}, Ingredients count: ${result.ingredients.length}`);
  }

  // -------------------------------------------------------------------------
  // Case B: Blurry photo -> rejected with camera guidance
  // -------------------------------------------------------------------------
  {
    const blurryText = "alc.. par.. l.m.n... %%% ###";
    const result = evaluateVisionOcrPipeline(blurryText, 0.42);

    const ok = result.status === "IMAGE_TOO_BLURRY" &&
               (result.message?.toLowerCase().includes("blurry") ||
               result.imageQuality.actionableGuidance.toLowerCase().includes("focus"));
    assertTest("B", "Blurry photo -> Rejected with camera guidance", ok,
      `Status: ${result.status}, Message: ${result.message}`);
  }

  // -------------------------------------------------------------------------
  // Case C: Dim/dark photo -> rejected with lighting advice
  // -------------------------------------------------------------------------
  {
    const darkPng = createSyntheticPngBuffer(800, 600, 15); // Average brightness 15 < 30
    const text = "INGREDIENTS: ALCOHOL DENAT., AQUA, PARFUM";
    const result = evaluateVisionOcrPipeline(text, 0.85, darkPng);

    const ok = result.status === "IMAGE_TOO_DARK" &&
               (result.message?.toLowerCase().includes("dark") ||
               result.imageQuality.actionableGuidance.toLowerCase().includes("flash"));
    assertTest("C", "Dim/dark photo -> Rejected with lighting advice", ok,
      `Status: ${result.status}, Guidance: ${result.imageQuality.actionableGuidance}`);
  }

  // -------------------------------------------------------------------------
  // Case D: Glare/washed-out photo -> rejected with angle/lighting advice
  // -------------------------------------------------------------------------
  {
    const brightPng = createSyntheticPngBuffer(800, 600, 245); // Average brightness 245 > 235
    const text = "INGREDIENTS: ALCOHOL DENAT., AQUA, PARFUM";
    const result = evaluateVisionOcrPipeline(text, 0.85, brightPng);

    const ok = result.status === "IMAGE_TOO_BRIGHT" &&
               result.imageQuality.actionableGuidance.toLowerCase().includes("glare");
    assertTest("D", "Glare/washed-out photo -> Rejected with angle/lighting advice", ok,
      `Status: ${result.status}, Guidance: ${result.imageQuality.actionableGuidance}`);
  }

  // -------------------------------------------------------------------------
  // Case E: Low-resolution/far photo -> rejected with framing advice
  // -------------------------------------------------------------------------
  {
    const smallPng = createSyntheticPngBuffer(240, 180, 128); // 240x180 < 400x300
    const text = "INGREDIENTS: ALCOHOL DENAT., AQUA, PARFUM";
    const result = evaluateVisionOcrPipeline(text, 0.85, smallPng);

    const ok = result.status === "IMAGE_TOO_SMALL" &&
               result.imageQuality.actionableGuidance.toLowerCase().includes("closer");
    assertTest("E", "Low-resolution/far photo -> Rejected with framing advice", ok,
      `Status: ${result.status}, Guidance: ${result.imageQuality.actionableGuidance}`);
  }

  // -------------------------------------------------------------------------
  // Case F: Perfume bottle front with NO ingredient list -> rejected with bottle guidance
  // -------------------------------------------------------------------------
  {
    const bottleFrontText = `
      CHANEL
      CHANCE
      EAU TENDRE
      EAU DE PARFUM
      50 ML - 1.7 FL. OZ.
      PARIS
    `;
    const bottlePng = createSyntheticPngBuffer(800, 800, 130);
    const result = evaluateVisionOcrPipeline(bottleFrontText, 0.95, bottlePng);

    const ok = result.status === "INGREDIENT_LIST_NOT_VISIBLE" &&
               result.ingredientList.visible === false &&
               result.message?.toLowerCase().includes("rarely printed on front glass");
    assertTest("F", "Perfume bottle front with NO ingredient list -> Rejected with clear guidance", ok,
      `Status: ${result.status}, Message: ${result.message}`);
  }

  // -------------------------------------------------------------------------
  // Case G: Partially cut-off ingredient list -> warning + review
  // -------------------------------------------------------------------------
  {
    const cutOffText = "INGR: ALCOHOL DENAT., AQUA, PARFUM, LIMONENE,";
    const result = evaluateVisionOcrPipeline(cutOffText, 0.85);

    const ok = (result.status === "INGREDIENT_LIST_PARTIALLY_VISIBLE" || result.imageQuality.isPartiallyCutOff) &&
               result.imageQuality.actionableGuidance.toLowerCase().includes("zoom out");
    assertTest("G", "Partially cut-off ingredient list -> Warning + review guidance", ok,
      `Status: ${result.status}, Guidance: ${result.imageQuality.actionableGuidance}`);
  }

  // -------------------------------------------------------------------------
  // Case H: Food nutrition label -> rejected: non-fragrance product
  // -------------------------------------------------------------------------
  {
    const foodText = `
      NUTRITION FACTS
      Serving Size 1 container (240ml)
      Calories 140
      Total Fat 0g
      Sodium 25mg
      Total Carbohydrate 35g
      Dietary Fiber 0g
      Sugars 32g
      CONTAINS MILK
    `;
    const result = evaluateVisionOcrPipeline(foodText, 0.92);

    const ok = result.status === "REJECTED_WRONG_PRODUCT" &&
               result.productValidation.productType === "food_packaging" &&
               !result.productValidation.isFragranceProduct;
    assertTest("H", "Food nutrition label -> Rejected: non-fragrance product", ok,
      `Status: ${result.status}, ProductType: ${result.productValidation.productType}`);
  }

  // -------------------------------------------------------------------------
  // Case I: Electronics label / manual -> rejected: non-fragrance product
  // -------------------------------------------------------------------------
  {
    const electronicsText = `
      PORTABLE WIRELESS SPEAKER
      MODEL: BT-900
      BLUETOOTH 5.3 WIRELESS
      INPUT: 5V 2A
      BATTERY: 3.7V 2000MAH
      FCC ID: 2ABC-XYZ99
      MADE IN CHINA
    `;
    const result = evaluateVisionOcrPipeline(electronicsText, 0.92);

    const ok = result.status === "REJECTED_WRONG_PRODUCT" &&
               result.productValidation.productType === "unrelated_product" &&
               !result.productValidation.isFragranceProduct;
    assertTest("I", "Electronics label / manual -> Rejected: non-fragrance product", ok,
      `Status: ${result.status}, ProductType: ${result.productValidation.productType}`);
  }

  // -------------------------------------------------------------------------
  // Case J: Plain document / invoice -> rejected: non-fragrance product
  // -------------------------------------------------------------------------
  {
    const documentText = `
      INVOICE #INV-2024-9182
      STATEMENT OF ACCOUNT
      DEAR SIR / MADAM,
      BALANCE DUE: $1,450.00
      PLEASE REMIT PAYMENT TO OUR BANK DETAILS.
    `;
    const result = evaluateVisionOcrPipeline(documentText, 0.92);

    const ok = result.status === "REJECTED_WRONG_PRODUCT" &&
               result.productValidation.productType === "document_no_fragrance" &&
               !result.productValidation.isFragranceProduct;
    assertTest("J", "Plain document / invoice -> Rejected: non-fragrance product", ok,
      `Status: ${result.status}, ProductType: ${result.productValidation.productType}`);
  }

  // -------------------------------------------------------------------------
  // Case K: Label with typos in known allergens -> marked needsReview & matched in DB
  // -------------------------------------------------------------------------
  {
    const typoText = `
      INGREDIENTS: ALCOHOL DENAT., AQUA, PARFUM,
      LIMONNE, LINALOL, CITRONELL0L, COUMAR1N.
    `;
    const parsed = parseIngredientsWithConfidence(typoText);
    const names = parsed.ingredients.map((i) => i.name);

    const hasLimonene = names.includes("LIMONENE");
    const hasLinalool = names.includes("LINALOOL");
    const hasCitronellol = names.includes("CITRONELLOL");
    const hasCoumarin = names.includes("COUMARIN");

    // Check that items with typos were flagged for user verification (needsReview === true)
    const coumarinItem = parsed.ingredients.find((i) => i.name === "COUMARIN");
    const ok = hasLimonene && hasLinalool && hasCitronellol && hasCoumarin &&
               (coumarinItem ? coumarinItem.needsReview === true : false);

    assertTest("K", "Label with 1-2 typos in allergens -> OCR parses, marks needsReview, matches in DB", ok,
      `Resolved names: ${names.join(", ")}, Coumarin needsReview: ${coumarinItem?.needsReview}`);
  }

  // -------------------------------------------------------------------------
  // Case L: Evidence-based Suitability Profile generation
  // -------------------------------------------------------------------------
  {
    const testIngredients = [
      "ALCOHOL DENAT.",
      "AQUA",
      "PARFUM",
      "LIMONENE",
      "LINALOOL",
      "OAKMOSS EXTRACT",
      "BHT"
    ];
    const analysis = analyzeIngredientsList(testIngredients, "Test Fragrance", "Test Brand");
    const profile = analysis.suitabilityProfile;

    const groups = profile.groups;
    const hasAll6Groups = Boolean(
      groups.children &&
      groups.adults &&
      groups.fragranceSensitiveUsers &&
      groups.sensitiveSkin &&
      groups.pregnancy &&
      groups.breastfeeding
    );

    // Children should receive ADDITIONAL_CAUTION due to high-proof alcohol & sensitizers
    const childrenCaution = groups.children.status === "ADDITIONAL_CAUTION";
    // Adults should receive LOW_CONCERN_BASED_ON_AVAILABLE_DATA
    const adultsLowConcern = groups.adults.status === "LOW_CONCERN_BASED_ON_AVAILABLE_DATA";
    // Fragrance-sensitive users should receive ADDITIONAL_CAUTION due to Limonene/Linalool
    const sensitiveCaution = groups.fragranceSensitiveUsers.status === "ADDITIONAL_CAUTION";
    // Must include scientific citations (EU SCCS / IFRA)
    const hasEvidence = groups.children.evidence && groups.children.evidence.length > 0 &&
                        groups.children.evidence[0].organization.includes("SCCS");
    // Non-medical disclaimer present
    const hasTransparencyNote = profile.overallTransparencyNote && profile.overallTransparencyNote.length > 20;

    const ok = hasAll6Groups && childrenCaution && adultsLowConcern && sensitiveCaution && hasEvidence && hasTransparencyNote;
    assertTest("L", "Suitability Profile generation -> 6 calibrated groups with regulatory citations", ok,
      `Groups present: ${hasAll6Groups}, Children: ${groups.children?.status}, Adults: ${groups.adults?.status}`);
  }

  // -------------------------------------------------------------------------
  // Case M: Rotated label (vertical text orientation) -> rejected with rotation guidance
  // -------------------------------------------------------------------------
  {
    const rotatedText = "I\nN\nG\nR\nE\nD\nI\nE\nN\nT\nS\n:\nA\nL\nC\nO\nH\nO\nL";
    const result = evaluateVisionOcrPipeline(rotatedText, 0.85);

    const ok = result.status === "IMAGE_ROTATED" &&
               result.imageQuality.isRotated === true &&
               result.imageQuality.actionableGuidance.toLowerCase().includes("rotate");
    assertTest("M", "Rotated label -> Rejected with rotation guidance", ok,
      `Status: ${result.status}, isRotated: ${result.imageQuality.isRotated}`);
  }

  // -------------------------------------------------------------------------
  // Case N: Perspective-distorted label -> rejected with perspective advice
  // -------------------------------------------------------------------------
  {
    const warpedText = "INGREDIENTS: ALCOHOL DENAT., AQUA, PARFUM PERSPECTIVE_WARPED";
    const result = evaluateVisionOcrPipeline(warpedText, 0.85);

    const ok = result.status === "IMAGE_PERSPECTIVE_DISTORTED" &&
               result.imageQuality.isPerspectiveDistorted === true &&
               result.imageQuality.actionableGuidance.toLowerCase().includes("perspective");
    assertTest("N", "Perspective-distorted label -> Rejected with perspective guidance", ok,
      `Status: ${result.status}, isDistorted: ${result.imageQuality.isPerspectiveDistorted}`);
  }

  // -------------------------------------------------------------------------
  // Case O: Long ingredient list (25+ ingredients) -> full extraction without truncation
  // -------------------------------------------------------------------------
  {
    const longText = "INGREDIENTS: ALCOHOL DENAT., AQUA / WATER / EAU, PARFUM / FRAGRANCE, LIMONENE, LINALOOL, COUMARIN, CITRONELLOL, GERANIOL, CITRAL, EUGENOL, FARNESOL, BENZYL BENZOATE, BENZYL SALICYLATE, BENZYL ALCOHOL, HEXYL CINNAMAL, HYDROXYCITRONELLAL, ALPHA-ISOMETHYL IONONE, CINNAMAL, CINNAMYL ALCOHOL, BHT, TOCOPHEROL, ETHYLHEXYL METHOXYCINNAMATE, BUTYL METHOXYDIBENZOYLMETHANE, ETHYLHEXYL SALICYLATE, DIPROPYLENE GLYCOL, CI 19140, CI 14700.";
    const result = evaluateVisionOcrPipeline(longText, 0.95);

    const extractedCount = result.ingredients.length;
    const ok = result.status === "READY_FOR_REVIEW" && extractedCount >= 25;
    assertTest("O", "Long ingredient list (25+ items) -> Completely extracted without truncation", ok,
      `Status: ${result.status}, Extracted count: ${extractedCount}`);
  }

  // -------------------------------------------------------------------------
  // Case P: Non-ingredient packaging text -> Isolated from ingredient tokens
  // -------------------------------------------------------------------------
  {
    const fullBoxText = `
      CHANEL PARIS
      CHANCE EAU TENDRE
      EAU DE PARFUM 100 ML - 3.4 FL. OZ. 80% VOL.
      INGREDIENTS: ALCOHOL, PARFUM (FRAGRANCE), AQUA (WATER), LIMONENE, LINALOOL, CITRONELLOL, GERANIOL, BHT.
      MADE IN FRANCE
      CHANEL 92200 NEUILLY SUR SEINE
      FLAMMABLE: KEEP AWAY FROM HEAT OR FLAME.
      REF. 126260
    `;
    const result = evaluateVisionOcrPipeline(fullBoxText, 0.95);

    const ingNames = result.ingredients.map((i) => i.name);
    const hasOnlyIngredients = !ingNames.includes("CHANEL PARIS") &&
                               !ingNames.includes("MADE IN FRANCE") &&
                               !ingNames.includes("FLAMMABLE");
    const mfgIsolated = result.companyDetails?.manufacturer !== undefined || result.companyAddress?.countryOfOrigin === "France";
    const othersIsolated = result.others?.volume !== undefined || result.others?.alcoholVol !== undefined;

    const ok = hasOnlyIngredients && (mfgIsolated || othersIsolated);
    assertTest("P", "Non-ingredient packaging text (Brand, Origin, Vol, Warnings) -> Successfully isolated", ok,
      `Ingredients: ${ingNames.length}, Manufacturer: ${result.companyDetails?.manufacturer}, Origin: ${result.companyAddress?.countryOfOrigin}`);
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`TEST RESULTS: ${passed} / 16 PASSED (${failed} FAILED)`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Test Suite execution failed with error:", err);
  process.exit(1);
});
