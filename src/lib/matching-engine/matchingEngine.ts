/**
 * OLFEXA Multi-Stage Controlled Ingredient Matching Engine
 * 
 * Pipeline:
 * Raw OCR text
 *  ↓ Cleaning
 *  ↓ Parsing
 *  ↓ Normalization
 *  ↓ Exact match (Score 1.0 -> High Confidence -> Automatic Match)
 *  ↓ Alternative-name / Common Name match (Score 0.95 -> High Confidence -> Automatic Match)
 *  ↓ Controlled fuzzy match (Score 0.75-0.85 -> Medium Confidence -> User Verification Required)
 *  ↓ Confidence Thresholding (Score < 0.70 -> Low Confidence -> Unknown Ingredient)
 *  ↓ Known / Uncertain / Unknown
 * 
 * Strict Guarantees:
 * 1. Never automatically accepts low-confidence fuzzy matches.
 * 2. Does not confuse similar short-acronym cosmetics (e.g. BHT vs BHA).
 * 3. Does not confuse distinct aroma molecules with similar prefixes (e.g. Citral vs Citronellol).
 * 4. Preserves unknown ingredients transparently without fabricating records.
 */

import { 
  CANONICAL_INGREDIENTS_DATABASE, 
  findCanonicalIngredient 
} from "@/data/canonicalIngredientsDatabase";
import { CanonicalIngredient } from "@/types/dataFoundation";
import { levenshteinDistance } from "@/lib/ocrService";

export type MatchClassification = "KNOWN_EXACT" | "KNOWN_SYNONYM" | "UNCERTAIN_VERIFICATION" | "UNKNOWN";

export interface MatchedIngredientResult {
  rawInput: string;
  cleanedInput: string;
  classification: MatchClassification;
  confidenceScore: number; // 0.0 - 1.0
  isKnown: boolean;
  needsUserVerification: boolean;
  matchedCanonical?: CanonicalIngredient;
  matchStage: "EXACT_INCI" | "CAS_NUMBER" | "SYNONYM_OR_COMMON_NAME" | "CONTROLLED_FUZZY" | "UNMATCHED";
  matchNotes?: string;
}

/**
 * Normalizes raw tokens by trimming, standardizing slashes, and removing edge noise
 */
export function cleanRawOcrToken(raw: string): string {
  if (!raw) return "";
  return raw
    .trim()
    .replace(/^[,;.:•·|\s]+|[,;.:•·|\s]+$/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Matches a single raw token through the multi-stage deterministic pipeline.
 */
export function matchIngredientToken(rawToken: string): MatchedIngredientResult {
  const cleaned = cleanRawOcrToken(rawToken);
  const upper = cleaned.toUpperCase();

  if (cleaned.length === 0) {
    return {
      rawInput: rawToken,
      cleanedInput: "",
      classification: "UNKNOWN",
      confidenceScore: 0.0,
      isKnown: false,
      needsUserVerification: false,
      matchStage: "UNMATCHED",
      matchNotes: "Empty ingredient token."
    };
  }

  // =========================================================================
  // STAGE 1: Exact INCI Match (High Confidence -> Automatic Match)
  // =========================================================================
  const exactInci = CANONICAL_INGREDIENTS_DATABASE.find(
    (c) => c.inciName === upper || (c.inciName.replace(/\.$/, "") === upper.replace(/\.$/, ""))
  );
  if (exactInci) {
    return {
      rawInput: rawToken,
      cleanedInput: cleaned,
      classification: "KNOWN_EXACT",
      confidenceScore: 1.0,
      isKnown: true,
      needsUserVerification: false,
      matchedCanonical: exactInci,
      matchStage: "EXACT_INCI",
      matchNotes: "Exact match against canonical INCI nomenclature."
    };
  }

  // =========================================================================
  // STAGE 2: Exact CAS Number Match
  // =========================================================================
  if (/^\d{2,7}-\d{2}-\d$/.test(cleaned)) {
    const casMatch = CANONICAL_INGREDIENTS_DATABASE.find((c) => c.casNumber === cleaned);
    if (casMatch) {
      return {
        rawInput: rawToken,
        cleanedInput: cleaned,
        classification: "KNOWN_EXACT",
        confidenceScore: 1.0,
        isKnown: true,
        needsUserVerification: false,
        matchedCanonical: casMatch,
        matchStage: "CAS_NUMBER",
        matchNotes: `Resolved via chemical CAS number registry (${cleaned}).`
      };
    }
  }

  // =========================================================================
  // STAGE 3: Alternative Name / Common Name / Registered Synonym Match
  // =========================================================================
  const synonymMatch = CANONICAL_INGREDIENTS_DATABASE.find((c) =>
    c.commonNames.some((cn) => cn.toUpperCase() === upper) ||
    c.synonyms.some((syn) => syn.toUpperCase() === upper)
  );
  if (synonymMatch) {
    return {
      rawInput: rawToken,
      cleanedInput: cleaned,
      classification: "KNOWN_SYNONYM",
      confidenceScore: 0.95,
      isKnown: true,
      needsUserVerification: false,
      matchedCanonical: synonymMatch,
      matchStage: "SYNONYM_OR_COMMON_NAME",
      matchNotes: `Mapped to canonical ${synonymMatch.inciName} via recognized synonym or common name.`
    };
  }

  // =========================================================================
  // STAGE 4: Controlled Fuzzy Matching with Length Safeguards
  // =========================================================================
  // Short acronyms (length <= 4, e.g. BHT, BHA, DPG) must NEVER be fuzzy-matched
  // Distinct aroma molecules (e.g. CITRAL vs CITRONELLOL) must not false-match
  if (upper.length >= 5) {
    let bestCandidate: CanonicalIngredient | null = null;
    let lowestDistance = 999;
    let bestSimilarity = 0;

    for (const candidate of CANONICAL_INGREDIENTS_DATABASE) {
      // Test against canonical INCI
      const targets = [candidate.inciName, ...candidate.synonyms.map(s => s.toUpperCase())];

      for (const target of targets) {
        if (target.length < 5) continue;
        const lenDiff = Math.abs(target.length - upper.length);
        if (lenDiff > 2) continue;

        const dist = levenshteinDistance(upper, target);
        const maxLen = Math.max(upper.length, target.length);
        const similarity = 1 - dist / maxLen;

        // Only allow dist 1 for length 5-7, or dist <= 2 for length >= 8
        const maxAllowedDist = upper.length >= 8 ? 2 : 1;

        if (dist <= maxAllowedDist && similarity >= 0.75 && dist < lowestDistance) {
          lowestDistance = dist;
          bestSimilarity = similarity;
          bestCandidate = candidate;
        }
      }
    }

    if (bestCandidate && lowestDistance <= 2) {
      // Medium Confidence: Matched with typo -> Requires user verification
      return {
        rawInput: rawToken,
        cleanedInput: cleaned,
        classification: "UNCERTAIN_VERIFICATION",
        confidenceScore: Math.round(bestSimilarity * 100) / 100,
        isKnown: true,
        needsUserVerification: true,
        matchedCanonical: bestCandidate,
        matchStage: "CONTROLLED_FUZZY",
        matchNotes: `Possible OCR spelling discrepancy (${lowestDistance} char diff). Suggested canonical: ${bestCandidate.inciName}. Requires user confirmation.`
      };
    }
  }

  // =========================================================================
  // STAGE 5: Completely Unknown Ingredient (Low Confidence -> Unknown)
  // =========================================================================
  return {
    rawInput: rawToken,
    cleanedInput: cleaned,
    classification: "UNKNOWN",
    confidenceScore: 0.20,
    isKnown: false,
    needsUserVerification: true,
    matchedCanonical: undefined,
    matchStage: "UNMATCHED",
    matchNotes: "Declared on packaging but not currently identified in verified scientific or regulatory repositories."
  };
}

/**
 * Matches an array of raw OCR tokens into structured canonical ingredient results.
 */
export function matchIngredientsBatch(rawTokens: string[]): MatchedIngredientResult[] {
  return rawTokens.map(matchIngredientToken);
}
