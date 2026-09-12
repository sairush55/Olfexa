import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  showTagline = false,
  size = "md",
  href = "/",
}) => {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-base tracking-[0.16em]",
    md: "text-lg tracking-[0.2em]",
    lg: "text-2xl tracking-[0.22em]",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-3 group select-none", className)}>
      {/* Abstract Icon: Combining Lens / Scan ring with an Olfactory wave node */}
      <div className={cn("relative flex items-center justify-center flex-shrink-0", iconSizes[size])}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-foreground transition-transform duration-500 group-hover:scale-105"
        >
          {/* Outer precision aperture ring */}
          <circle
            cx="20"
            cy="20"
            r="17"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeDasharray="4 2.5"
            className="opacity-40"
          />
          {/* Internal continuous lens ring */}
          <circle
            cx="20"
            cy="20"
            r="12.5"
            stroke="currentColor"
            strokeWidth="1.5"
            className="opacity-80"
          />
          {/* Sinuous fragrance dispersion wave cutting through the focal core */}
          <path
            d="M12 24C14.5 24 16 16 20 16C24 16 25.5 24 28 24"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Central analytical focal node */}
          <circle cx="20" cy="20" r="2.2" fill="currentColor" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={cn(
            "font-semibold uppercase text-foreground leading-none font-editorial-heading",
            textSizes[size]
          )}
        >
          OLFEXA
        </span>
        {showTagline && (
          <span className="text-[10px] tracking-wider text-slate-500 dark:text-slate-400 uppercase mt-1 font-medium">
            Understand what you wear.
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded">
        {content}
      </Link>
    );
  }

  return content;
};
