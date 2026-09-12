import { NextRequest, NextResponse } from "next/server";
import { findIngredientByInci } from "@/data/mockIngredients";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ingredientName, question } = body;

    if (!ingredientName) {
      return NextResponse.json(
        { error: "ingredientName is required." },
        { status: 400 }
      );
    }

    const matched = findIngredientByInci(ingredientName);

    if (!matched) {
      return NextResponse.json({
        success: true,
        answer: `We could not locate a verified scientific monograph for "${ingredientName}" in the OLFEXA regulatory dataset. No verified evidence is currently available.`,
        sources: [],
      });
    }

    // Strictly grounded response generation based on verified record
    const responseText = `Regarding **${matched.inciName}** (${matched.commonName || "INCI"}):\n\n` +
      `• **Functional Role**: ${matched.description}\n` +
      `• **Regulatory Classification**: ${matched.isEuAllergen ? "Regulated EU Annex III fragrance allergen with mandatory threshold labeling requirements." : "Not flagged as a regulated EU contact allergen."}\n` +
      `• **Alcohol Type**: ${matched.isAlcohol ? (matched.alcoholType === "fatty_alcohol" ? "Classified as an emollient fatty alcohol (non-drying lipid)." : "Classified as an ethyl alcohol/volatile carrier.") : "Non-alcohol compound."}\n` +
      `• **Evidence Findings**: ${matched.evidence.map((e) => `${e.organization} (${e.publicationYear || "Published"}): ${e.keyFindings}`).join(" ")}\n\n` +
      `*Disclaimer: OLFEXA provides non-diagnostic decision-support based on scientific literature. Consult a medical professional for allergy diagnoses.*`;

    return NextResponse.json({
      success: true,
      answer: responseText,
      sources: matched.evidence,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Assistant explanation failed", details: error.message },
      { status: 500 }
    );
  }
}
