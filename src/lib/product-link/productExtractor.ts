/**
 * OLFEXA — Server-Side Product Page Extractor
 * 
 * Safely fetches an e-commerce or brand product page and extracts:
 * - Product Title & Brand
 * - Concentration & Product Type
 * - Fragrance Notes (Top, Heart, Base) if declared
 * - INCI Ingredient List (Schema.org, OpenGraph, or HTML sections)
 * 
 * CORE ARCHITECTURAL PRINCIPLE:
 * Never invents or guesses ingredients. If no ingredient list is declared on the page,
 * returns ingredientsText: undefined, ingredients: [].
 */

import { ProductPageData, FragranceNotes } from "./types";
import { parseIngredientsFromOcrText } from "../ocrService";

function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&bull;/g, " • ")
    .replace(/&middot;/g, " • ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, (match) => {
      const num = parseInt(match.slice(2, -1), 10);
      return !isNaN(num) ? String.fromCharCode(num) : match;
    });
}

function stripHtmlTags(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<br\s*[\/]?>/gi, ", ")
    .replace(/<\/(p|div|li|h\d|tr)>/gi, ", ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Safely fetches the HTML content of a product page.
 * Implements a 10s timeout, browser headers, and a 2.5MB response size limit.
 */
export async function fetchProductPageHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (OLFEXA Fragrance Intelligence Bot)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Product page returned status ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      throw new Error("Target URL is not an HTML product page.");
    }

    // Limit response size to 2.5 MB to prevent memory exhaustion
    const reader = response.body?.getReader();
    if (!reader) {
      return await response.text();
    }

    let chunks: Uint8Array[] = [];
    let receivedBytes = 0;
    const maxBytes = 2.5 * 1024 * 1024;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        receivedBytes += value.length;
        if (receivedBytes > maxBytes) {
          break; // cap read
        }
      }
    }

    const totalBuffer = new Uint8Array(receivedBytes);
    let offset = 0;
    for (const chunk of chunks) {
      totalBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    return new TextDecoder("utf-8").decode(totalBuffer);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Parses Schema.org JSON-LD from HTML.
 */
function extractJsonLd(html: string): any[] {
  const results: any[] = [];
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(html)) !== null) {
    if (match[1]) {
      try {
        const parsed = JSON.parse(match[1].trim());
        if (Array.isArray(parsed)) {
          results.push(...parsed);
        } else if (parsed["@graph"] && Array.isArray(parsed["@graph"])) {
          results.push(...parsed["@graph"]);
        } else {
          results.push(parsed);
        }
      } catch {
        // ignore invalid json-ld snippets
      }
    }
  }

  return results;
}

/**
 * Extracts OpenGraph and Meta tags.
 */
function extractMetaTags(html: string): Record<string, string> {
  const meta: Record<string, string> = {};
  const metaRegex = /<meta[^>]+(?:property|name)=["']([^"']+)["'][^>]+content=["']([^"']*)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = metaRegex.exec(html)) !== null) {
    if (match[1] && match[2]) {
      meta[match[1].toLowerCase()] = decodeHtmlEntities(match[2].trim());
    }
  }

  // Reverse attribute order check: content="..." property="..."
  const reverseMetaRegex = /<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']([^"']+)["']/gi;
  while ((match = reverseMetaRegex.exec(html)) !== null) {
    if (match[1] && match[2]) {
      meta[match[2].toLowerCase()] = decodeHtmlEntities(match[1].trim());
    }
  }

  return meta;
}

/**
 * Detects declared fragrance concentration from text or title.
 */
function detectConcentration(text: string): string | undefined {
  if (/EXTRAIT\s+DE\s+PARFUM|PARFUM\s+EXTRAIT|PURE\s+PERFUME/i.test(text)) return "Extrait de Parfum";
  if (/EAU\s+DE\s+PARFUM|\bEDP\b/i.test(text)) return "Eau de Parfum";
  if (/EAU\s+DE\s+TOILETTE|\bEDT\b/i.test(text)) return "Eau de Toilette";
  if (/EAU\s+DE\s+COLOGNE|\bEDC\b/i.test(text)) return "Eau de Cologne";
  if (/EAU\s+FRA[IÎ]CHE/i.test(text)) return "Eau Fraîche";
  if (/BODY\s+MIST|SCENT\s+MIST/i.test(text)) return "Body Mist";
  if (/ATTAR|PERFUME\s+OIL|ITTR/i.test(text)) return "Attar / Perfume Oil";
  return undefined;
}

/**
 * Locates and isolates the raw ingredient / INCI section from HTML.
 * Looks for common headers, accordions, and schema properties.
 */
function findIngredientsText(html: string, jsonLdList: any[]): string | undefined {
  // 1. Check JSON-LD schema objects for an explicit "ingredients" or "description" field
  for (const item of jsonLdList) {
    if (item && (item["@type"] === "Product" || item["@type"]?.includes("Product"))) {
      if (item.ingredients) {
        if (Array.isArray(item.ingredients)) {
          return item.ingredients.join(", ");
        }
        if (typeof item.ingredients === "string" && item.ingredients.length > 10) {
          return item.ingredients;
        }
      }
      // Check additionalProperty array
      if (Array.isArray(item.additionalProperty)) {
        const prop = item.additionalProperty.find(
          (p: any) => p?.name && /ingredients?|inci|composition/i.test(p.name)
        );
        if (prop && prop.value) {
          return typeof prop.value === "string" ? prop.value : JSON.stringify(prop.value);
        }
      }
    }
  }

  // 2. Look for dedicated HTML elements or sections with "ingredients" in ID, class, or data attribute
  const sectionPatterns = [
    /<(?:div|section|article|details)[^>]*(?:id|class|aria-label|data-testid)=["'][^"']*(?:ingredients?|inci-list|product-ingredients)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section|article|details)>/gi,
    /<details[^>]*>[\s\S]*?<summary[^>]*>[\s\S]*?ingredients?[\s\S]*?<\/summary>([\s\S]*?)<\/details>/gi,
    /<(?:h2|h3|h4|h5|h6|button|strong|b)[^>]*>\s*(?:Ingredients|Ingredients\s+List|INCI|Composition|Full\s+Ingredients|Ingredients\s+&\s+Materials)\s*<\/(?:h2|h3|h4|h5|h6|button|strong|b)>([\s\S]*?)(?=<(?:h2|h3|h4|h5|h6)|$)/gi,
  ];

  for (const pattern of sectionPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(html)) !== null) {
      if (match[1]) {
        const cleaned = decodeHtmlEntities(stripHtmlTags(match[1]));
        // Must have cosmetic INCI markers (e.g. Alcohol, Aqua, Parfum, or comma-separated tokens)
        if (
          cleaned.length >= 25 &&
          /(?:ALCOHOL|AQUA|WATER|PARFUM|FRAGRANCE|LIMONENE|LINALOOL|GLYCERIN|CITRONELLOL|COUMARIN|BENZYL)/i.test(cleaned)
        ) {
          return cleaned;
        }
      }
    }
  }

  // 3. Fallback: Search for inline "INGREDIENTS: ..." text block in the body
  const inlineMatch = html.match(/(?:INGREDIENTS?|INCI|COMPOSITION)\s*[:.\-]\s*([^<]{30,800})/i);
  if (inlineMatch && inlineMatch[1]) {
    const cleaned = decodeHtmlEntities(stripHtmlTags(inlineMatch[1]));
    if (/(?:ALCOHOL|AQUA|WATER|PARFUM|FRAGRANCE|LIMONENE|LINALOOL)/i.test(cleaned)) {
      return cleaned;
    }
  }

  return undefined;
}

/**
 * Extracts declared olfactory notes (Top, Heart, Base) if described on page.
 */
function extractFragranceNotes(text: string): FragranceNotes | undefined {
  const notes: FragranceNotes = {};
  let found = false;

  const topMatch = text.match(/(?:top\s+notes?|\btop\b|head\s+notes?|\bhead\b|opening)\s*[:\-]\s*([^<\n\r.]+)/i);
  if (topMatch && topMatch[1]) {
    notes.top = topMatch[1].split(/[,/•·]+/).map((s) => s.trim()).filter((s) => s.length > 2);
    if (notes.top.length > 0) found = true;
  }

  const heartMatch = text.match(/(?:heart\s+notes?|\bheart\b|middle\s+notes?|\bmiddle\b)\s*[:\-]\s*([^<\n\r.]+)/i);
  if (heartMatch && heartMatch[1]) {
    notes.heart = heartMatch[1].split(/[,/•·]+/).map((s) => s.trim()).filter((s) => s.length > 2);
    if (notes.heart.length > 0) found = true;
  }

  const baseMatch = text.match(/(?:base\s+notes?|\bbase\b|bottom\s+notes?|\bbottom\b|drydown)\s*[:\-]\s*([^<\n\r.]+)/i);
  if (baseMatch && baseMatch[1]) {
    notes.base = baseMatch[1].split(/[,/•·]+/).map((s) => s.trim()).filter((s) => s.length > 2);
    if (notes.base.length > 0) found = true;
  }

  return found ? notes : undefined;
}

/**
 * Main Product Page Extraction Function.
 * Returns structured ProductPageData with no hallucinations.
 */
export function extractProductPageData(html: string, sourceUrl: string): ProductPageData {
  const jsonLdList = extractJsonLd(html);
  const meta = extractMetaTags(html);

  // 1. Product Name
  let productName: string | undefined = undefined;
  const productSchema = jsonLdList.find(
    (item) => item && (item["@type"] === "Product" || item["@type"]?.includes("Product"))
  );

  if (productSchema && productSchema.name) {
    productName = decodeHtmlEntities(productSchema.name.trim());
  } else if (meta["og:title"]) {
    productName = meta["og:title"];
  } else if (meta["twitter:title"]) {
    productName = meta["twitter:title"];
  } else {
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      productName = decodeHtmlEntities(titleMatch[1].trim());
    }
  }

  // 2. Brand Name
  let brand: string | undefined = undefined;
  if (productSchema && productSchema.brand) {
    brand = typeof productSchema.brand === "string" ? productSchema.brand : productSchema.brand.name;
  } else if (meta["product:brand"]) {
    brand = meta["product:brand"];
  } else if (meta["og:brand"]) {
    brand = meta["og:brand"];
  }

  // Clean brand / product name separators (e.g. "Sauvage Eau de Parfum | DIOR")
  if (productName && !brand) {
    const sepMatch = productName.match(/^(.*?)\s*[-|–—:]\s*([A-Za-z0-9\s'&]+)$/);
    if (sepMatch) {
      const partA = sepMatch[1].trim();
      const partB = sepMatch[2].trim();
      if (partB.length < 30 && !/sephora|ulta|official/i.test(partB)) {
        brand = partB;
        productName = partA;
      }
    }
  }

  // 3. Image URL
  let imageUrl: string | undefined = undefined;
  if (productSchema && productSchema.image) {
    if (typeof productSchema.image === "string") imageUrl = productSchema.image;
    else if (Array.isArray(productSchema.image) && productSchema.image[0]) {
      imageUrl = typeof productSchema.image[0] === "string" ? productSchema.image[0] : productSchema.image[0].url;
    } else if (productSchema.image.url) {
      imageUrl = productSchema.image.url;
    }
  }
  if (!imageUrl) {
    imageUrl = meta["og:image"] || meta["twitter:image"] || undefined;
  }

  // 4. Description
  let description: string | undefined = undefined;
  if (productSchema && productSchema.description) {
    description = decodeHtmlEntities(stripHtmlTags(productSchema.description));
  } else if (meta["og:description"]) {
    description = meta["og:description"];
  } else if (meta["description"]) {
    description = meta["description"];
  }

  // 5. Concentration & Product Type
  const fullTextContext = `${productName || ""} ${description || ""} ${html.substring(0, 10000)}`;
  const concentration = detectConcentration(fullTextContext) || "Eau de Parfum";
  const productType = concentration.includes("Attar") ? "attar" : "perfume";

  // 6. Net Volume / Size
  let size: string | undefined = undefined;
  const sizeMatch = fullTextContext.match(/\b(\d{1,4}(?:\.\d+)?\s*(?:ml|fl\.?\s*oz\.?))\b/i);
  if (sizeMatch) {
    size = sizeMatch[1].toUpperCase();
  }

  // 7. Fragrance Notes
  const fragranceNotes = extractFragranceNotes(fullTextContext);

  // 8. Ingredients Text & Canonical INCI extraction
  const ingredientsText = findIngredientsText(html, jsonLdList);
  let ingredients: string[] = [];

  if (ingredientsText && ingredientsText.trim().length > 0) {
    // Re-use existing canonical INCI extractor
    ingredients = parseIngredientsFromOcrText(ingredientsText);
  }

  // Calculate extraction confidence
  let extractionConfidence = 0.5;
  if (ingredients.length >= 6) {
    extractionConfidence = 0.95;
  } else if (ingredients.length >= 2) {
    extractionConfidence = 0.85;
  } else if (ingredients.length === 1) {
    extractionConfidence = 0.70;
  }

  return {
    sourceUrl,
    productName: productName || "Product Page Analysis",
    brand: brand || "Brand Formulation",
    description: description ? description.substring(0, 280) : undefined,
    imageUrl,
    fragranceNotes,
    ingredientsText: ingredients.length > 0 ? ingredientsText : undefined,
    ingredients,
    concentration,
    productType,
    size,
    extractionConfidence,
  };
}

export const extractProductFromHtml = extractProductPageData;
