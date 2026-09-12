import React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-4 md:col-span-1">
            <Logo showTagline={true} size="md" />
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mt-3">
              Evidence-based fragrance ingredient intelligence. Converting complex cosmetic disclosures into transparent, peer-reviewed information.
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 block mb-3">
              Features
            </span>
            <ul className="space-y-2 text-xs">
              <li><Link href="/login?redirect=/scan" className="hover:text-slate-900 dark:hover:text-white transition-colors">Fragrance Scanner</Link></li>
              <li><Link href="/results/demo" className="hover:text-slate-900 dark:hover:text-white transition-colors">Sample Analysis</Link></li>
              <li><Link href="/compare" className="hover:text-slate-900 dark:hover:text-white transition-colors">Compare Formulations</Link></li>
              <li><Link href="/ingredients" className="hover:text-slate-900 dark:hover:text-white transition-colors">Ingredient Directory</Link></li>
              <li><Link href="/watchlist" className="hover:text-slate-900 dark:hover:text-white transition-colors">Sensitivities Watchlist</Link></li>
            </ul>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 block mb-3">
              Methodology & Sources
            </span>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-500">IFRA Standards (51st Amendment)</span></li>
              <li><span className="text-slate-500">EU Cosmetics Reg. (EC) No 1223/2009</span></li>
              <li><span className="text-slate-500">EU SCCS Fragrance Opinions</span></li>
              <li><span className="text-slate-500">Cosmetic Ingredient Review (CIR)</span></li>
              <li><span className="text-slate-500">Structured Alcohol Rules Engine</span></li>
            </ul>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 block mb-3">
              Regulatory Stance
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              OLFEXA is a consumer decision-support and ingredient intelligence tool. It does not provide medical diagnoses, treatment plans, or absolute safety guarantees.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} OLFEXA Technologies. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-slate-600 transition-colors cursor-pointer">Methodology</span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
