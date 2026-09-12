import React from "react";
import { CheckCircle2, AlertCircle, HelpCircle, Droplet, Info } from "lucide-react";
import { AlcoholStatus, DetectedAlcohol } from "@/types";
import { cn } from "@/lib/utils";

interface AlcoholStatusBannerProps {
  status: AlcoholStatus;
  explanation: string;
  detectedAlcohols: DetectedAlcohol[];
  className?: string;
}

export const AlcoholStatusBanner: React.FC<AlcoholStatusBannerProps> = ({
  status,
  explanation,
  detectedAlcohols,
  className,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "CONTAINS_ALCOHOL":
        return {
          title: "Alcohol Ingredient Detected",
          icon: AlertCircle,
          border: "border-amber-200 dark:border-amber-900/50",
          bg: "bg-amber-50/80 dark:bg-amber-950/20",
          text: "text-amber-900 dark:text-amber-200",
          badgeBg: "bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200",
          badgeText: "Alcohol Ingredient Declared",
        };
      case "NO_RECOGNIZED_ALCOHOL_DETECTED":
      case "NO_RECOGNIZED_ALCOHOL":
        return {
          title: "No Recognized Alcohol Ingredient Detected",
          icon: CheckCircle2,
          border: "border-emerald-200 dark:border-emerald-900/50",
          bg: "bg-emerald-50/80 dark:bg-emerald-950/20",
          text: "text-emerald-950 dark:text-emerald-200",
          badgeBg: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200",
          badgeText: "No Recognized Alcohol in Provided Text",
        };
      case "UNABLE_TO_CONFIRM":
      case "INSUFFICIENT_INFO":
      default:
        return {
          title: "Unable to Confirm",
          icon: HelpCircle,
          border: "border-slate-200 dark:border-slate-800",
          bg: "bg-slate-50 dark:bg-slate-900/30",
          text: "text-slate-800 dark:text-slate-200",
          badgeBg: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
          badgeText: "Insufficient Data",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 sm:p-6 transition-all shadow-sm",
        config.border,
        config.bg,
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
            <Icon className="w-5 h-5 text-current" />
          </div>
          <div>
            <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Alcohol Evaluation
            </div>
            <h3 className={cn("text-base sm:text-lg font-semibold tracking-tight", config.text)}>
              {config.title}
            </h3>
          </div>
        </div>

        <span
          className={cn(
            "self-start sm:self-auto text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono",
            config.badgeBg
          )}
        >
          {config.badgeText}
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
        {explanation}
      </p>

      {/* Structured Detected Alcohols Breakdown */}
      {detectedAlcohols.length > 0 && (
        <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 space-y-2">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Identified Alcohol Compounds ({detectedAlcohols.length}):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {detectedAlcohols.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 text-xs"
              >
                <Droplet className="w-3.5 h-3.5 mt-0.5 text-slate-500 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                      {item.inciName}
                    </span>
                    {item.isFattyAlcohol ? (
                      <span className="text-[10px] px-1.5 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 rounded font-medium">
                        Fatty Alcohol
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded font-medium">
                        {item.label}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                    {item.scientificContext}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strict Non-Absolute Disclaimer Note */}
      <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <Info className="w-3 h-3 flex-shrink-0" />
        <span>
          Based exclusively on declared ingredient data. Does not infer undisclosed volatile denaturants or unlisted trade secret compounds.
        </span>
      </div>
    </div>
  );
};
