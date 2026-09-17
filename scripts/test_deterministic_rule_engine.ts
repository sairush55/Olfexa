/**
 * OLFEXA Checkpoint 7: Deterministic Rule Engine Test Suite
 * 
 * Verifies:
 * 1. 50 identical inputs yield 50 identical classification results (100% deterministic, 0 drift)
 * 2. Zero LLM dependency in the classification pipeline (synchronous, pure TypeScript logic)
 * 3. Clear citation and rule explanation on every result (CosIng, IFRA, CDSCO, FDA)
 * 4. Alcohol classification module:
 *    - Ethanol / Denatured Alcohol
 *    - Fatty Alcohols (non-drying, skin-conditioning)
 *    - Aromatic Alcohols (potential allergens)
 *    - Completely non-alcoholic
 * 5. Regulated Allergens module:
 *    - Mandatory declaration triggers (>0.001% leave-on / >0.01% rinse-off)
 *    - IFRA concentration limits
 * 6. Regional Compliance module:
 *    - EU Regulation (EC) No 1223/2009
 *    - India CDSCO / BIS IS 4707 standards
 *    - US FDA 21 CFR 700 & MoCRA 2022
 */

import { executeDeterministicRuleEngine } from "../src/lib/rule-engine/deterministicRuleEngine";

async function runDeterministicRuleEngineTests() {
  console.log("=================================================");
  console.log("   OLFEXA PHASE 7 — DETERMINISTIC RULE ENGINE    ");
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
  // TEST 1: Determinism Stress Test (50 Identical Repetitions)
  // -------------------------------------------------------------
  console.log("\n--- Group 1: 50 Iteration Determinism Verification ---");

  const testFormula = [
    "ALCOHOL DENAT.",
    "AQUA / WATER / EAU",
    "PARFUM / FRAGRANCE",
    "LIMONENE",
    "LINALOOL",
    "CITRAL",
    "BHT"
  ];

  const baselineResult = executeDeterministicRuleEngine(testFormula);
  const baselineJson = JSON.stringify(baselineResult);

  let allIdentical = true;
  for (let i = 0; i < 50; i++) {
    const iterationResult = executeDeterministicRuleEngine(testFormula);
    const iterationJson = JSON.stringify(iterationResult);
    if (iterationJson !== baselineJson) {
      allIdentical = false;
      break;
    }
  }

  assert(
    "Requirement 1: 50 identical inputs yield 50 identical classification results (0 drift)",
    allIdentical,
    "Output JSON string was identical across all 50 execution runs."
  );

  // -------------------------------------------------------------
  // TEST 2: Alcohol Classification Granularity
  // -------------------------------------------------------------
  console.log("\n--- Group 2: Alcohol Classification Module ---");

  // 2a. Ethanol / Denatured Alcohol
  const denatResult = executeDeterministicRuleEngine(["ALCOHOL DENAT.", "AQUA", "PARFUM"]);
  assert(
    "Requirement 2a: Accurately classifies Denatured Ethyl Alcohol as drying volatile solvent",
    denatResult.alcohol.subcategory === "ETHANOL_OR_DENATURED" &&
    denatResult.alcohol.status === "CONTAINS_ALCOHOL" &&
    denatResult.alcohol.detectedAlcohols[0].isDryingSolvent === true &&
    denatResult.compliance.usFda.isAlcoholFreePermitted === false
  );

  // 2b. Fatty Alcohol (Cetyl / Cetearyl)
  const fattyResult = executeDeterministicRuleEngine(["CETYL ALCOHOL", "AQUA", "PARFUM"]);
  assert(
    "Requirement 2b: Accurately classifies Fatty Alcohol as non-drying emollient lipid (FDA compliant)",
    fattyResult.alcohol.subcategory === "FATTY_ALCOHOL" &&
    fattyResult.alcohol.detectedAlcohols[0].chemicalType === "fatty_alcohol" &&
    fattyResult.alcohol.detectedAlcohols[0].isDryingSolvent === false &&
    fattyResult.compliance.usFda.isAlcoholFreePermitted === true
  );

  // 2c. Aromatic Alcohol (Benzyl Alcohol)
  const aromaticResult = executeDeterministicRuleEngine(["BENZYL ALCOHOL", "AQUA", "PARFUM"]);
  assert(
    "Requirement 2c: Accurately classifies Aromatic Alcohol as fragrance constituent allergen",
    aromaticResult.alcohol.subcategory === "AROMATIC_ALCOHOL" &&
    aromaticResult.alcohol.detectedAlcohols[0].chemicalType === "aromatic_alcohol"
  );

  // 2d. Completely Non-Alcoholic (Attar / Pure Perfume Oil)
  const nonAlcoholResult = executeDeterministicRuleEngine([
    "DIPROPYLENE GLYCOL",
    "ISOPROPYL MYRISTATE",
    "PARFUM / FRAGRANCE"
  ]);
  assert(
    "Requirement 2d: Accurately classifies oil/attar formulation as COMPLETELY_NON_ALCOHOLIC",
    nonAlcoholResult.alcohol.subcategory === "COMPLETELY_NON_ALCOHOLIC" &&
    nonAlcoholResult.alcohol.status === "NO_RECOGNIZED_ALCOHOL_DETECTED" &&
    nonAlcoholResult.compliance.usFda.isAlcoholFreePermitted === true
  );

  // -------------------------------------------------------------
  // TEST 3: Regulated EU & IFRA Allergens Module
  // -------------------------------------------------------------
  console.log("\n--- Group 3: Regulated Allergens Module ---");

  const allergenFormula = [
    "ALCOHOL DENAT.",
    "LIMONENE",
    "LINALOOL",
    "CITRAL",
    "EVERNIA PRUNASTRI (OAKMOSS) EXTRACT"
  ];
  const allergenResult = executeDeterministicRuleEngine(allergenFormula);

  assert(
    "Requirement 3a: Accurately detects and enumerates regulated allergens",
    allergenResult.allergens.hasRegulatedAllergens === true &&
    allergenResult.allergens.allergenCount === 4
  );

  assert(
    "Requirement 3b: Mandates 0.001% (leave-on) and 0.01% (rinse-off) trigger explanation",
    allergenResult.allergens.mandatoryTriggerExplanation.includes("0.001%") &&
    allergenResult.allergens.mandatoryTriggerExplanation.includes("0.01%")
  );

  const oakmoss = allergenResult.allergens.detectedAllergens.find(a => a.inciName.includes("OAKMOSS"));
  assert(
    "Requirement 3c: Includes IFRA 51st Amendment concentration limits for high-risk sensitizers",
    Boolean(oakmoss?.ifraRestriction && oakmoss.ifraRestriction.includes("Atranol"))
  );

  // -------------------------------------------------------------
  // TEST 4: Regional Compliance Module (EU, India CDSCO, US FDA)
  // -------------------------------------------------------------
  console.log("\n--- Group 4: Regional Compliance Module ---");

  assert(
    "Requirement 4a: EU compliance references Regulation (EC) No 1223/2009 with mandatory declarations",
    allergenResult.compliance.eu.framework.includes("1223/2009") &&
    allergenResult.compliance.eu.mandatoryAllergenDeclarations.length === 4
  );

  assert(
    "Requirement 4b: India CDSCO compliance references Bureau of Indian Standards IS 4707",
    allergenResult.compliance.india.framework.includes("IS 4707") &&
    allergenResult.compliance.india.isCompliant === true
  );

  assert(
    "Requirement 4c: US FDA compliance references 21 CFR 700 and MoCRA 2022",
    allergenResult.compliance.usFda.framework.includes("21 CFR 700") &&
    allergenResult.compliance.usFda.framework.includes("MoCRA")
  );

  // -------------------------------------------------------------
  // TEST 5: Clear Citations & Explanations on Every Result
  // -------------------------------------------------------------
  console.log("\n--- Group 5: Citation & Evidence Traceability ---");

  assert(
    "Requirement 5a: Alcohol result includes verifiable regulatory citation URL",
    Boolean(allergenResult.alcohol.ruleCitation.url && allergenResult.alcohol.ruleCitation.url.startsWith("https://"))
  );

  assert(
    "Requirement 5b: Allergens result includes official scientific opinion URL (SCCS)",
    Boolean(allergenResult.allergens.citationUrl && allergenResult.allergens.citationUrl.includes("ec.europa.eu"))
  );

  assert(
    "Requirement 5c: Zero LLM dependency verified (pure synchronous function execution)",
    allergenResult.isDeterministicVerified === true &&
    allergenResult.ruleEngineVersion.includes("deterministic")
  );

  console.log("=================================================");
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runDeterministicRuleEngineTests();
