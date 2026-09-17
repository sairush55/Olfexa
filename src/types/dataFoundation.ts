import { IngredientCategory, AlcoholType, EvidenceSource } from "./index";

export type SupportedRegion = "EU" | "IN" | "US" | "GLOBAL";

export type RegulatoryStatus = 
  | "PERMITTED" 
  | "RESTRICTED" 
  | "REQUIRES_DECLARATION" 
  | "PROHIBITED" 
  | "NO_SPECIFIC_REGULATION"
  | "INSUFFICIENT_DATA";

export interface SourceAttribution {
  dataset: "CosIng" | "INCIDB" | "OpenBeautyFacts" | "CDSCO" | "IFRA" | "FDA" | "ScientificLiterature";
  sourceName: string;
  sourceUrl: string;
  region: SupportedRegion;
  license: string;
  retrievedDate: string;
  notes?: string;
}

export interface RegionalRegulatoryRecord {
  region: SupportedRegion;
  regulatoryBody: "European Commission (EU)" | "CDSCO / BIS (India)" | "US FDA (United States)" | "IFRA (Global)";
  status: RegulatoryStatus;
  statusSummary: string;
  thresholdOrLimit?: string;
  officialReference: string;
  citationUrl?: string;
  conditionsOfUse?: string;
}

export interface CanonicalIngredient {
  id: string;
  inciName: string;
  commonNames: string[];
  synonyms: string[];
  casNumber?: string;
  ecNumber?: string;
  category: IngredientCategory;
  functions: string[];
  isAlcohol: boolean;
  alcoholType?: AlcoholType;
  isEuAllergen: boolean;
  isPotentialIrritant: boolean;
  description: string;
  potentialConcerns?: string;
  sources: SourceAttribution[];
  regionalRegulations: Partial<Record<SupportedRegion, RegionalRegulatoryRecord>>;
  evidence: EvidenceSource[];
  createdAt: string;
  updatedAt: string;
}

export interface RawStagingRecord {
  rawName: string;
  commonName?: string;
  synonyms?: string[];
  cas?: string;
  ec?: string;
  category?: string;
  functions?: string[];
  isAlcohol?: boolean;
  alcoholType?: string;
  isEuAllergen?: boolean;
  isPotentialIrritant?: boolean;
  notes?: string;
  dataset: SourceAttribution["dataset"];
  sourceName: string;
  sourceUrl: string;
  region: SupportedRegion;
  license: string;
}
