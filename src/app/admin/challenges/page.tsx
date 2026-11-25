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
    <div className="w-full min-h-[calc(100vh-68px)] py-12 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-darktext flex justify-center relative overflow-hidden transition-colors">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-96 bg-emerald-500/10 dark:bg-[#43E6A1]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sage/30 dark:border-night-border">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal/70 dark:text-darktext-secondary hover:text-forest dark:hover:text-emeraldaccent transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin Console</span>
            </Link>
            <h1 className="text-3xl font-black font-heading text-charcoal dark:text-darktext tracking-tight">
              Manage Sustainability Quests
            </h1>
            <p className="text-xs text-charcoal/60 dark:text-darktext-muted mt-0.5">
              Create, configure point rewards, toggle schedules, and curate daily challenges.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white dark:text-night bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover shadow-glow flex items-center gap-2 shrink-0 transition-all"
          >
            <Plus className="w-4 h-4 text-white dark:text-night" />
            <span>Create New Challenge</span>
          </button>
        </div>

        {/* Challenge list */}
        <div className="p-8 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-4 transition-colors">
          {loading ? (
            <p className="text-center py-12 text-sm text-charcoal/60 dark:text-darktext-muted font-semibold">
              Loading challenges...
            </p>
          ) : (
            <div className="divide-y divide-sage/30 dark:divide-night-border">
              {challenges.map((c) => (
                <div
                  key={c.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold px-2 py-0.5 rounded bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent uppercase text-[10px]">
                        {c.category}
                      </span>
                      <span className="font-bold text-forest dark:text-emeraldaccent">
                        +{c.pointsReward} pts
                      </span>
                      {c.isDaily && (
                        <span className="font-bold text-forest-light dark:text-emeraldaccent-light">
                          ⭐ Featured Daily
                        </span>
                      )}
                      {!c.isActive && (
                        <span className="font-bold px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-terra dark:text-[#E07A5F] text-[10px]">
                          Inactive
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold font-heading text-sm text-charcoal dark:text-darktext">
                      {c.title}
                    </h4>

                    <p className="text-charcoal/70 dark:text-darktext-secondary line-clamp-1 max-w-xl">
                      {c.description}
                    </p>

                    <p className="text-[10px] text-charcoal/60 dark:text-darktext-muted">
                      Submissions count: {c._count?.submissions || 0} • Difficulty: {c.difficulty}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleActive(c.id, c.isActive)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                        c.isActive
                          ? "border-emerald-500/40 text-forest dark:text-emeraldaccent hover:bg-cream-100 dark:hover:bg-night-card"
                          : "border-sage/40 dark:border-night-border text-charcoal/60 dark:text-darktext-muted hover:bg-cream-100 dark:hover:bg-night-card"
                      }`}
                    >
                      {c.isActive ? "Active (Enabled)" : "Inactive (Disabled)"}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="px-3.5 py-1.5 rounded-xl bg-cream-50 dark:bg-night-card border border-sage/40 dark:border-night-border text-charcoal dark:text-darktext font-bold hover:border-forest/40 dark:hover:border-emeraldaccent/40 flex items-center gap-1.5 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border rounded-3xl p-6 sm:p-8 shadow-elevated space-y-5 my-8 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-sage/30 dark:border-night-border pb-4">
                  <h3 className="text-lg font-black font-heading text-charcoal dark:text-darktext">
                    {editingId ? "Edit Sustainability Quest" : "Create New Sustainability Quest"}
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1.5 rounded-lg text-charcoal/60 dark:text-darktext-muted hover:text-charcoal dark:hover:text-darktext hover:bg-cream-100 dark:hover:bg-night-card transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveChallenge} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-1">
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
                        className="w-full p-2.5 rounded-xl border border-sage/40 dark:border-night-border bg-white dark:bg-night-card text-charcoal dark:text-darktext focus:outline-none focus:border-forest dark:focus:border-emeraldaccent"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-1">
                        Slug (URL identifier)
                      </label>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-sage/40 dark:border-night-border bg-white dark:bg-night-card text-charcoal dark:text-darktext focus:outline-none focus:border-forest dark:focus:border-emeraldaccent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-1">
                        Points Reward
                      </label>
                      <input
                        type="number"
                        required
                        min={10}
                        max={500}
                        value={pointsReward}
                        onChange={(e) => setPointsReward(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-sage/40 dark:border-night-border bg-white dark:bg-night-card text-charcoal dark:text-darktext focus:outline-none focus:border-forest dark:focus:border-emeraldaccent"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-sage/40 dark:border-night-border bg-white dark:bg-night-card text-charcoal dark:text-darktext focus:outline-none focus:border-forest dark:focus:border-emeraldaccent"
                      >
                        <option value="plastic">plastic</option>
                        <option value="transport">transport</option>
                        <option value="food">food</option>
                        <option value="zero-waste">zero-waste</option>
                        <option value="energy">energy</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-1">
                        Difficulty
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-sage/40 dark:border-night-border bg-white dark:bg-night-card text-charcoal dark:text-darktext focus:outline-none focus:border-forest dark:focus:border-emeraldaccent"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-1">
                      Quest Description
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-sage/40 dark:border-night-border bg-white dark:bg-night-card text-charcoal dark:text-darktext focus:outline-none focus:border-forest dark:focus:border-emeraldaccent"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-1">
                      Why It Matters (Environmental fact)
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={whyItMatters}
                      onChange={(e) => setWhyItMatters(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-sage/40 dark:border-night-border bg-white dark:bg-night-card text-charcoal dark:text-darktext focus:outline-none focus:border-forest dark:focus:border-emeraldaccent"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-1">
                      Completion Requirements
                    </label>
                    <input
                      type="text"
                      required
                      value={completionRequirements}
                      onChange={(e) => setCompletionRequirements(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-sage/40 dark:border-night-border bg-white dark:bg-night-card text-charcoal dark:text-darktext focus:outline-none focus:border-forest dark:focus:border-emeraldaccent"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-1">
                      Suggested Actions (One per line)
                    </label>
                    <textarea
                      rows={3}
                      value={suggestedActionsStr}
                      onChange={(e) => setSuggestedActionsStr(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-sage/40 dark:border-night-border bg-white dark:bg-night-card text-charcoal dark:text-darktext focus:outline-none focus:border-forest dark:focus:border-emeraldaccent"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2 text-charcoal/70 dark:text-darktext-secondary">
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded border-sage/40 dark:border-night-border bg-white dark:bg-night-card text-forest dark:text-emeraldaccent"
                      />
                      <span>Active for user submissions</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={isDaily}
                        onChange={(e) => setIsDaily(e.target.checked)}
                        className="rounded border-sage/40 dark:border-night-border bg-white dark:bg-night-card text-forest dark:text-emeraldaccent"
                      />
                      <span>Mark as Featured Daily Quest</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-sage/30 dark:border-night-border">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-sage/40 dark:border-night-border font-semibold text-charcoal/70 dark:text-darktext-secondary hover:bg-cream-100 dark:hover:bg-night-card transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 rounded-xl bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover text-white dark:text-night font-bold shadow-glow transition-all"
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
