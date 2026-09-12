"use client";

import React, { useState } from "react";
import { 
  SAMPLE_SCAN_TRADITIONAL, 
  SAMPLE_SCAN_ALCOHOL_FREE, 
  SAMPLE_SCAN_OAKMOSS 
} from "@/data/mockScans";
import { ComparisonMatrix } from "@/components/compare/ComparisonMatrix";
import { DisclaimerBanner } from "@/components/brand/DisclaimerBanner";
import { Layers } from "lucide-react";

const AVAILABLE_SCANS = [
  SAMPLE_SCAN_TRADITIONAL,
  SAMPLE_SCAN_ALCOHOL_FREE,
  SAMPLE_SCAN_OAKMOSS,
];

export default function ComparePage() {
  const [selectedAIndex, setSelectedAIndex] = useState(0);
  const [selectedBIndex, setSelectedBIndex] = useState(1);

  const fragranceA = AVAILABLE_SCANS[selectedAIndex];
  const fragranceB = AVAILABLE_SCANS[selectedBIndex];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
            Comparative Formulation Engine
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
          Compare Fragrances
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select two perfumes to evaluate chemical overlap, alcohol carriers, and declared allergen differences.
        </p>
      </div>

      {/* Selector Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs">
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
            Fragrance A
          </label>
          <select
            value={selectedAIndex}
            onChange={(e) => setSelectedAIndex(Number(e.target.value))}
            className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-foreground focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          >
            {AVAILABLE_SCANS.map((scan, idx) => (
              <option key={scan.id} value={idx}>
                {scan.perfumeName} ({scan.brandName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
            Fragrance B
          </label>
          <select
            value={selectedBIndex}
            onChange={(e) => setSelectedBIndex(Number(e.target.value))}
            className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-foreground focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          >
            {AVAILABLE_SCANS.map((scan, idx) => (
              <option key={scan.id} value={idx}>
                {scan.perfumeName} ({scan.brandName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side by Side Matrix */}
      <ComparisonMatrix fragranceA={fragranceA} fragranceB={fragranceB} />

      <DisclaimerBanner variant="subtle" />
    </div>
  );
}
