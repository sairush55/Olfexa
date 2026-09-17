"use client";

import React, { useState } from "react";
import { Globe, Shield, ExternalLink, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { AnalysisResult } from "@/types";
import { executeDeterministicRuleEngine } from "@/lib/rule-engine/deterministicRuleEngine";

interface RegionalComplianceCardProps {
  scanResult: AnalysisResult;
}

export type SelectedRegion = "EU" | "IN" | "US";

export const RegionalComplianceCard: React.FC<RegionalComplianceCardProps> = ({ scanResult }) => {
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion>("EU");

  // Retrieve deterministic regional evaluation
  const rawTokens = scanResult.ingredientsFound.map((i) => i.matchedInci || i.rawInput);
  const evaluation = executeDeterministicRuleEngine(rawTokens);
  const { compliance, allergens, alcohol } = evaluation;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg p-6 sm:p-7 shadow-xs space-y-5">
      {/* Header with Region Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
              Regulatory Context
            </span>
          </div>
          <h3 className="text-xl font-bold font-editorial-heading text-slate-900 dark:text-slate-100 tracking-tight">
            Regional Compliance & Labeling Intelligence
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate formula packaging declarations against specific regional cosmetics frameworks.
          </p>
        </div>

        {/* Region Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 self-start sm:self-auto">
          {[
            { id: "EU", label: "🇪🇺 European Union (EU)" },
            { id: "IN", label: "🇮🇳 India (CDSCO / BIS)" },
            { id: "US", label: "🇺🇸 United States (FDA)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRegion(tab.id as SelectedRegion)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedRegion === tab.id
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* REGION 1: EUROPEAN UNION (EU) */}
      {selectedRegion === "EU" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-semibold text-blue-900 dark:text-blue-200 font-mono text-[11px] uppercase tracking-wider">
                {compliance.eu.framework}
              </span>
              <a
                href={compliance.eu.officialUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-[11px] text-blue-700 dark:text-blue-400 hover:underline font-medium"
              >
                <span>Official CosIng Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Under EU Cosmetics Regulation (EC) No 1223/2009 Article 19, fragrance constituents identified as contact allergens in Annex III must be individually disclosed by INCI nomenclature on packaging if exceeding <strong>0.001% (10 ppm)</strong> in leave-on products or <strong>0.01% (100 ppm)</strong> in rinse-off products.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Annex III Disclosures Required ({allergens.allergenCount})
              </span>
              {allergens.allergenCount > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {compliance.eu.mandatoryAllergenDeclarations.map((name) => (
                    <span
                      key={name}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  No regulated EU Annex III fragrance allergens flagged in declared formulation.
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Scientific Opinion Benchmark
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                EU SCCS Opinion SCCS/1459/11 establishes continuous surveillance over 56 contact fragrance sensitizers. IFRA 51st Amendment quantitative limits apply concurrently.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* REGION 2: INDIA (CDSCO & BIS) */}
      {selectedRegion === "IN" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-semibold text-amber-900 dark:text-amber-200 font-mono text-[11px] uppercase tracking-wider">
                {compliance.india.framework}
              </span>
              <a
                href={compliance.india.officialUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 hover:underline font-medium"
              >
                <span>CDSCO Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Cosmetics in India are regulated under the <strong>Drugs and Cosmetics Rules 1945</strong> and <strong>Cosmetics Rules 2020</strong>, enforcing Bureau of Indian Standards (BIS) specifications IS 4707 (Part 1 & 2) for raw material safety and labeling conformity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Perfume vs Traditional Attar Standards
              </span>
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                <p>
                  • <strong>Alcoholic Perfumes (EDP/EDT)</strong>: Governed by IS 7490 / IS 4707; require explicit alcohol denaturation disclosures and flammable volatile handling.
                </p>
                <p>
                  • <strong>Traditional Attar (Ittar)</strong>: Historically non-alcoholic hydro-distillations onto sandalwood or botanical ester carriers (IS 5873). Classified as concentrated fragrance oils exempt from volatile alcohol excise rules.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Mandatory Indian Packaging Requirements
              </span>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 leading-relaxed list-disc list-inside">
                <li>Manufacturing License number (M.L. No.)</li>
                <li>Batch identification code and Manufacturing Date</li>
                <li>Maximum Retail Price (MRP inclusive of all taxes)</li>
                <li>Registered manufacturing / import entity address</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* REGION 3: UNITED STATES (US FDA & MoCRA) */}
      {selectedRegion === "US" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-semibold text-emerald-900 dark:text-emerald-200 font-mono text-[11px] uppercase tracking-wider">
                {compliance.usFda.framework}
              </span>
              <a
                href={compliance.usFda.officialUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
              >
                <span>FDA Cosmetics Guidance</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              The <strong>Modernization of Cosmetics Regulation Act of 2022 (MoCRA)</strong> expands FDA authority over adverse event reporting, facility registration, and fragrance allergen disclosures under 21 CFR Part 701.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                FDA &quot;Alcohol-Free&quot; Claim Assessment
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {compliance.usFda.claimsSummary}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                FDA 21 CFR 700.13 policy permits products containing fatty alcohols (e.g., Cetyl or Stearyl alcohol) to claim &quot;Alcohol Free&quot; provided no ethyl or denatured alcohol is present.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                MoCRA Labeling & Safety Standards
              </span>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 leading-relaxed list-disc list-inside">
                {compliance.usFda.mocraNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Prominent Legal Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed text-[11px]">
          <strong>Informational Regulatory Intelligence only.</strong> Regional standards and threshold declarations are indexed from published documentation (European Commission CosIng, CDSCO, BIS, and US FDA) to support consumer transparency. This analysis does not constitute formal legal counsel or official regulatory product registration.
        </span>
      </div>
    </div>
  );
};
