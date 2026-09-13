import { NextRequest, NextResponse } from "next/server";
import { validateProductUrl } from "@/lib/product-link/urlValidator";
import { fetchProductPageHtml, extractProductPageData } from "@/lib/product-link/productExtractor";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawUrl = body?.url;

    // 1. URL Validation & SSRF Prevention
    const validation = validateProductUrl(rawUrl);
    if (!validation.isValid || !validation.sanitizedUrl) {
      return NextResponse.json(
        {
          success: false,
          error: validation.errorMessage || "Please enter a valid product page URL.",
          hasIngredients: false,
        },
        { status: 400 }
      );
    }

    const sanitizedUrl = validation.sanitizedUrl;

    // 2. Safe Fetch Product Page
    let html = "";
    try {
      html = await fetchProductPageHtml(sanitizedUrl);
    } catch (fetchErr: any) {
      console.warn("Product link fetch error:", fetchErr.message);
      return NextResponse.json(
        {
          success: false,
          error: "Unable to reach the product page. Please ensure the link is active and public, or enter ingredients manually.",
          hasIngredients: false,
        },
        { status: 422 }
      );
    }

    // 3. Extract Structured Content & INCI Ingredients
    const productData = extractProductPageData(html, sanitizedUrl);
    const hasIngredients = Boolean(productData.ingredients && productData.ingredients.length > 0);

    return NextResponse.json({
      success: true,
      data: productData,
      candidates: productData.ingredients || [],
      hasIngredients,
      message: hasIngredients
        ? `Successfully extracted product details and ${productData.ingredients?.length} declared ingredients.`
        : "Product information located, but no formal cosmetic ingredient list was found on this page.",
    });
  } catch (err: any) {
    console.error("General Product Link Route Exception:", err);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while analyzing the product page. Please verify the URL or enter ingredients manually.",
        hasIngredients: false,
      },
      { status: 500 }
    );
  }
}
