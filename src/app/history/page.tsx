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
  Layers,
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
      <div className="w-full min-h-[calc(100vh-68px)] py-12 flex items-center justify-center bg-cream dark:bg-night text-sm font-semibold text-charcoal/60 dark:text-darktext-muted transition-colors">
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
    <div className="w-full min-h-[calc(100vh-68px)] py-12 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-darktext flex justify-center relative overflow-hidden transition-colors">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-96 bg-emerald-500/10 dark:bg-[#43E6A1]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-semibold uppercase tracking-wider">
            <HistoryIcon className="w-4 h-4 text-forest dark:text-emeraldaccent" />
            <span>Environmental Journal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-charcoal dark:text-darktext">
            Activity Timeline
          </h1>
          <p className="text-sm sm:text-base text-charcoal/70 dark:text-darktext-secondary max-w-xl mx-auto">
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                filterType === tab.id
                  ? "bg-forest text-white border-forest shadow-glow dark:bg-emeraldaccent dark:text-night dark:border-emeraldaccent"
                  : "bg-white dark:bg-night-secondary text-charcoal/70 dark:text-darktext-secondary border-sage/40 dark:border-night-border hover:text-charcoal dark:hover:text-darktext hover:bg-cream-50 dark:hover:bg-night-card"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Timeline Entries */}
        <div className="space-y-4">
          {allEvents.length === 0 ? (
            <div className="p-16 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-center space-y-3 transition-colors">
              <HistoryIcon className="w-10 h-10 text-charcoal/40 dark:text-darktext-muted mx-auto" />
              <h3 className="text-lg font-bold font-heading text-charcoal dark:text-darktext">No events found</h3>
              <p className="text-xs text-charcoal/60 dark:text-darktext-muted">
                Your activity timeline updates automatically whenever you scan waste items or complete challenges.
              </p>
            </div>
          ) : (
            allEvents.map((event, idx) => (
              <div
                key={event.id || idx}
                className="p-5 rounded-2xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-forest/40 dark:hover:border-emeraldaccent/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent">
                      {event.category}
                    </span>
                    <span className="text-xs text-charcoal/60 dark:text-darktext-muted">
                      {event.date.toLocaleDateString()} at {event.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <h4 className="font-bold font-heading text-sm text-charcoal dark:text-darktext">
                    {event.title}
                  </h4>
                  {event.details && (
                    <p className="text-xs text-charcoal/70 dark:text-darktext-secondary">{event.details}</p>
                  )}
                  {event.feedback && (
                    <p className="text-xs text-forest dark:text-emeraldaccent italic">Reviewer Feedback: {event.feedback}</p>
                  )}
                </div>

                <div className="shrink-0 self-start sm:self-center">
                  {event.amount !== undefined ? (
                    <span className={`font-black font-heading text-sm ${event.amount > 0 ? "text-forest dark:text-emeraldaccent" : "text-terra dark:text-[#E07A5F]"}`}>
                      {event.amount > 0 ? `+${event.amount}` : event.amount} pts
                    </span>
                  ) : (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      event.status === "APPROVED" || event.status === "COMPLETED"
                        ? "bg-emerald-500/15 text-forest dark:text-emeraldaccent border-emerald-500/30"
                        : event.status === "REJECTED"
                        ? "bg-amber-500/15 text-terra dark:text-[#E07A5F] border-amber-500/30"
                        : "bg-cream-50 dark:bg-night-card text-charcoal/70 dark:text-darktext-secondary border border-sage/30 dark:border-night-border"
                    }`}>
                      {event.status}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
