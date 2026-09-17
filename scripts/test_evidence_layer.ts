/**
 * OLFEXA Checkpoint 6: Evidence & Traceability Layer Test Suite
 * 
 * Verifies:
 * 1. Evidence exists for known ingredients with full provenance chain:
 *    - Source organization (CosIng, IFRA, EU SCCS, FDA, CDSCO)
 *    - Source dataset / regulation (e.g. Regulation (EC) No 1223/2009, IFRA 51st Amendment)
 *    - Source document / URL (valid official URL)
 *    - Region applicability (EU, GLOBAL, IN, US)
 *    - Publication / effective date (valid year or date string)
 * 2. Citations are present and structured in AnalysisResult returned by analysis engine
 * 3. Missing evidence is explicitly identified with INSUFFICIENT_EVIDENCE:
 *    - Mark as "INSUFFICIENT_EVIDENCE"
 *    - Never invent evidence or citations
 *    - Never hide lack of evidence
 * 4. No fabricated citations exist:
 *    - Unknown ingredients have NO fake citation URLs
 *    - All citation URLs link to authoritative regulatory/scientific domains
 */

import { analyzeIngredientsList } from "../src/lib/analysisEngine";
import { CANONICAL_INGREDIENTS_DATABASE } from "../src/data/canonicalIngredientsDatabase";

const AUTHORITATIVE_DOMAINS = [
  "ec.europa.eu",
  "europa.eu",
  "ifrafragrance.org",
  "fda.gov",
  "cdsco.gov.in",
  "openbeautyfacts.org"
];

async function runEvidenceLayerTests() {
  console.log("=================================================");
  console.log("   OLFEXA PHASE 6 — EVIDENCE & TRACEABILITY TEST ");
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
  // TEST 1: Evidence exists for all canonical database ingredients
  // -------------------------------------------------------------
  console.log("\n--- Group 1: Canonical Database Provenance Verification ---");
  
  let allCanonicalHaveEvidence = true;
  let allCanonicalHaveValidFields = true;

  for (const ing of CANONICAL_INGREDIENTS_DATABASE) {
    if (!ing.evidence || ing.evidence.length === 0) {
      allCanonicalHaveEvidence = false;
      console.error(`Missing evidence for canonical ingredient: ${ing.inciName}`);
    }

    for (const ev of ing.evidence || []) {
      const hasOrg = Boolean(ev.organization);
      const hasTitle = Boolean(ev.title && ev.title.trim().length > 5);
      const hasFindings = Boolean(ev.keyFindings && ev.keyFindings.trim().length > 10);
      const hasRegion = Boolean(ev.region);
      const hasDate = Boolean(ev.publicationYear || ev.effectiveDate);

      if (!hasOrg || !hasTitle || !hasFindings || !hasRegion || !hasDate) {
        allCanonicalHaveValidFields = false;
        console.error(`Incomplete evidence metadata in ${ing.inciName}:`, ev);
      }
    }
  }

  assert(
    "Requirement 1.1: Every canonical ingredient has indexed evidence",
    allCanonicalHaveEvidence && CANONICAL_INGREDIENTS_DATABASE.length > 0,
    `Verified across ${CANONICAL_INGREDIENTS_DATABASE.length} canonical records.`
  );

  assert(
    "Requirement 1.2: Evidence records contain organization, title, findings, region, and date",
    allCanonicalHaveValidFields
  );

  // -------------------------------------------------------------
  // TEST 2: Analysis Engine Output & Visible Citations
  // -------------------------------------------------------------
  console.log("\n--- Group 2: Analysis Engine Response Verification ---");

  const sampleIngredients = [
    "ALCOHOL DENAT.",
    "AQUA / WATER / EAU",
    "PARFUM / FRAGRANCE",
    "LIMONENE",
    "LINALOOL",
    "COUMARIN",
    "BHT"
  ];

  const analysisResult = analyzeIngredientsList(sampleIngredients, "Eau de Test", "Maison Test");

  assert(
    "Requirement 2.1: Analysis produces analyzed ingredients for all inputs",
    analysisResult.ingredientsFound.length === sampleIngredients.length
  );

  const limonene = analysisResult.ingredientsFound.find(i => i.matchedInci === "LIMONENE");
  assert(
    "Requirement 2.2: Known ingredient (LIMONENE) has VERIFIED evidenceStatus",
    limonene?.evidenceStatus === "VERIFIED" && (limonene?.evidence.length ?? 0) >= 1
  );

  assert(
    "Requirement 2.3: Known ingredient citation URL points to verified domain",
    Boolean(limonene?.evidence.some(e => 
      e.citationUrl && AUTHORITATIVE_DOMAINS.some(d => e.citationUrl?.includes(d))
    )),
    `Citations for Limonene: ${limonene?.evidence.map(e => e.citationUrl).join(", ")}`
  );

  assert(
    "Requirement 2.4: Allergen claim references specific regulation and threshold in evidence",
    Boolean(limonene?.evidence.some(e => 
      e.datasetOrRegulation?.includes("1223/2009") && 
      e.keyFindings.includes("labeling")
    ))
  );

  // -------------------------------------------------------------
  // TEST 3: Fallback When Evidence is Missing (INSUFFICIENT_EVIDENCE)
  // -------------------------------------------------------------
  console.log("\n--- Group 3: Missing Evidence Fallback (Strict Non-Fabrication) ---");

  const unknownInputs = [
    "XYZ_SYNTHETIC_SOLVENT_99",
    "UNREGISTERED_BOTANICAL_TINCTURE"
  ];

  const unknownAnalysis = analyzeIngredientsList(unknownInputs, "Unknown Fragrance");

  const unknownItem1 = unknownAnalysis.ingredientsFound[0];
  const unknownItem2 = unknownAnalysis.ingredientsFound[1];

  assert(
    "Requirement 3.1: Unknown ingredient marked with evidenceStatus 'INSUFFICIENT_EVIDENCE'",
    unknownItem1.evidenceStatus === "INSUFFICIENT_EVIDENCE" &&
    unknownItem2.evidenceStatus === "INSUFFICIENT_EVIDENCE"
  );

  assert(
    "Requirement 3.2: Unknown ingredient contains explicit evidence record explaining missing data",
    unknownItem1.evidence.length === 1 &&
    unknownItem1.evidence[0].evidenceStatus === "INSUFFICIENT_EVIDENCE" &&
    unknownItem1.evidence[0].keyFindings.includes("no verified toxicological or regulatory monograph")
  );

  assert(
    "Requirement 3.3: Unknown ingredient DOES NOT fabricate a citation URL",
    unknownItem1.evidence[0].citationUrl === undefined &&
    unknownItem2.evidence[0].citationUrl === undefined,
    `Found citationUrl: ${unknownItem1.evidence[0].citationUrl}`
  );

  assert(
    "Requirement 3.4: Unknown ingredient does NOT fabricate allergen or irritant status",
    unknownItem1.isEuAllergen === false &&
    unknownItem1.isPotentialIrritant === false
  );

  // -------------------------------------------------------------
  // TEST 4: Integrity check on all citation URLs across entire codebase
  // -------------------------------------------------------------
  console.log("\n--- Group 4: Global Citation Integrity Check ---");

  let nonAuthoritativeCitations: string[] = [];

  for (const ing of CANONICAL_INGREDIENTS_DATABASE) {
    for (const ev of ing.evidence) {
      if (ev.citationUrl) {
        const isAuth = AUTHORITATIVE_DOMAINS.some(domain => ev.citationUrl?.includes(domain));
        if (!isAuth) {
          nonAuthoritativeCitations.push(`${ing.inciName}: ${ev.citationUrl}`);
        }
      }
    }
  }

  assert(
    "Requirement 4.1: All citation URLs in canonical DB belong to authoritative regulatory/scientific domains",
    nonAuthoritativeCitations.length === 0,
    nonAuthoritativeCitations.join("; ")
  );

  console.log("=================================================");
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runEvidenceLayerTests();
