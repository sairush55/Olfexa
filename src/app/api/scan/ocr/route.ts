import { NextRequest, NextResponse } from "next/server";
import { processImageOcr, extractStructuredFragranceData, parseIngredientsFromOcrText } from "@/lib/ocrService";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let imageInput: Buffer | null = null;
    let userApiKey: string | undefined = undefined;
    let clientRawText: string | undefined = undefined;
    let clientConfidence: number | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = (formData.get("image") as File) || (formData.get("file") as File);
      userApiKey = (formData.get("apiKey") as string) || undefined;
      clientRawText = (formData.get("rawText") as string) || undefined;
      const confVal = formData.get("confidence") as string;
      if (confVal) clientConfidence = parseFloat(confVal);

      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        imageInput = Buffer.from(arrayBuffer);
      }
    } else {
      const body = await req.json();
      userApiKey = body.apiKey;
      clientRawText = body.rawText;
      clientConfidence = body.confidence;

      const base64Data = body.imageBase64 || body.image;
      if (base64Data && typeof base64Data === "string") {
        const cleaned = base64Data.replace(/^data:image\/\w+;base64,/, "");
        imageInput = Buffer.from(cleaned, "base64");
      }
    }

    // Branch A: If client already extracted rawText via browser WebAssembly Tesseract,
    // perform instant structured INCI parsing & provenance classification
    if (clientRawText && clientRawText.trim().length > 0) {
      const structured = extractStructuredFragranceData(
        clientRawText,
        typeof clientConfidence === "number" ? clientConfidence : 0.88,
        imageInput || undefined
      );

      return NextResponse.json({
        success: true,
        source: "client_webassembly_ocr",
        isPerfume: structured.isPerfume,
        fragranceType: structured.fragranceType,
        detectionReason: structured.detectionReason,
        confidence: structured.confidence,
        rawText: structured.rawText,
        candidates: structured.candidates,
        imageQuality: structured.imageQuality,
        relevance: structured.relevance,
        manufacturingInfo: structured.manufacturingInfo,
        companyDetails: structured.companyDetails,
        companyAddress: structured.companyAddress,
        note: structured.relevance?.isRelevant
          ? `Verified ${structured.relevance.classificationName} (${structured.fragranceType}).`
          : "Image text does not appear to contain standard cosmetic fragrance declarations. Please inspect carefully in review stage."
      });
    }

    // Branch B: Process image on server (using Gemini Vision AI if key available, or server Tesseract)
    if (!imageInput || imageInput.length === 0) {
      return NextResponse.json(
        { error: "No valid image payload or OCR text provided." },
        { status: 400 }
      );
    }

    try {
      const ocrResult = await processImageOcr(imageInput, userApiKey);

      return NextResponse.json({
        success: true,
        source: (userApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) ? "gemini_vision_ai" : "server_ocr",
        isPerfume: ocrResult.isPerfume,
        fragranceType: ocrResult.fragranceType,
        detectionReason: ocrResult.detectionReason,
        confidence: ocrResult.confidence,
        rawText: ocrResult.rawText,
        candidates: ocrResult.candidates,
        imageQuality: ocrResult.imageQuality,
        relevance: ocrResult.relevance,
        manufacturingInfo: ocrResult.manufacturingInfo,
        companyDetails: ocrResult.companyDetails,
        companyAddress: ocrResult.companyAddress,
        note: ocrResult.relevance?.isRelevant
          ? `Verified ${ocrResult.relevance.classificationName} (${ocrResult.fragranceType}).`
          : "Image text does not appear to contain standard cosmetic fragrance declarations. Please inspect carefully in review stage."
      });
    } catch (ocrErr: any) {
      console.warn("Server OCR processing error:", ocrErr.message);
      return NextResponse.json(
        {
          success: false,
          error: "Optical character recognition could not resolve legible text from this image.",
          details: ocrErr.message,
          candidates: []
        },
        { status: 422 }
      );
    }
  } catch (error: any) {
    console.error("General OCR Route Exception:", error);
    return NextResponse.json(
      { error: "OCR processing failed", details: error.message },
      { status: 500 }
    );
  }
}
