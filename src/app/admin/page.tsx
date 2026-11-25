"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import {
  ShieldCheck,
  Users,
  Target,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/admin");
      } else if (user.role !== "ADMIN") {
        router.push("/dashboard");
        showToast("Access forbidden: Administrator privileges required.", "error");
      }
    }
  }, [user, authLoading, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        showToast(data.error || "Failed to load admin statistics", "error");
      }
    } catch {
      showToast("Network error fetching admin stats", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchStats();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="w-full min-h-[calc(100vh-68px)] py-12 flex items-center justify-center bg-cream dark:bg-night text-sm font-semibold text-charcoal/60 dark:text-darktext-muted transition-colors">
        Verifying administrator authorization & loading telemetry...
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-68px)] py-12 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-darktext flex justify-center relative overflow-hidden transition-colors">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-96 bg-emerald-500/10 dark:bg-[#43E6A1]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl w-full space-y-8 relative z-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sage/30 dark:border-night-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-forest dark:text-emeraldaccent" />
              <span>Administrative Governance Console</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-charcoal dark:text-darktext">
              Platform Governance
            </h1>
            <p className="text-sm text-charcoal/70 dark:text-darktext-secondary mt-1">
              Review pending community verifications, manage sustainability quests, and monitor ecosystem activity.
            </p>
          </div>

          {/* Admin Navigation Links */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/submissions"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover text-white dark:text-night shadow-glow flex items-center gap-2 transition-all"
            >
              <Clock className="w-4 h-4 text-white dark:text-night" />
              <span>Review Queue ({stats?.totalPendingReviews || 0})</span>
            </Link>

            <Link
              href="/admin/challenges"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-charcoal dark:text-darktext hover:bg-cream-50 dark:hover:bg-night-card flex items-center gap-2 transition-colors"
            >
              <Target className="w-4 h-4 text-forest dark:text-emeraldaccent" />
              <span>Manage Quests</span>
            </Link>

            <Link
              href="/admin/users"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-charcoal dark:text-darktext hover:bg-cream-50 dark:hover:bg-night-card flex items-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4 text-forest-light dark:text-emeraldaccent-light" />
              <span>Manage Users</span>
            </Link>
          </div>
        </div>

        {/* ======================================================== */}
        {/* KPI OVERVIEW METRICS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted">
                Pending Verification
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-terra dark:bg-[#E07A5F] animate-pulse" />
            </div>
            <div className="text-3xl font-black font-heading text-terra dark:text-[#E07A5F]">
              {stats?.totalPendingReviews || 0}
            </div>
            <p className="text-[11px] text-charcoal/70 dark:text-darktext-secondary mt-1 font-medium">
              {stats?.pendingChallengeSubmissions || 0} quests, {stats?.pendingProjectSubmissions || 0} DIY projects
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted">
                Registered Users
              </span>
              <Users className="w-4 h-4 text-forest dark:text-emeraldaccent" />
            </div>
            <div className="text-3xl font-black font-heading text-charcoal dark:text-darktext">
              {stats?.totalUsers || 0}
            </div>
            <p className="text-[11px] text-forest dark:text-emeraldaccent mt-1 font-medium">
              Active community participants
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted">
                AI Waste Scans
              </span>
              <Camera className="w-4 h-4 text-forest-light dark:text-emeraldaccent-light" />
            </div>
            <div className="text-3xl font-black font-heading text-charcoal dark:text-darktext">
              {stats?.totalAnalyses || 0}
            </div>
            <p className="text-[11px] text-forest-light dark:text-emeraldaccent-light mt-1 font-medium">
              Materials analyzed by AI
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted">
                Points Distributed
              </span>
              <Sparkles className="w-4 h-4 text-forest dark:text-[#B6EAD0]" />
            </div>
            <div className="text-3xl font-black font-heading text-forest dark:text-[#B6EAD0]">
              {stats?.totalEcoPointsAwarded || 0}
            </div>
            <p className="text-[11px] text-charcoal/70 dark:text-darktext-secondary mt-1 font-medium">
              From {stats?.approvedTotal || 0} approved activities
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TWO COLUMN: MATERIAL BREAKDOWN & RECENT REGISTRATIONS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Material Category Distribution */}
          <div className="lg:col-span-6 p-8 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-4 transition-colors">
            <h3 className="text-lg font-black font-heading text-charcoal dark:text-darktext">
              Material Stream Distribution
            </h3>
            <p className="text-xs text-charcoal/60 dark:text-darktext-muted">
              Categories of waste items uploaded by community users for AI diagnosis.
            </p>

            <div className="space-y-3 pt-2">
              {(stats?.materialDistribution || []).length === 0 ? (
                <p className="text-xs text-charcoal/60 dark:text-darktext-muted py-6 text-center">
                  No waste items scanned yet.
                </p>
              ) : (
                stats.materialDistribution.map((m: any, i: number) => {
                  const total = stats.totalAnalyses || 1;
                  const pct = Math.round((m.count / total) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="uppercase text-charcoal dark:text-darktext">
                          {m.category}
                        </span>
                        <span className="text-forest dark:text-emeraldaccent">
                          {m.count} items ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-cream-100 dark:bg-night-card border border-sage/30 dark:border-night-border overflow-hidden">
                        <div
                          className="h-full bg-forest dark:bg-emeraldaccent rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent User Registrations */}
          <div className="lg:col-span-6 p-8 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black font-heading text-charcoal dark:text-darktext">
                Recent Community Members
              </h3>
              <Link href="/admin/users" className="text-xs font-bold text-forest dark:text-emeraldaccent hover:underline">
                View All Users
              </Link>
            </div>

            <div className="divide-y divide-sage/30 dark:divide-night-border">
              {(stats?.recentUsers || []).map((u: any) => (
                <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-charcoal dark:text-darktext">
                      {u.name}
                    </p>
                    <p className="text-[11px] text-charcoal/60 dark:text-darktext-muted">
                      {u.email} • {u.role}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-forest dark:text-emeraldaccent text-xs">
                      {u.points} pts
                    </span>
                    <span className="text-[10px] text-charcoal/60 dark:text-darktext-muted block">
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Review Callout */}
        {stats?.totalPendingReviews > 0 && (
          <div className="p-6 rounded-2xl bg-white dark:bg-night-secondary border border-amber-500/40 dark:border-[#E07A5F]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-terra dark:text-[#E07A5F] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-charcoal dark:text-darktext">
                  {stats.totalPendingReviews} Submissions Awaiting Moderator Review
                </h4>
                <p className="text-xs text-charcoal/70 dark:text-darktext-secondary mt-0.5">
                  Review photographs to award points fairly and keep user streaks alive.
                </p>
              </div>
            </div>
            <Link
              href="/admin/submissions"
              className="px-5 py-2.5 rounded-xl bg-terra hover:bg-terra-light text-white font-bold text-xs shadow-soft shrink-0 text-center transition-all"
            >
              Open Review Queue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
