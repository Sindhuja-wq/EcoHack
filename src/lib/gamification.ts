import { prisma } from "./prisma";

export type PointSource =
  | "CHALLENGE_COMPLETION"
  | "TRANSFORMATION_COMPLETION"
  | "WEEKLY_GOAL"
  | "STREAK_BONUS"
  | "ADMIN_ADJUSTMENT";

export interface AwardPointsResult {
  success: boolean;
  pointsAwarded: number;
  totalPoints: number;
  newBadges: { code: string; name: string; icon: string }[];
  alreadyAwarded?: boolean;
}

/**
 * Calculates user level based on total points
 */
export function calculateLevel(points: number): {
  level: number;
  name: string;
  currentLevelPoints: number;
  nextLevelPoints: number;
  progressPercent: number;
} {
  const levels = [
    { level: 1, name: "Eco Seedling", min: 0, max: 150 },
    { level: 2, name: "Sprout Guardian", min: 150, max: 350 },
    { level: 3, name: "Waste Transformer", min: 350, max: 650 },
    { level: 4, name: "Circular Innovator", min: 650, max: 1000 },
    { level: 5, name: "Sustainability Master", min: 1000, max: 2000 },
  ];

  for (let i = 0; i < levels.length; i++) {
    const l = levels[i];
    if (points >= l.min && points < l.max) {
      const currentLevelPoints = points - l.min;
      const range = l.max - l.min;
      const progressPercent = Math.min(100, Math.round((currentLevelPoints / range) * 100));
      return { level: l.level, name: l.name, currentLevelPoints, nextLevelPoints: l.max, progressPercent };
    }
  }

  // Above top level
  return {
    level: 6,
    name: "Planetary Champion",
    currentLevelPoints: points,
    nextLevelPoints: points + 500,
    progressPercent: 100,
  };
}

/**
 * Awards points to a user in an atomic transaction, preventing duplicate rewards.
 */
export async function awardPoints(
  userId: string,
  amount: number,
  source: PointSource,
  referenceId: string | null,
  description: string
): Promise<AwardPointsResult> {
  if (amount <= 0) {
    throw new Error("Point amount must be greater than zero.");
  }

  // Prevent duplicate awards for the same source and referenceId
  if (referenceId) {
    const existing = await prisma.pointTransaction.findFirst({
      where: {
        userId,
        source,
        referenceId,
      },
    });

    if (existing) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });
      return {
        success: false,
        pointsAwarded: 0,
        totalPoints: user?.points || 0,
        newBadges: [],
        alreadyAwarded: true,
      };
    }
  }

  // Execute point transaction & update user total points atomically
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create immutable transaction entry
    await tx.pointTransaction.create({
      data: {
        userId,
        amount,
        source,
        referenceId,
        description,
      },
    });

    // 2. Increment user points and check streak
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        points: { increment: amount },
        lastActiveAt: new Date(),
      },
      select: {
        id: true,
        points: true,
        streak: true,
        lastActiveAt: true,
      },
    });

    // 3. Evaluate Badge thresholds
    const eligibleBadges = await tx.badge.findMany({
      where: {
        minPoints: { lte: user.points },
      },
    });

    const currentBadges = await tx.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    });
    const ownedBadgeIds = new Set(currentBadges.map((b) => b.badgeId));

    const newlyAwardedBadges: { code: string; name: string; icon: string }[] = [];

    for (const badge of eligibleBadges) {
      if (!ownedBadgeIds.has(badge.id)) {
        await tx.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
        });
        newlyAwardedBadges.push({
          code: badge.code,
          name: badge.name,
          icon: badge.icon,
        });
      }
    }

    return {
      totalPoints: user.points,
      newBadges: newlyAwardedBadges,
    };
  });

  return {
    success: true,
    pointsAwarded: amount,
    totalPoints: result.totalPoints,
    newBadges: result.newBadges,
  };
}

/**
 * Updates daily streak if user performed an action on consecutive days
 */
export async function updateDailyStreak(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, lastActiveAt: true },
  });

  if (!user) return 0;

  const now = new Date();
  const last = user.lastActiveAt;

  if (!last) {
    await prisma.user.update({
      where: { id: userId },
      data: { streak: 1, lastActiveAt: now },
    });
    return 1;
  }

  // Check day difference
  const oneDayMs = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfLast = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfLast) / oneDayMs);

  if (diffDays === 1) {
    // Consecutive day
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { streak: { increment: 1 }, lastActiveAt: now },
      select: { streak: true },
    });
    return updated.streak;
  } else if (diffDays === 0) {
    // Same day, keep streak
    return user.streak;
  } else {
    // Missed a day or more, reset to 1
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { streak: 1, lastActiveAt: now },
      select: { streak: true },
    });
    return updated.streak;
  }
}
