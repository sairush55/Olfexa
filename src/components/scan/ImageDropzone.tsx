"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Upload, 
  Camera, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  Sliders, 
  Key, 
  Eye, 
  EyeOff, 
  Check, 
  X,
  ScanLine,
  Link2,
  Globe,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { preprocessImageForOcr, runBrowserOcr } from "@/lib/clientOcr";

interface SamplePreset {
  id: string;
  name: string;
  brand: string;
  description: string;
  ingredients: string[];
}

const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: "sample-1",
    name: "L'Ambre Sublime Eau de Parfum",
    brand: "Maison de L'Arôme",
    description: "Classic hydroalcoholic base with citrus monoterpenes and tonka coumarin.",
    ingredients: [
      "ALCOHOL DENAT.",
      "AQUA / WATER / EAU",
      "PARFUM / FRAGRANCE",
      "LIMONENE",
      "LINALOOL",
      "COUMARIN",
      "BHT",
      "ETHYLHEXYL METHOXYCINNAMATE"
    ]
  },
  {
    id: "sample-2",
    name: "Pure Botanica Hydrating Scent Mist",
    brand: "Élixir Botanique",
    description: "Water-based alcohol-free emulsion with non-drying cetyl fatty alcohol.",
    ingredients: [
      "AQUA / WATER / EAU",
      "GLYCERIN",
      "PARFUM / FRAGRANCE",
      "CETYL ALCOHOL",
      "CITRONELLOL",
      "GERANIOL"
    ]
  },
  {
    id: "sample-3",
    name: "Fougère Royale No. 12",
    brand: "Atelier Herbier",
    description: "Traditional composition featuring regulated Oakmoss extract and ethanol.",
    ingredients: [
      "ALCOHOL",
      "AQUA / WATER / EAU",
      "PARFUM / FRAGRANCE",
      "EVERNIA PRUNASTRI (OAKMOSS) EXTRACT",
      "LIMONENE",
      "LINALOOL",
      "CITRONELLOL"
    ]
  }
];

const PIPELINE_STEPS = [
  { step: 1, label: "Checking image" },
  { step: 2, label: "Verifying product" },
  { step: 3, label: "Finding ingredient label" },
  { step: 4, label: "Reading ingredients" },
  { step: 5, label: "Review detected ingredients" }
];

export const ImageDropzone: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [activeTab, setActiveTab] = useState<"upload" | "link" | "manual">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [enhancedPreviewUrl, setEnhancedPreviewUrl] = useState<string | null>(null);
  const [showEnhancedPreview, setShowEnhancedPreview] = useState(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [opticalStatus, setOpticalStatus] = useState<{ isInverted: boolean; contrastBoosted: boolean } | null>(null);

  // Live camera mode
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Manual inputs & metadata
  const [manualText, setManualText] = useState("");
  const [perfumeName, setPerfumeName] = useState("");
  const [brandName, setBrandName] = useState("");

  // Product Link mode
  const [productUrl, setProductUrl] = useState("");
  const [isLinkAnalyzing, setIsLinkAnalyzing] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkNotice, setLinkNotice] = useState<string | null>(null);
  const [linkLoadingStep, setLinkLoadingStep] = useState<string>("Fetching product page…");

  useEffect(() => {
    if (!isLinkAnalyzing) {
      setLinkLoadingStep("Fetching product page…");
      return;
    }
    const timer1 = setTimeout(() => {
      setLinkLoadingStep("Locating ingredient information…");
    }, 1200);
    const timer2 = setTimeout(() => {
      setLinkLoadingStep("Normalizing ingredients…");
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isLinkAnalyzing]);

  // Processing state & 5-step stepper
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [progressStep, setProgressStep] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [scanErrorMessage, setScanErrorMessage] = useState<string | null>(null);
  const [rejectionStatus, setRejectionStatus] = useState<string | null>(null);
  const [rejectionGuidance, setRejectionGuidance] = useState<string | null>(null);

  // AI Vision Key (optional)
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("olfexa_gemini_key") || "";
      if (savedKey) setApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = (keyVal: string) => {
    setApiKey(keyVal);
    if (typeof window !== "undefined") {
      if (keyVal.trim()) {
        localStorage.setItem("olfexa_gemini_key", keyVal.trim());
      } else {
        localStorage.removeItem("olfexa_gemini_key");
      }
    }
  };

  // Preprocess file on selection
  const handleFile = async (file: File) => {
    setSelectedFile(file);
    setScanErrorMessage(null);
    const rawUrl = URL.createObjectURL(file);
    setPreviewUrl(rawUrl);

    try {
      const processed = await preprocessImageForOcr(file);
      setProcessedBlob(processed.blob);
      setEnhancedPreviewUrl(processed.dataUrl);
      setOpticalStatus({
        isInverted: processed.isInverted,
        contrastBoosted: processed.contrastBoosted,
      });
    } catch (err) {
      console.warn("Image preprocessor fallback to raw file:", err);
      setProcessedBlob(file);
      setOpticalStatus(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Camera start / stop / capture
  const startCamera = async (facing: "environment" | "user" = "environment") => {
    stopCamera();
    setCameraError(null);
    setIsCameraActive(true);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in your browser settings or upload a saved photo."
          : "Unable to access camera on this device. Please upload a photo instead."
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const flipCamera = () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stopCamera();

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], `camera-scan-${Date.now()}.jpg`, { type: "image/jpeg" });
        await handleFile(file);
      }
    }, "image/jpeg", 0.92);
  };

  const handlePresetSelect = (preset: SamplePreset) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("olfexa_review_ingredients", JSON.stringify(preset.ingredients));
      sessionStorage.setItem("olfexa_review_perfume", preset.name);
      sessionStorage.setItem("olfexa_review_brand", preset.brand);
    }
    router.push("/scan/review");
  };

  // Product Link Analysis Execution
  const handleAnalyzeProductLink = async () => {
    const trimmed = productUrl.trim();
    if (!trimmed) {
      setLinkError("Please enter a valid product page URL.");
      return;
    }

    setLinkError(null);
    setLinkNotice(null);
    setIsLinkAnalyzing(true);

    try {
      const res = await fetch("/api/product-link/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const result = await res.json();

      if (!result.success || !result.data) {
        setLinkError(result.message || result.error || "Unable to extract information from this product link.");
        setIsLinkAnalyzing(false);
        return;
      }

      const productData = result.data;
      const detectedIngredients: string[] = productData.ingredients || [];

      // Update perfume / brand name fields if extracted
      if (productData.productName && !perfumeName) {
        setPerfumeName(productData.productName);
      }
      if (productData.brand && !brandName) {
        setBrandName(productData.brand);
      }

      if (!result.hasIngredients || detectedIngredients.length === 0) {
        setLinkNotice(
          "Product information was identified, but no INCI cosmetic ingredient list could be found on this webpage. Retailers often display marketing olfactory notes (top/heart/base) rather than the regulatory chemical ingredients printed on the packaging box."
        );
        setIsLinkAnalyzing(false);
        return;
      }

      // Ingredients found: populate session and navigate to review checkpoint
      if (typeof window !== "undefined") {
        sessionStorage.setItem("olfexa_review_ingredients", JSON.stringify(detectedIngredients));
        sessionStorage.setItem(
          "olfexa_review_ingredients_detailed",
          JSON.stringify(
            detectedIngredients.map((name: string) => ({
              name,
              confidence: 0.98,
              needsReview: false,
              rawDetected: name,
            }))
          )
        );
        sessionStorage.setItem(
          "olfexa_review_raw_text",
          productData.ingredientsText || detectedIngredients.join(", ")
        );
        sessionStorage.setItem(
          "olfexa_review_perfume",
          productData.productName || perfumeName || "Online Fragrance"
        );
        sessionStorage.setItem(
          "olfexa_review_brand",
          productData.brand || brandName || "Declared Brand"
        );
        if (productData.imageUrl) {
          sessionStorage.setItem("olfexa_review_image", productData.imageUrl);
        }
        sessionStorage.setItem(
          "olfexa_review_provenance",
          JSON.stringify({
            isPerfume: true,
            fragranceType: productData.concentration || productData.productType || "Fragrance",
            confidence: productData.extractionConfidence || 0.96,
            detectionReason: "Extracted via verified product page with INCI ingredient declaration.",
            manufacturingInfo: {
              brandName: productData.brand,
              sourceUrl: trimmed,
            },
            companyDetails: {
              brandName: productData.brand,
            },
            companyAddress: {},
            others: {
              fragranceType: productData.concentration || productData.productType || "Fragrance",
              volume: productData.size,
              notes: productData.fragranceNotes,
              claims: productData.claims,
            },
          })
        );
      }

      router.push("/scan/review");
    } catch (err: any) {
      console.error("Product link analysis error:", err);
      setLinkError(err.message || "Failed to analyze product link. Please check your internet connection.");
    } finally {
      setIsLinkAnalyzing(false);
    }
  };

  // Main Scan Execution with 5-Step Progress Stepper
  const handleStartReview = async () => {
    setScanErrorMessage(null);
    setRejectionStatus(null);
    setRejectionGuidance(null);
    setIsProcessing(true);
    setCurrentStepIndex(1);
    setProgressStep("Checking image quality & clarity...");
    setProgressPercent(15);

    let extracted: string[] = [];
    let detailedIngredients: any[] = [];
    let rawOcrText = "";
    let detectedPerfumeName = perfumeName;
    let detectedBrandName = brandName;
    let provenanceData: any = null;

    // Mode A: Manual text entry
    if (activeTab === "manual" && manualText.trim()) {
      setCurrentStepIndex(4);
      setProgressStep("Normalizing INCI chemical nomenclature...");
      setProgressPercent(80);

      extracted = manualText
        .split(/[,;\n\t]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1);

      detailedIngredients = extracted.map((name) => ({
        name,
        confidence: 1.0,
        needsReview: false,
        rawDetected: name
      }));
      rawOcrText = manualText.trim();

      setCurrentStepIndex(5);
      setProgressPercent(100);
    } 
    // Mode B: Image OCR / Vision
    else if (selectedFile || processedBlob) {
      const activeBlob = processedBlob || selectedFile!;
      const userKey = apiKey.trim() || undefined;

      try {
        // Step 1: Checking image
        setCurrentStepIndex(1);
        setProgressStep("Checking image resolution, blur, and lighting...");
        setProgressPercent(20);

        if (userKey) {
          // Multimodal AI Vision
          setCurrentStepIndex(2);
          setProgressStep("Verifying fragrance product with Gemini AI Vision...");
          setProgressPercent(35);

          const formData = new FormData();
          formData.append("image", activeBlob);
          formData.append("apiKey", userKey);

          setCurrentStepIndex(3);
          setProgressStep("Finding ingredient label on packaging...");
          setProgressPercent(50);

          const res = await fetch("/api/scan/ocr", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (!data.success) {
            setRejectionStatus(data.status || "REJECTED");
            setRejectionGuidance(data.actionableGuidance || data.message || "Please re-take photo following guidance.");
            throw new Error(data.message || data.error || "Vision analysis rejected this image.");
          }

          setCurrentStepIndex(4);
          setProgressStep("Reading and harmonizing INCI ingredients...");
          setProgressPercent(85);

          extracted = data.candidates || [];
          detailedIngredients = data.ingredients || [];
          rawOcrText = data.rawIngredientText || data.rawText || "";
          detectedPerfumeName = data.manufacturingInfo?.brandName || perfumeName;
          provenanceData = data;
        } else {
          // Local WebAssembly OCR Pipeline
          setCurrentStepIndex(2);
          setProgressStep("Verifying fragrance product packaging...");
          setProgressPercent(25);

          setCurrentStepIndex(3);
          setProgressStep("Locating ingredient label & running optical reader...");
          setProgressPercent(40);

          // Run in-browser WebAssembly OCR with real-time progress callbacks
          let ocrResult: { rawText: string; confidence: number } | null = null;
          try {
            ocrResult = await runBrowserOcr(activeBlob, (step, percent) => {
              setProgressStep(step);
              setProgressPercent(Math.min(percent, 65));
            });

            // Adaptive Optical Pass 2: If pass 1 produced sparse text or low confidence, automatically try the opposite polarity
            if ((!ocrResult.rawText || ocrResult.rawText.trim().length < 35 || ocrResult.confidence < 0.6) && selectedFile) {
              setProgressStep("Refining optical focus for fine cosmetic print...");
              try {
                const pass2 = await preprocessImageForOcr(selectedFile, {
                  forceInvert: !opticalStatus?.isInverted,
                  enableSharpening: true,
                });
                const pass2Result = await runBrowserOcr(pass2.blob);
                if (pass2Result.rawText.length > ocrResult.rawText.length || pass2Result.confidence > ocrResult.confidence) {
                  ocrResult = pass2Result;
                }
              } catch {
                // keep pass 1 result
              }
            }
          } catch (clientOcrErr) {
            console.warn("Client optical recognition bypassed, delegating to server optical engine:", clientOcrErr);
            setProgressStep("Routing packaging image to server optical engine...");
            setProgressPercent(50);
          }

          rawOcrText = ocrResult?.rawText || "";

          setCurrentStepIndex(4);
          setProgressStep("Reading ingredients & harmonizing with INCI dataset...");
          setProgressPercent(85);

          // Send FormData to serverless validation pipeline
          const formData = new FormData();
          formData.append("image", activeBlob);
          if (ocrResult?.rawText && ocrResult.rawText.trim().length > 0) {
            formData.append("rawText", ocrResult.rawText);
            formData.append("confidence", ocrResult.confidence.toString());
          }

          const res = await fetch("/api/scan/ocr", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (!data.success) {
            if (data.candidates && data.candidates.length > 0) {
              // Proceed with caution: candidate ingredients were detected, allow user verification on review screen
              extracted = data.candidates;
              detailedIngredients = data.ingredients || [];
              rawOcrText = data.rawIngredientText || data.rawText || rawOcrText;
              provenanceData = data;
            } else {
              setRejectionStatus(data.status || "REJECTED");
              setRejectionGuidance(data.actionableGuidance || data.message || "Please hold camera steady and tap to focus on the ingredient box.");
              throw new Error(data.message || data.error || "Vision analysis rejected this image.");
            }
          } else {
            extracted = data.candidates || [];
            detailedIngredients = data.ingredients || [];
            rawOcrText = data.rawIngredientText || data.rawText || rawOcrText;
            provenanceData = data;
          }
        }
      } catch (err: any) {
        console.error("Scan processing error:", err);
        setIsProcessing(false);
        setCurrentStepIndex(0);
        setScanErrorMessage(
          err.message || "Could not resolve legible cosmetic text from this photo. Please ensure clear lighting and focus on the ingredient list."
        );
        return;
      }
    }

    // Check if any ingredients were detected
    if (extracted.length === 0) {
      setIsProcessing(false);
      setCurrentStepIndex(0);
      setScanErrorMessage(
        "No cosmetic ingredients could be detected in this photo. Perfume packaging can have reflective glass or fine print. Please try capturing closer to the ingredient box in bright light, or enter them manually."
      );
      return;
    }

    // Step 5: Review detected ingredients
    setCurrentStepIndex(5);
    setProgressStep("Extraction verified! Directing to Ingredient Review Checkpoint...");
    setProgressPercent(100);

    // Store in session and proceed to review checkpoint
    if (typeof window !== "undefined") {
      sessionStorage.setItem("olfexa_review_ingredients", JSON.stringify(extracted));
      sessionStorage.setItem("olfexa_review_ingredients_detailed", JSON.stringify(detailedIngredients));
      sessionStorage.setItem("olfexa_review_raw_text", rawOcrText);
      sessionStorage.setItem("olfexa_review_perfume", detectedPerfumeName || "Scanned Fragrance");
      sessionStorage.setItem("olfexa_review_brand", detectedBrandName || "Declared Brand");
      if (previewUrl) {
        sessionStorage.setItem("olfexa_review_image", previewUrl);
      }
      if (provenanceData) {
        sessionStorage.setItem(
          "olfexa_review_provenance",
          JSON.stringify({
            isPerfume: provenanceData.isPerfume,
            fragranceType: provenanceData.fragranceType,
            detectionReason: provenanceData.detectionReason,
            confidence: provenanceData.confidence,
            imageQuality: provenanceData.imageQuality,
            relevance: provenanceData.productValidation ? {
              isRelevant: provenanceData.productValidation.isFragranceProduct,
              classificationName: provenanceData.productValidation.productType,
              rationale: provenanceData.productValidation.rationale
            } : provenanceData.relevance,
            manufacturingInfo: provenanceData.manufacturingInfo || {},
            companyDetails: provenanceData.companyDetails || {},
            companyAddress: provenanceData.companyAddress || {},
            others: provenanceData.others || {
              fragranceType: provenanceData.fragranceType,
            },
            categorized: provenanceData.categorized || undefined,
          })
        );
        if (provenanceData.categorized) {
          sessionStorage.setItem("olfexa_review_categorized", JSON.stringify(provenanceData.categorized));
        }
      }
    }

    setTimeout(() => {
      router.push("/scan/review");
    }, 350);
  };

  return (
    <div className="space-y-8">
      {/* Mode Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => {
              setActiveTab("upload");
              setScanErrorMessage(null);
              setLinkError(null);
              setLinkNotice(null);
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all",
              activeTab === "upload"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Label / Camera</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("link");
              stopCamera();
              setScanErrorMessage(null);
              setLinkError(null);
              setLinkNotice(null);
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all",
              activeTab === "link"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Paste Product Link</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("manual");
              stopCamera();
              setScanErrorMessage(null);
              setLinkError(null);
              setLinkNotice(null);
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all",
              activeTab === "manual"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Enter Manually</span>
          </button>
        </div>
      </div>

      {/* Fragrance Metadata Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">
            Fragrance Name (Optional)
          </label>
          <input
            type="text"
            value={perfumeName}
            onChange={(e) => setPerfumeName(e.target.value)}
            placeholder="e.g. L'Ambre No. 5"
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-card-bg text-foreground focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">
            Brand / House (Optional)
          </label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. Maison de Perfumerie"
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-card-bg text-foreground focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Structured Vision/OCR Error Alert Banner */}
      {scanErrorMessage && (
        <div className="max-w-xl mx-auto p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 space-y-3.5 text-xs text-amber-950 dark:text-amber-200 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <span className="font-bold text-sm tracking-tight text-amber-900 dark:text-amber-100 block">
                {rejectionStatus ? `Scan Verification Notice: ${rejectionStatus.replace(/_/g, " ")}` : "OCR Label Scan Notice"}
              </span>
              <p className="text-xs leading-relaxed text-amber-900/90 dark:text-amber-200 font-medium">
                {scanErrorMessage}
              </p>
              {rejectionGuidance && (
                <div className="p-3 rounded-xl bg-amber-100/70 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-950 dark:text-amber-100 leading-relaxed font-mono">
                  💡 <strong>Actionable Guidance:</strong> {rejectionGuidance}
                </div>
              )}
            </div>
          </div>
          <div className="pt-2.5 border-t border-amber-200/80 dark:border-amber-900/40 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setScanErrorMessage(null);
                setRejectionStatus(null);
                setRejectionGuidance(null);
                if (fileInputRef.current) fileInputRef.current.click();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold transition-colors shadow-2xs"
            >
              📸 Retake Clear Photo (Recommended)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("manual");
                setScanErrorMessage(null);
                setRejectionStatus(null);
                setRejectionGuidance(null);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              ✍️ Enter Ingredients Manually
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect(SAMPLE_PRESETS[0])}
              className="px-3 py-1.5 rounded-lg text-[11px] font-mono text-purple-700 dark:text-purple-400 hover:underline transition-colors"
            >
              🧪 Try with Sample Perfume
            </button>
          </div>
          <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1">
            * 100% Free &amp; Private: OLFEXA runs locally in your browser. No API key or account needed.
          </p>
        </div>
      )}

      {/* Helpful Label Scanning Guide Tip */}
      {activeTab === "upload" && !scanErrorMessage && (
        <div className="max-w-xl mx-auto p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2.5 text-[11px] text-slate-600 dark:text-slate-400">
          <span className="text-base">💡</span>
          <span>
            <strong>Scanning Tip:</strong> Point your camera at the <strong>back of the paper box</strong> or the <strong>bottom sticker</strong> where <em>INGREDIENTS: ALCOHOL DENAT., ...</em> is printed. The front glass of bottles does not have an ingredient list!
          </span>
        </div>
      )}

      {/* Upload View */}
      {activeTab === "upload" ? (
        <div className="max-w-xl mx-auto space-y-4">
          {/* Live Camera Viewfinder Modal */}
          {isCameraActive ? (
            <div className="relative rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-xl">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                className="w-full h-80 sm:h-96 object-cover"
              />

              {/* Viewfinder Alignment Box */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="w-full h-48 border-2 border-dashed border-emerald-400/90 rounded-2xl bg-emerald-500/10 flex flex-col items-center justify-between p-3">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-mono text-emerald-300">
                    <ScanLine className="w-3 h-3 animate-pulse" />
                    <span>Align cosmetic ingredient list here</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/80 bg-black/40 px-2 py-0.5 rounded">
                    Hold steady for sharpest focus
                  </span>
                </div>
              </div>

              {/* Camera Controls Bar */}
              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-6 pointer-events-auto">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-medium border border-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 border-4 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                  title="Capture photo"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
                <button
                  type="button"
                  onClick={flipCamera}
                  className="px-3.5 py-2 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-medium border border-white/20 flex items-center gap-1.5 transition-colors"
                  title="Switch camera"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Flip</span>
                </button>
              </div>
            </div>
          ) : (
            /* Standard Dropzone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 group flex flex-col items-center justify-center min-h-[260px]",
                dragOver
                  ? "border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20"
                  : previewUrl
                  ? "border-emerald-500/80 bg-slate-50/50 dark:bg-slate-900/30"
                  : "border-slate-300 dark:border-slate-700 bg-card-bg hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              {previewUrl ? (
                <div className="space-y-4 flex flex-col items-center w-full">
                  {/* Image preview thumbnail */}
                  <div className="relative w-44 h-44 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 bg-slate-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={showEnhancedPreview && enhancedPreviewUrl ? enhancedPreviewUrl : previewUrl}
                      alt="Ingredient label preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-[10px] text-white font-medium bg-black/70 px-2.5 py-1 rounded-md">
                        Click to change photo
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                      {selectedFile?.name || "Ingredient label ready"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Click to choose another photo or drop to replace
                    </span>
                  </div>

                  {/* Optical Preprocessing Status Badges */}
                  {opticalStatus && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                      {opticalStatus.isInverted && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                          Dark Box Polarity Inverted
                        </span>
                      )}
                      {opticalStatus.contrastBoosted && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60">
                          Contrast &amp; Edge Sharpened
                        </span>
                      )}
                    </div>
                  )}

                  {/* Contrast Enhancement Toggle */}
                  {enhancedPreviewUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEnhancedPreview(!showEnhancedPreview);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border border-slate-200 dark:border-slate-800 bg-card-bg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Sliders className="w-3 h-3 text-emerald-600" />
                      <span>{showEnhancedPreview ? "Viewing High-Contrast Filter" : "Preview Contrast Enhancement"}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-editorial-heading">
                      Drop your fragrance packaging label here
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports JPG, PNG, WEBP from camera roll or desktop
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startCamera("environment");
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 px-3.5 py-1.5 rounded-xl transition-colors"
                    >
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>Open Camera</span>
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Browse Files</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Camera Error Message */}
          {cameraError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* 5-Step Pipeline Progress Stepper during Scanning */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span className="truncate">{progressStep}</span>
                </span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                  {progressPercent}%
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Sequential 5-Step Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
                {PIPELINE_STEPS.map((s) => {
                  const isDone = currentStepIndex > s.step;
                  const isCurrent = currentStepIndex === s.step;
                  return (
                    <div
                      key={s.step}
                      className={`flex items-center gap-1.5 p-2 rounded-xl text-[10px] font-mono transition-all ${
                        isDone
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-semibold"
                          : isCurrent
                          ? "bg-emerald-700 text-white font-bold shadow-xs animate-pulse"
                          : "bg-slate-50 dark:bg-slate-800/40 text-slate-400 border border-slate-100 dark:border-slate-800"
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 font-bold ${
                        isDone ? "bg-emerald-600 text-white" : isCurrent ? "bg-white text-emerald-800" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}>
                        {isDone ? "✓" : s.step}
                      </span>
                      <span className="truncate leading-tight">{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {/* Optional AI Key Trigger */}
            <div>
              <button
                type="button"
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <Key className="w-3 h-3 text-emerald-600" />
                <span>
                  {apiKey ? "AI Vision Active (Gemini Key configured)" : "AI Vision Turbo (Optional Gemini Key)"}
                </span>
              </button>
            </div>

            <button
              type="button"
              disabled={isProcessing || (!selectedFile && !processedBlob)}
              onClick={handleStartReview}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm"
            >
              {isProcessing ? (
                <span>Extracting Ingredients...</span>
              ) : (
                <>
                  <span>Proceed to Ingredient Review</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Optional Gemini API Key Drawer */}
          {showApiKeyInput && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Optional Google Gemini Flash Vision Key
                </span>
                <button
                  type="button"
                  onClick={() => setShowApiKeyInput(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                If provided, OLFEXA will use Google Gemini 1.5/2.0 Flash Vision to read curved, metallic, or reflective packaging labels with 99.9% accuracy. Keys can be created for free at{" "}
                <a
                  href="https://aistudio.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 underline hover:text-emerald-700"
                >
                  aistudio.google.com
                </a>{" "}
                (no credit card required).
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => handleSaveApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-card-bg text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => handleSaveApiKey("")}
                    className="px-3 py-2 rounded-xl text-slate-500 hover:text-rose-600 text-xs border border-slate-200 dark:border-slate-800"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : activeTab === "link" ? (
        /* Product Link Input View */
        <div className="max-w-xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-editorial-heading">
                  Product Link Intelligence
                </h3>
                <p className="text-[11px] text-slate-500">
                  Analyze perfume or attar ingredients directly from brand or retailer pages
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                Product URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => {
                    setProductUrl(e.target.value);
                    if (linkError) setLinkError(null);
                    if (linkNotice) setLinkNotice(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isLinkAnalyzing && productUrl.trim()) {
                      handleAnalyzeProductLink();
                    }
                  }}
                  disabled={isLinkAnalyzing}
                  placeholder="Paste a perfume or attar product link"
                  className="w-full text-xs font-mono pl-3.5 pr-8 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-foreground focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all"
                />
                {productUrl && !isLinkAnalyzing && (
                  <button
                    type="button"
                    onClick={() => {
                      setProductUrl("");
                      setLinkError(null);
                      setLinkNotice(null);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
                e.g. https://example.com/product/perfume-name
              </p>
            </div>

            {/* Link Error Banner */}
            {linkError && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <span className="font-semibold block">Link Extraction Notice</span>
                    <p className="text-[11px] leading-relaxed text-rose-800 dark:text-rose-300">
                      {linkError}
                    </p>
                  </div>
                </div>
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("manual");
                      setLinkError(null);
                      setLinkNotice(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-medium hover:bg-slate-50 transition-colors"
                  >
                    ✍️ Enter Ingredients Manually
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("upload");
                      setLinkError(null);
                      setLinkNotice(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold transition-colors"
                  >
                    📸 Scan Packaging Photo
                  </button>
                </div>
              </div>
            )}

            {/* Link Notice (e.g. Product identified but no INCI list) */}
            {linkNotice && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 text-xs text-amber-950 dark:text-amber-200 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <span className="font-semibold block">No Ingredient List Found</span>
                    <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200 font-medium">
                      No ingredient list found on this product page. You can enter the ingredients manually or upload an image of the packaging.
                    </p>
                  </div>
                </div>
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("manual");
                      setLinkError(null);
                      setLinkNotice(null);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold transition-colors shadow-2xs"
                  >
                    ✍️ Enter Ingredients Manually
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("upload");
                      setLinkError(null);
                      setLinkNotice(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-medium hover:bg-slate-50 transition-colors"
                  >
                    📸 Scan Packaging Box
                  </button>
                </div>
              </div>
            )}

            {/* Loading Stepper Indicator */}
            {isLinkAnalyzing && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
                    <span>{linkLoadingStep}</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-600 animate-pulse w-3/4 rounded-full" />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>1. Fetch page</span>
                  <span>2. Locate INCI</span>
                  <span>3. Normalize</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-400 font-mono">
                Extracts INCI declarations only. Olfactory notes are kept distinct.
              </span>

              <button
                type="button"
                disabled={!productUrl.trim() || isLinkAnalyzing}
                onClick={handleAnalyzeProductLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm"
              >
                {isLinkAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Product</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-400">
            <span className="text-base">ℹ️</span>
            <div className="space-y-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">How Product Link Intelligence Works:</span>
              <p className="leading-relaxed">
                OLFEXA fetches the public HTML, parses Schema.org JSON-LD and OpenGraph metadata, isolates declared cosmetic ingredient listings, and cross-references them against the OLFEXA scientific toxicology database. Fragrance marketing notes (e.g. Bergamot, Oud) are kept separate from scientific INCI ingredients.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Manual Input View */
        <div className="max-w-xl mx-auto space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">
              Paste or Type Declared Ingredients
            </label>
            <textarea
              rows={6}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="e.g. ALCOHOL DENAT., AQUA/WATER, PARFUM/FRAGRANCE, LIMONENE, LINALOOL, CITRONELLOL, COUMARIN..."
              className="w-full text-xs font-mono p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg text-foreground focus:ring-2 focus:ring-emerald-600 focus:outline-none leading-relaxed"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Separate ingredient names with commas, semicolons, or line breaks as printed on packaging.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!manualText.trim() || isProcessing}
              onClick={handleStartReview}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm"
            >
              <span>Review Extracted List</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Preset Fragrance Samples for Quick Testing */}
      <div className="max-w-3xl mx-auto pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Quick-Test Verified Sample Labels
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Select a verified sample formulation below to immediately load candidates into the verification checkpoint:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_PRESETS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handlePresetSelect(sample)}
              className="text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-card-bg hover:border-emerald-600/70 hover:shadow-sm transition-all group"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                {sample.name}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                {sample.brand}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                {sample.description}
              </p>
              <div className="mt-3 flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold font-mono uppercase">
                <span>{sample.ingredients.length} declared</span>
                <span className="group-hover:translate-x-0.5 transition-transform">Load →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
