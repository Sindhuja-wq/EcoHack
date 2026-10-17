import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";

const COOKIE_NAME = "ecohack_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-ecohack-dev-secret-key-nature-sustainability-2026"
);

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export async function signSessionToken(payload: SessionPayload, rememberMe: boolean = true): Promise<string> {
  const expiresIn = rememberMe ? "30d" : "1d";
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
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
