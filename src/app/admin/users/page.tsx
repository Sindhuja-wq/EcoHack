"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import {
  ArrowLeft,
  Users,
  Search,
  Shield,
  Sparkles,
  Flame,
  Award,
  Edit,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Edit User modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [role, setRole] = useState<string>("USER");
  const [pointAdjustment, setPointAdjustment] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/admin/users");
      } else if (user.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  const fetchUsers = async (query = "") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        showToast(data.error || "Failed to load users", "error");
      }
    } catch {
      showToast("Error loading user directory", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchUsers(search);
    }
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  // Open modal
  const handleOpenEdit = (targetUser: any) => {
    setSelectedUser(targetUser);
    setRole(targetUser.role);
    setPointAdjustment(0);
    setReason("");
    setModalOpen(true);
  };

  // Save changes
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSaving(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          role,
          pointAdjustment: pointAdjustment !== 0 ? Number(pointAdjustment) : undefined,
          reason: reason || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setModalOpen(false);
        fetchUsers(search);
      } else {
        showToast(data.error || "Failed to update user", "error");
      }
    } catch {
      showToast("Network error updating user", "error");
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
              Community User Directory
            </h1>
            <p className="text-xs text-emerald-900/60 dark:text-emerald-400 mt-0.5">
              Manage accounts, roles, audit trails, and manual point adjustments.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-emerald-700/60 dark:text-emerald-400/60 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="pl-9 pr-4 py-2 rounded-xl border border-emerald-500/25 bg-white dark:bg-night-card text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs"
            >
              Search
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div className="p-8 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft space-y-4">
          <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
            Registered Members ({users.length})
          </h3>

          {loading ? (
            <p className="text-center py-12 text-sm text-emerald-900/60 dark:text-emerald-400 font-semibold">
              Loading users...
            </p>
          ) : (
            <div className="divide-y divide-emerald-500/10">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 text-white font-black text-sm flex items-center justify-center uppercase shadow-sm">
                      {u.name.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                          {u.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.role === "ADMIN"
                              ? "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                              : "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                      <p className="text-emerald-900/60 dark:text-emerald-400">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="font-black text-sm text-emerald-700 dark:text-emerald-300 block">
                        {u.points} pts
                      </span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                        🔥 {u.streak}d streak
                      </span>
                    </div>

                    <div className="text-right hidden sm:block">
                      <span className="text-emerald-900/70 dark:text-emerald-300 block">
                        {u._count?.submissions || 0} quests, {u._count?.projectSubmissions || 0} projects
                      </span>
                      <span className="text-[10px] text-emerald-900/50 dark:text-emerald-400 block">
                        Joined {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="px-3.5 py-1.5 rounded-xl border border-emerald-500/25 text-emerald-800 dark:text-emerald-200 font-bold text-xs hover:bg-emerald-50"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal: Manage User Role & Points */}
        <AnimatePresence>
          {modalOpen && selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white dark:bg-night-card rounded-3xl p-6 sm:p-8 shadow-soft-lg border border-emerald-500/25 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-emerald-500/15 pb-4">
                  <div>
                    <h3 className="text-base font-black text-emerald-950 dark:text-emerald-100">
                      Manage {selectedUser.name}
                    </h3>
                    <p className="text-xs text-emerald-900/60 dark:text-emerald-400">
                      {selectedUser.email}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1 rounded-lg text-emerald-900/60 hover:text-emerald-900 dark:text-emerald-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                      Account Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-emerald-500/30 bg-white dark:bg-night"
                    >
                      <option value="USER">USER (Standard Member)</option>
                      <option value="ADMIN">ADMIN (System Administrator)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                      Point Adjustment (+ or -)
                    </label>
                    <input
                      type="number"
                      value={pointAdjustment}
                      onChange={(e) => setPointAdjustment(Number(e.target.value))}
                      placeholder="e.g. 50 or -20"
                      className="w-full p-2.5 rounded-xl border border-emerald-500/30 bg-white dark:bg-night"
                    />
                    <p className="text-[10px] text-emerald-900/60 dark:text-emerald-400 mt-1">
                      Current points: {selectedUser.points}. Enter 0 for no adjustment.
                    </p>
                  </div>

                  {pointAdjustment !== 0 && (
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                        Reason for Point Adjustment (Required for audit log)
                      </label>
                      <input
                        type="text"
                        required
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Bonus for outstanding community upcycling tutorial"
                        className="w-full p-2.5 rounded-xl border border-emerald-500/30 bg-white dark:bg-night"
                      />
                    </div>
                  )}

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
                      className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-soft"
                    >
                      {saving ? "Saving..." : "Save Changes"}
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
