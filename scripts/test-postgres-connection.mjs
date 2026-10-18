import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Safe PostgreSQL Connection Tester for EcoHack
// Verifies Neon connection without modifying tables or exposing credentials.

const envLocalPath = path.resolve(process.cwd(), ".env.local");

if (!fs.existsSync(envLocalPath)) {
  console.error("❌ ERROR: .env.local was not found. Please create .env.local with POSTGRES_PRISMA_URL and POSTGRES_URL_NON_POOLING.");
  process.exit(1);
}

// Load environment variables from .env.local and .env without external dependencies
const envVars = {};
function readEnv(filePath) {
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
        if (envVars[key] === undefined) {
          envVars[key] = val;
        }
      }
    }
  }
}

readEnv(envLocalPath);
readEnv(path.resolve(process.cwd(), ".env"));

const postgresUrl = envVars.POSTGRES_PRISMA_URL || process.env.POSTGRES_PRISMA_URL;
const directUrl = envVars.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL_NON_POOLING;

if (!postgresUrl) {
  console.error("❌ ERROR: Required PostgreSQL environment variable POSTGRES_PRISMA_URL is missing in .env.local or environment.");
  process.exit(1);
}

if (!directUrl) {
  console.error("❌ ERROR: Required PostgreSQL environment variable POSTGRES_URL_NON_POOLING is missing in .env.local or environment.");
  process.exit(1);
}

// Parse connection URLs to extract safe metadata
let parsedPooled;
try {
  parsedPooled = new URL(postgresUrl);
} catch {
  console.error("❌ ERROR: POSTGRES_PRISMA_URL is not a valid URL format.");
  process.exit(1);
}

let parsedDirect;
try {
  parsedDirect = new URL(directUrl);
} catch {
  console.error("❌ ERROR: POSTGRES_URL_NON_POOLING is not a valid URL format.");
  process.exit(1);
}

const pooledHostDisplay = parsedPooled.hostname + (parsedPooled.port ? `:${parsedPooled.port}` : "");
const directHostDisplay = parsedDirect.hostname + (parsedDirect.port ? `:${parsedDirect.port}` : "");

console.log("=================================================");
console.log("🐘 EcoHack PostgreSQL Connectivity Verification");
console.log("=================================================");
console.log(`• Protocol:        ${parsedPooled.protocol.replace(":", "")}`);
console.log(`• Pooled Host:     ${pooledHostDisplay}`);
console.log(`• Direct Host:     ${directHostDisplay}`);
console.log(`• Database:        ${parsedPooled.pathname.replace(/^\//, "")}`);
console.log(`• SSL Mode:        ${parsedPooled.searchParams.get("sslmode") || "default"}`);
console.log(`• Connection Pool: ${parsedPooled.searchParams.get("pgbouncer") === "true" ? "pgBouncer (Active)" : "Direct"}`);
console.log(`• Credentials:     [MASKED / SECURE]`);
console.log("-------------------------------------------------");

console.log("Executing read-only test query (SELECT 1) via Prisma Engine...");

const sanitizeOutput = (text) => {
  if (!text) return "";
  return String(text).replace(/:\/\/[^:]+:[^@]+@/g, "://[MASKED]:[MASKED]@");
};

try {
  const execEnv = {
    ...process.env,
    POSTGRES_PRISMA_URL: postgresUrl,
    POSTGRES_URL_NON_POOLING: directUrl,
  };

  const output = execSync(
    "npx prisma db execute --stdin --schema=prisma/schema.postgresql.prisma",
    {
      input: "SELECT 1 AS alive;",
      env: execEnv,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }
  );

  console.log("✅ Neon PostgreSQL connection successful!");
  console.log(`• Engine Status:   ${output.trim()}`);
  console.log("• Safety Check:    Read-only query executed. Zero tables created, modified, or deleted.");
  console.log("• Verification:    Neon production endpoint is reachable and authenticated.");
  console.log("=================================================");
} catch (error) {
  console.error("❌ Connection test failed:");
  const errOutput = error.stderr ? error.stderr.toString() : (error.message || "Unknown error");
  console.error(sanitizeOutput(errOutput));
  process.exit(1);
}
