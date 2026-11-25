import React from "react";
import Link from "next/link";
import { Leaf, ShieldCheck, Sparkles, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-cream dark:bg-night border-t border-sage/30 dark:border-night-border text-charcoal/70 dark:text-darktext-secondary transition-colors relative overflow-hidden">
      {/* Subtle atmospheric glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-forest/5 dark:bg-emeraldaccent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand & Mission Statement */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-night-secondary border border-sage/30 dark:border-night-border flex items-center justify-center transition-colors group-hover:border-forest/40 dark:group-hover:border-emeraldaccent/40 shadow-sm">
                <Leaf className="w-4 h-4 text-forest dark:text-emeraldaccent" />
              </div>
              <span className="font-heading font-bold text-lg tracking-tight text-forest dark:text-darktext group-hover:text-forest-800 dark:group-hover:text-white transition-colors">
                EcoHack
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-charcoal/70 dark:text-darktext-secondary">
              Turn waste into its next possibility. EcoHack pairs multimodal machine intelligence with circular engineering to help you repurpose, transform, and responsibly divert everyday discards.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-night-secondary border border-sage/30 dark:border-night-border text-xs text-forest dark:text-emeraldaccent-soft font-medium shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
              <span>Evidence-based carbon & materials metrics (EPA / UNEP)</span>
            </div>
          </div>

          {/* Platform Exploration */}
          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-forest dark:text-darktext mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/scanner" className="hover:text-forest dark:hover:text-emeraldaccent text-charcoal/70 dark:text-darktext-secondary transition-colors inline-flex items-center gap-1 group">
                  <span>AI Waste Scanner</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all text-forest dark:text-emeraldaccent" />
                </Link>
              </li>
              <li>
                <Link href="/challenges" className="hover:text-forest dark:hover:text-emeraldaccent text-charcoal/70 dark:text-darktext-secondary transition-colors inline-flex items-center gap-1 group">
                  <span>Daily Eco Challenges</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all text-forest dark:text-emeraldaccent" />
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-forest dark:hover:text-emeraldaccent text-charcoal/70 dark:text-darktext-secondary transition-colors inline-flex items-center gap-1 group">
                  <span>Global Leaderboard</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all text-forest dark:text-emeraldaccent" />
                </Link>
              </li>
              <li>
                <Link href="/saved-ideas" className="hover:text-forest dark:hover:text-emeraldaccent text-charcoal/70 dark:text-darktext-secondary transition-colors inline-flex items-center gap-1 group">
                  <span>Saved Blueprints</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all text-forest dark:text-emeraldaccent" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Environmental Methodology */}
          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-forest dark:text-darktext mb-4">
              Methodology
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-forest dark:hover:text-emeraldaccent text-charcoal/70 dark:text-darktext-secondary transition-colors">
                  About EcoHack
                </Link>
              </li>
              <li>
                <Link href="/about#methodology" className="hover:text-forest dark:hover:text-emeraldaccent text-charcoal/70 dark:text-darktext-secondary transition-colors">
                  Impact Estimation Models
                </Link>
              </li>
              <li>
                <Link href="/about#safety" className="hover:text-forest dark:hover:text-emeraldaccent text-charcoal/70 dark:text-darktext-secondary transition-colors">
                  Safety Protocols
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-forest dark:hover:text-emeraldaccent text-charcoal/70 dark:text-darktext-secondary transition-colors">
                  Privacy & Data Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Workspace */}
          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-forest dark:text-darktext mb-4">
              Workspace
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-forest dark:hover:text-emeraldaccent text-charcoal/70 dark:text-darktext-secondary transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-forest dark:hover:text-emeraldaccent text-charcoal/70 dark:text-darktext-secondary transition-colors">
                  My Profile & Badges
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-forest dark:hover:text-emeraldaccent text-charcoal/70 dark:text-darktext-secondary transition-colors">
                  Activity Timeline
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-forest dark:hover:text-emeraldaccent text-charcoal/70 dark:text-darktext-secondary transition-colors">
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-sage/30 dark:border-night-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal/60 dark:text-darktext-muted">
          <p>© 2026 EcoHack. A better tomorrow begins with what we choose not to waste today.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-forest dark:hover:text-darktext-secondary transition-colors">
              Privacy
            </Link>
            <Link href="/about" className="hover:text-forest dark:hover:text-darktext-secondary transition-colors">
              Safety
            </Link>
            <span className="inline-flex items-center gap-1.5 text-forest dark:text-emeraldaccent-soft">
              <Sparkles className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
              <span>Designed for Circular Impact</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
