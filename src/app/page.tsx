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
  BarChart3,
  Award,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedTreeIllustration } from "@/components/AnimatedTreeIllustration";

export default function LandingPage() {
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch today's challenge preview
    fetch("/api/challenges")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.dailyChallenge) {
          setDailyChallenge(data.dailyChallenge);
        }
      })
      .catch(() => {});

    // Fetch leaderboard preview
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

  const sampleTransformations = [
    {
      id: "sample-bottle",
      item: "PET Plastic Water Bottle (500ml)",
      category: "Plastic #1",
      badge: "Repurpose / Upcycle",
      title: "Sub-Irrigation Self-Watering Planter",
      difficulty: "Easy",
      time: "20 mins",
      impact: "Preserves 32g virgin polymer, eliminates continuous irrigation evaporation",
      summary: "Invert the top half into the base with a cotton wick to automatically hydrate kitchen herbs from below.",
    },
    {
      id: "sample-box",
      item: "Corrugated Cardboard Shipping Box",
      category: "Cardboard",
      badge: "Regenerate / Garden",
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
      badge: "Soil Enrichment",
      title: "Slow-Release Nitrogen Compost Booster",
      difficulty: "Easy",
      time: "5 mins",
      impact: "Diverts methane-generating organics from municipal landfills into garden nitrogen",
      summary: "Mix into compost bins or gently rake around acid-loving shrubs like blueberries and hydrangeas.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Scan Any Discard",
      desc: "Snap a photo of any bottle, container, scrap, or household item using your phone or web camera.",
      icon: Camera,
    },
    {
      step: "02",
      title: "Get AI Solutions",
      desc: "Our vision model identifies the material, safety factors, and generates at least 3 distinct practical transformation options.",
      icon: Sparkles,
    },
    {
      step: "03",
      title: "Earn Verified Points",
      desc: "Complete the project, submit proof of completion, earn eco-points, unlock badges, and track your diverted waste.",
      icon: Trophy,
    },
  ];

  return (
    <div className="w-full flex flex-col items-center overflow-hidden">
      {/* ======================================================== */}
      {/* 1. HERO SECTION */}
      {/* ======================================================== */}
      <section className="relative w-full pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night flex justify-center">
        {/* Soft background glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
          {/* Left Text Column (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-8 text-center lg:text-left"
          >
            {/* Tag chip */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-night-card/90 border border-emerald-500/25 shadow-soft text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Next-Gen Sustainability Assistant</span>
            </div>

            {/* Main Hero Heading */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black text-emerald-950 dark:text-emerald-50 tracking-tight leading-[1.08]">
              Don&apos;t Waste It. <br />
              <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 dark:from-emerald-300 dark:via-emerald-400 dark:to-green-300 bg-clip-text text-transparent">
                Transform It.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-emerald-950/75 dark:text-emerald-200/80 max-w-2xl font-normal leading-relaxed">
              Discover the hidden potential in everyday waste. Let AI help you reuse, repair, recycle, and make a measurable difference with customized DIY blueprints and verified challenges.
            </p>

            {/* Hero CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/scanner"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 shadow-soft-lg transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2.5 text-base group"
              >
                <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Scan Your Waste</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/challenges"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-emerald-900 dark:text-emerald-100 bg-white/90 dark:bg-night-card/90 hover:bg-white dark:hover:bg-night-card border border-emerald-500/25 shadow-soft transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2.5 text-base"
              >
                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Start an Eco Challenge</span>
              </Link>

              <Link
                href="#how-it-works"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-semibold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white transition-colors text-sm flex items-center justify-center gap-1.5"
              >
                <span>How It Works</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust badge */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-emerald-900/70 dark:text-emerald-400/80 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Zero Hallucination Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Localized Recycling Caveats</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Animated Nature Scene (5 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center items-center"
          >
            <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white/40 dark:bg-night-card/40 backdrop-blur-md border border-emerald-500/20 shadow-soft-lg flex flex-col items-center">
              <AnimatedTreeIllustration size="md" />
              <div className="mt-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Every Repurposed Item Blooms
                </p>
                <p className="text-xs text-emerald-900/60 dark:text-emerald-400 mt-0.5">
                  Small daily habits foster sustainable circular cities.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. DOCUMENTED ENVIRONMENTAL IMPACT STATS */}
      {/* ======================================================== */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-night-card border-y border-emerald-500/15 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
              The Reality of Global Discards
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100">
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
                className="p-6 rounded-2xl bg-emerald-50/60 dark:bg-night-hover/60 border border-emerald-500/20 text-center flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-800 dark:text-emerald-300 tracking-tight">
                    {stat.value}
                  </div>
                  <p className="text-sm font-semibold text-emerald-950/80 dark:text-emerald-200 mt-2">
                    {stat.label}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-500/15 text-[11px] font-medium text-emerald-700/70 dark:text-emerald-400/70 flex items-center justify-center gap-1">
                  <span>Source: {stat.source}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. HOW IT WORKS SECTION */}
      {/* ======================================================== */}
      <section id="how-it-works" className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <span>Simple 3-Step Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
              From Trash to Functional Treasure
            </h2>
            <p className="text-emerald-950/70 dark:text-emerald-300/80 mt-2 text-base">
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
                  className="relative p-8 rounded-3xl bg-white/90 dark:bg-night-card/90 border border-emerald-500/20 shadow-soft hover:shadow-soft-lg transition-all group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-3xl font-black text-emerald-900/20 dark:text-emerald-400/20">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-100 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-emerald-950/70 dark:text-emerald-300/80 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. SAMPLE WASTE TRANSFORMATIONS (Clearly labeled examples) */}
      {/* ======================================================== */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-night-card border-t border-emerald-500/15 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Educational Demonstrations</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
                Sample Transformations
              </h2>
              <p className="text-sm text-emerald-950/70 dark:text-emerald-300/80 mt-1">
                Clearly labeled examples demonstrating the level of detail generated by the AI Scanner.
              </p>
            </div>
            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              <span>Scan your own item</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleTransformations.map((sample) => (
              <div
                key={sample.id}
                className="p-6 rounded-3xl bg-emerald-50/50 dark:bg-night-hover/50 border border-emerald-500/20 shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white dark:bg-night-card text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                      {sample.category}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {sample.time}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-100 mb-1">
                    {sample.title}
                  </h3>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-3">
                    Item: {sample.item}
                  </p>
                  <p className="text-xs text-emerald-950/75 dark:text-emerald-300/80 leading-relaxed mb-4">
                    {sample.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-emerald-500/15">
                  <p className="text-[11px] font-semibold text-emerald-900/80 dark:text-emerald-300">
                    🌱 {sample.impact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. DAILY CHALLENGE & LEADERBOARD PREVIEWS */}
      {/* ======================================================== */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night border-t border-emerald-500/15">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Challenge Card */}
          <div className="p-8 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Today&apos;s Featured Challenge</span>
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  +{dailyChallenge?.pointsReward || 50} pts
                </span>
              </div>

              <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-100 mb-2">
                {dailyChallenge?.title || "Zero Single-Use Plastic for 24 Hours"}
              </h3>
              <p className="text-sm text-emerald-950/70 dark:text-emerald-300/80 leading-relaxed mb-4">
                {dailyChallenge?.description ||
                  "Commit to eliminating single-use plastic cups, straws, bags, and cutlery for the entire day. Document your plastic-free routine with a photo."}
              </p>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-night-hover/80 border border-emerald-500/15 mb-6 text-xs text-emerald-900 dark:text-emerald-300">
                <span className="font-bold">Why it matters: </span>
                {dailyChallenge?.whyItMatters ||
                  "Single-use plastics make up approximately 50% of all plastic produced annually and persist in ecosystems for hundreds of years."}
              </div>
            </div>

            <Link
              href="/challenges"
              className="w-full py-3 px-5 rounded-xl font-bold text-center text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-soft text-sm flex items-center justify-center gap-2"
            >
              <span>Accept Daily Challenge</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Leaderboard Preview Card */}
          <div className="p-8 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Community Standings</span>
                </span>
                <Link
                  href="/leaderboard"
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  View All
                </Link>
              </div>

              <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-100 mb-4">
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
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-night-hover/60 border border-emerald-500/15 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-black text-emerald-700 dark:text-emerald-400">
                        #{u.rank || i + 1}
                      </span>
                      <span className="font-bold text-emerald-950 dark:text-emerald-100">
                        {u.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <span className="text-emerald-700 dark:text-emerald-300">
                        {u.points} pts
                      </span>
                      <span className="text-amber-600 dark:text-amber-400">
                        🔥 {u.streak}d
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/leaderboard"
              className="w-full py-3 px-5 rounded-xl font-bold text-center text-emerald-800 dark:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors text-sm"
            >
              See Full Leaderboard & Your Rank
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. CALL TO ACTION BANNER */}
      {/* ======================================================== */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-tr from-emerald-800 via-forest to-emerald-900 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to turn your everyday waste into worth?
          </h2>
          <p className="text-emerald-100/85 text-base sm:text-lg max-w-2xl mx-auto font-normal">
            Start scanning with AI now. No downloads, no credit cards. Just point your camera, get instant solutions, and join our mission to divert tons of discards.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/scanner"
              className="px-8 py-4 rounded-2xl font-bold text-emerald-950 bg-white hover:bg-emerald-50 shadow-soft-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Camera className="w-5 h-5 text-emerald-700" />
              <span>Launch Free AI Scanner</span>
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl font-bold text-white bg-emerald-600/40 hover:bg-emerald-600/60 border border-white/20 transition-all flex items-center gap-2"
            >
              <span>Join EcoHack Community</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
