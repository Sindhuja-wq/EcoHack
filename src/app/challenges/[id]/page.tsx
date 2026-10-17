"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import {
  ArrowLeft,
  Target,
  Sparkles,
  Camera,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  X,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { user } = useAuth();
  const { showToast } = useToast();

  const [challenge, setChallenge] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Evidence submission modal state
  const [submitModalOpen, setSubmitModalOpen] = useState<boolean>(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/challenges/${id}`);
      const data = await res.json();
      if (data.success && data.challenge) {
        setChallenge(data.challenge);
      } else {
        showToast("Challenge not found", "error");
      }
    } catch {
      showToast("Error loading challenge details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchChallenge();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file (JPEG, PNG, WebP)", "error");
      return;
    }

    setEvidenceFile(file);
    const reader = new FileReader();
    reader.onload = () => setEvidencePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceFile || !challenge) {
      showToast("Please select a photo as evidence.", "error");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", evidenceFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        showToast(uploadData.error || "Failed to upload image", "error");
        setSubmitting(false);
        return;
      }

      const subRes = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge.id,
          evidenceUrl: uploadData.url,
          description,
        }),
      });

      const subData = await subRes.json();
      if (!subRes.ok || !subData.success) {
        showToast(subData.error || "Failed to submit challenge", "error");
        setSubmitting(false);
        return;
      }

      showToast("Challenge evidence submitted for moderator review!", "success");
      setSubmitModalOpen(false);
      fetchChallenge();
    } catch {
      showToast("Network error submitting challenge", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] py-12 flex items-center justify-center bg-nature-gradient dark:bg-night text-sm font-semibold text-emerald-900/60 dark:text-emerald-400">
        Loading challenge details...
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] py-12 flex flex-col items-center justify-center bg-nature-gradient dark:bg-night space-y-4">
        <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-100">Challenge Not Found</h2>
        <Link href="/challenges" className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs">
          Back to Challenges
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night flex justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <Link
          href="/challenges"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Challenges</span>
        </Link>

        {/* Main Details Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/25 shadow-soft-lg space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-500/15">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                  {challenge.category.toUpperCase()}
                </span>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Difficulty: {challenge.difficulty}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
                {challenge.title}
              </h1>
            </div>

            <div className="text-right shrink-0">
              <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                +{challenge.pointsReward} pts
              </div>
              <div className="text-xs font-semibold text-emerald-900/60 dark:text-emerald-400">
                Approved Reward
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
              Quest Briefing
            </h3>
            <p className="text-base text-emerald-950/85 dark:text-emerald-200 leading-relaxed">
              {challenge.description}
            </p>
          </div>

          {/* Why It Matters */}
          <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-night-hover/80 border border-emerald-500/20 space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Environmental Significance
            </h4>
            <p className="text-xs text-emerald-950/80 dark:text-emerald-200 leading-relaxed">
              {challenge.whyItMatters}
            </p>
          </div>

          {/* Suggested Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
              Suggested Practical Actions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {challenge.suggestedActions?.map((act: string, i: number) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-white dark:bg-night border border-emerald-500/15 flex items-start gap-2 text-xs text-emerald-950 dark:text-emerald-200 font-medium"
                >
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Completion Requirements */}
          <div className="p-5 rounded-2xl bg-white dark:bg-night border border-emerald-500/15 space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
              Evidence Requirements
            </h4>
            <p className="text-xs text-emerald-950/80 dark:text-emerald-200 leading-relaxed">
              {challenge.completionRequirements}
            </p>
          </div>

          {/* User Status / Action Button */}
          <div className="pt-4 border-t border-emerald-500/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-emerald-900/60 dark:text-emerald-400 block font-medium">
                Current Status for Your Account:
              </span>
              <span className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                {challenge.userStatus === "APPROVED"
                  ? "✅ Completed & Verified"
                  : challenge.userStatus === "PENDING"
                  ? "⏳ Evidence Under Review"
                  : challenge.userStatus === "REJECTED"
                  ? "❌ Changes Requested"
                  : "⚪ Not Yet Started"}
              </span>
            </div>

            {challenge.userStatus !== "APPROVED" && (
              <button
                onClick={() => {
                  if (!user) {
                    showToast("Please log in to submit challenge evidence.", "info");
                    return;
                  }
                  setSubmitModalOpen(true);
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 shadow-soft transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Submit Verification Photo</span>
              </button>
            )}
          </div>
        </div>

        {/* User's Previous Submissions History for this Challenge */}
        {challenge.submissions && challenge.submissions.length > 0 && (
          <div className="p-8 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft space-y-4">
            <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
              Your Submission History
            </h3>
            <div className="space-y-3">
              {challenge.submissions.map((sub: any) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-night-hover/50 border border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={sub.evidenceUrl}
                      alt="Submitted evidence"
                      className="w-14 h-14 rounded-xl object-cover border border-emerald-500/20"
                    />
                    <div>
                      <p className="font-semibold text-emerald-950 dark:text-emerald-100">
                        {sub.description || "Photo evidence submitted"}
                      </p>
                      <p className="text-[11px] text-emerald-900/60 dark:text-emerald-400">
                        Submitted on {new Date(sub.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        sub.status === "APPROVED"
                          ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                          : sub.status === "REJECTED"
                          ? "bg-rose-500/20 text-rose-800 dark:text-rose-300"
                          : "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      {sub.status}
                    </span>
                    {sub.reviewerFeedback && (
                      <p className="text-[11px] text-emerald-900/70 dark:text-emerald-300 mt-1">
                        Feedback: {sub.reviewerFeedback}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evidence Submission Modal */}
        <AnimatePresence>
          {submitModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-night-card rounded-3xl p-6 sm:p-8 shadow-soft-lg border border-emerald-500/25 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-emerald-500/15 pb-4">
                  <h3 className="text-lg font-black text-emerald-950 dark:text-emerald-100">
                    Upload Quest Evidence
                  </h3>
                  <button
                    onClick={() => setSubmitModalOpen(false)}
                    className="p-1 rounded-lg text-emerald-900/60 hover:text-emerald-900 dark:text-emerald-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitEvidence} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-2">
                      Proof Photo
                    </label>
                    {evidencePreview ? (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-emerald-500/30">
                        <img src={evidencePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setEvidenceFile(null);
                            setEvidencePreview(null);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-emerald-500/35 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer block hover:bg-emerald-500/5 transition-colors">
                        <Camera className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                          Select photo showing completion
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          required
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                      Description (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Completed today during afternoon commute"
                      className="w-full p-3 rounded-xl border border-emerald-500/25 dark:border-emerald-500/30 bg-white/70 dark:bg-night-hover/70 text-emerald-950 dark:text-white placeholder:text-emerald-900/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSubmitModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-emerald-500/20 text-xs font-semibold text-emerald-900 dark:text-emerald-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !evidenceFile}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 transition-colors shadow-soft"
                    >
                      {submitting ? "Uploading..." : "Submit for Verification"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
