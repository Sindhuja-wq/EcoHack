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

  const difficulties = [
    { id: "all", label: "All Levels" },
    { id: "Easy", label: "Easy" },
    { id: "Medium", label: "Medium" },
    { id: "Hard", label: "Hard" },
  ];

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
    if (!evidenceFile || !activeChallengeForSubmit) {
      showToast("Please select a photo of your activity as evidence.", "error");
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
        showToast(uploadData.error || "Failed to upload evidence photo", "error");
        setSubmitting(false);
        return;
      }

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

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "Easy":
        return "bg-emerald-500/15 text-forest dark:text-emeraldaccent border-emerald-500/30";
      case "Medium":
        return "bg-teal-500/15 text-forest-light dark:text-emeraldaccent-light border-teal-500/30";
      case "Hard":
      default:
        return "bg-amber-500/15 text-terra dark:text-[#E07A5F] border-amber-500/30";
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-68px)] py-12 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-darktext flex flex-col items-center relative overflow-hidden transition-colors">
      {/* Ambient background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-96 bg-emerald-500/10 dark:bg-[#43E6A1]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl w-full space-y-10 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-semibold uppercase tracking-wider">
            <Target className="w-4 h-4 text-forest dark:text-emeraldaccent" />
            <span>Daily Sustainability Quests</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-charcoal dark:text-darktext">
            Daily Eco Challenges
          </h1>
          <p className="text-sm sm:text-base text-charcoal/70 dark:text-darktext-secondary max-w-2xl mx-auto">
            Practical, zero-barrier everyday environmental habits. Take action, upload photo evidence, get verified, and earn eco-points toward community badges.
          </p>
        </div>

        {/* ======================================================== */}
        {/* FEATURED TODAY'S DAILY CHALLENGE */}
        {/* ======================================================== */}
        {dailyChallenge && (
          <div
            className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-6 relative overflow-hidden transition-colors"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-[#43E6A1]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Today&apos;s Featured Quest</span>
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getDifficultyBadge(dailyChallenge.difficulty)}`}>
                    Difficulty: {dailyChallenge.difficulty}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-heading text-charcoal dark:text-darktext tracking-tight">
                  {dailyChallenge.title}
                </h2>
              </div>

              <div className="text-left md:text-right shrink-0">
                <div className="text-3xl font-black font-heading text-forest dark:text-emeraldaccent">
                  +{dailyChallenge.pointsReward} pts
                </div>
                <div className="text-xs text-charcoal/60 dark:text-darktext-muted">
                  Verified Completion Reward
                </div>
              </div>
            </div>

            <p className="text-sm text-charcoal/70 dark:text-darktext-secondary leading-relaxed relative z-10">
              {dailyChallenge.description}
            </p>

            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-xs text-charcoal/70 dark:text-darktext-secondary space-y-1 relative z-10 transition-colors">
              <strong className="text-forest dark:text-emeraldaccent font-bold uppercase tracking-wider block">
                Requirements:
              </strong>
              <span>{dailyChallenge.completionRequirements}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 relative z-10">
              <button
                onClick={() => handleOpenSubmit(dailyChallenge)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm text-white dark:text-night bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover shadow-glow transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4 text-white dark:text-night" />
                <span>Submit Photo Evidence</span>
              </button>
              <Link
                href={`/challenges/${dailyChallenge.id}`}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-semibold text-sm text-charcoal/70 dark:text-darktext-secondary hover:text-charcoal dark:hover:text-darktext bg-cream-50 dark:bg-night-card hover:bg-cream-100 dark:hover:bg-night-border border border-sage/40 dark:border-night-border transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Full Details</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* FILTER BAR */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border transition-colors">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? "bg-forest text-white border-forest shadow-glow dark:bg-emeraldaccent dark:text-night dark:border-emeraldaccent"
                    : "bg-cream-50 dark:bg-night-card text-charcoal/70 dark:text-darktext-secondary border-sage/40 dark:border-night-border hover:text-charcoal dark:hover:text-darktext"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Difficulty Dropdown / Selector */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            {difficulties.map((diff) => (
              <button
                key={diff.id}
                onClick={() => setSelectedDifficulty(diff.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedDifficulty === diff.id
                    ? "bg-cream-100 dark:bg-night-card border border-forest dark:border-emeraldaccent text-forest dark:text-emeraldaccent font-bold"
                    : "text-charcoal/60 dark:text-darktext-muted hover:text-charcoal dark:hover:text-darktext-secondary"
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CHALLENGES GRID */}
        {/* ======================================================== */}
        {loading ? (
          <div className="p-16 text-center text-sm font-semibold text-charcoal/60 dark:text-darktext-muted">
            Loading challenges catalogue...
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-center space-y-3 transition-colors">
            <Target className="w-10 h-10 text-charcoal/40 dark:text-darktext-muted mx-auto" />
            <h3 className="text-lg font-bold font-heading text-charcoal dark:text-darktext">No challenges found</h3>
            <p className="text-xs text-charcoal/60 dark:text-darktext-muted">Try adjusting your category or difficulty filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((c) => (
              <div
                key={c.id}
                className="p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated flex flex-col justify-between space-y-4 hover:border-forest/40 dark:hover:border-emeraldaccent/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(c.difficulty)}`}>
                      {c.difficulty}
                    </span>
                    <span className="text-xs font-black font-heading text-forest dark:text-emeraldaccent">
                      +{c.pointsReward} pts
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-heading text-charcoal dark:text-darktext line-clamp-1">
                    {c.title}
                  </h3>

                  <p className="text-xs text-charcoal/70 dark:text-darktext-secondary line-clamp-3 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-sage/30 dark:border-night-border flex items-center justify-between gap-2">
                  <Link
                    href={`/challenges/${c.id}`}
                    className="text-xs font-semibold text-charcoal/70 dark:text-darktext-secondary hover:text-forest dark:hover:text-emeraldaccent transition-colors flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleOpenSubmit(c)}
                    className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover text-white dark:text-night font-bold text-xs transition-all shadow-glow flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Submit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* SUBMISSION MODAL */}
        {/* ======================================================== */}
        <AnimatePresence>
          {submitModalOpen && activeChallengeForSubmit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border rounded-3xl p-6 sm:p-8 shadow-elevated space-y-6 max-h-[90vh] overflow-y-auto transition-colors"
              >
                <div className="flex items-center justify-between border-b border-sage/30 dark:border-night-border pb-4">
                  <div>
                    <h3 className="text-xl font-black font-heading text-charcoal dark:text-darktext">
                      Submit Challenge Evidence
                    </h3>
                    <p className="text-xs text-charcoal/60 dark:text-darktext-muted mt-0.5">
                      Earn +{activeChallengeForSubmit.pointsReward} eco-points upon verification
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitModalOpen(false)}
                    className="p-1.5 rounded-lg text-charcoal/60 dark:text-darktext-muted hover:text-charcoal dark:hover:text-darktext hover:bg-cream-100 dark:hover:bg-night-card transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitEvidence} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-xs space-y-1 transition-colors">
                    <span className="font-bold text-forest dark:text-emeraldaccent block uppercase tracking-wider">
                      Active Quest:
                    </span>
                    <span className="text-charcoal dark:text-darktext font-semibold text-sm block">
                      {activeChallengeForSubmit.title}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-2">
                      Upload Proof / Evidence Photo *
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
                      Activity Notes or Reflections (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={submissionDescription}
                      onChange={(e) => setSubmissionDescription(e.target.value)}
                      placeholder="Share details on how you completed this challenge..."
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
                      {submitting ? "Submitting..." : "Submit for Review"}
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
