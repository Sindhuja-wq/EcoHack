import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const ChallengeSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3).max(100),
  slug: z.string().min(3).max(100),
  description: z.string().min(10),
  whyItMatters: z.string().min(10),
  difficulty: z.enum(["Easy", "Medium", "Advanced"]),
  pointsReward: z.number().int().min(10).max(500),
  category: z.string().min(2),
  isActive: z.boolean().default(true),
  isDaily: z.boolean().default(false),
  dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
  completionRequirements: z.string().min(5),
  suggestedActions: z.array(z.string()).min(1),
});

export async function GET() {
  try {
    await requireAdmin();

    const challenges = await prisma.challenge.findMany({
      include: {
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: [{ isDaily: "desc" }, { createdAt: "desc" }],
    });

    const parsedChallenges = challenges.map((c) => ({
      ...c,
      suggestedActions: JSON.parse(c.suggestedActions || "[]"),
    }));

    return NextResponse.json({
      success: true,
      challenges: parsedChallenges,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }
    console.error("Admin get challenges error:", error);
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = ChallengeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid challenge data" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.id) {
      // Update existing
      const updated = await prisma.challenge.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          whyItMatters: data.whyItMatters,
          difficulty: data.difficulty,
          pointsReward: data.pointsReward,
          category: data.category,
          isActive: data.isActive,
          isDaily: data.isDaily,
          dayOfWeek: data.dayOfWeek ?? null,
          completionRequirements: data.completionRequirements,
          suggestedActions: JSON.stringify(data.suggestedActions),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Challenge updated successfully!",
        challenge: {
          ...updated,
          suggestedActions: JSON.parse(updated.suggestedActions),
        },
      });
    } else {
      // Create new
      const created = await prisma.challenge.create({
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          whyItMatters: data.whyItMatters,
          difficulty: data.difficulty,
          pointsReward: data.pointsReward,
          category: data.category,
          isActive: data.isActive,
          isDaily: data.isDaily,
          dayOfWeek: data.dayOfWeek ?? null,
          completionRequirements: data.completionRequirements,
          suggestedActions: JSON.stringify(data.suggestedActions),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Challenge created successfully!",
        challenge: {
          ...created,
          suggestedActions: JSON.parse(created.suggestedActions),
        },
      });
    }
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }
    console.error("Admin save challenge error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save challenge." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { id, isActive, pointsReward } = body;

    if (!id) {
      return NextResponse.json({ error: "Challenge ID is required." }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (typeof isActive === "boolean") dataToUpdate.isActive = isActive;
    if (typeof pointsReward === "number") dataToUpdate.pointsReward = pointsReward;

    const updated = await prisma.challenge.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: "Challenge configuration updated.",
      challenge: updated,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }
    console.error("Admin patch challenge error:", error);
    return NextResponse.json({ error: "Failed to update challenge" }, { status: 500 });
  }
}
