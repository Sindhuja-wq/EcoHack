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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-cream/90 dark:bg-night-card/90 border-b border-sage/30 dark:border-night-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-11 h-11 rounded-2xl bg-forest p-0.5 shadow-soft transition-transform group-hover:scale-105 flex items-center justify-center">
            <div className="w-full h-full bg-cream dark:bg-night rounded-[14px] flex items-center justify-center">
              <Leaf className="w-6 h-6 text-forest dark:text-emeraldaccent group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center">
              <span className="font-heading font-extrabold text-2xl tracking-tight text-forest dark:text-darktext">
                EcoHack
              </span>
            </div>
            <p className="text-[11px] font-medium text-charcoal/70 dark:text-darktext-muted hidden sm:block tracking-wide">
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
                    ? "text-forest dark:text-emeraldaccent bg-forest/10 dark:bg-forest/20"
                    : "text-charcoal/70 dark:text-darktext-muted hover:text-forest dark:hover:text-darktext hover:bg-forest/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-forest dark:text-emeraldaccent" : ""}`} />
                <span>{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-forest dark:bg-emeraldaccent rounded-full"
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
                  ? "bg-terracotta/20 text-terracotta border border-terracotta/40"
                  : "bg-terracotta/10 text-terracotta hover:bg-terracotta/15"
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
            className="p-2.5 rounded-xl border border-sage/40 dark:border-night-border bg-white/70 dark:bg-night-card text-charcoal dark:text-darktext hover:bg-cream dark:hover:bg-night-hover transition-colors focus:outline-none"
          >
            {isDark ? <Sun className="w-4 h-4 text-emeraldaccent" /> : <Moon className="w-4 h-4 text-forest" />}
          </button>

          {/* User state */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* Gamification chips */}
              <div className="hidden sm:flex items-center gap-2">
                <div
                  title="Total Eco-Points"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest/10 dark:bg-forest/20 text-forest dark:text-emeraldaccent border border-forest/25 text-xs font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
                  <span>{user.points} pts</span>
                </div>

                <div
                  title="Daily Sustainability Streak"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-terracotta/15 text-terracotta border border-terracotta/25 text-xs font-bold"
                >
                  <Flame className="w-3.5 h-3.5 text-terracotta fill-terracotta" />
                  <span>{user.streak}d</span>
                </div>
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl border border-sage/40 dark:border-night-border hover:border-forest bg-white dark:bg-night-hover text-sm font-semibold transition-all focus:outline-none"
                >
                  <span className="hidden md:inline max-w-[120px] truncate text-charcoal dark:text-darktext">
                    {user.name.split(" ")[0]}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-forest dark:bg-emeraldaccent text-white dark:text-night flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {user.name.slice(0, 2)}
                  </div>
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-night-card border border-sage/40 dark:border-night-border shadow-dark-card py-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-sage/20">
                        <p className="text-xs text-charcoal/60 dark:text-cream/60">Signed in as</p>
                        <p className="text-sm font-bold text-charcoal dark:text-cream truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-charcoal dark:text-cream hover:bg-cream dark:hover:bg-night-hover transition-colors font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4 text-forest dark:text-limeaccent" />
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-charcoal dark:text-cream hover:bg-cream dark:hover:bg-night-hover transition-colors font-medium"
                        >
                          <User className="w-4 h-4 text-forest dark:text-limeaccent" />
                          My Profile
                        </Link>
                        <Link
                          href="/history"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-charcoal dark:text-cream hover:bg-cream dark:hover:bg-night-hover transition-colors font-medium"
                        >
                          <History className="w-4 h-4 text-forest dark:text-limeaccent" />
                          Activity History
                        </Link>
                        <Link
                          href="/saved-ideas"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-charcoal dark:text-cream hover:bg-cream dark:hover:bg-night-hover transition-colors font-medium"
                        >
                          <Bookmark className="w-4 h-4 text-forest dark:text-limeaccent" />
                          Saved Ideas
                        </Link>

                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-terracotta hover:bg-cream dark:hover:bg-night-hover transition-colors font-semibold border-t border-sage/20 mt-1"
                          >
                            <ShieldCheck className="w-4 h-4 text-terracotta" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-sage/20 pt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-terracotta hover:bg-terracotta/10 transition-colors font-medium text-left"
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
                className="px-4 py-2 rounded-xl text-sm font-semibold text-charcoal dark:text-cream hover:text-forest dark:hover:text-limeaccent hover:bg-forest/5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-forest hover:bg-forest-800 transition-colors shadow-soft"
              >
                Join Free
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl border border-sage/40 text-charcoal dark:text-cream hover:bg-cream transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-sage/30 dark:border-night-border bg-cream/95 dark:bg-night-card/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-3"
          >
            <div className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? "bg-forest/15 text-forest dark:text-limeaccent font-bold"
                        : "text-charcoal/80 dark:text-cream/80 hover:bg-cream hover:text-forest"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
