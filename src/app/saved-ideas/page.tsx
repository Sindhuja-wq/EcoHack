"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import {
  Bookmark,
  Sparkles,
  Clock,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Trash2,
  Check,
  X,
  Camera,
  Award,
  Scan,
  Filter,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function parseArray<T = any>(val: any): T[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === "string") {
        const doubleParsed = JSON.parse(parsed);
        if (Array.isArray(doubleParsed)) return doubleParsed;
      }
    } catch {
      return [];
    }
  }
  return [];
}

const DIFFICULTY_OPTIONS = ["ALL", "Easy", "Medium", "Advanced"] as const;
type DifficultyFilter = (typeof DIFFICULTY_OPTIONS)[number];

export default function SavedIdeasPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [savedIdeas, setSavedIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyFilter>("ALL");

  // Detail Modal state
  const [activeIdeaForDetail, setActiveIdeaForDetail] = useState<any | null>(null);

  // Project Completion Modal
  const [completionModalOpen, setCompletionModalOpen] = useState<boolean>(false);
  const [selectedOptionForCompletion, setSelectedOptionForCompletion] = useState<any | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState<string>("");
  const [submittingCompletion, setSubmittingCompletion] = useState<boolean>(false);

  const fetchSavedIdeas = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/waste/save-idea");
      const data = await res.json();
      if (data.success && Array.isArray(data.savedIdeas)) {
        setSavedIdeas(data.savedIdeas);
      } else if (res.status === 401) {
        router.push("/login?redirect=/saved-ideas");
      } else {
        showToast(data.error || "Could not load saved ideas", "error");
      }
    } catch {
      showToast("Could not load saved ideas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/saved-ideas");
      return;
    }
    if (user) {
      fetchSavedIdeas();
    }
  }, [user, authLoading]);

  // Remove idea
  const handleRemoveIdea = async (transformationOptionId: string) => {
    try {
      const res = await fetch("/api/waste/save-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transformationOptionId }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Idea removed from saved collection", "info");
        fetchSavedIdeas();
        if (activeIdeaForDetail?.transformationOptionId === transformationOptionId) {
          setActiveIdeaForDetail(null);
        }
      }
    } catch {
      showToast("Error removing saved idea", "error");
    }
  };

  // Open completion modal
  const handleOpenCompletionModal = (opt: any) => {
    setSelectedOptionForCompletion(opt);
    setEvidenceFile(null);
    setEvidencePreview(null);
    setCompletionNotes("");
    setCompletionModalOpen(true);
  };

  const handleEvidenceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "error");
      return;
    }

    setEvidenceFile(file);
    const reader = new FileReader();
    reader.onload = () => setEvidencePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceFile || !selectedOptionForCompletion?.id) {
      showToast("Please select a photo of your completed project.", "error");
      return;
    }

    setSubmittingCompletion(true);

    try {
      const formData = new FormData();
      formData.append("file", evidenceFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        showToast(uploadData.error || "Failed to upload photo", "error");
        setSubmittingCompletion(false);
        return;
      }

      const projectRes = await fetch("/api/waste/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transformationOptionId: selectedOptionForCompletion.id,
          evidenceUrl: uploadData.url,
          notes: completionNotes,
        }),
      });

      const projectData = await projectRes.json();
      if (!projectRes.ok || !projectData.success) {
        showToast(projectData.error || "Failed to submit project completion", "error");
        setSubmittingCompletion(false);
        return;
      }

      showToast("Project evidence submitted for 40 points!", "success");
      setCompletionModalOpen(false);
    } catch {
      showToast("Network error submitting project", "error");
    } finally {
      setSubmittingCompletion(false);
    }
  };

  // Filter ideas by selected difficulty
  const filteredIdeas = savedIdeas.filter((saved) => {
    if (filterDifficulty === "ALL") return true;
    const diff = saved.transformationOption?.difficulty || "";
    return diff.toLowerCase() === filterDifficulty.toLowerCase();
  });

  const counts: Record<DifficultyFilter, number> = {
    ALL: savedIdeas.length,
    Easy: savedIdeas.filter(
      (s) => (s.transformationOption?.difficulty || "").toLowerCase() === "easy"
    ).length,
    Medium: savedIdeas.filter(
      (s) => (s.transformationOption?.difficulty || "").toLowerCase() === "medium"
    ).length,
    Advanced: savedIdeas.filter(
      (s) => (s.transformationOption?.difficulty || "").toLowerCase() === "advanced"
    ).length,
  };

  if (authLoading || loading) {
    return (
      <div className="w-full min-h-[calc(100vh-68px)] py-12 flex items-center justify-center bg-cream dark:bg-night text-sm font-semibold text-charcoal/60 dark:text-darktext-muted transition-colors">
        Loading your saved transformation ideas...
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-68px)] py-12 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-darktext flex justify-center relative overflow-hidden transition-colors">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-96 bg-emerald-500/10 dark:bg-[#43E6A1]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl w-full space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Bookmark className="w-4 h-4 text-forest dark:text-emeraldaccent" />
            <span>Personal DIY Library</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-charcoal dark:text-darktext">
            Saved Transformation Blueprints
          </h1>
          <p className="text-sm sm:text-base text-charcoal/70 dark:text-darktext-secondary max-w-xl mx-auto">
            Review, craft, and complete your bookmarked waste-to-value blueprints.
          </p>

          {/* Difficulty Filter Chips */}
          {savedIdeas.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              {DIFFICULTY_OPTIONS.map((diff) => {
                const isActive = filterDifficulty === diff;
                const count = counts[diff];
                return (
                  <button
                    key={diff}
                    onClick={() => setFilterDifficulty(diff)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-forest dark:bg-emeraldaccent text-white dark:text-night shadow-sm"
                        : "bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-charcoal/70 dark:text-darktext-secondary hover:border-forest/40 dark:hover:border-emeraldaccent/40"
                    }`}
                  >
                    <span>{diff === "ALL" ? "All Blueprints" : diff}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-white/25 text-white dark:text-night"
                          : "bg-cream-100 dark:bg-night-card text-charcoal/60 dark:text-darktext-muted"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {savedIdeas.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-center space-y-4 transition-colors">
            <Bookmark className="w-12 h-12 text-charcoal/40 dark:text-darktext-muted mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-heading text-charcoal dark:text-darktext">
                Your Saved Collection is Empty
              </h3>
              <p className="text-xs text-charcoal/60 dark:text-darktext-muted max-w-sm mx-auto">
                Whenever you analyze waste items in the AI Scanner, click &quot;Save This Idea&quot; to keep blueprints here for easy reference.
              </p>
            </div>
            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover text-white dark:text-night font-bold text-xs shadow-glow transition-all"
            >
              <Scan className="w-4 h-4" />
              <span>Scan Waste Item</span>
            </Link>
          </div>
        ) : filteredIdeas.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-center space-y-3 transition-colors">
            <Filter className="w-10 h-10 text-charcoal/40 dark:text-darktext-muted mx-auto" />
            <h3 className="text-lg font-bold font-heading text-charcoal dark:text-darktext">
              No {filterDifficulty} Blueprints Found
            </h3>
            <p className="text-xs text-charcoal/60 dark:text-darktext-muted">
              You haven&apos;t saved any blueprints categorized as {filterDifficulty} difficulty yet.
            </p>
            <button
              onClick={() => setFilterDifficulty("ALL")}
              className="px-4 py-2 rounded-xl bg-forest dark:bg-emeraldaccent text-white dark:text-night text-xs font-bold shadow-sm"
            >
              View All ({savedIdeas.length})
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map((saved) => {
              const opt = saved.transformationOption;
              if (!opt) return null;

              const wasteImage = opt.analysis?.imageUrl;
              const detectedItem = opt.analysis?.detectedItem;
              const materialCategory = opt.analysis?.materialCategory;

              return (
                <div
                  key={saved.id}
                  className="p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated flex flex-col justify-between space-y-4 hover:border-forest/40 dark:hover:border-emeraldaccent/40 transition-colors group"
                >
                  <div className="space-y-3">
                    {/* Waste item preview if available */}
                    {wasteImage ? (
                      <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-cream-100 dark:bg-night-card border border-sage/20 dark:border-night-border">
                        <img
                          src={wasteImage}
                          alt={detectedItem || "Waste item"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        {detectedItem && (
                          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-white flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emeraldaccent" />
                            <span className="capitalize">{detectedItem}</span>
                          </div>
                        )}
                        {materialCategory && (
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/90 dark:bg-night/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-charcoal dark:text-darktext shadow-sm">
                            {materialCategory}
                          </div>
                        )}
                      </div>
                    ) : detectedItem ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-xs font-semibold text-charcoal/80 dark:text-darktext-secondary">
                        <span className="text-forest dark:text-emeraldaccent font-bold">Item:</span>
                        <span className="capitalize">{detectedItem}</span>
                        {materialCategory && (
                          <span className="text-[10px] uppercase tracking-wider text-charcoal/50 dark:text-darktext-muted">
                            ({materialCategory})
                          </span>
                        )}
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent">
                        {opt.difficulty} Difficulty
                      </span>
                      <button
                        onClick={() => handleRemoveIdea(saved.transformationOptionId)}
                        className="p-1.5 rounded-lg text-charcoal/60 dark:text-darktext-muted hover:text-terra dark:hover:text-[#E07A5F] hover:bg-cream-100 dark:hover:bg-night-card transition-colors"
                        title="Remove saved blueprint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-lg font-bold font-heading text-charcoal dark:text-darktext line-clamp-1">
                      {opt.title}
                    </h3>

                    <p className="text-xs text-charcoal/70 dark:text-darktext-secondary line-clamp-2 leading-relaxed">
                      {opt.shortExplanation}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-charcoal/60 dark:text-darktext-muted pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
                        {opt.estimatedTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
                        {opt.estimatedCost || "Free"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-sage/30 dark:border-night-border flex items-center justify-between gap-2">
                    <button
                      onClick={() => setActiveIdeaForDetail(saved)}
                      className="text-xs font-semibold text-charcoal/70 dark:text-darktext-secondary hover:text-forest dark:hover:text-emeraldaccent transition-colors flex items-center gap-1"
                    >
                      <span>View Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenCompletionModal(opt)}
                      className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover text-white dark:text-night font-bold text-xs transition-all shadow-glow flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Completed (+40)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Blueprint Details Modal */}
        <AnimatePresence>
          {activeIdeaForDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border rounded-3xl p-6 sm:p-8 shadow-elevated space-y-6 max-h-[90vh] overflow-y-auto transition-colors"
              >
                <div className="flex items-center justify-between border-b border-sage/30 dark:border-night-border pb-4">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent">
                      {activeIdeaForDetail.transformationOption?.difficulty} Difficulty
                    </span>
                    <h3 className="text-2xl font-black font-heading text-charcoal dark:text-darktext mt-2">
                      {activeIdeaForDetail.transformationOption?.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveIdeaForDetail(null)}
                    className="p-1.5 rounded-lg text-charcoal/60 dark:text-darktext-muted hover:text-charcoal dark:hover:text-darktext hover:bg-cream-100 dark:hover:bg-night-card transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Waste context banner if analysis details exist */}
                {activeIdeaForDetail.transformationOption?.analysis && (
                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border">
                    {activeIdeaForDetail.transformationOption.analysis.imageUrl ? (
                      <img
                        src={activeIdeaForDetail.transformationOption.analysis.imageUrl}
                        alt="Analyzed waste"
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-forest/10 dark:bg-emeraldaccent/10 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-6 h-6 text-forest dark:text-emeraldaccent" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted">
                        Original Waste Discard
                      </div>
                      <div className="text-sm font-bold text-charcoal dark:text-darktext capitalize truncate">
                        {activeIdeaForDetail.transformationOption.analysis.detectedItem || "Analyzed Material"}
                      </div>
                      {activeIdeaForDetail.transformationOption.analysis.materialCategory && (
                        <div className="text-[11px] text-forest dark:text-emeraldaccent font-semibold capitalize">
                          Category: {activeIdeaForDetail.transformationOption.analysis.materialCategory}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-4 text-xs text-charcoal/70 dark:text-darktext-secondary">
                  <div>
                    <h5 className="font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted mb-2">
                      Overview
                    </h5>
                    <p className="leading-relaxed">
                      {activeIdeaForDetail.transformationOption?.shortExplanation}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted mb-2">
                      Required Materials & Tools
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {parseArray<string>(
                        activeIdeaForDetail.transformationOption?.materialsTools
                      ).length === 0 ? (
                        <p className="text-xs text-charcoal/50 dark:text-darktext-muted italic">
                          Standard household tools or no specialized equipment required.
                        </p>
                      ) : (
                        parseArray<string>(
                          activeIdeaForDetail.transformationOption?.materialsTools
                        ).map((m: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-charcoal dark:text-darktext font-medium"
                          >
                            • {m}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted mb-2">
                      Step-by-Step Instructions
                    </h5>
                    <div className="space-y-2.5">
                      {parseArray<any>(
                        activeIdeaForDetail.transformationOption?.stepByStep
                      ).length === 0 ? (
                        <p className="text-xs text-charcoal/50 dark:text-darktext-muted italic">
                          No sequential steps recorded for this idea.
                        </p>
                      ) : (
                        parseArray<any>(
                          activeIdeaForDetail.transformationOption?.stepByStep
                        ).map((s: any, idx: number) => {
                          const stepNumber =
                            typeof s === "object" && s?.step ? s.step : idx + 1;
                          const instructionText =
                            typeof s === "object" && s?.instruction
                              ? s.instruction
                              : String(s);

                          return (
                            <div
                              key={idx}
                              className="p-3.5 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border flex items-start gap-3 transition-colors"
                            >
                              <span className="w-5 h-5 rounded-full bg-forest dark:bg-emeraldaccent text-white dark:text-night font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                                {stepNumber}
                              </span>
                              <span className="text-charcoal dark:text-darktext font-medium leading-relaxed">
                                {instructionText}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-sage/30 dark:border-night-border">
                  <button
                    onClick={() => setActiveIdeaForDetail(null)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-charcoal/70 dark:text-darktext-secondary hover:bg-cream-100 dark:hover:bg-night-card transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const opt = activeIdeaForDetail.transformationOption;
                      setActiveIdeaForDetail(null);
                      handleOpenCompletionModal(opt);
                    }}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs text-white dark:text-night bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover shadow-glow transition-all"
                  >
                    I Completed This (+40 pts)
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Completion Evidence Submission Modal */}
        <AnimatePresence>
          {completionModalOpen && selectedOptionForCompletion && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border rounded-3xl p-6 sm:p-8 shadow-elevated space-y-6 max-h-[90vh] overflow-y-auto transition-colors"
              >
                <div className="flex items-center justify-between border-b border-sage/30 dark:border-night-border pb-4">
                  <h3 className="text-xl font-black font-heading text-charcoal dark:text-darktext">
                    Submit Completed Blueprint
                  </h3>
                  <button
                    onClick={() => setCompletionModalOpen(false)}
                    className="p-1.5 rounded-lg text-charcoal/60 dark:text-darktext-muted hover:text-charcoal dark:hover:text-darktext hover:bg-cream-100 dark:hover:bg-night-card transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitCompletion} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-2">
                      Upload Proof / Evidence Photo *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEvidenceFileChange}
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
                      Project Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      placeholder="Share your experience crafting this project..."
                      className="w-full p-3.5 rounded-xl border border-sage/40 dark:border-night-border bg-white dark:bg-night-card text-xs text-charcoal dark:text-darktext placeholder:text-charcoal/40 dark:placeholder:text-darktext-muted focus:outline-none focus:border-forest dark:focus:border-emeraldaccent focus:ring-1 focus:ring-forest dark:focus:ring-emeraldaccent"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-sage/30 dark:border-night-border">
                    <button
                      type="button"
                      onClick={() => setCompletionModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold text-charcoal/70 dark:text-darktext-secondary hover:bg-cream-100 dark:hover:bg-night-card transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingCompletion || !evidenceFile}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white dark:text-night bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover disabled:opacity-50 transition-all shadow-glow"
                    >
                      {submittingCompletion ? "Submitting..." : "Submit Completion (+40 pts)"}
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
