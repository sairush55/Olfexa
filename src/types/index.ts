export type AlcoholStatus = 
  | 'CONTAINS_ALCOHOL' 
  | 'NO_RECOGNIZED_ALCOHOL_DETECTED'
  | 'NO_RECOGNIZED_ALCOHOL' 
  | 'UNABLE_TO_CONFIRM'
  | 'INSUFFICIENT_INFO';

export type AlcoholType = 
  | 'ethanol' 
  | 'denatured_alcohol' 
  | 'fatty_alcohol' 
  | 'aromatic_alcohol' 
  | 'other';

export type IngredientCategory = 
  | 'carrier' 
  | 'fragrance_compound' 
  | 'preservative' 
  | 'solvent' 
  | 'uv_filter' 
  | 'antioxidant' 
  | 'fixative' 
  | 'emulsifier' 
  | 'surfactant'
  | 'other';

export type TransparencyRating = 'HIGH' | 'MODERATE' | 'LIMITED';

export interface EvidenceSource {
  id: string;
  title: string;
  organization: 'IFRA' | 'EU SCCS' | 'CIR' | 'PubMed' | 'FDA' | 'ECHA' | 'CosIng';
  citationUrl?: string;
  publicationYear?: number;
  keyFindings: string;
}

export interface Ingredient {
  id: string;
  inciName: string;
  commonName?: string;
  casNumber?: string;
  category: IngredientCategory;
  isAlcohol: boolean;
  alcoholType?: AlcoholType;
  isEuAllergen: boolean;
  isPotentialIrritant: boolean;
  description: string;
  potentialConcerns?: string;
  transparencyNotes?: string;
  evidence: EvidenceSource[];
}

export interface DetectedAlcohol {
  inciName: string;
  type: AlcoholType;
  label: string;
  scientificContext: string;
  isFattyAlcohol: boolean;
}

export interface AnalyzedIngredient {
  rawInput: string;
  matchedInci?: string;
  commonName?: string;
  category: IngredientCategory;
  status: 'DETECTED' | 'FLAGGED_ALLERGEN' | 'FLAGGED_IRRITANT' | 'FLAGGED_ALCOHOL' | 'WATCHLIST_MATCH' | 'NEUTRAL';
  isAlcohol: boolean;
  alcoholType?: AlcoholType;
  isEuAllergen: boolean;
  isPotentialIrritant: boolean;
  isWatchlistMatch: boolean;
  description: string;
  whyFlagged?: string;
  evidence: EvidenceSource[];
  order: number;
}

export interface FragranceFingerprint {
  carrierSolventsPercent: number;
  fragranceCompoundsPercent: number;
  preservativesPercent: number;
  antioxidantsFiltersPercent: number;
  unclassifiedPercent: number;
  topFamilies: string[];
}

export type ImageQualityRating = "HIGH" | "ACCEPTABLE" | "POOR";

export interface ImageQualityAssessment {
  rating: ImageQualityRating;
  clarityScore: number; // 0 - 100
  dimensions?: { width: number; height: number; format?: string };
  fileSizeBytes?: number;
  warnings: string[];
  isBlurry: boolean;
  hasSufficientResolution: boolean;
  recommendation: string;
}

export type ProductRelevanceStatus = 
  | "VERIFIED_FRAGRANCE_LABEL"
  | "GENERAL_COSMETIC_LABEL"
  | "NON_FRAGRANCE_PRODUCT"
  | "UNCLEAR_OR_IRRELEVANT";

export interface ProductRelevanceAssessment {
  isRelevant: boolean;
  status: ProductRelevanceStatus;
  classificationName: string;
  rationale: string;
}

export interface OcrManufacturingInfo {
  dateOfManufacture?: string;
  batchCode?: string;
  periodAfterOpening?: string;
  expiryDate?: string;
}

export interface OcrManufacturerInfo {
  brandName?: string;
  manufacturer?: string;
  distributor?: string;
  fullAddress?: string;
  countryOfOrigin?: string;
  responsiblePersonEU?: string;
}

export interface OcrOtherSpecs {
  fragranceType?: string;
  volume?: string;
  alcoholVol?: string;
  safetyWarnings?: string[];
  barcodeRef?: string;
}

export interface CategorizedOcrExtraction {
  ingredients: ExtractedOcrIngredient[];
  mfg: OcrManufacturingInfo;
  mfgBy: OcrManufacturerInfo;
  others: OcrOtherSpecs;
}

export interface PackagingProvenance {
  isPerfume: boolean;
  fragranceType?: string;
  confidence: number;
  detectionReason: string;
  imageQuality?: ImageQualityAssessment;
  relevance?: ProductRelevanceAssessment;
  manufacturingInfo: OcrManufacturingInfo;
  companyDetails: {
    brandName?: string;
    manufacturer?: string;
    distributor?: string;
  };
  companyAddress: {
    fullAddress?: string;
    countryOfOrigin?: string;
    responsiblePersonEU?: string;
  };
  others?: OcrOtherSpecs;
  categorized?: CategorizedOcrExtraction;
}

export interface StructuredOcrExtraction {
  isPerfume: boolean;
  fragranceType?: string;
  detectionReason: string;
  confidence: number;
  rawText: string;
  candidates: string[];
  imageQuality?: ImageQualityAssessment;
  relevance?: ProductRelevanceAssessment;
  manufacturingInfo: OcrManufacturingInfo;
  companyDetails: {
    brandName?: string;
    manufacturer?: string;
    distributor?: string;
  };
  companyAddress: {
    fullAddress?: string;
    countryOfOrigin?: string;
    responsiblePersonEU?: string;
  };
  others?: OcrOtherSpecs;
  categorized?: CategorizedOcrExtraction;
}

export interface AnalysisResult {
  id: string;
  perfumeName: string;
  brandName?: string;
  scanDate: string;
  imageUrl?: string;
  rawOcrText?: string;
  alcoholStatus: AlcoholStatus;
  alcoholStatusExplanation: string;
  detectedAlcohols: DetectedAlcohol[];
  ingredientsFound: AnalyzedIngredient[];
  potentialAllergens: AnalyzedIngredient[];
  potentialIrritants: AnalyzedIngredient[];
  watchlistMatches: AnalyzedIngredient[];
  transparencyRating: TransparencyRating;
  transparencyNotes: string;
  fragranceFingerprint: FragranceFingerprint;
  disclaimer: string;
  provenance?: PackagingProvenance;
  imageQuality?: ImageQualityAssessment;
  relevance?: ProductRelevanceAssessment;
  suitabilityProfile?: SuitabilityProfile;
}

// ==============================================================================
// 1. VISION / OCR PIPELINE TYPES (Strict non-medical extraction layer)
// ==============================================================================

export type VisionOcrStatus =
  | "REJECTED_WRONG_PRODUCT"
  | "IMAGE_TOO_BLURRY"
  | "IMAGE_TOO_DARK"
  | "IMAGE_TOO_BRIGHT"
  | "IMAGE_TOO_SMALL"
  | "IMAGE_LOW_CONTRAST"
  | "IMAGE_ROTATED"
  | "IMAGE_PERSPECTIVE_DISTORTED"
  | "INGREDIENT_LIST_NOT_VISIBLE"
  | "INGREDIENT_LIST_PARTIALLY_VISIBLE"
  | "OCR_LOW_CONFIDENCE"
  | "READY_FOR_REVIEW"
  | "READY_FOR_ANALYSIS";

export interface ExtractedOcrIngredient {
  name: string;
  confidence: number; // 0.0 - 1.0
  needsReview: boolean; // true if confidence < 0.75 or ambiguous character
  rawDetected?: string;
}

export interface ProductValidationResult {
  isFragranceProduct: boolean;
  productType:
    | "perfume_bottle"
    | "perfume_box"
    | "fragrance_ingredient_label"
    | "cosmetic_label"
    | "unrelated_product"
    | "food_packaging"
    | "document_no_fragrance"
    | "human_photo"
    | "random_object";
  confidence: number;
  rationale: string;
}

export interface ImageQualityEvaluation {
  status: "GOOD" | "BLURRY" | "TOO_DARK" | "TOO_BRIGHT" | "LOW_RESOLUTION" | "LOW_CONTRAST" | "ROTATED" | "PERSPECTIVE_DISTORTED" | "PARTIALLY_CUT_OFF" | "UNREADABLE";
  confidence: number;
  isBlurry: boolean;
  isTooDark: boolean;
  isTooBright: boolean;
  isTooSmall: boolean;
  isLowContrast?: boolean;
  isRotated?: boolean;
  isPerspectiveDistorted?: boolean;
  isPartiallyCutOff: boolean;
  clarityScore: number; // 0 - 100
  dimensions?: { width: number; height: number };
  issues: string[];
  actionableGuidance: string;
}

export interface IngredientListVisibility {
  visible: boolean;
  confidence: number;
  headerFound?: string; // e.g. "INGREDIENTS:", "CONTAINS:", "COMPOSITION:"
  guidanceMessage?: string;
}

export interface VisionOcrResponse {
  productValidation: ProductValidationResult;
  imageQuality: ImageQualityEvaluation;
  ingredientList: IngredientListVisibility;
  rawIngredientText: string;
  ingredients: ExtractedOcrIngredient[];
  overallConfidence: number;
  status: VisionOcrStatus;
  message?: string;
  manufacturingInfo?: OcrManufacturingInfo;
  companyDetails?: {
    brandName?: string;
    manufacturer?: string;
    distributor?: string;
  };
  companyAddress?: {
    fullAddress?: string;
    countryOfOrigin?: string;
    responsiblePersonEU?: string;
  };
  others?: OcrOtherSpecs;
  categorized?: CategorizedOcrExtraction;
}

// ==============================================================================
// 2. EVIDENCE-BASED SUITABILITY PROFILE TYPES (Post-Verification Rules Layer)
// ==============================================================================

export type SuitabilityUserGroup =
  | "children"
  | "adults"
  | "fragranceSensitiveUsers"
  | "sensitiveSkin"
  | "pregnancy"
  | "breastfeeding";

export type SuitabilityStatus =
  | "LOW_CONCERN_BASED_ON_AVAILABLE_DATA"
  | "ADDITIONAL_CAUTION"
  | "REQUIRES_MORE_INFORMATION"
  | "INSUFFICIENT_EVIDENCE"
  | "NOT_ENOUGH_INFORMATION_TO_ASSESS"
  | "REQUIRES_REVIEW";

export interface UserGroupSuitability {
  group: SuitabilityUserGroup;
  displayName: string;
  icon: string; // e.g. "👶", "👤", "🌿", "🌸", "🤰", "🤱"
  status: SuitabilityStatus;
  statusLabel: string;
  reasonCodes: string[];
  contributingIngredients: string[];
  evidence: EvidenceSource[];
  explanation: string;
  limitations: string;
}

export interface SuitabilityProfile {
  groups: Record<SuitabilityUserGroup, UserGroupSuitability>;
  overallTransparencyNote: string;
  hasIncompleteIngredients: boolean;
  hasUnknownIngredients: boolean;
  unknownIngredientsCount: number;
}


export interface WatchlistItem {
  id: string;
  ingredientName: string;
  reason?: string;
  sensitivityLevel: 'mild' | 'moderate' | 'strict';
  addedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  fragranceExperience: 'curious' | 'enthusiast' | 'sensitive_skin' | 'collector';
  sensitivities: string[];
  createdAt: string;
}

export interface ScanHistoryItem {
  id: string;
  perfumeName: string;
  brandName?: string;
  date: string;
  alcoholStatus: AlcoholStatus;
  allergenCount: number;
  irritantCount: number;
  watchlistMatchCount: number;
  transparencyRating: TransparencyRating;
  imageUrl?: string;
}
