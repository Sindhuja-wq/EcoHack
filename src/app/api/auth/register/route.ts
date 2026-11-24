import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSessionToken, setSessionCookie } from "@/lib/auth";
import { getClientIp, checkRegistrationRateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const RegisterSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(60),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // 1. Enforce per-IP registration rate limiting (5 attempts / 60 seconds)
    // Prevents automated bot account spam while allowing genuine human users to register or retry
    const regRateLimit = checkRegistrationRateLimit(clientIp);
    if (!regRateLimit.success) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const retryAfterSeconds = Math.max(1, regRateLimit.reset - nowSeconds);

      return NextResponse.json(
        {
          error:
            "Too many registration attempts from this network. Please wait a minute before trying again.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Limit": String(regRateLimit.limit),
            "X-RateLimit-Remaining": String(regRateLimit.remaining),
            "X-RateLimit-Reset": String(regRateLimit.reset),
          },
        }
      );
    }

    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Prevent duplicate email registrations
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // 3. Secure password hashing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create user in database
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "USER",
        points: 0,
        streak: 1,
        lastActiveAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true,
        streak: true,
        avatar: true,
      },
    });

    // 5. Award welcome badge "Green Starter" if available
    const welcomeBadge = await prisma.badge.findUnique({
      where: { code: "green-starter" },
    });
    if (welcomeBadge) {
      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: welcomeBadge.id,
        },
      });
    }

    // 6. Create and set persistent session token
    const token = await signSessionToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      true
    );
    await setSessionCookie(token, true);

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful! Welcome to EcoHack.",
        user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration. Please try again." },
      { status: 500 }
    );
  }
}
