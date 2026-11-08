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
} from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedTreeIllustration } from "@/components/AnimatedTreeIllustration";

export default function LandingPage() {
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

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
      label: "Of typical household waste is divertible via reuse, repair, & composting",
      source: "US EPA Municipal Solid Waste Data",
    },
    {
      value: "100% Free",
      label: "Open circular intelligence for individuals & communities",
      source: "EcoHack Mission Standard",
    },
  ];

  const wasteCategories = [
    {
      name: "Plastics & Polymers",
      icon: "🍾",
      code: "PET, HDPE, PP",
      desc: "Check resin identification numbers (#1-#7). Clean, rinsed containers prevent batch contamination.",
      action: "Upcycle into planters or deposit for cash rebates.",
      status: "Recyclable / Reusable",
      statusColor: "bg-forest/15 text-forest dark:text-limeaccent",
    },
    {
      name: "Corrugated Cardboard",
      icon: "📦",
      code: "Fiberboard & Kraft",
      desc: "Unprinted cardboard excels at sheet mulching; keep clean and dry to preserve pulping fibers.",
      action: "Lasagna gardening weed barrier or cat scratchers.",
      status: "Compostable & Recyclable",
      statusColor: "bg-forest/15 text-forest dark:text-limeaccent",
    },
    {
      name: "Glass Containers",
      icon: "🫙",
      code: "Flint & Amber Silicate",
      desc: "100% infinitely recyclable without quality loss. Handle broken glass with protective wrapping.",
      action: "Airtight pantry canisters or desktop terrariums.",
      status: "Infinitely Recyclable",
      statusColor: "bg-forest/15 text-forest dark:text-limeaccent",
    },
    {
      name: "Cotton & Textiles",
      icon: "👖",
      code: "Denim & Twill",
      desc: "Bypasses thousands of liters of agricultural water. Visible mending extends utility for a decade.",
      action: "Market tote bags, shop rags, or Sashiko mending.",
      status: "Repairable",
      statusColor: "bg-forest/15 text-forest dark:text-limeaccent",
    },
    {
      name: "Organic Food Scraps",
      icon: "☕",
      code: "Nitrogen Biomass",
      desc: "Prevents methane generation in landfills. Enriches depleted soil with organic humus.",
      action: "Freezer scrap broth or trench composting.",
      status: "Compostable",
      statusColor: "bg-forest/15 text-forest dark:text-limeaccent",
    },
    {
      name: "Electronic Waste",
      icon: "💻",
      code: "E-Waste & Circuits",
      desc: "Contains valuable copper and gold but hazardous lead and mercury. Never dismantle without certification.",
      action: "Route to authorized certified e-waste recyclers.",
      status: "Special Disposal Required",
      statusColor: "bg-terracotta/15 text-terracotta-800 dark:text-terracotta-200",
    },
    {
      name: "Batteries & Cells",
      icon: "🔋",
      code: "Lithium & Alkaline",
      desc: "Punctured cells ignite truck and sorting facility fires. Tape terminals before dropping in drop-boxes.",
      action: "Dedicated battery drop-off bins only.",
      status: "Special Disposal Required",
      statusColor: "bg-terracotta/15 text-terracotta-800 dark:text-terracotta-200",
    },
    {
      name: "Chemicals & Paint",
      icon: "🧪",
      code: "Solvents & Toxins",
      desc: "Never pour down drains, toilets, or soil. Hazardous waste collection protects drinking aquifers.",
      action: "Municipal Household Hazardous Waste (HHW) depot.",
      status: "Special Disposal Required",
      statusColor: "bg-terracotta/15 text-terracotta-800 dark:text-terracotta-200",
    },
  ];

  const sampleTransformations = [
    {
      id: "sample-bottle",
      item: "PET Plastic Water Bottle (500ml)",
      category: "Plastic #1",
      recoveryStatus: "Reusable",
      title: "Sub-Irrigation Self-Watering Herb Planter",
      difficulty: "Easy",
      time: "20 mins",
      impact: "Preserves 32g virgin polymer, eliminates continuous irrigation evaporation",
      summary: "Invert the top half into the base with a cotton wick to automatically hydrate kitchen herbs from below.",
    },
    {
      id: "sample-box",
      item: "Corrugated Cardboard Shipping Box",
      category: "Cardboard",
      recoveryStatus: "Recyclable",
      title: "Sheet Mulch Weed Barrier & Carbon Layer",
      difficulty: "Easy",
      time: "15 mins",
      impact: "Suppresses weeds without synthetic plastic tarps; builds organic soil microbial health",
      summary: "Remove tape, lay flat over garden soil, dampen, and top with compost to retain moisture.",
    },
    {
      id: "sample-coffee",
      item: "Used Coffee Grounds (200g)",
      category: "Organic Discard",
      recoveryStatus: "Reusable",
      title: "Slow-Release Nitrogen Compost Booster",
      difficulty: "Easy",
      time: "5 mins",
      impact: "Diverts methane-generating organics from municipal landfills into garden nitrogen",
      summary: "Mix into compost bins or gently rake around acid-loving shrubs like blueberries and hydrangeas.",
    },
  ];

  const badgesPreview = [
    { name: "Green Starter", icon: "🌱", desc: "Created account & completed first scan" },
    { name: "Plastic Reducer", icon: "♻️", desc: "Diverted 5 single-use plastic containers" },
    { name: "Reuse Champion", icon: "✨", desc: "Successfully completed 3 DIY blueprints" },
    { name: "Zero Waste Hero", icon: "🛡️", desc: "Maintained a 7-day sustainable quest streak" },
  ];

  const steps = [
    {
      step: "01",
      title: "Snap or Upload Discard",
      desc: "Point your phone camera at any packaging, container, worn garment, or household discard.",
      icon: Camera,
    },
    {
      step: "02",
      title: "Get AI Solutions & Disposal Guide",
      desc: "Our vision model identifies materials, flags safety concerns, and generates verified DIY blueprints and disposal routes.",
      icon: Sparkles,
    },
    {
      step: "03",
      title: "Take Action & Earn Eco-Points",
      desc: "Complete upcycling projects, submit proof, unlock badges, and track your divertible carbon reduction.",
      icon: Trophy,
    },
  ];

  return (
    <div className="w-full flex flex-col items-center overflow-hidden bg-cream dark:bg-night text-charcoal dark:text-cream transition-colors">
      {/* ======================================================== */}
      {/* 1. HERO SECTION */}
      {/* ======================================================== */}
      <section className="relative w-full pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night flex justify-center">
        {/* Soft background aura */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-sage/20 dark:bg-forest/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
          {/* Left Text Column (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-8 text-center lg:text-left"
          >
            {/* Tag chip */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-night-card border border-sage/40 dark:border-forest/40 shadow-soft text-forest dark:text-limeaccent text-xs font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-limeaccent animate-pulse" />
              <span>Next-Gen Circular Economy Assistant</span>
            </div>

            {/* Main Hero Heading */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black text-charcoal dark:text-cream tracking-tight leading-[1.08]">
              Don&apos;t Waste It. <br />
              <span className="text-forest dark:text-limeaccent">
                Transform It.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-charcoal/75 dark:text-cream/75 max-w-2xl font-normal leading-relaxed">
              Discover the hidden potential in everyday discards. Let AI help you reuse, repair, recycle, and safely dispose of waste with customized blueprints and verified eco-challenges.
            </p>

            {/* Hero CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/scanner"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white bg-forest hover:bg-forest-800 shadow-soft-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 text-base group"
              >
                <Camera className="w-5 h-5 text-limeaccent group-hover:scale-110 transition-transform" />
                <span>Scan Discard Photo</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/challenges"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-charcoal dark:text-cream bg-white/90 dark:bg-night-card hover:bg-white dark:hover:bg-night-hover border border-sage/40 shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 text-base"
              >
                <Target className="w-5 h-5 text-forest dark:text-limeaccent" />
                <span>Start Daily Quest</span>
              </Link>

              <Link
                href="#categories"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-semibold text-forest dark:text-limeaccent hover:underline transition-colors text-sm flex items-center justify-center gap-1.5"
              >
                <span>Browse Categories</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust badge */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-charcoal/70 dark:text-cream/70 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest dark:text-limeaccent" />
                <span>Smart Waste Disposal Guide</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest dark:text-limeaccent" />
                <span>Zero Hallucination Protocol</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Realistic Nature Scene (5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center items-center"
          >
            <div className="w-full max-w-lg">
              <AnimatedTreeIllustration size="lg" priority={true} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. WASTE CATEGORY CARDS */}
      {/* ======================================================== */}
      <section id="categories" className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-night-card border-y border-sage/30 dark:border-forest/30 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest dark:text-limeaccent text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5 text-forest dark:text-limeaccent" />
              <span>Universal Material Recognition</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-charcoal dark:text-cream tracking-tight">
              Waste Categories & Circular Streams
            </h2>
            <p className="text-sm sm:text-base text-charcoal/70 dark:text-cream/70 mt-2">
              Our AI classifies discards into 8 verified streams, ensuring safe disposal instructions when reuse or repair are impractical.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wasteCategories.map((cat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="p-6 rounded-3xl bg-cream/50 dark:bg-night-hover border border-sage/30 hover:border-forest transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${cat.statusColor}`}>
                      {cat.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-charcoal dark:text-cream mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-forest dark:text-limeaccent mb-2">
                    {cat.code}
                  </p>
                  <p className="text-xs text-charcoal/70 dark:text-cream/70 leading-relaxed mb-4">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-sage/20 text-[11px] font-medium text-charcoal/80 dark:text-cream/80">
                  <span className="font-bold text-forest dark:text-limeaccent">Action: </span>
                  {cat.action}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. DOCUMENTED ENVIRONMENTAL IMPACT STATS */}
      {/* ======================================================== */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-cream/60 dark:bg-night transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-forest dark:text-limeaccent mb-2">
              The Reality of Global Discards
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-charcoal dark:text-cream">
              Grounded in rigorous environmental documentation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {documentedStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-3xl bg-white dark:bg-night-card border border-sage/40 dark:border-forest/30 shadow-soft text-center flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-forest dark:text-limeaccent tracking-tight">
                    {stat.value}
                  </div>
                  <p className="text-sm font-semibold text-charcoal/85 dark:text-cream/85 mt-2">
                    {stat.label}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-sage/20 text-[11px] font-medium text-charcoal/60 dark:text-cream/60 flex items-center justify-center gap-1">
                  <span>Source: {stat.source}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. SIMPLE 3-STEP PROCESS */}
      {/* ======================================================== */}
      <section id="how-it-works" className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-night-card border-t border-sage/30 dark:border-forest/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest dark:text-limeaccent text-xs font-bold uppercase tracking-wider mb-3">
              <span>Simple 3-Step Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-charcoal dark:text-cream tracking-tight">
              From Trash to Functional Treasure
            </h2>
            <p className="text-charcoal/70 dark:text-cream/70 mt-2 text-base">
              EcoHack transforms uncertain discards into actionable projects with safety precautions and step-by-step guides.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="relative p-8 rounded-3xl bg-cream/40 dark:bg-night-hover border border-sage/30 shadow-soft hover:shadow-soft-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-forest/10 dark:bg-forest/20 text-forest dark:text-limeaccent flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-3xl font-black text-charcoal/15 dark:text-cream/15">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-charcoal dark:text-cream mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-charcoal/70 dark:text-cream/70 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. SAMPLE WASTE TRANSFORMATIONS */}
      {/* ======================================================== */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-cream/50 dark:bg-night border-t border-sage/30 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest dark:text-limeaccent text-xs font-bold uppercase tracking-wider mb-2">
                <span>Educational Demonstrations</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-charcoal dark:text-cream tracking-tight">
                Sample Transformations
              </h2>
              <p className="text-sm text-charcoal/70 dark:text-cream/70 mt-1">
                Clearly labeled examples demonstrating the level of detail generated by the AI Scanner.
              </p>
            </div>
            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 text-sm font-bold text-forest dark:text-limeaccent hover:underline"
            >
              <span>Scan your own item</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleTransformations.map((sample) => (
              <div
                key={sample.id}
                className="p-6 rounded-3xl bg-white dark:bg-night-card border border-sage/40 dark:border-forest/30 shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-cream dark:bg-night text-forest dark:text-limeaccent border border-sage/30">
                      {sample.category}
                    </span>
                    <span className="text-xs font-semibold text-charcoal/60 dark:text-cream/60 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-forest dark:text-limeaccent" />
                      {sample.time}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-charcoal dark:text-cream mb-1">
                    {sample.title}
                  </h3>
                  <p className="text-xs font-medium text-forest dark:text-limeaccent mb-3">
                    Item: {sample.item}
                  </p>
                  <p className="text-xs text-charcoal/75 dark:text-cream/75 leading-relaxed mb-4">
                    {sample.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-sage/20">
                  <p className="text-[11px] font-semibold text-charcoal/80 dark:text-cream/80">
                    🌱 {sample.impact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. DAILY CHALLENGE & LEADERBOARD PREVIEWS */}
      {/* ======================================================== */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-night-card border-t border-sage/30 dark:border-forest/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Challenge Card */}
          <div className="p-8 rounded-3xl bg-cream/40 dark:bg-night-hover border border-sage/30 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest text-cream text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-limeaccent" />
                  <span>Today&apos;s Featured Challenge</span>
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-forest/10 text-forest dark:text-limeaccent border border-forest/20">
                  +{dailyChallenge?.pointsReward || 50} pts
                </span>
              </div>

              <h3 className="text-2xl font-black text-charcoal dark:text-cream mb-2">
                {dailyChallenge?.title || "Zero Single-Use Plastic for 24 Hours"}
              </h3>
              <p className="text-sm text-charcoal/70 dark:text-cream/70 leading-relaxed mb-4">
                {dailyChallenge?.description ||
                  "Commit to eliminating single-use plastic cups, straws, bags, and cutlery for the entire day. Document your plastic-free routine with a photo."}
              </p>

              <div className="p-4 rounded-2xl bg-white dark:bg-night border border-sage/30 mb-6 text-xs text-charcoal/80 dark:text-cream/80">
                <span className="font-bold text-forest dark:text-limeaccent">Why it matters: </span>
                {dailyChallenge?.whyItMatters ||
                  "Single-use plastics make up approximately 50% of all plastic produced annually and persist in ecosystems for hundreds of years."}
              </div>
            </div>

            <Link
              href="/challenges"
              className="w-full py-3.5 px-5 rounded-2xl font-bold text-center text-white bg-forest hover:bg-forest-800 transition-colors shadow-soft text-sm flex items-center justify-center gap-2"
            >
              <span>Accept Daily Challenge</span>
              <ArrowRight className="w-4 h-4 text-limeaccent" />
            </Link>
          </div>

          {/* Leaderboard Preview Card */}
          <div className="p-8 rounded-3xl bg-cream/40 dark:bg-night-hover border border-sage/30 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest text-cream text-xs font-bold uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5 text-limeaccent" />
                  <span>Community Standings</span>
                </span>
                <Link
                  href="/leaderboard"
                  className="text-xs font-bold text-forest dark:text-limeaccent hover:underline"
                >
                  View All
                </Link>
              </div>

              <h3 className="text-2xl font-black text-charcoal dark:text-cream mb-4">
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
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-night border border-sage/30 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-black text-forest dark:text-limeaccent">
                        #{u.rank || i + 1}
                      </span>
                      <span className="font-bold text-charcoal dark:text-cream">
                        {u.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <span className="text-forest dark:text-limeaccent">
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
              className="w-full py-3.5 px-5 rounded-2xl font-bold text-center text-forest dark:text-cream bg-white dark:bg-night-card hover:bg-cream border border-sage/40 transition-colors text-sm"
            >
              See Full Leaderboard & Your Rank
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. COMMUNITY BADGES DISPLAY */}
      {/* ======================================================== */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-cream/50 dark:bg-night transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-forest dark:text-limeaccent mb-2">
              Eco-Achievements
            </h2>
            <p className="text-2xl font-black text-charcoal dark:text-cream">
              Unlock Verified Sustainability Badges
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {badgesPreview.map((badge, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-night-card border border-sage/30 text-center space-y-2 shadow-soft"
              >
                <div className="text-3xl mb-1">{badge.icon}</div>
                <h4 className="text-sm font-bold text-charcoal dark:text-cream">{badge.name}</h4>
                <p className="text-[11px] text-charcoal/60 dark:text-cream/60">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. CALL TO ACTION BANNER */}
      {/* ======================================================== */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-forest text-cream text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to turn your everyday waste into worth?
          </h2>
          <p className="text-cream/80 text-base sm:text-lg max-w-2xl mx-auto font-normal">
            Start scanning with AI now. No downloads, no credit cards. Just point your camera, get instant solutions, and join our mission to divert tons of discards.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/scanner"
              className="px-8 py-4 rounded-2xl font-bold text-forest bg-cream hover:bg-white shadow-soft-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Camera className="w-5 h-5 text-forest" />
              <span>Launch Free AI Scanner</span>
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl font-bold text-cream bg-white/10 hover:bg-white/20 border border-cream/20 transition-all flex items-center gap-2"
            >
              <span>Join EcoHack Community</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
