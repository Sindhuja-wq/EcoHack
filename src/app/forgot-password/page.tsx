"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    // Simulated secure dispatch
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 900);
  };

  return (
    <div className="min-h-[calc(100vh-68px)] w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-darktext relative overflow-hidden transition-colors">
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-[#43E6A1]/5 rounded-full blur-[140px] pointer-events-none" />

      <div
        className="w-full max-w-md bg-white dark:bg-night-secondary rounded-3xl p-8 sm:p-10 shadow-elevated border border-sage/40 dark:border-night-border relative z-10 transition-colors"
      >
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal/70 dark:text-darktext-secondary hover:text-forest dark:hover:text-emeraldaccent transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        <h1 className="text-2xl font-black font-heading text-charcoal dark:text-darktext tracking-tight">
          Reset Password
        </h1>
        <p className="text-sm text-charcoal/70 dark:text-darktext-muted mt-1 mb-6">
          Enter the email associated with your EcoHack account to receive a secure recovery link.
        </p>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/40 dark:border-night-border text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-forest dark:text-emeraldaccent mx-auto" />
            <h3 className="font-bold font-heading text-charcoal dark:text-darktext text-base">
              Password Reset Link Sent
            </h3>
            <p className="text-xs text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
              If an account exists for <span className="font-semibold text-charcoal dark:text-darktext">{email}</span>, you will receive an email shortly with instructions to securely reset your password.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block py-2.5 px-5 rounded-xl bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover text-white dark:text-night font-bold text-xs shadow-glow transition-all"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-2">
                Registered Email
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-sage/40 dark:border-night-border bg-white dark:bg-night-card text-charcoal dark:text-darktext placeholder:text-charcoal/40 dark:placeholder:text-darktext-muted text-sm font-medium focus:outline-none focus:border-forest dark:focus:border-emeraldaccent focus:ring-1 focus:ring-forest dark:focus:ring-emeraldaccent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white dark:text-night bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 dark:border-night/30 border-t-white dark:border-t-night rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Recovery Email</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
