"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ==========================================
// 1. THEME CONTEXT
// ==========================================
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// ==========================================
// 2. AUTH CONTEXT
// ==========================================
export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  streak: number;
  avatar: string | null;
  bio?: string | null;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// ==========================================
// 3. TOAST NOTIFICATION CONTEXT
// ==========================================
interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

// ==========================================
// ROOT PROVIDER COMPONENT
// ==========================================
export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("ecohack_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme ? savedTheme === "dark" : prefersDark;

    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ecohack_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ecohack_theme", "light");
    }
  };

  // Auth state
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      showToast("Logged out successfully", "info");
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  // Toast state
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToasts((prev) => {
      // Prevent duplicate identical alerts from displaying simultaneously
      if (prev.some((t) => t.message === message && t.type === type)) {
        return prev;
      }
      const id = `${Date.now()}_${Math.random()}`;
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, 4500);
      return [...prev, { id, type, message }];
    });
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <AuthContext.Provider value={{ user, loading, refreshUser: fetchCurrentUser, logout }}>
        <ToastContext.Provider value={{ showToast }}>
          {children}

          {/* Floating Toast Notification Container */}
          <div
            className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none"
            aria-live="polite"
          >
            <AnimatePresence>
              {toasts.map((toast) => (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-soft-lg text-sm font-medium border backdrop-blur-md ${
                    toast.type === "success"
                      ? "bg-white/95 dark:bg-night-card/95 text-emerald-900 dark:text-emerald-100 border-emerald-500/30"
                      : toast.type === "error"
                      ? "bg-white/95 dark:bg-night-card/95 text-rose-900 dark:text-rose-100 border-rose-500/30"
                      : "bg-white/95 dark:bg-night-card/95 text-teal-900 dark:text-teal-100 border-teal-500/30"
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {toast.type === "success" && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                    {toast.type === "error" && (
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                    )}
                    {toast.type === "info" && (
                      <Info className="w-5 h-5 text-teal-500" />
                    )}
                  </div>
                  <div className="flex-1 leading-snug">{toast.message}</div>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="shrink-0 opacity-60 hover:opacity-100 transition-opacity p-0.5"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ToastContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
