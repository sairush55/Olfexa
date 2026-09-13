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
  AlertTriangle,
  CheckCircle2, 
  Sparkles,
  RotateCcw,
  PackageCheck,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { analyzeIngredientsList } from "@/lib/analysisEngine";
import { MOCK_SCANS_LOOKUP } from "@/data/mockScans";
import { saveScan } from "@/lib/supabase/db";
import { useAuth } from "@/context/AuthContext";
import { PackagingProvenance, ExtractedOcrIngredient } from "@/types";

interface ReviewItem {
  id: string;
  name: string;
  selected: boolean;
  isEditing: boolean;
  confidence: number;
  needsReview: boolean;
  rawDetected?: string;
}

interface IngredientReviewListProps {
  initialIngredients: string[];
  detailedIngredients?: ExtractedOcrIngredient[];
  rawOcrText?: string;
  perfumeName?: string;
  brandName?: string;
  imageUrl?: string;
  provenance?: PackagingProvenance;
}

export const IngredientReviewList: React.FC<IngredientReviewListProps> = ({
  initialIngredients,
  detailedIngredients,
  rawOcrText,
  perfumeName = "Scanned Fragrance",
  brandName = "Declared Brand",
  imageUrl,
  provenance,
}) => {
  const router = useRouter();
  const { user } = useAuth();

  const [items, setItems] = useState<ReviewItem[]>(() => {
    if (detailedIngredients && detailedIngredients.length > 0) {
      return detailedIngredients.map((ing, i) => ({
        id: `rev-${i}-${Date.now()}`,
        name: ing.name,
        selected: true,
        isEditing: false,
        confidence: ing.confidence ?? 0.85,
        needsReview: ing.needsReview ?? (ing.confidence < 0.75),
        rawDetected: ing.rawDetected
      }));
    }

    return initialIngredients.map((name, i) => {
      const isUncertain = name.includes("?") || name.length <= 3;
      return {
        id: `rev-${i}-${Date.now()}`,
        name,
        selected: true,
        isEditing: false,
        confidence: isUncertain ? 0.65 : 0.90,
        needsReview: isUncertain,
        rawDetected: name
      };
    });
  });

  const [newIngredientInput, setNewIngredientInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showRawOcr, setShowRawOcr] = useState(false);

  // Toggle selection
  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Toggle select all
  const handleToggleAll = () => {
    const allSelected = items.every((i) => i.selected);
    setItems((prev) => prev.map((i) => ({ ...i, selected: !allSelected })));
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
        item.id === id ? { ...item, name: newName.trim().toUpperCase(), isEditing: false, needsReview: false } : item
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
        confidence: 1.0,
        needsReview: false,
        rawDetected: newIngredientInput.trim().toUpperCase()
      },
    ]);
    setNewIngredientInput("");
  };

  // Reset to original extraction
  const handleReset = () => {
    if (detailedIngredients && detailedIngredients.length > 0) {
      setItems(
        detailedIngredients.map((ing, i) => ({
          id: `rev-${i}-${Date.now()}`,
          name: ing.name,
          selected: true,
          isEditing: false,
          confidence: ing.confidence ?? 0.85,
          needsReview: ing.needsReview ?? false,
          rawDetected: ing.rawDetected
        }))
      );
    } else {
      setItems(
        initialIngredients.map((name, i) => ({
          id: `rev-${i}-${Date.now()}`,
          name,
          selected: true,
          isEditing: false,
          confidence: 0.90,
          needsReview: false,
          rawDetected: name
        }))
      );
    }
  };

  // Run OLFEXA Analysis Engine
  const handleAnalyze = async () => {
    const selectedTokens = items.filter((i) => i.selected).map((i) => i.name.trim());
    if (selectedTokens.length === 0) return;

    setIsAnalyzing(true);

    const result = analyzeIngredientsList(selectedTokens, perfumeName, brandName);
    result.imageUrl = imageUrl;
    if (provenance) {
      result.provenance = {
        ...provenance,
        categorized: {
          ingredients: items.filter((i) => i.selected).map((i) => ({
            name: i.name,
            confidence: i.confidence,
            needsReview: i.needsReview,
            rawDetected: i.rawDetected,
          })),
          mfg: provenance.manufacturingInfo,
          mfgBy: {
            brandName: provenance.companyDetails?.brandName,
            manufacturer: provenance.companyDetails?.manufacturer,
            distributor: provenance.companyDetails?.distributor,
            fullAddress: provenance.companyAddress?.fullAddress,
            countryOfOrigin: provenance.companyAddress?.countryOfOrigin,
            responsiblePersonEU: provenance.companyAddress?.responsiblePersonEU,
          },
          others: provenance.others || {
            fragranceType: provenance.fragranceType,
          },
        },
      };
    }

    try {
      await saveScan(result, user?.id);
    } catch (e) {
      console.warn("Could not persist to Supabase:", e);
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem(`olfexa_scan_${result.id}`, JSON.stringify(result));
      MOCK_SCANS_LOOKUP[result.id] = result;
    }

    setTimeout(() => {
      router.push(`/results/${result.id}`);
    }, 400);
  };

  const selectedCount = items.filter((i) => i.selected).length;
  const flaggedCount = items.filter((i) => i.needsReview).length;

  return (
    <div className="space-y-6">
      {/* Notice Banner: Strict separation of Vision/OCR vs OLFEXA Analysis Engine */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/90 dark:border-emerald-900/50 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
        <PackageCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <span className="font-semibold block tracking-tight">
            Pre-Analysis Verification Checkpoint
          </span>
          <p className="text-[11px] leading-relaxed text-emerald-900/90 dark:text-emerald-300">
            Vision/OCR has isolated text candidates from the label. Please inspect and confirm the detected ingredients below. 
            The <strong>OLFEXA Analysis Engine—not the OCR layer—</strong>will subsequently evaluate alcohol formulation, cosmetic categories, and evidence-based potential concerns.
          </p>
        </div>
      </div>

      {/* Flagged Review Alert if any items need attention */}
      {flaggedCount > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="text-[11px] leading-relaxed">
            <strong className="font-semibold">{flaggedCount} ingredient{flaggedCount === 1 ? "" : "s"} marked for review:</strong> Some characters had lower optical clarity or slight spelling divergence from standard INCI dictionaries. Click any ingredient name to edit or correct spelling before analyzing.
          </div>
        </div>
      )}

      {/* Summary Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-editorial-heading">
              Extracted Ingredients ({items.length})
            </h2>
            <button
              type="button"
              onClick={handleToggleAll}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline ml-2"
            >
              {items.every((i) => i.selected) ? "Deselect All" : "Select All"}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {selectedCount} candidate{selectedCount === 1 ? "" : "s"} ready for evidence analysis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 text-xs font-mono transition-colors"
            title="Reset to original OCR extraction"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={selectedCount === 0 || isAnalyzing}
            onClick={handleAnalyze}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm"
          >
            {isAnalyzing ? (
              <span>Evaluating evidence...</span>
            ) : (
              <>
                <span>Analyze Ingredients ({selectedCount})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Item Chips / Rows with Confidence Badges */}
      <div className="space-y-2">
        {items.map((item, idx) => {
          const isHighConf = !item.needsReview && item.confidence >= 0.80;
          return (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all gap-2 ${
                item.selected
                  ? item.needsReview
                    ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60 shadow-xs"
                    : "bg-card-bg border-slate-200/90 dark:border-slate-800 shadow-xs"
                  : "bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/40 dark:border-slate-800/40 opacity-50"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                <button
                  type="button"
                  onClick={() => handleToggle(item.id)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                    item.selected
                      ? "bg-emerald-700 text-white"
                      : "border border-slate-300 dark:border-slate-600 text-transparent"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>

                <span className="text-[11px] font-mono text-slate-400 w-6 shrink-0">
                  #{idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  {item.isEditing ? (
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleNameChange(item.id, e.target.value)}
                      onBlur={() => handleSaveEdit(item.id, item.name)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(item.id, item.name);
                        if (e.key === "Escape") handleToggleEdit(item.id);
                      }}
                      autoFocus
                      className="w-full text-xs font-mono px-2 py-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-foreground focus:outline-none"
                    />
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        onClick={() => handleToggleEdit(item.id)}
                        className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:underline"
                        title="Click to edit"
                      >
                        {item.name}
                      </span>

                      {item.rawDetected && item.rawDetected !== item.name && (
                        <span className="text-[10px] font-mono text-slate-400">
                          (read as: {item.rawDetected})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 pl-8 sm:pl-0">
                {/* Confidence Badge */}
                {isHighConf ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>✓ High confidence</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                    <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>⚠ Low confidence — verify spelling</span>
                  </span>
                )}

                <div className="flex items-center gap-1">
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
            </div>
          );
        })}
      </div>

      {/* Add Missing Ingredient Bar */}
      <form onSubmit={handleAddIngredient} className="flex gap-2 pt-2">
        <input
          type="text"
          value={newIngredientInput}
          onChange={(e) => setNewIngredientInput(e.target.value)}
          placeholder="Add missing ingredient (e.g. GERANIOL, CITRAL, COUMARIN)..."
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

      {/* Raw OCR Text Comparison Accordion */}
      {rawOcrText && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowRawOcr(!showRawOcr)}
            className="w-full p-3.5 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Compare with Raw OCR Output</span>
            </span>
            {showRawOcr ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showRawOcr && (
            <div className="p-4 pt-0 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                Verbatim optical text recognized directly from the image before parsing and INCI harmonization:
              </p>
              <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap max-h-48">
                {rawOcrText}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

