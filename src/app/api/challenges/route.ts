import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    // Fetch active challenges
    const challenges = await prisma.challenge.findMany({
      where: { isActive: true },
      orderBy: [{ isDaily: "desc" }, { createdAt: "asc" }],
    });

    // Today's day of week (0 = Sunday, 1 = Monday, etc.)
    const todayDayOfWeek = new Date().getDay();

    // Determine today's daily challenge
    const dailyChallenge =
      challenges.find((c) => c.isDaily && c.dayOfWeek === todayDayOfWeek) ||
      challenges.find((c) => c.isDaily) ||
      challenges[0];

    // If user is authenticated, get user's submission statuses
    let userSubmissionsMap: Record<
      string,
      { status: string; evidenceUrl: string; submittedAt: string; feedback?: string | null }
    > = {};

    if (userId) {
      const submissions = await prisma.challengeSubmission.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      for (const sub of submissions) {
        if (!userSubmissionsMap[sub.challengeId]) {
          userSubmissionsMap[sub.challengeId] = {
            status: sub.status,
            evidenceUrl: sub.evidenceUrl,
            submittedAt: sub.createdAt.toISOString(),
            feedback: sub.reviewerFeedback,
          };
        }
      }
    }

    const enrichedChallenges = challenges.map((c) => {
      const userSub = userSubmissionsMap[c.id];
      return {
        ...c,
        suggestedActions: JSON.parse(c.suggestedActions || "[]"),
        userStatus: userSub ? userSub.status : "NOT_STARTED",
        userSubmission: userSub || null,
        isTodayDaily: dailyChallenge?.id === c.id,
      };
    });

    return NextResponse.json({
      success: true,
      dailyChallenge: enrichedChallenges.find((c) => c.isTodayDaily) || enrichedChallenges[0],
      challenges: enrichedChallenges,
    });
  } catch (error: any) {
    console.error("Challenges fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges." },
      { status: 500 }
    );
  }
}
