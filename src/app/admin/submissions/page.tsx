"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Camera,
  Target,
  Sparkles,
  Award,
  Check,
  X,
  ShieldCheck,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [challengeSubmissions, setChallengeSubmissions] = useState<any[]>([]);
  const [projectSubmissions, setProjectSubmissions] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [activeTab, setActiveTab] = useState<"challenges" | "projects">("challenges");
  const [loading, setLoading] = useState<boolean>(true);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [activeSubmission, setActiveSubmission] = useState<any | null>(null);
  const [submissionType, setSubmissionType] = useState<"CHALLENGE" | "PROJECT">("CHALLENGE");
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [feedback, setFeedback] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Full-size image preview modal
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/admin/submissions");
      } else if (user.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  const fetchSubmissions = async (status: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/submissions?status=${status}`);
      const data = await res.json();
      if (data.success) {
        setChallengeSubmissions(data.challengeSubmissions || []);
        setProjectSubmissions(data.projectSubmissions || []);
      } else {
        showToast(data.error || "Failed to load submissions", "error");
      }
    } catch {
      showToast("Error loading submissions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchSubmissions(statusFilter);
    }
  }, [user, statusFilter]);

  // Open review modal
  const handleOpenReview = (submission: any, type: "CHALLENGE" | "PROJECT", action: "APPROVE" | "REJECT") => {
    setActiveSubmission(submission);
    setSubmissionType(type);
    setReviewAction(action);
    setFeedback(action === "APPROVE" ? "Evidence verified and approved." : "Photo evidence unclear or does not match requirements.");
    setReviewModalOpen(true);
  };

  // Submit decision
  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;

    setSubmittingReview(true);

    try {
      const res = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionType,
          submissionId: activeSubmission.id,
          action: reviewAction,
          feedback,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setReviewModalOpen(false);
        fetchSubmissions(statusFilter);
      } else {
        showToast(data.error || "Failed to review submission", "error");
      }
    } catch {
      showToast("Network error during submission review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const currentList = activeTab === "challenges" ? challengeSubmissions : projectSubmissions;

  return (
    <div className="w-full min-h-[calc(100vh-68px)] py-12 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-darktext flex justify-center relative overflow-hidden transition-colors">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-96 bg-emerald-500/10 dark:bg-[#43E6A1]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sage/40 dark:border-night-border">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal/70 dark:text-darktext-secondary hover:text-forest dark:hover:text-emeraldaccent transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin Console</span>
            </Link>
            <h1 className="text-3xl font-black font-heading text-charcoal dark:text-darktext tracking-tight">
              Submission Verification Queue
            </h1>
            <p className="text-xs text-charcoal/60 dark:text-darktext-muted mt-0.5">
              Carefully verify evidence photos before approving to ensure genuine sustainability action and prevent gaming.
            </p>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            {["PENDING", "APPROVED", "REJECTED", "ALL"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  statusFilter === st
                    ? "bg-forest hover:bg-forest-light text-white dark:bg-emeraldaccent dark:text-night dark:hover:bg-emeraldaccent-hover border-transparent shadow-glow"
                    : "bg-white dark:bg-night-card text-charcoal/70 dark:text-darktext-secondary border-sage/40 dark:border-night-border hover:text-charcoal dark:hover:text-darktext hover:bg-cream-100 dark:hover:bg-night-border"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Selector: Challenges vs Projects */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("challenges")}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all border flex items-center gap-2 ${
              activeTab === "challenges"
                ? "bg-forest hover:bg-forest-light text-white dark:bg-emeraldaccent dark:text-night dark:hover:bg-emeraldaccent-hover border-transparent shadow-glow"
                : "bg-white dark:bg-night-secondary text-charcoal/70 dark:text-darktext-secondary border-sage/40 dark:border-night-border hover:bg-cream-100 dark:hover:bg-night-card hover:text-charcoal dark:hover:text-darktext"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Daily Eco Quests ({challengeSubmissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all border flex items-center gap-2 ${
              activeTab === "projects"
                ? "bg-forest hover:bg-forest-light text-white dark:bg-emeraldaccent dark:text-night dark:hover:bg-emeraldaccent-hover border-transparent shadow-glow"
                : "bg-white dark:bg-night-secondary text-charcoal/70 dark:text-darktext-secondary border-sage/40 dark:border-night-border hover:bg-cream-100 dark:hover:bg-night-card hover:text-charcoal dark:hover:text-darktext"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Completed DIY Projects ({projectSubmissions.length})</span>
          </button>
        </div>

        {/* Submissions List */}
        <div className="p-8 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-4 transition-colors">
          {loading ? (
            <p className="text-center py-12 text-sm text-charcoal/60 dark:text-darktext-muted font-semibold">
              Loading submissions in queue...
            </p>
          ) : currentList.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-forest/40 dark:text-emeraldaccent/40 mx-auto" />
              <h3 className="font-bold font-heading text-charcoal dark:text-darktext text-base">
                Queue Clear!
              </h3>
              <p className="text-xs text-charcoal/60 dark:text-darktext-muted">
                No submissions matching &quot;{statusFilter}&quot; currently in the queue.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentList.map((sub: any) => {
                const isChallenge = activeTab === "challenges";
                const title = isChallenge
                  ? sub.challenge?.title
                  : sub.transformationOption?.title;
                const rewardPoints = isChallenge
                  ? sub.challenge?.pointsReward
                  : sub.pointsAwarded || 40;

                return (
                  <div
                    key={sub.id}
                    className="p-5 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-forest/40 dark:hover:border-emeraldaccent/40 transition-colors"
                  >
                    {/* Left: User & Evidence Image */}
                    <div className="flex items-start gap-4">
                      <div
                        onClick={() => setImageModalUrl(sub.evidenceUrl)}
                        className="relative w-24 h-24 rounded-2xl overflow-hidden border border-sage/40 dark:border-night-border shrink-0 cursor-pointer group bg-sage/20 dark:bg-black/40"
                      >
                        <img
                          src={sub.evidenceUrl}
                          alt="Evidence"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-charcoal/50 dark:bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Eye className="w-5 h-5 text-emeraldaccent" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white dark:bg-night-secondary border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent">
                            +{rewardPoints} pts
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                              sub.status === "APPROVED"
                                ? "bg-emerald-500/15 text-forest dark:text-emeraldaccent border-emerald-500/30"
                                : sub.status === "REJECTED"
                                ? "bg-amber-500/15 text-terra dark:text-[#E07A5F] border-amber-500/30 dark:border-[#E07A5F]/30"
                                : "bg-white dark:bg-night-secondary text-charcoal/70 dark:text-darktext-secondary border-sage/30 dark:border-night-border"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>

                        <h4 className="font-bold font-heading text-base text-charcoal dark:text-darktext">
                          {title}
                        </h4>

                        <p className="text-xs text-charcoal/70 dark:text-darktext-secondary">
                          Submitted by: <strong className="font-semibold text-charcoal dark:text-darktext">{sub.user?.name}</strong> ({sub.user?.email})
                        </p>

                        {(sub.description || sub.notes) && (
                          <p className="text-xs text-charcoal/60 dark:text-darktext-muted italic">
                            &quot;{sub.description || sub.notes}&quot;
                          </p>
                        )}

                        <p className="text-[10px] text-charcoal/50 dark:text-darktext-muted">
                          Received: {new Date(sub.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                      {sub.status === "PENDING" ? (
                        <>
                          <button
                            onClick={() => handleOpenReview(sub, isChallenge ? "CHALLENGE" : "PROJECT", "APPROVE")}
                            className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover dark:text-night font-bold text-xs shadow-glow flex items-center gap-1.5 transition-all"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve & Award</span>
                          </button>
                          <button
                            onClick={() => handleOpenReview(sub, isChallenge ? "CHALLENGE" : "PROJECT", "REJECT")}
                            className="px-4 py-2 rounded-xl border border-amber-500/40 dark:border-[#E07A5F]/40 text-terra dark:text-[#E07A5F] hover:bg-amber-500/10 dark:hover:bg-[#E07A5F]/10 font-bold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject with Reason</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-right text-xs">
                          <span className="font-semibold text-charcoal/60 dark:text-darktext-muted">
                            Reviewed by: {sub.reviewer?.name || "Moderator"}
                          </span>
                          {sub.reviewerFeedback && (
                            <p className="text-[11px] text-charcoal/70 dark:text-darktext-secondary mt-0.5 max-w-xs">
                              Note: {sub.reviewerFeedback}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Review Decision Modal */}
        <AnimatePresence>
          {reviewModalOpen && activeSubmission && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border rounded-3xl p-6 sm:p-8 shadow-elevated space-y-5"
              >
                <div className="flex items-center justify-between border-b border-sage/30 dark:border-night-border pb-4">
                  <h3 className="text-base font-black font-heading text-charcoal dark:text-darktext">
                    Confirm Review Decision ({reviewAction})
                  </h3>
                  <button
                    onClick={() => setReviewModalOpen(false)}
                    className="p-1.5 rounded-lg text-charcoal/50 dark:text-darktext-muted hover:text-charcoal dark:hover:text-darktext hover:bg-cream-100 dark:hover:bg-night-card transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleConfirmReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/70 dark:text-darktext-secondary mb-1.5">
                      Reviewer Feedback / Reason
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full p-3 rounded-xl border border-sage/40 dark:border-night-border bg-cream-50 dark:bg-night-card text-charcoal dark:text-darktext text-xs font-medium focus:outline-none focus:border-forest dark:focus:border-emeraldaccent focus:ring-1 focus:ring-forest dark:focus:ring-emeraldaccent"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setReviewModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-sage/40 dark:border-night-border text-xs font-semibold text-charcoal/70 dark:text-darktext-secondary hover:bg-cream-100 dark:hover:bg-night-card transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className={`px-5 py-2 rounded-xl font-bold text-xs shadow-soft transition-all ${
                        reviewAction === "APPROVE"
                          ? "bg-forest hover:bg-forest-light text-white dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover dark:text-night shadow-glow"
                          : "bg-terra hover:bg-terra/90 text-white"
                      }`}
                    >
                      {submittingReview ? "Processing..." : `Confirm ${reviewAction}`}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Image Full Preview Modal */}
        <AnimatePresence>
          {imageModalUrl && (
            <div
              onClick={() => setImageModalUrl(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
            >
              <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden border border-sage/40 dark:border-night-border shadow-2xl">
                <img src={imageModalUrl} alt="Evidence full preview" className="w-full h-full object-contain" />
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
