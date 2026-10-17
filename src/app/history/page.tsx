"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import {
  History as HistoryIcon,
  Sparkles,
  Camera,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<"all" | "scans" | "submissions" | "transactions">("all");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch {
      showToast("Error loading activity history", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/history");
      return;
    }
    if (user) {
      fetchHistory();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] py-12 flex items-center justify-center bg-nature-gradient dark:bg-night text-sm font-semibold text-emerald-900/60 dark:text-emerald-400">
        Loading personal history timeline...
      </div>
    );
  }

  // Compile combined chronological timeline
  const scans = (profile?.analyses || []).map((a: any) => ({
    id: a.id,
    type: "SCAN",
    title: `Analyzed item: ${a.detectedItem}`,
    category: a.materialCategory,
    date: new Date(a.createdAt),
    status: "COMPLETED",
    details: `${a.options?.length || 0} transformation blueprints generated`,
  }));

  const challengeSubs = (profile?.submissions || []).map((s: any) => ({
    id: s.id,
    type: "CHALLENGE_SUBMISSION",
    title: `Quest: ${s.challenge?.title || "Daily Eco Challenge"}`,
    category: "Challenge Quest",
    date: new Date(s.createdAt),
    status: s.status,
    details: s.description || "Evidence uploaded for verification",
    feedback: s.reviewerFeedback,
    imageUrl: s.evidenceUrl,
  }));

  const projectSubs = (profile?.projectSubmissions || []).map((p: any) => ({
    id: p.id,
    type: "PROJECT_SUBMISSION",
    title: `DIY Upcycle: ${p.transformationOption?.title || "Waste Transformation"}`,
    category: "Transformation",
    date: new Date(p.createdAt),
    status: p.status,
    details: p.notes || "Completed project evidence uploaded",
    feedback: p.reviewerFeedback,
    imageUrl: p.evidenceUrl,
  }));

  const transactions = (profile?.transactions || []).map((t: any) => ({
    id: t.id,
    type: "POINT_TRANSACTION",
    title: t.description,
    category: "Eco-Points",
    date: new Date(t.createdAt),
    status: "AWARDED",
    amount: t.amount,
  }));

  let allEvents = [...scans, ...challengeSubs, ...projectSubs, ...transactions];
  allEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

  if (filterType === "scans") {
    allEvents = allEvents.filter((e) => e.type === "SCAN");
  } else if (filterType === "submissions") {
    allEvents = allEvents.filter((e) => e.type === "CHALLENGE_SUBMISSION" || e.type === "PROJECT_SUBMISSION");
  } else if (filterType === "transactions") {
    allEvents = allEvents.filter((e) => e.type === "POINT_TRANSACTION");
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night flex justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <HistoryIcon className="w-4 h-4" />
            <span>Environmental Journal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-emerald-950 dark:text-emerald-50 tracking-tight">
            Activity Timeline
          </h1>
          <p className="text-sm sm:text-base text-emerald-950/70 dark:text-emerald-300/80 max-w-xl mx-auto">
            A comprehensive, transparent record of your scans, verified quest completions, and eco-point transactions.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { id: "all", label: "All Activity" },
            { id: "scans", label: "Waste Scans" },
            { id: "submissions", label: "Quest & Project Submissions" },
            { id: "transactions", label: "Point Transactions" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filterType === tab.id
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-soft"
                  : "bg-white/80 dark:bg-night-card/80 text-emerald-950/70 dark:text-emerald-200 border-emerald-500/20 hover:bg-emerald-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Timeline list */}
        <div className="p-8 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft space-y-6">
          {allEvents.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm font-semibold text-emerald-900/60 dark:text-emerald-400">
                No activity found matching this filter.
              </p>
              <Link
                href="/scanner"
                className="inline-block px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs"
              >
                Scan Your First Item
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {allEvents.map((evt, idx) => (
                <div
                  key={`${evt.id}-${idx}`}
                  className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-night-hover/40 border border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                      {evt.type === "SCAN" && <Camera className="w-5 h-5" />}
                      {evt.type === "CHALLENGE_SUBMISSION" && <Target className="w-5 h-5" />}
                      {evt.type === "PROJECT_SUBMISSION" && <Sparkles className="w-5 h-5" />}
                      {evt.type === "POINT_TRANSACTION" && <CheckCircle2 className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
                          {evt.category}
                        </span>
                        <span className="text-[11px] text-emerald-900/50 dark:text-emerald-400">
                          {evt.date.toLocaleDateString()} at {evt.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100 mt-1">
                        {evt.title}
                      </h4>

                      {evt.details && (
                        <p className="text-emerald-900/70 dark:text-emerald-300 mt-0.5">
                          {evt.details}
                        </p>
                      )}

                      {evt.feedback && (
                        <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300 mt-1 italic">
                          Moderator Note: {evt.feedback}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {evt.amount !== undefined ? (
                      <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                        +{evt.amount} pts
                      </span>
                    ) : (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          evt.status === "APPROVED" || evt.status === "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                            : evt.status === "REJECTED"
                            ? "bg-rose-500/20 text-rose-800 dark:text-rose-300"
                            : "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        {evt.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
