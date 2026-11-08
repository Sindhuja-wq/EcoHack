import fs from "fs";
import { execSync } from "child_process";

// Helper to load env file if present without overriding existing env vars
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const envContent = fs.readFileSync(filePath, "utf8");
    for (const rawLine of envContent.split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eqIdx = line.indexOf("=");
      if (eqIdx !== -1) {
        const key = line.slice(0, eqIdx).trim();
        let val = line.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (process.env[key] === undefined) {
          process.env[key] = val;
        }
      }
    }
  }
}

// Load .env.local and .env
loadEnvFile(".env.local");
loadEnvFile(".env");

// Determine whether to generate Prisma Client for PostgreSQL or SQLite:
// 1. Explicit override via USE_POSTGRES=true
// 2. Running inside Vercel serverless environment (VERCEL=1)
// 3. DATABASE_URL or POSTGRES_PRISMA_URL points to a PostgreSQL connection
const dbUrl = process.env.DATABASE_URL || "";
const postgresPrismaUrl = process.env.POSTGRES_PRISMA_URL || "";
const isPostgres =
  process.env.USE_POSTGRES === "true" ||
  process.env.VERCEL === "1" ||
  dbUrl.startsWith("postgresql://") ||
  dbUrl.startsWith("postgres://") ||
  postgresPrismaUrl.startsWith("postgresql://") ||
  postgresPrismaUrl.startsWith("postgres://");

const schemaFile = isPostgres
  ? "prisma/schema.postgresql.prisma"
  : "prisma/schema.prisma";

// Prepare environment variables for Prisma Client generation
const execEnv = { ...process.env };

if (isPostgres) {
  // Alias common variable names if POSTGRES_PRISMA_URL is missing
  if (!execEnv.POSTGRES_PRISMA_URL) {
    const fallback = execEnv.POSTGRES_URL || execEnv.DATABASE_URL;
    if (fallback && (fallback.startsWith("postgresql://") || fallback.startsWith("postgres://"))) {
      execEnv.POSTGRES_PRISMA_URL = fallback;
    }
  }

  // Alias non-pooling direct URL if missing
  if (!execEnv.POSTGRES_URL_NON_POOLING) {
    const fallbackDirect =
      execEnv.DATABASE_URL_UNPOOLED ||
      execEnv.POSTGRES_PRISMA_URL ||
      execEnv.DATABASE_URL ||
      execEnv.POSTGRES_URL;
    if (fallbackDirect && (fallbackDirect.startsWith("postgresql://") || fallbackDirect.startsWith("postgres://"))) {
      execEnv.POSTGRES_URL_NON_POOLING = fallbackDirect;
    }
  }

  // Prisma Client code generation only builds TypeScript types and query engine bindings.
  // It does not connect to the database. If running on Vercel before environment variables
  // are configured in the dashboard, provide build-time placeholders so npm install and next build
  // succeed without crashing, and emit an explicit runtime setup reminder.
  if (!execEnv.POSTGRES_PRISMA_URL || !execEnv.POSTGRES_URL_NON_POOLING) {
    console.warn(
      "[Prisma Auto-Selector] ⚠️ Note: Neither POSTGRES_PRISMA_URL nor DATABASE_URL was supplied in build environment."
    );
    console.warn(
      "[Prisma Auto-Selector] ℹ️ Using schema placeholder for Prisma Client code generation (Prisma generate does not require database connection)."
    );
    console.warn(
      "[Prisma Auto-Selector] ℹ️ Ensure POSTGRES_PRISMA_URL is configured in your Vercel Project Settings for production runtime database queries."
    );
    execEnv.POSTGRES_PRISMA_URL = execEnv.POSTGRES_PRISMA_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder?sslmode=require";
    execEnv.POSTGRES_URL_NON_POOLING = execEnv.POSTGRES_URL_NON_POOLING || execEnv.POSTGRES_PRISMA_URL;
  }
}

console.log(
  `[Prisma Auto-Selector] Generating Prisma Client for ${
    isPostgres ? "PostgreSQL (Production)" : "SQLite (Local Dev)"
  } using ${schemaFile}...`
);

try {
  execSync(`npx prisma generate --schema=${schemaFile}`, {
    stdio: "inherit",
    env: execEnv,
  });
  console.log(`[Prisma Auto-Selector] Prisma Client generation complete.`);
} catch (error) {
  console.error(
    `[Prisma Auto-Selector] Failed to generate client with schema ${schemaFile}:`,
    error?.message || "Unknown error"
  );
  process.exit(1);
}
