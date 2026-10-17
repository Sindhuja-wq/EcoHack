import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { awardPoints } from "@/lib/gamification";

export const dynamic = "force-dynamic";

const UserActionSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "ADMIN"]).optional(),
  pointAdjustment: z.number().int().optional(),
  reason: z.string().max(300).optional(),
});

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true,
        streak: true,
        avatar: true,
        createdAt: true,
        lastActiveAt: true,
        _count: {
          select: {
            submissions: true,
            projectSubmissions: true,
            savedIdeas: true,
            badges: true,
          },
        },
      },
      orderBy: { points: "desc" },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }
    console.error("Admin users list error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const adminUser = await requireAdmin();
    const body = await request.json();
    const parsed = UserActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { userId, role, pointAdjustment, reason } = parsed.data;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Role modification
    if (role && role !== targetUser.role) {
      // Prevent admin from demoting themselves if they are the only admin
      if (adminUser.id === targetUser.id && role === "USER") {
        const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: "Cannot demote the sole administrator of the system." },
            { status: 400 }
          );
        }
      }

      await prisma.user.update({
        where: { id: userId },
        data: { role },
      });
    }

    // Point adjustment
    if (pointAdjustment && pointAdjustment !== 0) {
      if (pointAdjustment > 0) {
        await awardPoints(
          userId,
          pointAdjustment,
          "ADMIN_ADJUSTMENT",
          `admin_adj_${Date.now()}`,
          reason || `Manual adjustment by admin ${adminUser.name}`
        );
      } else {
        // Deduction
        await prisma.$transaction([
          prisma.pointTransaction.create({
            data: {
              userId,
              amount: pointAdjustment,
              source: "ADMIN_ADJUSTMENT",
              referenceId: `admin_adj_${Date.now()}`,
              description: reason || `Point correction by admin ${adminUser.name}`,
            },
          }),
          prisma.user.update({
            where: { id: userId },
            data: {
              points: {
                decrement: Math.abs(pointAdjustment),
              },
            },
          }),
        ]);
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true,
        streak: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser?.name} updated successfully.`,
      user: updatedUser,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
  }
}
