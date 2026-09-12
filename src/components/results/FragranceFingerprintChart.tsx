import React from "react";
import { FragranceFingerprint } from "@/types";
import { Sparkles } from "lucide-react";

interface FragranceFingerprintChartProps {
  fingerprint: FragranceFingerprint;
  perfumeName: string;
}

export const FragranceFingerprintChart: React.FC<FragranceFingerprintChartProps> = ({
  fingerprint,
}) => {
  const segments = [
    {
      label: "Volatile Carriers / Solvents",
      percent: fingerprint.carrierSolventsPercent,
      color: "bg-emerald-700 dark:bg-emerald-600",
      legendColor: "bg-emerald-700",
      description: "Alcohol, water, or oil vehicles that disperse scent molecules.",
    },
    {
      label: "Aroma Compounds & Allergens",
      percent: fingerprint.fragranceCompoundsPercent,
      color: "bg-amber-600 dark:bg-amber-500",
      legendColor: "bg-amber-600",
      description: "Declared scent molecules (terpenes, esters, balsams, coumarins).",
    },
    {
      label: "Antioxidants & UV Stabilizers",
      percent: fingerprint.antioxidantsFiltersPercent,
      color: "bg-sky-600 dark:bg-sky-500",
      legendColor: "bg-sky-600",
      description: "Compounds that protect delicate aroma molecules from light and oxidation.",
    },
    {
      label: "Preservatives & Other",
      percent: Math.max(0, 100 - (fingerprint.carrierSolventsPercent + fingerprint.fragranceCompoundsPercent + fingerprint.antioxidantsFiltersPercent)),
      color: "bg-slate-400 dark:bg-slate-600",
      legendColor: "bg-slate-400",
      description: "Formula balancing agents and minor auxiliaries.",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-card-bg p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100 font-editorial-heading">
              Fragrance Formulation Fingerprint
            </h3>
            <p className="text-[11px] text-slate-500">
              Structural distribution across functional cosmetic categories
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
          INCI Composition
        </span>
      </div>

      {/* Stacked Progress Bar */}
      <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner mb-5">
        {segments.map((seg, idx) => (
          <div
            key={idx}
            style={{ width: `${seg.percent}%` }}
            className={`${seg.color} h-full transition-all duration-500`}
            title={`${seg.label}: ${seg.percent}%`}
          />
        ))}
      </div>

      {/* Segment Legend Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {segments.map((seg, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${seg.legendColor}`} />
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[130px]">
                  {seg.label}
                </span>
              </div>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {seg.percent}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {seg.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
