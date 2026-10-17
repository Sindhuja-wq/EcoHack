"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import {
  User,
  Mail,
  Shield,
  Award,
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  LogOut,
  Edit3,
  Save,
  Bookmark,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";

const AVATAR_OPTIONS = [
  "🌱", "🌿", "🌳", "🌻", "🐝", "🌍", "🦊", "🦋", "🍄", "♻️"
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit fields
  const [editing, setEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("🌱");
  const [saving, setSaving] = useState<boolean>(false);

  // Active section tab
  const [activeTab, setActiveTab] = useState<"badges" | "challenges" | "projects" | "ledger">("badges");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setName(data.profile.name || "");
        setBio(data.profile.bio || "");
        setAvatar(data.profile.avatar || "🌱");
      }
    } catch {
      showToast("Error loading profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/profile");
      return;
    }
    if (user) {
      fetchProfile();
    }
  }, [user, authLoading]);

  // Save profile edits
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, avatar }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Profile updated successfully!", "success");
        setEditing(false);
        await refreshUser();
        fetchProfile();
      } else {
        showToast(data.error || "Failed to update profile", "error");
      }
    } catch {
      showToast("Network error updating profile", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete submission
  const handleDeleteSubmission = async (submissionId: string, type: "challenge" | "project") => {
    if (!confirm("Are you sure you want to remove this submission?")) return;

    try {
      const res = await fetch(`/api/profile?submissionId=${submissionId}&type=${type}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        showToast("Submission removed", "info");
        fetchProfile();
      } else {
        showToast(data.error || "Could not delete submission", "error");
      }
    } catch {
      showToast("Error deleting submission", "error");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] py-12 flex items-center justify-center bg-nature-gradient dark:bg-night text-sm font-semibold text-emerald-900/60 dark:text-emerald-400">
        Loading profile details...
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night flex justify-center">
      <div className="max-w-5xl w-full space-y-8">
        {/* ======================================================== */}
        {/* PROFILE HEADER & EDIT CARD */}
        {/* ======================================================== */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/25 shadow-soft-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-emerald-500/15">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 text-white flex items-center justify-center text-3xl shadow-soft shrink-0">
                {profile?.avatar || "🌱"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100">
                    {profile?.name}
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                    {profile?.role}
                  </span>
                </div>
                <p className="text-xs text-emerald-900/60 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{profile?.email}</span>
                </p>
                {profile?.bio && (
                  <p className="text-xs text-emerald-950/80 dark:text-emerald-200 mt-2 leading-relaxed max-w-md">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 rounded-xl border border-emerald-500/25 text-xs font-bold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-night-hover transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{editing ? "Cancel" : "Edit Profile"}</span>
              </button>

              <button
                onClick={() => logout()}
                className="px-4 py-2 rounded-xl border border-rose-500/30 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Edit Form Drawer */}
          {editing && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={handleSaveProfile}
              className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-night-hover/70 border border-emerald-500/20 space-y-4"
            >
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                Update Display Settings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-500/30 text-xs bg-white dark:bg-night"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                    Avatar Symbol
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        type="button"
                        key={av}
                        onClick={() => setAvatar(av)}
                        className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center border transition-all ${
                          avatar === av
                            ? "bg-emerald-600 text-white border-emerald-600 scale-110"
                            : "bg-white dark:bg-night border-emerald-500/20"
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                  Bio / Sustainability Focus
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Enthusiast for urban composting, plastic upcycling, and zero-waste kitchens."
                  className="w-full p-2.5 rounded-xl border border-emerald-500/30 text-xs bg-white dark:bg-night"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-soft flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </motion.form>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-night-hover/50 border border-emerald-500/15">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900/60 dark:text-emerald-400 block">
                Total Eco-Points
              </span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1 block">
                {profile?.points}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-night-hover/50 border border-emerald-500/15">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900/60 dark:text-emerald-400 block">
                Active Streak
              </span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                {profile?.streak}d
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-night-hover/50 border border-emerald-500/15">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900/60 dark:text-emerald-400 block">
                Badges Unlocked
              </span>
              <span className="text-2xl font-black text-emerald-950 dark:text-emerald-100 mt-1 block">
                {profile?.badges?.length || 0}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-night-hover/50 border border-emerald-500/15">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900/60 dark:text-emerald-400 block">
                Saved Blueprints
              </span>
              <span className="text-2xl font-black text-emerald-950 dark:text-emerald-100 mt-1 block">
                {profile?.savedIdeas?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TABBED DETAILS SECTION */}
        {/* ======================================================== */}
        <div className="p-8 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-emerald-500/15 pb-3 overflow-x-auto scrollbar-none">
            {[
              { id: "badges", label: `Earned Badges (${profile?.badges?.length || 0})` },
              { id: "challenges", label: `Submitted Quests (${profile?.submissions?.length || 0})` },
              { id: "projects", label: `DIY Transformations (${profile?.projectSubmissions?.length || 0})` },
              { id: "ledger", label: `Points History (${profile?.transactions?.length || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-700 text-white shadow-soft"
                    : "text-emerald-950/70 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-night-hover"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Badges */}
          {activeTab === "badges" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(profile?.badges || []).length === 0 ? (
                <p className="text-xs text-emerald-900/60 dark:text-emerald-400 py-6 text-center col-span-3">
                  No badges earned yet. Complete challenges to earn badges.
                </p>
              ) : (
                profile.badges.map((b: any) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-night-hover/60 border border-emerald-500/15 flex items-start gap-3.5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                      🌱
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                        {b.name}
                      </h4>
                      <p className="text-xs text-emerald-900/70 dark:text-emerald-300 mt-0.5 leading-relaxed">
                        {b.description}
                      </p>
                      <span className="text-[10px] text-emerald-700/60 dark:text-emerald-400 block mt-2">
                        Unlocked on {new Date(b.awardedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Challenge Submissions */}
          {activeTab === "challenges" && (
            <div className="space-y-3">
              {(profile?.submissions || []).length === 0 ? (
                <p className="text-xs text-emerald-900/60 dark:text-emerald-400 py-6 text-center">
                  You have not submitted any challenge evidence yet.
                </p>
              ) : (
                profile.submissions.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-night-hover/40 border border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={sub.evidenceUrl}
                        alt="Evidence"
                        className="w-16 h-16 rounded-xl object-cover border border-emerald-500/20 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                          {sub.challenge?.title || "Daily Eco Quest"}
                        </h4>
                        <p className="text-emerald-900/70 dark:text-emerald-300 mt-0.5">
                          {sub.description || "Photo evidence submitted"}
                        </p>
                        <p className="text-[11px] text-emerald-900/50 dark:text-emerald-400 mt-1">
                          Submitted on {new Date(sub.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
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
                            Note: {sub.reviewerFeedback}
                          </p>
                        )}
                      </div>

                      {sub.status !== "APPROVED" && (
                        <button
                          onClick={() => handleDeleteSubmission(sub.id, "challenge")}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          title="Delete submission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: DIY Project Submissions */}
          {activeTab === "projects" && (
            <div className="space-y-3">
              {(profile?.projectSubmissions || []).length === 0 ? (
                <p className="text-xs text-emerald-900/60 dark:text-emerald-400 py-6 text-center">
                  You have not submitted any DIY completed projects yet.
                </p>
              ) : (
                profile.projectSubmissions.map((proj: any) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-night-hover/40 border border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={proj.evidenceUrl}
                        alt="Project proof"
                        className="w-16 h-16 rounded-xl object-cover border border-emerald-500/20 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                          {proj.transformationOption?.title}
                        </h4>
                        <p className="text-emerald-900/70 dark:text-emerald-300 mt-0.5">
                          {proj.notes || "Completed project photo"}
                        </p>
                        <p className="text-[11px] text-emerald-900/50 dark:text-emerald-400 mt-1">
                          Submitted on {new Date(proj.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            proj.status === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                              : proj.status === "REJECTED"
                              ? "bg-rose-500/20 text-rose-800 dark:text-rose-300"
                              : "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                          }`}
                        >
                          {proj.status}
                        </span>
                        {proj.reviewerFeedback && (
                          <p className="text-[11px] text-emerald-900/70 dark:text-emerald-300 mt-1">
                            Note: {proj.reviewerFeedback}
                          </p>
                        )}
                      </div>

                      {proj.status !== "APPROVED" && (
                        <button
                          onClick={() => handleDeleteSubmission(proj.id, "project")}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          title="Delete submission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Points History */}
          {activeTab === "ledger" && (
            <div className="divide-y divide-emerald-500/10">
              {(profile?.transactions || []).length === 0 ? (
                <p className="text-xs text-emerald-900/60 dark:text-emerald-400 py-6 text-center">
                  No points activity recorded yet.
                </p>
              ) : (
                profile.transactions.map((tx: any) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-emerald-950 dark:text-emerald-100">
                        {tx.description}
                      </p>
                      <p className="text-[11px] text-emerald-900/60 dark:text-emerald-400">
                        {new Date(tx.createdAt).toLocaleString()} • {tx.source}
                      </p>
                    </div>
                    <span className={`font-black text-sm ${tx.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} pts
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
