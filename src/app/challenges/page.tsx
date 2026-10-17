"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, useToast } from "@/components/Providers";
import {
  Target,
  Sparkles,
  Camera,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Flame,
  Award,
  Filter,
  Check,
  X,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChallengesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [challenges, setChallenges] = useState<any[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // Evidence submission modal state
  const [submitModalOpen, setSubmitModalOpen] = useState<boolean>(false);
  const [activeChallengeForSubmit, setActiveChallengeForSubmit] = useState<any | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [submissionDescription, setSubmissionDescription] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/challenges");
      const data = await res.json();
      if (data.success) {
        setChallenges(data.challenges || []);
        setDailyChallenge(data.dailyChallenge || null);
      }
    } catch {
      showToast("Could not load challenges.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  // Filtered challenges
  const filteredChallenges = challenges.filter((c) => {
    const matchesCat = selectedCategory === "all" || c.category === selectedCategory;
    const matchesDiff = selectedDifficulty === "all" || c.difficulty === selectedDifficulty;
    return matchesCat && matchesDiff;
  });

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "plastic", label: "Plastic Reduction" },
    { id: "transport", label: "Low-Impact Commute" },
    { id: "food", label: "Food & Organics" },
    { id: "zero-waste", label: "Zero Waste" },
    { id: "energy", label: "Energy & Circular" },
  ];

  // Open submission modal
  const handleOpenSubmit = (challenge: any) => {
    if (!user) {
      showToast("Please sign in to submit challenge evidence and earn eco-points.", "info");
      return;
    }
    setActiveChallengeForSubmit(challenge);
    setEvidenceFile(null);
    setEvidencePreview(null);
    setSubmissionDescription("");
    setSubmitModalOpen(true);
  };

  // Handle file picker for evidence photo
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

  // Submit challenge evidence
  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceFile || !activeChallengeForSubmit) {
      showToast("Please select a photo of your activity as evidence.", "error");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload photo to server
      const formData = new FormData();
      formData.append("file", evidenceFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        showToast(uploadData.error || "Failed to upload evidence photo", "error");
        setSubmitting(false);
        return;
      }

      // 2. Submit challenge record
      const subRes = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: activeChallengeForSubmit.id,
          evidenceUrl: uploadData.url,
          description: submissionDescription,
        }),
      });

      const subData = await subRes.json();
      if (!subRes.ok || !subData.success) {
        showToast(subData.error || "Failed to submit challenge", "error");
        setSubmitting(false);
        return;
      }

      showToast("Challenge evidence submitted! Status: Pending Review.", "success");
      setSubmitModalOpen(false);
      fetchChallenges();
    } catch {
      showToast("Network error submitting evidence. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night flex flex-col items-center">
      <div className="max-w-7xl w-full space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Target className="w-4 h-4" />
            <span>Daily Sustainability Quests</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-emerald-950 dark:text-emerald-50 tracking-tight">
            Daily Eco Challenges
          </h1>
          <p className="text-sm sm:text-base text-emerald-950/70 dark:text-emerald-300/80 max-w-2xl mx-auto">
            Practical, zero-barrier everyday environmental habits. Take action, upload photo evidence, get verified, and earn eco-points toward community badges.
          </p>
        </div>

        {/* ======================================================== */}
        {/* FEATURED TODAY'S DAILY CHALLENGE */}
        {/* ======================================================== */}
        {dailyChallenge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 sm:p-10 rounded-3xl bg-white/95 dark:bg-night-card/95 border-2 border-emerald-500/30 shadow-soft-lg space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Today&apos;s Featured Quest</span>
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                    Difficulty: {dailyChallenge.difficulty}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
                  {dailyChallenge.title}
                </h2>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    +{dailyChallenge.pointsReward} pts
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-900/60 dark:text-emerald-400">
                    Resets in 24 hours
                  </div>
                </div>

                {dailyChallenge.userStatus === "APPROVED" ? (
                  <span className="px-5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Completed & Rewarded</span>
                  </span>
                ) : dailyChallenge.userStatus === "PENDING" ? (
                  <span className="px-5 py-2.5 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Pending Verification</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleOpenSubmit(dailyChallenge)}
                    className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 shadow-soft transition-all flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Submit Evidence</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-sm text-emerald-950/80 dark:text-emerald-200/90 leading-relaxed max-w-3xl">
              {dailyChallenge.description}
            </p>

            {/* Why It Matters */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-night-hover/70 border border-emerald-500/20 text-xs text-emerald-950/85 dark:text-emerald-200 leading-relaxed">
              <strong className="text-emerald-800 dark:text-emerald-300 font-bold">Why it matters: </strong>
              {dailyChallenge.whyItMatters}
            </div>

            {/* Suggested actions & requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-night/70 border border-emerald-500/15">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-2">
                  Suggested Practical Actions
                </h4>
                <ul className="space-y-1.5 text-xs text-emerald-950/80 dark:text-emerald-200">
                  {dailyChallenge.suggestedActions?.map((act: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 dark:bg-night/70 border border-emerald-500/15">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-2">
                  Verification Requirements
                </h4>
                <p className="text-xs text-emerald-950/80 dark:text-emerald-200 leading-relaxed">
                  {dailyChallenge.completionRequirements}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* ALL CHALLENGES LIST & FILTERS */}
        {/* ======================================================== */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
                All Sustainability Quests
              </h3>
              <p className="text-xs text-emerald-900/60 dark:text-emerald-400">
                Explore diverse tasks across plastics, food waste, zero-waste, and active transport.
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedCategory === c.id
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                      : "bg-white/80 dark:bg-night-card/80 text-emerald-950/70 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-50"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Challenges */}
          {loading ? (
            <div className="p-12 text-center text-sm font-semibold text-emerald-900/60 dark:text-emerald-400">
              Loading eco challenges...
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white/80 dark:bg-night-card/80 border border-emerald-500/20 text-center space-y-2">
              <p className="font-bold text-emerald-950 dark:text-emerald-100">No challenges found in this filter.</p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedDifficulty("all");
                }}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="p-6 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                        {challenge.category.toUpperCase()}
                      </span>
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                        +{challenge.pointsReward} pts
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-emerald-950 dark:text-emerald-100 mb-2">
                      <Link href={`/challenges/${challenge.slug || challenge.id}`} className="hover:underline">
                        {challenge.title}
                      </Link>
                    </h4>

                    <p className="text-xs text-emerald-950/70 dark:text-emerald-300/80 leading-relaxed mb-4 line-clamp-3">
                      {challenge.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-emerald-500/10 flex items-center justify-between">
                    <div>
                      {challenge.userStatus === "APPROVED" ? (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approved
                        </span>
                      ) : challenge.userStatus === "PENDING" ? (
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Under Review
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-900/60 dark:text-emerald-400">
                          {challenge.difficulty}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/challenges/${challenge.slug || challenge.id}`}
                        className="px-3 py-1.5 rounded-xl border border-emerald-500/20 text-xs font-semibold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50"
                      >
                        Details
                      </Link>

                      {challenge.userStatus !== "APPROVED" && (
                        <button
                          onClick={() => handleOpenSubmit(challenge)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm"
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* SUBMISSION MODAL */}
        {/* ======================================================== */}
        <AnimatePresence>
          {submitModalOpen && activeChallengeForSubmit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-night-card rounded-3xl p-6 sm:p-8 shadow-soft-lg border border-emerald-500/25 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-emerald-500/15 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-emerald-950 dark:text-emerald-100">
                      Submit Challenge Evidence
                    </h3>
                    <p className="text-xs text-emerald-900/60 dark:text-emerald-400 mt-0.5">
                      {activeChallengeForSubmit.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitModalOpen(false)}
                    className="p-1 rounded-lg text-emerald-900/60 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-night-hover/80 border border-emerald-500/15 text-xs text-emerald-950 dark:text-emerald-200">
                  <span className="font-bold">Requirements: </span>
                  {activeChallengeForSubmit.completionRequirements}
                </div>

                <form onSubmit={handleSubmitEvidence} className="space-y-4">
                  {/* Photo picker */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-2">
                      Upload Verification Photo
                    </label>
                    {evidencePreview ? (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-emerald-500/30">
                        <img
                          src={evidencePreview}
                          alt="Evidence preview"
                          className="w-full h-full object-cover"
                        />
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
                          Click to select a photo of your action
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

                  {/* Optional description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                      Short Description (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={submissionDescription}
                      onChange={(e) => setSubmissionDescription(e.target.value)}
                      placeholder="e.g. Carried my stainless bottle on my morning bus route."
                      className="w-full p-3 rounded-xl border border-emerald-500/25 dark:border-emerald-500/30 bg-white/70 dark:bg-night-hover/70 text-emerald-950 dark:text-white placeholder:text-emerald-900/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      Earn <strong>+{activeChallengeForSubmit.pointsReward} Eco-Points</strong> upon reviewer approval.
                    </span>
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
