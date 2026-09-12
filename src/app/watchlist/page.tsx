"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Plus, Trash2, ShieldAlert, Check, Sparkles, Database } from "lucide-react";
import { WatchlistItem } from "@/types";
import { DisclaimerBanner } from "@/components/brand/DisclaimerBanner";
import { useAuth } from "@/context/AuthContext";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/supabase/db";

const INITIAL_WATCHLIST: WatchlistItem[] = [
  {
    id: "w-1",
    ingredientName: "COUMARIN",
    reason: "History of mild contact irritation after application",
    sensitivityLevel: "moderate",
    addedAt: "2026-08-10",
  },
  {
    id: "w-2",
    ingredientName: "EVERNIA PRUNASTRI (OAKMOSS) EXTRACT",
    reason: "Confirmed patch test sensitivity to lichen compounds",
    sensitivityLevel: "strict",
    addedAt: "2026-07-22",
  },
  {
    id: "w-3",
    ingredientName: "ALCOHOL DENAT.",
    reason: "Preference for alcohol-free or low-volatile formulations on sensitive neck area",
    sensitivityLevel: "mild",
    addedAt: "2026-09-01",
  },
];

export default function WatchlistPage() {
  const { user, isConfigured } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>(INITIAL_WATCHLIST);
  const [newIngredient, setNewIngredient] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newSeverity, setNewSeverity] = useState<"mild" | "moderate" | "strict">("moderate");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      try {
        const saved = await getWatchlist(user?.id);
        if (isMounted) {
          if (saved && saved.length > 0) {
            setItems(saved);
          } else {
            setItems(INITIAL_WATCHLIST);
          }
        }
      } catch (err) {
        console.warn("Could not load watchlist:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredient.trim()) return;

    const added = await addToWatchlist(
      {
        ingredientName: newIngredient.trim().toUpperCase(),
        reason: newReason.trim() || "User tracked ingredient",
        sensitivityLevel: newSeverity,
      },
      user?.id
    );

    setItems((prev) => [added, ...prev.filter((i) => i.id !== added.id)]);
    setNewIngredient("");
    setNewReason("");
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    await removeFromWatchlist(id, user?.id);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Bookmark className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
            Sensitivity Management
          </span>
          {isConfigured && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Cloud Sync</span>
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
          Personal Watchlist
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track ingredients you are personally sensitive to or prefer to avoid. OLFEXA will prominently highlight them across every scan.
        </p>
      </div>

      {/* Add New Watchlist Item Form */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 font-editorial-heading">
          Add Ingredient to Watchlist
        </h2>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                INCI or Common Name
              </label>
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="e.g. CINNAMYL ALCOHOL, BENZYL BENZOATE"
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-foreground focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                Sensitivity Severity
              </label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as any)}
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-foreground focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="mild">Mild (Preference / Minor Dryness)</option>
                <option value="moderate">Moderate (Sensitivity History)</option>
                <option value="strict">Strict (Confirmed Allergy / Reaction)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">
              Personal Note / Reason (Optional)
            </label>
            <input
              type="text"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="e.g. Dermatologist confirmed allergic contact dermatitis; or causes redness"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-foreground focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newIngredient.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold tracking-wide transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Track Ingredient</span>
            </button>
          </div>
        </form>
      </div>

      {/* Watchlist Items Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-500 font-mono uppercase tracking-wider">
            Active Watchlist ({items.length})
          </span>
          <span className="text-[11px] text-slate-400">
            Automatically cross-referenced during OCR and analysis
          </span>
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold font-mono tracking-wide text-slate-900 dark:text-slate-100">
                  {item.ingredientName}
                </span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                    item.sensitivityLevel === "strict"
                      ? "bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200"
                      : item.sensitivityLevel === "moderate"
                      ? "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200"
                      : "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200"
                  }`}
                >
                  {item.sensitivityLevel}
                </span>
              </div>

              {item.reason && (
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.reason}
                </p>
              )}

              <span className="text-[10px] text-slate-400 font-mono block">
                Added {item.addedAt ? item.addedAt.split("T")[0] : "Recently"}
              </span>
            </div>

            <button
              onClick={() => handleDelete(item.id)}
              className="self-end sm:self-center p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Remove from watchlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <DisclaimerBanner variant="subtle" />
    </div>
  );
}
