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
  ArrowRight,
  ShieldCheck,
  Award,
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
  const remainder = leaderboard.slice(3);

  return (
    <div className="w-full min-h-[calc(100vh-68px)] py-12 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-darktext flex justify-center transition-colors relative overflow-hidden">
      {/* Soft atmospheric ambient glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-96 bg-emerald-500/10 dark:bg-[#43E6A1]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-semibold tracking-wider uppercase">
            <Trophy className="w-4 h-4 text-forest dark:text-emeraldaccent" />
            <span>Community Honor Roll</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-charcoal dark:text-darktext">
            Sustainability Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-charcoal/70 dark:text-darktext-secondary max-w-xl mx-auto">
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
                    ? "bg-forest text-white border-forest shadow-glow dark:bg-emeraldaccent dark:text-night dark:border-emeraldaccent"
                    : "bg-white dark:bg-night-secondary text-charcoal/70 dark:text-darktext-secondary border-sage/40 dark:border-night-border hover:bg-cream-50 dark:hover:bg-night-card hover:text-charcoal dark:hover:text-darktext"
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
          <div
            className="p-5 rounded-2xl bg-white dark:bg-night-secondary border border-forest/30 dark:border-[#43E6A1]/40 text-charcoal dark:text-darktext shadow-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-cream-50 dark:bg-night-card border border-forest/40 dark:border-[#43E6A1]/50 text-forest dark:text-emeraldaccent flex items-center justify-center font-black font-heading text-lg">
                #{userRank.rank || "—"}
              </div>
              <div>
                <p className="text-[11px] text-forest dark:text-emeraldaccent font-semibold uppercase tracking-wider">
                  Your Current Standing
                </p>
                <p className="text-base font-bold font-heading text-charcoal dark:text-darktext">
                  {user.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs sm:text-sm font-bold">
              <div>
                <span className="text-charcoal/60 dark:text-darktext-muted block text-[11px] font-medium">Points</span>
                <span className="text-forest dark:text-emeraldaccent">{userRank.points} pts</span>
              </div>
              <div>
                <span className="text-charcoal/60 dark:text-darktext-muted block text-[11px] font-medium">Streak</span>
                <span className="text-terra dark:text-[#E07A5F]">🔥 {userRank.streak} days</span>
              </div>
              <div>
                <span className="text-charcoal/60 dark:text-darktext-muted block text-[11px] font-medium">Quests</span>
                <span className="text-charcoal dark:text-darktext">{userRank.completedChallengesCount || 0} done</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="p-16 text-center text-sm font-semibold text-charcoal/60 dark:text-darktext-muted">
            Gathering verified community standings...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-center space-y-4 transition-colors">
            <Trophy className="w-12 h-12 text-charcoal/40 dark:text-darktext-muted mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-heading text-charcoal dark:text-darktext">
                Be The First Guardian on the Leaderboard!
              </h3>
              <p className="text-xs text-charcoal/60 dark:text-darktext-muted max-w-sm mx-auto">
                No approved activities yet for this period. Scan your first waste item or complete a daily challenge to take the #1 spot!
              </p>
            </div>
            <Link
              href="/challenges"
              className="inline-block px-6 py-3 rounded-2xl bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover text-white dark:text-night font-bold text-xs shadow-glow transition-all"
            >
              Start an Eco Challenge
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top 3 Podium (Linear-inspired creative composition) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-4 items-end">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="order-2 sm:order-1 p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated text-center flex flex-col items-center space-y-3 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest-light dark:text-emeraldaccent-light font-black font-heading text-xs flex items-center justify-center">
                    #2
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-cream-50 dark:bg-night-card border border-teal-500/40 text-forest-light dark:text-emeraldaccent-light font-black font-heading text-lg flex items-center justify-center uppercase shadow-sm">
                    {topThree[1].name.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold font-heading text-charcoal dark:text-darktext text-sm truncate max-w-[150px]">
                      {topThree[1].name}
                    </h4>
                    <p className="text-xs font-black text-forest-light dark:text-emeraldaccent-light mt-0.5">
                      {topThree[1].points} pts
                    </p>
                    <p className="text-[11px] text-terra dark:text-[#E07A5F] font-semibold">
                      🔥 {topThree[1].streak}d streak
                    </p>
                  </div>
                </div>
              )}

              {/* 1st Place (Center elevated podium) */}
              {topThree[0] && (
                <div className="order-1 sm:order-2 p-8 rounded-3xl bg-white dark:bg-night-secondary border border-forest/40 dark:border-[#43E6A1]/60 shadow-elevated text-center flex flex-col items-center space-y-4 -translate-y-2 relative overflow-hidden transition-colors">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-forest dark:via-[#43E6A1] to-transparent shadow-[0_0_15px_#43E6A1]" />
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-50 dark:bg-night-card border border-forest/30 dark:border-[#43E6A1]/40 text-forest dark:text-emeraldaccent font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
                    <span>Grand Champion</span>
                  </div>
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-cream-50 dark:bg-night-card border border-forest dark:border-[#43E6A1] text-forest dark:text-emeraldaccent font-black font-heading text-2xl flex items-center justify-center uppercase shadow-glow">
                    {topThree[0].name.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-black font-heading text-charcoal dark:text-darktext text-base truncate max-w-[180px]">
                      {topThree[0].name}
                    </h4>
                    <p className="text-base font-black text-forest dark:text-emeraldaccent mt-0.5">
                      {topThree[0].points} pts
                    </p>
                    <p className="text-xs text-terra dark:text-[#E07A5F] font-bold">
                      🔥 {topThree[0].streak}d streak • {topThree[0].completedChallengesCount || 0} quests
                    </p>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="order-3 sm:order-3 p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated text-center flex flex-col items-center space-y-3 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-[#B6EAD0] font-black font-heading text-xs flex items-center justify-center">
                    #3
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-cream-50 dark:bg-night-card border border-emerald-500/40 text-forest dark:text-[#B6EAD0] font-black font-heading text-lg flex items-center justify-center uppercase shadow-sm">
                    {topThree[2].name.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold font-heading text-charcoal dark:text-darktext text-sm truncate max-w-[150px]">
                      {topThree[2].name}
                    </h4>
                    <p className="text-xs font-black text-forest dark:text-[#B6EAD0] mt-0.5">
                      {topThree[2].points} pts
                    </p>
                    <p className="text-[11px] text-terra dark:text-[#E07A5F] font-semibold">
                      🔥 {topThree[2].streak}d streak
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Rank 4+ List View */}
            {remainder.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-3 transition-colors">
                <div className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted px-3 pb-2 border-b border-sage/30 dark:border-night-border">
                  Ranks 4+ Sustainability Guardians
                </div>

                <div className="divide-y divide-sage/30 dark:divide-night-border">
                  {remainder.map((item, index) => (
                    <div
                      key={item.userId}
                      className="py-3 px-3 flex items-center justify-between text-xs sm:text-sm hover:bg-cream-50 dark:hover:bg-night-card rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-6 text-center font-bold text-charcoal/60 dark:text-darktext-muted">
                          #{index + 4}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-charcoal/70 dark:text-darktext-secondary font-bold text-xs flex items-center justify-center uppercase">
                          {item.name.slice(0, 2)}
                        </div>
                        <span className="font-bold text-charcoal dark:text-darktext">
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 font-semibold">
                        <span className="text-terra dark:text-[#E07A5F] text-xs">
                          🔥 {item.streak}d
                        </span>
                        <span className="text-forest dark:text-emeraldaccent font-bold">
                          {item.points} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
