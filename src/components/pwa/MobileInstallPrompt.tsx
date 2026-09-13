"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Download, 
  Share, 
  PlusSquare, 
  X, 
  Smartphone, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const MobileInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const handleInstallClick = React.useCallback(async () => {
    if (deferredPrompt) {
      // Android / Chrome native prompt
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setShowBanner(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Error triggering install prompt:", err);
      }
    } else if (isIOS) {
      // iOS Safari Add to Home Screen modal
      setShowIOSModal(true);
    } else {
      // Generic fallback (e.g. desktop Chrome or other browsers)
      setShowIOSModal(true);
    }
  }, [deferredPrompt, isIOS]);

  useEffect(() => {
    // 1. Detect if already installed/running in standalone PWA mode
    const standaloneCheck =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    if (standaloneCheck) {
      setIsStandalone(true);
      return;
    }

    // 2. Detect mobile device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobileDevice = /iphone|ipad|ipod|android|mobile|touch/.test(userAgent);
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsMobile(isMobileDevice);
    setIsIOS(isAppleDevice);

    // 3. Check dismissed timestamp in localStorage (hide for 3 days if dismissed)
    const dismissedAt = localStorage.getItem("olfexa_pwa_dismissed");
    const isRecentlyDismissed =
      dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 3 * 24 * 60 * 60 * 1000;

    // 4. Capture native Android/Chrome beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isRecentlyDismissed && isMobileDevice) {
        // Show banner after brief delay
        setTimeout(() => setShowBanner(true), 2500);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. Handle app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      localStorage.setItem("olfexa_pwa_installed", "true");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // 6. Listen for custom trigger from Navbar or buttons
    const handleManualTrigger = () => {
      handleInstallClick();
    };

    window.addEventListener("olfexa-trigger-install", handleManualTrigger);

    // For iOS, show banner if on mobile and not recently dismissed
    if (isAppleDevice && !isRecentlyDismissed && isMobileDevice) {
      setTimeout(() => setShowBanner(true), 3500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("olfexa-trigger-install", handleManualTrigger);
    };
  }, [handleInstallClick]);

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem("olfexa_pwa_dismissed", Date.now().toString());
  };

  // Do not render anything if already installed as standalone
  if (isStandalone) return null;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING MOBILE INSTALL BANNER                                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showBanner && !isInstalled && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-40"
          >
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-300/80 dark:border-emerald-800/80 shadow-xl flex items-center justify-between gap-3 text-slate-900 dark:text-slate-100">
              
              {/* App Icon & Details */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-white flex-shrink-0 shadow-sm overflow-hidden p-1.5">
                  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <circle cx="20" cy="20" r="16" stroke="#34d399" strokeWidth="2" strokeDasharray="4 2.5" opacity="0.6" />
                    <circle cx="20" cy="20" r="11" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
                    <path d="M12 24C14.5 24 16 16 20 16C24 16 25.5 24 28 24" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="20" cy="20" r="2.2" fill="#ffffff" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate">Install OLFEXA App</h4>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">Fast</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    1-tap camera scanner &amp; full-screen view
                  </p>
                </div>
              </div>

              {/* Actions: Install & Close */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-1 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install</span>
                </button>
                <button
                  onClick={handleDismissBanner}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Dismiss install banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. IOS / BROWSER INSTRUCTIONS MODAL                                       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-white">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Install OLFEXA as an App</h3>
                    <p className="text-[11px] text-slate-500">Home screen access for iPhone &amp; iPad</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Visual Step-by-Step Guide */}
              <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
                
                {/* Step 1 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold flex items-center gap-1.5 text-slate-900 dark:text-white">
                      <span>Tap the Share button</span>
                      <Share className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Located in the bottom toolbar of Safari (or top right on iPad).
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold flex items-center gap-1.5 text-slate-900 dark:text-white">
                      <span>Select &ldquo;Add to Home Screen&rdquo;</span>
                      <PlusSquare className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Scroll down through the share options and tap Add to Home Screen.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      Tap &ldquo;Add&rdquo; in the top-right corner
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      OLFEXA will appear on your phone home screen just like a native app.
                    </p>
                  </div>
                </div>

              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs shadow-sm transition-all text-center"
              >
                Got It
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
export default MobileInstallPrompt;
