"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useTheme } from "./Providers";
import {
  Sparkles,
  Camera,
  Target,
  Trophy,
  LayoutDashboard,
  Bookmark,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Flame,
  Leaf,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "AI Scanner", href: "/scanner", icon: Camera },
    { label: "Eco Challenges", href: "/challenges", icon: Target },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Saved Ideas", href: "/saved-ideas", icon: Bookmark },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-night-card/85 border-b border-emerald-500/15 dark:border-emerald-500/20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-green-400 p-0.5 shadow-soft transition-transform group-hover:scale-105 flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-night rounded-[14px] flex items-center justify-center">
              <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-800 via-emerald-600 to-green-500 dark:from-emerald-300 dark:via-emerald-400 dark:to-green-300 bg-clip-text text-transparent">
                EcoHack
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                AI
              </span>
            </div>
            <p className="text-[11px] font-medium text-emerald-700/80 dark:text-emerald-400/80 hidden sm:block tracking-wide">
              Turn Waste Into Worth
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                  active
                    ? "text-emerald-800 dark:text-emerald-200 bg-emerald-500/10 dark:bg-emerald-500/15"
                    : "text-emerald-950/70 dark:text-emerald-200/70 hover:text-emerald-900 dark:hover:text-white hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
                <span>{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-500 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isActive("/admin")
                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
          )}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 rounded-xl border border-emerald-500/20 bg-white/70 dark:bg-night-hover/80 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-night-border transition-colors focus:outline-none"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-700" />}
          </button>

          {/* User state */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* Gamification chips */}
              <div className="hidden sm:flex items-center gap-2">
                <div
                  title="Total Eco-Points"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border border-emerald-500/25 text-xs font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{user.points} pts</span>
                </div>

                <div
                  title="Daily Sustainability Streak"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/25 text-xs font-bold"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{user.streak}d</span>
                </div>
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 bg-white dark:bg-night-hover text-sm font-semibold transition-all focus:outline-none"
                >
                  <span className="hidden md:inline max-w-[120px] truncate text-emerald-950 dark:text-emerald-100">
                    {user.name.split(" ")[0]}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {user.name.slice(0, 2)}
                  </div>
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-night-card border border-emerald-500/20 shadow-soft-lg py-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-emerald-500/10">
                        <p className="text-xs text-emerald-950/60 dark:text-emerald-400">Signed in as</p>
                        <p className="text-sm font-bold text-emerald-950 dark:text-emerald-100 truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-950 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-night-hover transition-colors font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-950 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-night-hover transition-colors font-medium"
                        >
                          <User className="w-4 h-4 text-emerald-600" />
                          My Profile
                        </Link>
                        <Link
                          href="/history"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-950 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-night-hover transition-colors font-medium"
                        >
                          <History className="w-4 h-4 text-emerald-600" />
                          Activity History
                        </Link>
                        <Link
                          href="/saved-ideas"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-950 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-night-hover transition-colors font-medium"
                        >
                          <Bookmark className="w-4 h-4 text-emerald-600" />
                          Saved Ideas
                        </Link>

                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-night-hover transition-colors font-semibold border-t border-emerald-500/10 mt-1"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-emerald-500/10 pt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors font-medium text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500/10 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Join Free
              </Link>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-emerald-500/20 text-emerald-950 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-night-hover transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-emerald-500/15 bg-white/95 dark:bg-night-card/95 backdrop-blur-md px-4 py-4 space-y-1.5"
          >
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    active
                      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                      : "text-emerald-950 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-night-hover"
                  }`}
                >
                  <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  {item.label}
                </Link>
              );
            })}

            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10"
              >
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                Admin Console
              </Link>
            )}

            {!user && (
              <div className="pt-3 border-t border-emerald-500/10 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="text-center py-2.5 rounded-xl border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-sm font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-center py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-bold shadow-sm"
                >
                  Join Free
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
