"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import { AnimatedTreeIllustration } from "@/components/AnimatedTreeIllustration";
import { Leaf, User, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (!acceptTerms) {
      setErrorMsg("Please accept the community guidelines and pledge.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to create account. Please try again.");
        setLoading(false);
        return;
      }

      await refreshUser();
      showToast("Account created! You unlocked the Green Starter badge 🌱", "success");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMsg("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night relative overflow-hidden">
      {/* Decorative leaf icons */}
      <div className="absolute top-10 right-10 text-emerald-600/10 dark:text-emerald-400/5 pointer-events-none">
        <Leaf className="w-36 h-36 -rotate-12" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center z-10">
        {/* Left Side: Pitch and Illustration */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Join 10,000+ Eco Guardians</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-950 dark:text-emerald-50 leading-tight">
            Start transforming waste into{" "}
            <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 dark:from-emerald-300 dark:via-emerald-400 dark:to-green-300 bg-clip-text text-transparent">
              real value today.
            </span>
          </h1>

          <p className="text-base text-emerald-950/70 dark:text-emerald-300/80 max-w-md">
            Join the EcoHack community. Get immediate AI waste diagnosis, step-by-step DIY blueprints, earn verified eco-badges, and take part in daily zero-waste challenges.
          </p>

          <div className="w-full flex justify-center lg:justify-start pt-2">
            <AnimatedTreeIllustration size="md" />
          </div>
        </motion.div>

        {/* Right Side: Registration Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-white/95 dark:bg-night-card/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-soft-lg border border-emerald-500/20 dark:border-emerald-500/25">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
                Create Account
              </h2>
              <p className="text-sm text-emerald-900/60 dark:text-emerald-400 mt-1 font-medium">
                Free forever. No credit card required.
              </p>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-500/30 flex items-start gap-3 text-sm text-rose-800 dark:text-rose-200"
              >
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-700/60 dark:text-emerald-400/60">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sanjay Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-500/25 dark:border-emerald-500/30 bg-white/70 dark:bg-night-hover/70 text-emerald-950 dark:text-white placeholder:text-emerald-900/40 dark:placeholder:text-emerald-400/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
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
                    placeholder="sanjay@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-500/25 dark:border-emerald-500/30 bg-white/70 dark:bg-night-hover/70 text-emerald-950 dark:text-white placeholder:text-emerald-900/40 dark:placeholder:text-emerald-400/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                  Password (min 8 characters)
                </label>
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
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-emerald-500/25 dark:border-emerald-500/30 bg-white/70 dark:bg-night-hover/70 text-emerald-950 dark:text-white placeholder:text-emerald-900/40 dark:placeholder:text-emerald-400/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-700/60 dark:text-emerald-400/60 hover:text-emerald-800 dark:hover:text-emerald-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-700/60 dark:text-emerald-400/60">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-500/25 dark:border-emerald-500/30 bg-white/70 dark:bg-night-hover/70 text-emerald-950 dark:text-white placeholder:text-emerald-900/40 dark:placeholder:text-emerald-400/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-500/30"
                  />
                  <span className="text-xs text-emerald-900/80 dark:text-emerald-300 leading-normal">
                    I pledge to practice mindful waste reduction and adhere to safe upcycling guidelines.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-60 text-sm mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-emerald-500/10 text-center">
              <p className="text-sm text-emerald-900/70 dark:text-emerald-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-emerald-700 dark:text-emerald-300 hover:underline inline-flex items-center gap-1"
                >
                  Sign In here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
