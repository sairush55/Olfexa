"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Camera, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Droplet, 
  Eye, 
  FileText, 
  Check, 
  X, 
  HelpCircle, 
  Layers, 
  Search, 
  Compass, 
  Info, 
  SlidersHorizontal, 
  BookOpen, 
  AlertCircle, 
  ChevronRight, 
  UserCheck, 
  HeartHandshake,
  Baby,
  Users,
  Shield,
  Activity,
  Heart,
  Flower2,
  ScanLine,
  Sliders,
  CheckCheck,
  FileSearch,
  Scale
} from "lucide-react";
import { DisclaimerBanner } from "@/components/brand/DisclaimerBanner";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();
  const scanLink = user ? "/scan" : "/login?redirect=/scan";

  // Section 6: Interactive Verification Simulator State
  const [correctedLinalool, setCorrectedLinalool] = useState(false);

  // Section 7: Fragrance Persona Interactive Preview State
  const [selectedSign, setSelectedSign] = useState<"leo" | "libra" | "pisces">("leo");

  const PERSONA_PREVIEWS = {
    leo: {
      sign: "Leo",
      dates: "Jul 23 – Aug 22",
      element: "Fire",
      vibe: "Bold • Warm • Luxurious",
      notes: ["Oud Wood", "Golden Amber", "Royal Saffron", "Rich Cedar"],
      attarType: "Pure Aged Dehn Al Oud & Ambergris Attar",
      perfumeType: "Warm Amber Woody Extrait de Parfum",
      quote: "Commanding warmth designed for expressive presence."
    },
    libra: {
      sign: "Libra",
      dates: "Sep 23 – Oct 22",
      element: "Air",
      vibe: "Balanced • Elegant • Harmonious",
      notes: ["Damask Rose", "Italian Bergamot", "White Iris", "Clean Sandalwood"],
      attarType: "Rose & Soft Sandalwood Ruh Attar",
      perfumeType: "Airy Floral-Chypre Eau de Parfum",
      quote: "Symmetrical floral harmony crafted for poise."
    },
    pisces: {
      sign: "Pisces",
      dates: "Feb 19 – Mar 20",
      element: "Water",
      vibe: "Dreamy • Aquatic • Serene",
      notes: ["Sea Minerals", "Blue Lotus", "Calming Vetiver", "Silver Frankincense"],
      attarType: "Mitti (Petrichor) & Frankincense Infusion",
      perfumeType: "Ethereal Oceanic Green Eau Fraîche",
      quote: "Fluid aquatic depth that lingers with quiet mystery."
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground space-y-20 sm:space-y-28 pb-24 overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* HERO SECTION                                                              */}
      {/* ========================================================================= */}
      <section className="relative pt-12 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Brand, Tagline & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-300/60 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-medium shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Evidence-Based Fragrance Intelligence</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight leading-[1.12]">
                Decode your fragrance. <br className="hidden sm:inline" />
                <span className="text-emerald-800 dark:text-emerald-400">Choose with confidence.</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Scan your perfume or attar label and turn complex ingredient information into clear, evidence-based insights.
              </p>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 pt-2">
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
              </a>
            </div>

            {/* Quick Micro-Metrics */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-mono">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>No Guesswork</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>User-Verified OCR</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Medical Claims</span>
              </div>
            </div>
          </div>

          {/* Right Column: Physical Label to Structured Data Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-card-bg shadow-lg space-y-5">
              
              {/* Card Header: Simulated Physical Packaging */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80 animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
                    Physical Cosmetic Packaging Label
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Optical Scan Preview
                </span>
              </div>

              {/* Simulated Packaging Label Snippet */}
              <div className="p-4 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 font-mono text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse" />
                <span className="text-[10px] uppercase text-emerald-700 dark:text-emerald-400 font-bold block mb-1">
                  [INGREDIENTS LIST REGION]
                </span>
                <p>
                  INGREDIENTS: ALCOHOL DENAT., AQUA/WATER/EAU, PARFUM/FRAGRANCE, LIMONENE, LINALOOL, COUMARIN, GERANIOL, CITRONELLOL.
                </p>
              </div>

              {/* Transformation Indicator */}
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                <ScanLine className="w-4 h-4 animate-bounce" />
                <span>Vision Detects → OCR Extracts → Structured Intelligence</span>
              </div>

              {/* Structured Resolving Data Chips */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Solvent Matrix:</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">Alcohol Denat. (Ethanol)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-medium">
                    Contains Alcohol
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Disclosed EU Allergens:</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">5 Monitored Constituents</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-medium">
                    EU Annex III
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Suitability Profile:</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">6 Calibrated Groups</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300 font-medium">
                    Evidence-Based
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1 — WHAT IS OLFEXA?                                               */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
            Core Definition
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
            What is OLFEXA?
          </h2>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong>OLFEXA</strong> is a fragrance intelligence platform that helps you understand the information printed on perfume and attar labels.
          </p>
        </div>

        {/* 10 Visual Capabilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { num: "01", title: "Validates Product", desc: "Verifies the image is a genuine fragrance item, not food or paperwork.", icon: ShieldCheck },
            { num: "02", title: "Evaluates Quality", desc: "Checks blur, lighting, exposure, and cut-off margins before OCR.", icon: Eye },
            { num: "03", title: "Finds the Label", desc: "Identifies the exact physical region where ingredients are listed.", icon: Search },
            { num: "04", title: "Extracts Ingredients", desc: "Vision/OCR reads visible cosmetic names with confidence scores.", icon: ScanLine },
            { num: "05", title: "User Verifies", desc: "You review, edit, add, or remove tokens before any analysis begins.", icon: CheckCheck },
            { num: "06", title: "Matches Database", desc: "Harmonizes names against official INCI, CosIng, and IFRA standards.", icon: BookOpen },
            { num: "07", title: "Alcohol & Concerns", desc: "Detects volatile vs fatty alcohols and restricted fragrance allergens.", icon: Droplet },
            { num: "08", title: "Shows Evidence", desc: "Cites EU SCCS regulations and IFRA standards without guessing.", icon: Scale },
            { num: "09", title: "Suitability Profile", desc: "Highlights 6 user groups that may require additional consideration.", icon: Users },
            { num: "10", title: "Fragrance Persona", desc: "Optional Zodiac and scent family discovery for personal inspiration.", icon: Sparkles }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-card-bg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-2xs space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-3">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{item.num}</span>
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2 — WHAT DO YOU NEED?                                             */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-card-bg to-emerald-50/30 dark:from-slate-900/60 dark:via-card-bg dark:to-emerald-950/20 shadow-xs space-y-8">
          
          <div className="max-w-3xl space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
              Input Requirements
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
              All you need is the label.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              No laboratory equipment or barcode catalog lookup required. Simply provide a photo or live camera capture of the packaging.
            </p>
          </div>

          {/* 4 Accepted Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "1. Perfume Box", desc: "Side or rear panel of outer retail carton with INCI text." },
              { label: "2. Attar Packaging", desc: "Box, slipcase, or printed bottle reverse of traditional attar oils." },
              { label: "3. Physical Label", desc: "High-contrast sticker or print showing the cosmetic formula." },
              { label: "4. Camera Capture", desc: "Live snapshot taken directly using your phone or laptop camera." }
            ].map((inp, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-card-bg shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">{inp.label}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">{inp.desc}</p>
              </div>
            ))}
          </div>

          {/* Best Input Callout & Simple Formula */}
          <div className="p-6 rounded-2xl bg-card-bg border border-emerald-200 dark:border-emerald-900/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">
                  Recommended Best Input
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  &ldquo;A clear photo of the side or back of the package where the ingredient list is printed.&rdquo;
                </p>
              </div>
              
              {/* Formula Visual */}
              <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 font-bold self-start sm:self-center">
                <span>PERFUME / ATTAR</span>
                <span className="text-emerald-600">+</span>
                <span>CLEAR LABEL</span>
                <span className="text-emerald-600">=</span>
                <span className="text-emerald-700 dark:text-emerald-400">OLFEXA ANALYSIS</span>
              </div>
            </div>

            {/* Rejection / Guidance Assurance */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Guessing Guarantee:</strong> If the image isn&apos;t a fragrance product or the ingredient list cannot be verified, OLFEXA will ask you to provide a better image instead of guessing or fabricating results.
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3 — HOW OLFEXA WORKS                                              */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
            Step-by-Step Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
            From label to insight.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            A transparent 9-step pipeline that ensures ingredients are verified by you before any rules analyze them.
          </p>
        </div>

        {/* 9 Connected Steps Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "STEP 01",
              name: "SCAN",
              desc: "Upload or capture your perfume or attar label using your smartphone or desktop camera.",
              tag: "Intake Stage"
            },
            {
              step: "STEP 02",
              name: "VALIDATE",
              desc: "OLFEXA checks whether the image is a relevant fragrance product and whether the label is readable.",
              tag: "Quality Guardrail"
            },
            {
              step: "STEP 03",
              name: "FIND",
              desc: "OLFEXA identifies the exact ingredient-list region, filtering away front marketing graphics.",
              tag: "Region Crop"
            },
            {
              step: "STEP 04",
              name: "EXTRACT",
              desc: "Vision/OCR extracts the visible ingredient names and assigns confidence scores per token.",
              tag: "Optical Read"
            },
            {
              step: "STEP 05",
              name: "VERIFY",
              desc: "You review, edit, add, or remove ingredients before analysis. Uncertain characters are flagged for check.",
              tag: "Human-in-the-Loop"
            },
            {
              step: "STEP 06",
              name: "ANALYZE",
              desc: "Verified ingredients are matched against the OLFEXA knowledge base and analyzed using structured rules.",
              tag: "Rules Engine"
            },
            {
              step: "STEP 07",
              name: "EVIDENCE",
              desc: "OLFEXA shows supporting regulatory information and explains what could and could not be confirmed.",
              tag: "Regulatory Grounding"
            },
            {
              step: "STEP 08",
              name: "SUITABILITY",
              desc: "See which user groups may require additional consideration based on verified ingredients and available evidence.",
              tag: "Calibrated Profiles"
            },
            {
              step: "STEP 09",
              name: "UNDERSTAND",
              desc: "Receive a clear, structured fragrance report with transparency metrics and grounded AI assistance.",
              tag: "Dossier Delivery"
            }
          ].map((item, idx) => (
            <div
              key={item.step}
              className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-card-bg shadow-2xs space-y-3 relative group hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {item.step}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold font-editorial-heading text-slate-900 dark:text-slate-100">
                  {item.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1 text-[11px] font-mono text-slate-400 group-hover:text-emerald-600 transition-colors">
                <span>Phase {idx + 1} of 9</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Architecture Pipeline Banner */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-center font-mono text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">
          <div className="inline-flex items-center gap-2 font-semibold">
            <span>SCAN</span>
            <span className="text-slate-300 dark:text-slate-700">→</span>
            <span>VALIDATE</span>
            <span className="text-slate-300 dark:text-slate-700">→</span>
            <span>FIND</span>
            <span className="text-slate-300 dark:text-slate-700">→</span>
            <span>EXTRACT</span>
            <span className="text-slate-300 dark:text-slate-700">→</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold underline">VERIFY</span>
            <span className="text-slate-300 dark:text-slate-700">→</span>
            <span>ANALYZE</span>
            <span className="text-slate-300 dark:text-slate-700">→</span>
            <span>EVIDENCE</span>
            <span className="text-slate-300 dark:text-slate-700">→</span>
            <span>SUITABILITY</span>
            <span className="text-slate-300 dark:text-slate-700">→</span>
            <span>UNDERSTAND</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4 — WHAT DOES OLFEXA CHECK?                                       */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
            Analysis Pillars
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
            What can OLFEXA tell you?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Clear, structured evaluations across 6 analytical dimensions with zero guesswork.
          </p>
        </div>

        {/* 6 Clean Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Ingredient Detection",
              desc: "See the ingredients detected from your label.",
              detail: "Normalized against international cosmetic nomenclature (INCI), mapping common synonyms into canonical terms.",
              icon: FileSearch
            },
            {
              title: "Alcohol Status",
              desc: "Understand whether a recognized alcohol ingredient was detected.",
              detail: "Distinguishes drying volatile solvents (Ethanol, Alcohol Denat.) from hydrating fatty alcohols (Cetyl, Cetearyl Alcohol) and alcohol-free attars.",
              icon: Droplet
            },
            {
              title: "Potential Concerns",
              desc: "Identify recognized fragrance allergens, potential irritants, and ingredients requiring additional consideration.",
              detail: "Screened against EU Annex III mandatory disclosure lists and IFRA transparency guidelines.",
              icon: AlertTriangle
            },
            {
              title: "Unknown Ingredients",
              desc: "See which ingredients could not be matched to the current OLFEXA knowledge base.",
              detail: "Transparently isolated so you know what couldn't be verified instead of falsely assuming safety.",
              icon: HelpCircle
            },
            {
              title: "Evidence",
              desc: "Understand what information supports each finding.",
              detail: "Grounded in peer-reviewed scientific literature, EU Scientific Committee on Consumer Safety (SCCS), and CIR assessments.",
              icon: BookOpen
            },
            {
              title: "Transparency",
              desc: "See what was detected, what could not be confirmed, and what information is missing.",
              detail: "Clear transparency score rating label disclosure completeness and packaging provenance.",
              icon: ShieldCheck
            }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-card-bg shadow-2xs space-y-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {card.title}
                </h3>
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  {card.desc}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {card.detail}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5 — WHO MAY NEED ADDITIONAL CONSIDERATION?                         */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs space-y-8">
          
          <div className="max-w-3xl space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-sky-700 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-950/60 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-900">
              Evidence-Based Suitability Profile
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
              Not every fragrance needs the same consideration.
            </h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Based on verified ingredient information and available evidence, OLFEXA can highlight when certain user groups may require additional consideration.
            </p>
          </div>

          {/* 6 User Groups Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                group: "Children",
                icon: Baby,
                status: "Additional consideration",
                badgeColor: "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
                desc: "Higher skin permeability and respiratory sensitivity to volatile ethanol and intense fragrance oils."
              },
              {
                group: "Adults",
                icon: Users,
                status: "Low concern based on data",
                badgeColor: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                desc: "Standard adult cosmetic formulation thresholds within IFRA 51st Amendment safe dermal use limits."
              },
              {
                group: "Fragrance-Sensitive Users",
                icon: ShieldAlert,
                status: "Potential concern",
                badgeColor: "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
                desc: "Highlights natural terpenes (Limonene, Linalool, Oakmoss) susceptible to auto-oxidation into contact allergens."
              },
              {
                group: "Sensitive / Reactive Skin",
                icon: HeartHandshake,
                status: "Requires more information",
                badgeColor: "bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800",
                desc: "Assesses drying denatured alcohols and astringent carrier solvents that can disrupt the epidermal lipid barrier."
              },
              {
                group: "Pregnancy",
                icon: Heart,
                status: "Insufficient evidence",
                badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
                desc: "Identifies aromatic compounds with conservative regulatory guidance during gestational terms."
              },
              {
                group: "Breastfeeding",
                icon: UserCheck,
                status: "Unable to assess without dose",
                badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
                desc: "Guidance on avoiding direct topical application to the chest area where nursing infants may have contact."
              }
            ].map((grp, idx) => {
              const Icon = grp.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{grp.group}</span>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-block text-[10px] font-mono font-medium px-2.5 py-1 rounded-full border ${grp.badgeColor}`}>
                      {grp.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {grp.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Calibrated Non-Binary Status Explanation */}
          <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
            <span className="font-mono font-bold uppercase text-[10px] text-slate-500 block">
              Calibrated Non-Binary Statuses
            </span>
            <p className="text-slate-600 dark:text-slate-400">
              OLFEXA does <strong>NOT</strong> use a simplistic &ldquo;Safe / Unsafe&rdquo; binary. Real toxicology depends on concentration and personal history. Instead, we use neutral statuses:
            </p>
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-card-bg border border-slate-200 dark:border-slate-700">Additional consideration</span>
              <span className="px-2 py-0.5 rounded-md bg-card-bg border border-slate-200 dark:border-slate-700">Potential concern</span>
              <span className="px-2 py-0.5 rounded-md bg-card-bg border border-slate-200 dark:border-slate-700">Requires more information</span>
              <span className="px-2 py-0.5 rounded-md bg-card-bg border border-slate-200 dark:border-slate-700">Insufficient evidence</span>
              <span className="px-2 py-0.5 rounded-md bg-card-bg border border-slate-200 dark:border-slate-700">Unable to assess</span>
            </div>
          </div>

          {/* Explicit Medical Notice */}
          <div className="p-4 rounded-xl border border-sky-200/70 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/20 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <p>
              <strong>Scientific & Transparency Notice:</strong> OLFEXA does not provide medical advice or guarantee individual safety. Suitability insights are based on verified label information and available evidence.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6 — WHY VERIFICATION MATTERS                                      */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
            Trust & Integrity
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
            OLFEXA doesn&apos;t blindly trust OCR.
          </h2>
          <p className="text-base sm:text-lg text-emerald-800 dark:text-emerald-300 font-semibold">
            &ldquo;Vision detects. OCR extracts. You verify. The analysis engine decides.&rdquo;
          </p>
        </div>

        {/* Verification Simulator Demo Card */}
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                Interactive Checkpoint Simulator
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                How OLFEXA flags low-confidence or curved bottle typography for user review
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium">
              Review Before Analysis
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            When optical reading is uncertain due to glossy reflections, metallic lettering, or curved glass, OLFEXA flags the ingredient with a warning icon instead of silently fabricating or hallucinating a wrong name.
          </p>

          {/* Simulator Chips */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              Extracted Constituents Checkpoint:
            </span>
            <div className="flex flex-wrap gap-2.5 items-center">
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-mono font-medium text-emerald-800 dark:text-emerald-300">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>LIMONENE</span>
                <span className="text-[10px] text-emerald-600 font-normal">(98% confidence)</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-mono font-medium text-emerald-800 dark:text-emerald-300">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>GERANIOL</span>
                <span className="text-[10px] text-emerald-600 font-normal">(95% confidence)</span>
              </div>

              {/* Uncertain token that can be clicked to fix */}
              <button
                type="button"
                onClick={() => setCorrectedLinalool(!correctedLinalool)}
                title="Click to simulate user one-click verification"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all cursor-pointer ${
                  correctedLinalool
                    ? "border-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200"
                    : "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 hover:bg-amber-100/60"
                }`}
              >
                {correctedLinalool ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>LINALOOL</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-normal">✓ User Verified</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>Linaloo?</span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-normal underline">
                      (Click to verify as LINALOOL)
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Architecture Chain */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-500 flex flex-wrap items-center justify-center gap-2">
            <span>Vision</span>
            <span>→</span>
            <span>OCR</span>
            <span>→</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">User Verification</span>
            <span>→</span>
            <span>Knowledge Base</span>
            <span>→</span>
            <span>Rules</span>
            <span>→</span>
            <span>Evidence</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7 — FRAGRANCE PERSONA                                             */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-purple-700 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-900">
            Optional Discovery Feature
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
            Discover your fragrance persona.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Beyond label analysis, explore custom scent families, notes, and attar directions tailored to your astrological archetype.
          </p>
        </div>

        {/* Persona Flow Diagram */}
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 font-mono text-xs text-center text-slate-600 dark:text-slate-400 overflow-x-auto">
          <div className="inline-flex items-center gap-2 font-semibold">
            <span>Zodiac + Preferences</span>
            <span className="text-purple-500">→</span>
            <span>Fragrance Persona</span>
            <span className="text-purple-500">→</span>
            <span>Scent Families</span>
            <span className="text-purple-500">→</span>
            <span>Attar / Perfume Types</span>
            <span className="text-purple-500">→</span>
            <span>Recommendations</span>
          </div>
        </div>

        {/* Interactive Persona Card Preview */}
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl border border-purple-200/80 dark:border-purple-900/60 bg-gradient-to-br from-card-bg via-purple-50/20 to-card-bg dark:from-card-bg dark:via-purple-950/20 dark:to-card-bg shadow-sm space-y-6">
          
          {/* Sign Selector Tabs */}
          <div className="flex items-center justify-center gap-2">
            {(["leo", "libra", "pisces"] as const).map((signKey) => (
              <button
                key={signKey}
                type="button"
                onClick={() => setSelectedSign(signKey)}
                className={`px-4 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                  selectedSign === signKey
                    ? "bg-purple-700 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {PERSONA_PREVIEWS[signKey].sign} Archetype
              </button>
            ))}
          </div>

          {/* Active Persona Details */}
          {(() => {
            const cur = PERSONA_PREVIEWS[selectedSign];
            return (
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-purple-700 dark:text-purple-400 uppercase tracking-widest font-bold">
                      {cur.element} Element • {cur.dates}
                    </span>
                    <h3 className="text-xl font-bold font-editorial-heading text-slate-950 dark:text-white">
                      {cur.sign}-Inspired Profile
                    </h3>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 font-semibold self-start sm:self-auto">
                    {cur.vibe}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-card-bg space-y-1.5">
                    <span className="font-mono text-[10px] uppercase text-slate-400 font-bold block">
                      Suggested Key Notes:
                    </span>
                    <div className="flex flex-wrap gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                      {cur.notes.map((note) => (
                        <span key={note} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-card-bg space-y-1.5">
                    <span className="font-mono text-[10px] uppercase text-slate-400 font-bold block">
                      Attar & Perfume Direction:
                    </span>
                    <p className="font-mono text-[11px] text-purple-900 dark:text-purple-300 font-semibold">
                      {cur.attarType}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {cur.perfumeType}
                    </p>
                  </div>
                </div>

                <p className="text-xs italic text-slate-500 text-center font-mono">
                  &ldquo;{cur.quote}&rdquo;
                </p>
              </div>
            );
          })()}

          {/* Explicit Entertainment Disclaimer */}
          <div className="p-3.5 rounded-xl border border-purple-200/70 dark:border-purple-900/50 bg-purple-50/60 dark:bg-purple-950/30 text-xs text-purple-950 dark:text-purple-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <p>
              <strong>Entertainment Notice:</strong> Zodiac-based recommendations are for entertainment and fragrance discovery. They do not determine safety, suitability, or medical concerns.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8 — EXAMPLE RESULT                                                */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
            Report Dossier Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
            See what your result looks like.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            A realistic example of the structured fragrance dossier delivered after verification.
          </p>
        </div>

        {/* Realistic Result Dossier Mockup */}
        <div className="max-w-4xl mx-auto p-6 sm:p-10 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-card-bg shadow-md space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200/50">
                  Illustrative Example Report
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-mono text-slate-500">Verified Packaging Scan</span>
              </div>
              <h3 className="text-2xl font-bold font-editorial-heading text-slate-950 dark:text-white">
                L&apos;Ambre Sublime Eau de Parfum
              </h3>
              <p className="text-xs text-slate-500 font-mono">Declared House: Maison de L&apos;Arôme Paris</p>
            </div>

            <div className="self-start sm:self-auto text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Verified Ingredients</span>
              <span className="text-lg font-bold font-editorial-heading text-slate-900 dark:text-slate-100">
                8 Constituents
              </span>
            </div>
          </div>

          {/* Key Metric Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Alcohol Status</span>
              <span className="text-sm font-bold text-amber-800 dark:text-amber-300">Contains Recognized Alcohol</span>
              <p className="text-[11px] text-slate-500">Volatile Denatured Ethanol matrix</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Potential Concerns</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Potential Fragrance Allergen</span>
              <p className="text-[11px] text-slate-500">Limonene, Linalool, Coumarin</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Evidence Grounding</span>
              <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Supporting Info Available</span>
              <p className="text-[11px] text-slate-500">EU Annex III & IFRA 51st Amendment</p>
            </div>
          </div>

          {/* Verified Ingredients Pill List */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Verified Ingredients Found:
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <span className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-card-bg">ALCOHOL DENAT.</span>
              <span className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-card-bg">PARFUM / FRAGRANCE</span>
              <span className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-card-bg">AQUA / WATER / EAU</span>
              <span className="px-3 py-1 rounded-lg border border-amber-300 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300">LIMONENE (Allergen)</span>
              <span className="px-3 py-1 rounded-lg border border-amber-300 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300">LINALOOL (Allergen)</span>
              <span className="px-3 py-1 rounded-lg border border-amber-300 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300">COUMARIN (Allergen)</span>
              <span className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-card-bg">GERANIOL</span>
            </div>
          </div>

          {/* Suitability Snapshot */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20 space-y-2 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
              Suitability Profile Snapshot:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-card-bg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span>Children</span>
                <span className="text-amber-700 dark:text-amber-400 font-semibold">Additional consideration</span>
              </div>
              <div className="p-2 rounded-lg bg-card-bg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span>Fragrance-Sensitive</span>
                <span className="text-amber-700 dark:text-amber-400 font-semibold">Potential concern</span>
              </div>
              <div className="p-2 rounded-lg bg-card-bg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span>Pregnancy</span>
                <span className="text-slate-500 font-semibold">Insufficient evidence</span>
              </div>
            </div>
          </div>

          {/* Transparency Footer */}
          <div className="pt-2 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Based on the verified ingredient information visible on the provided label.</span>
            <span className="text-emerald-700 dark:text-emerald-400">Illustrative Example</span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 9 — WHAT OLFEXA DOES NOT DO                                       */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
            Clear Boundaries
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
            Built for informed decisions, not absolute verdicts.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            We believe consumer trust requires total honesty regarding capabilities, limitations, and scope.
          </p>
        </div>

        {/* Side-by-side DO NOT vs DOES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
          {/* DOES NOT CARD */}
          <div className="p-6 sm:p-8 rounded-3xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400 font-bold">
              <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                <X className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-editorial-heading">What OLFEXA Does NOT Do</h3>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Does NOT diagnose medical conditions:</strong> We do not provide clinical allergy testing or medical consultations.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Does NOT guarantee product safety:</strong> Individual sensitivities vary widely and cannot be guaranteed by an algorithm.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Does NOT declare binary safe/unsafe:</strong> Toxicology is dose-dependent; we never use simplistic black-and-white verdicts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Does NOT invent missing ingredients:</strong> If text is covered or missing, we never hallucinate what could be inside.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Does NOT guess unreadable text:</strong> Unclear characters trigger a user review checkpoint rather than silent guessing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Does NOT use zodiac for safety:</strong> Zodiac personas are strictly for entertainment and fragrance discovery.</span>
              </li>
            </ul>
          </div>

          {/* DOES CARD */}
          <div className="p-6 sm:p-8 rounded-3xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 font-bold">
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-editorial-heading">What OLFEXA DOES Do</h3>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Reads visible label information:</strong> Detects physical packaging typography with high-contrast preprocessors.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Enables user verification:</strong> Lets you edit, delete, or confirm every single ingredient token before evaluation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Matches knowledge base:</strong> Normalizes cosmetic names against official INCI, CosIng, and IFRA standards.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Identifies potential concerns:</strong> Highlights EU Annex III regulated allergens and alcohol solvent matrices.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Shows supporting evidence:</strong> Provides regulatory citations, SCCS opinions, and scientific documentation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Communicates uncertainty:</strong> Clearly flags unknown ingredients and label limitations so you stay fully informed.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 10 — WHY OLFEXA?                                                  */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
            The OLFEXA Advantage
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white tracking-tight">
            One label. More understanding.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Four guiding principles behind every fragrance intelligence dossier.
          </p>
        </div>

        {/* 4 Concise Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "VERIFIED",
              tagline: "Reviewed before analysis",
              desc: "Ingredients are confirmed by you through an interactive review step, eliminating OCR hallucination errors.",
              icon: UserCheck
            },
            {
              title: "EVIDENCE-BASED",
              tagline: "Grounded in research",
              desc: "Insights are referenced against peer-reviewed toxicology, IFRA standards, and EU cosmetic regulations.",
              icon: Scale
            },
            {
              title: "TRANSPARENT",
              tagline: "Honest about limits",
              desc: "See what was detected, what remains uncertain, and what ingredients could not be matched.",
              icon: Eye
            },
            {
              title: "PERSONALIZED",
              tagline: "Tailored discovery",
              desc: "Explore bespoke fragrance preferences and your optional Zodiac Fragrance Persona for curated inspiration.",
              icon: Sparkles
            }
          ].map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-card-bg shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold font-mono tracking-wider text-slate-950 dark:text-white">
                    {pillar.title}
                  </h3>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block">
                    {pillar.tagline}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL CTA SECTION                                                         */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-8 sm:p-14 rounded-3xl border border-emerald-200/90 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/80 via-card-bg to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-card-bg text-center space-y-6 shadow-sm">
          
          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white">
              Ready to decode your fragrance?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Scan your perfume or attar label and discover what&apos;s inside.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href={scanLink}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Your Fragrance</span>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-bg text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-xs"
            >
              <span>Explore How It Works</span>
            </a>
          </div>

          <div className="pt-4 max-w-2xl mx-auto">
            <DisclaimerBanner variant="subtle" />
          </div>

        </div>
      </section>

    </div>
  );
}
