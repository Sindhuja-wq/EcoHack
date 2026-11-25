"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import { AnimatedTreeIllustration } from "@/components/AnimatedTreeIllustration";
import { motion } from "framer-motion";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { refreshUser } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Invalid email or password");
        setLoading(false);
        return;
      }

      await refreshUser();
      showToast(`Welcome back, ${data.user.name}!`, "success");
      router.push(redirectUrl);
      router.refresh();
    } catch {
      setErrorMsg("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-darktext relative overflow-hidden transition-colors">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-forest/5 dark:bg-emeraldaccent/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center z-10">
        {/* Left Side: Brand & Platform Inspiration */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
            <span>Waste-to-Value Diagnostics</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-charcoal dark:text-darktext leading-tight">
            Grow your impact, <br />
            <span className="inline-block py-0.5 text-transparent bg-clip-text bg-gradient-to-r from-forest to-forest-500 dark:from-emeraldaccent dark:to-emeraldaccent-400">
              one discard at a time.
            </span>
          </h1>

          <p className="text-base text-charcoal/70 dark:text-darktext-secondary max-w-md leading-relaxed">
            Sign in to access your personal waste-to-value scanner, log daily challenges, save upcycling ideas, and climb the sustainability leaderboard.
          </p>

          <div className="w-full pt-1 flex justify-center lg:justify-start">
            <AnimatedTreeIllustration size="md" priority={true} />
          </div>

          <div className="pt-1 flex flex-col gap-2.5 text-xs text-charcoal/60 dark:text-darktext-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest dark:text-emeraldaccent shrink-0" />
              <span>Evidence-based EPA / UNEP carbon accounting</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest dark:text-emeraldaccent shrink-0" />
              <span>Verified material diversion tracking</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-night-secondary rounded-3xl p-8 sm:p-10 shadow-soft-lg dark:shadow-elevated border border-sage/30 dark:border-night-border">
            <div className="mb-8">
              <h2 className="text-2xl font-black font-heading text-charcoal dark:text-darktext tracking-tight">
                Welcome Back
              </h2>
              <p className="text-sm text-charcoal/60 dark:text-darktext-muted mt-1 font-medium">
                Enter your credentials to continue your journey.
              </p>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-sm text-rose-700 dark:text-rose-300"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal/40 dark:text-darktext-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sustainability@ecohack.earth"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-sage/40 dark:border-night-border bg-cream-50 dark:bg-night-card text-charcoal dark:text-darktext placeholder:text-charcoal/40 dark:placeholder:text-darktext-muted text-sm font-medium focus:outline-none focus:border-forest dark:focus:border-emeraldaccent focus:ring-1 focus:ring-forest dark:focus:ring-emeraldaccent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-forest dark:text-emeraldaccent hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal/40 dark:text-darktext-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-sage/40 dark:border-night-border bg-cream-50 dark:bg-night-card text-charcoal dark:text-darktext placeholder:text-charcoal/40 dark:placeholder:text-darktext-muted text-sm font-medium focus:outline-none focus:border-forest dark:focus:border-emeraldaccent focus:ring-1 focus:ring-forest dark:focus:ring-emeraldaccent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-charcoal/40 dark:text-darktext-muted hover:text-charcoal dark:hover:text-darktext"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-sage/40 dark:border-night-border bg-cream-50 dark:bg-night-card text-forest dark:text-emeraldaccent focus:ring-forest dark:focus:ring-emeraldaccent"
                  />
                  <span className="text-xs text-charcoal/70 dark:text-darktext-secondary">Remember this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white dark:text-night bg-forest dark:bg-emeraldaccent hover:bg-forest-800 dark:hover:bg-emeraldaccent-400 shadow-soft-lg dark:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-sage/30 dark:border-night-border text-center text-xs text-charcoal/70 dark:text-darktext-secondary">
              Don&apos;t have an EcoHack account?{" "}
              <Link href="/register" className="font-bold text-forest dark:text-emeraldaccent hover:underline">
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream dark:bg-night flex items-center justify-center text-xs text-charcoal/60 dark:text-darktext-muted">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
