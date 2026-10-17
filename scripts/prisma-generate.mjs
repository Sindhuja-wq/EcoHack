import { execSync } from "child_process";

// Determine whether to generate Prisma Client for PostgreSQL or SQLite:
// 1. Explicit override via USE_POSTGRES=true
// 2. Running inside Vercel serverless environment (VERCEL=1)
// 3. DATABASE_URL points to a PostgreSQL connection (postgresql:// or postgres://)
const dbUrl = process.env.DATABASE_URL || "";
const isPostgres =
  process.env.USE_POSTGRES === "true" ||
  process.env.VERCEL === "1" ||
  dbUrl.startsWith("postgresql://") ||
  dbUrl.startsWith("postgres://");

const schemaFile = isPostgres
  ? "prisma/schema.postgresql.prisma"
  : "prisma/schema.prisma";

console.log(
  `[Prisma Auto-Selector] Generating Prisma Client for ${
    isPostgres ? "PostgreSQL (Production)" : "SQLite (Local Dev)"
  } using ${schemaFile}...`
);

try {
  execSync(`npx prisma generate --schema=${schemaFile}`, {
    stdio: "inherit",
    env: process.env,
  });
  console.log(`[Prisma Auto-Selector] Prisma Client generation complete.`);
} catch (error) {
  console.error(
    `[Prisma Auto-Selector] Failed to generate client with schema ${schemaFile}:`,
    error
  );
  process.exit(1);
}
