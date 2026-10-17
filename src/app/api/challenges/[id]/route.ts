import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const userId = session?.user?.id;
    const { id } = params;

    const challenge = await prisma.challenge.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Eco Challenge not found" },
        { status: 404 }
      );
    }

    let userSubmissions: any[] = [];
    if (userId) {
      userSubmissions = await prisma.challengeSubmission.findMany({
        where: { challengeId: challenge.id, userId },
        orderBy: { createdAt: "desc" },
      });
    }

    const latestStatus =
      userSubmissions.length > 0 ? userSubmissions[0].status : "NOT_STARTED";

    return NextResponse.json({
      success: true,
      challenge: {
        ...challenge,
        suggestedActions: JSON.parse(challenge.suggestedActions || "[]"),
        userStatus: latestStatus,
        submissions: userSubmissions,
      },
    });
  } catch (error: any) {
    console.error("Challenge fetch detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenge details" },
      { status: 500 }
    );
  }
}
