import { NextRequest, NextResponse } from "next/server";
import { 
  processImageOcr, 
  extractStructuredFragranceData, 
  evaluateVisionOcrPipeline 
} from "@/lib/ocrService";

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

    // Branch A: Client-extracted raw text (from browser WebAssembly Tesseract or manual input)
    if (clientRawText && clientRawText.trim().length > 0) {
      const rawText = clientRawText.trim();
      const confidence = typeof clientConfidence === "number" ? clientConfidence : 0.88;
      
      // Run the rigorous Vision/OCR evaluation pipeline
      const pipelineResult = evaluateVisionOcrPipeline(rawText, confidence, imageInput || undefined);
      const isAccepted = pipelineResult.status === "READY_FOR_REVIEW" || 
                         pipelineResult.status === "READY_FOR_ANALYSIS" ||
                         (pipelineResult.status === "INGREDIENT_LIST_PARTIALLY_VISIBLE" && pipelineResult.ingredients.length > 0) ||
                         (pipelineResult.ingredients.length > 0);

      return NextResponse.json({
        success: isAccepted,
        status: pipelineResult.status,
        message: pipelineResult.message,
        source: "client_webassembly_ocr",
        isPerfume: pipelineResult.productValidation.isFragranceProduct,
        fragranceType: pipelineResult.manufacturingInfo?.batchCode ? "Eau de Parfum" : "Fragrance Formulation",
        detectionReason: pipelineResult.productValidation.rationale,
        confidence: pipelineResult.overallConfidence,
        rawText: pipelineResult.rawIngredientText || rawText,
        rawIngredientText: pipelineResult.rawIngredientText,
        candidates: pipelineResult.ingredients.map((i) => i.name),
        ingredients: pipelineResult.ingredients,
        productValidation: pipelineResult.productValidation,
        imageQuality: pipelineResult.imageQuality,
        ingredientList: pipelineResult.ingredientList,
        manufacturingInfo: pipelineResult.manufacturingInfo,
        companyDetails: pipelineResult.companyDetails,
        companyAddress: pipelineResult.companyAddress,
        others: pipelineResult.others,
        categorized: pipelineResult.categorized,
        actionableGuidance: pipelineResult.imageQuality.actionableGuidance || pipelineResult.ingredientList.guidanceMessage
      });
    }

    // Branch B: Process image on server (using Gemini Vision AI if key available, or server Tesseract)
    if (!imageInput || imageInput.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          status: "OCR_LOW_CONFIDENCE",
          error: "No valid image payload or OCR text provided." 
        },
        { status: 400 }
      );
    }

    try {
      const ocrResult = await processImageOcr(imageInput, userApiKey);
      const pipelineResult = evaluateVisionOcrPipeline(
        ocrResult.rawText || "",
        ocrResult.confidence || 0.85,
        imageInput
      );

      const isAccepted = pipelineResult.status === "READY_FOR_REVIEW" || 
                         pipelineResult.status === "READY_FOR_ANALYSIS" ||
                         (pipelineResult.status === "INGREDIENT_LIST_PARTIALLY_VISIBLE" && pipelineResult.ingredients.length > 0) ||
                         (pipelineResult.ingredients.length > 0);

      return NextResponse.json({
        success: isAccepted,
        status: pipelineResult.status,
        message: pipelineResult.message,
        source: (userApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) ? "gemini_vision_ai" : "server_ocr",
        isPerfume: pipelineResult.productValidation.isFragranceProduct,
        fragranceType: ocrResult.fragranceType || "Fragrance Formulation",
        detectionReason: pipelineResult.productValidation.rationale,
        confidence: pipelineResult.overallConfidence,
        rawText: pipelineResult.rawIngredientText || ocrResult.rawText,
        rawIngredientText: pipelineResult.rawIngredientText,
        candidates: pipelineResult.ingredients.map((i) => i.name),
        ingredients: pipelineResult.ingredients,
        productValidation: pipelineResult.productValidation,
        imageQuality: pipelineResult.imageQuality,
        ingredientList: pipelineResult.ingredientList,
        manufacturingInfo: pipelineResult.manufacturingInfo || ocrResult.manufacturingInfo,
        companyDetails: pipelineResult.companyDetails || ocrResult.companyDetails,
        companyAddress: pipelineResult.companyAddress || ocrResult.companyAddress,
        others: pipelineResult.others || ocrResult.others,
        categorized: pipelineResult.categorized || ocrResult.categorized,
        actionableGuidance: pipelineResult.imageQuality.actionableGuidance || pipelineResult.ingredientList.guidanceMessage
      });
    } catch (ocrErr: any) {
      console.warn("Server OCR processing error:", ocrErr.message);
      return NextResponse.json(
        {
          success: false,
          status: "OCR_LOW_CONFIDENCE",
          error: "Optical character recognition could not resolve legible text from this image.",
          message: "Could not read text from this image. Please ensure the camera is steady, well lit, and focused on the printed ingredient box.",
          details: ocrErr.message,
          candidates: [],
          ingredients: []
        },
        { status: 422 }
      );
    }
  } catch (error: any) {
    console.error("General OCR Route Exception:", error);
    return NextResponse.json(
      { 
        success: false,
        status: "OCR_LOW_CONFIDENCE",
        error: "OCR processing failed", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
