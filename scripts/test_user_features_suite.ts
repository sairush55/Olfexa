/**
 * OLFEXA Checkpoint 9: User Features Test Suite
 * 
 * Verifies:
 * 1. Saved scan retrieval (persistent scan report retrieval with complete schema)
 * 2. Ingredient Watchlist flagging in analysis engine (strict trigger, correct status)
 * 3. Ingredient Explorer search (exact INCI, common name, CAS lookup against canonical records)
 * 4. Product Comparison accurate diffing (shared constituents, unique elements, alcohol diff)
 */

import { analyzeIngredientsList } from "../src/lib/analysisEngine";
import { MOCK_SCANS_LOOKUP, SAMPLE_SCAN_TRADITIONAL } from "../src/data/mockScans";
import { CANONICAL_INGREDIENTS_DATABASE } from "../src/data/canonicalIngredientsDatabase";
import { WatchlistItem } from "../src/types";

async function runUserFeaturesTests() {
  console.log("=================================================");
  console.log("   OLFEXA PHASE 9 — USER FEATURES TEST SUITE     ");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${name}`);
      if (details) console.error(`    Details: ${details}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Saved Scan Retrieval
  // -------------------------------------------------------------
  console.log("\n--- Group 1: Saved Scan Retrieval ---");

  const scanId = "demo";
  const retrievedScan = MOCK_SCANS_LOOKUP[scanId];

  assert(
    "Requirement 1.1: Saved scan is retrievable by ID ('demo')",
    Boolean(retrievedScan && retrievedScan.id)
  );

  assert(
    "Requirement 1.2: Retrieved scan preserves complete verified schema",
    Boolean(
      retrievedScan?.perfumeName &&
      retrievedScan?.ingredientsFound.length > 0 &&
      retrievedScan?.alcoholStatus &&
      retrievedScan?.suitabilityProfile &&
      Object.keys(retrievedScan.suitabilityProfile.groups).length === 6
    )
  );

  // -------------------------------------------------------------
  // TEST 2: Watchlist Flagging During Analysis
  // -------------------------------------------------------------
  console.log("\n--- Group 2: Watchlist Sensitivity Triggering ---");

  const customWatchlist: WatchlistItem[] = [
    {
      id: "w-test-1",
      ingredientName: "COUMARIN",
      reason: "User contact sensitivity patch reaction",
      sensitivityLevel: "strict",
      addedAt: "2026-09-17"
    },
    {
      id: "w-test-2",
      ingredientName: "PURIFIED WATER", // Testing common name trigger for Aqua
      reason: "Formula baseline check",
      sensitivityLevel: "mild",
      addedAt: "2026-09-17"
    }
  ];

  const testFormula = [
    "ALCOHOL DENAT.",
    "AQUA / WATER / EAU",
    "PARFUM / FRAGRANCE",
    "LIMONENE",
    "COUMARIN"
  ];

  const analysisWithWatchlist = analyzeIngredientsList(
    testFormula,
    "Watchlist Test EDP",
    "Maison Test",
    customWatchlist
  );

  const coumarinMatch = analysisWithWatchlist.ingredientsFound.find(
    i => i.matchedInci === "COUMARIN"
  );
  const aquaMatch = analysisWithWatchlist.ingredientsFound.find(
    i => i.matchedInci === "AQUA / WATER / EAU"
  );

  assert(
    "Requirement 2.1: Watchlist item (COUMARIN) is flagged as isWatchlistMatch = true",
    coumarinMatch?.isWatchlistMatch === true
  );

  assert(
    "Requirement 2.2: Watchlist match assigns status 'WATCHLIST_MATCH'",
    coumarinMatch?.status === "WATCHLIST_MATCH"
  );

  assert(
    "Requirement 2.3: Common name in watchlist (PURIFIED WATER) triggers on canonical INCI",
    aquaMatch?.isWatchlistMatch === true
  );

  assert(
    "Requirement 2.4: Watchlist matches array aggregated in AnalysisResult",
    analysisWithWatchlist.watchlistMatches.length === 2
  );

  // -------------------------------------------------------------
  // TEST 3: Ingredient Explorer Canonical Search
  // -------------------------------------------------------------
  console.log("\n--- Group 3: Ingredient Explorer Search ---");

  // Search by exact INCI
  const inciSearchQuery = "LIMONENE";
  const inciResult = CANONICAL_INGREDIENTS_DATABASE.find(
    i => i.inciName.toLowerCase().includes(inciSearchQuery.toLowerCase())
  );
  assert(
    "Requirement 3.1: Explorer search by INCI returns valid canonical record",
    Boolean(inciResult && inciResult.inciName === "LIMONENE" && inciResult.evidence.length > 0)
  );

  // Search by CAS Number
  const casSearchQuery = "5989-27-5";
  const casResult = CANONICAL_INGREDIENTS_DATABASE.find(
    i => i.casNumber === casSearchQuery
  );
  assert(
    "Requirement 3.2: Explorer search by CAS number (5989-27-5) resolves to LIMONENE",
    Boolean(casResult && casResult.inciName === "LIMONENE")
  );

  // Search by Synonym / Common Name
  const synonymQuery = "Denatured Ethyl Alcohol";
  const synResult = CANONICAL_INGREDIENTS_DATABASE.find(
    i => i.commonNames.some(cn => cn.toLowerCase() === synonymQuery.toLowerCase())
  );
  assert(
    "Requirement 3.3: Explorer search by common name resolves to ALCOHOL DENAT.",
    Boolean(synResult && synResult.inciName === "ALCOHOL DENAT.")
  );

  // -------------------------------------------------------------
  // TEST 4: Product Comparison Accuracy
  // -------------------------------------------------------------
  console.log("\n--- Group 4: Product Comparison Diffing ---");

  const fragA = SAMPLE_SCAN_TRADITIONAL; // Alcohol-based: ALCOHOL DENAT., AQUA, PARFUM, LIMONENE, LINALOOL, COUMARIN, BHT, ...
  const fragB = analyzeIngredientsList(
    [
      "DIPROPYLENE GLYCOL",
      "ISOPROPYL MYRISTATE",
      "PARFUM / FRAGRANCE",
      "LIMONENE"
    ],
    "Sultan Royal Attar",
    "Al-Araby Parfums"
  ); // Alcohol-free attar oil base

  const setA = new Set(fragA.ingredientsFound.map(i => i.matchedInci || i.rawInput));
  const setB = new Set(fragB.ingredientsFound.map(i => i.matchedInci || i.rawInput));

  const allConstituents = Array.from(new Set([...setA, ...setB]));
  const shared = allConstituents.filter(item => setA.has(item) && setB.has(item));
  const uniqueToA = allConstituents.filter(item => setA.has(item) && !setB.has(item));
  const uniqueToB = allConstituents.filter(item => !setA.has(item) && setB.has(item));

  assert(
    "Requirement 4.1: Comparison identifies shared ingredients accurately (PARFUM, LIMONENE)",
    shared.includes("PARFUM / FRAGRANCE") && shared.includes("LIMONENE")
  );

  assert(
    "Requirement 4.2: Comparison accurately isolates unique alcohol carrier in Fragrance A",
    uniqueToA.includes("ALCOHOL DENAT.") && !uniqueToB.includes("ALCOHOL DENAT.")
  );

  assert(
    "Requirement 4.3: Comparison accurately isolates unique ester carrier in Fragrance B",
    uniqueToB.includes("ISOPROPYL MYRISTATE") && !uniqueToA.includes("ISOPROPYL MYRISTATE")
  );

  assert(
    "Requirement 4.4: Comparison accurately contrasts alcohol status",
    fragA.alcoholStatus === "CONTAINS_ALCOHOL" &&
    fragB.alcoholStatus === "NO_RECOGNIZED_ALCOHOL_DETECTED"
  );

  console.log("=================================================");
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runUserFeaturesTests();
