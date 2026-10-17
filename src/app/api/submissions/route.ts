import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const SubmissionSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID is required"),
  evidenceUrl: z.string().min(1, "Evidence photo URL is required"),
  description: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = SubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid submission data" },
        { status: 400 }
      );
    }

    const { challengeId, evidenceUrl, description } = parsed.data;

    // Check challenge exists and is active
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge || !challenge.isActive) {
      return NextResponse.json(
        { error: "Challenge is not currently active for submissions." },
        { status: 404 }
      );
    }

    // Check if user already has an APPROVED or PENDING submission for this challenge
    const existing = await prisma.challengeSubmission.findFirst({
      where: {
        userId: user.id,
        challengeId,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            existing.status === "APPROVED"
              ? "You have already completed this eco challenge and earned points!"
              : "Your evidence for this challenge is currently pending review by our team.",
        },
        { status: 409 }
      );
    }

    const submission = await prisma.challengeSubmission.create({
      data: {
        challengeId,
        userId: user.id,
        evidenceUrl,
        description: description || null,
        status: "PENDING",
      },
      include: {
        challenge: {
          select: { title: true, pointsReward: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Evidence submitted for "${challenge.title}". Status is Pending Review. Upon approval, you will earn ${challenge.pointsReward} eco-points!`,
      submissionId: submission.id,
      status: "PENDING",
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Authentication required to submit challenge evidence." },
        { status: 401 }
      );
    }
    console.error("Submission create error:", error);
    return NextResponse.json(
      { error: "Failed to submit challenge evidence. Please try again." },
      { status: 500 }
    );
  }
}
