"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { History, Search, ArrowRight, Camera, Database, Sparkles } from "lucide-react";
import { INITIAL_SCAN_HISTORY } from "@/data/mockScans";
import { DisclaimerBanner } from "@/components/brand/DisclaimerBanner";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getUserScans } from "@/lib/supabase/db";
import { ScanHistoryItem } from "@/types";

export default function HistoryPage() {
  const { user, isConfigured } = useAuth();
  const [search, setSearch] = useState("");
  const [scans, setScans] = useState<ScanHistoryItem[]>(INITIAL_SCAN_HISTORY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      setIsLoading(true);
      try {
        const userScans = await getUserScans(user?.id);
        if (isMounted) {
          if (userScans.length > 0) {
            // Prepend user scans and include initial examples
            const existingIds = new Set(userScans.map((s) => s.id));
            const combined = [
              ...userScans,
              ...INITIAL_SCAN_HISTORY.filter((s) => !existingIds.has(s.id)),
            ];
            setScans(combined);
          } else {
            setScans(INITIAL_SCAN_HISTORY);
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

        <Link
          href="/login?redirect=/scan"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold tracking-wide transition-all shadow-xs self-start sm:self-auto"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>New Scan</span>
        </Link>
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
            <Link
              key={scan.id}
              href={`/results/${scan.id}`}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-xs"
            >
              <div className="space-y-1">
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
              </div>

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

                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <DisclaimerBanner variant="subtle" />
    </div>
  );
}
