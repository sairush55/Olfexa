"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Camera, 
  Layers, 
  Bookmark, 
  Compass, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Database
} from "lucide-react";
import { INITIAL_SCAN_HISTORY, SAMPLE_SCAN_TRADITIONAL } from "@/data/mockScans";
import { DisclaimerBanner } from "@/components/brand/DisclaimerBanner";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getUserScans, getWatchlist } from "@/lib/supabase/db";
import { ScanHistoryItem } from "@/types";

export default function DashboardPage() {
  const { user, isConfigured } = useAuth();
  const [scans, setScans] = useState<ScanHistoryItem[]>(INITIAL_SCAN_HISTORY);
  const [watchlistCount, setWatchlistCount] = useState(3);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [fetchedScans, fetchedWatchlist] = await Promise.all([
          getUserScans(user?.id),
          getWatchlist(user?.id),
        ]);

        if (isMounted) {
          if (fetchedScans && fetchedScans.length > 0) {
            setScans(fetchedScans);
          }
          if (fetchedWatchlist && fetchedWatchlist.length > 0) {
            setWatchlistCount(fetchedWatchlist.length);
          }
        }
      } catch (err) {
        console.warn("Error loading dashboard data:", err);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const totalIngredientsAnalyzed = scans.reduce((acc, curr) => acc + (curr.allergenCount + 6), 0);
  const totalWatchlistHits = scans.reduce((acc, curr) => acc + curr.watchlistMatchCount, 0);
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Personalized Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold block">
              Fragrance Intelligence Hub
            </span>
            {isConfigured && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Supabase Live</span>
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
            {userName ? `Welcome back, ${userName}.` : "Welcome to OLFEXA."}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Understand your fragrance collection with evidence-based clarity.
          </p>
        </div>

        <Link
          href={user ? "/scan" : "/login?redirect=/scan"}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold tracking-wide shadow-sm transition-all self-start sm:self-auto"
        >
          <Camera className="w-4 h-4" />
          <span>Scan Fragrance</span>
        </Link>
      </div>

      {/* Aggregate Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
            Perfumes Scanned
          </span>
          <div className="text-3xl font-bold font-editorial-heading text-slate-900 dark:text-slate-100">
            {scans.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Formulations in your {isConfigured ? "cloud" : "local"} library
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
            Ingredients Cross-Referenced
          </span>
          <div className="text-3xl font-bold font-editorial-heading text-slate-900 dark:text-slate-100">
            {totalIngredientsAnalyzed}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Evaluated against IFRA & EU cosmetic standards
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
            Tracked Sensitivities
          </span>
          <div className="text-3xl font-bold font-editorial-heading text-emerald-700 dark:text-emerald-400">
            {watchlistCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Ingredients monitored in your personal watchlist
          </p>
        </div>
      </div>

      {/* Quick Launch Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href={user ? "/scan" : "/login?redirect=/scan"}
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg hover:border-emerald-600/70 hover:shadow-sm transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
            Scan Fragrance
          </span>
          <span className="text-[10px] text-slate-400">Photo / OCR intake</span>
        </Link>

        <Link
          href="/compare"
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg hover:border-emerald-600/70 hover:shadow-sm transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center mb-3">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
            Compare
          </span>
          <span className="text-[10px] text-slate-400">Side-by-side analysis</span>
        </Link>

        <Link
          href="/watchlist"
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg hover:border-emerald-600/70 hover:shadow-sm transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center mb-3">
            <Bookmark className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
            Watchlist
          </span>
          <span className="text-[10px] text-slate-400">Manage sensitivities</span>
        </Link>

        <Link
          href="/ingredients"
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg hover:border-emerald-600/70 hover:shadow-sm transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-3">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
            Dictionary
          </span>
          <span className="text-[10px] text-slate-400">INCI reference guide</span>
        </Link>
      </div>

      {/* Recent Scans Strip */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-editorial-heading text-slate-950 dark:text-white">
            Recent Scans
          </h2>
          <Link
            href="/history"
            className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View all archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {scans.slice(0, 3).map((scan) => (
            <Link
              key={scan.id}
              href={`/results/${scan.id}`}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group shadow-xs"
            >
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">
                  {formatDate(scan.date)}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {scan.perfumeName}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {scan.brandName}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                    scan.alcoholStatus === "CONTAINS_ALCOHOL"
                      ? "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200"
                      : "bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200"
                  }`}
                >
                  {scan.alcoholStatus === "CONTAINS_ALCOHOL" ? "Alcohol" : "No Alcohol"}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {scan.allergenCount} allergens
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <DisclaimerBanner variant="subtle" />
    </div>
  );
}
