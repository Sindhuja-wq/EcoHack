import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, UserCheck, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="w-full min-h-[calc(100vh-68px)] py-12 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-darktext flex justify-center relative overflow-hidden transition-colors">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-96 bg-emerald-500/10 dark:bg-[#43E6A1]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal/70 dark:text-darktext-secondary hover:text-forest dark:hover:text-emeraldaccent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-8 transition-colors">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Security & Integrity</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-heading text-charcoal dark:text-darktext tracking-tight">
              Privacy & Data Ethics Policy
            </h1>
            <p className="text-xs text-charcoal/60 dark:text-darktext-muted mt-1">
              Last updated: 2026 • EcoHack Platform
            </p>
          </div>

          <div className="space-y-6 text-xs text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
            <section className="space-y-2">
              <h3 className="text-sm font-bold font-heading text-charcoal dark:text-darktext">
                1. Data Minimization Principles
              </h3>
              <p>
                EcoHack only collects the information required to identify discard materials, maintain your authenticated session, prevent duplicate gamification point manipulation, and display community standings. We never sell your personal data, browser telemetry, or uploaded photographs to advertisers or third-party data brokers.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold font-heading text-charcoal dark:text-darktext">
                2. AI Vision Processing
              </h3>
              <p>
                Photographs uploaded to the AI Waste Scanner are inspected strictly for material classification, safety assessment, and transformation option generation. Images are evaluated server-side. No API keys are ever exposed in frontend client code.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold font-heading text-charcoal dark:text-darktext">
                3. Leaderboard & Public Privacy
              </h3>
              <p>
                Our community leaderboard only reveals your chosen public display name, avatar emoji, total approved eco-points, streak days, and earned badges. Email addresses, private evidence photos, and password hashes are strictly kept confidential behind server-side authorization boundaries.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold font-heading text-charcoal dark:text-darktext">
                4. Your Rights: Access & Deletion
              </h3>
              <p>
                You retain complete ownership over your account. You can modify your display name, review points transaction records, and delete unapproved pending submissions directly from your Profile settings at any time.
              </p>
            </section>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-xs text-charcoal/80 dark:text-darktext-secondary transition-colors">
            <strong className="text-forest dark:text-emeraldaccent">Security Contact: </strong> If you identify any security concern or wish to request full account erasure, please contact <span className="font-semibold underline text-charcoal dark:text-darktext">security@ecohack.earth</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
