"use client";

import React from "react";
import { X, ExternalLink, BookOpen, ShieldCheck } from "lucide-react";
import { EvidenceSource } from "@/types";
import { cn } from "@/lib/utils";

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ingredientName: string;
  evidence: EvidenceSource[];
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  ingredientName,
  evidence,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-background h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Evidence Dossier
              </span>
              <h2 className="text-lg font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">
                {ingredientName}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-semibold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Scientific Provenance Standard
            </div>
            OLFEXA indexes peer-reviewed monographs, international standards (IFRA), and government health opinions (EU SCCS, CIR). Evidence is directly linked to published citations.
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Published References ({evidence.length})
            </h3>

            {evidence.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No indexed scientific monographs currently linked to this specific nomenclature token.
              </div>
            ) : (
              evidence.map((source) => {
                const isInsufficient = source.evidenceStatus === "INSUFFICIENT_EVIDENCE";

                return (
                  <div
                    key={source.id}
                    className={cn(
                      "p-4 rounded-xl border bg-card-bg space-y-2 transition-colors",
                      isInsufficient
                        ? "border-amber-200 dark:border-amber-900/60 bg-amber-50/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={cn(
                          "text-[10px] font-mono px-2 py-0.5 rounded font-medium uppercase tracking-wider",
                          isInsufficient
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                            : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                        )}>
                          {source.organization}
                        </span>

                        {source.region && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold">
                            {source.region}
                          </span>
                        )}

                        {isInsufficient && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold uppercase tracking-wider">
                            INSUFFICIENT EVIDENCE
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-mono text-slate-400">
                        {source.effectiveDate ? `Eff: ${source.effectiveDate}` : (source.publicationYear ? `Pub: ${source.publicationYear}` : "")}
                      </div>
                    </div>

                    {source.datasetOrRegulation && (
                      <div className="text-[11px] font-mono text-slate-500 font-medium">
                        Standard: {source.datasetOrRegulation}
                      </div>
                    )}

                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {source.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                      {source.keyFindings}
                    </p>

                    {source.citationUrl && (
                      <div className="pt-2">
                        <a
                          href={source.citationUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
                        >
                          <span>View Official Publication</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center text-[11px] text-slate-400">
          Peer-reviewed regulatory data. Not a substitute for diagnostic allergy testing.
        </div>
      </div>
    </div>
  );
};
