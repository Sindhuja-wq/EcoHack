import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      totalAnalyses,
      pendingChallengeSubmissions,
      pendingProjectSubmissions,
      approvedChallengeSubmissions,
      approvedProjectSubmissions,
      activeChallenges,
      pointsAggregate,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.wasteAnalysis.count(),
      prisma.challengeSubmission.count({ where: { status: "PENDING" } }),
      prisma.recyclingProjectSubmission.count({ where: { status: "PENDING" } }),
      prisma.challengeSubmission.count({ where: { status: "APPROVED" } }),
      prisma.recyclingProjectSubmission.count({ where: { status: "APPROVED" } }),
      prisma.challenge.count({ where: { isActive: true } }),
      prisma.pointTransaction.aggregate({ _sum: { amount: true } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, points: true, createdAt: true },
      }),
    ]);

    // Material categories breakdown
    const materialCounts = await prisma.wasteAnalysis.groupBy({
      by: ["materialCategory"],
      _count: { id: true },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalAnalyses,
        totalPendingReviews: pendingChallengeSubmissions + pendingProjectSubmissions,
        pendingChallengeSubmissions,
        pendingProjectSubmissions,
        approvedTotal: approvedChallengeSubmissions + approvedProjectSubmissions,
        activeChallenges,
        totalEcoPointsAwarded: pointsAggregate._sum.amount || 0,
        materialDistribution: materialCounts.map((m) => ({
          category: m.materialCategory,
          count: m._count.id,
        })),
        recentUsers,
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to load admin stats." }, { status: 500 });
  }
}
