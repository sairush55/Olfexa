import React from "react";
import { ShieldAlert, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisclaimerBannerProps {
  className?: string;
  variant?: "subtle" | "prominent";
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  className,
  variant = "subtle",
}) => {
  if (variant === "prominent") {
    return (
      <aside
        aria-label="Scientific Decision-Support Statement"
        className={cn(
          "rounded-xl border border-amber-200/80 bg-amber-50/70 p-4 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200 text-xs sm:text-sm leading-relaxed",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5 tracking-tight">
              Informational & Non-Medical Notice
            </span>
            <p className="text-amber-900/90 dark:text-amber-200/90 text-xs">
              OLFEXA is an evidence-based consumer decision-support platform designed to evaluate declared cosmetic ingredient disclosures. Analysis is strictly informational and does not constitute medical advice, allergy diagnostics, or absolute safety claims. Always review physical packaging and consult a certified healthcare professional if you have diagnosed contact allergies.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 py-1.5 px-3 rounded-lg bg-slate-100/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60",
        className
      )}
    >
      <Info className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
      <span>
        Informational classification based on declared label information & published scientific literature. Not medical diagnosis.
      </span>
    </div>
  );
};
