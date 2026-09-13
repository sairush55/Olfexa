"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Camera, 
  History, 
  Layers, 
  Bookmark, 
  Compass, 
  User, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  LogOut, 
  Database,
  HelpCircle
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, signOut, isConfigured } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navItems = user
    ? [
        { href: "/#how-it-works", label: "How It Works", icon: HelpCircle },
        { href: "/scan", label: "Scan", icon: Camera },
        { href: "/ingredients", label: "Explore", icon: Compass },
        { href: "/dashboard", label: "Dashboard", icon: User },
        { href: "/history", label: "History", icon: History },
      ]
    : [
        { href: "/#how-it-works", label: "How It Works", icon: HelpCircle },
        { href: "/login?redirect=/scan", label: "Scan", icon: Camera },
        { href: "/ingredients", label: "Explore", icon: Compass },
      ];

  useEffect(() => {
    // Check saved theme or default to Day theme
    const saved = localStorage.getItem("olfexa_theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("olfexa_theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("olfexa_theme", "dark");
      setIsDarkMode(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-background/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo showTagline={false} size="sm" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href.includes("scan")
                ? pathname.startsWith("/scan")
                : item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wide rounded-md transition-colors",
                  isActive
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                )}
              >
                <Icon className="w-3.5 h-3.5 opacity-80" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Button, Theme Switcher & Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Day / Night Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-card-bg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors"
            title={isDarkMode ? "Switch to Day Theme" : "Switch to Night Theme"}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Day</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span>Day Theme</span>
              </>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200 max-w-[120px] truncate" title={user.email || ""}>
                {user.user_metadata?.full_name || user.email?.split("@")[0]}
              </span>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-1 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 px-3 py-1.5 font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-card-bg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-2xs"
            >
              Login / Get Started
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 text-xs"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-background px-4 pt-2 pb-6 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href.includes("scan")
                ? pathname.startsWith("/scan")
                : item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-2">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="text-xs">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Signed in</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[180px] block">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 rounded-md font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Sign In / Account
                </Link>
                <Link
                  href={user ? "/scan" : "/login?redirect=/scan"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-md bg-emerald-700 text-white text-xs font-medium"
                >
                  Scan Label
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
