"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { History, Search, ArrowRight, Camera, Database, Sparkles, Trash2 } from "lucide-react";
import { INITIAL_SCAN_HISTORY } from "@/data/mockScans";
import { DisclaimerBanner } from "@/components/brand/DisclaimerBanner";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getUserScans, deleteScan, clearAllScans } from "@/lib/supabase/db";
import { ScanHistoryItem } from "@/types";

export default function HistoryPage() {
  const { user, isConfigured } = useAuth();
  const [search, setSearch] = useState("");
  const [scans, setScans] = useState<ScanHistoryItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const isClearedAll = localStorage.getItem("olfexa_clear_mock_scans") === "true";
        if (isClearedAll) return [];
        const deletedMocksRaw = localStorage.getItem("olfexa_deleted_mock_scans");
        const deletedMocks: string[] = deletedMocksRaw ? JSON.parse(deletedMocksRaw) : [];
        const localScansRaw = localStorage.getItem("olfexa_local_scans");
        const localScans: ScanHistoryItem[] = localScansRaw ? JSON.parse(localScansRaw) : [];
        const visibleMocks = INITIAL_SCAN_HISTORY.filter((s) => !deletedMocks.includes(s.id));
        const combined = [...localScans, ...visibleMocks.filter((m) => !localScans.some((l) => l.id === m.id))];
        return combined.length > 0 ? combined : visibleMocks;
      } catch {
        return INITIAL_SCAN_HISTORY;
      }
    }
    return INITIAL_SCAN_HISTORY;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      setIsLoading(true);
      try {
        const userScans = await getUserScans(user?.id);
        if (isMounted) {
          const isClearedAll = typeof window !== "undefined" && localStorage.getItem("olfexa_clear_mock_scans") === "true";
          const deletedMocksRaw = typeof window !== "undefined" ? localStorage.getItem("olfexa_deleted_mock_scans") : null;
          const deletedMocks: string[] = deletedMocksRaw ? JSON.parse(deletedMocksRaw) : [];
          const visibleMocks = isClearedAll ? [] : INITIAL_SCAN_HISTORY.filter((s) => !deletedMocks.includes(s.id));

          if (userScans.length > 0) {
            const existingIds = new Set(userScans.map((s) => s.id));
            const combined = [
              ...userScans,
              ...visibleMocks.filter((s) => !existingIds.has(s.id)),
            ];
            setScans(combined);
          } else {
            setScans(visibleMocks);
          }
        }
      } catch (e) {
        console.warn("Could not load scans:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleDelete = async (id: string, perfumeName?: string) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`Delete "${perfumeName || "this scan"}" from your history?`);
      if (!confirmed) return;
    }
    
    setDeletingId(id);
    // Optimistic removal from UI list
    setScans((prev) => prev.filter((s) => s.id !== id));
    
    try {
      await deleteScan(id, user?.id);
    } catch (err) {
      console.warn("Error deleting scan:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Are you sure you want to clear all archived scan reports?");
      if (!confirmed) return;
    }
    setScans([]);
    try {
      await clearAllScans(user?.id);
    } catch (err) {
      console.warn("Error clearing all scans:", err);
    }
  };

  const filtered = scans.filter(
    (item) =>
      item.perfumeName.toLowerCase().includes(search.toLowerCase()) ||
      (item.brandName && item.brandName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
              Archived Reports
            </span>
            {isConfigured && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Supabase Cloud Sync</span>
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
            Scan History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review past perfume analyses, ingredient fingerprints, and alcohol evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {scans.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-900/60 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-slate-600 dark:text-slate-400 hover:text-red-700 dark:hover:text-red-400 text-xs font-semibold tracking-wide transition-all shadow-xs"
              title="Clear all scans from history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          <Link
            href={user ? "/scan" : "/login?redirect=/scan"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold tracking-wide transition-all shadow-xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </Link>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter scans by perfume name or brand..."
          className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-card-bg text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
      </div>

      {/* History List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-400">
            Loading archived reports...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            No scans match your search query.
          </div>
        ) : (
          filtered.map((scan) => (
            <div
              key={scan.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <Link
                href={`/results/${scan.id}`}
                className="space-y-1 flex-1 group focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold font-editorial-heading text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {scan.perfumeName}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-mono">
                    {scan.brandName}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span>{formatDate(scan.date)}</span>
                  <span>•</span>
                  <span>{scan.allergenCount} allergens</span>
                  <span>•</span>
                  <span>Transparency: {scan.transparencyRating}</span>
                </div>
              </Link>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold ${
                    scan.alcoholStatus === "CONTAINS_ALCOHOL"
                      ? "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200"
                      : "bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200"
                  }`}
                >
                  {scan.alcoholStatus === "CONTAINS_ALCOHOL" ? "Contains Alcohol" : "No Alcohol"}
                </span>

                {/* Clear, dedicated Delete option */}
                <button
                  type="button"
                  onClick={() => handleDelete(scan.id, scan.perfumeName)}
                  title={`Delete ${scan.perfumeName} from history`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-900/60 bg-slate-50 dark:bg-slate-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold tracking-wide transition-all shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <Link
                  href={`/results/${scan.id}`}
                  title="View full report"
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-700 hover:text-white transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <DisclaimerBanner variant="subtle" />
    </div>
  );
}
