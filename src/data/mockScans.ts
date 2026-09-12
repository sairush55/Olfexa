import { AnalysisResult, ScanHistoryItem } from "@/types";
import { analyzeIngredientsList } from "@/lib/analysisEngine";

export const SAMPLE_SCAN_TRADITIONAL: AnalysisResult = analyzeIngredientsList(
  [
    "ALCOHOL DENAT.",
    "AQUA / WATER / EAU",
    "PARFUM / FRAGRANCE",
    "LIMONENE",
    "LINALOOL",
    "COUMARIN",
    "BHT",
    "ETHYLHEXYL METHOXYCINNAMATE"
  ],
  "L'Ambre Sublime Eau de Parfum",
  "Maison de L'Arôme",
  [
    {
      id: "w-1",
      ingredientName: "COUMARIN",
      reason: "Known contact sensitivity history",
      sensitivityLevel: "moderate",
      addedAt: "2026-08-10"
    }
  ]
);

SAMPLE_SCAN_TRADITIONAL.provenance = {
  isPerfume: true,
  fragranceType: "Eau de Parfum",
  confidence: 0.94,
  detectionReason: "Detected 'Eau de Parfum' concentration descriptor, alcohol denat solvent matrix, and regulatory allergen disclosures.",
  imageQuality: {
    rating: "HIGH",
    clarityScore: 94,
    dimensions: { width: 1440, height: 1080, format: "png" },
    warnings: [],
    isBlurry: false,
    hasSufficientResolution: true,
    recommendation: "Image clarity is optimal for reliable INCI ingredient recognition."
  },
  relevance: {
    isRelevant: true,
    status: "VERIFIED_FRAGRANCE_LABEL",
    classificationName: "Verified Fragrance Product / Ingredient Label",
    rationale: "Detected declared perfume concentration descriptors, cosmetic solvent matrix, and regulated fragrance allergens."
  },
  manufacturingInfo: {
    dateOfManufacture: "2024-04-12",
    batchCode: "B24M09",
    periodAfterOpening: "36M",
    expiryDate: "2029-04"
  },
  companyDetails: {
    brandName: "Maison de L'Arôme",
    manufacturer: "Arôme Parfums S.A.S.",
    distributor: "Haute Parfumerie Distribution Worldwide"
  },
  companyAddress: {
    fullAddress: "33 Avenue Hoche, 75008 Paris, France",
    countryOfOrigin: "Made in France",
    responsiblePersonEU: "Cosmetic Regulatory Services EU (Bruxelles)"
  }
};

export const SAMPLE_SCAN_ALCOHOL_FREE: AnalysisResult = analyzeIngredientsList(
  [
    "AQUA / WATER / EAU",
    "GLYCERIN",
    "PARFUM / FRAGRANCE",
    "CETYL ALCOHOL",
    "CITRONELLOL",
    "GERANIOL"
  ],
  "Pure Botanica Hydrating Scent Mist",
  "Élixir Botanique"
);

SAMPLE_SCAN_ALCOHOL_FREE.provenance = {
  isPerfume: true,
  fragranceType: "Body Mist / Fine Scent",
  confidence: 0.91,
  detectionReason: "Water/Glycerin carrier base with fragrance compound formulation and INCI cosmetic declarations.",
  imageQuality: {
    rating: "HIGH",
    clarityScore: 91,
    dimensions: { width: 1280, height: 960, format: "jpeg" },
    warnings: [],
    isBlurry: false,
    hasSufficientResolution: true,
    recommendation: "Image clarity is optimal for reliable INCI ingredient recognition."
  },
  relevance: {
    isRelevant: true,
    status: "VERIFIED_FRAGRANCE_LABEL",
    classificationName: "Verified Fragrance Formulation",
    rationale: "Water/Glycerin carrier base with fragrance compound formulation and INCI cosmetic declarations."
  },
  manufacturingInfo: {
    dateOfManufacture: "2024-01-20",
    batchCode: "AF-902",
    periodAfterOpening: "24M"
  },
  companyDetails: {
    brandName: "Élixir Botanique",
    manufacturer: "BioCleanse Laboratories"
  },
  companyAddress: {
    fullAddress: "12 Grasse Way, 06130 Grasse, France",
    countryOfOrigin: "France"
  }
};

export const SAMPLE_SCAN_OAKMOSS: AnalysisResult = analyzeIngredientsList(
  [
    "ALCOHOL",
    "AQUA / WATER / EAU",
    "PARFUM / FRAGRANCE",
    "EVERNIA PRUNASTRI (OAKMOSS) EXTRACT",
    "LIMONENE",
    "LINALOOL",
    "CITRONELLOL"
  ],
  "Fougère Royale No. 12",
  "Atelier Herbier"
);

SAMPLE_SCAN_OAKMOSS.provenance = {
  isPerfume: true,
  fragranceType: "Extrait de Parfum",
  confidence: 0.96,
  detectionReason: "Concentrated ethanol base with natural oakmoss extract (Evernia prunastri) and IFRA allergen transparency list.",
  imageQuality: {
    rating: "HIGH",
    clarityScore: 96,
    dimensions: { width: 1920, height: 1080, format: "png" },
    warnings: [],
    isBlurry: false,
    hasSufficientResolution: true,
    recommendation: "Image clarity is optimal for reliable INCI ingredient recognition."
  },
  relevance: {
    isRelevant: true,
    status: "VERIFIED_FRAGRANCE_LABEL",
    classificationName: "Verified Fragrance Product / Ingredient Label",
    rationale: "Concentrated ethanol base with natural oakmoss extract (Evernia prunastri) and IFRA allergen transparency list."
  },
  manufacturingInfo: {
    dateOfManufacture: "2023-11-05",
    batchCode: "FRN-1204",
    periodAfterOpening: "36M"
  },
  companyDetails: {
    brandName: "Atelier Herbier",
    manufacturer: "Atelier Herbier Parfums"
  },
  companyAddress: {
    fullAddress: "7 Place Vendôme, 75001 Paris, France",
    countryOfOrigin: "France"
  }
};

export const INITIAL_SCAN_HISTORY: ScanHistoryItem[] = [
  {
    id: SAMPLE_SCAN_TRADITIONAL.id,
    perfumeName: SAMPLE_SCAN_TRADITIONAL.perfumeName,
    brandName: SAMPLE_SCAN_TRADITIONAL.brandName,
    date: "2026-09-11T14:30:00Z",
    alcoholStatus: SAMPLE_SCAN_TRADITIONAL.alcoholStatus,
    allergenCount: SAMPLE_SCAN_TRADITIONAL.potentialAllergens.length,
    irritantCount: SAMPLE_SCAN_TRADITIONAL.potentialIrritants.length,
    watchlistMatchCount: SAMPLE_SCAN_TRADITIONAL.watchlistMatches.length,
    transparencyRating: SAMPLE_SCAN_TRADITIONAL.transparencyRating,
  },
  {
    id: SAMPLE_SCAN_ALCOHOL_FREE.id,
    perfumeName: SAMPLE_SCAN_ALCOHOL_FREE.perfumeName,
    brandName: SAMPLE_SCAN_ALCOHOL_FREE.brandName,
    date: "2026-09-08T09:15:00Z",
    alcoholStatus: SAMPLE_SCAN_ALCOHOL_FREE.alcoholStatus,
    allergenCount: SAMPLE_SCAN_ALCOHOL_FREE.potentialAllergens.length,
    irritantCount: SAMPLE_SCAN_ALCOHOL_FREE.potentialIrritants.length,
    watchlistMatchCount: SAMPLE_SCAN_ALCOHOL_FREE.watchlistMatches.length,
    transparencyRating: SAMPLE_SCAN_ALCOHOL_FREE.transparencyRating,
  },
  {
    id: SAMPLE_SCAN_OAKMOSS.id,
    perfumeName: SAMPLE_SCAN_OAKMOSS.perfumeName,
    brandName: SAMPLE_SCAN_OAKMOSS.brandName,
    date: "2026-08-27T18:45:00Z",
    alcoholStatus: SAMPLE_SCAN_OAKMOSS.alcoholStatus,
    allergenCount: SAMPLE_SCAN_OAKMOSS.potentialAllergens.length,
    irritantCount: SAMPLE_SCAN_OAKMOSS.potentialIrritants.length,
    watchlistMatchCount: SAMPLE_SCAN_OAKMOSS.watchlistMatches.length,
    transparencyRating: SAMPLE_SCAN_OAKMOSS.transparencyRating,
  }
];

export const MOCK_SCANS_LOOKUP: Record<string, AnalysisResult> = {
  [SAMPLE_SCAN_TRADITIONAL.id]: SAMPLE_SCAN_TRADITIONAL,
  [SAMPLE_SCAN_ALCOHOL_FREE.id]: SAMPLE_SCAN_ALCOHOL_FREE,
  [SAMPLE_SCAN_OAKMOSS.id]: SAMPLE_SCAN_OAKMOSS,
  "demo": SAMPLE_SCAN_TRADITIONAL,
  "sample-1": SAMPLE_SCAN_TRADITIONAL,
  "sample-2": SAMPLE_SCAN_ALCOHOL_FREE,
  "sample-3": SAMPLE_SCAN_OAKMOSS,
};
