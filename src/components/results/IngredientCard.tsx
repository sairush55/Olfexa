"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  Droplet, 
  Bookmark, 
  HelpCircle, 
  BookOpen, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert 
} from "lucide-react";
import { AnalyzedIngredient } from "@/types";
import { cn } from "@/lib/utils";
import { EvidenceDrawer } from "./EvidenceDrawer";

interface IngredientCardProps {
  ingredient: AnalyzedIngredient;
  onAskAssistant?: (ingredient: AnalyzedIngredient) => void;
  className?: string;
}

export const IngredientCard: React.FC<IngredientCardProps> = ({
  ingredient,
  onAskAssistant,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);

  const getStatusBadge = () => {
    if (ingredient.isWatchlistMatch) {
      return {
        text: "Watchlist Match",
        icon: Bookmark,
        badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-900",
      };
    }
    if (ingredient.isEuAllergen) {
      return {
        text: "EU Annex III Allergen",
        icon: AlertTriangle,
        badgeClass: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      };
    }
    if (ingredient.isAlcohol) {
      return {
        text: ingredient.alcoholType === "fatty_alcohol" ? "Fatty Alcohol (Emollient)" : "Alcohol Carrier",
        icon: Droplet,
        badgeClass: ingredient.alcoholType === "fatty_alcohol"
          ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800"
          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      };
    }
    if (ingredient.isPotentialIrritant) {
      return {
        text: "Potential Irritant Note",
        icon: ShieldAlert,
        badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-800",
      };
    }
    return {
      text: "Declared Compound",
      icon: HelpCircle,
      badgeClass: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    };
  };

  const statusConfig = getStatusBadge();
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <div
        className={cn(
          "rounded-2xl border bg-card-bg transition-all duration-200 shadow-xs",
          ingredient.isWatchlistMatch
            ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/20"
            : ingredient.isEuAllergen
            ? "border-amber-200 dark:border-amber-900/40 hover:border-amber-300"
            : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
          className
        )}
      >
        <div className="p-4 sm:p-5">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                {ingredient.matchedInci || ingredient.rawInput}
              </h4>
              {ingredient.commonName && (
                <span className="text-xs text-slate-500 font-normal">
                  ({ingredient.commonName})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold border",
                  statusConfig.badgeClass
                )}
              >
                <StatusIcon className="w-3 h-3" />
                <span>{statusConfig.text}</span>
              </span>
            </div>
          </div>

          {/* Category and short description */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="font-mono uppercase text-[10px] tracking-wider text-slate-400">
              Role: {ingredient.category.replace("_", " ")}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {ingredient.description}
          </p>

          {/* Highlight Reason Banner */}
          {ingredient.whyFlagged && (
            <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <span className="font-semibold text-slate-900 dark:text-slate-200 text-[11px] font-mono uppercase tracking-wider flex-shrink-0">
                Why Flagged:
              </span>
              <span className="text-slate-600 dark:text-slate-400 text-xs">
                {ingredient.whyFlagged}
              </span>
            </div>
          )}

          {/* Action Row */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              {ingredient.evidence.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsEvidenceOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-medium px-2 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View Evidence ({ingredient.evidence.length})</span>
                </button>
              )}

              {onAskAssistant && (
                <button
                  type="button"
                  onClick={() => onAskAssistant(ingredient)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ask Assistant</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-1"
            >
              <span>{isExpanded ? "Less detail" : "More detail"}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Expanded Detail Drawer */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-mono text-[10px] uppercase text-slate-400 block">
                    Original OCR Raw Token:
                  </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {ingredient.rawInput}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase text-slate-400 block">
                    Declaration Position:
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Declared order index #{ingredient.order}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 italic pt-1">
                Ingredients are traditionally listed by manufacturers in descending order of predominance until reaching 1% concentration threshold.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Evidence Panel */}
      <EvidenceDrawer
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        ingredientName={ingredient.matchedInci || ingredient.rawInput}
        evidence={ingredient.evidence}
      />
    </>
  );
};
