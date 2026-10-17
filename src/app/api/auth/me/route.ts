import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  // Fetch full user details with badges and active count
  const fullUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      points: true,
      streak: true,
      avatar: true,
      bio: true,
      createdAt: true,
      badges: {
        include: {
          badge: true,
        },
      },
    },
  });

  if (!fullUser) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  return NextResponse.json({
    authenticated: true,
    user: fullUser,
  });
}
