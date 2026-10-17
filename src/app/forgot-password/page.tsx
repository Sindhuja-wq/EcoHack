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
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/95 dark:bg-night-card/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-soft-lg border border-emerald-500/20"
      >
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 hover:underline mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        <h1 className="text-2xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
          Reset Password
        </h1>
        <p className="text-sm text-emerald-900/60 dark:text-emerald-400 mt-1 mb-6">
          Enter the email associated with your EcoHack account to receive a secure recovery link.
        </p>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="font-bold text-emerald-950 dark:text-emerald-100 text-base">
              Password Reset Link Sent
            </h3>
            <p className="text-xs text-emerald-900/80 dark:text-emerald-300 leading-relaxed">
              If an account exists for <span className="font-semibold">{email}</span>, you will receive an email shortly with instructions to securely reset your password.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block py-2 px-5 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-sm hover:bg-emerald-800 transition-colors"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-2">
                Registered Email
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Recovery Email</span>
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
