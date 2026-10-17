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
    <div className="w-full min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night flex justify-center">
      <div className="max-w-7xl w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-500/20">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 hover:underline mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin Console</span>
            </Link>
            <h1 className="text-3xl font-black text-emerald-950 dark:text-emerald-50 tracking-tight">
              Submission Verification Queue
            </h1>
            <p className="text-xs text-emerald-900/60 dark:text-emerald-400 mt-0.5">
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
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                    : "bg-white/80 dark:bg-night-card/80 text-emerald-950/70 dark:text-emerald-200 border-emerald-500/20 hover:bg-emerald-50"
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
                ? "bg-emerald-700 text-white border-emerald-700 shadow-soft"
                : "bg-white/80 dark:bg-night-card/80 text-emerald-950/80 dark:text-emerald-200 border-emerald-500/20 hover:bg-emerald-50"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Daily Eco Quests ({challengeSubmissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all border flex items-center gap-2 ${
              activeTab === "projects"
                ? "bg-emerald-700 text-white border-emerald-700 shadow-soft"
                : "bg-white/80 dark:bg-night-card/80 text-emerald-950/80 dark:text-emerald-200 border-emerald-500/20 hover:bg-emerald-50"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Completed DIY Projects ({projectSubmissions.length})</span>
          </button>
        </div>

        {/* Submissions List */}
        <div className="p-8 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft space-y-4">
          {loading ? (
            <p className="text-center py-12 text-sm text-emerald-900/60 dark:text-emerald-400 font-semibold">
              Loading submissions in queue...
            </p>
          ) : currentList.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600/40 mx-auto" />
              <h3 className="font-bold text-emerald-950 dark:text-emerald-100 text-base">
                Queue Clear!
              </h3>
              <p className="text-xs text-emerald-900/60 dark:text-emerald-400">
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
                    className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-night-hover/40 border border-emerald-500/15 flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    {/* Left: User & Evidence Image */}
                    <div className="flex items-start gap-4">
                      <div
                        onClick={() => setImageModalUrl(sub.evidenceUrl)}
                        className="relative w-24 h-24 rounded-2xl overflow-hidden border border-emerald-500/25 shrink-0 cursor-pointer group bg-black/10"
                      >
                        <img
                          src={sub.evidenceUrl}
                          alt="Evidence"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Eye className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                            +{rewardPoints} pts
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                              sub.status === "APPROVED"
                                ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                                : sub.status === "REJECTED"
                                ? "bg-rose-500/20 text-rose-800 dark:text-rose-300"
                                : "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>

                        <h4 className="font-bold text-base text-emerald-950 dark:text-emerald-100">
                          {title}
                        </h4>

                        <p className="text-xs text-emerald-900/80 dark:text-emerald-300">
                          Submitted by: <strong className="font-semibold">{sub.user?.name}</strong> ({sub.user?.email})
                        </p>

                        {(sub.description || sub.notes) && (
                          <p className="text-xs text-emerald-950/70 dark:text-emerald-400 italic">
                            &quot;{sub.description || sub.notes}&quot;
                          </p>
                        )}

                        <p className="text-[10px] text-emerald-900/50 dark:text-emerald-400">
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
                            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-soft flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve & Award</span>
                          </button>
                          <button
                            onClick={() => handleOpenReview(sub, isChallenge ? "CHALLENGE" : "PROJECT", "REJECT")}
                            className="px-4 py-2 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold text-xs flex items-center gap-1.5"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject with Reason</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-right text-xs">
                          <span className="font-semibold text-emerald-900/70 dark:text-emerald-400">
                            Reviewed by: {sub.reviewer?.name || "Moderator"}
                          </span>
                          {sub.reviewerFeedback && (
                            <p className="text-[11px] text-emerald-950/70 dark:text-emerald-400 mt-0.5 max-w-xs">
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white dark:bg-night-card rounded-3xl p-6 sm:p-8 shadow-soft-lg border border-emerald-500/25 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-emerald-500/15 pb-4">
                  <h3 className="text-base font-black text-emerald-950 dark:text-emerald-100">
                    Confirm Review Decision ({reviewAction})
                  </h3>
                  <button
                    onClick={() => setReviewModalOpen(false)}
                    className="p-1 rounded-lg text-emerald-900/60 hover:text-emerald-900 dark:text-emerald-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleConfirmReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                      Reviewer Feedback / Reason
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full p-3 rounded-xl border border-emerald-500/25 dark:border-emerald-500/30 bg-white/70 dark:bg-night-hover/70 text-emerald-950 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setReviewModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-emerald-500/20 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className={`px-5 py-2 rounded-xl font-bold text-xs text-white shadow-soft ${
                        reviewAction === "APPROVE" ? "bg-emerald-700 hover:bg-emerald-800" : "bg-rose-600 hover:bg-rose-700"
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
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer"
            >
              <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
                <img src={imageModalUrl} alt="Evidence full preview" className="w-full h-full object-contain" />
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
