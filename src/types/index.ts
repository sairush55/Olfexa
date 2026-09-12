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

export interface PackagingProvenance {
  isPerfume: boolean;
  fragranceType?: string;
  confidence: number;
  detectionReason: string;
  imageQuality?: ImageQualityAssessment;
  relevance?: ProductRelevanceAssessment;
  manufacturingInfo: {
    dateOfManufacture?: string;
    batchCode?: string;
    periodAfterOpening?: string;
    expiryDate?: string;
  };
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
  manufacturingInfo: {
    dateOfManufacture?: string;
    batchCode?: string;
    periodAfterOpening?: string;
    expiryDate?: string;
  };
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
