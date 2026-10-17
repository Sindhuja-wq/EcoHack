import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSessionToken, setSessionCookie } from "@/lib/auth";
import { updateDailyStreak } from "@/lib/gamification";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid email or password" },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Look up user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Do not disclose whether email exists
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify bcrypt password hash
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update streak for daily activity
    const newStreak = await updateDailyStreak(user.id);

    // Create session token
    const token = await signSessionToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      rememberMe
    );

    await setSessionCookie(token, rememberMe);

    return NextResponse.json({
      success: true,
      message: "Welcome back!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        streak: newStreak,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication service error. Please try again." },
      { status: 500 }
    );
  }
}
