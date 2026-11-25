"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SPIDER_STATUS_MESSAGES = [
  "Preparing your image...",
  "Identifying the material...",
  "Exploring transformation possibilities...",
  "Evaluating sustainable alternatives...",
  "Preparing your results...",
];

interface SpiderLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SpiderLoader({ className = "", size = "md" }: SpiderLoaderProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % SPIDER_STATUS_MESSAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const dimensions = {
    sm: { w: 90, h: 90, scale: 0.75 },
    md: { w: 140, h: 140, scale: 1 },
    lg: { w: 180, h: 180, scale: 1.25 },
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center py-6 px-4 text-center ${className}`}>
      {/* Outer Glow Halo & Geometric Scanning Web Ring */}
      <div className="relative flex items-center justify-center">
        {/* Ambient pulse aura */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#43E6A1]/20 via-[#75F0B7]/25 to-[#43E6A1]/20 blur-xl pointer-events-none"
        />

        {/* Geometric Web Ring / Circular Scanning Lattice */}
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          width={dimensions.w + 40}
          height={dimensions.h + 40}
          viewBox="0 0 200 200"
          className="absolute inset-0 m-auto text-[#43E6A1]/25 dark:text-[#43E6A1]/30 pointer-events-none"
        >
          {/* Concentric octagonal web rings */}
          <polygon
            points="100,10 164,36 190,100 164,164 100,190 36,164 10,100 36,36"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeDasharray="4 6"
          />
          <polygon
            points="100,30 150,50 170,100 150,150 100,170 50,150 30,100 50,50"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeDasharray="2 4"
          />
          {/* Radial silk guide rays */}
          <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
          <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
          <line x1="36" y1="36" x2="164" y2="164" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
          <line x1="164" y1="36" x2="36" y2="164" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
        </motion.svg>

        {/* Counter-rotating scanning laser reticle */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          className="absolute w-28 h-28 rounded-full border border-dashed border-[#75F0B7]/25 pointer-events-none"
        />

        {/* Center Container: Spider-Man Style Eco Spider Emblem */}
        <div className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-white/95 dark:bg-[#182521]/95 border border-sage/40 dark:border-[#263630] shadow-elevated backdrop-blur-md flex items-center justify-center overflow-hidden transition-colors">
          {/* Subtle bio-scanning grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#43E6A1_1px,transparent_1px)] [background-size:12px_12px] opacity-20 pointer-events-none" />

          {/* Spider-Man Inspired Eco Spider SVG Emblem */}
          <svg
            width="96"
            height="96"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10"
          >
            <defs>
              <linearGradient id="spiderBodyGrad" x1="50" y1="20" x2="50" y2="82" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#75F0B7" />
                <stop offset="45%" stopColor="#43E6A1" />
                <stop offset="100%" stopColor="#1E8255" />
              </linearGradient>
              <linearGradient id="spiderLegGrad" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#75F0B7" />
                <stop offset="50%" stopColor="#43E6A1" />
                <stop offset="100%" stopColor="#25A26B" />
              </linearGradient>
              <filter id="spiderGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Left Upper Legs (Foreleg L1 & L2) - Arching upward and pointing outward/down */}
            {/* L1: High forward arch */}
            <motion.path
              d="M48 38 C43 30 35 17 24 18 C17 19 13 26 12 34"
              stroke="url(#spiderLegGrad)"
              strokeWidth="2.4"
              strokeLinecap="round"
              filter="url(#spiderGlow)"
              animate={{
                d: [
                  "M48 38 C43 30 35 17 24 18 C17 19 13 26 12 34",
                  "M48 38 C42 28 33 15 22 17 C15 18 11 25 10 33",
                  "M48 38 C43 30 35 17 24 18 C17 19 13 26 12 34",
                ],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* L2: Mid upward arch */}
            <motion.path
              d="M47 43 C39 37 28 29 18 35 C12 39 9 46 8 53"
              stroke="url(#spiderLegGrad)"
              strokeWidth="2.3"
              strokeLinecap="round"
              filter="url(#spiderGlow)"
              animate={{
                d: [
                  "M47 43 C39 37 28 29 18 35 C12 39 9 46 8 53",
                  "M47 43 C38 35 26 27 16 33 C10 38 7 45 6 52",
                  "M47 43 C39 37 28 29 18 35 C12 39 9 46 8 53",
                ],
              }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
            />

            {/* Left Lower Legs (Hindleg L3 & L4) - Sweeping downward and pointing outward */}
            {/* L3: Mid lower sweep */}
            <motion.path
              d="M47 50 C38 52 24 55 16 64 C11 70 10 77 12 83"
              stroke="url(#spiderLegGrad)"
              strokeWidth="2.3"
              strokeLinecap="round"
              filter="url(#spiderGlow)"
              animate={{
                d: [
                  "M47 50 C38 52 24 55 16 64 C11 70 10 77 12 83",
                  "M47 50 C37 54 22 57 14 66 C9 72 9 79 11 85",
                  "M47 50 C38 52 24 55 16 64 C11 70 10 77 12 83",
                ],
              }}
              transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />
            {/* L4: Long rear sweep */}
            <motion.path
              d="M48 56 C42 63 32 73 24 80 C19 84 17 88 18 92"
              stroke="url(#spiderLegGrad)"
              strokeWidth="2.4"
              strokeLinecap="round"
              filter="url(#spiderGlow)"
              animate={{
                d: [
                  "M48 56 C42 63 32 73 24 80 C19 84 17 88 18 92",
                  "M48 56 C41 65 30 75 22 82 C17 86 16 90 17 94",
                  "M48 56 C42 63 32 73 24 80 C19 84 17 88 18 92",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.45 }}
            />

            {/* Right Upper Legs (Foreleg R1 & R2) - Symmetrical arching upward */}
            {/* R1: High forward arch */}
            <motion.path
              d="M52 38 C57 30 65 17 76 18 C83 19 87 26 88 34"
              stroke="url(#spiderLegGrad)"
              strokeWidth="2.4"
              strokeLinecap="round"
              filter="url(#spiderGlow)"
              animate={{
                d: [
                  "M52 38 C57 30 65 17 76 18 C83 19 87 26 88 34",
                  "M52 38 C58 28 67 15 78 17 C85 18 89 25 90 33",
                  "M52 38 C57 30 65 17 76 18 C83 19 87 26 88 34",
                ],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* R2: Mid upward arch */}
            <motion.path
              d="M53 43 C61 37 72 29 82 35 C88 39 91 46 92 53"
              stroke="url(#spiderLegGrad)"
              strokeWidth="2.3"
              strokeLinecap="round"
              filter="url(#spiderGlow)"
              animate={{
                d: [
                  "M53 43 C61 37 72 29 82 35 C88 39 91 46 92 53",
                  "M53 43 C62 35 74 27 84 33 C90 38 93 45 94 52",
                  "M53 43 C61 37 72 29 82 35 C88 39 91 46 92 53",
                ],
              }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
            />

            {/* Right Lower Legs (Hindleg R3 & R4) - Symmetrical sweeping downward */}
            {/* R3: Mid lower sweep */}
            <motion.path
              d="M53 50 C62 52 76 55 84 64 C89 70 90 77 88 83"
              stroke="url(#spiderLegGrad)"
              strokeWidth="2.3"
              strokeLinecap="round"
              filter="url(#spiderGlow)"
              animate={{
                d: [
                  "M53 50 C62 52 76 55 84 64 C89 70 90 77 88 83",
                  "M53 50 C63 54 78 57 86 66 C91 72 91 79 89 85",
                  "M53 50 C62 52 76 55 84 64 C89 70 90 77 88 83",
                ],
              }}
              transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />
            {/* R4: Long rear sweep */}
            <motion.path
              d="M52 56 C58 63 68 73 76 80 C81 84 83 88 82 92"
              stroke="url(#spiderLegGrad)"
              strokeWidth="2.4"
              strokeLinecap="round"
              filter="url(#spiderGlow)"
              animate={{
                d: [
                  "M52 56 C58 63 68 73 76 80 C81 84 83 88 82 92",
                  "M52 56 C59 65 70 75 78 82 C83 86 84 90 83 94",
                  "M52 56 C58 63 68 73 76 80 C81 84 83 88 82 92",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.45 }}
            />

            {/* Iconic Spider-Man Style Spider Body: Cephalothorax (Head) & Abdomen */}
            {/* Upper Body (Head / Cephalothorax) */}
            <motion.path
              d="M50 26 C46 26 44 30 44 35 C44 40 47 43 50 44 C53 43 56 40 56 35 C56 30 54 26 50 26 Z"
              fill="url(#spiderBodyGrad)"
              filter="url(#spiderGlow)"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Dual Head Mandibles / Pincers */}
            <path d="M47 27 L45 23" stroke="#75F0B7" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M53 27 L55 23" stroke="#75F0B7" strokeWidth="1.8" strokeLinecap="round" />

            {/* Lower Body (Iconic Elongated Tapered Abdomen) */}
            <motion.path
              d="M50 45 C45 47 43 53 43 60 C43 68 47 76 50 81 C53 76 57 68 57 60 C57 53 55 47 50 45 Z"
              fill="url(#spiderBodyGrad)"
              stroke="#75F0B7"
              strokeWidth="0.8"
              filter="url(#spiderGlow)"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
            />

            {/* Internal Glowing Spine Line */}
            <line x1="50" y1="48" x2="50" y2="76" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />

            {/* Pulsing Core Energy Node */}
            <motion.circle
              cx="50"
              cy="58"
              r="2.6"
              fill="#FFFFFF"
              animate={{
                r: [2, 3.4, 2],
                opacity: [0.75, 1, 0.75],
              }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>
      </div>

      {/* Dynamic Animated Status Messages */}
      <div className="mt-7 space-y-2 h-14 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="text-base sm:text-lg font-bold font-heading text-charcoal dark:text-darktext tracking-tight"
          >
            {SPIDER_STATUS_MESSAGES[currentMessageIndex]}
          </motion.p>
        </AnimatePresence>

        <p className="text-xs text-charcoal/70 dark:text-darktext-secondary max-w-sm mx-auto">
          EcoHack Vision Engine inspecting polymer geometry, materials classification, and safe diversion pathways.
        </p>
      </div>
    </div>
  );
}

export default SpiderLoader;

