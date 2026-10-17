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
      <div className="w-full min-h-[calc(100vh-80px)] py-12 flex items-center justify-center bg-nature-gradient dark:bg-night text-sm font-semibold text-emerald-900/60 dark:text-emerald-400">
        Loading your saved transformation ideas...
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night flex justify-center">
      <div className="max-w-7xl w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Bookmark className="w-4 h-4" />
            <span>Personal DIY Library</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-emerald-950 dark:text-emerald-50 tracking-tight">
            Saved Transformation Ideas
          </h1>
          <p className="text-sm sm:text-base text-emerald-950/70 dark:text-emerald-300/80 max-w-xl mx-auto">
            Review, craft, and complete your bookmarked waste-to-value blueprints.
          </p>
        </div>

        {savedIdeas.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 text-center space-y-4">
            <Bookmark className="w-12 h-12 text-emerald-600/40 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-100">
                Your Saved Collection is Empty
              </h3>
              <p className="text-xs text-emerald-900/60 dark:text-emerald-400 max-w-sm mx-auto">
                Whenever you analyze waste items in the AI Scanner, click &quot;Save This Idea&quot; to keep blueprints here for easy reference.
              </p>
            </div>
            <Link
              href="/scanner"
              className="inline-block px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-soft"
            >
              Scan a Discard Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedIdeas.map((idea) => {
              const opt = idea.transformationOption;
              const analysis = opt?.analysis;
              const materials = opt?.materialsTools ? JSON.parse(opt.materialsTools) : [];

              return (
                <div
                  key={idea.id}
                  className="p-6 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                        {opt?.difficulty} Difficulty
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {opt?.estimatedTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-100 mb-1">
                      {opt?.title}
                    </h3>
                    <p className="text-xs text-emerald-900/60 dark:text-emerald-400 mb-3 font-medium">
                      Item: {analysis?.detectedItem || "Household discard"}
                    </p>

                    <p className="text-xs text-emerald-950/75 dark:text-emerald-300/80 leading-relaxed mb-4 line-clamp-3">
                      {opt?.shortExplanation}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-emerald-500/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleRemoveIdea(opt.id)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveIdeaForDetail(idea)}
                        className="px-3.5 py-2 rounded-xl border border-emerald-500/20 text-xs font-bold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50"
                      >
                        Blueprint
                      </button>
                      <button
                        onClick={() => handleOpenCompletionModal(opt)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm"
                      >
                        I Completed This
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Blueprint Details Modal */}
        <AnimatePresence>
          {activeIdeaForDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white dark:bg-night-card rounded-3xl p-6 sm:p-8 shadow-soft-lg border border-emerald-500/25 space-y-6 my-8"
              >
                <div className="flex items-start justify-between border-b border-emerald-500/15 pb-4">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                      {activeIdeaForDetail.transformationOption?.difficulty}
                    </span>
                    <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-100 mt-1">
                      {activeIdeaForDetail.transformationOption?.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveIdeaForDetail(null)}
                    className="p-1 rounded-lg text-emerald-900/60 hover:text-emerald-900 dark:text-emerald-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-night-hover/70 border border-emerald-500/15">
                    <strong className="block text-emerald-800 dark:text-emerald-300 font-bold mb-1">
                      Summary & Purpose:
                    </strong>
                    <p className="text-emerald-950/80 dark:text-emerald-200 leading-relaxed">
                      {activeIdeaForDetail.transformationOption?.shortExplanation}
                    </p>
                  </div>

                  <div>
                    <strong className="block text-emerald-900 dark:text-emerald-300 font-bold uppercase tracking-wider mb-2">
                      Step-by-Step Instructions:
                    </strong>
                    <div className="space-y-2">
                      {(activeIdeaForDetail.transformationOption?.stepByStep
                        ? JSON.parse(activeIdeaForDetail.transformationOption.stepByStep)
                        : []
                      ).map((s: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-white dark:bg-night border border-emerald-500/15 flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {s.step || idx + 1}
                          </span>
                          <span className="text-emerald-950 dark:text-emerald-100 leading-relaxed font-medium">
                            {s.instruction}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activeIdeaForDetail.transformationOption?.safetyPrecautions && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                      <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">
                        Safety Precautions:
                      </span>
                      <p className="text-amber-950/80 dark:text-amber-200">
                        {activeIdeaForDetail.transformationOption.safetyPrecautions}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-emerald-500/15">
                  <button
                    onClick={() => {
                      const opt = activeIdeaForDetail.transformationOption;
                      setActiveIdeaForDetail(null);
                      handleOpenCompletionModal(opt);
                    }}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 shadow-soft"
                  >
                    I Completed This (+40 pts)
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Completion Modal */}
        <AnimatePresence>
          {completionModalOpen && selectedOptionForCompletion && (
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
                      Submit Completed Project
                    </h3>
                    <p className="text-xs text-emerald-900/60 dark:text-emerald-400 mt-0.5">
                      {selectedOptionForCompletion.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setCompletionModalOpen(false)}
                    className="p-1 rounded-lg text-emerald-900/60 hover:text-emerald-900 dark:text-emerald-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitCompletion} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-2">
                      Upload Proof Photo
                    </label>
                    {evidencePreview ? (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-emerald-500/30">
                        <img src={evidencePreview} alt="Evidence preview" className="w-full h-full object-cover" />
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
                          Select photo of finished transformation
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEvidenceFileChange}
                          className="hidden"
                          required
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                      Notes or Learnings (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      placeholder="e.g. Worked great with my plants!"
                      className="w-full p-3 rounded-xl border border-emerald-500/25 dark:border-emerald-500/30 bg-white/70 dark:bg-night-hover/70 text-emerald-950 dark:text-white placeholder:text-emerald-900/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCompletionModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-emerald-500/20 text-xs font-semibold text-emerald-900 dark:text-emerald-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingCompletion || !evidenceFile}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 transition-colors shadow-soft"
                    >
                      {submittingCompletion ? "Uploading..." : "Submit for Verification"}
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
