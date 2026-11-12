import React from "react";
import Link from "next/link";
import { Leaf, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-cream/70 dark:bg-night-card border-t border-sage/30 dark:border-night-border text-charcoal/80 dark:text-darktext-muted transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-forest p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-cream dark:bg-night rounded-[10px] flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-forest dark:text-emeraldaccent" />
                </div>
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-forest dark:text-darktext">
                EcoHack
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-charcoal/70 dark:text-darktext-muted">
              Turn Waste Into Worth. EcoHack empowers individuals and communities to repurpose, repair, and divert everyday discards from landfills.
            </p>
            <div className="flex items-center gap-2 text-xs text-forest dark:text-emeraldaccent font-medium">
              <ShieldCheck className="w-4 h-4 text-forest dark:text-emeraldaccent" />
              <span>Evidence-based carbon & materials estimation methodology</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-charcoal dark:text-darktext mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/scanner" className="hover:text-forest dark:hover:text-emeraldaccent transition-colors">
                  AI Waste Scanner
                </Link>
              </li>
              <li>
                <Link href="/challenges" className="hover:text-forest dark:hover:text-emeraldaccent transition-colors">
                  Daily Eco Challenges
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-forest dark:hover:text-emeraldaccent transition-colors">
                  Community Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/saved-ideas" className="hover:text-forest dark:hover:text-emeraldaccent transition-colors">
                  Saved DIY Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Environmental Mission & Resources */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-charcoal dark:text-darktext mb-4">
              Methodology
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-forest dark:hover:text-emeraldaccent transition-colors">
                  About EcoHack
                </Link>
              </li>
              <li>
                <Link href="/about#methodology" className="hover:text-forest dark:hover:text-emeraldaccent transition-colors">
                  Impact Formulas (EPA/UNEP)
                </Link>
              </li>
              <li>
                <Link href="/about#safety" className="hover:text-forest dark:hover:text-emeraldaccent transition-colors">
                  DIY Safety Guidelines
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-forest dark:hover:text-emeraldaccent transition-colors">
                  Privacy & Data Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Administration */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-charcoal dark:text-darktext mb-4">
              Community
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-forest dark:hover:text-emeraldaccent transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-forest dark:hover:text-emeraldaccent transition-colors">
                  My Profile & Badges
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-forest dark:hover:text-emeraldaccent transition-colors">
                  Eco Activity History
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-forest dark:hover:text-emeraldaccent transition-colors">
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-sage/20 dark:border-night-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal/60 dark:text-darktext-muted">
          <p>© 2026 EcoHack. A better tomorrow begins with what we choose not to waste today.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/about" className="hover:underline">
              Safety
            </Link>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-terracotta fill-terracotta" /> for the planet
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
