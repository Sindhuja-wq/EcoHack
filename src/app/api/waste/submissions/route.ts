import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const ProjectSubmissionSchema = z.object({
  transformationOptionId: z.string().min(1, "Option ID is required"),
  evidenceUrl: z.string().min(1, "Evidence photo URL is required"),
  notes: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = ProjectSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid submission data" },
        { status: 400 }
      );
    }

    const { transformationOptionId, evidenceUrl, notes } = parsed.data;

    // Check if user already submitted this project
    const existing = await prisma.recyclingProjectSubmission.findFirst({
      where: {
        userId: user.id,
        transformationOptionId,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            existing.status === "APPROVED"
              ? "You have already completed and received eco-points for this project!"
              : "You already have a pending review for this project. Please wait for moderator verification.",
        },
        { status: 409 }
      );
    }

    const submission = await prisma.recyclingProjectSubmission.create({
      data: {
        userId: user.id,
        transformationOptionId,
        evidenceUrl,
        notes: notes || null,
        status: "PENDING",
        pointsAwarded: 40,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Project evidence submitted successfully! Our team will review your work to award 40 eco-points.",
      submissionId: submission.id,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Please log in to submit completed project evidence." },
        { status: 401 }
      );
    }
    console.error("Project submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit project. Please try again." },
      { status: 500 }
    );
  }
}
