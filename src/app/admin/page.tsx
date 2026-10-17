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
      <div className="w-full min-h-[calc(100vh-80px)] py-12 flex items-center justify-center bg-nature-gradient dark:bg-night text-sm font-semibold text-emerald-900/60 dark:text-emerald-400">
        Verifying administrator authorization & loading telemetry...
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night flex justify-center">
      <div className="max-w-7xl w-full space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-500/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Administrative Operations Console</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-emerald-50 tracking-tight">
              Platform Governance
            </h1>
            <p className="text-sm text-emerald-900/60 dark:text-emerald-400 mt-1">
              Review pending community verifications, manage sustainability quests, and monitor ecosystem activity.
            </p>
          </div>

          {/* Admin Navigation Links */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/submissions"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-700 text-white hover:bg-emerald-800 shadow-soft flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>Review Submissions ({stats?.totalPendingReviews || 0})</span>
            </Link>

            <Link
              href="/admin/challenges"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-night-card border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 hover:bg-emerald-50 flex items-center gap-2"
            >
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Manage Quests</span>
            </Link>

            <Link
              href="/admin/users"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-night-card border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 hover:bg-emerald-50 flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Manage Users</span>
            </Link>
          </div>
        </div>

        {/* ======================================================== */}
        {/* KPI OVERVIEW METRICS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 dark:text-emerald-400">
                Pending Verification
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
              {stats?.totalPendingReviews || 0}
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-1 font-semibold">
              {stats?.pendingChallengeSubmissions || 0} quests, {stats?.pendingProjectSubmissions || 0} DIY projects
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 dark:text-emerald-400">
                Registered Users
              </span>
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-950 dark:text-emerald-100">
              {stats?.totalUsers || 0}
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-semibold">
              Active community participants
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 dark:text-emerald-400">
                AI Waste Scans
              </span>
              <Camera className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-950 dark:text-emerald-100">
              {stats?.totalAnalyses || 0}
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-semibold">
              Materials analyzed by AI
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 dark:text-emerald-400">
                Points Distributed
              </span>
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
              {stats?.totalEcoPointsAwarded || 0}
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-semibold">
              From {stats?.approvedTotal || 0} approved activities
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TWO COLUMN: MATERIAL BREAKDOWN & RECENT REGISTRATIONS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Material Category Distribution */}
          <div className="lg:col-span-6 p-8 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft space-y-4">
            <h3 className="text-lg font-black text-emerald-950 dark:text-emerald-100">
              Material Stream Distribution
            </h3>
            <p className="text-xs text-emerald-900/60 dark:text-emerald-400">
              Categories of waste items uploaded by community users for AI diagnosis.
            </p>

            <div className="space-y-3 pt-2">
              {(stats?.materialDistribution || []).length === 0 ? (
                <p className="text-xs text-emerald-900/60 dark:text-emerald-400 py-6 text-center">
                  No waste items scanned yet.
                </p>
              ) : (
                stats.materialDistribution.map((m: any, i: number) => {
                  const total = stats.totalAnalyses || 1;
                  const pct = Math.round((m.count / total) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="uppercase text-emerald-950 dark:text-emerald-100">
                          {m.category}
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-300">
                          {m.count} items ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-emerald-900/10 dark:bg-emerald-200/10 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
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
          <div className="lg:col-span-6 p-8 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-emerald-950 dark:text-emerald-100">
                Recent Community Members
              </h3>
              <Link href="/admin/users" className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                View All Users
              </Link>
            </div>

            <div className="divide-y divide-emerald-500/10">
              {(stats?.recentUsers || []).map((u: any) => (
                <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-emerald-950 dark:text-emerald-100">
                      {u.name}
                    </p>
                    <p className="text-[11px] text-emerald-900/60 dark:text-emerald-400">
                      {u.email} • {u.role}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-700 dark:text-emerald-300 text-xs">
                      {u.points} pts
                    </span>
                    <span className="text-[10px] text-emerald-900/50 dark:text-emerald-400 block">
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
          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                  {stats.totalPendingReviews} Submissions Awaiting Moderator Review
                </h4>
                <p className="text-xs text-amber-900/80 dark:text-amber-300 mt-0.5">
                  Review photographs to award points fairly and keep user streaks alive.
                </p>
              </div>
            </div>
            <Link
              href="/admin/submissions"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-soft shrink-0 text-center"
            >
              Open Review Queue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
