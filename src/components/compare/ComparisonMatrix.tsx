import React from "react";
import { AnalysisResult } from "@/types";
import { Check, X, Droplet, AlertTriangle, ShieldCheck, Scale, Users, Shield } from "lucide-react";

interface ComparisonMatrixProps {
  fragranceA: AnalysisResult;
  fragranceB: AnalysisResult;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  fragranceA,
  fragranceB,
}) => {
  // Compute common and unique ingredients
  const setA = new Set(fragranceA.ingredientsFound.map((i) => i.matchedInci || i.rawInput));
  const setB = new Set(fragranceB.ingredientsFound.map((i) => i.matchedInci || i.rawInput));

  const allIngredients = Array.from(new Set([...setA, ...setB])).sort();
  const commonIngredients = allIngredients.filter(item => setA.has(item) && setB.has(item));
  const uniqueToA = allIngredients.filter(item => setA.has(item) && !setB.has(item));
  const uniqueToB = allIngredients.filter(item => !setA.has(item) && setB.has(item));
  const similarityScore = Math.round((commonIngredients.length / Math.max(allIngredients.length, 1)) * 100);

  return (
    <div className="space-y-8">
      {/* Comparative Overview Card */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
              Comparative Analysis
            </span>
            <h3 className="text-lg font-bold font-editorial-heading text-slate-900 dark:text-slate-100">
              Formula Congruence: {similarityScore}% Shared Constituents
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
              {commonIngredients.length} Shared
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {uniqueToA.length} Unique to A
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {uniqueToB.length} Unique to B
            </span>
          </div>
        </div>

        {/* Head to Head Side-by-Side Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fragrance A */}
          <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/70 space-y-3">
            <div>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-widest block mb-0.5">
                Fragrance Reference A
              </span>
              <h4 className="text-base font-bold font-editorial-heading text-slate-900 dark:text-slate-100">
                {fragranceA.perfumeName}
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                {fragranceA.brandName || "Declared Brand"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">Carrier</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {fragranceA.alcoholStatus === "CONTAINS_ALCOHOL" ? "Alcohol" : "Alcohol-Free"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">Allergens</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {fragranceA.potentialAllergens.length} Flagged
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">Formula Size</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {fragranceA.ingredientsFound.length} Items
                </span>
              </div>
            </div>
          </div>

          {/* Fragrance B */}
          <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/70 space-y-3">
            <div>
              <span className="text-[10px] font-mono text-sky-700 dark:text-sky-400 font-semibold uppercase tracking-widest block mb-0.5">
                Fragrance Reference B
              </span>
              <h4 className="text-base font-bold font-editorial-heading text-slate-900 dark:text-slate-100">
                {fragranceB.perfumeName}
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                {fragranceB.brandName || "Declared Brand"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">Carrier</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {fragranceB.alcoholStatus === "CONTAINS_ALCOHOL" ? "Alcohol" : "Alcohol-Free"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">Allergens</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {fragranceB.potentialAllergens.length} Flagged
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">Formula Size</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {fragranceB.ingredientsFound.length} Items
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side Constituent Ingredient Cross-Reference Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h4 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100 font-editorial-heading">
              Constituent Ingredient Cross-Reference ({allIngredients.length} Total)
            </h4>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4">Declared Nomenclature</th>
                <th className="p-4 text-center">{fragranceA.perfumeName}</th>
                <th className="p-4 text-center">{fragranceB.perfumeName}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {allIngredients.map((item) => {
                const inA = setA.has(item);
                const inB = setB.has(item);

                return (
                  <tr key={item} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {item}
                    </td>
                    <td className="p-4 text-center">
                      {inA ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                          <X className="w-3 h-3" />
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {inB ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                          <X className="w-3 h-3" />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
