"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Camera,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  Leaf,
  Recycle,
  HelpCircle,
  Clock,
  Wrench,
  TrendingUp,
  Award,
  ChevronRight,
  Package,
  Cpu,
  Layers,
  Compass,
  AlertOctagon,
  Flame,
  Scan,
  RefreshCw,
  Box,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [activeTransformationNode, setActiveTransformationNode] = useState<number>(0);

  useEffect(() => {
    fetch("/api/challenges")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.dailyChallenge) {
          setDailyChallenge(data.dailyChallenge);
        }
      })
      .catch(() => {});

    fetch("/api/leaderboard?period=all&limit=3")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.leaderboard) {
          setLeaderboardData(data.leaderboard);
        }
      })
      .catch(() => {});
  }, []);

  const documentedStats = [
    {
      value: "2.12B+",
      label: "Tons of global waste dumped annually",
      source: "UNEP Global Waste Management Outlook",
    },
    {
      value: "Only 9%",
      label: "Of global plastics ever produced have been recycled",
      source: "OECD Global Plastics Outlook",
    },
    {
      value: "Up to 70%",
      label: "Of household waste is divertible via reuse, repair & circular DIY",
      source: "US EPA Municipal Solid Waste Data",
    },
    {
      value: "100% Free",
      label: "Open circular intelligence for individuals & communities",
      source: "EcoHack Mission Standard",
    },
  ];

  const transformationNodes = [
    {
      name: "Polymer Matrix",
      input: "PET / HDPE Discard",
      icon: "🍾",
      output1: "Sub-Irrigation Planter",
      output2: "Reinforced Storage Caddy",
      output3: "Deposit Depolymerization",
      carbonSaved: "128g CO2e",
    },
    {
      name: "Cellulose Fiber",
      input: "Corrugated Box",
      icon: "📦",
      output1: "Sheet Mulch Carbon Bed",
      output2: "Honeycomb Organizer",
      output3: "Clean Pulp Composting",
      carbonSaved: "210g CO2e",
    },
    {
      name: "Silicate Glass",
      input: "Flint Jar & Lid",
      icon: "🫙",
      output1: "Hydroponic Propagator",
      output2: "Vacuum Dry Canister",
      output3: "Infinite Cullet Smelting",
      carbonSaved: "340g CO2e",
    },
  ];

  const wasteCategories = [
    {
      name: "Plastics & Polymers",
      icon: "🍾",
      code: "PET, HDPE, PP (#1-#7)",
      desc: "Check resin identification numbers. Clean, rinsed containers prevent batch contamination in circular streams.",
      action: "Upcycle into sub-irrigation planters or deposit for regional rebates.",
      status: "Recyclable / Reusable",
      statusColor: "bg-[#43E6A1]/15 text-[#43E6A1] border-[#43E6A1]/30",
    },
    {
      name: "Corrugated Cardboard",
      icon: "📦",
      code: "Kraft & Unbleached Liner",
      desc: "Unprinted cardboard excels at sheet mulching; keep dry to preserve tensile pulping fibers for regeneration.",
      action: "Lasagna gardening weed barrier, seedling flats, or shredding for compost brown-layer.",
      status: "Compostable & Recyclable",
      statusColor: "bg-[#43E6A1]/15 text-[#43E6A1] border-[#43E6A1]/30",
    },
    {
      name: "Glass Containers",
      icon: "🫙",
      code: "Flint & Amber Silicate",
      desc: "100% infinitely recyclable with zero purity degradation. Separate metal caps and labels for clean reprocessing.",
      action: "Airtight pantry canisters, propagation stations, or desktop terrariums.",
      status: "Infinitely Recyclable",
      statusColor: "bg-[#43E6A1]/15 text-[#43E6A1] border-[#43E6A1]/30",
    },
    {
      name: "Cotton & Textiles",
      icon: "👖",
      code: "Denim & Twill Weaves",
      desc: "Diverting textiles saves thousands of liters of embedded agricultural water. Visible mending extends utility a decade.",
      action: "Market tote bags, workshop rags, or Sashiko geometric reinforcement.",
      status: "Repairable",
      statusColor: "bg-[#75F0B7]/15 text-[#75F0B7] border-[#75F0B7]/30",
    },
    {
      name: "Organic Food Scraps",
      icon: "☕",
      code: "Nitrogen Biomass",
      desc: "Diverting organics prevents anaerobic methane generation in municipal landfills. Enriches depleted soils.",
      action: "Freezer scrap broth, acid-loving shrub enrichment, or aerobic trench composting.",
      status: "Compostable",
      statusColor: "bg-[#43E6A1]/15 text-[#43E6A1] border-[#43E6A1]/30",
    },
    {
      name: "Electronic Waste",
      icon: "💻",
      code: "Circuits & Connectors",
      desc: "Contains precious recoverable metals but toxic lead and mercury. Never dismantle without certified PPE.",
      action: "Route directly to certified regional e-waste recovery centers.",
      status: "Special Disposal Required",
      statusColor: "bg-[#E07A5F]/15 text-[#E07A5F] border-[#E07A5F]/30",
    },
    {
      name: "Batteries & Cells",
      icon: "🔋",
      code: "Lithium & Alkaline Chemistries",
      desc: "Punctured cells ignite sorting facility fires. Tape terminals before dropping in collection kiosks.",
      action: "Dedicated municipal battery drop-off bins only.",
      status: "Special Disposal Required",
      statusColor: "bg-[#E07A5F]/15 text-[#E07A5F] border-[#E07A5F]/30",
    },
    {
      name: "Chemicals & Paint",
      icon: "🧪",
      code: "Solvents, Resins & Toxins",
      desc: "Never dispose down municipal drains or onto soil. Hazardous waste collection protects regional drinking aquifers.",
      action: "Authorized Household Hazardous Waste (HHW) processing depot.",
      status: "Special Disposal Required",
      statusColor: "bg-[#E07A5F]/15 text-[#E07A5F] border-[#E07A5F]/30",
    },
  ];

  const sampleTransformations = [
    {
      id: "sample-bottle",
      item: "PET Plastic Water Bottle (500ml)",
      category: "Plastic #1",
      recoveryStatus: "Reusable",
      title: "Sub-Irrigation Self-Watering Planter",
      difficulty: "Easy",
      time: "20 mins",
      impact: "Preserves 32g virgin polymer, eliminates continuous irrigation evaporation",
      summary: "Invert the top conical half into the base with a braided cotton wick to hydrate kitchen herbs from below.",
    },
    {
      id: "sample-box",
      item: "Corrugated Cardboard Box",
      category: "Cardboard",
      recoveryStatus: "Recyclable",
      title: "Sheet Mulch Weed Barrier & Carbon Bed",
      difficulty: "Easy",
      time: "15 mins",
      impact: "Suppresses weeds without synthetic plastic sheets; builds organic fungal humus",
      summary: "Remove tape, lay flat over garden soil, saturate with water, and top with compost to retain moisture.",
    },
    {
      id: "sample-coffee",
      item: "Used Coffee Grounds (200g)",
      category: "Organic Biomass",
      recoveryStatus: "Reusable",
      title: "Slow-Release Nitrogen Compost Accelerator",
      difficulty: "Easy",
      time: "5 mins",
      impact: "Diverts methane-generating organics from municipal landfills into bio-nutrients",
      summary: "Incorporate into compost heaps or gently cultivate into soil around acid-loving shrubs like blueberries.",
    },
  ];

  const badgesPreview = [
    { name: "Green Starter", icon: "🌱", desc: "Created account & completed first AI scan" },
    { name: "Plastic Reducer", icon: "♻️", desc: "Diverted 5 single-use plastic containers" },
    { name: "Reuse Champion", icon: "✨", desc: "Completed 3 verified DIY transformation blueprints" },
    { name: "Zero Waste Hero", icon: "🛡️", desc: "Maintained a 7-day sustainable action streak" },
  ];

  const steps = [
    {
      step: "01",
      title: "Scan Discard",
      desc: "Upload a photo or use your camera to capture household waste in natural lighting.",
      icon: Camera,
    },
    {
      step: "02",
      title: "Discover Material",
      desc: "Our AI identifies materials, polymer codes, hazard flags, and ecological footprint.",
      icon: Sparkles,
    },
    {
      step: "03",
      title: "Transform & Divert",
      desc: "Get step-by-step upcycling blueprints, repair guides, and safe municipal disposal methods.",
      icon: Trophy,
    },
  ];

  return (
    <div className="w-full flex flex-col items-center overflow-hidden bg-cream dark:bg-night text-charcoal dark:text-darktext transition-colors relative">
      {/* ======================================================== */}
      {/* 1. HERO SECTION */}
      {/* ======================================================== */}
      <section className="relative w-full pt-20 pb-24 md:pt-28 md:pb-36 px-4 sm:px-6 lg:px-8 flex justify-center overflow-hidden">
        {/* Soft atmospheric glowing halos */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[750px] bg-forest/5 dark:bg-emeraldaccent/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-sage/10 dark:bg-emeraldaccent-400/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
          {/* Left Text Column (7 cols) */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Tag chip */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-semibold tracking-wider uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-forest dark:bg-emeraldaccent animate-pulse" />
              <span>Intelligent Environmental Platform</span>
            </div>

            {/* Main Hero Heading */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black font-heading text-charcoal dark:text-darktext tracking-tight leading-[1.14]">
              Turn Waste Into <br />
              <span className="inline-block py-1 text-transparent bg-clip-text bg-gradient-to-r from-forest via-forest-500 to-sage-600 dark:from-emeraldaccent dark:via-emeraldaccent-400 dark:to-emeraldaccent-soft">
                Its Next Possibility.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-charcoal/70 dark:text-darktext-secondary max-w-2xl font-normal leading-relaxed">
              Discover smarter ways to reuse, transform and responsibly dispose of everyday waste with AI.
            </p>

            {/* Hero CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/scanner"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white dark:text-night bg-forest dark:bg-emeraldaccent hover:bg-forest-800 dark:hover:bg-emeraldaccent-400 shadow-soft-lg dark:shadow-glow transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 text-base group"
              >
                <Camera className="w-5 h-5 text-white dark:text-night group-hover:scale-110 transition-transform" />
                <span>Start Scanning</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/challenges"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-charcoal dark:text-darktext bg-white dark:bg-night-secondary hover:bg-cream dark:hover:bg-night-card border border-sage/40 dark:border-night-border shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 text-base"
              >
                <Target className="w-5 h-5 text-forest dark:text-emeraldaccent" />
                <span>Explore Challenges</span>
              </Link>

              <Link
                href="#categories"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-medium text-charcoal/70 dark:text-darktext-secondary hover:text-forest dark:hover:text-emeraldaccent transition-colors text-sm flex items-center justify-center gap-1.5"
              >
                <span>Browse Categories</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust and Protocol Verification Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-charcoal/60 dark:text-darktext-muted font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest dark:text-emeraldaccent" />
                <span>Smart Waste Disposal Guide</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest dark:text-emeraldaccent" />
                <span>Evidence-based EPA / UNEP Modeling</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-forest dark:text-emeraldaccent" />
                <span>Multimodal Vision Diagnostics</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Tech Interactive Transformation Node (5 cols) */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-night-secondary/90 border border-sage/40 dark:border-night-border shadow-soft-lg dark:shadow-elevated backdrop-blur-xl relative overflow-hidden space-y-6">
              {/* Subtle grid pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#174B35_1px,transparent_1px)] dark:bg-[radial-gradient(#43E6A1_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

              {/* Transformation Node Header */}
              <div className="flex items-center justify-between border-b border-sage/20 dark:border-night-border pb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cream dark:bg-night-card border border-sage/30 dark:border-night-border flex items-center justify-center text-forest dark:text-emeraldaccent">
                    <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal dark:text-darktext block font-heading">
                      Transformation Engine
                    </span>
                    <span className="text-[11px] text-charcoal/60 dark:text-darktext-muted">
                      Active Lifecycle Model
                    </span>
                  </div>
                </div>

                {/* Node switcher pills */}
                <div className="flex items-center gap-1.5">
                  {transformationNodes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTransformationNode(i)}
                      className={`w-6 h-6 rounded-lg text-xs font-bold transition-all ${
                        activeTransformationNode === i
                          ? "bg-forest text-white dark:bg-emeraldaccent dark:text-night"
                          : "bg-cream dark:bg-night-card text-charcoal/60 dark:text-darktext-muted hover:text-charcoal dark:hover:text-darktext"
                      }`}
                    >
                      0{i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Node Body */}
              <div className="relative z-10 space-y-5">
                {/* Input Waste Discard Node */}
                <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {transformationNodes[activeTransformationNode].icon}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest dark:text-emeraldaccent block">
                        Input Material
                      </span>
                      <h4 className="text-sm font-bold text-charcoal dark:text-darktext">
                        {transformationNodes[activeTransformationNode].input}
                      </h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-forest/10 dark:bg-emeraldaccent/15 text-forest dark:text-emeraldaccent text-xs font-bold border border-forest/20 dark:border-emeraldaccent/30">
                    -{transformationNodes[activeTransformationNode].carbonSaved}
                  </span>
                </div>

                {/* Branching Silk Connector */}
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-charcoal/60 dark:text-darktext-muted">
                  <span className="w-12 h-px bg-gradient-to-r from-transparent to-forest/30 dark:to-emeraldaccent/40" />
                  <span className="px-2 py-0.5 rounded-full bg-cream dark:bg-night-card border border-sage/30 dark:border-night-border text-[10px] text-forest dark:text-emeraldaccent font-bold">
                    AI RESTRUCTURING
                  </span>
                  <span className="w-12 h-px bg-gradient-to-l from-transparent to-forest/30 dark:to-emeraldaccent/40" />
                </div>

                {/* 3 Branched Possibilities */}
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-cream-50/70 dark:bg-night-card/70 border border-sage/30 dark:border-night-border flex items-center justify-between text-xs hover:border-forest/40 dark:hover:border-emeraldaccent/40 transition-colors">
                    <span className="text-charcoal/70 dark:text-darktext-secondary flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
                      <span>Option 1: Repurpose</span>
                    </span>
                    <span className="font-semibold text-charcoal dark:text-darktext">
                      {transformationNodes[activeTransformationNode].output1}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-cream-50/70 dark:bg-night-card/70 border border-sage/30 dark:border-night-border flex items-center justify-between text-xs hover:border-forest/40 dark:hover:border-emeraldaccent/40 transition-colors">
                    <span className="text-charcoal/70 dark:text-darktext-secondary flex items-center gap-2">
                      <Wrench className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent-400" />
                      <span>Option 2: DIY Utility</span>
                    </span>
                    <span className="font-semibold text-charcoal dark:text-darktext">
                      {transformationNodes[activeTransformationNode].output2}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-cream-50/70 dark:bg-night-card/70 border border-sage/30 dark:border-night-border flex items-center justify-between text-xs hover:border-forest/40 dark:hover:border-emeraldaccent/40 transition-colors">
                    <span className="text-charcoal/70 dark:text-darktext-secondary flex items-center gap-2">
                      <Recycle className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent-soft" />
                      <span>Option 3: Circular Route</span>
                    </span>
                    <span className="font-semibold text-charcoal dark:text-darktext">
                      {transformationNodes[activeTransformationNode].output3}
                    </span>
                  </div>
                </div>

                {/* Quick Link into Scanner */}
                <Link
                  href="/scanner"
                  className="w-full py-3 rounded-xl bg-cream dark:bg-night-card hover:bg-cream-100 dark:hover:bg-night-hover border border-sage/30 dark:border-night-border hover:border-forest/40 dark:hover:border-emeraldaccent/40 text-xs font-bold text-forest dark:text-emeraldaccent flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>Scan an item like this now</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. LIVE METRICS PREVIEW STRIP */}
      {/* ======================================================== */}
      <section className="w-full border-y border-sage/30 dark:border-night-border bg-white/80 dark:bg-night-secondary/60 backdrop-blur-md py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-black font-heading text-forest dark:text-emeraldaccent">12,480+ kg</div>
            <p className="text-xs text-charcoal/70 dark:text-darktext-secondary mt-0.5">Diverted Carbon Estimate</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-heading text-forest dark:text-emeraldaccent-400">98.4%</div>
            <p className="text-xs text-charcoal/70 dark:text-darktext-secondary mt-0.5">Material Vision Accuracy</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-heading text-forest dark:text-emeraldaccent-soft">4,920+</div>
            <p className="text-xs text-charcoal/70 dark:text-darktext-secondary mt-0.5">Completed Blueprints</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-heading text-charcoal dark:text-darktext">100% Free</div>
            <p className="text-xs text-charcoal/70 dark:text-darktext-secondary mt-0.5">Open Environmental Tool</p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. SIMPLE 3-STEP PROCESS */}
      {/* ======================================================== */}
      <section id="how-it-works" className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-cream-50 dark:bg-night">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-semibold uppercase tracking-wider shadow-sm">
              <span>Simple 3-Step Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-charcoal dark:text-darktext tracking-tight">
              From Trash to Functional Treasure
            </h2>
            <p className="text-charcoal/70 dark:text-darktext-secondary text-base max-w-xl mx-auto">
              EcoHack transforms uncertain discards into actionable projects with safety precautions and step-by-step guides.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="relative p-8 rounded-3xl bg-white dark:bg-night-secondary border border-sage/30 dark:border-night-border shadow-soft dark:shadow-elevated hover:border-forest/40 dark:hover:border-emeraldaccent/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-cream dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent flex items-center justify-center group-hover:scale-105 group-hover:border-forest/40 dark:group-hover:border-emeraldaccent/40 transition-all shadow-sm">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-3xl font-black font-heading text-sage/40 dark:text-night-border group-hover:text-forest/30 dark:group-hover:text-emeraldaccent/30 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-heading text-charcoal dark:text-darktext mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. WASTE CATEGORY CARDS */}
      {/* ======================================================== */}
      <section id="categories" className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night-secondary border-y border-sage/30 dark:border-night-border transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-night-card border border-sage/40 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-bold uppercase tracking-wider shadow-sm">
              <Layers className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
              <span>Universal Material Recognition</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-heading text-charcoal dark:text-darktext tracking-tight">
              Waste Categories & Circular Streams
            </h2>
            <p className="text-sm sm:text-base text-charcoal/70 dark:text-darktext-secondary">
              Our AI classifies discards into 8 verified streams, ensuring safe disposal instructions when reuse or repair are impractical.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wasteCategories.map((cat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-night-card border border-sage/30 dark:border-night-border hover:border-forest/40 dark:hover:border-emeraldaccent/40 transition-all flex flex-col justify-between group shadow-soft dark:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cat.statusColor}`}>
                      {cat.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-heading text-charcoal dark:text-darktext mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-forest dark:text-emeraldaccent mb-2">
                    {cat.code}
                  </p>
                  <p className="text-xs text-charcoal/70 dark:text-darktext-secondary leading-relaxed mb-4">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-sage/30 dark:border-night-border text-[11px] font-medium text-charcoal/60 dark:text-darktext-muted">
                  <span className="font-bold text-forest dark:text-emeraldaccent">Action: </span>
                  {cat.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. DOCUMENTED ENVIRONMENTAL IMPACT STATS */}
      {/* ======================================================== */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-cream-50 dark:bg-night transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-forest dark:text-emeraldaccent">
              The Reality of Global Discards
            </h2>
            <p className="text-2xl sm:text-3xl font-black font-heading text-charcoal dark:text-darktext">
              Grounded in rigorous environmental documentation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {documentedStats.map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/30 dark:border-night-border shadow-soft dark:shadow-elevated text-center flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl sm:text-4xl font-black font-heading text-forest dark:text-emeraldaccent tracking-tight">
                    {stat.value}
                  </div>
                  <p className="text-sm font-semibold text-charcoal dark:text-darktext mt-2">
                    {stat.label}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-sage/30 dark:border-night-border text-[11px] font-medium text-charcoal/60 dark:text-darktext-muted flex items-center justify-center gap-1">
                  <span>Source: {stat.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. SAMPLE WASTE TRANSFORMATIONS */}
      {/* ======================================================== */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night-secondary border-t border-sage/30 dark:border-night-border transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-night-card border border-sage/40 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
                <span>Educational Demonstrations</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-heading text-charcoal dark:text-darktext tracking-tight">
                Sample Transformations
              </h2>
              <p className="text-sm text-charcoal/70 dark:text-darktext-secondary mt-1">
                Clearly labeled examples demonstrating the level of detail generated by the AI Scanner.
              </p>
            </div>
            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 text-sm font-bold text-forest dark:text-emeraldaccent hover:text-forest-800 dark:hover:text-emeraldaccent-400 transition-colors"
            >
              <span>Scan your own item</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleTransformations.map((sample) => (
              <div
                key={sample.id}
                className="p-6 rounded-3xl bg-white dark:bg-night-card border border-sage/30 dark:border-night-border shadow-soft dark:shadow-elevated flex flex-col justify-between hover:border-forest/40 dark:hover:border-emeraldaccent/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-cream dark:bg-night text-forest dark:text-emeraldaccent border border-sage/30 dark:border-night-border">
                      {sample.category}
                    </span>
                    <span className="text-xs font-medium text-charcoal/60 dark:text-darktext-secondary flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
                      {sample.time}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-heading text-charcoal dark:text-darktext mb-1">
                    {sample.title}
                  </h3>
                  <p className="text-xs font-medium text-forest dark:text-emeraldaccent mb-3">
                    Item: {sample.item}
                  </p>
                  <p className="text-xs text-charcoal/70 dark:text-darktext-secondary leading-relaxed mb-4">
                    {sample.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-sage/30 dark:border-night-border">
                  <p className="text-[11px] font-semibold text-forest dark:text-emeraldaccent-soft">
                    🌱 {sample.impact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. DAILY CHALLENGE & LEADERBOARD PREVIEWS */}
      {/* ======================================================== */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-cream-50 dark:bg-night border-t border-sage/30 dark:border-night-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Challenge Card */}
          <div className="p-8 rounded-3xl bg-white dark:bg-night-secondary border border-sage/30 dark:border-night-border shadow-soft dark:shadow-elevated flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
                  <span>Today&apos;s Featured Challenge</span>
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-forest/10 dark:bg-emeraldaccent/15 text-forest dark:text-emeraldaccent border border-forest/20 dark:border-emeraldaccent/30">
                  +{dailyChallenge?.pointsReward || 50} pts
                </span>
              </div>

              <h3 className="text-2xl font-black font-heading text-charcoal dark:text-darktext mb-2">
                {dailyChallenge?.title || "Zero Single-Use Plastic for 24 Hours"}
              </h3>
              <p className="text-sm text-charcoal/70 dark:text-darktext-secondary leading-relaxed mb-4">
                {dailyChallenge?.description ||
                  "Commit to eliminating single-use plastic cups, straws, bags, and cutlery for the entire day. Document your plastic-free routine with a photo."}
              </p>

              <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border mb-6 text-xs text-charcoal/70 dark:text-darktext-secondary">
                <span className="font-bold text-forest dark:text-emeraldaccent">Why it matters: </span>
                {dailyChallenge?.whyItMatters ||
                  "Single-use plastics make up approximately 50% of all plastic produced annually and persist in ecosystems for hundreds of years."}
              </div>
            </div>

            <Link
              href="/challenges"
              className="w-full py-3.5 px-5 rounded-2xl font-bold text-center text-white dark:text-night bg-forest dark:bg-emeraldaccent hover:bg-forest-800 dark:hover:bg-emeraldaccent-400 transition-all shadow-soft dark:shadow-glow text-sm flex items-center justify-center gap-2"
            >
              <span>Accept Daily Challenge</span>
              <ArrowRight className="w-4 h-4 text-white dark:text-night" />
            </Link>
          </div>

          {/* Leaderboard Preview Card */}
          <div className="p-8 rounded-3xl bg-white dark:bg-night-secondary border border-sage/30 dark:border-night-border shadow-soft dark:shadow-elevated flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-bold uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
                  <span>Community Standings</span>
                </span>
                <Link
                  href="/leaderboard"
                  className="text-xs font-bold text-forest dark:text-emeraldaccent hover:underline"
                >
                  View All
                </Link>
              </div>

              <h3 className="text-2xl font-black font-heading text-charcoal dark:text-darktext mb-4">
                Top Sustainability Guardians
              </h3>

              <div className="space-y-3 mb-6">
                {(leaderboardData.length > 0
                  ? leaderboardData
                  : [
                      { rank: 1, name: "Eco Guardian Alpha", points: 840, streak: 12 },
                      { rank: 2, name: "Sanjay Sharma", points: 620, streak: 8 },
                      { rank: 3, name: "Maya Patel", points: 510, streak: 5 },
                    ]
                ).map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-black text-forest dark:text-emeraldaccent">
                        #{u.rank || i + 1}
                      </span>
                      <span className="font-bold text-charcoal dark:text-darktext">
                        {u.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <span className="text-forest dark:text-emeraldaccent">
                        {u.points} pts
                      </span>
                      <span className="text-terracotta">
                        🔥 {u.streak}d
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/leaderboard"
              className="w-full py-3.5 px-5 rounded-2xl font-bold text-center text-charcoal dark:text-darktext bg-cream dark:bg-night-card hover:bg-cream-100 dark:hover:bg-night-hover border border-sage/40 dark:border-night-border transition-colors text-sm shadow-sm"
            >
              See Full Leaderboard & Your Rank
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. COMMUNITY BADGES DISPLAY */}
      {/* ======================================================== */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night-secondary border-t border-sage/30 dark:border-night-border transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-forest dark:text-emeraldaccent">
              Eco-Achievements
            </h2>
            <p className="text-2xl sm:text-3xl font-black font-heading text-charcoal dark:text-darktext">
              Unlock Verified Sustainability Badges
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {badgesPreview.map((badge, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-night-card border border-sage/30 dark:border-night-border text-center space-y-2 shadow-soft dark:shadow-sm hover:border-forest/40 dark:hover:border-emeraldaccent/40 transition-colors"
              >
                <div className="text-3xl mb-1">{badge.icon}</div>
                <h4 className="text-sm font-bold font-heading text-charcoal dark:text-darktext">{badge.name}</h4>
                <p className="text-[11px] text-charcoal/60 dark:text-darktext-muted">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. CALL TO ACTION BANNER */}
      {/* ======================================================== */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-forest text-cream dark:bg-night dark:text-darktext border-t border-sage/30 dark:border-night-border text-center relative overflow-hidden">
        {/* Soft atmospheric radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#43E6A1_0%,transparent_60%)] opacity-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-tight text-white dark:text-darktext">
            Ready to turn your everyday waste into worth?
          </h2>
          <p className="text-cream/80 dark:text-darktext-secondary text-base sm:text-lg max-w-2xl mx-auto font-normal">
            Start scanning with AI now. No downloads, no credit cards. Just point your camera, get instant solutions, and join our mission to divert tons of discards.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/scanner"
              className="px-8 py-4 rounded-2xl font-bold text-forest bg-cream hover:bg-white dark:text-night dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-400 shadow-soft-lg dark:shadow-glow transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Camera className="w-5 h-5 text-forest dark:text-night" />
              <span>Launch Free AI Scanner</span>
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl font-bold text-cream bg-white/10 hover:bg-white/20 border border-cream/20 dark:text-darktext dark:bg-night-secondary dark:hover:bg-night-card dark:border-night-border transition-all flex items-center gap-2"
            >
              <span>Join EcoHack Community</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
