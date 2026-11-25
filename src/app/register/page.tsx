"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import { Leaf, User, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, Award, ShieldCheck } from "lucide-react";
import { AnimatedTreeIllustration } from "@/components/AnimatedTreeIllustration";
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
    <div className="min-h-[calc(100vh-68px)] w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-darktext relative overflow-hidden transition-colors">
      {/* Background glow effects */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-forest/5 dark:bg-emeraldaccent/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center z-10">
        {/* Left Side: Brand Inspiration */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Award className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
            <span>Join 10,000+ Eco Guardians</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-charcoal dark:text-darktext leading-tight">
            Start transforming waste into{" "}
            <span className="inline-block py-0.5 text-transparent bg-clip-text bg-gradient-to-r from-forest to-forest-500 dark:from-emeraldaccent dark:to-emeraldaccent-400">
              real value today.
            </span>
          </h1>

          <p className="text-base text-charcoal/70 dark:text-darktext-secondary max-w-md leading-relaxed">
            Join the EcoHack community. Get immediate AI waste diagnosis, step-by-step DIY blueprints, earn verified eco-badges, and take part in daily zero-waste challenges.
          </p>

          <div className="w-full pt-1 flex justify-center lg:justify-start">
            <AnimatedTreeIllustration size="md" priority={true} />
          </div>

          <div className="pt-1 flex flex-col gap-2.5 text-xs text-charcoal/60 dark:text-darktext-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest dark:text-emeraldaccent shrink-0" />
              <span>Unlock the starter badge immediately upon joining</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest dark:text-emeraldaccent shrink-0" />
              <span>Track verified grams diverted & carbon saved</span>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form Card */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-night-secondary rounded-3xl p-8 sm:p-10 shadow-soft-lg dark:shadow-elevated border border-sage/30 dark:border-night-border">
            <div className="mb-6">
              <h2 className="text-2xl font-black font-heading text-charcoal dark:text-darktext tracking-tight">
                Create Account
              </h2>
              <p className="text-sm text-charcoal/60 dark:text-darktext-muted mt-1 font-medium">
                Free forever. No credit card required.
              </p>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-sm text-rose-700 dark:text-rose-300"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal/40 dark:text-darktext-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-sage/40 dark:border-night-border bg-cream-50 dark:bg-night-card text-charcoal dark:text-darktext placeholder:text-charcoal/40 dark:placeholder:text-darktext-muted text-sm font-medium focus:outline-none focus:border-forest dark:focus:border-emeraldaccent focus:ring-1 focus:ring-forest dark:focus:ring-emeraldaccent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-1.5">
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
                    placeholder="jane@ecohack.earth"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-sage/40 dark:border-night-border bg-cream-50 dark:bg-night-card text-charcoal dark:text-darktext placeholder:text-charcoal/40 dark:placeholder:text-darktext-muted text-sm font-medium focus:outline-none focus:border-forest dark:focus:border-emeraldaccent focus:ring-1 focus:ring-forest dark:focus:ring-emeraldaccent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-1.5">
                  Password (8+ chars)
                </label>
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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal/40 dark:text-darktext-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-sage/40 dark:border-night-border bg-cream-50 dark:bg-night-card text-charcoal dark:text-darktext placeholder:text-charcoal/40 dark:placeholder:text-darktext-muted text-sm font-medium focus:outline-none focus:border-forest dark:focus:border-emeraldaccent focus:ring-1 focus:ring-forest dark:focus:ring-emeraldaccent transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-sage/40 dark:border-night-border bg-cream-50 dark:bg-night-card text-forest dark:text-emeraldaccent focus:ring-forest dark:focus:ring-emeraldaccent"
                  />
                  <span className="text-xs text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
                    I pledge to practice mindful waste habits and abide by the{" "}
                    <Link href="/privacy" className="text-forest dark:text-emeraldaccent hover:underline font-semibold">
                      EcoHack Community Guidelines
                    </Link>
                    .
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white dark:text-night bg-forest dark:bg-emeraldaccent hover:bg-forest-800 dark:hover:bg-emeraldaccent-400 shadow-soft-lg dark:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-sage/30 dark:border-night-border text-center text-xs text-charcoal/70 dark:text-darktext-secondary">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-forest dark:text-emeraldaccent hover:underline">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
