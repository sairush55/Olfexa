import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawText } = body;

    if (!rawText || typeof rawText !== "string") {
      return NextResponse.json(
        { error: "Invalid payload. Expected rawText string." },
        { status: 400 }
      );
    }

    // Clean OCR artifacts: remove leading "INGREDIENTS:", brackets, trailing dots
    const cleaned = rawText
      .replace(/^(INGREDIENTS|CONTAINS|COMPOSITION)\s*[:.]?/i, "")
      .replace(/[[\]{}()]/g, " ")
      .trim();

    // Split tokens on commas, semicolons, bullets, and line breaks
    const tokens = cleaned
      .split(/[,;•\n\r]+/)
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t.length > 1 && !/^\d+$/.test(t));

    return NextResponse.json({
      success: true,
      normalized: tokens,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Normalization failed", details: error.message },
      { status: 500 }
    );
  }
}
