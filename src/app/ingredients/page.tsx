"use client";

import React, { useState } from "react";
import { Compass, Search, BookOpen, AlertTriangle, Droplet, ShieldAlert } from "lucide-react";
import { MOCK_INGREDIENTS_DATABASE } from "@/data/mockIngredients";
import { EvidenceDrawer } from "@/components/results/EvidenceDrawer";
import { DisclaimerBanner } from "@/components/brand/DisclaimerBanner";
import { Ingredient } from "@/types";

export default function IngredientsExplorerPage() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [activeEvidenceIngredient, setActiveEvidenceIngredient] = useState<Ingredient | null>(null);

  const filtered = MOCK_INGREDIENTS_DATABASE.filter((ing) => {
    const matchSearch =
      ing.inciName.toLowerCase().includes(search.toLowerCase()) ||
      (ing.commonName && ing.commonName.toLowerCase().includes(search.toLowerCase())) ||
      ing.description.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    if (filterCategory === "allergens") return ing.isEuAllergen;
    if (filterCategory === "alcohols") return ing.isAlcohol;
    if (filterCategory === "carriers") return ing.category === "carrier" || ing.category === "solvent";
    if (filterCategory === "fragrance") return ing.category === "fragrance_compound";

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
            Knowledge Repository
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
          Ingredient Explorer
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Browse verified INCI cosmetic nomenclature, regulatory classifications, and peer-reviewed scientific citations.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by INCI, common name, CAS..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Nomenclature" },
            { id: "allergens", label: "EU Allergens" },
            { id: "alcohols", label: "Alcohols" },
            { id: "carriers", label: "Carriers" },
            { id: "fragrance", label: "Fragrance Notes" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterCategory === cat.id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100/70 dark:bg-slate-800/60"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((ing) => (
          <div
            key={ing.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                    {ing.inciName}
                  </h3>
                  {ing.commonName && (
                    <span className="text-xs text-slate-500 block">
                      {ing.commonName}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 justify-end">
                  {ing.isEuAllergen && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold uppercase">
                      EU Allergen
                    </span>
                  )}
                  {ing.isAlcohol && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-semibold uppercase">
                      {ing.alcoholType === "fatty_alcohol" ? "Fatty Alcohol" : "Alcohol"}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                Role: {ing.category.replace("_", " ")} {ing.casNumber && `• CAS: ${ing.casNumber}`}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                {ing.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {ing.evidence.length} peer-reviewed source{ing.evidence.length === 1 ? "" : "s"}
              </span>

              {ing.evidence.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveEvidenceIngredient(ing)}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-medium"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View Evidence</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <DisclaimerBanner variant="subtle" />

      {/* Evidence Drawer for clicked ingredient */}
      {activeEvidenceIngredient && (
        <EvidenceDrawer
          isOpen={true}
          onClose={() => setActiveEvidenceIngredient(null)}
          ingredientName={activeEvidenceIngredient.inciName}
          evidence={activeEvidenceIngredient.evidence}
        />
      )}
    </div>
  );
}
