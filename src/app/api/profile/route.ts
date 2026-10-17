import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  bio: z.string().max(300).optional(),
  avatar: z.string().url().or(z.string().startsWith("/")).optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();

    const fullProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        badges: {
          include: { badge: true },
          orderBy: { awardedAt: "desc" },
        },
        pointTransactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        submissions: {
          include: { challenge: true },
          orderBy: { createdAt: "desc" },
        },
        projectSubmissions: {
          include: {
            transformationOption: {
              include: { analysis: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        savedIdeas: {
          include: {
            transformationOption: {
              include: { analysis: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        analyses: {
          include: { options: true },
          orderBy: { createdAt: "desc" },
          take: 30,
        },
      },
    });

    if (!fullProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: fullProfile.id,
        name: fullProfile.name,
        email: fullProfile.email,
        bio: fullProfile.bio,
        avatar: fullProfile.avatar,
        role: fullProfile.role,
        points: fullProfile.points,
        streak: fullProfile.streak,
        createdAt: fullProfile.createdAt,
        badges: fullProfile.badges.map((b) => ({
          id: b.badge.id,
          code: b.badge.code,
          name: b.badge.name,
          description: b.badge.description,
          icon: b.badge.icon,
          awardedAt: b.awardedAt,
        })),
        transactions: fullProfile.pointTransactions,
        submissions: fullProfile.submissions,
        projectSubmissions: fullProfile.projectSubmissions,
        savedIdeas: fullProfile.savedIdeas,
        analyses: fullProfile.analyses,
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = UpdateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid profile data" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name?.trim(),
        bio: parsed.data.bio?.trim(),
        avatar: parsed.data.avatar,
      },
      select: {
        id: true,
        name: true,
        bio: true,
        avatar: true,
        email: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      user: updated,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get("submissionId");
    const type = searchParams.get("type"); // "challenge" or "project"

    if (!submissionId) {
      return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
    }

    if (type === "project") {
      const proj = await prisma.recyclingProjectSubmission.findUnique({
        where: { id: submissionId },
      });
      if (!proj || proj.userId !== user.id) {
        return NextResponse.json({ error: "Submission not found or unauthorized" }, { status: 404 });
      }
      if (proj.status === "APPROVED") {
        return NextResponse.json({ error: "Approved submissions cannot be deleted" }, { status: 400 });
      }
      await prisma.recyclingProjectSubmission.delete({ where: { id: submissionId } });
    } else {
      const sub = await prisma.challengeSubmission.findUnique({
        where: { id: submissionId },
      });
      if (!sub || sub.userId !== user.id) {
        return NextResponse.json({ error: "Submission not found or unauthorized" }, { status: 404 });
      }
      if (sub.status === "APPROVED") {
        return NextResponse.json({ error: "Approved submissions cannot be deleted" }, { status: 400 });
      }
      await prisma.challengeSubmission.delete({ where: { id: submissionId } });
    }

    return NextResponse.json({ success: true, message: "Submission removed." });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete submission" }, { status: 500 });
  }
}
