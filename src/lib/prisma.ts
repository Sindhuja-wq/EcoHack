import { PrismaClient } from "@prisma/client";

// Ensure PostgreSQL environment variables have fallbacks if standard DATABASE_URL is set in production
if (!process.env.POSTGRES_PRISMA_URL) {
  const fallback = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (fallback && (fallback.startsWith("postgresql://") || fallback.startsWith("postgres://"))) {
    process.env.POSTGRES_PRISMA_URL = fallback;
  }
}
if (!process.env.POSTGRES_URL_NON_POOLING) {
  const fallbackDirect =
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL;
  if (fallbackDirect && (fallbackDirect.startsWith("postgresql://") || fallbackDirect.startsWith("postgres://"))) {
    process.env.POSTGRES_URL_NON_POOLING = fallbackDirect;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
