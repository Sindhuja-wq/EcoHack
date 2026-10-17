"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import { AnimatedTreeIllustration } from "@/components/AnimatedTreeIllustration";
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
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
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night relative overflow-hidden">
      {/* Decorative ambient leaf icons in background */}
      <div className="absolute top-12 left-10 text-emerald-600/10 dark:text-emerald-400/5 pointer-events-none">
        <Leaf className="w-32 h-32 rotate-12" />
      </div>
      <div className="absolute bottom-10 right-10 text-emerald-600/10 dark:text-emerald-400/5 pointer-events-none">
        <Leaf className="w-48 h-48 -rotate-45" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center z-10">
        {/* Left Side: Animated Nature & Growing Tree Illustration */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Circular Economy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-950 dark:text-emerald-50 leading-tight">
            Grow your impact, <br />
            <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 dark:from-emerald-300 dark:via-emerald-400 dark:to-green-300 bg-clip-text text-transparent">
              one discard at a time.
            </span>
          </h1>

          <p className="text-base text-emerald-950/70 dark:text-emerald-300/80 max-w-md">
            Sign in to access your personal waste-to-value scanner, log daily challenges, save upcycling ideas, and climb the sustainability leaderboard.
          </p>

          <div className="w-full flex justify-center lg:justify-start pt-2">
            <AnimatedTreeIllustration size="md" />
          </div>
        </motion.div>

        {/* Right Side: Login Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-white/95 dark:bg-night-card/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-soft-lg border border-emerald-500/20 dark:border-emerald-500/25">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-sm text-emerald-900/60 dark:text-emerald-400 mt-1 font-medium">
                Enter your credentials to continue your journey.
              </p>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-500/30 flex items-start gap-3 text-sm text-rose-800 dark:text-rose-200"
              >
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-700/60 dark:text-emerald-400/60">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sustainability@ecohack.earth"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-emerald-500/25 dark:border-emerald-500/30 bg-white/70 dark:bg-night-hover/70 text-emerald-950 dark:text-white placeholder:text-emerald-900/40 dark:placeholder:text-emerald-400/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-700/60 dark:text-emerald-400/60">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-emerald-500/25 dark:border-emerald-500/30 bg-white/70 dark:bg-night-hover/70 text-emerald-950 dark:text-white placeholder:text-emerald-900/40 dark:placeholder:text-emerald-400/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-700/60 dark:text-emerald-400/60 hover:text-emerald-800 dark:hover:text-emerald-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-500/30"
                  />
                  <span className="text-xs text-emerald-900/80 dark:text-emerald-300 font-medium">
                    Keep me signed in for 30 days
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-emerald-500/10 text-center">
              <p className="text-sm text-emerald-900/70 dark:text-emerald-400">
                Don&apos;t have an EcoHack account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-emerald-700 dark:text-emerald-300 hover:underline inline-flex items-center gap-1"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center bg-nature-gradient dark:bg-night text-sm font-semibold text-emerald-900/60 dark:text-emerald-400">
          Loading sign in...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

