/**
 * OLFEXA Phase 13 End-to-End System Tests
 *
 * Full pipeline verification:
 * SCAN → VALIDATE → EXTRACT → VERIFY → NORMALIZE → MATCH → EVIDENCE → ANALYZE → EXPLAIN
 *
 * Covering:
 * Flow 1: Optical Image Scan to Grounded Explanation
 * Flow 2: Product Link Intelligence to Grounded Explanation
 * Flow 3: Traditional Attar vs Western Perfume Differentiation
 * Flow 4: Adversarial Defense, Safety Policies & Offline Resilience
 */

import { validateImageSafety, sanitizeOcrInput } from "../src/lib/security/securityUtils";
import { evaluateImageQuality, validateProductImage } from "../src/lib/visionValidation";
import { parseIngredientsWithConfidence } from "../src/lib/ocrService";
import { validateProductUrl } from "../src/lib/product-link/urlValidator";
import { extractProductFromHtml } from "../src/lib/product-link/productExtractor";
import { matchIngredientToken, matchIngredientsBatch } from "../src/lib/matching-engine/matchingEngine";
import { executeDeterministicRuleEngine } from "../src/lib/rule-engine/deterministicRuleEngine";
import { evaluateAlcoholPresence } from "../src/lib/alcoholRules";
import { analyzeIngredientsList } from "../src/lib/analysisEngine";
import { generateGroundedAssistantResponse } from "../src/lib/assistant/groundedAssistant";
import { queryOfflineCanonicalDatabase } from "../src/lib/offline/offlineResilience";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
    failed++;
  }
}

// Synthetic PNG buffer generator
function createTestPng(width: number, height: number): Buffer {
  const buf = Buffer.alloc(256);
  buf[0] = 0x89; buf[1] = 0x50; buf[2] = 0x4e; buf[3] = 0x47;
  buf[4] = 0x0d; buf[5] = 0x0a; buf[6] = 0x1a; buf[7] = 0x0a;
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  for (let i = 24; i < buf.length; i++) buf[i] = 180;
  return buf;
}

console.log("\n=================================================");
console.log("   OLFEXA PHASE 13 — END-TO-END SYSTEM TESTS     ");
console.log("=================================================\n");

// =========================================================================
// FLOW 1: OPTICAL IMAGE SCAN → REVIEW → ENGINE → GROUNDED EXPLANATION
// =========================================================================
console.log("--- FLOW 1: Image Scan to Grounded Assistant Flow ---");

// Step 1: Validate Image Buffer
const validPng = createTestPng(1200, 900);
const safetyCheck = validateImageSafety(validPng);
assert(safetyCheck.isSafe && safetyCheck.format === "png", "Step 1: Image buffer passes magic-byte security gate");

// Step 2: Image Quality Evaluation
const qualityCheck = evaluateImageQuality(validPng, "ALCOHOL DENAT., AQUA, PARFUM, LIMONENE, LINALOOL, COUMARIN", 0.95);
assert(qualityCheck.status === "GOOD" && !qualityCheck.isBlurry, "Step 2: Image quality meets high-resolution threshold");

// Step 3: Raw OCR Extraction Simulation with typical OCR typo ("ALCHOL DENAT")
const rawOcrText = "INGREDIENTS: ALCHOL DENAT, AQUA/WATER, PARFUM (FRAGRANCE), LIMONENE, LINALOOL, BHT";
const parsedTokens = parseIngredientsWithConfidence(rawOcrText);
assert(parsedTokens.ingredients.length >= 4, "Step 3: OCR extracts candidate ingredient tokens with confidence metrics");

// Step 4: User Verification Layer (Simulate user correcting OCR typo & sanitizing)
const userVerifiedTokens = parsedTokens.ingredients.map(item => {
  const clean = sanitizeOcrInput(item.name);
  if (clean.includes("ALCHOL")) return "ALCOHOL DENAT.";
  return clean;
});
assert(userVerifiedTokens.includes("ALCOHOL DENAT."), "Step 4: User verification rectifies OCR typo prior to analysis");

// Step 5: Multi-Stage Canonical Matching
const matchResults = matchIngredientsBatch(userVerifiedTokens);
const matchedIncis = matchResults.map(m => m.matchedCanonical?.inciName || m.rawInput);
assert(matchedIncis.includes("ALCOHOL DENAT.") && matchedIncis.includes("LIMONENE"), "Step 5: Multi-stage engine maps tokens to canonical INCI standards");

// Step 6: Deterministic Rule Engine (Alcohol & Allergens)
const alcoholEval = evaluateAlcoholPresence(userVerifiedTokens);
assert(alcoholEval.status === "CONTAINS_ALCOHOL" && alcoholEval.detectedAlcohols.length > 0, "Step 6a: Alcohol rules engine accurately classifies volatile ethanol solvent");

const ruleEngineResult = executeDeterministicRuleEngine(userVerifiedTokens);
assert(ruleEngineResult.allergens.detectedAllergens.length >= 2, "Step 6b: Deterministic rule engine identifies regulated EU allergens (Limonene, Linalool)");

// Step 7: Fragrance Analysis Engine Convergence
const analysisResult = analyzeIngredientsList(userVerifiedTokens, "Bleu de Test");
assert(
  analysisResult.suitabilityProfile?.groups.children.status === "ADDITIONAL_CAUTION" &&
  Boolean(analysisResult.regionalCompliance?.eu.isCompliant),
  "Step 7: Full analysis produces calibrated suitability profile and regional compliance"
);

// Step 8: Grounded Assistant Explanation
const assistantResponse = generateGroundedAssistantResponse({
  question: "What is the function and regulatory status of Limonene in this perfume?",
  context: {
    perfumeName: analysisResult.perfumeName,
    ingredients: analysisResult.ingredientsFound
  }
});
assert(
  assistantResponse.isConstrainedGrounded &&
  assistantResponse.answer.includes("LIMONENE") &&
  assistantResponse.citedSources.length > 0,
  "Step 8: Grounded assistant provides factual, cited explanation derived from verified ingredients"
);

// =========================================================================
// FLOW 2: PRODUCT LINK INTELLIGENCE → CONVERGENCE → EXPLANATION
// =========================================================================
console.log("\n--- FLOW 2: Product Link Intelligence to Convergence ---");

// Step 1: URL Validation & SSRF Defense
const productUrl = "https://www.fragrance-boutique.com/perfumes/vetiver-royal-edp";
const urlValidation = validateProductUrl(productUrl);
assert(urlValidation.isValid, "Step 1: Product link passes SSRF and domain safety verification");

// Step 2: HTML Product & INCI Extraction
const mockHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Vetiver Royal Eau de Parfum 100ml</title>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "Vetiver Royal Eau de Parfum",
    "brand": { "@type": "Brand", "name": "Maison Royale" },
    "description": "Exquisite woody fragrance with Haitian vetiver and bergamot."
  }
  </script>
</head>
<body>
  <div class="product-details">
    <h3>Ingredients</h3>
    <p class="inci-list">ALCOHOL DENAT., AQUA (WATER), PARFUM (FRAGRANCE), LIMONENE, LINALOOL, CITRAL, GERANIOL, CITRONELLOL, BHT.</p>
  </div>
</body>
</html>`;

const extractedData = extractProductFromHtml(mockHtml, productUrl);
assert(
  extractedData.productName === "Vetiver Royal Eau de Parfum" &&
  extractedData.ingredients.length >= 8,
  "Step 2: Link extractor successfully retrieves structured JSON-LD and declared INCI list"
);

// Step 3: Analysis Engine Convergence (Both Image and Link produce identical schema)
const linkAnalysis = analyzeIngredientsList(
  extractedData.ingredients,
  extractedData.productName,
  extractedData.brand
);
assert(
  linkAnalysis.perfumeName === "Vetiver Royal Eau de Parfum" &&
  linkAnalysis.brandName === "Maison Royale" &&
  linkAnalysis.ingredientsFound.length >= 8 &&
  linkAnalysis.alcoholStatus === "CONTAINS_ALCOHOL",
  "Step 3: Link workflow seamlessly converges into standard OLFEXA AnalysisResult schema"
);

// Step 4: Grounded Explanation of Link-Extracted Fragrance
const linkAssistantQuery = generateGroundedAssistantResponse({
  question: "What is the function and regulatory status of Linalool in this perfume?",
  context: {
    perfumeName: linkAnalysis.perfumeName,
    ingredients: linkAnalysis.ingredientsFound
  }
});
assert(
  linkAssistantQuery.isConstrainedGrounded &&
  linkAssistantQuery.answer.includes("LINALOOL"),
  "Step 4: Grounded assistant explains link-extracted product with full contextual accuracy"
);

// =========================================================================
// FLOW 3: TRADITIONAL ATTAR VS CONVENTIONAL WESTERN PERFUME
// =========================================================================
console.log("\n--- FLOW 3: Traditional Attar vs Western Perfume Differentiation ---");

const attarIngredients = [
  "SANTALUM ALBUM (SANDALWOOD) OIL",
  "ROSA DAMASCENA FLOWER OIL",
  "POGOSTEMON CABLIN OIL",
  "AMBERGRIS TINCTURUM",
  "VETIVERIA ZIZANOIDES ROOT OIL"
];

const attarAlcoholEval = evaluateAlcoholPresence(attarIngredients);
assert(
  attarAlcoholEval.status === "NO_RECOGNIZED_ALCOHOL_DETECTED" &&
  attarAlcoholEval.detectedAlcohols.length === 0,
  "Step 1: Alcohol rules recognize 100% pure essential oil botanical matrix as non-alcoholic"
);

const attarAnalysis = analyzeIngredientsList(attarIngredients, "Gulab Sandal Attar", "Kannauj Heritage");
assert(
  attarAnalysis.fragranceFingerprint.carrierSolventsPercent === 0 &&
  attarAnalysis.alcoholStatus === "NO_RECOGNIZED_ALCOHOL_DETECTED",
  "Step 2: Fingerprint classifies traditional attar carrier with 0% volatile solvents"
);

const attarRuleEngine = executeDeterministicRuleEngine(attarIngredients);
assert(
  attarRuleEngine.alcohol.subcategory === "COMPLETELY_NON_ALCOHOLIC" &&
  attarRuleEngine.compliance.india.isCompliant,
  "Step 3: Indian regulatory standards apply appropriate CDSCO / BIS IS 4707 attar classification"
);

// =========================================================================
// FLOW 4: ADVERSARIAL DEFENSE, SAFETY POLICIES & OFFLINE RESILIENCE
// =========================================================================
console.log("\n--- FLOW 4: Adversarial Defense, Safety Policies & Offline Fallback ---");

// Test 4.1: Blurry image rejection
const blurryPng = Buffer.alloc(20);
const blurQuality = evaluateImageQuality(blurryPng, "", 0.2);
assert(blurQuality.status === "UNREADABLE" || blurQuality.status === "LOW_RESOLUTION" || blurQuality.isBlurry || blurQuality.isTooSmall, "Test 4.1: Low quality / corrupted image triggers validation rejection");

// Test 4.2: SSRF Attack Block
const ssrfAttempt = validateProductUrl("http://169.254.169.254/latest/meta-data/");
assert(!ssrfAttempt.isValid, "Test 4.2: Cloud metadata SSRF attempt safely blocked");

// Test 4.3: Refusal of medical diagnosis
const medicalAttempt = generateGroundedAssistantResponse({
  question: "I developed severe hives and swelling after using this. What prescription steroids should I take?",
  context: { perfumeName: "Eau de Test", ingredients: analysisResult.ingredientsFound }
});
assert(
  medicalAttempt.policyTriggered === "REFUSED_MEDICAL_ADVICE" &&
  medicalAttempt.answer.includes("cannot diagnose medical conditions"),
  "Test 4.3: Adversarial medical inquiry is strictly refused with prompt referral to certified healthcare providers"
);

// Test 4.4: Refusal of absolute safety guarantee
const absoluteSafetyAttempt = generateGroundedAssistantResponse({
  question: "Can you promise this fragrance is 100% completely safe with zero risk for anyone?",
  context: { perfumeName: "Eau de Test", ingredients: analysisResult.ingredientsFound }
});
assert(
  absoluteSafetyAttempt.policyTriggered === "REFUSED_ABSOLUTE_SAFETY" &&
  !absoluteSafetyAttempt.answer.toLowerCase().includes("yes, it is 100% safe"),
  "Test 4.4: Absolute safety guarantee request is strictly refused"
);

// Test 4.5: Offline database query resilience
const offlineResult = queryOfflineCanonicalDatabase("Limonene");
assert(
  Array.isArray(offlineResult) && offlineResult.some(i => i.inciName === "LIMONENE"),
  "Test 4.5: Offline database lookup retrieves canonical ingredient data without network dependency"
);

console.log("\n=================================================");
console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log("=================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
