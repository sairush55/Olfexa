"use client";

import React, { useState } from "react";
import { User, ShieldCheck, Check, Sparkles } from "lucide-react";
import { DisclaimerBanner } from "@/components/brand/DisclaimerBanner";

export default function ProfilePage() {
  const [experience, setExperience] = useState<string>("sensitive_skin");
  const [sensitivities, setSensitivities] = useState<string[]>([
    "alcohol_dryness",
    "oakmoss_lichen",
    "cinnamon_clove",
  ]);
  const [saved, setSaved] = useState(false);

  const toggleSensitivity = (id: string) => {
    setSensitivities((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
            Fragrance Profile & Preferences
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
          Skin & Olfactory Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Personalize your analysis parameters to highlight potential irritants and preferred carrier formulas.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Fragrance Persona / Experience */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-editorial-heading text-slate-900 dark:text-slate-100">
            Fragrance Persona & Experience
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: "sensitive_skin",
                title: "Sensitive Skin Priority",
                desc: "Focused on detecting drying alcohols, sensitizers, and contact allergens.",
              },
              {
                id: "enthusiast",
                title: "Niche Enthusiast",
                desc: "Interested in raw ingredient provenance, natural oakmoss, and synthetics.",
              },
              {
                id: "curious",
                title: "Curious Explorer",
                desc: "Learning what ingredients mean without complex chemistry jargon.",
              },
              {
                id: "collector",
                title: "Collection Curator",
                desc: "Cataloging ingredient fingerprints and comparing vintage vs modern batches.",
              },
            ].map((persona) => (
              <div
                key={persona.id}
                onClick={() => setExperience(persona.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  experience === persona.id
                    ? "border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-700"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {persona.title}
                  </span>
                  {experience === persona.id && (
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {persona.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Known Dermatological Triggers */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-editorial-heading text-slate-900 dark:text-slate-100">
            Sensitivity & Sensitization Triggers
          </h2>
          <p className="text-xs text-slate-500">
            Select compounds or conditions to auto-flag with elevated priority during scan reviews:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: "alcohol_dryness", label: "Volatile Alcohol Sensitization (Stinging / Dryness)" },
              { id: "oakmoss_lichen", label: "Oakmoss / Lichen Derivatives (Atranol / Chloroatranol)" },
              { id: "cinnamon_clove", label: "Cinnamic / Eugenol Notes (Spicy Warm Sensitizers)" },
              { id: "citrus_peroxides", label: "Oxidized Citrus Terpenes (Limonene / Linalool Hydroperoxides)" },
              { id: "synthetic_musks", label: "Nitro / Polycyclic Musks" },
              { id: "blanket_parfum", label: "Blanket Undisclosed 'Parfum' (Opaque Formulations)" },
            ].map((item) => {
              const isChecked = sensitivities.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSensitivity(item.id)}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                    isChecked
                      ? "border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                      isChecked
                        ? "bg-emerald-700 text-white"
                        : "border border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Preferences saved successfully.</span>
            </span>
          ) : <span />}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold tracking-wide uppercase transition-all shadow-xs"
          >
            Save Profile Preferences
          </button>
        </div>
      </form>

      <DisclaimerBanner variant="subtle" />
    </div>
  );
}
