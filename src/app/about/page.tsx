import React from "react";
import Link from "next/link";
import { Leaf, ShieldCheck, Heart, Sparkles, BookOpen, AlertTriangle, ArrowRight, Scan } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="w-full min-h-[calc(100vh-68px)] py-12 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-darktext flex justify-center relative overflow-hidden transition-colors">
      {/* Background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-96 bg-emerald-500/10 dark:bg-[#43E6A1]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl w-full space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-semibold uppercase tracking-wider">
            <Leaf className="w-4 h-4 text-forest dark:text-emeraldaccent" />
            <span>Turn Waste Into Its Next Possibility</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-charcoal dark:text-darktext">
            About EcoHack
          </h1>
          <p className="text-sm sm:text-base text-charcoal/70 dark:text-darktext-secondary max-w-xl mx-auto">
            Empowering individuals and communities with AI vision intelligence to repurpose, repair, and divert everyday discards from landfills.
          </p>
        </div>

        {/* Mission Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-4 transition-colors">
          <h2 className="text-2xl font-black font-heading text-charcoal dark:text-darktext">
            Our Purpose & Vision
          </h2>
          <p className="text-sm text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
            Every year, over 2.12 billion tons of municipal solid waste are dumped globally. Less than 10% of single-use plastics are reprocessed into circular streams. Much of what is discarded into household trash cans could be repurposed into high-value household tools, organic garden fertility, or verified community recyclables.
          </p>
          <p className="text-sm text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
            EcoHack bridges the gap between environmental good intentions and practical, hands-on execution. Using computer vision models and material classification algorithms, we diagnose discards and deliver immediate, safe, step-by-step upcycling blueprints.
          </p>
        </div>

        {/* Methodology Section */}
        <div id="methodology" className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-6 transition-colors">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-forest dark:text-emeraldaccent" />
            <h2 className="text-2xl font-black font-heading text-charcoal dark:text-darktext">
              Impact Assessment Methodology
            </h2>
          </div>
          <p className="text-xs text-charcoal/60 dark:text-darktext-muted">
            How EcoHack calculates and communicates environmental benefits without greenwashing.
          </p>

          <div className="space-y-4 text-xs text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1.5 transition-colors">
              <h4 className="font-bold text-sm font-heading text-charcoal dark:text-darktext">
                1. Transparent Physical Density Benchmarks
              </h4>
              <p>
                Estimated mass diversions (e.g., ~32g for a 500ml PET bottle, ~180g for an Amazon shipping box) are derived from EPA Municipal Solid Waste Characterization tables and UNEP packaging density indices. We never present speculative calculations as absolute facts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1.5 transition-colors">
              <h4 className="font-bold text-sm font-heading text-charcoal dark:text-darktext">
                2. The 6-R Waste Hierarchy
              </h4>
              <p>
                Our recommendation engine prioritizes actions according to the internationally recognized waste hierarchy: Refuse &gt; Reduce &gt; Reuse &gt; Repair &gt; Recycle &gt; Rot (Compost). Crafting is only recommended when an item cannot be more safely repaired, donated, or cleanly recycled.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1.5 transition-colors">
              <h4 className="font-bold text-sm font-heading text-charcoal dark:text-darktext">
                3. Smart Waste Disposal Guide
              </h4>
              <p>
                Municipal recycling rules vary by province, city, and sorting facility capabilities (MRFs). Our Smart Waste Disposal Guide provides safe, category-specific instructions for when reuse, repair, or recycling are unavailable, and clearly distinguishes between confirmed recyclables and items requiring local verification.
              </p>
            </div>
          </div>
        </div>

        {/* Safety Section */}
        <div id="safety" className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-4 transition-colors">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-forest dark:text-emeraldaccent" />
            <h2 className="text-2xl font-black font-heading text-charcoal dark:text-darktext">
              Maker & Household Safety Guidelines
            </h2>
          </div>
          <p className="text-xs text-charcoal/60 dark:text-darktext-muted">
            Ensure all upcycling activities are safe for you and your household.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal/70 dark:text-darktext-secondary">
            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
              <span className="font-bold text-forest dark:text-emeraldaccent">Blade & Cutting Safety</span>
              <p>Always cut away from your body when slicing plastics or cardboard. Wear work gloves when handling broken glass or tin cans.</p>
            </div>
            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
              <span className="font-bold text-terra dark:text-[#E07A5F]">Chemical & Food Purity</span>
              <p>Never repurpose containers that held motor oil, pesticides, or toxic solvents for plant food, edible herbs, or animal feeding.</p>
            </div>
            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
              <span className="font-bold text-forest dark:text-emeraldaccent-light">Hygiene & Washing</span>
              <p>Wash containers with warm soapy water and allow them to fully dry before building organizers or planters to eliminate mold.</p>
            </div>
            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
              <span className="font-bold text-terra dark:text-[#E07A5F]">Electronic & Battery Care</span>
              <p>Do not puncture lithium-ion batteries. Deliver damaged electronics to certified e-waste drop-offs rather than disassembling at home.</p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center pt-4">
          <Link
            href="/scanner"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover text-white dark:text-night font-bold text-sm shadow-glow transition-all"
          >
            <Scan className="w-4 h-4" />
            <span>Launch AI Scanner</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
