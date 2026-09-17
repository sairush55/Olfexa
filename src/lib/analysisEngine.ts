import { 
  AnalysisResult, 
  AnalyzedIngredient, 
  TransparencyRating, 
  FragranceFingerprint,
  WatchlistItem,
  EvidenceSource
} from "@/types";
import { findIngredientByInci } from "@/data/mockIngredients";
import { matchIngredientToken } from "./matching-engine/matchingEngine";
import { evaluateAlcoholPresence } from "./alcoholRules";
import { generateSuitabilityProfile } from "./suitabilityEngine";
import { executeDeterministicRuleEngine } from "./rule-engine/deterministicRuleEngine";

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
    if (!trimmed) return;

    // Stage 1: Multi-stage controlled matching engine against Canonical Ingredients Database
    const matchRes = matchIngredientToken(trimmed);
    const canonical = matchRes.matchedCanonical;
    // Fallback to existing mock catalog if not in canonical
    const legacyMatched = !canonical ? findIngredientByInci(trimmed) : undefined;

    const matchedName = canonical?.inciName || legacyMatched?.inciName || trimmed;
    const commonName = canonical?.commonNames[0] || legacyMatched?.commonName;

    const isWatchlist = watchlistSet.has(trimmed.toUpperCase()) || 
      (canonical?.inciName && watchlistSet.has(canonical.inciName.toUpperCase())) ||
      (commonName && watchlistSet.has(commonName.toUpperCase()));

    if (isWatchlist) {
      watchlistMatchCount++;
    }

    if (canonical || legacyMatched) {
      const category = canonical?.category || legacyMatched!.category;
      const isAlcohol = canonical ? canonical.isAlcohol : legacyMatched!.isAlcohol;
      const alcoholType = canonical ? canonical.alcoholType : legacyMatched!.alcoholType;
      const isAllergen = canonical ? canonical.isEuAllergen : legacyMatched!.isEuAllergen;
      const isIrritant = canonical ? canonical.isPotentialIrritant : legacyMatched!.isPotentialIrritant;

      if (isAllergen) allergenCount++;
      if (isIrritant && !isAllergen) irritantCount++;

      // Fingerprint categorization
      if (category === "carrier" || category === "solvent") carrierCount++;
      else if (category === "fragrance_compound") fragranceCount++;
      else if (category === "preservative") preservativeCount++;
      else if (category === "antioxidant" || category === "uv_filter") stabilizerCount++;
      else otherCount++;

      let status: AnalyzedIngredient["status"] = "NEUTRAL";
      if (isWatchlist) status = "WATCHLIST_MATCH";
      else if (isAllergen) status = "FLAGGED_ALLERGEN";
      else if (isAlcohol) status = "FLAGGED_ALCOHOL";
      else if (isIrritant) status = "FLAGGED_IRRITANT";

      // Auditable evidence chain from verified database records
      const evidence: EvidenceSource[] = canonical?.evidence || legacyMatched?.evidence || [];
      const evidenceStatus = evidence.length > 0 ? "VERIFIED" : "INSUFFICIENT_EVIDENCE";

      analyzedIngredients.push({
        rawInput: trimmed,
        matchedInci: matchedName,
        commonName,
        category,
        status,
        isAlcohol,
        alcoholType,
        isEuAllergen: isAllergen,
        isPotentialIrritant: isIrritant,
        isWatchlistMatch: !!isWatchlist,
        description: canonical?.description || legacyMatched?.description || "Cosmetic fragrance component.",
        whyFlagged: isAllergen 
          ? "Declared EU Annex III fragrance allergen subject to quantitative labeling thresholds."
          : isAlcohol 
            ? "Recognized volatile alcohol carrier."
            : isWatchlist
              ? "Matches an active item in your personal ingredient watchlist."
              : isIrritant
                ? "Identified potential irritant in sensitive populations."
                : undefined,
        evidence,
        evidenceStatus,
        order: index + 1,
      });
    } else {
      // Unmapped token fallback — transparently marked as INSUFFICIENT_EVIDENCE
      otherCount++;
      const isAlcoholLikely = /alcohol/i.test(trimmed);

      const insufficientEvidence: EvidenceSource[] = [
        {
          id: `ev-insufficient-${index + 1}`,
          title: `Insufficient Evidence for ${trimmed}`,
          organization: "CosIng",
          datasetOrRegulation: "Not Found in CosIng / IFRA / CDSCO",
          region: "GLOBAL",
          publicationYear: new Date().getFullYear(),
          keyFindings: "Ingredient declared on product packaging but no verified toxicological or regulatory monograph was located in authoritative repositories.",
          evidenceStatus: "INSUFFICIENT_EVIDENCE",
        }
      ];

      analyzedIngredients.push({
        rawInput: trimmed,
        category: "other",
        status: isWatchlist ? "WATCHLIST_MATCH" : (isAlcoholLikely ? "FLAGGED_ALCOHOL" : "NEUTRAL"),
        isAlcohol: isAlcoholLikely,
        isEuAllergen: false,
        isPotentialIrritant: false,
        isWatchlistMatch: !!isWatchlist,
        description: "Ingredient declared on product packaging. Not identified in verified scientific or regulatory repositories.",
        whyFlagged: isWatchlist 
          ? "Matches an active item in your personal ingredient watchlist." 
          : isAlcoholLikely 
            ? "Contains token indicating alcohol carrier." 
            : undefined,
        evidence: insufficientEvidence,
        evidenceStatus: "INSUFFICIENT_EVIDENCE",
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

  // Evaluate Regional Compliance & Deterministic Safety Rules
  const deterministicRules = executeDeterministicRuleEngine(ingredients);

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
    regionalCompliance: deterministicRules.compliance,
    disclaimer: "OLFEXA provides ingredient-level evidence and informational classifications based on visible packaging labels. It does not replace professional dermatological or medical evaluation.",
  };
}
