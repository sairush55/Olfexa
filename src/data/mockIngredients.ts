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
