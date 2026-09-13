/**
 * OLFEXA — Product Link Intelligence Types
 */

export interface FragranceNotes {
  top?: string[];
  heart?: string[];
  base?: string[];
}

export interface ProductPageData {
  sourceUrl: string;
  productName?: string;
  brand?: string;
  description?: string;
  imageUrl?: string;
  fragranceNotes?: FragranceNotes;
  ingredientsText?: string;
  ingredients: string[];
  concentration?: string;
  productType?: string;
  size?: string;
  claims?: string[];
  extractionConfidence?: number;
}

export interface ProductLinkAnalysisResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: ProductPageData;
  candidates?: string[];
  hasIngredients: boolean;
}
