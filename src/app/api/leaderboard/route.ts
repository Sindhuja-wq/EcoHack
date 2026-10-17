import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "global"; // "global" | "weekly" | "monthly"

    const session = await getSession();
    const currentUserId = session?.user?.id;

    let dateFilter: Date | undefined;
    const now = new Date();

    if (period === "weekly") {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "monthly") {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // If period is filtered by date, aggregate points from pointTransaction table
    let leaderboardEntries: Array<{
      id: string;
      name: string;
      avatar: string | null;
      role: string;
      points: number;
      streak: number;
      badgesCount: number;
      completedChallengesCount: number;
      badges: Array<{ code: string; name: string; icon: string }>;
    }> = [];

    if (dateFilter) {
      // Aggregate points earned in this timeframe
      const grouped = await prisma.pointTransaction.groupBy({
        by: ["userId"],
        where: {
          createdAt: { gte: dateFilter },
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: "desc",
          },
        },
        take: 50,
      });

      const userIds = grouped.map((g) => g.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          name: true,
          avatar: true,
          role: true,
          streak: true,
          badges: {
            include: { badge: true },
          },
          _count: {
            select: {
              submissions: {
                where: { status: "APPROVED" },
              },
            },
          },
        },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));

      leaderboardEntries = grouped.map((g) => {
        const u = userMap.get(g.userId);
        return {
          id: g.userId,
          name: u?.name || "Eco Warrior",
          avatar: u?.avatar || null,
          role: u?.role || "USER",
          points: g._sum.amount || 0,
          streak: u?.streak || 0,
          badgesCount: u?.badges.length || 0,
          completedChallengesCount: u?._count.submissions || 0,
          badges: (u?.badges || []).map((b) => ({
            code: b.badge.code,
            name: b.badge.name,
            icon: b.badge.icon,
          })),
        };
      });
    } else {
      // Global total leaderboard
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          avatar: true,
          role: true,
          points: true,
          streak: true,
          createdAt: true,
          badges: {
            include: { badge: true },
          },
          _count: {
            select: {
              submissions: {
                where: { status: "APPROVED" },
              },
            },
          },
        },
        orderBy: [{ points: "desc" }, { streak: "desc" }, { createdAt: "asc" }],
        take: 50,
      });

      leaderboardEntries = users.map((u) => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        role: u.role,
        points: u.points,
        streak: u.streak,
        badgesCount: u.badges.length,
        completedChallengesCount: u._count.submissions,
        badges: u.badges.map((b) => ({
          code: b.badge.code,
          name: b.badge.name,
          icon: b.badge.icon,
        })),
      }));
    }

    // Rank assignment
    const rankedList = leaderboardEntries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isCurrentUser: currentUserId === entry.id,
    }));

    // Find current user rank if logged in
    let currentUserRankData = null;
    if (currentUserId) {
      const foundInTop = rankedList.find((r) => r.id === currentUserId);
      if (foundInTop) {
        currentUserRankData = foundInTop;
      } else {
        // Calculate user's global rank if outside top 50
        const user = await prisma.user.findUnique({
          where: { id: currentUserId },
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            points: true,
            streak: true,
            badges: { include: { badge: true } },
            _count: {
              select: {
                submissions: { where: { status: "APPROVED" } },
              },
            },
          },
        });

        if (user) {
          const higherCount = await prisma.user.count({
            where: { points: { gt: user.points } },
          });

          currentUserRankData = {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            points: user.points,
            streak: user.streak,
            badgesCount: user.badges.length,
            completedChallengesCount: user._count.submissions,
            badges: user.badges.map((b) => ({
              code: b.badge.code,
              name: b.badge.name,
              icon: b.badge.icon,
            })),
            rank: higherCount + 1,
            isCurrentUser: true,
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      period,
      leaderboard: rankedList,
      currentUserRank: currentUserRankData,
    });
  } catch (error: any) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to load leaderboard." },
      { status: 500 }
    );
  }
}
