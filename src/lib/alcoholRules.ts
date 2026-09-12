import { AlcoholStatus, DetectedAlcohol, AlcoholType } from "@/types";
import { OLFEXA_DATASET as dataset } from "@/data/olfexaDataset";

interface AlcoholRuleDefinition {
  pattern: RegExp;
  inciName: string;
  type: AlcoholType;
  label: string;
  scientificContext: string;
  isFattyAlcohol: boolean;
}

// Derived from official OLFEXA v0.1 alcohol rules
const POSITIVE_MATCHES_LOWER = dataset.alcohol_rules.positive_matches.map((m) => m.toLowerCase());

const STRUCTURED_ALCOHOL_RULES: AlcoholRuleDefinition[] = [
  {
    pattern: /^(ALCOHOL\s+DENAT\.?|SD\s+ALCOHOL(\s+[0-9A-Z-]+)?|DENATURED\s+ALCOHOL)/i,
    inciName: "Alcohol Denat.",
    type: "denatured_alcohol",
    label: "Denatured Ethyl Alcohol",
    scientificContext: "Ethyl alcohol rendered unpalatable with denaturants. Primary volatile fragrance solvent.",
    isFattyAlcohol: false,
  },
  {
    pattern: /^(ALCOHOL|ETHANOL|ETHYL\s+ALCOHOL)$/i,
    inciName: "Alcohol / Ethanol",
    type: "ethanol",
    label: "Ethyl Alcohol (Ethanol)",
    scientificContext: "Grain/agricultural ethyl alcohol. Volatile fragrance carrier.",
    isFattyAlcohol: false,
  },
  {
    pattern: /^(ISOPROPYL\s+ALCOHOL|ISOPROPANOL)$/i,
    inciName: "Isopropyl Alcohol",
    type: "other",
    label: "Isopropyl Alcohol",
    scientificContext: "Secondary aliphatic alcohol utilized as a volatile extraction solvent.",
    isFattyAlcohol: false,
  },
  {
    pattern: /^(BENZYL\s+ALCOHOL)/i,
    inciName: "Benzyl Alcohol",
    type: "aromatic_alcohol",
    label: "Benzyl Alcohol",
    scientificContext: "Aromatic alcohol functioning as a natural scent constituent, preservative, and EU-regulated allergen.",
    isFattyAlcohol: false,
  },
  {
    pattern: /^(CINNAMYL\s+ALCOHOL|AMYLCINNAMYL\s+ALCOHOL|ANISYL\s+ALCOHOL)/i,
    inciName: "Aromatic Scent Alcohol",
    type: "aromatic_alcohol",
    label: "Aromatic Fragrance Alcohol",
    scientificContext: "Aromatic alcohol providing balsamic or floral scent notes. Regulated EU fragrance allergen.",
    isFattyAlcohol: false,
  },
  {
    pattern: /^(CETYL\s+ALCOHOL|STEARYL\s+ALCOHOL|CETEARYL\s+ALCOHOL|MYRISTYL\s+ALCOHOL|BEHENYL\s+ALCOHOL|LAURYL\s+ALCOHOL)/i,
    inciName: "Fatty Alcohol Compound",
    type: "fatty_alcohol",
    label: "Fatty Alcohol (Emollient / Waxy Lipid)",
    scientificContext: "Long-chain fatty alcohol. Chemically distinct from volatile ethyl alcohol; functions as a non-drying emollient or thickener.",
    isFattyAlcohol: true,
  },
];

export interface AlcoholDetectionEvaluation {
  status: AlcoholStatus;
  statusExplanation: string;
  detectedAlcohols: DetectedAlcohol[];
}

export function evaluateAlcoholPresence(ingredients: string[]): AlcoholDetectionEvaluation {
  if (!ingredients || ingredients.length === 0) {
    return {
      status: "UNABLE_TO_CONFIRM",
      statusExplanation: "Unable to confirm from the available ingredient information.",
      detectedAlcohols: [],
    };
  }

  const detected: DetectedAlcohol[] = [];

  for (const raw of ingredients) {
    const trimmed = raw.trim();
    const lower = trimmed.toLowerCase();

    // 1. Check structured rules
    let matchedRule = false;
    for (const rule of STRUCTURED_ALCOHOL_RULES) {
      if (rule.pattern.test(trimmed)) {
        detected.push({
          inciName: trimmed,
          type: rule.type,
          label: rule.label,
          scientificContext: rule.scientificContext,
          isFattyAlcohol: rule.isFattyAlcohol,
        });
        matchedRule = true;
        break;
      }
    }

    // 2. Cross-check against dataset positive alcohol list if not already caught
    if (!matchedRule && POSITIVE_MATCHES_LOWER.includes(lower)) {
      detected.push({
        inciName: trimmed,
        type: "ethanol",
        label: "Recognized Alcohol Compound",
        scientificContext: "Identified against the official OLFEXA positive alcohol matches database.",
        isFattyAlcohol: false,
      });
    }
  }

  if (detected.length > 0) {
    const onlyFatty = detected.every((a) => a.isFattyAlcohol);
    if (onlyFatty) {
      return {
        status: "CONTAINS_ALCOHOL",
        statusExplanation: "Fatty alcohol detected. Note: This is an emollient lipid (e.g. Cetyl or Cetearyl alcohol) and does not exhibit the volatile drying properties of traditional ethyl alcohol.",
        detectedAlcohols: detected,
      };
    }

    return {
      status: "CONTAINS_ALCOHOL",
      statusExplanation: "Alcohol ingredient detected in the declared ingredient list.",
      detectedAlcohols: detected,
    };
  }

  return {
    status: "NO_RECOGNIZED_ALCOHOL_DETECTED",
    statusExplanation: "No recognized alcohol ingredient detected in the provided ingredient information.",
    detectedAlcohols: [],
  };
}
