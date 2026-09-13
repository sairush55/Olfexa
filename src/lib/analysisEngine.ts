import { 
  AnalysisResult, 
  AnalyzedIngredient, 
  TransparencyRating, 
  FragranceFingerprint,
  WatchlistItem 
} from "@/types";
import { MOCK_INGREDIENTS_DATABASE, findIngredientByInci } from "@/data/mockIngredients";
import { evaluateAlcoholPresence } from "./alcoholRules";
import { generateSuitabilityProfile } from "./suitabilityEngine";
import { generateFragrancePersona } from "./fragrancePersona";

export function analyzeIngredientsList(
  ingredients: string[],
  perfumeName: string = "Scanned Fragrance",
  brandName?: string,
  userWatchlist: WatchlistItem[] = []
): AnalysisResult {
  const alcoholEval = evaluateAlcoholPresence(ingredients);
  const analyzedIngredients: AnalyzedIngredient[] = [];

  let allergenCount = 0;
  let irritantCount = 0;
  let watchlistMatchCount = 0;

  // Category counts for fingerprint
  let carrierCount = 0;
  let fragranceCount = 0;
  let preservativeCount = 0;
  let stabilizerCount = 0;
  let otherCount = 0;

  const watchlistSet = new Set(
    userWatchlist.map((w) => w.ingredientName.trim().toUpperCase())
  );

  ingredients.forEach((raw, index) => {
    const trimmed = raw.trim();
    const matched = findIngredientByInci(trimmed);

    const isWatchlist = watchlistSet.has(trimmed.toUpperCase()) || 
      (matched?.commonName && watchlistSet.has(matched.commonName.toUpperCase()));

    if (isWatchlist) {
      watchlistMatchCount++;
    }

    if (matched) {
      const isAllergen = matched.isEuAllergen;
      const isIrritant = matched.isPotentialIrritant;

      if (isAllergen) allergenCount++;
      if (isIrritant && !isAllergen) irritantCount++;

      // Fingerprint categorization
      if (matched.category === "carrier" || matched.category === "solvent") carrierCount++;
      else if (matched.category === "fragrance_compound") fragranceCount++;
      else if (matched.category === "preservative") preservativeCount++;
      else if (matched.category === "antioxidant" || matched.category === "uv_filter") stabilizerCount++;
      else otherCount++;

      let status: AnalyzedIngredient["status"] = "NEUTRAL";
      if (isWatchlist) status = "WATCHLIST_MATCH";
      else if (isAllergen) status = "FLAGGED_ALLERGEN";
      else if (matched.isAlcohol) status = "FLAGGED_ALCOHOL";
      else if (isIrritant) status = "FLAGGED_IRRITANT";

      analyzedIngredients.push({
        rawInput: trimmed,
        matchedInci: matched.inciName,
        commonName: matched.commonName,
        category: matched.category,
        status,
        isAlcohol: matched.isAlcohol,
        alcoholType: matched.alcoholType,
        isEuAllergen: isAllergen,
        isPotentialIrritant: isIrritant,
        isWatchlistMatch: !!isWatchlist,
        description: matched.description,
        whyFlagged: isAllergen 
          ? "Declared EU Annex III fragrance allergen subject to quantitative labeling thresholds."
          : matched.isAlcohol 
            ? "Recognized volatile alcohol carrier."
            : isWatchlist
              ? "Matches an active item in your personal ingredient watchlist."
              : undefined,
        evidence: matched.evidence,
        order: index + 1,
      });
    } else {
      // Unmapped token fallback
      otherCount++;
      const isAlcoholLikely = /alcohol/i.test(trimmed);
      analyzedIngredients.push({
        rawInput: trimmed,
        category: "other",
        status: isWatchlist ? "WATCHLIST_MATCH" : (isAlcoholLikely ? "FLAGGED_ALCOHOL" : "NEUTRAL"),
        isAlcohol: isAlcoholLikely,
        isEuAllergen: false,
        isPotentialIrritant: false,
        isWatchlistMatch: !!isWatchlist,
        description: "Ingredient declared on product packaging. Full regulatory record pending verification against scientific repository.",
        evidence: [],
        order: index + 1,
      });
    }
  });

  // Calculate Transparency Rating
  let transparencyRating: TransparencyRating = "HIGH";
  let transparencyNotes = "Ingredient disclosures list specific chemical aroma compounds rather than opaque broad classifications.";
  
  const hasGenericParfum = ingredients.some(i => /parfum|fragrance/i.test(i));
  if (hasGenericParfum) {
    if (analyzedIngredients.length > 8) {
      transparencyRating = "MODERATE";
      transparencyNotes = "Contains declared 'Parfum / Fragrance' alongside specific allergen breakdowns, consistent with modern EU cosmetics labeling.";
    } else {
      transparencyRating = "LIMITED";
      transparencyNotes = "Formula relies predominantly on blanket fragrance disclosures with few separated constituent notes.";
    }
  }

  // Calculate Fingerprint
  const total = Math.max(ingredients.length, 1);
  const fingerprint: FragranceFingerprint = {
    carrierSolventsPercent: Math.round((carrierCount / total) * 100),
    fragranceCompoundsPercent: Math.round((fragranceCount / total) * 100),
    preservativesPercent: Math.round((preservativeCount / total) * 100),
    antioxidantsFiltersPercent: Math.round((stabilizerCount / total) * 100),
    unclassifiedPercent: Math.round((otherCount / total) * 100),
    topFamilies: ["Citrus / Hesperidic", "Woody / Amber", "Aromatic Floral"],
  };

  // Generate Evidence-Grounded Suitability Profile
  const suitabilityProfile = generateSuitabilityProfile(
    analyzedIngredients,
    alcoholEval.status,
    false
  );

  // Optional Fragrance Persona for discovery/entertainment
  const fragrancePersona = generateFragrancePersona();

  return {
    id: `scan-${Date.now()}`,
    perfumeName,
    brandName: brandName || "Declared Brand",
    scanDate: new Date().toISOString(),
    rawOcrText: ingredients.join(", "),
    alcoholStatus: alcoholEval.status,
    alcoholStatusExplanation: alcoholEval.statusExplanation,
    detectedAlcohols: alcoholEval.detectedAlcohols,
    ingredientsFound: analyzedIngredients,
    potentialAllergens: analyzedIngredients.filter((i) => i.isEuAllergen),
    potentialIrritants: analyzedIngredients.filter((i) => i.isPotentialIrritant),
    watchlistMatches: analyzedIngredients.filter((i) => i.isWatchlistMatch),
    transparencyRating,
    transparencyNotes,
    fragranceFingerprint: fingerprint,
    suitabilityProfile,
    fragrancePersona,
    disclaimer: "OLFEXA provides ingredient-level evidence and informational classifications based on visible packaging labels. It does not replace professional dermatological or medical evaluation.",
  };
}
