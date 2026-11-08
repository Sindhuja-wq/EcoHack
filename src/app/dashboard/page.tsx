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
      <div className="w-full min-h-[calc(100vh-80px)] py-12 flex items-center justify-center bg-cream dark:bg-night text-sm font-semibold text-charcoal/60 dark:text-cream/60">
        Loading your sustainability hub...
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

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-cream flex justify-center transition-colors">
      <div className="max-w-7xl w-full space-y-8">
        {/* ======================================================== */}
        {/* WELCOME BANNER & LEVEL PROGRESS */}
        {/* ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-night-card border border-sage/40 dark:border-forest/30 shadow-soft-md space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest dark:text-limeaccent text-xs font-bold uppercase tracking-wider mb-2">
                <span>Sustainability Guardian</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-charcoal dark:text-cream tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-sm text-charcoal/70 dark:text-cream/70 mt-1">
                Your actions divert waste from landfills and power community circular solutions.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/scanner"
                className="px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-forest hover:bg-forest-800 shadow-soft transition-all flex items-center gap-2"
              >
                <Camera className="w-4 h-4 text-limeaccent" />
                <span>Scan Discard</span>
              </Link>
              <Link
                href="/challenges"
                className="px-6 py-3.5 rounded-2xl font-bold text-sm text-forest dark:text-cream bg-sage/20 hover:bg-sage/35 border border-sage/40 transition-all flex items-center gap-2"
              >
                <Target className="w-4 h-4 text-forest dark:text-limeaccent" />
                <span>Today&apos;s Quest</span>
              </Link>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="p-6 rounded-2xl bg-cream/70 dark:bg-night-hover border border-sage/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-forest text-cream text-[11px] font-bold">
                  Level {levelInfo.level}
                </span>
                <span className="text-charcoal dark:text-cream text-sm">
                  {levelInfo.name}
                </span>
              </div>
              <div className="text-forest dark:text-limeaccent font-bold">
                {points} / {levelInfo.max} pts ({progressPercent}%)
              </div>
            </div>

            <div className="w-full h-3 rounded-full bg-sage/20 dark:bg-forest/30 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-forest to-limeaccent rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-charcoal/60 dark:text-cream/60">
              Earn {levelInfo.max - points} more eco-points to unlock the next level badge.
            </p>
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* KPI METRIC CARDS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-night-card border border-sage/40 dark:border-forest/30 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/60 dark:text-cream/60">
                Eco-Points
              </span>
              <Sparkles className="w-5 h-5 text-forest dark:text-limeaccent" />
            </div>
            <div className="text-3xl font-black text-charcoal dark:text-cream">
              {points}
            </div>
            <p className="text-[11px] text-forest dark:text-limeaccent mt-1 font-semibold">
              Verified & immutable
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-night-card border border-sage/40 dark:border-forest/30 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/60 dark:text-cream/60">
                Active Streak
              </span>
              <Flame className="w-5 h-5 text-terracotta fill-terracotta" />
            </div>
            <div className="text-3xl font-black text-terracotta">
              {profile?.streak || 1} Days
            </div>
            <p className="text-[11px] text-terracotta/80 mt-1 font-semibold">
              Daily habit momentum
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-night-card border border-sage/40 dark:border-forest/30 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/60 dark:text-cream/60">
                Verified Quests
              </span>
              <CheckCircle2 className="w-5 h-5 text-forest dark:text-limeaccent" />
            </div>
            <div className="text-3xl font-black text-charcoal dark:text-cream">
              {completedCount}
            </div>
            <p className="text-[11px] text-forest dark:text-limeaccent mt-1 font-semibold">
              Approved activities
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-night-card border border-sage/40 dark:border-forest/30 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/60 dark:text-cream/60">
                Pending Reviews
              </span>
              <Clock className="w-5 h-5 text-sage-600 dark:text-sage-400" />
            </div>
            <div className="text-3xl font-black text-charcoal dark:text-cream">
              {pendingCount}
            </div>
            <p className="text-[11px] text-charcoal/60 dark:text-cream/60 mt-1 font-semibold">
              Awaiting verification
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TWO COLUMN SECTION: DAILY CHALLENGE & BADGES */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Today's Daily Challenge (7 cols) */}
          <div className="lg:col-span-7 p-8 rounded-3xl bg-white dark:bg-night-card border border-sage/40 dark:border-forest/30 shadow-soft space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest text-cream text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-limeaccent" />
                  <span>Today&apos;s Eco Quest</span>
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-forest/10 text-forest dark:text-limeaccent border border-forest/20">
                  +{dailyChallenge?.pointsReward || 50} pts
                </span>
              </div>

              <h3 className="text-2xl font-black text-charcoal dark:text-cream mb-2">
                {dailyChallenge?.title || "Daily Eco Quest"}
              </h3>
              <p className="text-sm text-charcoal/70 dark:text-cream/70 leading-relaxed mb-4">
                {dailyChallenge?.description || "Take small daily steps toward mindful zero waste consumption."}
              </p>

              <div className="p-4 rounded-2xl bg-cream/70 dark:bg-night-hover border border-sage/30 text-xs text-charcoal/80 dark:text-cream/80">
                <strong className="font-bold text-forest dark:text-limeaccent">Requirements: </strong>
                {dailyChallenge?.completionRequirements}
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/challenges"
                className="w-full py-3.5 px-5 rounded-2xl font-bold text-center text-white bg-forest hover:bg-forest-800 transition-colors shadow-soft text-sm flex items-center justify-center gap-2"
              >
                <span>Accept & Submit Evidence</span>
                <ArrowRight className="w-4 h-4 text-limeaccent" />
              </Link>
            </div>
          </div>

          {/* Right: Badges Earned (5 cols) */}
          <div className="lg:col-span-5 p-8 rounded-3xl bg-white dark:bg-night-card border border-sage/40 dark:border-forest/30 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-charcoal dark:text-cream">
                Badges Showcase
              </h3>
              <Link href="/profile" className="text-xs font-bold text-forest dark:text-limeaccent hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {(profile?.badges || []).length === 0 ? (
                <p className="text-xs text-charcoal/60 dark:text-cream/60 py-6 text-center">
                  Complete challenges and scans to unlock your first badge!
                </p>
              ) : (
                profile?.badges?.map((b: any) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-cream/70 dark:bg-night-hover border border-sage/30 flex items-center gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-forest text-limeaccent flex items-center justify-center font-bold text-base shadow-sm">
                      🌱
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-charcoal dark:text-cream">
                        {b.name}
                      </h4>
                      <p className="text-[11px] text-charcoal/60 dark:text-cream/60 line-clamp-1">
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
        {/* SAVED TRANSFORMATION IDEAS */}
        {/* ======================================================== */}
        <div className="p-8 rounded-3xl bg-white dark:bg-night-card border border-sage/40 dark:border-forest/30 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-charcoal dark:text-cream">
                Saved Transformation Ideas ({profile?.savedIdeas?.length || 0})
              </h3>
              <p className="text-xs text-charcoal/60 dark:text-cream/60">
                Upcycling blueprints you bookmarked for later crafting or home implementation.
              </p>
            </div>
            <Link
              href="/saved-ideas"
              className="text-xs font-bold text-forest dark:text-limeaccent hover:underline"
            >
              Manage Saved
            </Link>
          </div>

          {(profile?.savedIdeas || []).length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-sage/40 rounded-2xl space-y-2">
              <Bookmark className="w-8 h-8 text-sage mx-auto" />
              <p className="text-xs font-medium text-charcoal/60 dark:text-cream/60">
                You haven&apos;t saved any ideas yet. Analyze a waste item to save DIY blueprints!
              </p>
              <Link
                href="/scanner"
                className="inline-block px-5 py-2.5 rounded-xl bg-forest text-white font-bold text-xs shadow-sm"
              >
                Scan an Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.savedIdeas.slice(0, 3).map((idea: any) => (
                <div
                  key={idea.id}
                  className="p-5 rounded-2xl bg-cream/70 dark:bg-night-hover border border-sage/30 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest/15 text-forest dark:text-limeaccent">
                      {idea.transformationOption?.difficulty}
                    </span>
                    <h4 className="font-bold text-sm text-charcoal dark:text-cream mt-2">
                      {idea.transformationOption?.title}
                    </h4>
                    <p className="text-xs text-charcoal/70 dark:text-cream/70 line-clamp-2 mt-1">
                      {idea.transformationOption?.shortExplanation}
                    </p>
                  </div>
                  <Link
                    href="/saved-ideas"
                    className="text-xs font-bold text-forest dark:text-limeaccent hover:underline flex items-center gap-1"
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
        {/* RECENT POINTS TRANSACTIONS LEDGER */}
        {/* ======================================================== */}
        <div className="p-8 rounded-3xl bg-white dark:bg-night-card border border-sage/40 dark:border-forest/30 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-charcoal dark:text-cream">
              Recent Activity Ledger
            </h3>
            <Link href="/history" className="text-xs font-bold text-forest dark:text-limeaccent hover:underline">
              Full History
            </Link>
          </div>

          <div className="divide-y divide-sage/20">
            {(profile?.transactions || []).length === 0 ? (
              <p className="text-xs text-charcoal/60 dark:text-cream/60 py-6 text-center">
                No transactions recorded yet. Complete an approved activity to earn your first points.
              </p>
            ) : (
              profile.transactions.slice(0, 5).map((tx: any) => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-charcoal dark:text-cream">
                      {tx.description}
                    </p>
                    <p className="text-[11px] text-charcoal/60 dark:text-cream/60">
                      {new Date(tx.createdAt).toLocaleDateString()} • {tx.source.replace("_", " ")}
                    </p>
                  </div>
                  <span className={`font-black text-sm ${tx.amount > 0 ? "text-forest dark:text-limeaccent" : "text-terracotta"}`}>
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
