"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Baby, 
  UserCheck, 
  Sparkles, 
  HeartHandshake,
  Activity,
  BookOpen,
  ExternalLink
} from "lucide-react";
import { 
  SuitabilityProfile, 
  SuitabilityUserGroup, 
  SuitabilityStatus, 
  UserGroupSuitability 
} from "@/types";
import { cn } from "@/lib/utils";

interface SuitabilityProfileCardProps {
  profile?: SuitabilityProfile;
  className?: string;
}

const GROUP_ICONS: Record<SuitabilityUserGroup, React.ComponentType<{ className?: string }>> = {
  adults: UserCheck,
  children: Baby,
  fragranceSensitiveUsers: Sparkles,
  sensitiveSkin: Activity,
  pregnancy: HeartHandshake,
  breastfeeding: HeartHandshake,
};

export const SuitabilityProfileCard: React.FC<SuitabilityProfileCardProps> = ({
  profile,
  className,
}) => {
  const [expandedGroup, setExpandedGroup] = useState<SuitabilityUserGroup | null>(null);

  if (!profile || !profile.groups) {
    return null;
  }

  const toggleGroup = (group: SuitabilityUserGroup) => {
    setExpandedGroup((prev) => (prev === group ? null : group));
  };

  const getStatusBadge = (status: SuitabilityStatus) => {
    switch (status) {
      case "LOW_CONCERN_BASED_ON_AVAILABLE_DATA":
        return {
          label: "Low Concern (Available Data)",
          badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
          icon: ShieldCheck,
        };
      case "ADDITIONAL_CAUTION":
        return {
          label: "Additional Caution Advised",
          badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
          icon: AlertTriangle,
        };
      case "REQUIRES_MORE_INFORMATION":
      case "NOT_ENOUGH_INFORMATION_TO_ASSESS":
        return {
          label: "Requires More Information",
          badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
          icon: HelpCircle,
        };
      case "INSUFFICIENT_EVIDENCE":
        return {
          label: "Insufficient Evidence",
          badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800/60",
          icon: Info,
        };
      case "REQUIRES_REVIEW":
      default:
        return {
          label: "Requires Verification",
          badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
          icon: AlertTriangle,
        };
    }
  };

  const groupKeys = Object.keys(profile.groups) as SuitabilityUserGroup[];

  return (
    <div className={cn("p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card-bg shadow-xs space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <BookOpen className="w-4 h-4" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest">
            Evidence-Based Assessment
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-editorial-heading text-slate-900 dark:text-slate-100">
          Who may need additional consideration?
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          {profile.overallTransparencyNote || (profile as any).overallContext}
        </p>
      </div>

      {/* Grid of 6 User Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groupKeys.map((key) => {
          const groupData: UserGroupSuitability = profile.groups[key];
          const isExpanded = expandedGroup === key;
          const statusConfig = getStatusBadge(groupData.status);
          const StatusIcon = statusConfig.icon;
          const GroupIcon = GROUP_ICONS[key] || Activity;

          const groupTitle = groupData.displayName || (groupData as any).title || key;
          const groupExplanation = groupData.explanation || (groupData as any).summary || "";
          const ingredientsList = groupData.contributingIngredients || (groupData as any).relevantIngredients || [];
          const evidenceList = groupData.evidence || [];

          return (
            <div
              key={key}
              className={cn(
                "rounded-2xl border transition-all overflow-hidden",
                groupData.status === "ADDITIONAL_CAUTION"
                  ? "border-amber-200/90 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10"
                  : "border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30"
              )}
            >
              {/* Collapsed Header Bar */}
              <button
                type="button"
                onClick={() => toggleGroup(key)}
                className="w-full p-4 flex items-start justify-between gap-3 text-left hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5">
                    <GroupIcon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 font-mono">
                        {groupTitle}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold",
                          statusConfig.badgeClass
                        )}
                      >
                        <StatusIcon className="w-3 h-3 shrink-0" />
                        <span>{statusConfig.label}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                      {groupExplanation}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 shrink-0 mt-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expandable Details Drawer */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-slate-200/70 dark:border-slate-800/70 space-y-3.5 text-xs">
                  {/* Relevant Ingredients */}
                  {ingredientsList.length > 0 && (
                    <div className="space-y-1 pt-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                        Relevant Declared Ingredients ({ingredientsList.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ingredientsList.map((ing: string, i: number) => (
                          <span
                            key={i}
                            className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scientific Evidence Sources */}
                  {evidenceList.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                        Scientific &amp; Regulatory Citations
                      </span>
                      <div className="space-y-2">
                        {evidenceList.map((ev, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                                {ev.title}
                              </span>
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold shrink-0">
                                {ev.organization} ({ev.publicationYear})
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                              {ev.keyFindings}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Limitations */}
                  {groupData.limitations && (
                    <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 text-[10px] font-mono text-slate-500 space-y-0.5">
                      <span className="font-semibold text-slate-600 dark:text-slate-400 block">Assessment Boundary:</span>
                      <p>• {groupData.limitations}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Label-Based Non-Medical Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 space-y-1 leading-relaxed">
        <span className="font-semibold text-slate-700 dark:text-slate-300 block">
          Transparency &amp; Scientific Scope
        </span>
        <p>
          {(profile as any).labelDisclaimer || "Based strictly on verified declared ingredient text and current cosmetic scientific literature (EU SCCS, IFRA standards, CIR). OLFEXA provides non-diagnostic scientific transparency, not individualized medical advice."}
        </p>
      </div>
    </div>
  );
};
