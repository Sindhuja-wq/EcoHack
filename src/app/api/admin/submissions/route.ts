import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { awardPoints } from "@/lib/gamification";

export const dynamic = "force-dynamic";

const ReviewSubmissionSchema = z.object({
  submissionType: z.enum(["CHALLENGE", "PROJECT"]),
  submissionId: z.string().min(1, "Submission ID is required"),
  action: z.enum(["APPROVE", "REJECT"]),
  feedback: z.string().max(500).optional(),
});

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const filterStatus = searchParams.get("status") || "PENDING"; // "PENDING", "APPROVED", "REJECTED", "ALL"

    const statusFilter = filterStatus === "ALL" ? {} : { status: filterStatus };

    const [challengeSubmissions, projectSubmissions] = await Promise.all([
      prisma.challengeSubmission.findMany({
        where: statusFilter,
        include: {
          user: {
            select: { id: true, name: true, email: true, points: true, avatar: true },
          },
          challenge: {
            select: { id: true, title: true, pointsReward: true, difficulty: true, category: true },
          },
          reviewer: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.recyclingProjectSubmission.findMany({
        where: statusFilter,
        include: {
          user: {
            select: { id: true, name: true, email: true, points: true, avatar: true },
          },
          transformationOption: {
            include: {
              analysis: {
                select: { id: true, detectedItem: true, materialCategory: true, imageUrl: true },
              },
            },
          },
          reviewer: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      challengeSubmissions,
      projectSubmissions,
      totalPending:
        challengeSubmissions.filter((s) => s.status === "PENDING").length +
        projectSubmissions.filter((p) => p.status === "PENDING").length,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }
    console.error("Admin submissions fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch submissions." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminUser = await requireAdmin();
    const body = await request.json();
    const parsed = ReviewSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid review payload" },
        { status: 400 }
      );
    }

    const { submissionType, submissionId, action, feedback } = parsed.data;

    if (submissionType === "CHALLENGE") {
      const submission = await prisma.challengeSubmission.findUnique({
        where: { id: submissionId },
        include: { challenge: true, user: true },
      });

      if (!submission) {
        return NextResponse.json({ error: "Challenge submission not found" }, { status: 404 });
      }

      if (submission.status !== "PENDING") {
        return NextResponse.json(
          { error: `This submission has already been reviewed (${submission.status}).` },
          { status: 400 }
        );
      }

      if (action === "APPROVE") {
        // Award points atomically
        const pointsResult = await awardPoints(
          submission.userId,
          submission.challenge.pointsReward,
          "CHALLENGE_COMPLETION",
          submission.id,
          `Completed daily challenge: ${submission.challenge.title}`
        );

        // Update submission status
        const updated = await prisma.challengeSubmission.update({
          where: { id: submissionId },
          data: {
            status: "APPROVED",
            reviewerFeedback: feedback || "Verified and approved by moderator.",
            reviewerId: adminUser.id,
            reviewedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: `Submission approved! Awarded ${submission.challenge.pointsReward} eco-points to ${submission.user.name}.`,
          submission: updated,
          pointsAwarded: submission.challenge.pointsReward,
          newBadges: pointsResult.newBadges,
        });
      } else {
        // Rejection
        const updated = await prisma.challengeSubmission.update({
          where: { id: submissionId },
          data: {
            status: "REJECTED",
            reviewerFeedback: feedback || "Evidence did not meet completion guidelines.",
            reviewerId: adminUser.id,
            reviewedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: "Submission rejected with reviewer feedback.",
          submission: updated,
        });
      }
    } else {
      // PROJECT submission
      const projectSub = await prisma.recyclingProjectSubmission.findUnique({
        where: { id: submissionId },
        include: { transformationOption: true, user: true },
      });

      if (!projectSub) {
        return NextResponse.json({ error: "Project submission not found" }, { status: 404 });
      }

      if (projectSub.status !== "PENDING") {
        return NextResponse.json(
          { error: `This submission has already been reviewed (${projectSub.status}).` },
          { status: 400 }
        );
      }

      if (action === "APPROVE") {
        const pointsResult = await awardPoints(
          projectSub.userId,
          projectSub.pointsAwarded || 40,
          "TRANSFORMATION_COMPLETION",
          projectSub.id,
          `Completed waste transformation: ${projectSub.transformationOption.title}`
        );

        const updated = await prisma.recyclingProjectSubmission.update({
          where: { id: submissionId },
          data: {
            status: "APPROVED",
            reviewerFeedback: feedback || "Verified and approved by moderator.",
            reviewerId: adminUser.id,
            reviewedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: `Project approved! Awarded ${projectSub.pointsAwarded || 40} eco-points to ${projectSub.user.name}.`,
          submission: updated,
          pointsAwarded: projectSub.pointsAwarded || 40,
          newBadges: pointsResult.newBadges,
        });
      } else {
        const updated = await prisma.recyclingProjectSubmission.update({
          where: { id: submissionId },
          data: {
            status: "REJECTED",
            reviewerFeedback: feedback || "Evidence did not demonstrate project completion.",
            reviewerId: adminUser.id,
            reviewedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: "Project rejected with reviewer feedback.",
          submission: updated,
        });
      }
    }
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }
    console.error("Admin review submission error:", error);
    return NextResponse.json({ error: "Failed to review submission." }, { status: 500 });
  }
}
