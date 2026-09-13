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
  ScanLine
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

export const ImageDropzone: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [enhancedPreviewUrl, setEnhancedPreviewUrl] = useState<string | null>(null);
  const [showEnhancedPreview, setShowEnhancedPreview] = useState(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

  // Live camera mode
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Manual inputs & metadata
  const [manualText, setManualText] = useState("");
  const [perfumeName, setPerfumeName] = useState("");
  const [brandName, setBrandName] = useState("");

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [scanErrorMessage, setScanErrorMessage] = useState<string | null>(null);

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
    } catch (err) {
      console.warn("Image preprocessor fallback to raw file:", err);
      setProcessedBlob(file);
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

  // Main Scan Execution
  const handleStartReview = async () => {
    setScanErrorMessage(null);
    setIsProcessing(true);
    setProgressStep("Initializing Vision Engine...");
    setProgressPercent(5);

    let extracted: string[] = [];
    let detectedPerfumeName = perfumeName;
    let detectedBrandName = brandName;
    let provenanceData: any = null;

    // Mode A: Manual text entry
    if (activeTab === "manual" && manualText.trim()) {
      setProgressStep("Normalizing INCI chemical nomenclature...");
      setProgressPercent(80);

      extracted = manualText
        .split(/[,;\n\t]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1);

      setProgressPercent(100);
    } 
    // Mode B: Image OCR / Vision
    else if (selectedFile || processedBlob) {
      const activeBlob = processedBlob || selectedFile!;
      const userKey = apiKey.trim() || undefined;

      try {
        // Strategy 1: If user supplied a Gemini Vision key, use cloud AI vision for 99% accuracy
        if (userKey) {
          setProgressStep("Analyzing with Gemini Multimodal AI Vision...");
          setProgressPercent(30);

          const formData = new FormData();
          formData.append("image", activeBlob);
          formData.append("apiKey", userKey);

          const res = await fetch("/api/scan/ocr", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            extracted = data.candidates || [];
            detectedPerfumeName = data.manufacturingInfo?.brandName || perfumeName;
            provenanceData = data;
          } else {
            const errData = await res.json();
            throw new Error(errData.error || "Gemini Vision analysis could not read the image.");
          }
        } 
        // Strategy 2: High-Performance Client-Side WebAssembly OCR
        else {
          setProgressStep("Starting local optical engine...");
          setProgressPercent(15);

          // Run in-browser WebAssembly OCR with real-time progress callbacks
          const ocrResult = await runBrowserOcr(activeBlob, (step, percent) => {
            setProgressStep(step);
            setProgressPercent(percent);
          });

          setProgressStep("Harmonizing candidate tokens with INCI knowledge base...");
          setProgressPercent(90);

          // Send raw text to serverless route for instant regulatory classification & token harmonization
          const res = await fetch("/api/scan/ocr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              rawText: ocrResult.rawText,
              confidence: ocrResult.confidence,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            extracted = data.candidates || [];
            provenanceData = data;
          } else {
            // If server route unreachable, do client-side token fallback
            const rawTokens = ocrResult.rawText
              .split(/[,;\n\r\t]+/)
              .map((t) => t.replace(/[^a-zA-Z0-9\s\-'.()/]/g, "").trim().toUpperCase())
              .filter((t) => t.length > 2 && !/^\d+$/.test(t));
            extracted = rawTokens;
          }
        }
      } catch (err: any) {
        console.error("Scan processing error:", err);
        setIsProcessing(false);
        setScanErrorMessage(
          err.message || "Could not resolve legible cosmetic text from this photo. Please ensure clear lighting and focus on the ingredient list."
        );
        return;
      }
    }

    // Check if any ingredients were detected
    if (extracted.length === 0) {
      setIsProcessing(false);
      setScanErrorMessage(
        "No cosmetic ingredients could be detected in this photo. Perfume packaging can have reflective glass or fine print. Please try capturing closer to the ingredient box in bright light, or enter them manually."
      );
      return;
    }

    // Store in session and proceed to review checkpoint
    if (typeof window !== "undefined") {
      sessionStorage.setItem("olfexa_review_ingredients", JSON.stringify(extracted));
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
            relevance: provenanceData.relevance,
            manufacturingInfo: provenanceData.manufacturingInfo || {},
            companyDetails: provenanceData.companyDetails || {},
            companyAddress: provenanceData.companyAddress || {},
          })
        );
      }
    }

    setProgressStep("Scan successful! Directing to Ingredient Review Checkpoint...");
    setProgressPercent(100);

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
              setActiveTab("manual");
              stopCamera();
              setScanErrorMessage(null);
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

      {/* Error Alert Banner */}
      {scanErrorMessage && (
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">Scan Notice</span>
            <p>{scanErrorMessage}</p>
          </div>
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

          {/* Progress Bar during Scanning */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/90 dark:border-emerald-900/40 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-medium text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>{progressStep}</span>
                </span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-emerald-200/60 dark:bg-emerald-900/60 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
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
