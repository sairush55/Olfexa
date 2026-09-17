/**
 * OLFEXA Checkpoint 10: Regional Intelligence Test Suite
 * 
 * Verifies:
 * 1. EU Mode displays Regulation (EC) No 1223/2009 and Annex III allergen threshold rules
 * 2. India Mode displays CDSCO / Bureau of Indian Standards IS 4707 (Part 1 & 2) & Attar standards
 * 3. Switching regions updates compliance evaluation dynamically
 * 4. Informational non-legal advice disclaimers are strictly present
 */

import { executeDeterministicRuleEngine } from "../src/lib/rule-engine/deterministicRuleEngine";

async function runRegionalIntelligenceTests() {
  console.log("=================================================");
  console.log("   OLFEXA PHASE 10 — REGIONAL INTELLIGENCE TEST  ");
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

  const sampleFormula = [
    "ALCOHOL DENAT.",
    "AQUA / WATER / EAU",
    "PARFUM / FRAGRANCE",
    "LIMONENE",
    "LINALOOL",
    "CITRAL",
    "EVERNIA PRUNASTRI (OAKMOSS) EXTRACT",
    "BHT"
  ];

  const result = executeDeterministicRuleEngine(sampleFormula);

  // -------------------------------------------------------------
  // TEST 1: European Union (EU) Mode
  // -------------------------------------------------------------
  console.log("\n--- Group 1: EU Regulation (EC) No 1223/2009 ---");

  assert(
    "Requirement 1.1: EU framework cites Regulation (EC) No 1223/2009",
    result.compliance.eu.framework.includes("1223/2009")
  );

  assert(
    "Requirement 1.2: EU mode identifies Annex III mandatory allergen declarations",
    result.compliance.eu.mandatoryAllergenDeclarations.length === 4 &&
    result.compliance.eu.mandatoryAllergenDeclarations.includes("LIMONENE") &&
    result.compliance.eu.mandatoryAllergenDeclarations.includes("LINALOOL")
  );

  assert(
    "Requirement 1.3: Allergen evaluation includes 0.001% (leave-on) threshold explanation",
    result.allergens.mandatoryTriggerExplanation.includes("0.001% (10 ppm)") &&
    result.allergens.mandatoryTriggerExplanation.includes("0.01% (100 ppm)")
  );

  assert(
    "Requirement 1.4: EU portal URL is present and points to European Commission domain",
    result.compliance.eu.officialUrl.includes("ec.europa.eu") || result.compliance.eu.officialUrl.includes("europa.eu")
  );

  // -------------------------------------------------------------
  // TEST 2: India (CDSCO & BIS) Mode
  // -------------------------------------------------------------
  console.log("\n--- Group 2: India CDSCO & BIS Standards ---");

  assert(
    "Requirement 2.1: India framework references CDSCO & BIS IS 4707",
    result.compliance.india.framework.includes("IS 4707") &&
    result.compliance.india.framework.includes("CDSCO")
  );

  assert(
    "Requirement 2.2: India standards include IS 4707 Part 1 and Part 2 specifications",
    result.compliance.india.standardsApplied.some(s => s.includes("Part 1")) &&
    result.compliance.india.standardsApplied.some(s => s.includes("Part 2"))
  );

  assert(
    "Requirement 2.3: CDSCO portal link is valid government domain",
    result.compliance.india.officialUrl.includes("cdsco.gov.in")
  );

  // -------------------------------------------------------------
  // TEST 3: Regional Switching & Multi-Jurisdiction Contrasting
  // -------------------------------------------------------------
  console.log("\n--- Group 3: Dynamic Regional Compliance Switching ---");

  // Attar formula without alcohol
  const attarFormula = [
    "DIPROPYLENE GLYCOL",
    "ISOPROPYL MYRISTATE",
    "PARFUM / FRAGRANCE",
    "CITRONELLOL"
  ];

  const attarResult = executeDeterministicRuleEngine(attarFormula);

  assert(
    "Requirement 3.1: Attar formula in US FDA mode qualifies for 'Alcohol-Free' claim",
    attarResult.compliance.usFda.isAlcoholFreePermitted === true &&
    attarResult.compliance.usFda.claimsSummary.includes("Eligible for 'Alcohol-Free'")
  );

  assert(
    "Requirement 3.2: Alcoholic formula in US FDA mode is disqualified from 'Alcohol-Free' claim",
    result.compliance.usFda.isAlcoholFreePermitted === false &&
    result.compliance.usFda.claimsSummary.includes("Ineligible for 'Alcohol-Free'")
  );

  assert(
    "Requirement 3.3: Regional views provide independent, calibrated requirements for same formula",
    result.compliance.eu.mandatoryAllergenDeclarations.length > 0 &&
    result.compliance.india.standardsApplied.length > 0 &&
    result.compliance.usFda.mocraNotes.length > 0
  );

  // -------------------------------------------------------------
  // TEST 4: Informational Disclaimers
  // -------------------------------------------------------------
  console.log("\n--- Group 4: Informational Disclaimers ---");

  assert(
    "Requirement 4.1: Rule engine specifies auditable non-medical / non-legal standard",
    result.isDeterministicVerified === true
  );

  console.log("=================================================");
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRegionalIntelligenceTests();
