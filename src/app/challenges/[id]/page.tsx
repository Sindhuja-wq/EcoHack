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
      <div className="w-full min-h-[calc(100vh-68px)] py-12 flex items-center justify-center bg-cream dark:bg-night text-sm font-semibold text-charcoal/60 dark:text-darktext-muted transition-colors">
        Loading challenge details...
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="w-full min-h-[calc(100vh-68px)] py-12 flex flex-col items-center justify-center bg-cream dark:bg-night space-y-4 text-center transition-colors">
        <h2 className="text-xl font-bold font-heading text-charcoal dark:text-darktext">Challenge Not Found</h2>
        <Link href="/challenges" className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover text-white dark:text-night font-bold text-xs shadow-glow transition-all">
          Back to Challenges
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-68px)] py-12 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-darktext flex justify-center relative overflow-hidden transition-colors">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-96 bg-emerald-500/10 dark:bg-[#43E6A1]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        <Link
          href="/challenges"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal/70 dark:text-darktext-secondary hover:text-forest dark:hover:text-emeraldaccent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Challenges</span>
        </Link>

        {/* Main Details Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-8 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sage/30 dark:border-night-border">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent">
                  {challenge.category.toUpperCase()}
                </span>
                <span className="text-xs font-medium text-charcoal/70 dark:text-darktext-secondary">
                  Difficulty: {challenge.difficulty}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-heading text-charcoal dark:text-darktext tracking-tight">
                {challenge.title}
              </h1>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="text-3xl font-black font-heading text-forest dark:text-emeraldaccent">
                +{challenge.pointsReward} pts
              </div>
              <div className="text-xs text-charcoal/60 dark:text-darktext-muted">
                Approved Reward
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted">
              Quest Briefing
            </h3>
            <p className="text-base text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
              {challenge.description}
            </p>
          </div>

          {/* Why It Matters */}
          <div className="p-5 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
            <h4 className="text-xs font-bold uppercase tracking-wider text-forest dark:text-emeraldaccent">
              Environmental Significance
            </h4>
            <p className="text-xs text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
              {challenge.whyItMatters}
            </p>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted">
              Completion Requirements
            </h3>
            <p className="text-sm text-charcoal dark:text-darktext leading-relaxed">
              {challenge.completionRequirements}
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-sage/30 dark:border-night-border flex items-center justify-between">
            <button
              onClick={() => {
                if (!user) {
                  showToast("Please sign in to submit challenge evidence.", "info");
                  return;
                }
                setSubmitModalOpen(true);
              }}
              className="px-8 py-3.5 rounded-2xl font-bold text-sm text-white dark:text-night bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover shadow-glow transition-all flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-white dark:text-night" />
              <span>Submit Photo Evidence</span>
            </button>
          </div>
        </div>

        {/* Submission Modal */}
        <AnimatePresence>
          {submitModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border rounded-3xl p-6 sm:p-8 shadow-elevated space-y-6 max-h-[90vh] overflow-y-auto transition-colors"
              >
                <div className="flex items-center justify-between border-b border-sage/30 dark:border-night-border pb-4">
                  <h3 className="text-xl font-black font-heading text-charcoal dark:text-darktext">
                    Submit Challenge Proof
                  </h3>
                  <button
                    onClick={() => setSubmitModalOpen(false)}
                    className="p-1.5 rounded-lg text-charcoal/60 dark:text-darktext-muted hover:text-charcoal dark:hover:text-darktext hover:bg-cream-100 dark:hover:bg-night-card transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitEvidence} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-2">
                      Upload Proof Photo *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      className="w-full text-xs text-charcoal/70 dark:text-darktext-secondary file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-forest dark:file:bg-[#43E6A1] file:text-white dark:file:text-[#0B1110] hover:file:bg-forest-light dark:hover:file:bg-[#75F0B7] file:cursor-pointer"
                    />
                  </div>

                  {evidencePreview && (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-sage/40 dark:border-night-border">
                      <img
                        src={evidencePreview}
                        alt="Evidence preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Share how you completed this challenge..."
                      className="w-full p-3.5 rounded-xl border border-sage/40 dark:border-night-border bg-white dark:bg-night-card text-xs text-charcoal dark:text-darktext placeholder:text-charcoal/40 dark:placeholder:text-darktext-muted focus:outline-none focus:border-forest dark:focus:border-emeraldaccent focus:ring-1 focus:ring-forest dark:focus:ring-emeraldaccent"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-sage/30 dark:border-night-border">
                    <button
                      type="button"
                      onClick={() => setSubmitModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold text-charcoal/70 dark:text-darktext-secondary hover:bg-cream-100 dark:hover:bg-night-card transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !evidenceFile}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white dark:text-night bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover disabled:opacity-50 transition-all shadow-glow"
                    >
                      {submitting ? "Submitting..." : "Submit for Verification"}
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
