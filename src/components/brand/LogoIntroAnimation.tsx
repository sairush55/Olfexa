"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface LogoIntroAnimationProps {
  onComplete?: () => void;
  duration?: number; // total duration before auto-dismiss in milliseconds
}

export const LogoIntroAnimation: React.FC<LogoIntroAnimationProps> = ({
  onComplete,
  duration = 2700,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete?.();
    }, 650); // allow exit transition to finish
  }, [onComplete]);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleDismiss]);

  if (!mounted) return null;

  const brandLetters = ["O", "L", "F", "E", "X", "A"];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="olfexa-intro-overlay"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.03,
            filter: "blur(8px)",
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fdfdfc] text-slate-900 select-none overflow-hidden"
          style={{ willChange: "opacity, transform, filter" }}
        >
          {/* Ambient luminous Day Theme glow background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Primary soft emerald day glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.9, 1.15, 1], opacity: [0.35, 0.65, 0.45] }}
              transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] sm:w-[560px] h-[360px] sm:h-[560px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-100/70 via-emerald-50/40 to-transparent blur-3xl pointer-events-none"
            />
            {/* Subtle warm amber highlight aura */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.35, scale: 1 }}
              transition={{ duration: 1.8, delay: 0.4, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full bg-amber-100/50 blur-2xl pointer-events-none"
            />
            {/* Delicate background grid pattern in soft slate */}
            <div 
              className="absolute inset-0 opacity-[0.035] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          {/* Skip Button in Top-Right (Day Theme styling) */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 0.8, y: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="absolute top-6 right-6 z-20"
          >
            <button
              onClick={handleDismiss}
              className="px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 text-xs font-mono tracking-wider transition-all backdrop-blur-md flex items-center gap-1.5 shadow-2xs"
              aria-label="Skip introductory animation"
            >
              <span>Skip</span>
              <ArrowRight className="w-3 h-3 text-emerald-700" />
            </button>
          </motion.div>

          {/* Central Logo & Brand Animation Container */}
          <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-md w-full text-center">
            
            {/* Animated SVG Emblem */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-6 flex items-center justify-center">
              
              {/* Sonar Radar Pulse Ring (Day Theme) */}
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [0.6, 1.8], opacity: [0.6, 0] }}
                transition={{
                  duration: 1.8,
                  delay: 0.6,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
                className="absolute w-16 h-16 rounded-full border border-emerald-500/40 pointer-events-none"
              />

              {/* Main SVG Logo (Day Theme botanical colors) */}
              <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-[0_4px_20px_rgba(5,150,105,0.16)]"
              >
                <defs>
                  <linearGradient id="dayEmeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="50%" stopColor="#047857" />
                    <stop offset="100%" stopColor="#065f46" />
                  </linearGradient>
                  <linearGradient id="dayWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>

                {/* 1. Outer precision aperture dashed ring (rotates continuously) */}
                <motion.circle
                  cx="20"
                  cy="20"
                  r="17"
                  stroke="url(#dayEmeraldGradient)"
                  strokeWidth="1.5"
                  strokeDasharray="4 2.5"
                  initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                  animate={{
                    opacity: 0.6,
                    scale: 1,
                    rotate: 270,
                  }}
                  transition={{
                    opacity: { duration: 0.7, ease: "easeOut" },
                    scale: { duration: 0.8, ease: "easeOut" },
                    rotate: { duration: 16, repeat: Infinity, ease: "linear" },
                  }}
                  style={{ transformOrigin: "20px 20px" }}
                />

                {/* 2. Internal continuous lens ring (draws in with pathLength) */}
                <motion.circle
                  cx="20"
                  cy="20"
                  r="12.5"
                  stroke="url(#dayEmeraldGradient)"
                  strokeWidth="1.6"
                  initial={{ pathLength: 0, opacity: 0, rotate: -180 }}
                  animate={{
                    pathLength: 1,
                    opacity: 0.9,
                    rotate: 0,
                  }}
                  transition={{
                    pathLength: { duration: 1.1, delay: 0.25, ease: "easeInOut" },
                    opacity: { duration: 0.4, delay: 0.2 },
                    rotate: { duration: 1.1, delay: 0.25, ease: "easeOut" },
                  }}
                  style={{ transformOrigin: "20px 20px" }}
                />

                {/* 3. Sinuous fragrance dispersion wave (draws across the core) */}
                <motion.path
                  d="M12 24C14.5 24 16 16 20 16C24 16 25.5 24 28 24"
                  stroke="url(#dayWaveGradient)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: { duration: 0.9, delay: 0.55, ease: "easeInOut" },
                    opacity: { duration: 0.3, delay: 0.55 },
                  }}
                />

                {/* 4. Central analytical focal node (pops in with spring) */}
                <motion.circle
                  cx="20"
                  cy="20"
                  r="2.4"
                  fill="#065f46"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.4, 1],
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.75,
                    ease: "easeOut",
                  }}
                  style={{ transformOrigin: "20px 20px" }}
                />
              </svg>
            </div>

            {/* Brand Title: Staggered Letter Reveal (Day Theme Crisp Typography) */}
            <div className="flex items-center justify-center space-x-1.5 sm:space-x-2.5 mb-3 overflow-hidden">
              {brandLetters.map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.55,
                    delay: 0.8 + index * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="font-editorial-heading font-bold text-3xl sm:text-5xl text-slate-950 tracking-[0.22em] drop-shadow-xs"
                >
                  {char}
                </motion.span>
              ))}
            </div>

            {/* Tagline Reveal (Day Theme) */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.4, ease: "easeOut" }}
              className="text-xs sm:text-sm text-slate-600 font-normal tracking-wide max-w-xs mx-auto"
            >
              Decode your fragrance. Choose with confidence.
            </motion.p>

            {/* Sleek Progress / Loading Tracker Line (Day Theme) */}
            <div className="w-36 h-[2px] bg-slate-200/90 rounded-full mt-7 overflow-hidden relative">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.8,
                  delay: 0.4,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
                className="w-20 h-full bg-gradient-to-r from-transparent via-emerald-600 to-transparent"
              />
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default LogoIntroAnimation;
