"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, 
  Trash2, 
  Plus, 
  Edit3, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  RotateCcw,
  PackageCheck
} from "lucide-react";
import { analyzeIngredientsList } from "@/lib/analysisEngine";
import { MOCK_SCANS_LOOKUP } from "@/data/mockScans";
import { saveScan } from "@/lib/supabase/db";
import { useAuth } from "@/context/AuthContext";

import { PackagingProvenance } from "@/types";

interface ReviewItem {
  id: string;
  name: string;
  selected: boolean;
  isEditing: boolean;
}

interface IngredientReviewListProps {
  initialIngredients: string[];
  perfumeName?: string;
  brandName?: string;
  imageUrl?: string;
  provenance?: PackagingProvenance;
}

export const IngredientReviewList: React.FC<IngredientReviewListProps> = ({
  initialIngredients,
  perfumeName = "Scanned Fragrance",
  brandName = "Declared Brand",
  imageUrl,
  provenance,
}) => {
  const router = useRouter();
  const { user } = useAuth();

  const [items, setItems] = useState<ReviewItem[]>(() =>
    initialIngredients.map((name, i) => ({
      id: `rev-${i}-${Date.now()}`,
      name,
      selected: true,
      isEditing: false,
    }))
  );

  const [newIngredientInput, setNewIngredientInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Toggle selection
  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Delete token
  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Edit token inline
  const handleToggleEdit = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isEditing: !item.isEditing } : item))
    );
  };

  const handleStartEdit = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isEditing: true } : item
      )
    );
  };

  const handleNameChange = (id: string, newName: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName } : item))
    );
  };

  const handleSaveEdit = (id: string, newName: string) => {
    if (!newName.trim()) {
      handleDelete(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, name: newName.trim(), isEditing: false } : item
      )
    );
  };

  // Add new token
  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredientInput.trim()) return;

    setItems((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: newIngredientInput.trim().toUpperCase(),
        selected: true,
        isEditing: false,
      },
    ]);
    setNewIngredientInput("");
  };

  // Reset to original extraction
  const handleReset = () => {
    setItems(
      initialIngredients.map((name, i) => ({
        id: `rev-${i}-${Date.now()}`,
        name,
        selected: true,
        isEditing: false,
      }))
    );
  };

  // Run OLFEXA Analysis Engine
  const handleAnalyze = async () => {
    const selectedTokens = items.filter((i) => i.selected).map((i) => i.name.trim());
    if (selectedTokens.length === 0) return;

    setIsAnalyzing(true);

    const result = analyzeIngredientsList(selectedTokens, perfumeName, brandName);
    result.imageUrl = imageUrl;
    if (provenance) {
      result.provenance = provenance;
    }

    // Persist to Supabase if configured & authenticated; cache in storage
    try {
      await saveScan(result, user?.id);
    } catch (e) {
      console.warn("Could not persist to Supabase:", e);
    }

    // Cache in sessionStorage for results page retrieval
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`olfexa_scan_${result.id}`, JSON.stringify(result));
      MOCK_SCANS_LOOKUP[result.id] = result;
    }

    setTimeout(() => {
      router.push(`/results/${result.id}`);
    }, 400);
  };

  const selectedCount = items.filter((i) => i.selected).length;

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/90 dark:border-emerald-900/40 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
        <PackageCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-semibold block tracking-tight mb-0.5">
            Pre-Analysis Verification Checkpoint
          </span>
          Vision/OCR has detected and extracted visible ingredient names. Please review and confirm the candidates below. The <strong>OLFEXA Analysis Engine—not OCR—</strong>will then normalize and match these verified ingredients against the OLFEXA knowledge base to determine alcohol status, ingredient categories, and evidence-based potential concerns.
        </div>
      </div>

      {/* Summary Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-editorial-heading">
            Detected Ingredients ({items.length})
          </h2>
          <p className="text-xs text-slate-500">
            {selectedCount} candidate{selectedCount === 1 ? "" : "s"} selected for analysis
          </p>
        </div>

        <button
          type="button"
          disabled={selectedCount === 0 || isAnalyzing}
          onClick={handleAnalyze}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm"
        >
          {isAnalyzing ? (
            <span>Analyzing against Evidence DB...</span>
          ) : (
            <>
              <span>Analyze Ingredients ({selectedCount})</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Item Chips / Rows */}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              item.selected
                ? "bg-card-bg border-slate-200/90 dark:border-slate-800 shadow-xs"
                : "bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/40 dark:border-slate-800/40 opacity-50"
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                  item.selected
                    ? "bg-emerald-700 text-white"
                    : "border border-slate-300 dark:border-slate-600 text-transparent"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </button>

              <span className="text-[11px] font-mono text-slate-400 w-6">
                #{idx + 1}
              </span>

              {item.isEditing ? (
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleNameChange(item.id, e.target.value)}
                  onBlur={() => handleToggleEdit(item.id)}
                  onKeyDown={(e) => e.key === "Enter" && handleToggleEdit(item.id)}
                  autoFocus
                  className="flex-1 text-xs font-mono px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-emerald-500 rounded text-foreground focus:outline-none"
                />
              ) : (
                <span
                  onClick={() => handleToggleEdit(item.id)}
                  className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:underline"
                  title="Click to edit"
                >
                  {item.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleToggleEdit(item.id)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Edit name"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
                title="Remove token"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Missing Ingredient Bar */}
      <form onSubmit={handleAddIngredient} className="flex gap-2 pt-2">
        <input
          type="text"
          value={newIngredientInput}
          onChange={(e) => setNewIngredientInput(e.target.value)}
          placeholder="Add missing ingredient (e.g. GERANIOL, CITRAL)..."
          className="flex-1 text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-card-bg text-foreground focus:ring-2 focus:ring-emerald-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newIngredientInput.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium tracking-wide disabled:opacity-40 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
};
