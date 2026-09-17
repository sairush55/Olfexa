/**
 * OLFEXA Checkpoint 4: Data Foundation Automated Test Suite
 * 
 * Verifies that:
 * 1. Canonical ingredient records exist.
 * 2. Duplicate ingredients are handled and merged by the pipeline.
 * 3. Alternative names and chemical synonyms work.
 * 4. Source attribution (organization, dataset, license) is preserved.
 * 5. Region is preserved.
 * 6. Source URL is preserved.
 * 7. Missing data is not fabricated.
 * 8. Dataset license/attribution is documented.
 */

import fs from "fs";
import path from "path";
import { 
  CANONICAL_INGREDIENTS_DATABASE, 
  findCanonicalIngredient 
} from "../src/data/canonicalIngredientsDatabase";
import { 
  executeIngestionPipeline, 
  validateStagingRecord 
} from "../src/lib/data-foundation/ingestionPipeline";
import { RawStagingRecord } from "../src/types/dataFoundation";

function runDataFoundationTests() {
  console.log("================================================================================");
  console.log("       OLFEXA CHECKPOINT 4: DATA FOUNDATION & INGESTION PIPELINE TESTS          ");
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

  // 1. Ingredient records exist
  const recordCount = CANONICAL_INGREDIENTS_DATABASE.length;
  assert("Requirement 1: Ingredient records exist in canonical database", recordCount >= 10,
    `Found ${recordCount} canonical ingredients.`);

  // 2. Duplicate ingredients are handled & merged
  const duplicateTestStaging: RawStagingRecord[] = [
    {
      rawName: "Limonene",
      commonName: "D-Limonene",
      synonyms: ["Citrus Terpene"],
      cas: "5989-27-5",
      dataset: "CosIng",
      sourceName: "European Commission CosIng",
      sourceUrl: "https://ec.europa.eu/growth/tools-databases/cosing/details/35012",
      region: "EU",
      license: "EU Legal Notice",
    },
    {
      rawName: "(R)-p-mentha-1,8-diene",
      commonName: "Orange Terpenes",
      synonyms: ["Limonene"],
      cas: "5989-27-5", // Identical CAS
      dataset: "OpenBeautyFacts",
      sourceName: "Open Beauty Facts",
      sourceUrl: "https://world.openbeautyfacts.org/ingredient/limonene",
      region: "GLOBAL",
      license: "ODbL 1.0",
    },
  ];
  const deduplicationRun = executeIngestionPipeline(duplicateTestStaging);
  const isMerged = deduplicationRun.totalUnique === 1 &&
                   deduplicationRun.processed[0].sources.length === 2 &&
                   deduplicationRun.processed[0].synonyms.length >= 1;
  assert("Requirement 2: Duplicate ingredients (by CAS/INCI) are handled and merged without data loss",
    isMerged,
    `Unique: ${deduplicationRun.totalUnique}, Sources: ${deduplicationRun.processed[0]?.sources.length}`);

  // 3. Alternative names and synonyms work
  const bySynonym = findCanonicalIngredient("D-Limonene");
  const byCas = findCanonicalIngredient("5989-27-5");
  const byExact = findCanonicalIngredient("LIMONENE");
  const synonymsWork = Boolean(bySynonym && byCas && byExact && bySynonym.inciName === "LIMONENE" && byCas.inciName === "LIMONENE");
  assert("Requirement 3: Alternative names and synonyms resolve to canonical INCI",
    synonymsWork,
    `bySynonym: ${bySynonym?.inciName}, byCas: ${byCas?.inciName}`);

  // 4. Source attribution is preserved
  const limonene = findCanonicalIngredient("LIMONENE");
  const hasValidSources = Boolean(
    limonene &&
    limonene.sources.length > 0 &&
    limonene.sources[0].sourceName &&
    limonene.sources[0].dataset &&
    limonene.sources[0].license
  );
  assert("Requirement 4: Source organization and dataset are preserved", hasValidSources,
    `Sources: ${JSON.stringify(limonene?.sources)}`);

  // 5. Region is preserved
  const hasRegion = Boolean(limonene && limonene.sources[0].region === "EU");
  assert("Requirement 5: Region is preserved (EU / GLOBAL)", hasRegion,
    `Region: ${limonene?.sources[0]?.region}`);

  // 6. Source URL is preserved
  const hasUrl = Boolean(limonene && limonene.sources[0].sourceUrl.startsWith("http"));
  assert("Requirement 6: Source URL is preserved and valid", hasUrl,
    `URL: ${limonene?.sources[0]?.sourceUrl}`);

  // 7. Missing data is not fabricated
  // For unclassified ingredients or missing CAS, ensure field remains undefined or empty, not fabricated
  const missingDataStaging: RawStagingRecord = {
    rawName: "MOCK_UNLISTED_HERB",
    dataset: "OpenBeautyFacts",
    sourceName: "Open Beauty Facts",
    sourceUrl: "https://world.openbeautyfacts.org/ingredient/mock",
    region: "GLOBAL",
    license: "ODbL",
  };
  const stagingCheck = executeIngestionPipeline([missingDataStaging]);
  const processedMock = stagingCheck.processed[0];
  const noFabrication = processedMock.casNumber === undefined && 
                        processedMock.ecNumber === undefined && 
                        processedMock.potentialConcerns === undefined;
  assert("Requirement 7: Missing data is not fabricated (remains undefined/empty)", noFabrication,
    `CAS: ${processedMock?.casNumber}, EC: ${processedMock?.ecNumber}`);

  // 8. Dataset license/attribution is documented
  const docPath = path.resolve(__dirname, "../src/data/DATASET_ATTRIBUTION.md");
  const docExists = fs.existsSync(docPath);
  const docContent = docExists ? fs.readFileSync(docPath, "utf-8") : "";
  const hasLicenses = docContent.includes("CosIng") && 
                      docContent.includes("Open Beauty Facts") && 
                      docContent.includes("ODbL");
  assert("Requirement 8: Dataset license and attribution documented in DATASET_ATTRIBUTION.md",
    docExists && hasLicenses,
    `Doc exists: ${docExists}, has licenses: ${hasLicenses}`);

  console.log("\n================================================================================");
  console.log(`CHECKPOINT 4 RESULTS: ${passed} / 8 PASSED (${failed} FAILED)`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runDataFoundationTests();
