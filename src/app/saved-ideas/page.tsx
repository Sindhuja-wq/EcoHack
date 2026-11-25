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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SavedIdeasPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [savedIdeas, setSavedIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.success && data.profile) {
        setSavedIdeas(data.profile.savedIdeas || []);
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-semibold uppercase tracking-wider">
            <Bookmark className="w-4 h-4 text-forest dark:text-emeraldaccent" />
            <span>Personal DIY Library</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-charcoal dark:text-darktext">
            Saved Transformation Blueprints
          </h1>
          <p className="text-sm sm:text-base text-charcoal/70 dark:text-darktext-secondary max-w-xl mx-auto">
            Review, craft, and complete your bookmarked waste-to-value blueprints.
          </p>
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedIdeas.map((saved) => {
              const opt = saved.transformationOption;
              if (!opt) return null;

              return (
                <div
                  key={saved.id}
                  className="p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated flex flex-col justify-between space-y-4 hover:border-forest/40 dark:hover:border-emeraldaccent/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent">
                        {opt.difficulty} Difficulty
                      </span>
                      <button
                        onClick={() => handleRemoveIdea(saved.transformationOptionId)}
                        className="p-1 rounded-lg text-charcoal/60 dark:text-darktext-muted hover:text-terra dark:hover:text-[#E07A5F] transition-colors"
                        title="Remove saved blueprint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-lg font-bold font-heading text-charcoal dark:text-darktext line-clamp-1">
                      {opt.title}
                    </h3>

                    <p className="text-xs text-charcoal/70 dark:text-darktext-secondary line-clamp-3 leading-relaxed">
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
                      {activeIdeaForDetail.transformationOption?.materialsTools?.map((m: string, i: number) => (
                        <span key={i} className="px-3 py-1 rounded-xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-charcoal dark:text-darktext">
                          • {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted mb-2">
                      Step-by-Step Instructions
                    </h5>
                    <div className="space-y-2.5">
                      {activeIdeaForDetail.transformationOption?.stepByStep?.map((s: any, idx: number) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border flex items-start gap-3 transition-colors">
                          <span className="w-5 h-5 rounded-full bg-forest dark:bg-emeraldaccent text-white dark:text-night font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                            {s.step || idx + 1}
                          </span>
                          <span className="text-charcoal dark:text-darktext font-medium leading-relaxed">
                            {s.instruction}
                          </span>
                        </div>
                      ))}
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
