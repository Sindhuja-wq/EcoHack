import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function safeJsonParse<T = any>(val: any, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "object") return val as T;
  if (typeof val === "string") {
    try {
      let parsed = JSON.parse(val);
      if (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          // retain initial parsed
        }
      }
      return (parsed ?? fallback) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

const SaveIdeaSchema = z.object({
  transformationOptionId: z.string().min(1, "Option ID is required"),
  notes: z.string().max(500).optional(),
});

export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    const savedIdeas = await prisma.savedIdea.findMany({
      where: { userId: user.id },
      include: {
        transformationOption: {
          include: {
            analysis: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const parsedIdeas = savedIdeas.map((item) => {
      if (!item.transformationOption) return item;
      return {
        ...item,
        transformationOption: {
          ...item.transformationOption,
          materialsTools: safeJsonParse<string[]>(item.transformationOption.materialsTools, []),
          stepByStep: safeJsonParse<any[]>(item.transformationOption.stepByStep, []),
        },
      };
    });

    return NextResponse.json({
      success: true,
      savedIdeas: parsedIdeas,
      count: parsedIdeas.length,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Please log in to view saved transformation ideas." },
        { status: 401 }
      );
    }
    console.error("Fetch saved ideas error:", error);
    return NextResponse.json(
      { error: "Could not retrieve saved ideas." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = SaveIdeaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { transformationOptionId, notes } = parsed.data;

    // Check if already saved (toggle functionality)
    const existing = await prisma.savedIdea.findUnique({
      where: {
        userId_transformationOptionId: {
          userId: user.id,
          transformationOptionId,
        },
      },
    });

    if (existing) {
      await prisma.savedIdea.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({
        success: true,
        saved: false,
        message: "Idea removed from saved collection.",
      });
    }

    const saved = await prisma.savedIdea.create({
      data: {
        userId: user.id,
        transformationOptionId,
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      saved: true,
      message: "Transformation idea saved to your profile!",
      savedIdeaId: saved.id,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Please log in to save transformation ideas." },
        { status: 401 }
      );
    }
    console.error("Save idea error:", error);
    return NextResponse.json(
      { error: "Could not save idea. Please try again." },
      { status: 500 }
    );
  }
}
