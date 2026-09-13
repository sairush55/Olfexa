import { 
  ImageQualityEvaluation, 
  ProductValidationResult, 
  IngredientListVisibility 
} from "@/types";
import { getImageDimensions } from "./ocrService";

/**
 * Evaluates image quality before full optical recognition.
 * Assesses resolution, blur markers, lighting exposure, and boundary truncation.
 */
export function evaluateImageQuality(
  buffer?: Buffer,
  extractedText: string = "",
  confidenceScore: number = 0.85
): ImageQualityEvaluation {
  const issues: string[] = [];
  const dims = buffer ? getImageDimensions(buffer) : null;
  const dimensions = dims ? { width: dims.width, height: dims.height } : undefined;

  let isBlurry = false;
  let isTooDark = false;
  let isTooBright = false;
  let isTooSmall = false;
  let isPartiallyCutOff = false;

  // 1. Resolution Check
  if (dimensions) {
    if (dimensions.width < 400 || dimensions.height < 300) {
      isTooSmall = true;
      issues.push("Low resolution image. Fine-print cosmetic ingredient labels require at least 400×300px.");
    }
  }

  // 2. File size / Compression Artifacts
  if (buffer && buffer.length < 15000 && !dimensions) {
    isTooSmall = true;
    issues.push("Image file size is very small (< 15 KB). High compression drops character detail.");
  }

  // 3. Brightness / Exposure Check (buffer luminance sampling)
  if (buffer && buffer.length > 50) {
    let sum = 0;
    let count = 0;
    const start = Math.min(64, buffer.length);
    const end = Math.min(buffer.length, 5000);
    for (let i = start; i < end; i += 4) {
      sum += buffer[i];
      count++;
    }
    if (count > 0) {
      const avgBrightness = sum / count;
      if (avgBrightness < 30) {
        isTooDark = true;
        issues.push("Image is underexposed and too dark to distinguish fine text.");
      } else if (avgBrightness > 235) {
        isTooBright = true;
        issues.push("Image is overexposed with excessive glare and washed-out highlights.");
      }
    }
  }

  // 4. Blur & Clarity Evaluation
  const clarityScore = Math.min(100, Math.max(10, Math.round(confidenceScore * 100)));
  if (clarityScore < 45) {
    isBlurry = true;
    issues.push("High blur or motion distortion detected.");
  }

  // 5. Character noise ratio evaluation
  if (extractedText.length > 20) {
    const alphanumeric = extractedText.replace(/[^a-zA-Z0-9\s,.-]/g, "").length;
    const ratio = alphanumeric / extractedText.length;
    if (ratio < 0.50) {
      isBlurry = true;
      issues.push("High optical noise ratio. Text clarity is compromised by glare or surface curvature.");
    }
  }

  // 6. Truncation / Cut-off check
  // If text starts or ends mid-word with incomplete hyphens or trailing commas without completion
  if (extractedText.trim().length > 0) {
    const trimmed = extractedText.trim();
    const endsWithTrailingComma = /[,;•]\s*$/.test(trimmed);
    const startsWithBrokenWord = /^[a-z]{1,4}[,;]/i.test(trimmed);
    const hasTruncatedHeader = /\b(?:INGR|INGREDI|INGRED)\b(?!\s*[:.\-])/i.test(trimmed);

    if (hasTruncatedHeader || (endsWithTrailingComma && trimmed.length < 50)) {
      isPartiallyCutOff = true;
      issues.push("Part of the ingredient list appears to be outside or cut off by the image boundary.");
    }
  }

  // Determine overall status & actionable guidance
  let status: ImageQualityEvaluation["status"] = "GOOD";
  let actionableGuidance = "Image clarity is optimal for reliable cosmetic label recognition.";

  if (isBlurry) {
    status = "BLURRY";
    actionableGuidance = "Image is too blurry to reliably read the ingredients. Please hold your camera steady and tap to focus.";
  } else if (isTooDark) {
    status = "TOO_DARK";
    actionableGuidance = "Image is too dark to distinguish fine cosmetic text. Please turn on camera flash or capture under brighter lighting.";
  } else if (isTooBright) {
    status = "TOO_BRIGHT";
    actionableGuidance = "Excessive glare or overexposure detected on packaging. Please angle your camera away from direct light reflections.";
  } else if (isTooSmall) {
    status = "LOW_RESOLUTION";
    actionableGuidance = "Move closer to the ingredient label so the text fills the camera frame.";
  } else if (isPartiallyCutOff) {
    status = "PARTIALLY_CUT_OFF";
    actionableGuidance = "Part of the ingredient list appears to be outside the image. Please zoom out slightly to capture the complete label.";
  } else if (issues.length > 0) {
    status = "UNREADABLE";
    actionableGuidance = "Please capture the label in better lighting with the ingredient list clearly centered.";
  }

  return {
    status,
    confidence: isBlurry ? 0.45 : isTooDark ? 0.40 : isTooBright ? 0.40 : isTooSmall ? 0.50 : isPartiallyCutOff ? 0.60 : 0.95,
    isBlurry,
    isTooDark,
    isTooBright,
    isTooSmall,
    isPartiallyCutOff,
    clarityScore,
    dimensions,
    issues,
    actionableGuidance
  };
}

/**
 * Validates whether the image contains a relevant fragrance product or ingredient label.
 * Distinguishes perfumes, boxes, bottles from food, electronics, or unrelated documents.
 */
export function validateProductImage(
  text: string,
  dims?: { width: number; height: number }
): ProductValidationResult {
  const upper = (text || "").toUpperCase();

  // 1. Food / Merchandise / Electronics Rejection Markers
  const hasFoodMarkers = /\b(NUTRITION\s+FACTS|SERVING\s+SIZE|DIETARY\s+FIBER|TOTAL\s+FAT|SODIUM\s+\d|CALORIES\s+\d|DAILY\s+VALUE|CONTAINS\s+MILK|GLUTEN\s+FREE)\b/i.test(upper);
  const hasElectronicsMarkers = /\b(BLUETOOTH|WIRELESS|CHARGER|BATTERY|INPUT:\s*\d|OUTPUT:\s*\d|WATT|VOLTAGE|AMPERE|FCC\s+ID|USB-C)\b/i.test(upper);
  const hasGenericDocumentMarkers = /\b(INVOICE|CURRICULUM\s+VITAE|RESUME|DEAR\s+SIR|AGREEMENT|MEMORANDUM|STATEMENT\s+OF\s+ACCOUNT|BALANCE\s+DUE)\b/i.test(upper);

  if (hasFoodMarkers) {
    return {
      isFragranceProduct: false,
      productType: "food_packaging",
      confidence: 0.98,
      rationale: "Detected food nutrition packaging rather than cosmetic or fragrance labeling."
    };
  }

  if (hasElectronicsMarkers) {
    return {
      isFragranceProduct: false,
      productType: "unrelated_product",
      confidence: 0.98,
      rationale: "Detected electronics or hardware technical markings rather than fragrance packaging."
    };
  }

  if (hasGenericDocumentMarkers) {
    return {
      isFragranceProduct: false,
      productType: "document_no_fragrance",
      confidence: 0.95,
      rationale: "Detected an administrative or business document with no cosmetic fragrance context."
    };
  }

  // 2. Perfume Packaging & Concentration Descriptors
  const hasFragranceKeywords = /\b(EAU\s+DE\s+PARFUM|EAU\s+DE\s+TOILETTE|EXTRAIT|EAU\s+DE\s+COLOGNE|BODY\s+MIST|SCENT\s+MIST|EAU\s+FRA[IÎ]CHE|PARFUM|PERFUME|COLOGNE|AFTERSHAVE|ATTAR|EAU\s+DE\s+TOILET|EDP|EDT|EDC)\b/i.test(upper);
  const hasFragranceSolvents = /\b(ALCOHOL\s+DENAT|SD\s+ALCOHOL|ETHANOL|DIPROPYLENE\s+GLYCOL)\b/i.test(upper);
  const hasCosmeticAllergens = /\b(LIMONENE|LINALOOL|COUMARIN|CITRONELLOL|GERANIOL|CITRAL|OAKMOSS|EUGENOL|FARNESOL|BENZYL\s+BENZOATE|ALPHA-ISOMETHYL\s+IONONE)\b/i.test(upper);
  const hasIngredientHeader = /\b(INGREDIENTS?|INHALTSSTOFFE|CONTIENT|CONTAINS|COMPOSITION)\b/i.test(upper);

  if (hasFragranceKeywords && (hasIngredientHeader || hasFragranceSolvents || hasCosmeticAllergens)) {
    return {
      isFragranceProduct: true,
      productType: hasIngredientHeader ? "fragrance_ingredient_label" : "perfume_box",
      confidence: 0.98,
      rationale: "Detected verified fragrance product labeling with formulation declarations and concentration markers."
    };
  }

  if (hasFragranceSolvents && hasCosmeticAllergens) {
    return {
      isFragranceProduct: true,
      productType: "fragrance_ingredient_label",
      confidence: 0.96,
      rationale: "Detected cosmetic fragrance solvent matrix and regulated aroma allergens."
    };
  }

  // Bottle front with just perfume name/concentration
  if (hasFragranceKeywords && !hasIngredientHeader && !hasCosmeticAllergens) {
    return {
      isFragranceProduct: true,
      productType: "perfume_bottle",
      confidence: 0.92,
      rationale: "Detected fragrance product presentation (bottle front or brand title) without ingredient declarations."
    };
  }

  // Cosmetic / Skincare label
  if (hasIngredientHeader || (hasCosmeticAllergens && upper.length > 30)) {
    return {
      isFragranceProduct: true,
      productType: "cosmetic_label",
      confidence: 0.88,
      rationale: "Detected cosmetic packaging ingredient declaration."
    };
  }

  // Unrelated or random image
  return {
    isFragranceProduct: false,
    productType: "random_object",
    confidence: 0.90,
    rationale: "This doesn't appear to be a fragrance product label. Please upload a clear image of a perfume, fragrance, or its ingredient label."
  };
}

/**
 * Detects whether an ingredient list is visible on a validated product image.
 * Prevents inventing ingredients when only the front of a bottle is uploaded.
 */
export function detectIngredientListVisibility(
  text: string,
  productVal: ProductValidationResult
): IngredientListVisibility {
  const upper = (text || "").toUpperCase();

  const hasHeader = upper.match(/\b(INGREDIENTS?|INGR[EÉ]DIENTS|CONTIENT|CONTAINS|COMPOSITION)\s*[:.\-]?/i);
  const recognizedCount = (upper.match(/\b(ALCOHOL\s+DENAT|AQUA|PARFUM|FRAGRANCE|LIMONENE|LINALOOL|COUMARIN|CITRONELLOL|GERANIOL|CITRAL|BHT|GLYCERIN)\b/gi) || []).length;

  if (hasHeader || recognizedCount >= 2) {
    return {
      visible: true,
      confidence: 0.96,
      headerFound: hasHeader ? hasHeader[0] : undefined
    };
  }

  // Product is recognized (e.g. perfume bottle front), but ingredients are missing
  if (productVal.isFragranceProduct && productVal.productType === "perfume_bottle") {
    return {
      visible: false,
      confidence: 0.92,
      guidanceMessage: "Product detected, but the ingredient list isn't visible. Ingredients rarely printed on front glass; capture box back or bottom label."
    };
  }

  return {
    visible: false,
    confidence: 0.85,
    guidanceMessage: "No cosmetic ingredient list detected. Please upload an image showing the INGREDIENTS declaration."
  };
}

/**
 * Locates and isolates the specific ingredient-list region within the text.
 */
export function detectIngredientRegion(text: string): {
  startIdx: number;
  endIdx: number;
  header: string | null;
  isolatedText: string;
} {
  if (!text) {
    return { startIdx: 0, endIdx: 0, header: null, isolatedText: "" };
  }

  const headerMatch = text.match(/(?:INGREDIENTS|INGR[EÉ]DIENTS|CONTIENT|CONTAINS|COMPOSITION)\s*[:.\-]/i);

  let startIdx = 0;
  let header: string | null = null;

  if (headerMatch && typeof headerMatch.index === "number") {
    startIdx = headerMatch.index + headerMatch[0].length;
    header = headerMatch[0];
  }

  let isolatedText = text.substring(startIdx);

  // Strip trailing packaging metadata (e.g., Made In, Batch, Barcodes, Company addresses)
  const footerIdx = isolatedText.search(/(?:MADE\s+IN|FABRIQU|DISTRIBUTED\s+BY|CAUTION|WARNING|BATCH|LOT|REF\.|KEEP\s+OUT\s+OF)/i);
  let endIdx = text.length;

  if (footerIdx > 30) {
    endIdx = startIdx + footerIdx;
    isolatedText = isolatedText.substring(0, footerIdx);
  }

  return {
    startIdx,
    endIdx,
    header,
    isolatedText: isolatedText.trim()
  };
}
