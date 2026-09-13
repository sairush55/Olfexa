"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Sparkles, 
  Search, 
  Layers, 
  Bookmark, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  SlidersHorizontal,
  Bot,
  Trash2
} from "lucide-react";
import { AnalysisResult, AnalyzedIngredient } from "@/types";
import { MOCK_SCANS_LOOKUP, SAMPLE_SCAN_TRADITIONAL } from "@/data/mockScans";
import { getScanById, deleteScan } from "@/lib/supabase/db";
import { useAuth } from "@/context/AuthContext";
import { AlcoholStatusBanner } from "@/components/results/AlcoholStatusBanner";
import { MetricCard } from "@/components/results/MetricCard";
import { IngredientCard } from "@/components/results/IngredientCard";
import { FragranceFingerprintChart } from "@/components/results/FragranceFingerprintChart";
import { GroundedAssistantDrawer } from "@/components/results/GroundedAssistantDrawer";
import { ProvenanceCard } from "@/components/results/ProvenanceCard";
import { SuitabilityProfileCard } from "@/components/results/SuitabilityProfileCard";
import { FragrancePersonaCard } from "@/components/results/FragrancePersonaCard";
import { generateSuitabilityProfile } from "@/lib/suitabilityEngine";
import { DisclaimerBanner } from "@/components/brand/DisclaimerBanner";
import { formatDate } from "@/lib/utils";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = (params?.id as string) || "demo";

  const [scanResult, setScanResult] = useState<AnalysisResult | null>(() => {
    if (typeof id === "string" && MOCK_SCANS_LOOKUP[id]) {
      return MOCK_SCANS_LOOKUP[id];
    }
    return SAMPLE_SCAN_TRADITIONAL;
  });
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [selectedAssistantIngredient, setSelectedAssistantIngredient] = useState<AnalyzedIngredient | undefined>(undefined);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadScan() {
      // 1. Check sessionStorage for newly generated scan from review stage
      if (typeof window !== "undefined") {
        const cached = sessionStorage.getItem(`olfexa_scan_${id}`);
        if (cached) {
          try {
            if (isMounted) setScanResult(JSON.parse(cached));
            return;
          } catch {
            // fallback
          }
        }
      }

      // 2. Check global mock database lookup
      if (MOCK_SCANS_LOOKUP[id]) {
        if (isMounted) setScanResult(MOCK_SCANS_LOOKUP[id]);
        return;
      }

      // 3. Query Supabase database
      try {
        const dbScan = await getScanById(id);
        if (dbScan && isMounted) {
          setScanResult(dbScan);
          return;
        }
      } catch (err) {
        console.warn("Could not retrieve scan from database:", err);
      }

      // 4. Fallback to traditional sample
      if (isMounted) setScanResult(SAMPLE_SCAN_TRADITIONAL);
    }

    loadScan();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!scanResult) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-xs font-mono text-slate-500">
        Retrieving fragrance analysis dossier...
      </div>
    );
  }

  const handleOpenAssistant = (ingredient?: AnalyzedIngredient) => {
    setSelectedAssistantIngredient(ingredient);
    setAssistantOpen(true);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDeleteThisScan = async () => {
    if (!scanResult) return;
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`Are you sure you want to delete "${scanResult.perfumeName}" from your scan history?`);
      if (!confirmed) return;
    }
    setIsDeleting(true);
    try {
      await deleteScan(scanResult.id, user?.id);
      router.push("/history");
    } catch (err) {
      console.warn("Failed to delete scan:", err);
      setIsDeleting(false);
    }
  };

  // Filter ingredients
  const filteredIngredients = scanResult.ingredientsFound.filter((item) => {
    const matchSearch =
      (item.matchedInci && item.matchedInci.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.commonName && item.commonName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.rawInput.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (selectedCategoryFilter === "allergens") return item.isEuAllergen;
    if (selectedCategoryFilter === "alcohols") return item.isAlcohol;
    if (selectedCategoryFilter === "watchlist") return item.isWatchlistMatch;
    if (selectedCategoryFilter === "carriers") return item.category === "carrier" || item.category === "solvent";

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={user ? "/scan" : "/login?redirect=/scan"}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>New Fragrance Scan</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-card-bg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copySuccess ? "Link Copied!" : "Share Report"}</span>
          </button>
          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-card-bg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Compare</span>
          </Link>
          <button
            type="button"
            onClick={() => handleOpenAssistant()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-all shadow-xs"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask AI Assistant</span>
          </button>
          <button
            type="button"
            onClick={handleDeleteThisScan}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-card-bg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Delete this scanned report from history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? "Deleting..." : "Delete Scan"}</span>
          </button>
        </div>
      </div>

      {/* Main Header / Fragrance Title Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-card-bg shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-900/50">
              Fragrance Intelligence Dossier
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">
              Scanned on {formatDate(scanResult.scanDate)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
            {scanResult.perfumeName}
          </h1>
          <p className="text-sm text-slate-500 font-mono mt-1">
            {scanResult.brandName || "Declared Brand"}
          </p>
        </div>

        <div className="self-start sm:self-auto text-right text-xs">
          <span className="font-mono text-slate-400 block text-[10px] uppercase">
            Declared Constituents
          </span>
          <span className="font-bold text-lg text-slate-900 dark:text-slate-100 font-editorial-heading">
            {scanResult.ingredientsFound.length} Ingredients
          </span>
        </div>
      </div>

      {/* Packaging & Manufacturing Provenance Card */}
      {scanResult.provenance && (
        <ProvenanceCard provenance={scanResult.provenance} />
      )}

      {/* Core Alcohol Evaluation Banner */}
      <AlcoholStatusBanner
        status={scanResult.alcoholStatus}
        explanation={scanResult.alcoholStatusExplanation}
        detectedAlcohols={scanResult.detectedAlcohols}
      />

      {/* Primary Intelligence Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Potential Allergens"
          value={scanResult.potentialAllergens.length}
          subtitle="Declared EU Annex III fragrance allergens"
          badge={scanResult.potentialAllergens.length > 0 ? "Flagged" : "None"}
          badgeVariant={scanResult.potentialAllergens.length > 0 ? "warning" : "success"}
          icon={AlertTriangle}
        />

        <MetricCard
          title="Potential Irritants"
          value={scanResult.potentialIrritants.length}
          subtitle="Constituents with skin sensitivity notes"
          badge={scanResult.potentialIrritants.length > 0 ? "Noted" : "None"}
          badgeVariant={scanResult.potentialIrritants.length > 0 ? "default" : "success"}
          icon={ShieldAlert}
        />

        <MetricCard
          title="Watchlist Matches"
          value={scanResult.watchlistMatches.length}
          subtitle="Items matching personal avoidance alerts"
          badge={scanResult.watchlistMatches.length > 0 ? "Alert" : "Clean"}
          badgeVariant={scanResult.watchlistMatches.length > 0 ? "alert" : "success"}
          icon={Bookmark}
        />

        <MetricCard
          title="Formula Transparency"
          value={scanResult.transparencyRating}
          subtitle={scanResult.transparencyNotes}
          badge={scanResult.transparencyRating}
          badgeVariant={scanResult.transparencyRating === "HIGH" ? "success" : "default"}
          icon={Sparkles}
        />
      </div>

      {/* Evidence-Based Suitability Profile: Who may need additional consideration? */}
      <SuitabilityProfileCard
        profile={scanResult.suitabilityProfile || generateSuitabilityProfile(
          scanResult.ingredientsFound,
          scanResult.alcoholStatus,
          false
        )}
      />

      {/* Fragrance Composition Fingerprint */}
      <FragranceFingerprintChart
        fingerprint={scanResult.fragranceFingerprint}
        perfumeName={scanResult.perfumeName}
      />

      {/* Recreational Fragrance Persona & Astrological Discovery */}
      <FragrancePersonaCard
        initialPersona={scanResult.fragrancePersona}
        allIngredients={scanResult.ingredientsFound.map((i) => i.matchedInci || i.rawInput)}
      />

      {/* Ingredient Breakdown Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold font-editorial-heading text-slate-900 dark:text-slate-100">
              Ingredient Breakdown & Evidence
            </h3>
            <p className="text-xs text-slate-500">
              Showing {filteredIngredients.length} of {scanResult.ingredientsFound.length} declared ingredients
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ingredients..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-card-bg text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-600 w-44 sm:w-56"
              />
            </div>

            <div className="flex items-center gap-1 text-xs">
              {[
                { id: "all", label: "All" },
                { id: "allergens", label: "Allergens" },
                { id: "alcohols", label: "Alcohols" },
                { id: "watchlist", label: "Watchlist" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategoryFilter(tab.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategoryFilter === tab.id
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100/70 dark:bg-slate-800/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List of Ingredient Cards */}
        {filteredIngredients.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg text-slate-500 text-xs">
            No ingredients match your current search or category filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIngredients.map((item, idx) => (
              <IngredientCard
                key={idx}
                ingredient={item}
                onAskAssistant={(ing) => handleOpenAssistant(ing)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Non-Medical Disclaimer */}
      <DisclaimerBanner variant="prominent" />

      {/* Grounded Assistant Slide-over Drawer */}
      <GroundedAssistantDrawer
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        perfumeName={scanResult.perfumeName}
        ingredients={scanResult.ingredientsFound}
        initialIngredient={selectedAssistantIngredient}
      />
    </div>
  );
}
