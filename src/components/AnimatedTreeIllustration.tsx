"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface AnimatedTreeProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showParticles?: boolean; // Retained for backwards-compatibility; unused
  interactive?: boolean; // Retained for backwards-compatibility; unused
  priority?: boolean;
}

const sizeClasses = {
  sm: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

/**
 * NaturalTreeImage (AnimatedTreeIllustration)
 * Displays a realistic, authentic, high-resolution nature photograph
 * of a majestic sunlit tree in a natural landscape.
 */
export function AnimatedTreeIllustration({
  size = "md",
  className = "",
  priority = false,
}: AnimatedTreeProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`relative w-full ${sizeClasses[size]} mx-auto select-none ${className}`}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-sage/40 dark:border-forest/30 shadow-soft-lg bg-cream/40 dark:bg-night-card/40">
        <Image
          src="/images/realistic-tree.jpg"
          alt="Majestic green tree bathed in natural sunlight in a peaceful landscape"
          width={1376}
          height={768}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 650px"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ease-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </div>
  );
}

// Semantic aliases for cleaner future imports
export const RealisticTreeImage = AnimatedTreeIllustration;
export const NaturalTreeImage = AnimatedTreeIllustration;
