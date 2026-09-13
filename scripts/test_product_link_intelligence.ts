import { validateProductUrl } from "../src/lib/product-link/urlValidator";
import { extractProductFromHtml } from "../src/lib/product-link/productExtractor";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

console.log("=== 1. TESTING URL VALIDATION & SSRF DEFENSE ===");

const validUrls = [
  "https://www.sephora.com/product/sauvage-eau-de-parfum-P427503",
  "https://brand.com/products/attar-rose-oud",
  "http://perfumery.co.uk/item/12345?variant=100ml",
  "https://fragrance.shop/item#ingredients"
];

for (const url of validUrls) {
  const res = validateProductUrl(url);
  assert(res.isValid, `Valid URL failed validation: ${url} (${res.error})`);
}
console.log("✅ Valid URLs passed.");

const invalidUrls = [
  "",
  "   ",
  "javascript:alert(1)",
  "file:///etc/passwd",
  "ftp://ftp.example.com/file",
  "data:text/html,test",
  "http://localhost/admin",
  "http://127.0.0.1:3000/internal",
  "http://[::1]/private",
  "http://192.168.1.1/router",
  "http://10.0.0.1/backend",
  "http://172.16.0.5/api",
  "not-a-url"
];

for (const url of invalidUrls) {
  const res = validateProductUrl(url);
  assert(!res.isValid, `Invalid or SSRF URL should have been rejected: ${url}`);
  assert(
    res.error === "Please enter a valid product page URL.",
    `Error message must be user-friendly: got "${res.error}"`
  );
}
console.log("✅ Invalid & SSRF URLs safely rejected with clean error message.");

console.log("\n=== 2. TESTING PRODUCT PAGE EXTRACTION (JSON-LD & INCI) ===");

const sampleHtmlWithJsonLdAndInci = `
<!DOCTYPE html>
<html>
<head>
  <title>L'Ambre Noir Eau de Parfum 100ml - Maison Élixir</title>
  <meta property="og:title" content="L'Ambre Noir Eau de Parfum" />
  <meta property="og:brand" content="Maison Élixir" />
  <meta property="og:image" content="https://images.example.com/ambre-noir.jpg" />
  <meta name="description" content="An amber woody fragrance with vegan and alcohol-denat base." />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "L'Ambre Noir Eau de Parfum",
    "image": "https://images.example.com/ambre-noir-product.jpg",
    "brand": {
      "@type": "Brand",
      "name": "Maison Élixir"
    },
    "description": "Exquisite extrait composition with amber, tonka, and bergamot.",
    "category": "Fragrance > Perfume"
  }
  </script>
</head>
<body>
  <h1>L'Ambre Noir Eau de Parfum</h1>
  <div class="product-notes">
    <p>Top Notes: Bergamot, Pink Pepper</p>
    <p>Heart Notes: Rose, Cinnamon, Amber</p>
    <p>Base Notes: Oud, Vanilla, Cedarwood</p>
  </div>
  <div id="ingredients-section" class="ingredients-content">
    <h3>Ingredients</h3>
    <p>
      ALCOHOL DENAT., AQUA / WATER / EAU, PARFUM / FRAGRANCE, LIMONENE, LINALOOL, COUMARIN, CITRONELLOL, BHT.
    </p>
  </div>
</body>
</html>
`;

const extracted1 = extractProductFromHtml(sampleHtmlWithJsonLdAndInci, "https://brand.com/ambre-noir");
assert(extracted1.productName === "L'Ambre Noir Eau de Parfum", `Extracted product name mismatch: ${extracted1.productName}`);
assert(extracted1.brand === "Maison Élixir", `Extracted brand mismatch: ${extracted1.brand}`);
assert(extracted1.concentration === "Eau de Parfum", `Extracted concentration mismatch: ${extracted1.concentration}`);
assert(extracted1.imageUrl === "https://images.example.com/ambre-noir-product.jpg", `Extracted image mismatch: ${extracted1.imageUrl}`);
assert(extracted1.fragranceNotes?.top?.includes("Bergamot") === true, "Top notes should contain Bergamot");
assert(extracted1.fragranceNotes?.heart?.includes("Rose") === true, "Heart notes should contain Rose");
assert(extracted1.fragranceNotes?.base?.includes("Oud") === true, "Base notes should contain Oud");
assert(Array.isArray(extracted1.ingredients) && extracted1.ingredients.length >= 7, `Expected >= 7 ingredients`);
assert(extracted1.ingredients.includes("ALCOHOL DENAT."), "Ingredients should contain ALCOHOL DENAT.");
assert(extracted1.ingredients.includes("COUMARIN"), "Ingredients should contain COUMARIN");
console.log("✅ JSON-LD + INCI + Fragrance notes extraction verified.");

console.log("\n=== 3. TESTING RULE 1 & 2: GUARANTEED NON-HALLUCINATION ===");
// Page only has marketing notes, NO cosmetic INCI ingredients!
const sampleHtmlOnlyNotes = `
<!DOCTYPE html>
<html>
<head>
  <title>Royal Oud Attar Pure Oil - Arabian Heritage</title>
  <meta property="og:title" content="Royal Oud Attar Pure Oil" />
  <meta property="og:brand" content="Arabian Heritage" />
  <meta name="description" content="A pure concentrated attar oil blend with Agarwood, Rose, and Sandalwood." />
</head>
<body>
  <h1>Royal Oud Attar Pure Oil</h1>
  <div class="fragrance-pyramid">
    <h3>Fragrance Notes</h3>
    <div class="notes-top">Top: Taif Rose, Cardamom</div>
    <div class="notes-middle">Heart: Cambodian Oud, Saffron</div>
    <div class="notes-bottom">Base: Sandalwood, Musk, Amber</div>
  </div>
  <div class="product-description">
    <p>Crafted by traditional artisans. 100% pure alcohol-free concentrated perfume oil.</p>
  </div>
</body>
</html>
`;

const extracted2 = extractProductFromHtml(sampleHtmlOnlyNotes, "https://arabianheritage.com/royal-oud");
assert(extracted2.productName === "Royal Oud Attar Pure Oil", "Product name extracted correctly");
assert(
  extracted2.productType?.toLowerCase() === "attar" || extracted2.concentration?.includes("Attar") === true,
  "Identified as Attar"
);
assert(extracted2.fragranceNotes?.top?.includes("Taif Rose") === true, "Top notes extracted");
assert(extracted2.fragranceNotes?.heart?.includes("Cambodian Oud") === true, "Heart notes extracted");

// Non-hallucination verification:
assert(
  extracted2.ingredients.length === 0,
  `CRITICAL VIOLATION: Olfactory notes must NOT be hallucinated as INCI ingredients! Got: ${JSON.stringify(extracted2.ingredients)}`
);
assert(
  extracted2.ingredientsText === undefined,
  "ingredientsText must be undefined when no INCI section exists on page"
);
console.log("✅ Non-hallucination verified: Fragrance notes were kept completely separate from INCI ingredients.");

console.log("\n=== 4. TESTING PRODUCT ATTAR & ACCORDION PARSING ===");
const sampleAccordionHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Velvet Iris EDT - Le Parfumier</title>
</head>
<body>
  <div class="product-title">Velvet Iris 50 ml Eau de Toilette</div>
  <details class="accordion-item">
    <summary>Composition &amp; Ingredients</summary>
    <div class="content">
      INGREDIENTS: ALCOHOL, AQUA (WATER), PARFUM (FRAGRANCE), ALPHA-ISOMETHYL IONONE, BENZYL BENZOATE, TOCOPHEROL.
    </div>
  </details>
</body>
</html>
`;

const extracted3 = extractProductFromHtml(sampleAccordionHtml, "https://shop.com/velvet-iris");
assert(extracted3.concentration === "Eau de Toilette", `Expected EDT, got ${extracted3.concentration}`);
assert(extracted3.size?.toLowerCase() === "50 ml", `Expected 50 ml, got ${extracted3.size}`);
assert(extracted3.ingredients.length === 6, `Expected 6 ingredients, got ${extracted3.ingredients.length}: ${JSON.stringify(extracted3.ingredients)}`);
assert(extracted3.ingredients.includes("ALPHA-ISOMETHYL IONONE"), "Contains ALPHA-ISOMETHYL IONONE");
console.log("✅ HTML details/summary accordion and size/concentration extraction verified.");

console.log("\n🎉 ALL PRODUCT LINK INTELLIGENCE UNIT TESTS PASSED!");
