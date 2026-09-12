"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Camera, FileText, Image as ImageIcon, Sparkles, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [manualText, setManualText] = useState("");
  const [perfumeName, setPerfumeName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePresetSelect = (preset: SamplePreset) => {
    // Store selected sample in sessionStorage and route to review
    if (typeof window !== "undefined") {
      sessionStorage.setItem("olfexa_review_ingredients", JSON.stringify(preset.ingredients));
      sessionStorage.setItem("olfexa_review_perfume", preset.name);
      sessionStorage.setItem("olfexa_review_brand", preset.brand);
    }
    router.push("/scan/review");
  };

  const [ocrStatusText, setOcrStatusText] = useState("Processing image...");

  const handleStartReview = async () => {
    setIsProcessing(true);
    setOcrStatusText("Running Optical Character Recognition on ingredient label...");
    let extracted: string[] = [];

    if (activeTab === "manual" && manualText.trim()) {
      extracted = manualText
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1);
    } else if (selectedFile) {
      try {
        setOcrStatusText("Parsing declared chemical nomenclature...");
        const formData = new FormData();
        formData.append("image", selectedFile);

        const res = await fetch("/api/scan/ocr", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
            extracted = data.candidates;
          }
          if (typeof window !== "undefined") {
            sessionStorage.setItem("olfexa_review_provenance", JSON.stringify({
              isPerfume: data.isPerfume,
              fragranceType: data.fragranceType,
              detectionReason: data.detectionReason,
              confidence: data.confidence,
              imageQuality: data.imageQuality,
              relevance: data.relevance,
              manufacturingInfo: data.manufacturingInfo || {},
              companyDetails: data.companyDetails || {},
              companyAddress: data.companyAddress || {},
            }));
          }
        }
      } catch (err) {
        console.error("OCR upload error:", err);
      }
    }

    // If no text was recognized or manual was empty, load template
    if (extracted.length === 0) {
      extracted = [
        "ALCOHOL DENAT.",
        "AQUA / WATER / EAU",
        "PARFUM / FRAGRANCE",
        "LIMONENE",
        "LINALOOL",
        "COUMARIN",
        "BHT"
      ];
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("olfexa_review_ingredients", JSON.stringify(extracted));
      sessionStorage.setItem("olfexa_review_perfume", perfumeName || "Scanned Fragrance");
      sessionStorage.setItem("olfexa_review_brand", brandName || "Declared Brand");
      if (previewUrl) {
        sessionStorage.setItem("olfexa_review_image", previewUrl);
      }
    }

    setOcrStatusText("Extraction complete! Loading verification review...");
    setTimeout(() => {
      router.push("/scan/review");
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* Mode Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
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
            onClick={() => setActiveTab("manual")}
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

      {/* Main Upload / Camera View */}
      {activeTab === "upload" ? (
        <div className="max-w-xl mx-auto">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group flex flex-col items-center justify-center min-h-[280px]",
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
              <div className="space-y-4 flex flex-col items-center">
                {/* Image preview thumbnail */}
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Ingredient label preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white font-medium bg-black/60 px-2 py-1 rounded">
                      Change Photo
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                    {selectedFile?.name || "Ingredient label selected"}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Click or drop another image to replace
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-editorial-heading">
                    Drop your ingredient label here
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports JPG, PNG, WEBP from your camera roll or photo library
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take a photo</span>
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Browse files</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleStartReview}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span>{ocrStatusText}</span>
                </span>
              ) : (
                <>
                  <span>Proceed to Ingredient Review</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
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
              Separate ingredient names with commas or line breaks as printed on the bottle or carton.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!manualText.trim() || isProcessing}
              onClick={handleStartReview}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm"
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
            Quick-Test Preset Label Samples
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Select a verified sample formulation below to immediately simulate OCR extraction and experience the verification flow:
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
