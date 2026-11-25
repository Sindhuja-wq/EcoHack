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
  ShieldCheck,
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
      <div className="w-full min-h-[calc(100vh-68px)] py-12 flex items-center justify-center bg-cream dark:bg-night text-sm font-semibold text-charcoal/60 dark:text-darktext-muted transition-colors">
        Loading profile details...
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-68px)] py-12 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-darktext flex justify-center relative overflow-hidden transition-colors">
      {/* Background ambient glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-96 bg-emerald-500/10 dark:bg-[#43E6A1]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl w-full space-y-8 relative z-10">
        {/* ======================================================== */}
        {/* PROFILE HEADER & EDIT CARD */}
        {/* ======================================================== */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-sage/30 dark:border-night-border">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent flex items-center justify-center text-3xl shadow-sm shrink-0">
                {profile?.avatar || "🌱"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black font-heading text-charcoal dark:text-darktext">
                    {profile?.name}
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent">
                    {profile?.role}
                  </span>
                </div>
                <p className="text-xs text-charcoal/60 dark:text-darktext-muted mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-charcoal/60 dark:text-darktext-muted" />
                  <span>{user?.email}</span>
                </p>
                {profile?.bio && (
                  <p className="text-xs text-charcoal/70 dark:text-darktext-secondary mt-2 max-w-md leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 rounded-xl border border-sage/40 dark:border-night-border bg-cream-50 dark:bg-night-card hover:bg-cream-100 dark:hover:bg-night-border text-xs font-semibold text-charcoal dark:text-darktext flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
                <span>{editing ? "Cancel" : "Edit Profile"}</span>
              </button>
              <button
                onClick={() => logout()}
                className="px-4 py-2 rounded-xl border border-sage/40 dark:border-night-border bg-cream-50 dark:bg-night-card hover:bg-amber-500/10 dark:hover:bg-[#E07A5F]/20 text-xs font-semibold text-charcoal/70 dark:text-darktext-muted hover:text-terra dark:hover:text-[#E07A5F] flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Edit Form */}
          {editing && (
            <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-4 transition-colors">
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest dark:text-emeraldaccent">
                Edit Profile Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 dark:text-darktext-secondary mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sage/40 dark:border-night-border bg-white dark:bg-night-secondary text-xs text-charcoal dark:text-darktext focus:outline-none focus:border-forest dark:focus:border-emeraldaccent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 dark:text-darktext-secondary mb-1">
                    Avatar Emoji
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {AVATAR_OPTIONS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setAvatar(em)}
                        className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${
                          avatar === em
                            ? "bg-forest dark:bg-emeraldaccent text-white dark:text-night scale-110"
                            : "bg-white dark:bg-night-secondary border border-sage/30 dark:border-night-border hover:border-forest/40 dark:hover:border-emeraldaccent/40"
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal/80 dark:text-darktext-secondary mb-1">
                  Bio / Sustainability Focus
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your favorite DIY projects or environmental goals..."
                  className="w-full px-3.5 py-2 rounded-xl border border-sage/40 dark:border-night-border bg-white dark:bg-night-secondary text-xs text-charcoal dark:text-darktext focus:outline-none focus:border-forest dark:focus:border-emeraldaccent"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs text-charcoal/70 dark:text-darktext-secondary hover:bg-cream-100 dark:hover:bg-night-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover text-white dark:text-night font-bold text-xs shadow-glow transition-all"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border transition-colors">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted block">
                Total Eco Points
              </span>
              <span className="text-2xl font-black font-heading text-forest dark:text-emeraldaccent">
                {profile?.points || 0}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border transition-colors">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted block">
                Quest Streak
              </span>
              <span className="text-2xl font-black font-heading text-terra dark:text-[#E07A5F]">
                🔥 {profile?.streak || 1}d
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border transition-colors">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted block">
                Badges Unlocked
              </span>
              <span className="text-2xl font-black font-heading text-forest-light dark:text-emeraldaccent-light">
                {profile?.badges?.length || 0}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border transition-colors">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted block">
                Saved Blueprints
              </span>
              <span className="text-2xl font-black font-heading text-forest dark:text-[#B6EAD0]">
                {profile?.savedIdeas?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TABS FOR BADGES, CHALLENGES, PROJECTS & TRANSACTIONS */}
        {/* ======================================================== */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-6 transition-colors">
          <div className="flex items-center gap-2 border-b border-sage/30 dark:border-night-border pb-3 overflow-x-auto scrollbar-none">
            {[
              { id: "badges", label: `Earned Badges (${profile?.badges?.length || 0})` },
              { id: "challenges", label: `Quests (${profile?.submissions?.length || 0})` },
              { id: "projects", label: `Completed DIY (${profile?.projectSubmissions?.length || 0})` },
              { id: "ledger", label: `Points Ledger (${profile?.transactions?.length || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-forest dark:bg-emeraldaccent text-white dark:text-night shadow-glow"
                    : "text-charcoal/70 dark:text-darktext-secondary hover:text-charcoal dark:hover:text-darktext hover:bg-cream-100 dark:hover:bg-night-card"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: BADGES */}
          {activeTab === "badges" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(profile?.badges || []).length === 0 ? (
                <div className="col-span-full py-10 text-center text-xs text-charcoal/60 dark:text-darktext-muted">
                  No badges unlocked yet. Complete a daily eco challenge to earn your first badge!
                </div>
              ) : (
                profile?.badges?.map((badge: any) => (
                  <div
                    key={badge.id}
                    className="p-5 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-2 text-center hover:border-forest/40 dark:hover:border-emeraldaccent/40 transition-colors"
                  >
                    <div className="text-3xl mb-1">🌱</div>
                    <h4 className="font-bold font-heading text-sm text-charcoal dark:text-darktext">
                      {badge.name}
                    </h4>
                    <p className="text-xs text-charcoal/60 dark:text-darktext-muted leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: CHALLENGES */}
          {activeTab === "challenges" && (
            <div className="space-y-3">
              {(profile?.submissions || []).length === 0 ? (
                <div className="py-10 text-center text-xs text-charcoal/60 dark:text-darktext-muted">
                  No challenge submissions recorded yet.
                </div>
              ) : (
                profile?.submissions?.map((s: any) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          s.status === "APPROVED"
                            ? "bg-emerald-500/15 text-forest dark:text-emeraldaccent"
                            : s.status === "REJECTED"
                            ? "bg-amber-500/15 text-terra dark:text-[#E07A5F]"
                            : "bg-cream-100 dark:bg-night-border text-charcoal/70 dark:text-darktext-secondary"
                        }`}>
                          {s.status}
                        </span>
                        <span className="text-charcoal/60 dark:text-darktext-muted">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold font-heading text-sm text-charcoal dark:text-darktext">
                        {s.challenge?.title || "Eco Challenge"}
                      </h4>
                      {s.description && (
                        <p className="text-charcoal/70 dark:text-darktext-secondary mt-1">{s.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteSubmission(s.id, "challenge")}
                      className="p-1.5 rounded-lg text-charcoal/60 dark:text-darktext-muted hover:text-terra dark:hover:text-[#E07A5F] self-end sm:self-center transition-colors"
                      title="Delete submission"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-3">
              {(profile?.projectSubmissions || []).length === 0 ? (
                <div className="py-10 text-center text-xs text-charcoal/60 dark:text-darktext-muted">
                  No completed DIY projects submitted yet.
                </div>
              ) : (
                profile?.projectSubmissions?.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          p.status === "APPROVED"
                            ? "bg-emerald-500/15 text-forest dark:text-emeraldaccent"
                            : p.status === "REJECTED"
                            ? "bg-amber-500/15 text-terra dark:text-[#E07A5F]"
                            : "bg-cream-100 dark:bg-night-border text-charcoal/70 dark:text-darktext-secondary"
                        }`}>
                          {p.status}
                        </span>
                        <span className="text-charcoal/60 dark:text-darktext-muted">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold font-heading text-sm text-charcoal dark:text-darktext">
                        {p.transformationOption?.title || "DIY Project"}
                      </h4>
                      {p.notes && <p className="text-charcoal/70 dark:text-darktext-secondary mt-1">{p.notes}</p>}
                    </div>

                    <button
                      onClick={() => handleDeleteSubmission(p.id, "project")}
                      className="p-1.5 rounded-lg text-charcoal/60 dark:text-darktext-muted hover:text-terra dark:hover:text-[#E07A5F] self-end sm:self-center transition-colors"
                      title="Delete submission"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: LEDGER */}
          {activeTab === "ledger" && (
            <div className="divide-y divide-sage/30 dark:divide-night-border">
              {(profile?.transactions || []).length === 0 ? (
                <div className="py-10 text-center text-xs text-charcoal/60 dark:text-darktext-muted">
                  No points transactions recorded yet.
                </div>
              ) : (
                profile?.transactions?.map((tx: any) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-charcoal dark:text-darktext">{tx.description}</p>
                      <p className="text-[11px] text-charcoal/60 dark:text-darktext-muted">
                        {new Date(tx.createdAt).toLocaleDateString()} • {tx.source.replace("_", " ")}
                      </p>
                    </div>
                    <span className={`font-black text-sm ${tx.amount > 0 ? "text-forest dark:text-emeraldaccent" : "text-terra dark:text-[#E07A5F]"}`}>
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
