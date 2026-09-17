/**
 * OLFEXA Checkpoint 5: Multi-Stage Controlled Ingredient Matching Engine Test Suite
 * 
 * Verifies:
 * 1. Exact ingredient match (Score 1.0, KNOWN_EXACT, no verification required)
 * 2. Case insensitivity (uppercase, lowercase, mixed case)
 * 3. Alternative name, common name, and synonym matching (Score 0.95, KNOWN_SYNONYM)
 * 4. CAS number matching (Score 1.0, KNOWN_EXACT)
 * 5. Minor OCR error detection with strict verification requirement (Score 0.75-0.85, UNCERTAIN_VERIFICATION, needsUserVerification=true)
 * 6. Critical chemical distinction safeguards:
 *    - Short acronym safeguard (BHA must NOT match BHT)
 *    - Aroma molecule safeguard (CITRAL must NOT match CITRONELLOL)
 * 7. Completely unknown ingredient handling (transparent, no hallucinated records, classification=UNKNOWN)
 * 8. Trailing punctuation and OCR token cleaning
 */

import { matchIngredientToken } from "../src/lib/matching-engine/matchingEngine";

interface TestCase {
  name: string;
  input: string;
  assert: (result: ReturnType<typeof matchIngredientToken>) => boolean;
  expectedDescription: string;
}

const TEST_CASES: TestCase[] = [
  // 1. Exact INCI Match
  {
    name: "Exact INCI match - LIMONENE",
    input: "LIMONENE",
    assert: (res) =>
      res.classification === "KNOWN_EXACT" &&
      res.confidenceScore === 1.0 &&
      res.isKnown === true &&
      res.needsUserVerification === false &&
      res.matchedCanonical?.inciName === "LIMONENE" &&
      res.matchStage === "EXACT_INCI",
    expectedDescription: "Matches LIMONENE with 1.0 confidence and EXACT_INCI stage"
  },
  {
    name: "Exact INCI match with period - ALCOHOL DENAT.",
    input: "ALCOHOL DENAT.",
    assert: (res) =>
      res.classification === "KNOWN_EXACT" &&
      res.confidenceScore === 1.0 &&
      res.matchedCanonical?.inciName === "ALCOHOL DENAT.",
    expectedDescription: "Matches ALCOHOL DENAT. exact INCI"
  },

  // 2. Case Insensitivity
  {
    name: "Lowercase match - linalool",
    input: "linalool",
    assert: (res) =>
      res.classification === "KNOWN_EXACT" &&
      res.confidenceScore === 1.0 &&
      res.matchedCanonical?.inciName === "LINALOOL",
    expectedDescription: "Case-insensitive match for lowercase 'linalool'"
  },
  {
    name: "Mixed case match - CoUmArIn",
    input: "CoUmArIn",
    assert: (res) =>
      res.classification === "KNOWN_EXACT" &&
      res.confidenceScore === 1.0 &&
      res.matchedCanonical?.inciName === "COUMARIN",
    expectedDescription: "Case-insensitive match for mixed case 'CoUmArIn'"
  },

  // 3. Alternative Name & Common Name & Synonyms
  {
    name: "Common name match - Purified Water -> AQUA / WATER / EAU",
    input: "Purified Water",
    assert: (res) =>
      res.classification === "KNOWN_SYNONYM" &&
      res.confidenceScore === 0.95 &&
      res.isKnown === true &&
      res.needsUserVerification === false &&
      res.matchedCanonical?.inciName === "AQUA / WATER / EAU" &&
      res.matchStage === "SYNONYM_OR_COMMON_NAME",
    expectedDescription: "Resolves 'Purified Water' to canonical AQUA / WATER / EAU via common name"
  },
  {
    name: "Synonym match - Butylated Hydroxytoluene -> BHT",
    input: "Butylated Hydroxytoluene",
    assert: (res) =>
      res.classification === "KNOWN_SYNONYM" &&
      res.confidenceScore === 0.95 &&
      res.matchedCanonical?.inciName === "BHT",
    expectedDescription: "Resolves chemical synonym to BHT"
  },
  {
    name: "Synonym match - Citrus terpene -> LIMONENE",
    input: "Citrus terpene",
    assert: (res) =>
      res.classification === "KNOWN_SYNONYM" &&
      res.confidenceScore === 0.95 &&
      res.matchedCanonical?.inciName === "LIMONENE",
    expectedDescription: "Resolves 'Citrus terpene' to canonical LIMONENE"
  },

  // 4. CAS Registry Number Match
  {
    name: "CAS Number match - 5989-27-5 -> LIMONENE",
    input: "5989-27-5",
    assert: (res) =>
      res.classification === "KNOWN_EXACT" &&
      res.confidenceScore === 1.0 &&
      res.matchedCanonical?.inciName === "LIMONENE" &&
      res.matchStage === "CAS_NUMBER",
    expectedDescription: "Resolves CAS '5989-27-5' directly to canonical LIMONENE"
  },

  // 5. Minor OCR Error with Mandatory Verification Gate
  {
    name: "Minor OCR typo - Limonen (1 char missing) -> UNCERTAIN_VERIFICATION",
    input: "Limonen",
    assert: (res) =>
      res.classification === "UNCERTAIN_VERIFICATION" &&
      res.needsUserVerification === true &&
      res.matchedCanonical?.inciName === "LIMONENE" &&
      res.matchStage === "CONTROLLED_FUZZY" &&
      res.confidenceScore >= 0.75 &&
      res.confidenceScore < 1.0,
    expectedDescription: "Flags typo 'Limonen' as UNCERTAIN_VERIFICATION requiring user confirmation"
  },
  {
    name: "Minor OCR substitution - Linalol (1 char missing) -> UNCERTAIN_VERIFICATION",
    input: "Linalol",
    assert: (res) =>
      res.classification === "UNCERTAIN_VERIFICATION" &&
      res.needsUserVerification === true &&
      res.matchedCanonical?.inciName === "LINALOOL",
    expectedDescription: "Flags 'Linalol' as UNCERTAIN_VERIFICATION for LINALOOL"
  },

  // 6. Safeguards against false-positive matching
  {
    name: "Short acronym safeguard - BHA must NOT match BHT",
    input: "BHA",
    assert: (res) => {
      const matchedName = res.matchedCanonical?.inciName;
      return matchedName !== "BHT";
    },
    expectedDescription: "Ensures short acronym 'BHA' is NOT falsely matched to 'BHT'"
  },
  {
    name: "Distinct aroma molecule safeguard - CITRAL matches CITRAL exactly",
    input: "CITRAL",
    assert: (res) =>
      res.classification === "KNOWN_EXACT" &&
      res.matchedCanonical?.inciName === "CITRAL",
    expectedDescription: "Ensures 'CITRAL' is matched strictly to CITRAL"
  },
  {
    name: "Distinct aroma molecule safeguard - CITRONELLOL matches CITRONELLOL exactly",
    input: "CITRONELLOL",
    assert: (res) =>
      res.classification === "KNOWN_EXACT" &&
      res.matchedCanonical?.inciName === "CITRONELLOL",
    expectedDescription: "Ensures 'CITRONELLOL' is matched strictly to CITRONELLOL"
  },

  // 7. Completely Unknown Ingredient
  {
    name: "Completely unknown chemical entity",
    input: "SYNTHETIC_POLYMER_XYZ_999",
    assert: (res) =>
      res.classification === "UNKNOWN" &&
      res.isKnown === false &&
      res.needsUserVerification === true &&
      res.matchedCanonical === undefined &&
      res.confidenceScore <= 0.30 &&
      res.matchStage === "UNMATCHED",
    expectedDescription: "Transparently preserves unknown entity without hallucinating record"
  },

  // 8. OCR Token Cleaning
  {
    name: "Punctuation cleaning - trailing periods, commas, bullets",
    input: " • LIMONENE, ",
    assert: (res) =>
      res.classification === "KNOWN_EXACT" &&
      res.cleanedInput === "LIMONENE" &&
      res.matchedCanonical?.inciName === "LIMONENE",
    expectedDescription: "Cleans bullets and trailing commas before matching"
  }
];

async function runMatchingEngineTests() {
  console.log("=================================================");
  console.log("   OLFEXA PHASE 5 — MATCHING ENGINE TEST SUITE    ");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  for (const tc of TEST_CASES) {
    try {
      const result = matchIngredientToken(tc.input);
      const isSuccess = tc.assert(result);

      if (isSuccess) {
        console.log(`  ✓ [PASS] ${tc.name}`);
        passed++;
      } else {
        console.error(`  ✗ [FAIL] ${tc.name}`);
        console.error(`    Expected: ${tc.expectedDescription}`);
        console.error(`    Actual Result:`, JSON.stringify(result, null, 2));
        failed++;
      }
    } catch (err) {
      console.error(`  ✗ [EXCEPTION] ${tc.name}:`, err);
      failed++;
    }
  }

  console.log("=================================================");
  console.log(`Total: ${TEST_CASES.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runMatchingEngineTests();
