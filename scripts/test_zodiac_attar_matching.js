/**
 * Automated Verification Script for Zodiac Attar Matching Dataset & Deterministic Engine
 * Run with: npx tsx scripts/test_zodiac_attar_matching.js
 */

import { matchZodiacAttar, zodiacRecommendations, CANONICAL_FAMILIES } from "../src/lib/zodiacAttarData";

async function runTests() {
  console.log("================================================================================");
  console.log("             OLFEXA ZODIAC ATTAR MATCHING ENGINE TEST SUITE                     ");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assertMatch(testNum, sign, userChoice, expectedAttar, expectedFallback = false) {
    const res = matchZodiacAttar(sign, userChoice);
    const actualAttar = res.recommendation.name;
    const isOk = actualAttar === expectedAttar && res.isFallback === expectedFallback;

    if (isOk) {
      console.log(`✓ [PASS] #${testNum}: ${sign} + [${userChoice || "None"}] => "${actualAttar}" (Score: ${res.score})`);
      passed++;
    } else {
      console.error(`✗ [FAIL] #${testNum}: ${sign} + [${userChoice || "None"}]`);
      console.error(`       Expected: "${expectedAttar}" (Fallback: ${expectedFallback})`);
      console.error(`       Actual:   "${actualAttar}" (Fallback: ${res.isFallback})`);
      failed++;
    }
  }

  console.log("--- TEST GROUP 1: SECTION 6 EXACT SPECIFICATION MATRIX (23 CASES) ---");
  const SPEC_TEST_CASES = [
    { sign: "aries", choice: null, expected: "Saffron Oud Attar" },
    { sign: "aries", choice: "spicy", expected: "Spicy Woody Attar" },
    { sign: "taurus", choice: null, expected: "Sandalwood Attar" },
    { sign: "taurus", choice: "earthy", expected: "Mitti Attar" },
    { sign: "gemini", choice: null, expected: "Citrus Fresh Attar" },
    { sign: "gemini", choice: "green", expected: "Green Fresh Attar" },
    { sign: "cancer", choice: null, expected: "White Musk Attar" },
    { sign: "cancer", choice: "floral", expected: "Soft Floral Attar" },
    { sign: "leo", choice: null, expected: "Oud Attar" },
    { sign: "leo", choice: "amber", expected: "Amber Attar" },
    { sign: "virgo", choice: null, expected: "Vetiver Attar" },
    { sign: "virgo", choice: "green", expected: "Green Herbal Attar" },
    { sign: "libra", choice: null, expected: "Jasmine Attar" },
    { sign: "libra", choice: "musk", expected: "Soft Musk Attar" },
    { sign: "scorpio", choice: null, expected: "Oud Musk Attar" },
    { sign: "scorpio", choice: "amber", expected: "Amber Musk Attar" },
    { sign: "sagittarius", choice: null, expected: "Citrus Aromatic Attar" },
    { sign: "sagittarius", choice: "spicy", expected: "Spicy Fresh Attar" },
    { sign: "capricorn", choice: null, expected: "Classic Oud Attar" },
    { sign: "capricorn", choice: "amber", expected: "Woody Amber Attar" },
    { sign: "aquarius", choice: null, expected: "Fresh Citrus Attar" },
    { sign: "aquarius", choice: "green", expected: "Green Aromatic Attar" },
    { sign: "pisces", choice: null, expected: "Soft Floral Attar" },
    { sign: "pisces", choice: "musk", expected: "Musk Floral Attar" },
  ];

  SPEC_TEST_CASES.forEach((tc, idx) => {
    assertMatch(idx + 1, tc.sign, tc.choice, tc.expected, false);
  });

  console.log("\n--- TEST GROUP 2: SECTION 4 CASE 4 UNSUPPORTED FAMILY & FALLBACK ---");
  // Leo + aquatic (unsupported) -> should fallback to Oud Attar with fallback message
  {
    const res = matchZodiacAttar("leo", "aquatic");
    const ok = res.recommendation.name === "Oud Attar" &&
               res.isFallback === true &&
               res.fallbackMessage?.includes("zodiac-inspired recommendation instead") &&
               res.score === 0;
    if (ok) {
      console.log(`✓ [PASS] Unsupported Family: Leo + aquatic => "Oud Attar" with Fallback Message`);
      passed++;
    } else {
      console.error(`✗ [FAIL] Unsupported Family: Leo + aquatic`);
      console.error(`       Result:`, res);
      failed++;
    }
  }

  console.log("\n--- TEST GROUP 3: DETERMINISM REPEATABILITY CHECK ---");
  // Ensure same sign + same family always yields identical output (no randomness, no AI)
  {
    let identical = true;
    const first = matchZodiacAttar("aries", "spicy");
    for (let i = 0; i < 50; i++) {
      const repeated = matchZodiacAttar("aries", "spicy");
      if (repeated.recommendation.name !== first.recommendation.name || repeated.score !== first.score) {
        identical = false;
        break;
      }
    }
    if (identical) {
      console.log("✓ [PASS] 50 Repetitions returned 100% deterministic identical results");
      passed++;
    } else {
      console.error("✗ [FAIL] Non-deterministic variation detected!");
      failed++;
    }
  }

  console.log("\n--- TEST GROUP 4: STRICT SEPARATION & DISCLAIMER CHECK ---");
  {
    const res = matchZodiacAttar("virgo", null);
    const hasDisclaimer = res.disclaimer.includes("entertainment and fragrance discovery only") &&
                          res.disclaimer.includes("do not determine safety");
    const isAttarOnly = res.recommendation.name.toLowerCase().includes("attar");
    const noPerfumeMention = !res.recommendation.name.toLowerCase().includes("eau de parfum");

    if (hasDisclaimer && isAttarOnly && noPerfumeMention) {
      console.log("✓ [PASS] Mandatory disclaimer present and strictly Attar recommendation");
      passed++;
    } else {
      console.error("✗ [FAIL] Disclaimer or format violation!");
      failed++;
    }
  }

  console.log("\n================================================================================");
  console.log(`TOTAL RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
