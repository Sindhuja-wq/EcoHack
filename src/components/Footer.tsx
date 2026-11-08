import React from "react";
import Link from "next/link";
import { Leaf, ShieldCheck, Heart, Sparkles, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-cream/70 dark:bg-night-card border-t border-sage/30 dark:border-forest/30 text-charcoal/80 dark:text-cream/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-forest p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-cream dark:bg-night rounded-[10px] flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-forest dark:text-limeaccent" />
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-forest dark:text-cream">
                EcoHack
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-charcoal/70 dark:text-cream/70">
              Turn Waste Into Worth. EcoHack empowers individuals and communities with AI vision intelligence to repurpose, repair, and divert everyday discards from landfills.
            </p>
            <div className="flex items-center gap-2 text-xs text-forest dark:text-limeaccent font-medium">
              <ShieldCheck className="w-4 h-4 text-forest dark:text-limeaccent" />
              <span>Evidence-based carbon & materials estimation methodology</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal dark:text-cream mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/scanner" className="hover:text-forest dark:hover:text-limeaccent transition-colors">
                  AI Waste Scanner
                </Link>
              </li>
              <li>
                <Link href="/challenges" className="hover:text-forest dark:hover:text-limeaccent transition-colors">
                  Daily Eco Challenges
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-forest dark:hover:text-limeaccent transition-colors">
                  Community Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/saved-ideas" className="hover:text-forest dark:hover:text-limeaccent transition-colors">
                  Saved DIY Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Environmental Mission & Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal dark:text-cream mb-4">
              Methodology
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-forest dark:hover:text-limeaccent transition-colors">
                  About EcoHack
                </Link>
              </li>
              <li>
                <Link href="/about#methodology" className="hover:text-forest dark:hover:text-limeaccent transition-colors">
                  Impact Formulas (EPA/UNEP)
                </Link>
              </li>
              <li>
                <Link href="/about#safety" className="hover:text-forest dark:hover:text-limeaccent transition-colors">
                  DIY Safety Guidelines
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-forest dark:hover:text-limeaccent transition-colors">
                  Privacy & Data Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Administration */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal dark:text-cream mb-4">
              Community
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-forest dark:hover:text-limeaccent transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-forest dark:hover:text-limeaccent transition-colors">
                  My Profile & Badges
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-forest dark:hover:text-limeaccent transition-colors">
                  Eco Activity History
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-forest dark:hover:text-limeaccent transition-colors">
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-sage/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal/60 dark:text-cream/60">
          <p>© {new Date().getFullYear()} EcoHack. Open Sustainability Architecture. Built for Earth.</p>
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
