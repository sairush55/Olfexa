"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Flame, 
  Droplets, 
  Wind, 
  Mountain, 
  Info,
  ChevronDown
} from "lucide-react";
import { FragrancePersona } from "@/types";
import { cn } from "@/lib/utils";
import { ZODIAC_PROFILES, generateFragrancePersona } from "@/lib/fragrancePersona";

interface FragrancePersonaCardProps {
  initialPersona?: FragrancePersona;
  allIngredients?: string[];
  className?: string;
}

const ELEMENT_CONFIG: Record<
  string, 
  { icon: React.ComponentType<{ className?: string }>; bg: string; text: string; border: string }
> = {
  Fire: {
    icon: Flame,
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-900/50"
  },
  Earth: {
    icon: Mountain,
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-900/50"
  },
  Air: {
    icon: Wind,
    bg: "bg-sky-50 dark:bg-sky-950/30",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-900/50"
  },
  Water: {
    icon: Droplets,
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-900/50"
  }
};

const ZODIAC_NAMES = Object.keys(ZODIAC_PROFILES);

export const FragrancePersonaCard: React.FC<FragrancePersonaCardProps> = ({
  initialPersona,
  className,
}) => {
  const [selectedSign, setSelectedSign] = useState<string>(
    initialPersona?.zodiacSign || "Leo"
  );

  const persona: FragrancePersona = React.useMemo(() => {
    return generateFragrancePersona(selectedSign);
  }, [selectedSign]);

  const profileMeta = ZODIAC_PROFILES[selectedSign] || ZODIAC_PROFILES.Leo;
  const elementCfg = ELEMENT_CONFIG[profileMeta.element] || ELEMENT_CONFIG.Fire;
  const ElementIcon = elementCfg.icon;

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
            Fragrance Persona
          </h2>
          <p className="text-xs text-slate-500">
            Explore how this formulation interacts with astrological archetypes and scent aesthetics.
          </p>
        </div>

        {/* Zodiac Sign Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-400">Sign:</label>
          <div className="relative">
            <select
              value={selectedSign}
              onChange={(e) => setSelectedSign(e.target.value)}
              className="text-xs font-mono px-3 py-1.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-purple-600"
            >
              {ZODIAC_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name} ({ZODIAC_PROFILES[name].element})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Persona Showcase Card */}
      <div className={cn("p-5 sm:p-6 rounded-2xl border space-y-4", elementCfg.border, elementCfg.bg)}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-editorial-heading text-slate-900 dark:text-slate-100">
                {selectedSign} Persona
              </span>
              <span className={cn("text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1", elementCfg.bg, elementCfg.text, "border", elementCfg.border)}>
                <ElementIcon className="w-3 h-3" />
                <span>{profileMeta.element} Element</span>
              </span>
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
              &ldquo;{persona.vibe}&rdquo;
            </p>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Projection Profile
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase">
              {persona.intensityPreference}
            </span>
          </div>
        </div>

        {/* Olfactory Families */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
            Resonating Olfactory Families
          </span>
          <div className="flex flex-wrap gap-1.5">
            {persona.scentFamilies.map((fam, i) => (
              <span
                key={i}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
              >
                {fam}
              </span>
            ))}
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          {persona.perfumeRecommendation && (
            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                Perfume Architecture Pairing
              </span>
              <p className="font-mono text-slate-800 dark:text-slate-200 text-[11px]">
                {persona.perfumeRecommendation}
              </p>
            </div>
          )}

          {persona.attarRecommendation && (
            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                Traditional Attar Concentré Pairing
              </span>
              <p className="font-mono text-slate-800 dark:text-slate-200 text-[11px]">
                {persona.attarRecommendation}
              </p>
            </div>
          )}
        </div>

        {/* Occasions */}
        {persona.suggestedOccasions && persona.suggestedOccasions.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
              Suggested Wearing Occasions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {persona.suggestedOccasions.map((occ, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {occ}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Explicit Entertainment & Discovery Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed font-mono">
        <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
            Entertainment &amp; Discovery Notice
          </span>
          <p>{persona.disclaimer}</p>
        </div>
      </div>
    </div>
  );
};

