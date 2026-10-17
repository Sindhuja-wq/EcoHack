"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, useToast } from "@/components/Providers";
import {
  Trophy,
  Medal,
  Award,
  Flame,
  Sparkles,
  CheckCircle2,
  Calendar,
  Globe,
  ArrowUp,
  User,
  Shield,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [period, setPeriod] = useState<"global" | "monthly" | "weekly">("global");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLeaderboard = async (selectedPeriod: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leaderboard?period=${selectedPeriod}`);
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
        setUserRank(data.currentUserRank || null);
      }
    } catch {
      showToast("Could not load leaderboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(period);
  }, [period]);

  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night flex justify-center">
      <div className="max-w-5xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Community Honor Roll</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-emerald-950 dark:text-emerald-50 tracking-tight">
            Sustainability Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-emerald-950/70 dark:text-emerald-300/80 max-w-xl mx-auto">
            Real eco-points earned exclusively through verified waste transformations and approved daily eco quests.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center justify-center gap-2">
          {[
            { id: "global", label: "All-Time Global", icon: Globe },
            { id: "monthly", label: "This Month (30d)", icon: Calendar },
            { id: "weekly", label: "This Week (7d)", icon: Flame },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = period === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id as any)}
                className={`px-4 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border flex items-center gap-2 ${
                  isSelected
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-soft"
                    : "bg-white/80 dark:bg-night-card/80 text-emerald-950/70 dark:text-emerald-200 border-emerald-500/20 hover:bg-emerald-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Logged In User Status Sticky Banner */}
        {user && userRank && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-emerald-800 via-forest to-emerald-900 text-white shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg">
                #{userRank.rank || "—"}
              </div>
              <div>
                <p className="text-xs text-emerald-200 font-semibold uppercase tracking-wider">
                  Your Current Standing
                </p>
                <p className="text-base font-bold text-white">
                  {user.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs sm:text-sm font-bold">
              <div>
                <span className="text-emerald-200 block text-[11px] font-medium">Points</span>
                <span>{userRank.points} pts</span>
              </div>
              <div>
                <span className="text-emerald-200 block text-[11px] font-medium">Streak</span>
                <span className="text-amber-300">🔥 {userRank.streak} days</span>
              </div>
              <div>
                <span className="text-emerald-200 block text-[11px] font-medium">Quests</span>
                <span>{userRank.completedChallengesCount || 0} done</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="p-16 text-center text-sm font-semibold text-emerald-900/60 dark:text-emerald-400">
            Gathering verified community standings...
          </div>
        ) : leaderboard.length === 0 ? (
          /* Empty state */
          <div className="p-16 rounded-3xl bg-white/90 dark:bg-night-card/90 border border-emerald-500/20 text-center space-y-4">
            <Trophy className="w-12 h-12 text-emerald-600/40 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-100">
                Be The First Guardian on the Leaderboard!
              </h3>
              <p className="text-xs text-emerald-900/60 dark:text-emerald-400 max-w-sm mx-auto">
                No approved activities yet for this period. Scan your first waste item or complete a daily challenge to take the #1 spot!
              </p>
            </div>
            <Link
              href="/challenges"
              className="inline-block px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-soft"
            >
              Start an Eco Challenge
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ======================================================== */}
            {/* TOP 3 PODIUM */}
            {/* ======================================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-4 items-end">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="order-2 sm:order-1 p-6 rounded-3xl bg-white/90 dark:bg-night-card/90 border border-emerald-500/20 shadow-soft text-center flex flex-col items-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-sm flex items-center justify-center">
                    #2
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-800 font-black text-lg flex items-center justify-center uppercase shadow-sm">
                    {topThree[1].name.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 dark:text-emerald-100 text-sm truncate max-w-[150px]">
                      {topThree[1].name}
                    </h4>
                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {topThree[1].points} pts
                    </p>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                      🔥 {topThree[1].streak}d streak
                    </p>
                  </div>
                </div>
              )}

              {/* 1st Place (Center and slightly raised) */}
              {topThree[0] && (
                <div className="order-1 sm:order-2 p-8 rounded-3xl bg-gradient-to-b from-amber-50/90 to-white/95 dark:from-night-card dark:to-night border-2 border-amber-400/50 shadow-soft-lg text-center flex flex-col items-center space-y-4 -translate-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <Trophy className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Grand Champion</span>
                  </div>
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 text-amber-950 font-black text-2xl flex items-center justify-center uppercase shadow-md">
                    {topThree[0].name.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-950 dark:text-emerald-100 text-base truncate max-w-[180px]">
                      {topThree[0].name}
                    </h4>
                    <p className="text-base font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {topThree[0].points} pts
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                      🔥 {topThree[0].streak}d streak • {topThree[0].completedChallengesCount || 0} quests
                    </p>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="order-3 p-6 rounded-3xl bg-white/90 dark:bg-night-card/90 border border-emerald-500/20 shadow-soft text-center flex flex-col items-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-700/20 text-amber-800 dark:text-amber-300 font-black text-sm flex items-center justify-center">
                    #3
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black text-lg flex items-center justify-center uppercase shadow-sm">
                    {topThree[2].name.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 dark:text-emerald-100 text-sm truncate max-w-[150px]">
                      {topThree[2].name}
                    </h4>
                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {topThree[2].points} pts
                    </p>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                      🔥 {topThree[2].streak}d streak
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* FULL RANK TABLE */}
            {/* ======================================================== */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft space-y-4">
              <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
                Community Rankings
              </h3>

              <div className="divide-y divide-emerald-500/10">
                {leaderboard.map((item, index) => {
                  const isCurrentUser = user && user.id === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`py-3.5 px-4 rounded-xl flex items-center justify-between gap-4 transition-colors ${
                        isCurrentUser
                          ? "bg-emerald-500/15 border border-emerald-500/30"
                          : "hover:bg-emerald-50/50 dark:hover:bg-night-hover/50"
                      }`}
                    >
                      {/* Left side: Rank & Name */}
                      <div className="flex items-center gap-4">
                        <span className="w-7 text-center font-black text-sm text-emerald-950/70 dark:text-emerald-400">
                          #{item.rank || index + 1}
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm">
                          {item.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                              {item.name}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-700 text-white">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-emerald-900/60 dark:text-emerald-400 font-medium">
                            <span>{item.completedChallengesCount || 0} quests verified</span>
                            {item.badgesCount > 0 && (
                              <span>• {item.badgesCount} badges</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side: Points and Streak */}
                      <div className="flex items-center gap-4 sm:gap-6 text-right">
                        <div className="hidden sm:block text-xs font-semibold text-amber-600 dark:text-amber-400">
                          🔥 {item.streak}d streak
                        </div>
                        <div>
                          <div className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                            {item.points} pts
                          </div>
                          <div className="text-[10px] font-medium text-emerald-900/50 dark:text-emerald-400">
                            Verified
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
