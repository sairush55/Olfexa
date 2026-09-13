const { 
  findBestInciMatch, 
  parseIngredientsFromOcrText, 
  extractStructuredFragranceData,
  levenshteinDistance 
} = require('d:/OLFEXA/src/lib/ocrService');

async function testUpgrade() {
  console.log('====================================================');
  console.log('  OLFEXA OCR VISION UPGRADE VERIFICATION TEST');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  // Test 1: Levenshtein distance
  total++;
  const d = levenshteinDistance('LIMONENE', 'LIMONEN');
  if (d === 1) {
    console.log('1. [PASS] Levenshtein distance accurate (LIMONENE vs LIMONEN = 1)');
    passed++;
  } else {
    console.log('1. [FAIL] Levenshtein distance failed:', d);
  }

  // Test 2: Fuzzy INCI Corrections
  total++;
  const testCases = [
    { input: 'L1MONENE', expected: 'LIMONENE' },
    { input: 'LINALOL', expected: 'LINALOOL' },
    { input: 'COUMAR1N', expected: 'COUMARIN' },
    { input: 'CITRONELL0L', expected: 'CITRONELLOL' },
    { input: 'ALC0H0L DENAT', expected: 'ALCOHOL DENAT.' },
    { input: 'EUGEN0L', expected: 'EUGENOL' },
    { input: '8HT', expected: 'BHT' }
  ];

  let fuzzyPass = true;
  for (const tc of testCases) {
    const res = findBestInciMatch(tc.input);
    if (res !== tc.expected) {
      console.log(`   [FAIL] Expected "${tc.expected}" for "${tc.input}", got "${res}"`);
      fuzzyPass = false;
    }
  }
  if (fuzzyPass) {
    console.log('2. [PASS] All fuzzy INCI corrections and cosmetic OCR typos resolved.');
    passed++;
  }

  // Test 3: Packaging Noise Stripping
  total++;
  const rawPackagingText = `
  EAU DE PARFUM 50 ML - 1.7 FL. OZ.
  80% VOL.
  MADE IN FRANCE
  FOR EXTERNAL USE ONLY. FLAMMABLE.
  INGREDIENTS: ALCOHOL DENAT., AQUA/WATER, PARFUM (FRAGRANCE),
  L1MONENE, LINALOL, CITRONELL0L, COUMAR1N, 8HT, GERANIOL.
  BATCH: 9283A
  EXP: 2027-10
  `;

  const parsedIngredients = parseIngredientsFromOcrText(rawPackagingText);
  console.log('\n3. Packaging Text Parsing:');
  console.log('   Input packaging text includes volumes, batch, warnings, and typos.');
  console.log('   Extracted tokens:', parsedIngredients);

  const hasNoise = parsedIngredients.some(t => /VOL|50 ML|MADE IN|FLAMMABLE|BATCH/i.test(t));
  const hasCorrected = parsedIngredients.includes('LIMONENE') && parsedIngredients.includes('LINALOOL') && parsedIngredients.includes('COUMARIN');

  if (!hasNoise && hasCorrected && parsedIngredients.length >= 6) {
    console.log('   [PASS] Packaging clutter removed; INCI tokens cleanly extracted and harmonized.');
    passed++;
  } else {
    console.log('   [FAIL] Clutter not cleanly filtered.');
  }

  // Test 4: Structured Packaging Provenance Extraction
  total++;
  const structured = extractStructuredFragranceData(rawPackagingText, 0.95);
  console.log('\n4. Structured Provenance:');
  console.log('   Fragrance Type:', structured.fragranceType);
  console.log('   Batch Code:', structured.manufacturingInfo?.batchCode);
  console.log('   Country of Origin:', structured.companyAddress?.countryOfOrigin);
  console.log('   Is Perfume Relevant:', structured.isPerfume);

  if (
    structured.fragranceType === 'Eau de Parfum' &&
    structured.manufacturingInfo?.batchCode === '9283A' &&
    structured.companyAddress?.countryOfOrigin === 'FRANCE' &&
    structured.isPerfume === true
  ) {
    console.log('   [PASS] Structured packaging provenance extracted accurately.');
    passed++;
  } else {
    console.log('   [FAIL] Structured provenance mismatch.');
  }

  console.log('\n====================================================');
  console.log(`  RESULT: ${passed} / ${total} TESTS PASSED`);
  console.log('====================================================\n');
}

testUpgrade();
