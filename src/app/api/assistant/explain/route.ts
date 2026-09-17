import { NextRequest, NextResponse } from "next/server";
import { generateGroundedAssistantResponse } from "@/lib/assistant/groundedAssistant";
import { matchIngredientToken } from "@/lib/matching-engine/matchingEngine";
import { AnalyzedIngredient } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ingredientName, question, perfumeName, ingredients } = body;

    const queryText = question || (ingredientName ? `Explain ${ingredientName}` : "");
    if (!queryText.trim()) {
      return NextResponse.json(
        { error: "Question or ingredientName is required." },
        { status: 400 }
      );
    }

    // Build or extract verified analyzed ingredients
    let verifiedIngredients: AnalyzedIngredient[] = [];

    if (Array.isArray(ingredients) && ingredients.length > 0) {
      verifiedIngredients = ingredients;
    } else if (ingredientName) {
      const matchRes = matchIngredientToken(ingredientName);
      const canonical = matchRes.matchedCanonical;

      if (canonical) {
        verifiedIngredients = [
          {
            rawInput: ingredientName,
            matchedInci: canonical.inciName,
            commonName: canonical.commonNames[0],
            category: canonical.category,
            status: canonical.isEuAllergen ? "FLAGGED_ALLERGEN" : (canonical.isAlcohol ? "FLAGGED_ALCOHOL" : "NEUTRAL"),
            isAlcohol: canonical.isAlcohol,
            alcoholType: canonical.alcoholType,
            isEuAllergen: canonical.isEuAllergen,
            isPotentialIrritant: canonical.isPotentialIrritant,
            isWatchlistMatch: false,
            description: canonical.description,
            evidence: canonical.evidence,
            evidenceStatus: "VERIFIED",
            order: 1,
          }
        ];
      } else {
        verifiedIngredients = [
          {
            rawInput: ingredientName,
            category: "other",
            status: "NEUTRAL",
            isAlcohol: false,
            isEuAllergen: false,
            isPotentialIrritant: false,
            isWatchlistMatch: false,
            description: "Declared cosmetic token.",
            evidence: [],
            evidenceStatus: "INSUFFICIENT_EVIDENCE",
            order: 1,
          }
        ];
      }
    }

    const response = generateGroundedAssistantResponse({
      question: queryText,
      context: {
        perfumeName: perfumeName || "Scanned Fragrance",
        ingredients: verifiedIngredients,
      },
      targetIngredient: verifiedIngredients[0]
    });

    return NextResponse.json({
      success: true,
      answer: response.answer,
      policyTriggered: response.policyTriggered,
      sources: response.citedSources,
      disclaimer: response.disclaimer,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Assistant explanation failed", details: error.message },
      { status: 500 }
    );
  }
}
