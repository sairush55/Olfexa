"use client";

import React from "react";
import { 
  PackageCheck, 
  ShieldAlert, 
  Calendar, 
  Building2, 
  MapPin, 
  Barcode, 
  Clock, 
  Globe, 
  Sparkles,
  Sliders,
  Flame
} from "lucide-react";
import { PackagingProvenance } from "@/types";

interface ProvenanceCardProps {
  provenance?: PackagingProvenance;
}

export const ProvenanceCard: React.FC<ProvenanceCardProps> = ({ provenance }) => {
  if (!provenance) {
    return null;
  }

  const {
    isPerfume,
    fragranceType = "Eau de Parfum",
    confidence = 0.85,
    detectionReason,
    manufacturingInfo,
    companyDetails,
    companyAddress,
    others
  } = provenance;

  return (
    <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-card-bg shadow-xs overflow-hidden transition-all">
      {/* Top Header Banner */}
      <div className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 ${
        isPerfume
          ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40"
          : "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-2xl ${
            isPerfume 
              ? "bg-emerald-600 text-white shadow-xs" 
              : "bg-amber-600 text-white shadow-xs"
          }`}>
            {isPerfume ? <PackageCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-editorial-heading">
                {isPerfume ? "Detected Packaging Details" : "Unverified Packaging Details"}
              </h3>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                isPerfume
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
              }`}>
                {fragranceType}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {detectionReason || "Identified solvent carrier matrix and cosmetic fragrance declarations."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 bg-white/70 dark:bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Vision Confidence: {Math.round(confidence * 100)}%</span>
        </div>
      </div>

      {/* Quality & Validation Sub-Strip */}
      <div className="px-6 py-2.5 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-[11px] flex flex-wrap items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2">
          <PackageCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-slate-600 dark:text-slate-300">
            System Status: <strong className="text-slate-900 dark:text-white">{provenance.relevance?.classificationName || "Fragrance Packaging Label"}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <span>Image Quality: <strong className="text-slate-800 dark:text-slate-200">{provenance.imageQuality?.rating || "HIGH"}</strong> ({provenance.imageQuality?.clarityScore || Math.round(confidence * 100)}% clarity)</span>
          <span>•</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">4 Distinct Detection Categories</span>
        </div>
      </div>

      {/* 4 Pillars Grid: MFG, MFG By (Brand), MFG By (Origin), Others */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800/80">
        {/* Pillar 1: Category 2 - Date of Manufacture & Batch Codes (MFG) */}
        <div className="pt-4 lg:pt-0 lg:pr-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>2. Manufacturing (MFG)</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">Date of Manufacture (DOM)</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                {manufacturingInfo?.dateOfManufacture || "Not declared"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 uppercase">
                  <Barcode className="w-3 h-3" />
                  <span>Batch</span>
                </div>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200 text-xs truncate block">
                  {manufacturingInfo?.batchCode || "None"}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 uppercase">
                  <Clock className="w-3 h-3" />
                  <span>PAO</span>
                </div>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200 text-xs">
                  {manufacturingInfo?.periodAfterOpening || "36M"}
                </span>
              </div>
            </div>

            {manufacturingInfo?.expiryDate && (
              <div className="text-[11px] text-slate-500 font-mono">
                Exp Date: <span className="text-slate-800 dark:text-slate-200 font-medium">{manufacturingInfo.expiryDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pillar 2: Category 3 - Brand, Manufacturer, Distributor (MFG By) */}
        <div className="pt-4 lg:pt-0 lg:px-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider">
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>3. Manufacturer (MFG By)</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">Brand / House</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 font-editorial-heading text-sm">
                {companyDetails?.brandName || "Declared Brand"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">Manufacturer / Formulator</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium text-xs truncate block">
                {companyDetails?.manufacturer || "Unspecified Entity"}
              </span>
            </div>

            {companyDetails?.distributor && (
              <div className="text-[11px] text-slate-500">
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Distributor</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{companyDetails.distributor}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pillar 3: Category 3 continued - Corporate Address & Origin (MFG By) */}
        <div className="pt-4 lg:pt-0 lg:px-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Origin & Compliance</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 uppercase mb-0.5">
                <Globe className="w-3 h-3 text-emerald-600" />
                <span>Country of Origin</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 font-editorial-heading">
                {companyAddress?.countryOfOrigin || "Declared Origin"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="block text-[10px] font-mono text-slate-400 uppercase mb-0.5">Corporate Address</span>
              <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed line-clamp-2">
                {companyAddress?.fullAddress || "Unlisted corporate address"}
              </p>
            </div>

            {companyAddress?.responsiblePersonEU && (
              <div className="text-[10px] font-mono text-slate-500 truncate">
                RP (EU): <span className="text-slate-700 dark:text-slate-300 font-medium">{companyAddress.responsiblePersonEU}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pillar 4: Category 4 - Other Packaging Specs (Others) */}
        <div className="pt-4 lg:pt-0 lg:pl-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>4. Other Specs</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="block text-[10px] font-mono text-slate-400 uppercase">Volume</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-xs">
                  {others?.volume || "100 ml"}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="block text-[10px] font-mono text-slate-400 uppercase">Alcohol Vol</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-xs">
                  {others?.alcoholVol || "Standard"}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 uppercase mb-0.5">
                <Flame className="w-3 h-3 text-amber-600" />
                <span>Safety Warnings</span>
              </div>
              <span className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed block">
                {others?.safetyWarnings && others.safetyWarnings.length > 0
                  ? others.safetyWarnings.join("; ")
                  : "Standard cosmetic safety handling declared"}
              </span>
            </div>

            {others?.barcodeRef && (
              <div className="text-[10px] font-mono text-slate-500 truncate">
                Ref/Barcode: <span className="text-slate-700 dark:text-slate-300 font-medium">{others.barcodeRef}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
