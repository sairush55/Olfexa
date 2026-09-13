import React from "react";
import { ImageDropzone } from "@/components/scan/ImageDropzone";
import { DisclaimerBanner } from "@/components/brand/DisclaimerBanner";

export default function ScanPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
          Ingredient Label Intake
        </span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-900 dark:text-slate-100">
          Scan Fragrance Label
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Upload an image of cosmetic packaging, paste a product link, or enter ingredients manually.
        </p>
      </div>

      <div className="bg-card-bg border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs mb-8">
        <ImageDropzone />
      </div>

      <div className="max-w-2xl mx-auto">
        <DisclaimerBanner variant="subtle" />
      </div>
    </div>
  );
}
