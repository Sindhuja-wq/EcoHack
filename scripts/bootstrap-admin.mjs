import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();

async function bootstrapAdmin() {
  console.log("=================================================");
  console.log("🛡️  EcoHack Secure Admin Bootstrap Utility");
  console.log("=================================================");

  const expectedSecret = process.env.ADMIN_SECRET_KEY;
  if (!expectedSecret) {
    console.error("❌ ERROR: ADMIN_SECRET_KEY is not defined in your environment (.env).");
    console.error("Please configure ADMIN_SECRET_KEY before bootstrapping an administrator.");
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
      providedSecret = await question("Enter ADMIN_SECRET_KEY from .env: ");
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
    process.exit(1);
  }

  if (!email || !email.includes("@")) {
    console.error("❌ REJECTED: Invalid email format.");
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error("❌ REJECTED: Password must be at least 8 characters long.");
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
  console.log(`User ID : ${admin.id}`);
  console.log(`Email   : ${admin.email}`);
  console.log(`Role    : ${admin.role}`);
  console.log("You can now securely sign in at /login with full access to /admin.");
  console.log("-------------------------------------------------");
}

bootstrapAdmin()
  .catch((err) => {
    console.error("❌ Error in admin bootstrap:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
