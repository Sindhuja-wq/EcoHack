"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import {
  ArrowLeft,
  Target,
  Plus,
  Edit,
  Check,
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminChallengesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Challenge Edit/Create Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [whyItMatters, setWhyItMatters] = useState<string>("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Advanced">("Easy");
  const [pointsReward, setPointsReward] = useState<number>(50);
  const [category, setCategory] = useState<string>("plastic");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isDaily, setIsDaily] = useState<boolean>(false);
  const [dayOfWeek, setDayOfWeek] = useState<number | null>(null);
  const [completionRequirements, setCompletionRequirements] = useState<string>("");
  const [suggestedActionsStr, setSuggestedActionsStr] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/admin/challenges");
      } else if (user.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/challenges");
      const data = await res.json();
      if (data.success) {
        setChallenges(data.challenges || []);
      } else {
        showToast(data.error || "Failed to load challenges", "error");
      }
    } catch {
      showToast("Error loading challenges", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchChallenges();
    }
  }, [user]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setWhyItMatters("");
    setDifficulty("Easy");
    setPointsReward(50);
    setCategory("plastic");
    setIsActive(true);
    setIsDaily(false);
    setDayOfWeek(null);
    setCompletionRequirements("Upload a photo demonstrating your completion.");
    setSuggestedActionsStr("Take an action.\nKeep clean.\nInspire a peer.");
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (c: any) => {
    setEditingId(c.id);
    setTitle(c.title);
    setSlug(c.slug);
    setDescription(c.description);
    setWhyItMatters(c.whyItMatters);
    setDifficulty(c.difficulty);
    setPointsReward(c.pointsReward);
    setCategory(c.category);
    setIsActive(c.isActive);
    setIsDaily(c.isDaily);
    setDayOfWeek(c.dayOfWeek ?? null);
    setCompletionRequirements(c.completionRequirements);
    setSuggestedActionsStr(
      Array.isArray(c.suggestedActions)
        ? c.suggestedActions.join("\n")
        : ""
    );
    setModalOpen(true);
  };

  // Toggle active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/challenges", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Challenge status updated", "success");
        fetchChallenges();
      }
    } catch {
      showToast("Failed to toggle status", "error");
    }
  };

  // Save Challenge Form
  const handleSaveChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const actions = suggestedActionsStr
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/admin/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId || undefined,
          title,
          slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
          description,
          whyItMatters,
          difficulty,
          pointsReward,
          category,
          isActive,
          isDaily,
          dayOfWeek: dayOfWeek !== null ? Number(dayOfWeek) : null,
          completionRequirements,
          suggestedActions: actions.length > 0 ? actions : ["Perform eco action"],
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setModalOpen(false);
        fetchChallenges();
      } else {
        showToast(data.error || "Failed to save challenge", "error");
      }
    } catch {
      showToast("Network error saving challenge", "error");
    } finally {
      setSaving(false);
    }
  };

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
              Manage Sustainability Quests
            </h1>
            <p className="text-xs text-emerald-900/60 dark:text-emerald-400 mt-0.5">
              Create, configure point rewards, toggle schedules, and curate daily challenges.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 shadow-soft flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Challenge</span>
          </button>
        </div>

        {/* Challenge list */}
        <div className="p-8 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft space-y-4">
          {loading ? (
            <p className="text-center py-12 text-sm text-emerald-900/60 dark:text-emerald-400 font-semibold">
              Loading challenges...
            </p>
          ) : (
            <div className="divide-y divide-emerald-500/10">
              {challenges.map((c) => (
                <div
                  key={c.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 uppercase text-[10px]">
                        {c.category}
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        +{c.pointsReward} pts
                      </span>
                      {c.isDaily && (
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          ⭐ Featured Daily
                        </span>
                      )}
                      {!c.isActive && (
                        <span className="font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 text-[10px]">
                          Inactive
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                      {c.title}
                    </h4>

                    <p className="text-emerald-900/70 dark:text-emerald-300 line-clamp-1 max-w-xl">
                      {c.description}
                    </p>

                    <p className="text-[10px] text-emerald-900/50 dark:text-emerald-400">
                      Submissions count: {c._count?.submissions || 0} • Difficulty: {c.difficulty}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleActive(c.id, c.isActive)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                        c.isActive
                          ? "border-emerald-500/30 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50"
                          : "border-slate-300 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {c.isActive ? "Active (Enabled)" : "Inactive (Disabled)"}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-night border border-emerald-500/25 text-emerald-800 dark:text-emerald-200 font-bold hover:bg-emerald-50 flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal: Create or Edit Challenge */}
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white dark:bg-night-card rounded-3xl p-6 sm:p-8 shadow-soft-lg border border-emerald-500/25 space-y-5 my-8"
              >
                <div className="flex items-center justify-between border-b border-emerald-500/15 pb-4">
                  <h3 className="text-lg font-black text-emerald-950 dark:text-emerald-100">
                    {editingId ? "Edit Sustainability Quest" : "Create New Sustainability Quest"}
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1 rounded-lg text-emerald-900/60 hover:text-emerald-900 dark:text-emerald-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveChallenge} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                        Quest Title
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          if (!editingId) {
                            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                          }
                        }}
                        className="w-full p-2.5 rounded-xl border border-emerald-500/30 bg-white dark:bg-night"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                        Slug (URL identifier)
                      </label>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-emerald-500/30 bg-white dark:bg-night"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                        Points Reward
                      </label>
                      <input
                        type="number"
                        required
                        min={10}
                        max={500}
                        value={pointsReward}
                        onChange={(e) => setPointsReward(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-emerald-500/30 bg-white dark:bg-night"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-emerald-500/30 bg-white dark:bg-night"
                      >
                        <option value="plastic">plastic</option>
                        <option value="transport">transport</option>
                        <option value="food">food</option>
                        <option value="zero-waste">zero-waste</option>
                        <option value="energy">energy</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                        Difficulty
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-emerald-500/30 bg-white dark:bg-night"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                      Quest Description
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-emerald-500/30 bg-white dark:bg-night"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                      Why It Matters (Environmental fact)
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={whyItMatters}
                      onChange={(e) => setWhyItMatters(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-emerald-500/30 bg-white dark:bg-night"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                      Completion Requirements
                    </label>
                    <input
                      type="text"
                      required
                      value={completionRequirements}
                      onChange={(e) => setCompletionRequirements(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-emerald-500/30 bg-white dark:bg-night"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                      Suggested Actions (One per line)
                    </label>
                    <textarea
                      rows={3}
                      value={suggestedActionsStr}
                      onChange={(e) => setSuggestedActionsStr(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-emerald-500/30 bg-white dark:bg-night"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                      />
                      <span>Active for user submissions</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={isDaily}
                        onChange={(e) => setIsDaily(e.target.checked)}
                      />
                      <span>Mark as Featured Daily Quest</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-emerald-500/15">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-emerald-500/20 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-soft"
                    >
                      {saving ? "Saving..." : "Save Quest"}
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
