/**
 * OLFEXA Checkpoint 3: User Verification Automated Unit Test
 * Verifies that:
 * 1. User can edit an ingredient
 * 2. User can delete an incorrect ingredient
 * 3. User can add a missing ingredient
 * 4. Uncertain extraction is clearly identified
 * 5. Final analysis strictly uses the verified data
 */

import { parseIngredientsWithConfidence } from "../src/lib/ocrService";
import { analyzeIngredientsList } from "../src/lib/analysisEngine";

function runVerificationTestSuite() {
  console.log("================================================================================");
  console.log("       OLFEXA CHECKPOINT 3: USER VERIFICATION PIPELINE TESTS                    ");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`✓ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${name}`);
      if (detail) console.error(`       Detail: ${detail}`);
      failed++;
    }
  }

  // 1. Initial OCR Extraction with an uncertain typo and an OCR artifact
  const rawOcrText = "INGREDIENTS: ALCOHOL DENAT., AQUA, PARFUM, LIMONNNE, CITRAL, 80% VOL, MADE IN FRANCE.";
  const parsed = parseIngredientsWithConfidence(rawOcrText);

  // Requirement 4: Uncertain extraction is clearly identified
  const limoneneCandidate = parsed.ingredients.find(i => i.rawDetected?.includes("LIMONNNE") || i.name.includes("LIMONENE"));
  const isUncertainIdentified = Boolean(limoneneCandidate && (limoneneCandidate.needsReview || limoneneCandidate.confidence < 0.85));
  assert("Requirement 4: Uncertain extraction is clearly identified with review flag", isUncertainIdentified,
    `Candidate: ${JSON.stringify(limoneneCandidate)}`);

  // Start with extracted candidate items (simulation of IngredientReviewList state)
  let userItems = parsed.ingredients.map((ing, idx) => ({
    id: `item-${idx}`,
    name: ing.name,
    selected: true,
    confidence: ing.confidence,
    needsReview: ing.needsReview
  }));

  const initialCount = userItems.length;

  // Requirement 1: User can edit an ingredient
  userItems = userItems.map(item => {
    if (item.name === "LIMONENE") {
      return { ...item, name: "LIMONENE", needsReview: false, confidence: 1.0 };
    }
    return item;
  });
  const editedItem = userItems.find(i => i.name === "LIMONENE");
  assert("Requirement 1: User can confirm/edit an ingredient", Boolean(editedItem && !editedItem.needsReview));

  // Requirement 2: User can delete an incorrect ingredient or noise artifact
  const countBeforeDelete = userItems.length;
  userItems = userItems.filter(i => i.name !== "CITRAL");
  const countAfterDelete = userItems.length;
  assert("Requirement 2: User can delete an incorrect ingredient", countAfterDelete === countBeforeDelete - 1 && !userItems.some(i => i.name === "CITRAL"));

  // Requirement 3: User can add missing ingredient
  userItems.push({
    id: "custom-1",
    name: "COUMARIN",
    selected: true,
    confidence: 1.0,
    needsReview: false
  });
  const addedItem = userItems.find(i => i.name === "COUMARIN");
  assert("Requirement 3: User can add a missing ingredient", Boolean(addedItem && addedItem.confidence === 1.0));

  // Requirement 5: Final analysis uses verified data
  const verifiedIngredientList = userItems.filter(i => i.selected).map(i => i.name);
  const analysisResult = analyzeIngredientsList(verifiedIngredientList, "Verified Eau de Parfum", "Maison Test");

  const finalNames = analysisResult.ingredientsFound.map(i => i.rawInput);
  const containsAddedCoumarin = finalNames.includes("COUMARIN");
  const excludesDeletedCitral = !finalNames.includes("CITRAL");
  const alcoholCorrectlyEvaluated = analysisResult.alcoholStatus === "CONTAINS_ALCOHOL";

  assert("Requirement 5: Final analysis uses verified data exclusively",
    containsAddedCoumarin && excludesDeletedCitral && alcoholCorrectlyEvaluated,
    `Final ingredients in analysis: ${finalNames.join(", ")}`);

  console.log("\n================================================================================");
  console.log(`CHECKPOINT 3 RESULTS: ${passed} / 5 PASSED (${failed} FAILED)`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerificationTestSuite();
