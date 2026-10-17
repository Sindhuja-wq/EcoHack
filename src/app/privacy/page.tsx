import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, UserCheck, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night flex justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="p-8 sm:p-10 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft-lg space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Security & Integrity</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
              Privacy & Data Ethics Policy
            </h1>
            <p className="text-xs text-emerald-900/60 dark:text-emerald-400 mt-1">
              Last updated: October 2026 • EcoHack Foundation
            </p>
          </div>

          <div className="space-y-6 text-xs text-emerald-950/80 dark:text-emerald-200 leading-relaxed">
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                1. Data Minimization Principles
              </h3>
              <p>
                EcoHack only collects the information required to identify discard materials, maintain your authenticated session, prevent duplicate gamification point manipulation, and display community standings. We never sell your personal data, browser telemetry, or uploaded photographs to advertisers or third-party data brokers.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                2. AI Vision Processing
              </h3>
              <p>
                Photographs uploaded to the AI Waste Scanner are inspected strictly for material classification, safety assessment, and transformation option generation. Images are evaluated server-side. No API keys are ever exposed in frontend client code.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                3. Leaderboard & Public Privacy
              </h3>
              <p>
                Our community leaderboard only reveals your chosen public display name, avatar emoji, total approved eco-points, streak days, and earned badges. Email addresses, private evidence photos, and password hashes are strictly kept confidential behind server-side authorization boundaries.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                4. Your Rights: Access & Deletion
              </h3>
              <p>
                You retain complete ownership over your account. You can modify your display name, review points transaction records, and delete unapproved pending submissions directly from your Profile settings at any time.
              </p>
            </section>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-night-hover/60 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-300">
            <strong>Security Contact: </strong> If you identify any security concern or wish to request full account erasure, please contact <span className="font-semibold underline">security@ecohack.earth</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
