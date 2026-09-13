"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Camera, 
  Search, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Droplet,
  BookOpen,
  Microscope,
  Check,
  Building2,
  Calendar,
  Globe,
  Barcode,
  PackageCheck,
  Bot,
  Zap,
  Info
} from "lucide-react";
import { DisclaimerBanner } from "@/components/brand/DisclaimerBanner";
import { findIngredientByInci } from "@/data/mockIngredients";
import { OLFEXA_DATASET } from "@/data/olfexaDataset";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [instantSearch, setInstantSearch] = useState("");
  const [activeTabPreset, setActiveTabPreset] = useState<"edp" | "nonalc" | "oakmoss">("edp");
  const [activeHotspot, setActiveHotspot] = useState<string | null>("alcohol");

  const searchResult = instantSearch.trim() ? findIngredientByInci(instantSearch) : null;

  const PRESET_FORMULATIONS = {
    edp: {
      name: "L'Ambre Sublime Eau de Parfum",
      brand: "Maison de L'Arôme Paris",
      type: "Eau de Parfum",
      alcoholStatus: "CONTAINS_ALCOHOL",
      alcoholBadge: "Contains Alcohol",
      alcoholType: "Volatile Denatured Ethanol",
      alcoholExplanation: "Alcohol Denat. (SD Alcohol) detected as primary volatile solvent and dispersion carrier.",
      mfgDate: "2024-04-12",
      batchCode: "B24M09",
      origin: "Made in France",
      ingredients: [
        { name: "ALCOHOL DENAT.", isAllergen: false, isAlcohol: true, note: "Volatile drying solvent & scent carrier" },
        { name: "AQUA / WATER / EAU", isAllergen: false, isAlcohol: false, note: "Purified cosmetic vehicle" },
        { name: "PARFUM / FRAGRANCE", isAllergen: false, isAlcohol: false, note: "Proprietary aromatic scent composition" },
        { name: "LIMONENE", isAllergen: true, isAlcohol: false, note: "Citrus monoterpene (EU Annex III Allergen)" },
        { name: "LINALOOL", isAllergen: true, isAlcohol: false, note: "Floral terpene constituent (EU Annex III)" },
        { name: "COUMARIN", isAllergen: true, isAlcohol: false, note: "Sweet tonka aroma (IFRA concentration limits)" },
      ],
      allergenCount: 3,
      transparency: "MODERATE"
    },
    nonalc: {
      name: "Pure Botanica Hydrating Scent Mist",
      brand: "Élixir Botanique",
      type: "Alcohol-Free Fine Scent Mist",
      alcoholStatus: "NO_RECOGNIZED_ALCOHOL_DETECTED",
      alcoholBadge: "No Alcohol Detected",
      alcoholType: "Aqueous Base (Water + Glycerin)",
      alcoholExplanation: "No recognized volatile alcohol ingredient detected in the provided ingredient list.",
      mfgDate: "2024-01-20",
      batchCode: "AF-902",
      origin: "France",
      ingredients: [
        { name: "AQUA / WATER / EAU", isAllergen: false, isAlcohol: false, note: "Purified water carrier" },
        { name: "GLYCERIN", isAllergen: false, isAlcohol: false, note: "Skin hydrator & moisture binder" },
        { name: "CETYL ALCOHOL", isAllergen: false, isAlcohol: true, note: "Fatty alcohol (Emollient wax; non-drying)" },
        { name: "CITRONELLOL", isAllergen: true, isAlcohol: false, note: "Fresh rose aroma (EU Annex III)" },
        { name: "GERANIOL", isAllergen: true, isAlcohol: false, note: "Sweet floral constituent (EU Annex III)" },
      ],
      allergenCount: 2,
      transparency: "HIGH"
    },
    oakmoss: {
      name: "Fougère Royale No. 12",
      brand: "Atelier Herbier",
      type: "Extrait de Parfum",
      alcoholStatus: "CONTAINS_ALCOHOL",
      alcoholBadge: "Contains Alcohol",
      alcoholType: "Agricultural Ethanol",
      alcoholExplanation: "Ethanol solvent matrix detected alongside restricted Evernia prunastri oakmoss extract.",
      mfgDate: "2023-11-05",
      batchCode: "FRN-1204",
      origin: "France",
      ingredients: [
        { name: "ETHANOL", isAllergen: false, isAlcohol: true, note: "High-proof agricultural ethyl alcohol" },
        { name: "PARFUM / FRAGRANCE", isAllergen: false, isAlcohol: false, note: "Concentrated perfume oil extract" },
        { name: "OAK MOSS EXTRACT", isAllergen: true, isAlcohol: false, note: "Restricted lichen extract (IFRA 51st / EU 2017/1410)" },
        { name: "FARNESOL", isAllergen: true, isAlcohol: false, note: "Natural acyclic sesquiterpenoid (EU Annex III)" },
        { name: "EUGENOL", isAllergen: true, isAlcohol: false, note: "Clove and spice aroma molecule (EU Annex III)" },
      ],
      allergenCount: 3,
      transparency: "HIGH"
    }
  };

  const currentPreset = PRESET_FORMULATIONS[activeTabPreset];

  const POPULAR_LOOKUPS = [
    "Alcohol Denat.",
    "Coumarin",
    "Cetyl Alcohol",
    "Oakmoss",
    "Limonene",
    "BHT",
    "Linalool"
  ];

  const handleLaunchSampleScan = (presetKey: "edp" | "nonalc" | "oakmoss") => {
    if (typeof window !== "undefined") {
      const p = PRESET_FORMULATIONS[presetKey];
      sessionStorage.setItem("olfexa_review_perfume", p.name);
      sessionStorage.setItem("olfexa_review_brand", p.brand);
      sessionStorage.setItem(
        "olfexa_review_ingredients",
        JSON.stringify(p.ingredients.map((i) => i.name))
      );
      sessionStorage.setItem(
        "olfexa_review_provenance",
        JSON.stringify({
          isPerfume: true,
          fragranceType: p.type,
          confidence: 0.95,
          detectionReason: `Verified ${p.type} packaging label with declared INCI ingredients.`,
          imageQuality: {
            rating: "HIGH",
            clarityScore: 95,
            dimensions: { width: 1440, height: 1080, format: "png" },
            warnings: [],
            isBlurry: false,
            hasSufficientResolution: true,
            recommendation: "Image clarity is optimal for reliable INCI ingredient recognition."
          },
          relevance: {
            isRelevant: true,
            status: "VERIFIED_FRAGRANCE_LABEL",
            classificationName: "Verified Fragrance Product / Ingredient Label",
            rationale: `Verified ${p.type} packaging label with declared cosmetic INCI standards.`
          },
          manufacturingInfo: {
            dateOfManufacture: p.mfgDate,
            batchCode: p.batchCode,
            periodAfterOpening: "36M"
          },
          companyDetails: {
            brandName: p.brand,
            manufacturer: `${p.brand} Laboratories`
          },
          companyAddress: {
            countryOfOrigin: p.origin,
            fullAddress: "33 Avenue Hoche, 75008 Paris, France"
          }
        })
      );
    }
    router.push("/scan/review");
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen">
      {/* 1. Master Asymmetric Split Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Brand Story & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>OLFEXA • VALIDATED FRAGRANCE SCANNING SYSTEM</span>
            </div>

            {/* Editorial Serif Heading */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-slate-950 dark:text-white font-editorial-heading leading-[1.05]">
              Understand <br />
              <span className="italic font-normal text-slate-700 dark:text-slate-300">what you wear.</span>
            </h1>

            {/* Subtitle with Authoritative Specification */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl font-normal leading-relaxed">
              A validated fragrance scanning system that verifies whether an uploaded image is a relevant fragrance product or ingredient label, assesses image quality, and uses Vision/OCR to accurately extract visible ingredient names. Extracted ingredients are presented for verification before our analysis engine normalizes and matches them against the OLFEXA knowledge base.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href={user ? "/scan" : "/login?redirect=/scan"}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold tracking-wide shadow-md transition-all group"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Fragrance Label</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/results/demo"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-card-bg hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium transition-all shadow-xs"
              >
                <span>View Sample Dossier</span>
              </Link>
            </div>

            {/* Micro Metrics Strip */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-200/70 dark:border-slate-800/80">
              <div>
                <span className="text-2xl font-bold font-editorial-heading text-slate-950 dark:text-white block">
                  34+
                </span>
                <span className="text-[11px] font-mono text-slate-500 uppercase block">
                  Verified INCIs
                </span>
              </div>
              <div>
                <span className="text-2xl font-bold font-editorial-heading text-emerald-700 dark:text-emerald-400 block">
                  3-State
                </span>
                <span className="text-[11px] font-mono text-slate-500 uppercase block">
                  Alcohol Logic
                </span>
              </div>
              <div>
                <span className="text-2xl font-bold font-editorial-heading text-slate-950 dark:text-white block">
                  26
                </span>
                <span className="text-[11px] font-mono text-slate-500 uppercase block">
                  EU Allergens
                </span>
              </div>
              <div>
                <span className="text-2xl font-bold font-editorial-heading text-slate-950 dark:text-white block">
                  100%
                </span>
                <span className="text-[11px] font-mono text-slate-500 uppercase block">
                  Non-Medical
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Vision Scanner Preview Widget */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-card-bg shadow-xl p-6 sm:p-7 overflow-hidden text-left">
              {/* Simulated Scanning Laser Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse" />

              {/* Header inside Preview */}
              <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500">
                    Live Vision Scanner Preview
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                  OCR Active
                </span>
              </div>

              {/* Simulated Packaging Label with Hotspots */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900 dark:text-white">MAISON DE L&apos;ARÔME PARIS</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px]">
                    Eau de Parfum 100ml
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  INGREDIENTS:{" "}
                  <button
                    onClick={() => setActiveHotspot("alcohol")}
                    className={`px-1 py-0.5 rounded font-bold transition-all ${
                      activeHotspot === "alcohol"
                        ? "bg-amber-400 text-slate-950 ring-2 ring-amber-500"
                        : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 hover:bg-amber-200"
                    }`}
                  >
                    ALCOHOL DENAT.
                  </button>
                  , AQUA (WATER), PARFUM (FRAGRANCE),{" "}
                  <button
                    onClick={() => setActiveHotspot("allergen")}
                    className={`px-1 py-0.5 rounded font-bold transition-all ${
                      activeHotspot === "allergen"
                        ? "bg-amber-400 text-slate-950 ring-2 ring-amber-500"
                        : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 hover:bg-amber-200"
                    }`}
                  >
                    COUMARIN
                  </button>
                  , LIMONENE, LINALOOL, BHT.
                </p>

                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                  <button
                    onClick={() => setActiveHotspot("mfg")}
                    className={`px-1 rounded ${activeHotspot === "mfg" ? "bg-emerald-200 text-emerald-900 font-bold" : "hover:text-slate-900"}`}
                  >
                    MFG: 2024-04-12
                  </button>
                  <button
                    onClick={() => setActiveHotspot("batch")}
                    className={`px-1 rounded ${activeHotspot === "batch" ? "bg-emerald-200 text-emerald-900 font-bold" : "hover:text-slate-900"}`}
                  >
                    LOT: B24M09
                  </button>
                  <button
                    onClick={() => setActiveHotspot("origin")}
                    className={`px-1 rounded ${activeHotspot === "origin" ? "bg-emerald-200 text-emerald-900 font-bold" : "hover:text-slate-900"}`}
                  >
                    MADE IN FRANCE
                  </button>
                </div>
              </div>

              {/* Dynamic Decoded Insight Box */}
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-[11px] font-mono uppercase font-bold text-emerald-900 dark:text-emerald-200">
                    {activeHotspot === "alcohol" && "Detected Alcohol: Volatile Solvent"}
                    {activeHotspot === "allergen" && "Detected EU Annex III Allergen"}
                    {activeHotspot === "mfg" && "Date of Manufacture (DOM)"}
                    {activeHotspot === "batch" && "Production Batch Code"}
                    {activeHotspot === "origin" && "Packaging Origin & Address"}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeHotspot === "alcohol" &&
                    "Alcohol Denat. is ethanol denatured with bitrex or t-butyl alcohol. Acts as a volatile carrier that evaporates rapidly. Never confused with non-drying fatty alcohols."}
                  {activeHotspot === "allergen" &&
                    "Coumarin imparts a sweet vanilla/tonka note. Disclosed pursuant to EU Cosmetics Regulation 1223/2009 for individuals with contact sensitivity history."}
                  {activeHotspot === "mfg" &&
                    "Manufactured April 12, 2024. Cosmetic shelf life typically 36 months post-opening (36M PAO)."}
                  {activeHotspot === "batch" &&
                    "Batch B24M09 extracted directly from label print. Traceable to Arôme Parfums S.A.S. laboratory."}
                  {activeHotspot === "origin" &&
                    "Corporate address detected: 33 Avenue Hoche, 75008 Paris, France. Country of origin: Made in France."}
                </p>
              </div>

              {/* Bottom Quick Test Link */}
              <div className="mt-4 flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500 font-mono">
                  Click tags above to inspect
                </span>
                <button
                  type="button"
                  onClick={() => handleLaunchSampleScan("edp")}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-400 font-bold hover:underline"
                >
                  <span>Test this label in Scanner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Comparative Showcase: Confusing Raw Label vs OLFEXA Dossier */}
      <section className="w-full bg-slate-50/60 dark:bg-slate-900/30 border-y border-slate-200/80 dark:border-slate-800/80 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
              The Difference
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white">
              From Crammed Chemical Jargon to Clear Consumer Intelligence
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Fragrance boxes are packed with chemical codes, tiny text, and hidden allergen disclosures. OLFEXA turns raw packaging into structured clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Raw Label Box */}
            <div className="p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
                    01 • Raw Packaging Back Label
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Hard to read
                  </span>
                </div>
                <p className="font-mono text-xs text-slate-500 leading-loose uppercase tracking-wider bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                  INGREDIENTS: ALCOHOL DENAT., AQUA (WATER), PARFUM (FRAGRANCE), ETHYLHEXYL METHOXYCINNAMATE, BUTYL METHOXYDIBENZOYLMETHANE, LIMONENE, LINALOOL, COUMARIN, CITRONELLOL, GERANIOL, CITRAL, BHT, CI 19140, CI 14700. MFG 03/24 LOT B24M09 36M DIST BY LUXURY CORP PARIS MADE IN FRANCE.
                </p>
              </div>

              <div className="mt-6 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 font-bold">✕</span>
                  <span>Ambiguous whether alcohol is drying ethanol or nourishing emollient</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 font-bold">✕</span>
                  <span>Allergens buried among carrier solvents and colorants</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 font-bold">✕</span>
                  <span>Manufacturing date and batch codes unparsed</span>
                </div>
              </div>
            </div>

            {/* OLFEXA Intelligence Dossier Box */}
            <div className="p-7 rounded-3xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-b from-emerald-50/40 to-transparent dark:from-emerald-950/20 bg-card-bg shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-xs font-mono uppercase text-emerald-800 dark:text-emerald-300 font-bold">
                    02 • OLFEXA Decoded Dossier
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-semibold">
                    Instant Clarity
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Alcohol Classification</span>
                      <span className="font-bold text-xs text-amber-700 dark:text-amber-400 font-mono">
                        Contains Alcohol (Volatile Denatured Ethanol)
                      </span>
                    </div>
                    <span className="text-xs font-mono px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200">
                      78% Carrier
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Declared EU Annex III Allergens</span>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 font-mono">
                        Limonene, Linalool, Coumarin, Citronellol, Geraniol
                      </span>
                    </div>
                    <span className="text-xs font-mono px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold">
                      5 Flagged
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Packaging Provenance</span>
                      <span className="font-mono text-xs text-slate-800 dark:text-slate-200">
                        DOM: 2024-03 • Batch: B24M09 • Made in France
                      </span>
                    </div>
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-2 border-t border-emerald-100 dark:border-emerald-900/40">
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-mono">
                  Grounded in IFRA 51st &amp; EU CosIng
                </span>
                <Link
                  href="/results/demo"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 font-bold hover:underline"
                >
                  <span>Explore Full Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Formulation Explorer */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
            Live Intelligence Engine
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white">
            Explore 3 Real-World Fragrance Formulations
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Compare traditional volatile alcohol perfumes against gentle water-based body mists and classical oakmoss chypres.
          </p>

          {/* Tab Selector */}
          <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => setActiveTabPreset("edp")}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition-all ${
                activeTabPreset === "edp"
                  ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Classic Eau de Parfum
            </button>
            <button
              onClick={() => setActiveTabPreset("nonalc")}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition-all ${
                activeTabPreset === "nonalc"
                  ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Alcohol-Free Hydrating Mist
            </button>
            <button
              onClick={() => setActiveTabPreset("oakmoss")}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition-all ${
                activeTabPreset === "oakmoss"
                  ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Oakmoss Chypre (Extrait)
            </button>
          </div>
        </div>

        {/* Live Formulation Card */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-card-bg p-6 sm:p-8 shadow-card text-left space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
                {currentPreset.type}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-editorial-heading text-slate-950 dark:text-white">
                {currentPreset.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{currentPreset.brand}</p>
            </div>

            <button
              type="button"
              onClick={() => handleLaunchSampleScan(activeTabPreset)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-xs font-semibold transition-all self-start sm:self-auto"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Load in Scanner</span>
            </button>
          </div>

          {/* Metric Triplets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Alcohol Status</span>
              <span className={`text-sm font-bold font-mono ${
                activeTabPreset === "nonalc" ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
              }`}>
                {currentPreset.alcoholBadge}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">{currentPreset.alcoholType}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">EU Annex III Allergens</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                {currentPreset.allergenCount} Disclosed Molecules
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">Cross-referenced against CosIng</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Packaging Provenance</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                {currentPreset.origin}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">DOM: {currentPreset.mfgDate} • Lot: {currentPreset.batchCode}</span>
            </div>
          </div>

          {/* Constituents Grid */}
          <div>
            <span className="text-xs font-mono uppercase text-slate-400 block mb-3">
              Declared Formulation Constituents:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {currentPreset.ingredients.map((ing) => (
                <div
                  key={ing.name}
                  className={`p-3 rounded-2xl border text-xs flex flex-col justify-between gap-1.5 ${
                    ing.isAllergen
                      ? "border-amber-200/90 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200"
                      : ing.isAlcohol
                      ? "border-emerald-200/90 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200"
                      : "border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs">{ing.name}</span>
                    {ing.isAllergen && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 uppercase">
                        Allergen
                      </span>
                    )}
                    {ing.isAlcohol && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 uppercase">
                        Carrier
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{ing.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Instant INCI Quick-Check Search */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold uppercase">
            <Search className="w-3.5 h-3.5" />
            <span>Instant INCI Dictionary</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-editorial-heading text-slate-950 dark:text-white max-w-xl mx-auto">
            Look up any fragrance chemical instantly.
          </h2>

          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={instantSearch}
                onChange={(e) => setInstantSearch(e.target.value)}
                placeholder="Search any ingredient (e.g. Coumarin, Alcohol Denat., Oakmoss, Geraniol)..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-xs text-foreground placeholder:text-slate-400"
              />
            </div>

            {/* Quick Click Badges */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs">
              <span className="text-[11px] text-slate-400 font-mono mr-1">Popular:</span>
              {POPULAR_LOOKUPS.map((token) => (
                <button
                  key={token}
                  onClick={() => setInstantSearch(token)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-mono hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                >
                  {token}
                </button>
              ))}
            </div>

            {/* Search Result Card */}
            {searchResult && (
              <div className="mt-4 p-5 rounded-2xl border border-emerald-500/40 bg-card-bg shadow-lg text-left animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                    {searchResult.inciName}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {searchResult.category.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                  {searchResult.description}
                </p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-mono text-[11px]">
                    {searchResult.isEuAllergen ? "⚠️ Declared EU Annex III Allergen" : "✓ Cosmetic constituent"}
                  </span>
                  <Link
                    href="/ingredients"
                    className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold text-xs inline-flex items-center gap-1"
                  >
                    <span>Explorer Directory</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. 4-Stage Scientific Pipeline */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
            The Workflow
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white">
            From Label Photo to Evidence Dossier
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            A rigorous 4-step consumer decision-support pipeline built for scientific transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "01 • Capture",
              title: "Photograph Label",
              desc: "Upload or capture a photo of the ingredient list, batch codes, and regulatory notices on your perfume box or bottle.",
              icon: Camera
            },
            {
              step: "02 • Extract & Verify",
              title: "Vision OCR & Review",
              desc: "Verifies whether the packaging is genuine perfume, extracting ingredients, date of manufacture (DOM), brand house, and address separately.",
              icon: PackageCheck
            },
            {
              step: "03 • Cross-Check",
              title: "Scientific Databases",
              desc: "Normalized INCI terms are cross-referenced against IFRA standards, EU Annex III allergens, CosIng database, and CIR dossiers.",
              icon: Microscope
            },
            {
              step: "04 • Intelligence",
              title: "Evidence Dossier",
              desc: "Receive calibrated alcohol status ratings, allergen counts, packaging provenance, formula fingerprints, and grounded AI explanations.",
              icon: Sparkles
            }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg card-premium relative flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest block mb-2">
                    {item.step}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Scientific Frameworks & Regulatory Citations */}
      <section className="w-full bg-slate-50/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
              Regulatory Citations
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white">
              Grounded in Verified Scientific Frameworks
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              OLFEXA never fabricates safety data. Classifications strictly reflect official regulatory frameworks and peer-reviewed literature.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-card-bg border border-slate-200 dark:border-slate-800 card-premium">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                IFRA 51st Amendment
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                International Fragrance Association standards establishing quantitative concentration limits based on dermatological safety.
              </p>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                Verified Global Benchmark →
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-card-bg border border-slate-200 dark:border-slate-800 card-premium">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                EU Regulation (EC) 1223/2009
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                European Commission cosmetic guidelines mandating explicit disclosure of recognized fragrance allergens on consumer packaging.
              </p>
              <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-medium">
                CosIng Annex III Registry →
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-card-bg border border-slate-200 dark:border-slate-800 card-premium">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 flex items-center justify-center mb-4">
                <Microscope className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                U.S. FDA Cosmetic Guidance
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Official FDA guidelines defining &quot;Alcohol Free&quot; cosmetic labeling standards and contact allergen disclosure principles.
              </p>
              <span className="text-[10px] font-mono text-sky-700 dark:text-sky-400 font-medium">
                FDA Regulatory Principles →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA & Non-Medical Trust Statement */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-10">
        <div className="p-8 sm:p-12 rounded-3xl border border-emerald-200/80 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/70 via-card-bg to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-card-bg text-center space-y-5 shadow-sm">
          <h2 className="text-2xl sm:text-4xl font-bold font-editorial-heading text-slate-950 dark:text-white">
            Ready to decode your fragrance wardrobe?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            Upload a photo of your perfume box or bottle to unlock an evidence-backed intelligence dossier in seconds.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href={user ? "/scan" : "/login?redirect=/scan"}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold shadow-md transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Launch Fragrance Scanner</span>
            </Link>
          </div>
        </div>

        <DisclaimerBanner variant="prominent" />
      </section>
    </div>
  );
}
