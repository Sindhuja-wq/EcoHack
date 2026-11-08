import React from "react";
import Link from "next/link";
import { Leaf, ShieldCheck, Heart, Sparkles, BookOpen, AlertTriangle, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night flex justify-center">
      <div className="max-w-4xl w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Leaf className="w-4 h-4" />
            <span>Turn Waste Into Worth</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-emerald-950 dark:text-emerald-50 tracking-tight">
            About EcoHack
          </h1>
          <p className="text-sm sm:text-base text-emerald-950/70 dark:text-emerald-300/80 max-w-xl mx-auto">
            Empowering individuals and communities with AI vision intelligence to repurpose, repair, and divert everyday discards from landfills.
          </p>
        </div>

        {/* Mission Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft-lg space-y-4">
          <h2 className="text-2xl font-black text-emerald-950 dark:text-emerald-100">
            Our Purpose & Vision
          </h2>
          <p className="text-sm text-emerald-950/80 dark:text-emerald-200 leading-relaxed">
            Every year, over 2.12 billion tons of municipal solid waste are dumped globally. Less than 10% of single-use plastics are reprocessed into circular streams. Much of what is discarded into household trash cans could be repurposed into high-value household tools, organic garden fertility, or verified community recyclables.
          </p>
          <p className="text-sm text-emerald-950/80 dark:text-emerald-200 leading-relaxed">
            EcoHack bridges the gap between environmental good intentions and practical, hands-on execution. Using computer vision models and material classification algorithms, we diagnose discards and deliver immediate, safe, step-by-step upcycling blueprints.
          </p>
        </div>

        {/* Methodology Section */}
        <div id="methodology" className="p-8 sm:p-10 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft-lg space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h2 className="text-2xl font-black text-emerald-950 dark:text-emerald-100">
              Impact Assessment Methodology
            </h2>
          </div>
          <p className="text-xs text-emerald-900/60 dark:text-emerald-400">
            How EcoHack calculates and communicates environmental benefits without greenwashing.
          </p>

          <div className="space-y-4 text-xs text-emerald-950/80 dark:text-emerald-200 leading-relaxed">
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-night-hover/70 border border-emerald-500/15 space-y-1.5">
              <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                1. Transparent Physical Density Benchmarks
              </h4>
              <p>
                Estimated mass diversions (e.g., ~32g for a 500ml PET bottle, ~180g for an Amazon shipping box) are derived from EPA Municipal Solid Waste Characterization tables and UNEP packaging density indices. We never present speculative calculations as absolute facts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-night-hover/70 border border-emerald-500/15 space-y-1.5">
              <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                2. The 6-R Waste Hierarchy
              </h4>
              <p>
                Our recommendation engine prioritizes actions according to the internationally recognized waste hierarchy: Refuse &gt; Reduce &gt; Reuse &gt; Repair &gt; Recycle &gt; Rot (Compost). Crafting is only recommended when an item cannot be more safely repaired, donated, or cleanly recycled.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-night-hover/70 border border-emerald-500/15 space-y-1.5">
              <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                3. Smart Waste Disposal Guide
              </h4>
              <p>
                Municipal recycling rules vary by province, city, and sorting facility capabilities (MRFs). Our Smart Waste Disposal Guide provides safe, category-specific instructions for when reuse, repair, or recycling are unavailable, and clearly distinguishes between confirmed recyclables and items requiring local verification.
              </p>
            </div>
          </div>
        </div>

        {/* Safety Section */}
        <div id="safety" className="p-8 sm:p-10 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft-lg space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-2xl font-black text-emerald-950 dark:text-emerald-100">
              Maker & Household Safety Guidelines
            </h2>
          </div>
          <p className="text-xs text-emerald-900/60 dark:text-emerald-400">
            Ensure all upcycling activities are safe for you and your household.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-emerald-950/80 dark:text-emerald-200">
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 space-y-1">
              <span className="font-bold text-amber-900 dark:text-amber-300">Blade & Cutting Safety</span>
              <p>Always cut away from your body when slicing plastics or cardboard. Wear work gloves when handling broken glass or tin cans.</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 space-y-1">
              <span className="font-bold text-amber-900 dark:text-amber-300">Chemical & Food Purity</span>
              <p>Never repurpose containers that held motor oil, pesticides, or toxic solvents for plant food, edible herbs, or animal feeding.</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-night-hover/40 border border-emerald-500/15 space-y-1">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">Hygiene & Washing</span>
              <p>Wash containers with warm soapy water and allow them to fully dry before building organizers or planters to eliminate mold.</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-night-hover/40 border border-emerald-500/15 space-y-1">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">Electronic & Battery Care</span>
              <p>Do not puncture lithium-ion batteries. Deliver damaged electronics to certified e-waste drop-offs rather than disassembling at home.</p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center pt-4">
          <Link
            href="/scanner"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-soft"
          >
            <span>Try the AI Scanner Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
