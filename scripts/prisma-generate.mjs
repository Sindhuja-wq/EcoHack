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

if (isPostgres) {
  if (!process.env.POSTGRES_PRISMA_URL) {
    console.error(
      "[Prisma Auto-Selector] ❌ ERROR: Required PostgreSQL environment variable POSTGRES_PRISMA_URL is missing."
    );
    console.error(
      "[Prisma Auto-Selector] Please configure POSTGRES_PRISMA_URL in .env.local or your environment."
    );
    process.exit(1);
  }

  if (!process.env.POSTGRES_URL_NON_POOLING) {
    console.error(
      "[Prisma Auto-Selector] ❌ ERROR: Required PostgreSQL environment variable POSTGRES_URL_NON_POOLING is missing."
    );
    console.error(
      "[Prisma Auto-Selector] Please configure POSTGRES_URL_NON_POOLING in .env.local or your environment."
    );
    process.exit(1);
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
    env: process.env,
  });
  console.log(`[Prisma Auto-Selector] Prisma Client generation complete.`);
} catch (error) {
  console.error(
    `[Prisma Auto-Selector] Failed to generate client with schema ${schemaFile}:`,
    error?.message || "Unknown error"
  );
  process.exit(1);
}
