"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { ArrowRight, Lock, Mail, User, Camera, AlertCircle, CheckCircle2, Database } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get("redirect") || "/dashboard";

  const { signUpWithEmail, isConfigured } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify both fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters in length.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signUpWithEmail(email, password, fullName);
      if (res.error) {
        setErrorMessage(res.error.message || "Failed to create account. Please try again.");
        setIsLoading(false);
      } else if (res.needsEmailConfirmation) {
        setIsLoading(false);
        setConfirmationNotice(true);
      } else {
        router.push(redirectTarget);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during registration.");
      setIsLoading(false);
    }
  };

  const isFromScan = redirectTarget.includes("scan");

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo showTagline={true} size="md" className="justify-center" />
        
        {isFromScan && (
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-medium">
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            <span>Create account to scan and save your fragrance dossier</span>
          </div>
        )}

        <h2 className="mt-5 text-2xl sm:text-3xl font-bold font-editorial-heading text-slate-900 dark:text-slate-100 tracking-tight">
          Create your OLFEXA account
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          Build your personal fragrance sensitivity profile and scan archive
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-card-bg py-8 px-6 sm:px-10 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
          {/* Connection Status Pill */}
          <div className="flex justify-center mb-6">
            {isConfigured ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Database className="w-3 h-3" />
                <span>Supabase Live Auth Connected</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Local Demo Mode (Configure .env.local for Cloud Auth)</span>
              </div>
            )}
          </div>

          {confirmationNotice ? (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-700 dark:text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Verification Email Sent
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                We sent a confirmation link to <span className="font-semibold text-foreground">{email}</span>. Please click the link to confirm your account, then sign in.
              </p>
              <div className="pt-2">
                <Link
                  href={isFromScan ? "/login?redirect=/scan" : "/login"}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                >
                  <span>Go to Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Elena Rostova"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-foreground focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="perfumer@olfexa.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-foreground focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-foreground focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-foreground focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition-all shadow-xs"
                  >
                    {isLoading ? "Creating account..." : isFromScan ? "Create Account & Continue to Scanner" : "Create account"}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
                Already have an account?{" "}
                <Link 
                  href={isFromScan ? "/login?redirect=/scan" : "/login"} 
                  className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center text-xs font-mono text-slate-500">
        Loading registration...
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
