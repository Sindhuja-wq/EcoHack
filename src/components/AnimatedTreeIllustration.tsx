"use client";

import React from "react";
import { motion } from "framer-motion";

interface AnimatedTreeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showParticles?: boolean;
}

export function AnimatedTreeIllustration({
  size = "md",
  className = "",
  showParticles = true,
}: AnimatedTreeProps) {
  const sizeClasses = {
    sm: "w-64 h-64",
    md: "w-80 h-80 sm:w-96 sm:h-96",
    lg: "w-full max-w-lg aspect-square",
  };

  // Floating leaves configuration
  const particles = [
    { id: 1, x: -60, y: -40, delay: 0.2, duration: 4.5, rotate: 45 },
    { id: 2, x: 70, y: -70, delay: 1.1, duration: 5.2, rotate: -30 },
    { id: 3, x: -30, y: -110, delay: 2.0, duration: 4.8, rotate: 60 },
    { id: 4, x: 45, y: -30, delay: 0.7, duration: 5.5, rotate: -45 },
    { id: 5, x: -80, y: -80, delay: 1.8, duration: 6.0, rotate: 20 },
    { id: 6, x: 85, y: -120, delay: 2.5, duration: 5.0, rotate: -70 },
  ];

  return (
    <div className={`relative flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}>
      {/* Background Soft Radiant Aura */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-3/4 h-3/4 rounded-full bg-gradient-to-tr from-emerald-500/20 via-green-400/25 to-teal-300/10 blur-3xl pointer-events-none"
      />

      {/* SVG Tree & Nature Scene */}
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
        role="img"
        aria-label="EcoHack growing tree of sustainability"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="trunkGrad" x1="200" y1="360" x2="200" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#14532D" />
            <stop offset="0.6" stopColor="#166534" />
            <stop offset="1" stopColor="#15803D" />
          </linearGradient>

          <linearGradient id="leafGradMain" x1="120" y1="80" x2="280" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4ADE80" />
            <stop offset="0.5" stopColor="#22C55E" />
            <stop offset="1" stopColor="#15803D" />
          </linearGradient>

          <linearGradient id="leafGradLight" x1="150" y1="60" x2="250" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#86EFAC" />
            <stop offset="0.6" stopColor="#22C55E" />
            <stop offset="1" stopColor="#166534" />
          </linearGradient>

          <linearGradient id="soilGrad" x1="120" y1="360" x2="280" y2="380" gradientUnits="userSpaceOnUse">
            <stop stopColor="#166534" stopOpacity="0.4" />
            <stop offset="1" stopColor="#22C55E" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Ground Mound */}
        <motion.ellipse
          cx="200"
          cy="365"
          rx="120"
          ry="15"
          fill="url(#soilGrad)"
          initial={{ scaleX: 0.6, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Tree Trunk & Roots */}
        <motion.path
          d="M 185 365 
             C 185 350, 192 310, 190 260 
             C 188 230, 175 210, 160 195 
             C 178 200, 193 215, 196 230 
             C 202 195, 220 180, 240 170 
             C 225 185, 212 210, 206 240 
             C 204 290, 214 340, 215 365
             Z"
          fill="url(#trunkGrad)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />

        {/* Branch Left */}
        <motion.path
          d="M 190 240 C 170 230, 140 235, 120 220 C 135 220, 160 225, 180 232 Z"
          fill="#166534"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />

        {/* Branch Right */}
        <motion.path
          d="M 205 220 C 230 205, 260 215, 280 200 C 265 205, 240 200, 215 215 Z"
          fill="#166534"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        />

        {/* Foliage Canopy Clusters with Wind Sway */}
        <motion.g
          animate={{
            rotate: [-1.2, 1.2, -1.2],
            transformOrigin: "200px 280px",
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Main central foliage mass */}
          <motion.circle
            cx="200"
            cy="150"
            r="65"
            fill="url(#leafGradMain)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.95 }}
            transition={{ duration: 1.2, delay: 0.4, type: "spring", stiffness: 120 }}
          />

          {/* Left foliage cluster */}
          <motion.circle
            cx="145"
            cy="170"
            r="48"
            fill="url(#leafGradLight)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.9 }}
            transition={{ duration: 1.2, delay: 0.6, type: "spring", stiffness: 100 }}
          />

          {/* Right foliage cluster */}
          <motion.circle
            cx="255"
            cy="165"
            r="50"
            fill="url(#leafGradMain)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.92 }}
            transition={{ duration: 1.2, delay: 0.7, type: "spring", stiffness: 110 }}
          />

          {/* Top highlight cluster */}
          <motion.circle
            cx="185"
            cy="110"
            r="44"
            fill="url(#leafGradLight)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.95 }}
            transition={{ duration: 1.2, delay: 0.8, type: "spring", stiffness: 110 }}
          />

          <motion.circle
            cx="230"
            cy="120"
            r="38"
            fill="url(#leafGradMain)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.9 }}
            transition={{ duration: 1.2, delay: 0.9, type: "spring", stiffness: 90 }}
          />

          {/* Detailed stylized leaves sprouting on edges */}
          {[
            { cx: 120, cy: 140, r: 8, rot: -30 },
            { cx: 280, cy: 145, r: 9, rot: 40 },
            { cx: 175, cy: 75, r: 7, rot: -10 },
            { cx: 220, cy: 80, r: 8, rot: 25 },
            { cx: 105, cy: 180, r: 6, rot: -45 },
            { cx: 295, cy: 180, r: 7, rot: 50 },
          ].map((leaf, index) => (
            <motion.ellipse
              key={index}
              cx={leaf.cx}
              cy={leaf.cy}
              rx={leaf.r * 1.5}
              ry={leaf.r}
              transform={`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`}
              fill="#86EFAC"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
            />
          ))}
        </motion.g>

        {/* Circular Sunlight Rings */}
        <motion.circle
          cx="200"
          cy="150"
          r="110"
          stroke="#22C55E"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          strokeOpacity="0.25"
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle
          cx="200"
          cy="150"
          r="140"
          stroke="#16A34A"
          strokeWidth="1"
          strokeDasharray="2 12"
          strokeOpacity="0.2"
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      </svg>

      {/* Floating Leaves & Spores in the Wind */}
      {showParticles &&
        particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: 0, opacity: 0, rotate: 0 }}
            animate={{
              x: [p.x, p.x + (p.id % 2 === 0 ? 30 : -30), p.x],
              y: [0, p.y - 40, p.y - 90],
              opacity: [0, 0.85, 0],
              rotate: [0, p.rotate, p.rotate * 2],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
            className="absolute pointer-events-none"
          >
            <div className="w-3 h-2 rounded-full bg-emerald-400 dark:bg-emerald-300 shadow-sm" style={{ clipPath: "polygon(0% 50%, 50% 0%, 100% 50%, 50% 100%)" }} />
          </motion.div>
        ))}
    </div>
  );
}
