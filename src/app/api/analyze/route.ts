import { NextRequest, NextResponse } from "next/server";
import { analyzeIngredientsList } from "@/lib/analysisEngine";
import { WatchlistItem } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ingredients, perfumeName, brand, watchlist, provenance } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: "Invalid ingredients payload. Expected array of strings." },
        { status: 400 }
      );
    }

    const result = analyzeIngredientsList(
      ingredients,
      perfumeName || "Scanned Fragrance",
      brand || "Declared Brand",
      (watchlist as WatchlistItem[]) || []
    );

    if (provenance) {
      result.provenance = provenance;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Analysis execution failed", details: error.message },
      { status: 500 }
    );
  }
}
