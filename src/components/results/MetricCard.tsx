import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "alert";
  icon: LucideIcon;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  badge,
  badgeVariant = "default",
  icon: Icon,
  className,
}) => {
  const badgeStyles = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    alert: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-card-bg p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-editorial-heading">
          {value}
        </span>
        {badge && (
          <span
            className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider",
              badgeStyles[badgeVariant]
            )}
          >
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
          {subtitle}
        </p>
      )}
    </div>
  );
};
