import { Ingredient, EvidenceSource, IngredientCategory, AlcoholType } from "@/types";
import { OLFEXA_DATASET as dataset } from "./olfexaDataset";

// Map official dataset sources
const OFFICIAL_SOURCES: EvidenceSource[] = dataset.sources.map((src, i) => {
  let org: EvidenceSource["organization"] = "CosIng";
  if (src.organization.includes("FDA")) org = "FDA";
  else if (src.organization.includes("IFRA")) org = "IFRA";
  else if (src.organization.includes("European Commission")) org = "CosIng";

  return {
    id: `src-official-${i + 1}`,
    organization: org,
    title: src.title,
    citationUrl: src.url,
    publicationYear: 2023,
    keyFindings: `Regulatory documentation published by ${src.organization} regarding cosmetic labeling and concentration standards.`,
  };
});

// Map dataset ingredients into OLFEXA typed records
export const MOCK_INGREDIENTS_DATABASE: Ingredient[] = dataset.ingredients.map((item, idx) => {
  let category: IngredientCategory = "fragrance_compound";
  let isAlcohol = false;
  let alcoholType: AlcoholType | undefined = undefined;

  const nameLower = item.name.toLowerCase();

  if (item.ethyl_alcohol_or_denatured_alcohol) {
    isAlcohol = true;
    category = "carrier";
    if (nameLower.includes("denat") || nameLower.includes("sd alcohol")) {
      alcoholType = "denatured_alcohol";
    } else if (nameLower.includes("isopropyl")) {
      alcoholType = "other";
      category = "solvent";
    } else {
      alcoholType = "ethanol";
    }
  } else if (nameLower.includes("alcohol")) {
    if (nameLower.includes("cetyl") || nameLower.includes("stearyl") || nameLower.includes("cetearyl")) {
      isAlcohol = true;
      alcoholType = "fatty_alcohol";
      category = "emulsifier";
    } else {
      // aromatic scent alcohol (e.g. Benzyl alcohol, Cinnamyl alcohol)
      isAlcohol = true;
      alcoholType = "aromatic_alcohol";
      category = "fragrance_compound";
    }
  }

  // Associate relevant evidence citations
  const relevantSources = item.potential_fragrance_allergen
    ? OFFICIAL_SOURCES.filter((s) => s.organization === "FDA" || s.organization === "CosIng" || s.organization === "IFRA")
    : isAlcohol
    ? OFFICIAL_SOURCES.filter((s) => s.title.includes("Alcohol Free") || s.organization === "CosIng")
    : OFFICIAL_SOURCES;

  return {
    id: `ing-olfexa-${idx + 1}`,
    inciName: item.name.toUpperCase(),
    commonName: item.name,
    category,
    isAlcohol,
    alcoholType,
    isEuAllergen: item.potential_fragrance_allergen,
    isPotentialIrritant: item.potential_fragrance_allergen || isAlcohol,
    description: item.notes || `Declared cosmetic ingredient indexed in the OLFEXA v${dataset.version} fragrance repository.`,
    potentialConcerns: item.potential_fragrance_allergen
      ? "Identified as a potential fragrance allergen in regulatory disclosures. Presence does not by itself mean a product is unsafe; evaluate in context of personal sensitivities."
      : item.alcohol_detection_note || undefined,
    transparencyNotes: item.category,
    evidence: relevantSources,
  };
});

// Also include neutral carrier Aqua if not already in list
if (!MOCK_INGREDIENTS_DATABASE.some(i => i.inciName.includes("AQUA"))) {
  MOCK_INGREDIENTS_DATABASE.push({
    id: "ing-aqua",
    inciName: "AQUA / WATER / EAU",
    commonName: "Purified Water",
    category: "solvent",
    isAlcohol: false,
    isEuAllergen: false,
    isPotentialIrritant: false,
    description: "Deionized water vehicle used to balance formulation and dissolve water-soluble components.",
    evidence: OFFICIAL_SOURCES.filter((s) => s.organization === "CosIng"),
  });
}

// Also include Cetyl Alcohol for fatty alcohol demonstration
if (!MOCK_INGREDIENTS_DATABASE.some(i => i.inciName.includes("CETYL ALCOHOL"))) {
  MOCK_INGREDIENTS_DATABASE.push({
    id: "ing-cetyl",
    inciName: "CETYL ALCOHOL",
    commonName: "Palmityl Alcohol",
    category: "emulsifier",
    isAlcohol: true,
    alcoholType: "fatty_alcohol",
    isEuAllergen: false,
    isPotentialIrritant: false,
    description: "Long-chain saturated fatty alcohol. Emollient conditioning lipid; chemically distinct from drying volatile ethanol.",
    evidence: OFFICIAL_SOURCES.filter((s) => s.organization === "CosIng"),
  });
}

// Full suite of standard cosmetic fragrance staples
const ADDITIONAL_STAPLES: Array<Omit<Ingredient, "evidence"> & { evidence?: EvidenceSource[] }> = [
  {
    id: "ing-parfum",
    inciName: "PARFUM / FRAGRANCE",
    commonName: "Fragrance Compound",
    category: "fragrance_compound",
    isAlcohol: false,
    isEuAllergen: false,
    isPotentialIrritant: true,
    description: "Complex olfactory composition comprising natural extracts and synthetic aroma molecules declared under unified cosmetic labeling rules.",
  },
  {
    id: "ing-alc-denat",
    inciName: "ALCOHOL DENAT.",
    commonName: "Denatured Alcohol (Ethanol)",
    category: "carrier",
    isAlcohol: true,
    alcoholType: "denatured_alcohol",
    isEuAllergen: false,
    isPotentialIrritant: true,
    description: "Primary volatile solvent vehicle used in fine perfumery. Rapidly evaporates to disperse aromatic top notes on skin.",
    potentialConcerns: "Contains volatile ethanol. May cause drying or stinging on compromised or barrier-damaged skin.",
  },
  {
    id: "ing-bht",
    inciName: "BHT",
    commonName: "Butylated Hydroxytoluene",
    category: "antioxidant",
    isAlcohol: false,
    isEuAllergen: false,
    isPotentialIrritant: false,
    description: "Lipophilic antioxidant used to prevent rancidity and oxidative degradation of delicate citrus terpenes and aroma molecules.",
  },
  {
    id: "ing-ethylhexyl-methoxy",
    inciName: "ETHYLHEXYL METHOXYCINNAMATE",
    commonName: "Octinoxate (UV Filter)",
    category: "uv_filter",
    isAlcohol: false,
    isEuAllergen: false,
    isPotentialIrritant: false,
    description: "UV absorber added to protect fragrance juice from photodegradation and color shifting caused by ambient light.",
  },
  {
    id: "ing-butyl-methoxy",
    inciName: "BUTYL METHOXYDIBENZOYLMETHANE",
    commonName: "Avobenzone (UV Filter)",
    category: "uv_filter",
    isAlcohol: false,
    isEuAllergen: false,
    isPotentialIrritant: false,
    description: "Broad-spectrum UV absorber used to stabilize light-sensitive natural fragrance oils in clear glass flacons.",
  },
  {
    id: "ing-ethylhexyl-salicylate",
    inciName: "ETHYLHEXYL SALICYLATE",
    commonName: "Octisalate (UV Stabilizer)",
    category: "uv_filter",
    isAlcohol: false,
    isEuAllergen: false,
    isPotentialIrritant: false,
    description: "Photostabilizer and UVB absorber commonly combined with avobenzone in modern cosmetic formulations.",
  },
  {
    id: "ing-tocopherol",
    inciName: "TOCOPHEROL",
    commonName: "Vitamin E",
    category: "antioxidant",
    isAlcohol: false,
    isEuAllergen: false,
    isPotentialIrritant: false,
    description: "Natural antioxidant that terminates radical chain reactions in aromatic oils and lipid fractions.",
  },
  {
    id: "ing-dipropylene-glycol",
    inciName: "DIPROPYLENE GLYCOL",
    commonName: "DPG Solvent",
    category: "solvent",
    isAlcohol: false,
    isEuAllergen: false,
    isPotentialIrritant: false,
    description: "Water-soluble glycol solvent and fixative with low volatility, frequently used as a diluent for perfume oils and attars.",
  },
  {
    id: "ing-triethyl-citrate",
    inciName: "TRIETHYL CITRATE",
    commonName: "Citric Acid Ester",
    category: "solvent",
    isAlcohol: false,
    isEuAllergen: false,
    isPotentialIrritant: false,
    description: "Ester of citric acid used as a natural solvent, fixative, and antioxidant synergist in modern clean fragrance lines.",
  },
  {
    id: "ing-isopropyl-myristate",
    inciName: "ISOPROPYL MYRISTATE",
    commonName: "IPM Emollient",
    category: "carrier",
    isAlcohol: false,
    isEuAllergen: false,
    isPotentialIrritant: false,
    description: "Fast-spreading synthetic ester carrier used as an alcohol-free perfume oil base giving a velvety skin feel.",
  },
  {
    id: "ing-benzyl-salicylate",
    inciName: "BENZYL SALICYLATE",
    commonName: "Benzyl Salicylate",
    category: "fragrance_compound",
    isAlcohol: false,
    isEuAllergen: true,
    isPotentialIrritant: true,
    description: "Balsamic, sweet floral aroma chemical and fixative. Regulated under EU Cosmetics Regulation Annex III.",
    potentialConcerns: "Identified as a regulated EU cosmetic fragrance allergen. Must be declared when exceeding concentration thresholds.",
  },
  {
    id: "ing-hydroxycitronellal",
    inciName: "HYDROXYCITRONELLAL",
    commonName: "Hydroxycitronellal",
    category: "fragrance_compound",
    isAlcohol: false,
    isEuAllergen: true,
    isPotentialIrritant: true,
    description: "Classic lily-of-the-valley floral aroma molecule. Regulated under IFRA standards and EU Annex III.",
    potentialConcerns: "Recognized fragrance allergen subject to strict IFRA quantitative risk assessment (QRA) limits.",
  },
  {
    id: "ing-hexyl-cinnamal",
    inciName: "HEXYL CINNAMAL",
    commonName: "Hexyl Cinnamic Aldehyde",
    category: "fragrance_compound",
    isAlcohol: false,
    isEuAllergen: true,
    isPotentialIrritant: true,
    description: "Jasmine-like floral synthetic odorant widely used across fine fragrance, soaps, and lotions.",
    potentialConcerns: "Regulated EU fragrance allergen.",
  },
  {
    id: "ing-alpha-isomethyl-ionone",
    inciName: "ALPHA-ISOMETHYL IONONE",
    commonName: "Alpha-Isomethyl Ionone",
    category: "fragrance_compound",
    isAlcohol: false,
    isEuAllergen: true,
    isPotentialIrritant: true,
    description: "Violet and iris floral note. Regulated cosmetic allergen under EU Regulation (EC) No 1223/2009.",
    potentialConcerns: "Regulated cosmetic fragrance allergen.",
  },
  {
    id: "ing-evernia-prunastri",
    inciName: "EVERNIA PRUNASTRI (OAKMOSS) EXTRACT",
    commonName: "Oakmoss Extract",
    category: "fragrance_compound",
    isAlcohol: false,
    isEuAllergen: true,
    isPotentialIrritant: true,
    description: "Natural lichen extract providing classic earthy chypres base notes. Heavily regulated by IFRA for atranol content.",
    potentialConcerns: "Known potent fragrance sensitizer; strict concentration limits enforced by IFRA 51st Amendment.",
  },
  {
    id: "ing-farnesol",
    inciName: "FARNESOL",
    commonName: "Farnesol",
    category: "fragrance_compound",
    isAlcohol: false,
    isEuAllergen: true,
    isPotentialIrritant: true,
    description: "Naturally occurring acyclic sesquiterpene alcohol found in neroli, rose, and ylang-ylang. Regulated allergen.",
    potentialConcerns: "Regulated EU fragrance allergen.",
  },
  {
    id: "ing-isoeugenol",
    inciName: "ISOEUGENOL",
    commonName: "Isoeugenol",
    category: "fragrance_compound",
    isAlcohol: false,
    isEuAllergen: true,
    isPotentialIrritant: true,
    description: "Spicy clove aroma chemical regulated under strict IFRA maximum permitted concentration limits.",
    potentialConcerns: "Known potent skin contact allergen.",
  },
  {
    id: "ing-cinnamyl-alcohol",
    inciName: "CINNAMYL ALCOHOL",
    commonName: "Cinnamyl Alcohol",
    category: "fragrance_compound",
    isAlcohol: true,
    alcoholType: "aromatic_alcohol",
    isEuAllergen: true,
    isPotentialIrritant: true,
    description: "Aromatic alcohol with sweet, hyacinth-like balsamic aroma. Regulated under EU cosmetic allergen list.",
    potentialConcerns: "Regulated EU fragrance contact allergen.",
  },
  {
    id: "ing-cinnamal",
    inciName: "CINNAMAL",
    commonName: "Cinnamic Aldehyde",
    category: "fragrance_compound",
    isAlcohol: false,
    isEuAllergen: true,
    isPotentialIrritant: true,
    description: "Key aroma compound of cinnamon bark oil. Strongly regulated contact allergen.",
    potentialConcerns: "Known potent allergen; strict IFRA dermal limits apply.",
  }
];

// Append staples if not already present
for (const staple of ADDITIONAL_STAPLES) {
  if (!MOCK_INGREDIENTS_DATABASE.some((i) => i.inciName === staple.inciName)) {
    MOCK_INGREDIENTS_DATABASE.push({
      id: staple.id!,
      inciName: staple.inciName!,
      commonName: staple.commonName!,
      category: staple.category!,
      isAlcohol: staple.isAlcohol ?? false,
      alcoholType: staple.alcoholType,
      isEuAllergen: staple.isEuAllergen ?? false,
      isPotentialIrritant: staple.isPotentialIrritant ?? false,
      description: staple.description!,
      potentialConcerns: staple.potentialConcerns,
      evidence: OFFICIAL_SOURCES.filter((s) => s.organization === "CosIng" || s.organization === "IFRA"),
    });
  }
}

export function findIngredientByInci(query: string): Ingredient | undefined {
  const normalized = query.trim().toUpperCase();
  return MOCK_INGREDIENTS_DATABASE.find(
    (item) =>
      item.inciName === normalized ||
      item.commonName?.toUpperCase() === normalized ||
      item.inciName.includes(normalized) ||
      normalized.includes(item.inciName)
  );
}
