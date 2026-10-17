import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const SaveIdeaSchema = z.object({
  transformationOptionId: z.string().min(1, "Option ID is required"),
  notes: z.string().max(500).optional(),
});

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
