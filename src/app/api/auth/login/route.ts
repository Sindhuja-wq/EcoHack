import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSessionToken, setSessionCookie } from "@/lib/auth";
import { updateDailyStreak } from "@/lib/gamification";
import {
  getClientIp,
  checkTargetedLoginRateLimit,
  checkGlobalLoginRateLimit,
} from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // 1. Enforce global IP rate limit (15 attempts / 60 seconds across all accounts)
    // Prevents password spraying attacks from a single IP address
    const globalRateLimit = checkGlobalLoginRateLimit(clientIp);
    if (!globalRateLimit.success) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const retryAfterSeconds = Math.max(1, globalRateLimit.reset - nowSeconds);

      return NextResponse.json(
        {
          error:
            "Too many login attempts from this network. Please wait before trying again.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Limit": String(globalRateLimit.limit),
            "X-RateLimit-Remaining": String(globalRateLimit.remaining),
            "X-RateLimit-Reset": String(globalRateLimit.reset),
          },
        }
      );
    }

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

    // 2. Enforce targeted IP + Account rate limit (5 attempts / 60 seconds)
    // Prevents brute-forcing a specific account without locking out innocent users from other IPs
    const targetRateLimit = checkTargetedLoginRateLimit(clientIp, normalizedEmail);
    if (!targetRateLimit.success) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const retryAfterSeconds = Math.max(1, targetRateLimit.reset - nowSeconds);

      return NextResponse.json(
        {
          error:
            "Too many login attempts for this account. Please wait before trying again.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Limit": String(targetRateLimit.limit),
            "X-RateLimit-Remaining": String(targetRateLimit.remaining),
            "X-RateLimit-Reset": String(targetRateLimit.reset),
          },
        }
      );
    }

    // 3. Look up user by email
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

    // 4. Verify bcrypt password hash
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 5. Update streak for daily activity
    const newStreak = await updateDailyStreak(user.id);

    // 6. Create session token
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
