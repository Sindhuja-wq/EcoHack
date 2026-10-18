import fs from "fs";
import { execSync } from "child_process";
import bcrypt from "bcryptjs";
import readline from "readline";

// Determine target database: explicit flag or environment variable
const isPostgresTarget = process.argv.includes("--postgres") || process.env.USE_POSTGRES === "true";

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

// Track whether SQLite client restoration is required
let needsSqliteRestore = false;

function restoreSqliteClient() {
  if (!needsSqliteRestore) return true;
  try {
    console.log("🔄 Restoring Prisma Client for local SQLite development...");
    execSync("npx prisma generate --schema=prisma/schema.prisma", { stdio: "ignore" });
    needsSqliteRestore = false;
    console.log("✅ Restored SQLite Prisma Client successfully.");
    return true;
  } catch (err) {
    console.error("❌ CRITICAL: Failed to restore SQLite Prisma Client:", err.message || err);
    console.error("   Active client may still be targeting PostgreSQL.");
    console.error("   Run 'npm run prisma:generate:sqlite' to manually restore local SQLite client.");
    process.exitCode = 1;
    return false;
  }
}

// Attach process termination hooks to ensure SQLite restoration on any exit or crash
process.on("exit", () => restoreSqliteClient());
process.on("SIGINT", () => { restoreSqliteClient(); process.exit(130); });
process.on("SIGTERM", () => { restoreSqliteClient(); process.exit(143); });
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught exception:", err.message);
  restoreSqliteClient();
  process.exit(1);
});
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled rejection:", err?.message || err);
  restoreSqliteClient();
  process.exit(1);
});

if (isPostgresTarget) {
  if (!process.env.POSTGRES_PRISMA_URL) {
    console.error("❌ ERROR: Required PostgreSQL environment variable POSTGRES_PRISMA_URL is missing.");
    console.error("Please configure POSTGRES_PRISMA_URL in .env.local or your environment.");
    process.exit(1);
  }

  if (!process.env.POSTGRES_URL_NON_POOLING) {
    console.error("❌ ERROR: Required PostgreSQL environment variable POSTGRES_URL_NON_POOLING is missing.");
    console.error("Please configure POSTGRES_URL_NON_POOLING in .env.local or your environment.");
    process.exit(1);
  }

  // Ensure PostgreSQL Prisma Client is active
  needsSqliteRestore = true;
  console.log("🔄 Ensuring Prisma Client is generated for PostgreSQL...");
  try {
    execSync("npx prisma generate --schema=prisma/schema.postgresql.prisma", { stdio: "ignore" });
  } catch (genErr) {
    console.error("❌ Failed to generate PostgreSQL Prisma Client:", genErr.message);
    restoreSqliteClient();
    process.exit(1);
  }
} else {
  // If targeting SQLite, ensure active client schema matches SQLite
  const clientSchemaPath = "node_modules/.prisma/client/schema.prisma";
  if (fs.existsSync(clientSchemaPath)) {
    const installedSchema = fs.readFileSync(clientSchemaPath, "utf8");
    if (!installedSchema.includes('provider = "sqlite"')) {
      console.log("🔄 Active Prisma Client is not SQLite. Generating SQLite client...");
      execSync("npx prisma generate --schema=prisma/schema.prisma", { stdio: "ignore" });
    }
  }
}

// Dynamically import PrismaClient to bind to active schema
const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

// Multi-attribute provider inspection across Prisma versions
function getActiveProvider(client) {
  if (!client) return null;
  if (typeof client._activeProvider === "string" && client._activeProvider) {
    return client._activeProvider.toLowerCase();
  }
  if (client._engineConfig && typeof client._engineConfig.activeProvider === "string" && client._engineConfig.activeProvider) {
    return client._engineConfig.activeProvider.toLowerCase();
  }
  if (client._engine?.config && typeof client._engine.config.activeProvider === "string" && client._engine.config.activeProvider) {
    return client._engine.config.activeProvider.toLowerCase();
  }
  return null;
}

const activeProvider = getActiveProvider(prisma);

if (!activeProvider) {
  console.error("❌ SAFETY CHECK FAILED: Unable to verify active database provider from Prisma Client. Aborting to protect database integrity.");
  restoreSqliteClient();
  process.exit(1);
}

if (isPostgresTarget && activeProvider !== "postgresql") {
  console.error(`❌ SAFETY CHECK FAILED: Expected PostgreSQL provider, but active client is ${activeProvider}. Aborting to protect local database.`);
  restoreSqliteClient();
  process.exit(1);
}

if (!isPostgresTarget && activeProvider !== "sqlite") {
  console.error(`❌ SAFETY CHECK FAILED: Expected SQLite provider, but active client is ${activeProvider}. Pass --postgres to target PostgreSQL.`);
  process.exit(1);
}

async function bootstrapAdmin() {
  console.log("=================================================");
  console.log(`🛡️  EcoHack Secure Admin Bootstrap Utility (${isPostgresTarget ? "PostgreSQL - Production" : "SQLite - Local Dev"})`);
  console.log("=================================================");

  const expectedSecret = process.env.ADMIN_SECRET_KEY;
  if (!expectedSecret) {
    console.error("❌ ERROR: ADMIN_SECRET_KEY is not defined in your environment (.env or .env.local).");
    console.error("Please configure ADMIN_SECRET_KEY before bootstrapping an administrator.");
    restoreSqliteClient();
    process.exit(1);
  }

  // Parse command line arguments or prompt
  const args = process.argv.slice(2);
  let email = "";
  let name = "System Administrator";
  let password = "";
  let providedSecret = "";

  for (const arg of args) {
    if (arg.startsWith("--email=")) email = arg.split("=")[1];
    if (arg.startsWith("--name=")) name = arg.split("=")[1];
    if (arg.startsWith("--password=")) password = arg.split("=")[1];
    if (arg.startsWith("--secret=")) providedSecret = arg.split("=")[1];
  }

  // Fallback to interactive prompts if not passed via flags
  if (!email || !password || !providedSecret) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    if (!providedSecret) {
      providedSecret = await question("Enter ADMIN_SECRET_KEY from environment: ");
    }
    if (!email) {
      email = await question("Enter admin email address: ");
    }
    if (!password) {
      password = await question("Enter strong admin password (min 8 chars): ");
    }
    rl.close();
  }

  if (providedSecret !== expectedSecret) {
    console.error("❌ REJECTED: Provided ADMIN_SECRET_KEY does not match server configuration.");
    restoreSqliteClient();
    process.exit(1);
  }

  if (!email || !email.includes("@")) {
    console.error("❌ REJECTED: Invalid email format.");
    restoreSqliteClient();
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error("❌ REJECTED: Password must be at least 8 characters long.");
    restoreSqliteClient();
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const admin = await prisma.user.upsert({
    where: { email: email.toLowerCase().trim() },
    update: {
      role: "ADMIN",
      name,
      passwordHash,
    },
    create: {
      email: email.toLowerCase().trim(),
      name,
      passwordHash,
      role: "ADMIN",
      points: 100,
    },
  });

  console.log("-------------------------------------------------");
  console.log(`✅ SUCCESS: Administrator account verified and active!`);
  console.log(`Target  : ${isPostgresTarget ? "Neon PostgreSQL (Production)" : "SQLite (Local Dev)"}`);
  console.log(`User ID : ${admin.id}`);
  console.log(`Email   : ${admin.email}`);
  console.log(`Role    : ${admin.role}`);
  console.log("You can now securely sign in at /login with full access to /admin.");
  console.log("-------------------------------------------------");
}

try {
  await bootstrapAdmin();
} catch (err) {
  console.error("❌ Error in admin bootstrap:", err.message || err);
  process.exitCode = 1;
} finally {
  try {
    await prisma.$disconnect();
  } catch {
    // Disconnect error can be ignored on shutdown
  }
  const restored = restoreSqliteClient();
  if (!restored) {
    process.exitCode = 1;
  }
}
