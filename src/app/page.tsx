"use client";

import React from "react";
import Link from "next/link";
import { 
  Camera, 
  ArrowRight, 
  CheckCircle2, 
  ScanLine, 
  Droplet, 
  AlertTriangle, 
  Users, 
  Sparkles, 
  FileText, 
  Check, 
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { DisclaimerBanner } from "@/components/brand/DisclaimerBanner";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();
  const scanLink = user ? "/scan" : "/login?redirect=/scan";

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground space-y-20 sm:space-y-24 pb-20 overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* SECTION 1 — HERO                                                          */}
      {/* ========================================================================= */}
      <section className="relative pt-12 sm:pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Brand, Tagline & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-300/60 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Fragrance Intelligence Platform</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight leading-[1.12]">
                Decode your fragrance. <br className="hidden sm:inline" />
                <span className="text-emerald-800 dark:text-emerald-400">Choose with confidence.</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Scan your perfume or attar label to understand what&apos;s inside and make a more informed choice.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 pt-1">
              <Link
                href={scanLink}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all group"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Your Fragrance</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-card-bg hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium transition-all shadow-xs"
              >
                <span>How It Works</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </a>
            </div>

            <p className="text-xs text-slate-500 font-mono pt-1">
              No laboratory equipment or barcode lookup required • Just take a clear photo of the packaging
            </p>
          </div>

          {/* Right Column: Premium Visual of Label Being Scanned */}
          <div className="lg:col-span-5 relative">
            <div className="relative p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-card-bg shadow-lg space-y-4">
              
              {/* Packaging Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ScanLine className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
                    Perfume / Attar Label
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                  Optical Scan
                </span>
              </div>

              {/* Physical Label Simulation */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 font-mono text-xs space-y-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  INGREDIENTS:
                </span>
                <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
                  ALCOHOL DENAT., PARFUM / FRAGRANCE, AQUA / WATER, LIMONENE, LINALOOL, COUMARIN.
                </p>
              </div>

              {/* Verified Structured Output */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Instant Ingredient Intelligence
                </span>
                
                <div className="p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-slate-700 dark:text-slate-300">Alcohol Status:</span>
                  </div>
                  <span className="font-mono font-semibold text-amber-800 dark:text-amber-300 text-[11px]">
                    Contains Recognized Alcohol
                  </span>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-slate-700 dark:text-slate-300">Potential Concerns:</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                    2 Regulated EU Allergens
                  </span>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-slate-700 dark:text-slate-300">Suitability Insights:</span>
                  </div>
                  <span className="font-mono font-semibold text-emerald-800 dark:text-emerald-300 text-[11px]">
                    Evidence-Supported
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2 — HOW IT WORKS                                                  */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
            Simple 5-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
            How OLFEXA works
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            From physical cosmetic label to clear, evidence-based understanding in moments.
          </p>
        </div>

        {/* 5 Simple Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: "01",
              title: "SCAN",
              desc: "Upload or capture your perfume or attar label."
            },
            {
              step: "02",
              title: "VERIFY",
              desc: "OLFEXA checks the image and finds the ingredient list."
            },
            {
              step: "03",
              title: "EXTRACT",
              desc: "Vision/OCR reads the visible ingredients."
            },
            {
              step: "04",
              title: "ANALYZE",
              desc: "You confirm the ingredients, then OLFEXA checks them against its knowledge base and evidence."
            },
            {
              step: "05",
              title: "UNDERSTAND",
              desc: "Get clear insights about ingredients, alcohol, potential concerns, evidence, and suitability considerations."
            }
          ].map((item, idx) => (
            <div
              key={item.step}
              className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-card-bg shadow-2xs space-y-3 flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-800 transition-all"
            >
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {item.step} — {item.title}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono text-slate-400">
                Step {idx + 1} of 5
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3 — WHAT YOU GET                                                  */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
            Clear Insights
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
            Understand more than just the label.
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Four key pillars designed to help you make confident fragrance choices.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: "INGREDIENTS",
              desc: "See the ingredients detected from your label.",
              icon: FileText
            },
            {
              title: "ALCOHOL",
              desc: "Know whether a recognized alcohol ingredient was detected.",
              icon: Droplet
            },
            {
              title: "POTENTIAL CONCERNS",
              desc: "Identify recognized fragrance allergens, potential irritants, and ingredients needing additional consideration.",
              icon: AlertTriangle
            },
            {
              title: "SUITABILITY",
              desc: "See when certain user groups may require additional consideration based on verified ingredients and available evidence.",
              icon: Users
            }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-card-bg shadow-2xs space-y-3 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold font-mono tracking-wider text-slate-950 dark:text-white">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4 — ONE SIMPLE EXAMPLE                                            */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
            Realistic Result Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
            From label to insight.
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            A clean, compact view of what an OLFEXA fragrance report looks like.
          </p>
        </div>

        {/* Compact Result Card */}
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-card-bg shadow-sm space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Fragrance Report Dossier
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              Illustrative example
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Left: Verified Ingredients */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                VERIFIED INGREDIENTS
              </span>
              <div className="space-y-1 font-mono text-xs text-slate-800 dark:text-slate-200">
                <div>Alcohol Denat.</div>
                <div>Parfum</div>
                <div>Aqua</div>
                <div>Limonene</div>
                <div>Linalool</div>
              </div>
            </div>

            {/* Right: Analytical Summary */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">
                  ALCOHOL
                </span>
                <span className="font-semibold text-amber-800 dark:text-amber-300">
                  Contains recognized alcohol
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">
                  POTENTIAL CONCERN
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Potential fragrance allergen
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">
                  SUITABILITY
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Some users may require additional consideration
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">
                  EVIDENCE
                </span>
                <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Supporting information available
                </span>
              </div>
            </div>

          </div>

          <div className="pt-2 text-[11px] font-mono text-slate-400 text-center">
            Illustrative example based on visible physical label ingredients.
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5 — PERSONALIZATION                                               */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-6 sm:p-8 rounded-3xl border border-purple-200/70 dark:border-purple-900/50 bg-gradient-to-br from-card-bg via-purple-50/20 to-card-bg dark:from-card-bg dark:via-purple-950/20 dark:to-card-bg shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-purple-700 dark:text-purple-400 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Fragrance Exploration</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-editorial-heading text-slate-950 dark:text-white">
              Find your fragrance persona.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg">
              Explore scent styles based on your preferences and optional zodiac-inspired recommendations.
            </p>
            <p className="text-[11px] text-slate-400 font-mono pt-1">
              *Zodiac recommendations are for entertainment and fragrance discovery.
            </p>
          </div>

          <Link
            href="/results/demo"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all shrink-0"
          >
            <span>Discover Your Fragrance Persona</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL CTA                                                                 */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-8 sm:p-12 rounded-3xl border border-emerald-200/90 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/80 via-card-bg to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-card-bg text-center space-y-5 shadow-sm">
          
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white">
              Ready to decode your fragrance?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Scan your perfume or attar label and discover what&apos;s inside.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href={scanLink}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Your Fragrance</span>
            </Link>
          </div>

          <div className="pt-4 max-w-xl mx-auto">
            <DisclaimerBanner variant="subtle" />
          </div>

        </div>
      </section>

    </div>
  );
}
