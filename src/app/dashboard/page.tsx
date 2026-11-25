"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import {
  Sparkles,
  Flame,
  Camera,
  Target,
  Trophy,
  Award,
  CheckCircle2,
  Clock,
  Bookmark,
  ArrowRight,
  TrendingUp,
  Layers,
  Calendar,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Check,
  Droplets,
  TreeDeciduous,
  Leaf,
  Scan,
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<any | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/dashboard");
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, challengesRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/challenges"),
      ]);

      const profileData = await profileRes.json();
      const challengesData = await challengesRes.json();

      if (profileData.success) {
        setProfile(profileData.profile);
      }
      if (challengesData.success) {
        setDailyChallenge(challengesData.dailyChallenge);
      }
    } catch {
      showToast("Error loading dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="w-full min-h-[calc(100vh-68px)] py-12 flex flex-col items-center justify-center bg-cream dark:bg-night text-charcoal/70 dark:text-darktext-secondary space-y-4 transition-colors">
        <div className="w-8 h-8 border-2 border-sage/40 dark:border-night-border border-t-forest dark:border-t-emeraldaccent rounded-full animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted">
          Connecting to EcoHack Workspace...
        </p>
      </div>
    );
  }

  // Calculate Level and Progress
  const points = profile?.points || 0;
  const getLevelInfo = (pts: number) => {
    if (pts < 150) return { level: 1, name: "Eco Seedling", min: 0, max: 150 };
    if (pts < 350) return { level: 2, name: "Sprout Guardian", min: 150, max: 350 };
    if (pts < 650) return { level: 3, name: "Waste Transformer", min: 350, max: 650 };
    if (pts < 1000) return { level: 4, name: "Circular Innovator", min: 650, max: 1000 };
    if (pts < 2000) return { level: 5, name: "Sustainability Master", min: 1000, max: 2000 };
    return { level: 6, name: "Planetary Champion", min: 2000, max: 5000 };
  };

  const levelInfo = getLevelInfo(points);
  const currentLevelPts = points - levelInfo.min;
  const levelRange = levelInfo.max - levelInfo.min;
  const progressPercent = Math.min(100, Math.round((currentLevelPts / levelRange) * 100));

  const completedCount = profile?.submissions?.filter((s: any) => s.status === "APPROVED").length || 0;
  const pendingCount =
    (profile?.submissions?.filter((s: any) => s.status === "PENDING").length || 0) +
    (profile?.projectSubmissions?.filter((p: any) => p.status === "PENDING").length || 0);

  // Derived Environmental Impact Estimates based on points and completed actions
  const estimatedGramsDiverted = Math.round(points * 42.5);
  const estimatedCarbonSavedKg = (estimatedGramsDiverted * 0.0028).toFixed(1);
  const estimatedWaterSavedLiters = Math.round(points * 14.2);

  return (
    <div className="w-full min-h-[calc(100vh-68px)] py-12 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-darktext flex justify-center transition-colors relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-10 right-1/4 w-[600px] h-96 bg-emerald-500/10 dark:bg-[#43E6A1]/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl w-full space-y-8 relative z-10">
        {/* ======================================================== */}
        {/* 1. WELCOME BANNER & WORKSPACE ACTIONS */}
        {/* ======================================================== */}
        <div
          className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-6 transition-colors"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-semibold tracking-wider uppercase">
                <Leaf className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
                <span>Sustainability Workspace</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-charcoal dark:text-darktext">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-sm text-charcoal/70 dark:text-darktext-secondary">
                Your circular actions divert waste from landfills and power community sustainability solutions.
              </p>
            </div>

            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/scanner"
                className="px-6 py-3.5 rounded-2xl font-bold text-sm text-white dark:text-night bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover shadow-glow transition-all flex items-center gap-2"
              >
                <Camera className="w-4 h-4 text-white dark:text-night" />
                <span>Scan Discard</span>
              </Link>
              <Link
                href="/challenges"
                className="px-6 py-3.5 rounded-2xl font-bold text-sm text-charcoal dark:text-darktext bg-cream-50 dark:bg-night-card hover:bg-cream-100 dark:hover:bg-night-border border border-sage/40 dark:border-night-border transition-all flex items-center gap-2"
              >
                <Target className="w-4 h-4 text-forest dark:text-emeraldaccent" />
                <span>Daily Quest</span>
              </Link>
              <Link
                href="/leaderboard"
                className="px-5 py-3.5 rounded-2xl font-bold text-sm text-charcoal/70 dark:text-darktext-secondary hover:text-charcoal dark:hover:text-darktext bg-cream-50 dark:bg-night-card hover:bg-cream-100 dark:hover:bg-night-border border border-sage/40 dark:border-night-border transition-all flex items-center gap-2"
              >
                <Trophy className="w-4 h-4 text-forest-light dark:text-emeraldaccent-light" />
                <span>Leaderboard</span>
              </Link>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="p-6 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-3 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-forest dark:bg-emeraldaccent text-white dark:text-night text-[11px] font-bold">
                  Level {levelInfo.level}
                </span>
                <span className="text-charcoal dark:text-darktext text-sm font-heading">
                  {levelInfo.name}
                </span>
              </div>
              <div className="text-forest dark:text-emeraldaccent font-bold">
                {points} / {levelInfo.max} pts ({progressPercent}%)
              </div>
            </div>

            <div className="w-full h-2.5 rounded-full bg-cream-100 dark:bg-night border border-sage/30 dark:border-night-border overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-forest to-forest-light dark:from-emeraldaccent dark:to-emeraldaccent-light rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-charcoal/60 dark:text-darktext-muted">
              Earn {levelInfo.max - points} more eco-points to unlock the Level {levelInfo.level + 1} milestone badge.
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. KPI METRIC CARDS WITH FIRE / GLOW STREAK */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Eco-Points */}
          <div className="p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted">
                Eco-Points
              </span>
              <Sparkles className="w-4 h-4 text-forest dark:text-emeraldaccent" />
            </div>
            <div className="text-3xl font-black font-heading text-charcoal dark:text-darktext">
              {points}
            </div>
            <p className="text-[11px] text-forest dark:text-emeraldaccent mt-1 font-medium">
              Verified & immutable ledger
            </p>
          </div>

          {/* Active Streak with Fire Glow */}
          <div className="p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated relative overflow-hidden group transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 dark:bg-[#E07A5F]/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted">
                Active Streak
              </span>
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Flame className="w-5 h-5 text-terra dark:text-[#E07A5F] fill-terra dark:fill-[#E07A5F]" />
              </motion.div>
            </div>
            <div className="text-3xl font-black font-heading text-terra dark:text-[#E07A5F] relative z-10">
              {profile?.streak || 1} Days
            </div>
            <p className="text-[11px] text-terra/80 dark:text-[#E07A5F]/80 mt-1 font-medium relative z-10">
              Daily sustainability momentum
            </p>
          </div>

          {/* Verified Quests */}
          <div className="p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted">
                Verified Quests
              </span>
              <CheckCircle2 className="w-4 h-4 text-forest-light dark:text-emeraldaccent-light" />
            </div>
            <div className="text-3xl font-black font-heading text-charcoal dark:text-darktext">
              {completedCount}
            </div>
            <p className="text-[11px] text-forest-light dark:text-emeraldaccent-light mt-1 font-medium">
              Approved circular activities
            </p>
          </div>

          {/* Pending Reviews */}
          <div className="p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted">
                Pending Reviews
              </span>
              <Clock className="w-4 h-4 text-forest dark:text-[#B6EAD0]" />
            </div>
            <div className="text-3xl font-black font-heading text-charcoal dark:text-darktext">
              {pendingCount}
            </div>
            <p className="text-[11px] text-charcoal/60 dark:text-darktext-muted mt-1 font-medium">
              Awaiting verification
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. ENVIRONMENTAL IMPACT SUMMARY CARD */}
        {/* ======================================================== */}
        <div className="p-8 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-5 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest dark:text-emeraldaccent mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Environmental Impact Summary</span>
              </div>
              <h3 className="text-xl font-black font-heading text-charcoal dark:text-darktext">
                Your Cumulative Ecological Footprint
              </h3>
            </div>
            <span className="text-xs text-charcoal/60 dark:text-darktext-muted">
              Calculated using EPA WARM & UNEP solid waste formulas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
              <div className="flex items-center gap-2 text-xs font-semibold text-charcoal/70 dark:text-darktext-secondary">
                <Layers className="w-4 h-4 text-forest dark:text-emeraldaccent" />
                <span>Estimated Diverted Mass</span>
              </div>
              <div className="text-2xl font-black font-heading text-forest dark:text-emeraldaccent">
                {estimatedGramsDiverted > 1000
                  ? `${(estimatedGramsDiverted / 1000).toFixed(2)} kg`
                  : `${estimatedGramsDiverted} g`}
              </div>
              <p className="text-[11px] text-charcoal/60 dark:text-darktext-muted">
                Solid discards diverted from municipal landfills
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
              <div className="flex items-center gap-2 text-xs font-semibold text-charcoal/70 dark:text-darktext-secondary">
                <TreeDeciduous className="w-4 h-4 text-forest-light dark:text-emeraldaccent-light" />
                <span>Carbon Reduction</span>
              </div>
              <div className="text-2xl font-black font-heading text-forest-light dark:text-emeraldaccent-light">
                {estimatedCarbonSavedKg} kg CO2e
              </div>
              <p className="text-[11px] text-charcoal/60 dark:text-darktext-muted">
                Avoided virgin polymer & transportation emissions
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
              <div className="flex items-center gap-2 text-xs font-semibold text-charcoal/70 dark:text-darktext-secondary">
                <Droplets className="w-4 h-4 text-forest dark:text-[#B6EAD0]" />
                <span>Water Conserved</span>
              </div>
              <div className="text-2xl font-black font-heading text-forest dark:text-[#B6EAD0]">
                {estimatedWaterSavedLiters} L
              </div>
              <p className="text-[11px] text-charcoal/60 dark:text-darktext-muted">
                Agricultural and industrial processing water spared
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. TWO COLUMN SECTION: DAILY CHALLENGE & BADGES */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Today's Daily Challenge (7 cols) */}
          <div className="lg:col-span-7 p-8 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-5 flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
                  <span>Today&apos;s Eco Quest</span>
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-forest dark:text-emeraldaccent border border-emerald-500/30">
                  +{dailyChallenge?.pointsReward || 50} pts
                </span>
              </div>

              <h3 className="text-2xl font-black font-heading text-charcoal dark:text-darktext mb-2">
                {dailyChallenge?.title || "Daily Eco Quest"}
              </h3>
              <p className="text-sm text-charcoal/70 dark:text-darktext-secondary leading-relaxed mb-4">
                {dailyChallenge?.description || "Take small daily steps toward mindful zero waste consumption."}
              </p>

              <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-xs text-charcoal/70 dark:text-darktext-secondary transition-colors">
                <strong className="font-bold text-forest dark:text-emeraldaccent">Requirements: </strong>
                {dailyChallenge?.completionRequirements || "Submit a clear photo demonstrating your sustainable habit."}
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/challenges"
                className="w-full py-3.5 px-5 rounded-2xl font-bold text-center text-white dark:text-night bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover transition-all shadow-glow text-sm flex items-center justify-center gap-2"
              >
                <span>Accept & Submit Evidence</span>
                <ArrowRight className="w-4 h-4 text-white dark:text-night" />
              </Link>
            </div>
          </div>

          {/* Right: Badges Earned (5 cols) */}
          <div className="lg:col-span-5 p-8 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black font-heading text-charcoal dark:text-darktext">
                Badges Showcase
              </h3>
              <Link href="/profile" className="text-xs font-bold text-forest dark:text-emeraldaccent hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {(profile?.badges || []).length === 0 ? (
                <div className="p-6 text-center border border-dashed border-sage/40 dark:border-night-border rounded-2xl space-y-2">
                  <Award className="w-6 h-6 text-charcoal/60 dark:text-darktext-muted mx-auto" />
                  <p className="text-xs text-charcoal/60 dark:text-darktext-muted">
                    Complete challenges and scans to unlock your first verified badge!
                  </p>
                </div>
              ) : (
                profile?.badges?.map((b: any) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border flex items-center gap-3.5 hover:border-forest/40 dark:hover:border-emeraldaccent/40 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-night-secondary border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent flex items-center justify-center font-bold text-base shadow-sm">
                      🌱
                    </div>
                    <div>
                      <h4 className="font-bold text-xs font-heading text-charcoal dark:text-darktext">
                        {b.name}
                      </h4>
                      <p className="text-[11px] text-charcoal/60 dark:text-darktext-muted line-clamp-1">
                        {b.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5. SAVED TRANSFORMATION IDEAS */}
        {/* ======================================================== */}
        <div className="p-8 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-5 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black font-heading text-charcoal dark:text-darktext">
                Saved Transformation Blueprints ({profile?.savedIdeas?.length || 0})
              </h3>
              <p className="text-xs text-charcoal/60 dark:text-darktext-muted">
                Upcycling blueprints you bookmarked for later crafting or home implementation.
              </p>
            </div>
            <Link
              href="/saved-ideas"
              className="text-xs font-bold text-forest dark:text-emeraldaccent hover:underline"
            >
              Manage Saved
            </Link>
          </div>

          {(profile?.savedIdeas || []).length === 0 ? (
            <div className="p-10 text-center border-2 border-dashed border-sage/40 dark:border-night-border rounded-2xl space-y-3">
              <Bookmark className="w-8 h-8 text-charcoal/60 dark:text-darktext-muted mx-auto" />
              <p className="text-xs font-medium text-charcoal/70 dark:text-darktext-secondary">
                You haven&apos;t saved any ideas yet. Analyze a waste item to save DIY blueprints!
              </p>
              <Link
                href="/scanner"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest dark:bg-emeraldaccent text-white dark:text-night font-bold text-xs shadow-glow"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Scan an Item</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.savedIdeas.slice(0, 3).map((idea: any) => (
                <div
                  key={idea.id}
                  className="p-5 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border flex flex-col justify-between space-y-3 hover:border-forest/40 dark:hover:border-emeraldaccent/40 transition-colors"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-night-secondary border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent">
                      {idea.transformationOption?.difficulty}
                    </span>
                    <h4 className="font-bold font-heading text-sm text-charcoal dark:text-darktext mt-2.5">
                      {idea.transformationOption?.title}
                    </h4>
                    <p className="text-xs text-charcoal/70 dark:text-darktext-secondary line-clamp-2 mt-1">
                      {idea.transformationOption?.shortExplanation}
                    </p>
                  </div>
                  <Link
                    href="/saved-ideas"
                    className="text-xs font-bold text-forest dark:text-emeraldaccent hover:underline flex items-center gap-1"
                  >
                    <span>View Blueprint</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 6. RECENT POINTS TRANSACTIONS LEDGER */}
        {/* ======================================================== */}
        <div className="p-8 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black font-heading text-charcoal dark:text-darktext">
              Recent Activity Ledger
            </h3>
            <Link href="/history" className="text-xs font-bold text-forest dark:text-emeraldaccent hover:underline">
              Full History
            </Link>
          </div>

          <div className="divide-y divide-sage/30 dark:divide-night-border">
            {(profile?.transactions || []).length === 0 ? (
              <p className="text-xs text-charcoal/60 dark:text-darktext-muted py-6 text-center">
                No transactions recorded yet. Complete an approved activity to earn your first points.
              </p>
            ) : (
              profile.transactions.slice(0, 5).map((tx: any) => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-charcoal dark:text-darktext">
                      {tx.description}
                    </p>
                    <p className="text-[11px] text-charcoal/60 dark:text-darktext-muted">
                      {new Date(tx.createdAt).toLocaleDateString()} • {tx.source.replace("_", " ")}
                    </p>
                  </div>
                  <span className={`font-black text-sm ${tx.amount > 0 ? "text-forest dark:text-emeraldaccent" : "text-terra dark:text-[#E07A5F]"}`}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} pts
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
