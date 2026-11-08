"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, useToast } from "@/components/Providers";
import {
  Trophy,
  Flame,
  Globe,
  Calendar,
  Sparkles,
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

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-cream flex justify-center transition-colors">
      <div className="max-w-5xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest dark:text-limeaccent text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-forest dark:text-limeaccent" />
            <span>Community Honor Roll</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-charcoal dark:text-cream tracking-tight">
            Sustainability Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-charcoal/70 dark:text-cream/70 max-w-xl mx-auto">
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
                    ? "bg-forest text-white border-forest shadow-soft"
                    : "bg-white dark:bg-night-card text-charcoal/70 dark:text-cream/70 border-sage/30 hover:bg-cream"
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
            className="p-5 rounded-2xl bg-forest text-cream shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg">
                #{userRank.rank || "—"}
              </div>
              <div>
                <p className="text-xs text-limeaccent font-semibold uppercase tracking-wider">
                  Your Current Standing
                </p>
                <p className="text-base font-bold text-white">
                  {user.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs sm:text-sm font-bold">
              <div>
                <span className="text-cream/70 block text-[11px] font-medium">Points</span>
                <span>{userRank.points} pts</span>
              </div>
              <div>
                <span className="text-cream/70 block text-[11px] font-medium">Streak</span>
                <span className="text-limeaccent">🔥 {userRank.streak} days</span>
              </div>
              <div>
                <span className="text-cream/70 block text-[11px] font-medium">Quests</span>
                <span>{userRank.completedChallengesCount || 0} done</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="p-16 text-center text-sm font-semibold text-charcoal/60 dark:text-cream/60">
            Gathering verified community standings...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white dark:bg-night-card border border-sage/30 text-center space-y-4">
            <Trophy className="w-12 h-12 text-sage mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-charcoal dark:text-cream">
                Be The First Guardian on the Leaderboard!
              </h3>
              <p className="text-xs text-charcoal/60 dark:text-cream/60 max-w-sm mx-auto">
                No approved activities yet for this period. Scan your first waste item or complete a daily challenge to take the #1 spot!
              </p>
            </div>
            <Link
              href="/challenges"
              className="inline-block px-6 py-3 rounded-2xl bg-forest text-white font-bold text-xs shadow-soft"
            >
              Start an Eco Challenge
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-4 items-end">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="order-2 sm:order-1 p-6 rounded-3xl bg-white dark:bg-night-card border border-sage/30 shadow-soft text-center flex flex-col items-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-sage/30 text-charcoal dark:text-cream font-black text-sm flex items-center justify-center">
                    #2
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-sage text-charcoal font-black text-lg flex items-center justify-center uppercase shadow-sm">
                    {topThree[1].name.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-charcoal dark:text-cream text-sm truncate max-w-[150px]">
                      {topThree[1].name}
                    </h4>
                    <p className="text-xs font-black text-forest dark:text-limeaccent mt-0.5">
                      {topThree[1].points} pts
                    </p>
                    <p className="text-[11px] text-terracotta font-semibold">
                      🔥 {topThree[1].streak}d streak
                    </p>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <div className="order-1 sm:order-2 p-8 rounded-3xl bg-white dark:bg-night-card border-2 border-forest shadow-soft-lg text-center flex flex-col items-center space-y-4 -translate-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest text-limeaccent font-bold text-xs uppercase tracking-wider">
                    <Trophy className="w-4 h-4 text-limeaccent" />
                    <span>Grand Champion</span>
                  </div>
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-forest text-limeaccent font-black text-2xl flex items-center justify-center uppercase shadow-md">
                    {topThree[0].name.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-black text-charcoal dark:text-cream text-base truncate max-w-[180px]">
                      {topThree[0].name}
                    </h4>
                    <p className="text-base font-black text-forest dark:text-limeaccent mt-0.5">
                      {topThree[0].points} pts
                    </p>
                    <p className="text-xs text-terracotta font-bold">
                      🔥 {topThree[0].streak}d streak • {topThree[0].completedChallengesCount || 0} quests
                    </p>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="order-3 p-6 rounded-3xl bg-white dark:bg-night-card border border-sage/30 shadow-soft text-center flex flex-col items-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-terracotta/20 text-terracotta font-black text-sm flex items-center justify-center">
                    #3
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-terracotta text-white font-black text-lg flex items-center justify-center uppercase shadow-sm">
                    {topThree[2].name.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-charcoal dark:text-cream text-sm truncate max-w-[150px]">
                      {topThree[2].name}
                    </h4>
                    <p className="text-xs font-black text-forest dark:text-limeaccent mt-0.5">
                      {topThree[2].points} pts
                    </p>
                    <p className="text-[11px] text-terracotta font-semibold">
                      🔥 {topThree[2].streak}d streak
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Rankings Table */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-night-card border border-sage/30 shadow-soft space-y-4">
              <h3 className="text-lg font-bold text-charcoal dark:text-cream">
                Community Rankings
              </h3>

              <div className="divide-y divide-sage/20">
                {leaderboard.map((item, index) => {
                  const isCurrentUser = user && user.id === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`py-3.5 px-4 rounded-2xl flex items-center justify-between gap-4 transition-colors ${
                        isCurrentUser
                          ? "bg-forest/10 border border-forest/30"
                          : "hover:bg-cream/60 dark:hover:bg-night-hover/60"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-7 text-center font-black text-sm text-charcoal/60 dark:text-cream/60">
                          #{item.rank || index + 1}
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-forest text-limeaccent font-bold text-xs flex items-center justify-center uppercase shadow-sm">
                          {item.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-charcoal dark:text-cream">
                              {item.name}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-forest text-white">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-charcoal/60 dark:text-cream/60 font-medium">
                            <span>{item.completedChallengesCount || 0} quests verified</span>
                            {item.badgesCount > 0 && (
                              <span>• {item.badgesCount} badges</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-6 text-right">
                        <div className="hidden sm:block text-xs font-semibold text-terracotta">
                          🔥 {item.streak}d streak
                        </div>
                        <div>
                          <div className="text-sm font-black text-forest dark:text-limeaccent">
                            {item.points} pts
                          </div>
                          <div className="text-[10px] font-medium text-charcoal/50 dark:text-cream/50">
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
