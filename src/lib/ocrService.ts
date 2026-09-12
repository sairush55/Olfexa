import path from "path";
import fs from "fs";
import { createWorker } from "tesseract.js";
import { OLFEXA_DATASET } from "@/data/olfexaDataset";
import { 
  StructuredOcrExtraction, 
  ImageQualityAssessment, 
  ImageQualityRating, 
  ProductRelevanceAssessment 
} from "@/types";

const OFFICIAL_INCI_NAMES = OLFEXA_DATASET.ingredients.map((i) => i.name.toUpperCase());

export function getImageDimensions(buffer: Buffer): { width: number; height: number; format: string } | null {
  if (!buffer || buffer.length < 24) return null;

  // 1. PNG check
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height, format: "png" };
  }

  // 2. JPEG check
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length - 8) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height, format: "jpeg" };
      }
      const len = buffer.readUInt16BE(offset + 2);
      offset += 2 + len;
    }
  }

  // 3. WebP check
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    if (buffer.toString("ascii", 12, 16) === "VP8 ") {
      const width = buffer.readUInt16LE(26) & 0x3fff;
      const height = buffer.readUInt16LE(28) & 0x3fff;
      return { width, height, format: "webp" };
    }
  }

  return null;
}

export function assessImageQuality(
  buffer?: Buffer,
  confidence: number = 0.85,
  extractedText: string = ""
): ImageQualityAssessment {
  const warnings: string[] = [];
  const dimensions = buffer ? getImageDimensions(buffer) : null;
  const fileSizeBytes = buffer ? buffer.length : undefined;

  let hasSufficientResolution = true;
  if (dimensions) {
    if (dimensions.width < 400 || dimensions.height < 300) {
      hasSufficientResolution = false;
      warnings.push(`Low resolution (${dimensions.width}×${dimensions.height}px). Fine print cosmetic ingredient listings may be pixelated.`);
    }
  }

  if (fileSizeBytes && fileSizeBytes < 15000) {
    warnings.push("File size is small (< 15 KB). High compression may cause dropped or misspelled INCI characters.");
  }

  const clarityScore = Math.min(100, Math.max(10, Math.round(confidence * 100)));
  const isBlurry = clarityScore < 65;

  if (isBlurry) {
    warnings.push("Text clarity score is low (< 65%). Blurry characters or glare reflections may cause dropped tokens.");
  }

  // Assess character noise ratio in extractedText
  if (extractedText.length > 25) {
    const alphanumeric = extractedText.replace(/[^a-zA-Z0-9\s,.-]/g, "").length;
    const ratio = alphanumeric / extractedText.length;
    if (ratio < 0.7) {
      warnings.push("High non-alphanumeric noise ratio. Image may suffer from lighting glare, curved bottle reflections, or motion blur.");
    }
  }

  let rating: ImageQualityRating = "HIGH";
  let recommendation = "Image clarity is optimal for reliable INCI ingredient recognition.";

  if (warnings.length >= 2 || clarityScore < 60 || !hasSufficientResolution) {
    rating = "POOR";
    recommendation = "Image quality is suboptimal or blurry. OCR may produce misread tokens. Please verify candidate ingredients carefully before analysis.";
  } else if (warnings.length === 1 || clarityScore < 80) {
    rating = "ACCEPTABLE";
    recommendation = "Image quality is acceptable. Please verify detected candidate tokens before proceeding to scientific analysis.";
  }

  return {
    rating,
    clarityScore,
    dimensions: dimensions || undefined,
    fileSizeBytes,
    warnings,
    isBlurry,
    hasSufficientResolution,
    recommendation
  };
}

export function assessProductRelevance(text: string): ProductRelevanceAssessment {
  // 1. Perfume / fragrance keywords
  const hasPerfumeKeyword = /(EAU\s+DE\s+PARFUM|EAU\s+DE\s+TOILETTE|EXTRAIT|EAU\s+DE\s+COLOGNE|BODY\s+MIST|SCENT\s+MIST|EAU\s+FRA[IÎ]CHE|PARFUM|PERFUME|FINE\s+FRAGRANCE|COLOGNE|AFTERSHAVE)/i.test(text);

  // 2. Perfume carrier solvents
  const hasPerfumeCarriers = /(ALCOHOL\s+DENAT|SD\s+ALCOHOL|ETHANOL|DIPROPYLENE\s+GLYCOL|PARFUM|FRAGRANCE)/i.test(text);

  // 3. Regulated fragrance allergens & compounds
  const hasInciAllergens = /(LIMONENE|LINALOOL|COUMARIN|CITRONELLOL|GERANIOL|CITRAL|OAKMOSS|EUGENOL|FARNESOL|BENZYL\s+BENZOATE|BENZYL\s+SALICYLATE|ALPHA-ISOMETHYL\s+IONONE)/i.test(text);

  // 4. Ingredient list declaration keywords
  const hasIngredientHeader = /(INGREDIENTS?|INHALTSSTOFFE|CONTIENT|CONTAINS|COMPOSITION)\b/i.test(text);

  // 5. Non-fragrance merchandise / food / electronics keywords
  const isNonFragranceProduct = /(NUTRITION\s+FACTS|SERVING\s+SIZE|DIETARY\s+FIBER|SODIUM|CALORIES|WIRELESS|BLUETOOTH|CHARGER|BATTERY|INPUT:\s*\d|OUTPUT:\s*\d|HAND\s+SANITIZER|DISINFECTANT|ANTISEPTIC|DRUG\s+FACTS|ACTIVE\s+INGREDIENT:\s*ETHYL)/i.test(text);

  if (isNonFragranceProduct && !hasPerfumeKeyword && !hasInciAllergens) {
    return {
      isRelevant: false,
      status: "NON_FRAGRANCE_PRODUCT",
      classificationName: "Non-Fragrance Product Detected",
      rationale: "Detected markers of general merchandise, electronics, food, or sanitizer rather than fragrance packaging."
    };
  }

  if (hasPerfumeKeyword && (hasPerfumeCarriers || hasInciAllergens || hasIngredientHeader)) {
    return {
      isRelevant: true,
      status: "VERIFIED_FRAGRANCE_LABEL",
      classificationName: "Verified Fragrance Product / Ingredient Label",
      rationale: "Detected declared perfume concentration descriptors, cosmetic solvent matrix, and regulated fragrance allergens."
    };
  }

  if (hasPerfumeCarriers && hasInciAllergens) {
    return {
      isRelevant: true,
      status: "VERIFIED_FRAGRANCE_LABEL",
      classificationName: "Verified Fragrance Formulation",
      rationale: "Detected declared cosmetic fragrance solvent matrix and regulated fragrance aroma constituents."
    };
  }

  if (hasIngredientHeader || hasInciAllergens) {
    return {
      isRelevant: true,
      status: "GENERAL_COSMETIC_LABEL",
      classificationName: "Cosmetic / Skincare Ingredient Label",
      rationale: "Detected cosmetic ingredient list. This appears to be a cosmetic, personal care, or perfumed skincare formulation."
    };
  }

  return {
    isRelevant: false,
    status: "UNCLEAR_OR_IRRELEVANT",
    classificationName: "Unclear or Irrelevant Image",
    rationale: "No legible cosmetic ingredient text, fragrance concentration markers, or regulatory INCI declarations were found in this image."
  };
}

export async function processImageOcr(imageBuffer: Buffer): Promise<StructuredOcrExtraction> {
  let worker: any = null;
  try {
    const workerPath = path.join(process.cwd(), "node_modules", "tesseract.js", "src", "worker-script", "node", "index.js");
    
    worker = await createWorker("eng", 1, {
      workerPath: fs.existsSync(workerPath) ? workerPath : undefined,
    });

    const result = await worker.recognize(imageBuffer);
    const rawText = result?.data?.text || "";
    const confidence = Math.round((result?.data?.confidence || 0)) / 100;

    return extractStructuredFragranceData(rawText, confidence > 0 ? confidence : 0.85, imageBuffer);
  } catch (error: any) {
    console.error("Tesseract Engine Error:", error);
    throw new Error(`Optical Character Recognition error: ${error.message}`);
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // silent
      }
    }
  }
}

export function extractStructuredFragranceData(
  rawText: string, 
  confidence: number,
  imageBuffer?: Buffer
): StructuredOcrExtraction {
  const text = rawText || "";

  // 1. Image Quality Assessment
  const imageQuality = assessImageQuality(imageBuffer, confidence, text);

  // 2. Product Relevance Verification
  const relevance = assessProductRelevance(text);

  let isPerfume = relevance.isRelevant;
  let fragranceType = "Eau de Parfum";
  let detectionReason = relevance.rationale;

  if (/EXTRAIT/i.test(text)) fragranceType = "Extrait de Parfum";
  else if (/EAU\s+DE\s+TOILETTE|EDT\b/i.test(text)) fragranceType = "Eau de Toilette";
  else if (/EAU\s+DE\s+COLOGNE|EDC\b/i.test(text)) fragranceType = "Eau de Cologne";
  else if (/BODY\s+MIST|SCENT\s+MIST/i.test(text)) fragranceType = "Body Mist / Scent Mist";
  else if (relevance.status === "GENERAL_COSMETIC_LABEL") fragranceType = "Cosmetic Formulation";
  else fragranceType = "Eau de Parfum";

  // 2. Extract Manufacturing & Batch Information
  let batchCode: string | undefined = undefined;
  const batchMatch = text.match(/(?:BATCH|LOT|REF|CODE)\s*[:#.\-]?\s*([A-Z0-9]{3,12})/i);
  if (batchMatch && batchMatch[1]) {
    batchCode = batchMatch[1].toUpperCase();
  }

  let dateOfManufacture: string | undefined = undefined;
  const mfgMatch = text.match(/(?:MFG|MFR|PROD|DOM|DATE|MANUFACTURED)\s*[:.\-]?\s*(\d{2}[/-]\d{2}[/-]\d{2,4}|\d{4}[/-]\d{2}[/-]\d{2}|(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+\d{4})/i);
  if (mfgMatch && mfgMatch[1]) {
    dateOfManufacture = mfgMatch[1];
  }

  let periodAfterOpening: string | undefined = undefined;
  const paoMatch = text.match(/\b(36M|24M|18M|12M|6M)\b/i);
  if (paoMatch && paoMatch[1]) {
    periodAfterOpening = paoMatch[1].toUpperCase();
  }

  let expiryDate: string | undefined = undefined;
  const expMatch = text.match(/(?:EXP|EXPIRY|BEST\s+BEFORE|USE\s+BY)\s*[:.\-]?\s*(\d{2}[/-]\d{2}[/-]\d{2,4}|\d{4}[/-]\d{2}[/-]\d{2}|(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+\d{4})/i);
  if (expMatch && expMatch[1]) {
    expiryDate = expMatch[1];
  }

  // 3. Extract Company / Brand Details
  let brandName: string | undefined = undefined;
  let manufacturer: string | undefined = undefined;
  let distributor: string | undefined = undefined;

  const brandMatch = text.match(/^[ \t]*((?:PARFUMS|MAISON|ATELIER|HOUSE\s+OF)[ \t]+[A-Z0-9\t &'.\-]{3,40}|(?:BRAND|HOUSE|BY)\s*[:.\-]?[ \t]*([A-Z0-9\t &'.\-]{3,40}))/im);
  if (brandMatch && (brandMatch[1] || brandMatch[2])) {
    brandName = (brandMatch[2] || brandMatch[1]).trim();
  }

  const mfrMatch = text.match(/(?:MANUFACTURED\s+BY|FABRIQU[EÉ]\s+PAR|PRODUCED\s+BY|LABORATOIRES?|FORMULATED\s+BY)\s*[:.\-]?[ \t]*([A-Z0-9\t &',.\-]{3,45})/i);
  if (mfrMatch && mfrMatch[1]) {
    manufacturer = mfrMatch[1].trim();
  }

  const distMatch = text.match(/(?:DISTRIBUTED\s+BY|DISTRIBU[EÉ]\s+PAR|MADE\s+FOR)\s*[:.\-]?[ \t]*([A-Z0-9\t &',.\-]{3,45})/i);
  if (distMatch && distMatch[1]) {
    distributor = distMatch[1].trim();
  }

  // 4. Extract Company Address & Origin
  let countryOfOrigin: string | undefined = undefined;
  const originMatch = text.match(/(?:MADE\s+IN|FABRIQU[EÉ]\s+EN|PRODUCT\s+OF)[ \t]+([A-Z\t ]{3,25})/i);
  if (originMatch && originMatch[1]) {
    countryOfOrigin = originMatch[1].trim();
  }

  let fullAddress: string | undefined = undefined;
  const streetHubMatch = text.match(/^[ \t]*([0-9]{1,5}[0-9A-Z\t ,.'-]{3,70}\b(?:PARIS|LONDON|MILAN|MILANO|NEW\s+YORK|GRASSE|BARCELONA|GENEVA|ROMA|MADRID|BERLIN|DUBAI|FRANCE|USA|UK)\b[0-9A-Z\t ,.'-]*)/im);
  if (streetHubMatch && streetHubMatch[1]) {
    fullAddress = streetHubMatch[1].trim();
  } else {
    const addressMatch = text.match(/^[ \t]*([0-9A-Z\t ,.'-]{4,60}\b(?:PARIS|LONDON|MILAN|MILANO|NEW\s+YORK|GRASSE|BARCELONA|GENEVA|ROMA|MADRID|BERLIN|DUBAI)\b[0-9A-Z\t ,.'-]*)/im);
    if (addressMatch && addressMatch[1]) {
      fullAddress = addressMatch[1].trim();
    }
  }

  let responsiblePersonEU: string | undefined = undefined;
  const rpMatch = text.match(/(?:RP|RESPONSIBLE\s+PERSON|EU\s+RP)\s*[:.\-]?[ \t]*([A-Z0-9\t ,.\-]{5,45})/i);
  if (rpMatch && rpMatch[1]) {
    responsiblePersonEU = rpMatch[1].trim();
  }

  // 5. Extract Ingredients
  const candidates = parseIngredientsFromOcrText(text);

  return {
    isPerfume,
    fragranceType,
    detectionReason,
    confidence,
    rawText: text,
    candidates,
    imageQuality,
    relevance,
    manufacturingInfo: {
      dateOfManufacture,
      batchCode,
      periodAfterOpening,
      expiryDate,
    },
    companyDetails: {
      brandName,
      manufacturer,
      distributor,
    },
    companyAddress: {
      fullAddress,
      countryOfOrigin,
      responsiblePersonEU,
    },
  };
}

export function parseIngredientsFromOcrText(text: string): string[] {
  if (!text || text.trim().length === 0) return [];

  let cleaned = text
    .replace(/\b\d{1,3}%\s*vol\b/gi, "")
    .replace(/\b\d{1,4}\s*(ml|fl\.?\s*oz)\b/gi, "")
    .replace(/\b(made in [a-z\s]+)\b/gi, "")
    .replace(/[[\]{}()]/g, " ");

  const headerMatch = cleaned.match(/(?:INGREDIENTS|INGR[EÉ]DIENTS|CONTAINS|COMPOSITION)\s*[:.\-]\s*([\s\S]+)/i);
  if (headerMatch && headerMatch[1]) {
    cleaned = headerMatch[1];
  }

  const rawTokens = cleaned
    .split(/[,;•·|\n\r]+/)
    .map((t) => t.replace(/[^a-zA-Z0-9\s\-'.()/]/g, "").trim().toUpperCase())
    .filter((t) => t.length > 1 && !/^\d+$/.test(t));

  const refinedTokens: string[] = [];
  const seen = new Set<string>();

  for (const token of rawTokens) {
    const matchedOfficial = OFFICIAL_INCI_NAMES.find(
      (official) =>
        token === official ||
        token.includes(official) ||
        (token.length > 5 && official.includes(token))
    );

    const finalToken = matchedOfficial || token;

    if (!seen.has(finalToken) && finalToken.length >= 2) {
      seen.add(finalToken);
      refinedTokens.push(finalToken);
    }
  }

  return refinedTokens;
}
