"use client";

import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  Info, 
  ChevronDown, 
  AlertCircle,
  Compass,
  Clock,
  Gauge
} from "lucide-react";
import { FragrancePersona } from "@/types";
import { cn } from "@/lib/utils";
import { 
  zodiacRecommendations, 
  matchZodiacAttar, 
  CANONICAL_FAMILY_LABELS,
  CanonicalFragranceFamily,
  ZODIAC_ENTERTAINMENT_DISCLAIMER
} from "@/lib/zodiacAttarData";

interface FragrancePersonaCardProps {
  initialPersona?: FragrancePersona;
  allIngredients?: string[];
  className?: string;
}

const FAMILY_FILTER_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Sign Default" },
  { id: "oud", label: "Oud" },
  { id: "woody", label: "Woody" },
  { id: "amber", label: "Amber" },
  { id: "musk", label: "Musk" },
  { id: "floral", label: "Floral" },
  { id: "citrus", label: "Citrus" },
  { id: "fresh", label: "Fresh" },
  { id: "spicy", label: "Spicy" },
  { id: "green", label: "Green" },
  { id: "earthy", label: "Earthy" },
  { id: "aquatic", label: "Aquatic" },
];

export const FragrancePersonaCard: React.FC<FragrancePersonaCardProps> = ({
  initialPersona,
  className,
}) => {
  const [selectedSign, setSelectedSign] = useState<string>(
    initialPersona?.zodiacSign?.toLowerCase() || "leo"
  );
  const [selectedFamily, setSelectedFamily] = useState<string>("");

  const match = useMemo(() => {
    return matchZodiacAttar(selectedSign, selectedFamily || null);
  }, [selectedSign, selectedFamily]);

  return (
    <div className={cn("p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs space-y-6", className)}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest">
              Recreational Discovery
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-editorial-heading text-slate-900 dark:text-slate-100">
            Your Fragrance Persona
          </h2>
          <p className="text-xs text-slate-500">
            Discover traditional attar profiles and scent directions aligned with your astrological archetype.
          </p>
        </div>

        {/* Zodiac Sign Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="zodiac-select" className="text-xs font-mono text-slate-400">
            Sign:
          </label>
          <div className="relative">
            <select
              id="zodiac-select"
              value={selectedSign}
              onChange={(e) => setSelectedSign(e.target.value)}
              className="text-xs font-mono px-3 py-2 pr-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 appearance-none focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-2xs font-medium cursor-pointer"
            >
              {zodiacRecommendations.map((z) => {
                const nameCap = z.sign.charAt(0).toUpperCase() + z.sign.slice(1);
                return (
                  <option key={z.sign} value={z.sign}>
                    {z.symbol} {nameCap} ({z.dateRange})
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Fragrance Direction / Family Filter Tabs */}
      <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Fragrance Family Direction (Optional)</span>
          </span>
          {selectedFamily && (
            <button
              type="button"
              onClick={() => setSelectedFamily("")}
              className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              Reset to default
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {FAMILY_FILTER_OPTIONS.map((fam) => {
            const isSelected = fam.id === selectedFamily;
            const isPrimary = fam.id && match.primaryFamilies.includes(fam.id);
            return (
              <button
                key={fam.id}
                type="button"
                onClick={() => setSelectedFamily(fam.id)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-xl border font-medium transition-all cursor-pointer flex items-center gap-1",
                  isSelected
                    ? "bg-purple-700 text-white border-purple-700 shadow-2xs"
                    : isPrimary
                    ? "bg-purple-50/70 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <span>{fam.label}</span>
                {isPrimary && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Primary Family for this sign" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fallback Notice for Unsupported Direction */}
      {match.isFallback && match.fallbackMessage && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {match.fallbackMessage}
          </p>
        </div>
      )}

      {/* Main Persona & Attar Recommendation Showcase Card */}
      <div className="p-6 sm:p-7 rounded-3xl border border-purple-200/80 dark:border-purple-900/40 bg-gradient-to-br from-purple-50/40 via-card-bg to-white dark:from-purple-950/20 dark:via-card-bg dark:to-slate-900 space-y-6">
        
        {/* Persona Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-purple-100 dark:border-purple-900/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-editorial-heading text-slate-900 dark:text-slate-100">
                {match.symbol} {match.signCapitalized}
              </span>
              <span className="text-xs font-mono text-slate-500">
                ({match.dateRange})
              </span>
            </div>
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
              {match.persona.join(" • ")}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              {match.description}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
              Attar Intensity
            </span>
            <span className={cn(
              "text-xs font-mono font-bold px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1",
              match.recommendation.intensity === "Strong"
                ? "bg-purple-100 text-purple-900 dark:bg-purple-900/60 dark:text-purple-200"
                : match.recommendation.intensity === "Moderate"
                ? "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/60 dark:text-indigo-200"
                : "bg-sky-100 text-sky-900 dark:bg-sky-900/60 dark:text-sky-200"
            )}>
              <Gauge className="w-3 h-3" />
              <span>{match.recommendation.intensity}</span>
            </span>
          </div>
        </div>

        {/* Recommended Attar Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200/90 dark:border-purple-900/50 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-700 dark:text-purple-400 block mb-1">
                Recommended Attar
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-editorial-heading text-slate-950 dark:text-white">
                {match.recommendation.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {match.recommendation.description}
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 self-start shrink-0">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900 uppercase font-semibold">
                {match.recommendation.family}
              </span>
            </div>
          </div>

          {/* Scent Profile Notes */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
              Fragrance Character Profile
            </span>
            <div className="flex flex-wrap gap-1.5">
              {match.recommendation.profile.map((note, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>

          {/* Best for Occasions */}
          {match.recommendation.occasions && match.recommendation.occasions.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Best for Occasions</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {match.recommendation.occasions.map((occ, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-purple-900 dark:text-purple-300 font-medium"
                  >
                    {occ}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resonating Families Pills */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
            Resonating Sign Families
          </span>
          <div className="flex flex-wrap gap-1.5">
            {match.primaryFamilies.map((fam, idx) => (
              <span
                key={idx}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                {CANONICAL_FAMILY_LABELS[fam as CanonicalFragranceFamily] || fam}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Mandatory Non-Medical Entertainment & Discovery Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed font-mono">
        <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
            Entertainment &amp; Fragrance Discovery Notice
          </span>
          <p>{ZODIAC_ENTERTAINMENT_DISCLAIMER}</p>
        </div>
      </div>
    </div>
  );
};
