"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  ImageIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  MapPin, 
  PackageCheck, 
  ShieldAlert, 
  Clock, 
  Edit3,
  Layers,
  Flame,
  Barcode,
  Globe,
  Sliders,
  Sparkles
} from "lucide-react";
import { IngredientReviewList } from "@/components/scan/IngredientReviewList";
import { PackagingProvenance, ExtractedOcrIngredient } from "@/types";
import { DisclaimerBanner } from "@/components/brand/DisclaimerBanner";

const DEFAULT_REVIEW_INGREDIENTS = [
  "ALCOHOL DENAT.",
  "AQUA / WATER / EAU",
  "PARFUM / FRAGRANCE",
  "LIMONENE",
  "LINALOOL",
  "COUMARIN",
  "BHT",
  "ETHYLHEXYL METHOXYCINNAMATE"
];

const EMPTY_PROVENANCE: PackagingProvenance = {
  isPerfume: true,
  fragranceType: "Cosmetic Formulation",
  confidence: 0.85,
  detectionReason: "Packaging label inspection.",
  manufacturingInfo: {},
  companyDetails: {},
  companyAddress: {},
  others: {
    fragranceType: "Cosmetic Formulation",
    safetyWarnings: [],
  }
};

export default function ReviewPage() {
  const [ingredients, setIngredients] = useState<string[]>(DEFAULT_REVIEW_INGREDIENTS);
  const [detailedIngredients, setDetailedIngredients] = useState<ExtractedOcrIngredient[] | undefined>(undefined);
  const [rawOcrText, setRawOcrText] = useState<string | undefined>(undefined);
  const [perfumeName, setPerfumeName] = useState("Scanned Fragrance");
  const [brandName, setBrandName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [provenance, setProvenance] = useState<PackagingProvenance>(EMPTY_PROVENANCE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("olfexa_review_ingredients");
      const storedDetailed = sessionStorage.getItem("olfexa_review_ingredients_detailed");
      const storedRaw = sessionStorage.getItem("olfexa_review_raw_text");
      const storedName = sessionStorage.getItem("olfexa_review_perfume");
      const storedBrand = sessionStorage.getItem("olfexa_review_brand");
      const storedImg = sessionStorage.getItem("olfexa_review_image");
      const storedProv = sessionStorage.getItem("olfexa_review_provenance");

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setIngredients(parsed);
          }
        } catch {
          // fallback
        }
      }

      if (storedDetailed) {
        try {
          const parsedDetailed = JSON.parse(storedDetailed);
          if (Array.isArray(parsedDetailed) && parsedDetailed.length > 0) {
            setDetailedIngredients(parsedDetailed);
          }
        } catch {
          // fallback
        }
      }

      if (storedRaw) setRawOcrText(storedRaw);
      if (storedName) setPerfumeName(storedName);
      if (storedBrand) setBrandName(storedBrand);
      if (storedImg) setImageUrl(storedImg);

      if (storedProv) {
        try {
          const parsedProv = JSON.parse(storedProv);
          setProvenance({
            isPerfume: parsedProv.isPerfume ?? true,
            fragranceType: parsedProv.fragranceType || "Cosmetic Formulation",
            confidence: parsedProv.confidence || 0.85,
            detectionReason: parsedProv.detectionReason || "",
            imageQuality: parsedProv.imageQuality,
            relevance: parsedProv.relevance,
            manufacturingInfo: parsedProv.manufacturingInfo || {},
            companyDetails: parsedProv.companyDetails || {},
            companyAddress: parsedProv.companyAddress || {},
            others: parsedProv.others || {
              fragranceType: parsedProv.fragranceType || "Cosmetic Formulation",
              safetyWarnings: [],
            },
            categorized: parsedProv.categorized,
          });
        } catch {
          // fallback
        }
      }

      setIsLoaded(true);
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-xs font-mono text-slate-500">
        Loading candidate tokens and packaging metadata...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="mb-2">
        <Link
          href="/scan"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to upload</span>
        </Link>
      </div>

      {/* 1. Validated Fragrance Scanning System Banner */}
      <div className={`p-6 rounded-3xl border shadow-xs transition-all space-y-4 ${
        provenance.isPerfume
          ? "border-emerald-200/90 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20"
          : "border-amber-200/90 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20"
      }`}>
        {/* Main Product Relevance Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`p-2.5 rounded-2xl ${
              provenance.isPerfume ? "bg-emerald-700 text-white shadow-xs" : "bg-amber-600 text-white shadow-xs"
            }`}>
              {provenance.isPerfume ? <PackageCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-slate-950 dark:text-slate-100 font-editorial-heading">
                  {provenance.relevance?.classificationName || (provenance.isPerfume ? "Verified Fragrance Product / Ingredient Label" : "Unverified Fragrance Packaging")}
                </h2>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  provenance.isPerfume
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                }`}>
                  {provenance.fragranceType || "Cosmetic Formulation"}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {provenance.relevance?.rationale || provenance.detectionReason}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
            <span>OCR Confidence:</span>
            <strong className="text-slate-900 dark:text-white font-bold">{Math.round((provenance.confidence || 0.85) * 100)}%</strong>
          </div>
        </div>

        {/* Image Quality Assessment Strip */}
        <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400">Image Quality</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${
              provenance.imageQuality?.rating === "HIGH"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                : provenance.imageQuality?.rating === "ACCEPTABLE"
                ? "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
            }`}>
              {provenance.imageQuality?.rating || "HIGH"} QUALITY
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400">Clarity &amp; Resolution</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold text-[11px]">
              {provenance.imageQuality?.clarityScore || 85}% • {provenance.imageQuality?.dimensions ? `${provenance.imageQuality.dimensions.width}×${provenance.imageQuality.dimensions.height}` : "Optimal"}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400">Optical Sharpness</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold text-[11px]">
              {provenance.imageQuality?.isBlurry ? "⚠️ Blurry / Glare" : "✓ Crisp Text"}
            </span>
          </div>
        </div>

        {/* Quality or Relevance Warnings Alert (if any) */}
        {((provenance.imageQuality?.warnings && provenance.imageQuality.warnings.length > 0) || !provenance.isPerfume) && (
          <div className="p-3.5 rounded-2xl bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-bold block">Validation Guardrail Active — Inspection Required</span>
              <p className="text-[11px] leading-relaxed">
                OLFEXA does not blindly analyze incorrect or unclear images. Please review each candidate ingredient token below, correct any misread characters, and remove irrelevant text before initiating scientific analysis.
              </p>
              {provenance.imageQuality?.warnings && provenance.imageQuality.warnings.length > 0 && (
                <ul className="list-disc list-inside text-[10px] space-y-0.5 text-amber-800 dark:text-amber-300 pt-1 font-mono">
                  {provenance.imageQuality.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Architectural Boundary Callout Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
        <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex-shrink-0 mt-0.5">
          <PackageCheck className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-0.5">
            Two-Tier Verification System: Vision/OCR vs. OLFEXA Analysis Engine
          </span>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Vision/OCR is used strictly to detect and isolate visible ingredient names. The <strong>OLFEXA Analysis Engine—not OCR—</strong>then normalizes and matches these verified ingredients against the scientific knowledge base to evaluate alcohol status, cosmetic categories, and evidence-based potential concerns.
          </p>
        </div>
      </div>

      {/* 4-Category Optical Detection Status Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30">
          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold uppercase text-[10px] mb-1">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>1. INCI Ingredients</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
            {ingredients.length} declared constituents
          </span>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-[10px] mb-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>2. Manufacturing (MFG)</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate block">
            {provenance.manufacturingInfo?.batchCode 
              ? `Batch ${provenance.manufacturingInfo.batchCode}` 
              : provenance.manufacturingInfo?.dateOfManufacture 
              ? `DOM ${provenance.manufacturingInfo.dateOfManufacture}` 
              : "Not on label"}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-[10px] mb-1">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>3. Manufacturer (MFG By)</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate block">
            {provenance.companyDetails?.brandName || 
             provenance.companyDetails?.manufacturer || 
             provenance.companyAddress?.countryOfOrigin || 
             "Not on label"}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-[10px] mb-1">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            <span>4. Other Specs</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate block">
            {provenance.others?.volume || 
             provenance.others?.alcoholVol || 
             (provenance.others?.fragranceType && provenance.others.fragranceType !== "Cosmetic Formulation" ? provenance.others.fragranceType : undefined) || 
             "Not on label"}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Packaging Provenance & Extraction Details */}
        <div className="w-full lg:w-1/3 space-y-4">
          {/* Label Image preview */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold block mb-1">
                Source Label
              </span>
              <h2 className="text-lg font-bold font-editorial-heading text-slate-900 dark:text-slate-100">
                {perfumeName || "Packaging Label"}
              </h2>
              {brandName && (
                <p className="text-xs text-slate-500 font-mono">
                  {brandName}
                </p>
              )}
            </div>

            {imageUrl ? (
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-56">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Scanned fragrance label"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-36 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex flex-col items-center justify-center p-3 text-center text-slate-400">
                <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                <span className="text-xs font-medium">Text Extraction Intake</span>
              </div>
            )}
          </div>

          {/* Category 2: Extracted Date of Manufacture & Batch Code (MFG) */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  2. Manufacturing (MFG)
                </span>
              </div>
              {(provenance.manufacturingInfo?.batchCode || provenance.manufacturingInfo?.dateOfManufacture) ? (
                <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  ✓ Detected
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400">
                  Optional
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[10px] font-mono uppercase text-slate-400">
                    Date of Manufacture (DOM)
                  </label>
                  {provenance.manufacturingInfo?.dateOfManufacture && (
                    <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Extracted
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={provenance.manufacturingInfo?.dateOfManufacture || ""}
                  onChange={(e) => setProvenance((prev) => ({
                    ...prev,
                    manufacturingInfo: { ...prev.manufacturingInfo, dateOfManufacture: e.target.value }
                  }))}
                  placeholder="Not detected on label (e.g. 2024-05)"
                  className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[10px] font-mono uppercase text-slate-400">
                      Batch / Lot Code
                    </label>
                    {provenance.manufacturingInfo?.batchCode && (
                      <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        ✓ Extracted
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={provenance.manufacturingInfo?.batchCode || ""}
                    onChange={(e) => setProvenance((prev) => ({
                      ...prev,
                      manufacturingInfo: { ...prev.manufacturingInfo, batchCode: e.target.value }
                    }))}
                    placeholder="Not detected on label"
                    className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[10px] font-mono uppercase text-slate-400">
                      PAO (Period After Opening)
                    </label>
                    {provenance.manufacturingInfo?.periodAfterOpening && (
                      <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        ✓ Extracted
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={provenance.manufacturingInfo?.periodAfterOpening || ""}
                    onChange={(e) => setProvenance((prev) => ({
                      ...prev,
                      manufacturingInfo: { ...prev.manufacturingInfo, periodAfterOpening: e.target.value }
                    }))}
                    placeholder="Not detected on label (e.g. 36M)"
                    className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[10px] font-mono uppercase text-slate-400">
                    Expiry Date / Best Before
                  </label>
                  {provenance.manufacturingInfo?.expiryDate && (
                    <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Extracted
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={provenance.manufacturingInfo?.expiryDate || ""}
                  onChange={(e) => setProvenance((prev) => ({
                    ...prev,
                    manufacturingInfo: { ...prev.manufacturingInfo, expiryDate: e.target.value }
                  }))}
                  placeholder="Not detected on label (e.g. 2028-05)"
                  className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Category 3: Extracted Company Details & Address (MFG BY) */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  3. Manufacturer (MFG By)
                </span>
              </div>
              {(provenance.companyDetails?.brandName || provenance.companyDetails?.manufacturer || provenance.companyAddress?.countryOfOrigin) ? (
                <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  ✓ Detected
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400">
                  Optional
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[10px] font-mono uppercase text-slate-400">
                    Brand House / Label
                  </label>
                  {provenance.companyDetails?.brandName && (
                    <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Extracted
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={provenance.companyDetails?.brandName || (brandName && brandName !== "Declared Brand" ? brandName : "")}
                  onChange={(e) => setProvenance((prev) => ({
                    ...prev,
                    companyDetails: { ...prev.companyDetails, brandName: e.target.value }
                  }))}
                  placeholder="Not detected on label (e.g. Brand / House)"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[10px] font-mono uppercase text-slate-400">
                    Manufacturer / Formulator
                  </label>
                  {provenance.companyDetails?.manufacturer && (
                    <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Extracted
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={provenance.companyDetails?.manufacturer || ""}
                  onChange={(e) => setProvenance((prev) => ({
                    ...prev,
                    companyDetails: { ...prev.companyDetails, manufacturer: e.target.value }
                  }))}
                  placeholder="Not detected on label (optional)"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[10px] font-mono uppercase text-slate-400">
                    Distributor
                  </label>
                  {provenance.companyDetails?.distributor && (
                    <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Extracted
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={provenance.companyDetails?.distributor || ""}
                  onChange={(e) => setProvenance((prev) => ({
                    ...prev,
                    companyDetails: { ...prev.companyDetails, distributor: e.target.value }
                  }))}
                  placeholder="Not detected on label (optional)"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[10px] font-mono uppercase text-slate-400">
                    Country of Origin
                  </label>
                  {provenance.companyAddress?.countryOfOrigin && (
                    <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Extracted
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={provenance.companyAddress?.countryOfOrigin || ""}
                  onChange={(e) => setProvenance((prev) => ({
                    ...prev,
                    companyAddress: { ...prev.companyAddress, countryOfOrigin: e.target.value }
                  }))}
                  placeholder="Not detected on label (e.g. France, UAE, USA)"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[10px] font-mono uppercase text-slate-400">
                    Corporate / Registered Address
                  </label>
                  {provenance.companyAddress?.fullAddress && (
                    <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Extracted
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={provenance.companyAddress?.fullAddress || ""}
                  onChange={(e) => setProvenance((prev) => ({
                    ...prev,
                    companyAddress: { ...prev.companyAddress, fullAddress: e.target.value }
                  }))}
                  placeholder="Not detected on label (optional)"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[10px] font-mono uppercase text-slate-400">
                    EU Responsible Person (RP)
                  </label>
                  {provenance.companyAddress?.responsiblePersonEU && (
                    <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Extracted
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={provenance.companyAddress?.responsiblePersonEU || ""}
                  onChange={(e) => setProvenance((prev) => ({
                    ...prev,
                    companyAddress: { ...prev.companyAddress, responsiblePersonEU: e.target.value }
                  }))}
                  placeholder="Not detected on label (optional)"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Category 4: Other Packaging Specs (Others) */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  4. Other Packaging Specs
                </span>
              </div>
              {(provenance.others?.volume || provenance.others?.alcoholVol || provenance.others?.barcodeRef) ? (
                <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  ✓ Detected
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400">
                  Optional
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[10px] font-mono uppercase text-slate-400">
                      Net Volume
                    </label>
                    {provenance.others?.volume && (
                      <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        ✓ Extracted
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={provenance.others?.volume || ""}
                    onChange={(e) => setProvenance((prev) => ({
                      ...prev,
                      others: { ...prev.others, volume: e.target.value }
                    }))}
                    placeholder="Not detected (e.g. 100 ml / 6 ml)"
                    className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[10px] font-mono uppercase text-slate-400">
                      Alcohol % by Vol
                    </label>
                    {provenance.others?.alcoholVol && (
                      <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        ✓ Extracted
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={provenance.others?.alcoholVol || ""}
                    onChange={(e) => setProvenance((prev) => ({
                      ...prev,
                      others: { ...prev.others, alcoholVol: e.target.value }
                    }))}
                    placeholder="Not detected (e.g. 80% VOL.)"
                    className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[10px] font-mono uppercase text-slate-400">
                    Concentration / Fragrance Type
                  </label>
                  {provenance.fragranceType && provenance.fragranceType !== "Cosmetic Formulation" && (
                    <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Extracted
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={provenance.others?.fragranceType || provenance.fragranceType || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProvenance((prev) => ({
                      ...prev,
                      fragranceType: val,
                      others: { ...prev.others, fragranceType: val }
                    }));
                  }}
                  placeholder="Not detected (e.g. Eau de Parfum)"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[10px] font-mono uppercase text-slate-400">
                    Safety / Flammability Warnings
                  </label>
                  {provenance.others?.safetyWarnings && provenance.others.safetyWarnings.length > 0 && (
                    <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Extracted
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={provenance.others?.safetyWarnings?.join(", ") || ""}
                  onChange={(e) => {
                    const warnings = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                    setProvenance((prev) => ({
                      ...prev,
                      others: { ...prev.others, safetyWarnings: warnings }
                    }));
                  }}
                  placeholder="Not detected on label (optional)"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[10px] font-mono uppercase text-slate-400">
                    Barcode / Art Ref
                  </label>
                  {provenance.others?.barcodeRef && (
                    <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Extracted
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={provenance.others?.barcodeRef || ""}
                  onChange={(e) => setProvenance((prev) => ({
                    ...prev,
                    others: { ...prev.others, barcodeRef: e.target.value }
                  }))}
                  placeholder="Not detected on label (optional)"
                  className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Category 1 - Interactive Ingredient Review & Final Analysis Trigger */}
        <div className="w-full lg:w-2/3">
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <PackageCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-editorial-heading">
                  1. INCI Ingredients List
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  Inspect detected cosmetic ingredients, verify spelling, and toggle items before evidence analysis.
                </p>
              </div>
            </div>

            <IngredientReviewList
              initialIngredients={ingredients}
              detailedIngredients={detailedIngredients}
              rawOcrText={rawOcrText}
              perfumeName={perfumeName}
              brandName={brandName}
              imageUrl={imageUrl}
              provenance={provenance}
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <DisclaimerBanner variant="subtle" />
      </div>
    </div>
  );
}
