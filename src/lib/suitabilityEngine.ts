import { 
  AnalyzedIngredient, 
  SuitabilityProfile, 
  SuitabilityUserGroup, 
  UserGroupSuitability, 
  EvidenceSource, 
  AlcoholStatus 
} from "@/types";

/**
 * EVIDENCE-BASED SUITABILITY RULES LAYER
 * 
 * CORE PRINCIPLE:
 * Verified Ingredients -> Knowledge Base -> Evidence -> Analysis Rules -> Suitability Rules -> Suitability Profile
 * 
 * Strict Policy:
 * 1. Operates ONLY on verified, normalized ingredients.
 * 2. Never creates absolute medical conclusions ("safe" / "unsafe").
 * 3. Returns INSUFFICIENT_EVIDENCE if no authoritative data exists.
 */

const SCCS_ALLERGEN_EVIDENCE: EvidenceSource = {
  id: "sccs-1459-11",
  title: "Opinion on Fragrance Allergens in Cosmetic Products (SCCS/1459/11)",
  organization: "EU SCCS",
  publicationYear: 2012,
  citationUrl: "https://health.ec.europa.eu/scientific-committees/scientific-committee-consumer-safety-sccs_en",
  keyFindings: "Identified 26 established contact allergens and recommended quantitative concentration disclosure thresholds on consumer packaging."
};

const SCCS_CHILDREN_EVIDENCE: EvidenceSource = {
  id: "sccs-1501-12",
  title: "Guidance on the Safety Assessment of Cosmetics for Children (SCCS/1501/12)",
  organization: "EU SCCS",
  publicationYear: 2013,
  citationUrl: "https://health.ec.europa.eu/scientific-committees/scientific-committee-consumer-safety-sccs_en",
  keyFindings: "Pediatric skin has higher surface area-to-body weight ratios and developing barrier lipid structures, warranting additional consideration for volatile carriers and strong sensitizers."
};

const CIR_ALCOHOL_EVIDENCE: EvidenceSource = {
  id: "cir-alcohol-denat",
  title: "Safety Assessment of Alcohol Denat. in Cosmetics",
  organization: "CIR",
  publicationYear: 2014,
  citationUrl: "https://www.cir-safety.org",
  keyFindings: "Ethanol and Alcohol Denat. act as volatile penetration enhancers and rapid-evaporating solvents, which may induce transient barrier dryness on compromised or sensitive skin."
};

const IFRA_STANDARDS_EVIDENCE: EvidenceSource = {
  id: "ifra-standards-51",
  title: "IFRA 51st Amendment Standards for Safe Fragrance Use",
  organization: "IFRA",
  publicationYear: 2023,
  citationUrl: "https://ifrafragrance.org/safe-use/standards-documentation",
  keyFindings: "Establishes category-specific maximum allowable concentration thresholds for individual fragrance materials to prevent dermal sensitization."
};

export function generateSuitabilityProfile(
  ingredients: AnalyzedIngredient[],
  alcoholStatus: AlcoholStatus,
  hasIncompleteList: boolean = false
): SuitabilityProfile {
  const verifiedCount = ingredients.length;
  const unknownIngredients = ingredients.filter(i => i.category === "other" && (!i.matchedInci || i.matchedInci.trim() === ""));
  const unknownCount = unknownIngredients.length;

  const allergens = ingredients.filter(i => i.isEuAllergen);
  const volatileAlcohols = ingredients.filter(i => i.isAlcohol && (i.alcoholType === "ethanol" || i.alcoholType === "denatured_alcohol"));
  const irritants = ingredients.filter(i => i.isPotentialIrritant);

  // 1. Children Assessment
  let childrenSuitability: UserGroupSuitability;
  if (volatileAlcohols.length > 0 || allergens.length >= 2) {
    const contributing = [
      ...volatileAlcohols.map(a => a.matchedInci || a.rawInput),
      ...allergens.map(a => a.matchedInci || a.rawInput)
    ];
    childrenSuitability = {
      group: "children",
      displayName: "Children & Younger Users",
      icon: "👶",
      status: "ADDITIONAL_CAUTION",
      statusLabel: "Additional Caution Recommended",
      reasonCodes: ["VOLATILE_SOLVENT_DETECTED", "DECLARED_ALLERGENS_PRESENT"],
      contributingIngredients: Array.from(new Set(contributing)),
      evidence: [SCCS_CHILDREN_EVIDENCE, SCCS_ALLERGEN_EVIDENCE],
      explanation: "The verified ingredient information contains volatile alcohol carriers and declared fragrance allergens. Younger skin exhibits developing barrier lipids and higher surface-area-to-weight ratios, making additional consideration appropriate.",
      limitations: "Cosmetic labels declare constituent presence but do not specify finished concentration percentages, exact age suitability, or intended dosage."
    };
  } else if (verifiedCount > 0 && allergens.length === 0 && volatileAlcohols.length === 0) {
    childrenSuitability = {
      group: "children",
      displayName: "Children & Younger Users",
      icon: "👶",
      status: "LOW_CONCERN_BASED_ON_AVAILABLE_DATA",
      statusLabel: "Lower Concern Based on Disclosed Formula",
      reasonCodes: ["ALCOHOL_FREE_MATRIX", "NO_DECLARED_ALLERGENS"],
      contributingIngredients: [],
      evidence: [SCCS_CHILDREN_EVIDENCE],
      explanation: "No volatile alcohol solvents or declared EU Annex III allergens were matched in the verified ingredient listing.",
      limitations: "General cosmetic formulations are not tested or approved as pediatric medicines."
    };
  } else {
    childrenSuitability = {
      group: "children",
      displayName: "Children & Younger Users",
      icon: "👶",
      status: "INSUFFICIENT_EVIDENCE",
      statusLabel: "Insufficient Evidence to Assess",
      reasonCodes: ["LIMITED_LABEL_DISCLOSURE"],
      contributingIngredients: [],
      evidence: [SCCS_CHILDREN_EVIDENCE],
      explanation: "OLFEXA does not have sufficient verified ingredient evidence to determine suitability considerations for this group.",
      limitations: "Assessment is strictly limited to visible packaging disclosures."
    };
  }

  // 2. Fragrance-Sensitive Users
  let fragranceSensitiveSuitability: UserGroupSuitability;
  if (allergens.length > 0) {
    fragranceSensitiveSuitability = {
      group: "fragranceSensitiveUsers",
      displayName: "Fragrance-Sensitive Individuals",
      icon: "🌿",
      status: "ADDITIONAL_CAUTION",
      statusLabel: "Potential Sensitivity Consideration",
      reasonCodes: ["DECLARED_EU_ALLERGENS_DETECTED"],
      contributingIngredients: allergens.map(a => a.matchedInci || a.rawInput),
      evidence: [SCCS_ALLERGEN_EVIDENCE, IFRA_STANDARDS_EVIDENCE],
      explanation: `${allergens.length} recognized cosmetic fragrance ingredient(s) associated with contact sensitization under EU Cosmetics Regulation No 1223/2009 were detected.`,
      limitations: "Sensitization reactions depend on individual threshold history; presence does not guarantee an adverse reaction for every user."
    };
  } else {
    fragranceSensitiveSuitability = {
      group: "fragranceSensitiveUsers",
      displayName: "Fragrance-Sensitive Individuals",
      icon: "🌿",
      status: "LOW_CONCERN_BASED_ON_AVAILABLE_DATA",
      statusLabel: "No Declared Annex III Allergens Detected",
      reasonCodes: ["NO_DECLARED_ALLERGENS"],
      contributingIngredients: [],
      evidence: [SCCS_ALLERGEN_EVIDENCE],
      explanation: "No declared EU Annex III regulated fragrance allergens were identified in the verified formulation breakdown.",
      limitations: "Unlisted proprietary fragrance aroma compounds under 'Parfum' may still possess individual scent profiles."
    };
  }

  // 3. Sensitive / Reactive Skin
  let sensitiveSkinSuitability: UserGroupSuitability;
  if (volatileAlcohols.length > 0 || irritants.length > 0) {
    const contributing = [
      ...volatileAlcohols.map(a => a.matchedInci || a.rawInput),
      ...irritants.map(i => i.matchedInci || i.rawInput)
    ];
    sensitiveSkinSuitability = {
      group: "sensitiveSkin",
      displayName: "Sensitive & Reactive Skin",
      icon: "🌸",
      status: "ADDITIONAL_CAUTION",
      statusLabel: "Additional Caution (Drying Solvent Matrix)",
      reasonCodes: ["VOLATILE_DRYING_SOLVENT", "POTENTIAL_BARRIER_IRRITATION"],
      contributingIngredients: Array.from(new Set(contributing)),
      evidence: [CIR_ALCOHOL_EVIDENCE],
      explanation: "Contains a volatile hydroalcoholic solvent matrix (Alcohol Denat. / Ethanol) which evaporates rapidly and may cause transient tightness or stinging on barrier-compromised or eczema-prone skin.",
      limitations: "Personal skin barrier tolerance varies widely; patch testing on the inner forearm is standard dermatological best practice."
    };
  } else {
    sensitiveSkinSuitability = {
      group: "sensitiveSkin",
      displayName: "Sensitive & Reactive Skin",
      icon: "🌸",
      status: "LOW_CONCERN_BASED_ON_AVAILABLE_DATA",
      statusLabel: "Non-Drying Solvent Matrix Disclosed",
      reasonCodes: ["NO_VOLATILE_ALCOHOLS_DETECTED"],
      contributingIngredients: [],
      evidence: [CIR_ALCOHOL_EVIDENCE],
      explanation: "No drying volatile ethanol carriers were detected. The formula appears to utilize a water or gentle non-volatile carrier base.",
      limitations: "Dermatological suitability is individual."
    };
  }

  // 4. Pregnancy
  const pregnancySuitability: UserGroupSuitability = {
    group: "pregnancy",
    displayName: "Pregnant Users",
    icon: "🤰",
    status: "INSUFFICIENT_EVIDENCE",
    statusLabel: "Insufficient Evidence / Healthcare Review Recommended",
    reasonCodes: ["SYSTEMIC_ABSORPTION_NOT_ASSESSABLE_FROM_LABEL"],
    contributingIngredients: allergens.slice(0, 3).map(a => a.matchedInci || a.rawInput),
    evidence: [
      {
        id: "sccs-notes-guidance",
        title: "SCCS Notes of Guidance for the Testing of Cosmetic Ingredients (11th Revision)",
        organization: "EU SCCS",
        publicationYear: 2021,
        keyFindings: "Topical cosmetic exposure to standard aromatic compounds in rinse-off or leave-on fragrance is generally local; however, systemic margin of safety cannot be computed without proprietary concentration levels."
      }
    ],
    explanation: "Authoritative health organizations (FDA, SCCS) do not establish universal bans on standard topical perfumes during pregnancy. However, systemic absorption and individual aromatic tolerance cannot be determined from cosmetic ingredient labels alone. Review with your obstetric healthcare provider is recommended.",
    limitations: "Finished formula concentration percentages and proprietary secret aroma bases are not disclosed on consumer packaging."
  };

  // 5. Breastfeeding
  const breastfeedingSuitability: UserGroupSuitability = {
    group: "breastfeeding",
    displayName: "Breastfeeding Users",
    icon: "🤱",
    status: "INSUFFICIENT_EVIDENCE",
    statusLabel: "Insufficient Evidence / Avoid Direct Chest Application",
    reasonCodes: ["DIRECT_INFANT_INGESTION_AVOIDANCE"],
    contributingIngredients: volatileAlcohols.map(a => a.matchedInci || a.rawInput),
    evidence: [SCCS_CHILDREN_EVIDENCE],
    explanation: "Topical fragrances applied away from the chest area generally exhibit minimal systemic lactation transfer. However, direct application to the breasts or chest should be avoided to prevent accidental oral infant ingestion of volatile carriers or aromatic allergens.",
    limitations: "Cosmetic labels do not replace clinical lactation guidance."
  };

  // 6. General Adults
  const adultsSuitability: UserGroupSuitability = {
    group: "adults",
    displayName: "General Adults",
    icon: "👤",
    status: allergens.length > 3 ? "REQUIRES_REVIEW" : "LOW_CONCERN_BASED_ON_AVAILABLE_DATA",
    statusLabel: allergens.length > 3 ? "Review Detected Ingredients" : "Standard Formulation Disclosed",
    reasonCodes: allergens.length > 3 ? ["MULTIPLE_ALLERGENS_DECLARED"] : ["STANDARD_COSMETIC_MATRIX"],
    contributingIngredients: allergens.map(a => a.matchedInci || a.rawInput),
    evidence: [IFRA_STANDARDS_EVIDENCE],
    explanation: "Formulation follows standard commercial cosmetic fragrance conventions compliant with international labeling directives. Review detected ingredients against personal preferences.",
    limitations: "Individual scent sensitivities and personal preferences govern adult fragrance selection."
  };

  const groups: Record<SuitabilityUserGroup, UserGroupSuitability> = {
    children: childrenSuitability,
    adults: adultsSuitability,
    fragranceSensitiveUsers: fragranceSensitiveSuitability,
    sensitiveSkin: sensitiveSkinSuitability,
    pregnancy: pregnancySuitability,
    breastfeeding: breastfeedingSuitability
  };

  let transparencyNote = "Based on the verified ingredient information visible on the provided packaging label.";
  if (hasIncompleteList) {
    transparencyNote = "Suitability assessment may be incomplete because the provided ingredient information could not be fully verified.";
  } else if (unknownCount > 0) {
    transparencyNote = `Based on verified label disclosures. Note: ${unknownCount} ingredient(s) could not be matched to the OLFEXA scientific repository.`;
  }

  return {
    groups,
    overallTransparencyNote: transparencyNote,
    hasIncompleteIngredients: hasIncompleteList,
    hasUnknownIngredients: unknownCount > 0,
    unknownIngredientsCount: unknownCount
  };
}
