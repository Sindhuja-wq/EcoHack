import { cookies } from "next/headers.js";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma.ts";

const COOKIE_NAME = "ecohack_session";

export const DEV_FALLBACK_SECRET =
  "default-ecohack-dev-secret-key-nature-sustainability-2026";

/**
 * Validates and retrieves the cryptographic key for JWT signing and verification.
 *
 * In production:
 * - JWT_SECRET must be present and non-blank.
 * - JWT_SECRET must not match the public development fallback.
 * - JWT_SECRET must be at least 32 characters long (256-bit entropy for HS256).
 * - An explicit fatal configuration error is thrown if any requirement fails.
 *
 * In development and test environments:
 * - Safely permits the fallback secret to allow local development and testing without configuration friction.
 *
 * Evaluated on-demand inside sign and verify functions to prevent breaking build-time execution.
 */
export function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    if (!secret || secret.trim() === "") {
      throw new Error(
        "FATAL SECURITY CONFIGURATION: JWT_SECRET environment variable is missing in production. A secure random secret of at least 32 characters is required."
      );
    }
    if (secret === DEV_FALLBACK_SECRET) {
      throw new Error(
        "FATAL SECURITY CONFIGURATION: The default development JWT_SECRET cannot be used in production environments. Please configure a unique secret."
      );
    }
    if (secret.length < 32) {
      throw new Error(
        "FATAL SECURITY CONFIGURATION: JWT_SECRET is too short (must be at least 32 characters in production for HS256 security)."
      );
    }
    return new TextEncoder().encode(secret);
  }

  // Development and test fallback
  return new TextEncoder().encode(secret || DEV_FALLBACK_SECRET);
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export async function signSessionToken(payload: SessionPayload, rememberMe: boolean = true): Promise<string> {
  const expiresIn = rememberMe ? "30d" : "1d";
  const secretKey = getJwtSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ user: { id: string; email: string; name: string; role: string; points: number; avatar: string | null; streak: number } } | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.userId) return null;

    // Fetch fresh user record from database to verify active status and actual role
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        points: true,
        avatar: true,
        streak: true,
      },
    });

    if (!user) return null;
    return { user };
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function setSessionCookie(token: string, rememberMe: boolean = true) {
  const cookieStore = cookies();
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}
