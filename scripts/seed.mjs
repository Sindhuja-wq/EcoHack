import fs from "fs";
import { execSync } from "child_process";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Determine database target & demo seeding policy
const isPostgresTarget = process.argv.includes("--postgres") || process.env.USE_POSTGRES === "true";
const includeDemoUsers = process.argv.includes("--include-demo-users");

// In local SQLite development, demo seeding is enabled by default to provide an out-of-the-box local experience.
// In production (PostgreSQL), demo users & sample analyses are strictly disabled by default and require --include-demo-users.
const shouldSeedDemoData = !isPostgresTarget || includeDemoUsers;

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

  // Ensure PostgreSQL Prisma Client is generated before execution
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

// Dynamically import PrismaClient to bind to the active schema
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

async function main() {
  console.log(`🌱 Seeding EcoHack database (${isPostgresTarget ? "PostgreSQL - Production" : "SQLite - Local Dev"})...`);

  // 1. Seed Badges (Idempotent upsert by unique code)
  const badges = [
    {
      code: "green-starter",
      name: "Green Starter",
      description: "Welcome to the circular economy! Took the first step on the waste-to-value journey.",
      icon: "Sprout",
      minPoints: 0,
      category: "milestone",
    },
    {
      code: "plastic-reducer",
      name: "Plastic Reducer",
      description: "Diverted and transformed single-use plastics from polluting landfills and oceans.",
      icon: "ShieldCheck",
      minPoints: 100,
      category: "waste-stream",
    },
    {
      code: "reuse-champion",
      name: "Reuse Champion",
      description: "Proven master of repurposing household items into functional everyday tools.",
      icon: "Sparkles",
      minPoints: 250,
      category: "action",
    },
    {
      code: "eco-explorer",
      name: "Eco Explorer",
      description: "Broadened sustainability horizons across challenges, scans, and verified projects.",
      icon: "Compass",
      minPoints: 500,
      category: "milestone",
    },
    {
      code: "sustainability-hero",
      name: "Sustainability Hero",
      description: "Leading the transformation charge with over 1,000 verified eco-points.",
      icon: "Award",
      minPoints: 1000,
      category: "elite",
    },
  ];

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { code: b.code },
      update: b,
      create: b,
    });
  }
  console.log(`✅ Seeded ${badges.length} badges`);

  // 2. Seed Challenges (Idempotent upsert by unique slug)
  const challenges = [
    {
      slug: "avoid-single-use-plastic-24h",
      title: "Zero Single-Use Plastic for 24 Hours",
      description: "Commit to avoiding all single-use plastics for an entire day: reject plastic straws, cling wrap, disposable utensils, and plastic bags.",
      whyItMatters: "Single-use plastics make up approximately 50% of all plastic produced annually and often persist for hundreds of years, breaking down into microplastics.",
      difficulty: "Easy",
      category: "plastic",
      pointsReward: 50,
      isDaily: true,
      dayOfWeek: 1,
      completionRequirements: "Take a photo of your plastic-free meal prep, stainless container, or a daily reflection note showing how you avoided single-use items.",
      suggestedActions: JSON.stringify([
        "Carry reusable cutlery and a cloth napkin.",
        "Choose loose produce rather than plastic-wrapped vegetables.",
        "Politely decline straws and plastic cups when dining out.",
      ]),
    },
    {
      slug: "carry-reusable-water-bottle",
      title: "Carry a Reusable Water Bottle",
      description: "Ditch pre-packaged bottled water. Fill a durable stainless steel, glass, or BPA-free bottle from home or refill stations.",
      whyItMatters: "Over 1 million plastic bottles are purchased every minute worldwide, and less than 10% are recycled back into new bottles.",
      difficulty: "Easy",
      category: "plastic",
      pointsReward: 50,
      isDaily: true,
      dayOfWeek: 2,
      completionRequirements: "Upload a picture of your reusable water bottle in use during your daily routine or at a refill station.",
      suggestedActions: JSON.stringify([
        "Keep your clean bottle by your keys or bag so you don't forget it.",
        "Locate filtered tap refill stations on campus or in your office.",
      ]),
    },
    {
      slug: "low-impact-active-commute",
      title: "Low-Impact Commute: Walk, Bike, or Transit",
      description: "Replace a short single-occupancy motor vehicle trip with a walk, bicycle ride, public transit, or carpool where safe and accessible.",
      whyItMatters: "Transportation accounts for roughly 20-25% of global energy-related carbon emissions. Short trips in cold engines produce disproportionately high localized pollution.",
      difficulty: "Medium",
      category: "transport",
      pointsReward: 50,
      isDaily: true,
      dayOfWeek: 3,
      completionRequirements: "Share a snapshot of your walking route, bike commute, or transit ticket (hide sensitive personal data).",
      suggestedActions: JSON.stringify([
        "Group errands into one pedestrian walking trip.",
        "Take public transit or pedal-assist bikes for short commutes under 5km.",
      ]),
    },
    {
      slug: "separate-wet-and-dry-waste",
      title: "Home Waste Audit: Separate Wet & Dry",
      description: "Set up a clean two-bin system at home: organic/wet food scraps in one bin, clean dry recyclables (paper, cardboard, plastics, metals) in the other.",
      whyItMatters: "When organic waste is mixed with dry recyclables, it contaminates valuable recyclable paper and causes landfill organics to produce methane, a potent greenhouse gas.",
      difficulty: "Easy",
      category: "zero-waste",
      pointsReward: 50,
      isDaily: true,
      dayOfWeek: 4,
      completionRequirements: "Take a picture showing your separated wet (organic) and dry (recyclables) collection bins.",
      suggestedActions: JSON.stringify([
        "Use a covered container for food peels, coffee grounds, and tea leaves.",
        "Rinse food containers before placing them in the dry bin.",
      ]),
    },
    {
      slug: "rescue-and-repair-item",
      title: "Rescue & Repair: Fix Before Replacing",
      description: "Mend a torn garment, tighten loose chair screws, glue a broken ceramic handle, or fix a household item instead of buying new.",
      whyItMatters: "Extending the lifespan of everyday products by just 9 months reduces carbon, waste, and water footprints by 20% to 30%.",
      difficulty: "Medium",
      category: "repair",
      pointsReward: 60,
      isDaily: true,
      dayOfWeek: 5,
      completionRequirements: "Submit before-and-after photos of the item you repaired, or the mended item along with tools used.",
      suggestedActions: JSON.stringify([
        "Sew a missing button or mend a hem.",
        "Use multi-surface epoxy or wood glue on loose joints.",
        "Clean electrical contacts or descale a kettle.",
      ]),
    },
    {
      slug: "bring-your-own-bag",
      title: "Reusable Bag Champion: Zero Shopping Bags",
      description: "Take reusable tote bags, backpacks, or cloth sacks when shopping for groceries or supplies.",
      whyItMatters: "A single plastic bag is used for an average of just 12 minutes, but can take centuries to degrade, breaking down into toxic microplastic particles.",
      difficulty: "Easy",
      category: "plastic",
      pointsReward: 50,
      isDaily: true,
      dayOfWeek: 6,
      completionRequirements: "Upload a picture of your reusable shopping bag packed with items at checkout or after shopping.",
      suggestedActions: JSON.stringify([
        "Keep 2 compact cloth bags inside your everyday backpack or car trunk.",
        "Refuse small plastic bags for fruit when 1-2 items can be weighed loose.",
      ]),
    },
    {
      slug: "plant-and-nourish-native-plant",
      title: "Green Care: Plant or Nurture a Native Plant",
      description: "Plant a native herb, balcony flower, or houseplant, or care for local greens using homemade compost or graywater.",
      whyItMatters: "Native vegetation supports local pollinators, purifies indoor and outdoor air, and prevents soil erosion.",
      difficulty: "Medium",
      category: "nature",
      pointsReward: 60,
      isDaily: true,
      dayOfWeek: 0,
      completionRequirements: "Photo of your planted or nurtured seedling/plant with water or soil.",
      suggestedActions: JSON.stringify([
        "Plant mint, basil, or local flowering pollinator plants.",
        "Use waste coffee grounds or crushed eggshells as soil enrichment.",
      ]),
    },
  ];

  for (const c of challenges) {
    await prisma.challenge.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }
  console.log(`✅ Seeded ${challenges.length} challenges`);

  // 3. Seed Sample Community Members (Gated by shouldSeedDemoData)
  console.log("ℹ️ Administrator provisioning is separated from general seed.");
  console.log("   To create or elevate an administrator, run: npm run bootstrap:admin");

  let firstUserId = null;

  if (!shouldSeedDemoData) {
    console.log("ℹ️ Skipping sample community user creation (production safety default).");
    console.log("   To include sample community users in PostgreSQL, pass: --include-demo-users");
  } else {
    // In production (PostgreSQL target), avoid predictable demo passwords.
    // Generate a cryptographically secure random password unless DEMO_USER_PASSWORD is set.
    let demoPassword;
    if (isPostgresTarget) {
      if (process.env.DEMO_USER_PASSWORD) {
        if (process.env.DEMO_USER_PASSWORD.length < 8) {
          console.error("❌ ERROR: Provided DEMO_USER_PASSWORD must be at least 8 characters long.");
          restoreSqliteClient();
          process.exit(1);
        }
        demoPassword = process.env.DEMO_USER_PASSWORD;
      } else {
        demoPassword = crypto.randomBytes(32).toString("hex");
        console.log("🔒 Production safety: Sample community accounts seeded with unguessable randomized passwords.");
      }
    } else {
      demoPassword = process.env.DEMO_USER_PASSWORD || "EcoUser2026!";
    }

    const salt = await bcrypt.genSalt(10);
    const userPasswordHash = await bcrypt.hash(demoPassword, salt);

    const sampleUsers = [
      {
        email: "maya.lin@example.com",
        name: "Maya Lin",
        bio: "Urban gardener & zero-waste enthusiast in Portland.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        points: 620,
        streak: 14,
      },
      {
        email: "carlos.m@example.com",
        name: "Carlos Mendez",
        bio: "Upcycling wood, electronics, and old bike gear.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        points: 540,
        streak: 9,
      },
      {
        email: "aisha.k@example.com",
        name: "Aisha Khan",
        bio: "Compost fanatic & plastic-free lifestyle blogger.",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        points: 390,
        streak: 7,
      },
      {
        email: "liam.smith@example.com",
        name: "Liam Smith",
        bio: "College student reducing dining hall food and packaging waste.",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        points: 210,
        streak: 4,
      },
    ];

  for (const u of sampleUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        points: u.points,
        streak: u.streak,
      },
      create: {
        email: u.email,
        passwordHash: userPasswordHash,
        name: u.name,
        bio: u.bio,
        avatar: u.avatar,
        points: u.points,
        streak: u.streak,
        role: "USER",
      },
    });

    if (!firstUserId) firstUserId = user.id;

    // Record initial point transaction for audit trail if missing
    const existingTx = await prisma.pointTransaction.findFirst({
      where: { userId: user.id },
    });
    if (!existingTx) {
      await prisma.pointTransaction.create({
        data: {
          userId: user.id,
          amount: u.points,
          source: "CHALLENGE_COMPLETION",
          description: "Verified community sustainability actions and challenge completions",
        },
      });
    }

    // Award initial badges based on thresholds
    if (u.points >= 0) {
      const b0 = await prisma.badge.findUnique({ where: { code: "green-starter" } });
      if (b0) await prisma.userBadge.upsert({ where: { userId_badgeId: { userId: user.id, badgeId: b0.id } }, update: {}, create: { userId: user.id, badgeId: b0.id } });
    }
    if (u.points >= 100) {
      const b1 = await prisma.badge.findUnique({ where: { code: "plastic-reducer" } });
      if (b1) await prisma.userBadge.upsert({ where: { userId_badgeId: { userId: user.id, badgeId: b1.id } }, update: {}, create: { userId: user.id, badgeId: b1.id } });
    }
    if (u.points >= 250) {
      const b2 = await prisma.badge.findUnique({ where: { code: "reuse-champion" } });
      if (b2) await prisma.userBadge.upsert({ where: { userId_badgeId: { userId: user.id, badgeId: b2.id } }, update: {}, create: { userId: user.id, badgeId: b2.id } });
    }
    if (u.points >= 500) {
      const b3 = await prisma.badge.findUnique({ where: { code: "eco-explorer" } });
      if (b3) await prisma.userBadge.upsert({ where: { userId_badgeId: { userId: user.id, badgeId: b3.id } }, update: {}, create: { userId: user.id, badgeId: b3.id } });
    }
  }

  console.log(`✅ Seeded ${sampleUsers.length} sample community members`);
}

  // 4. Seed a Sample Waste Analysis (Gated by shouldSeedDemoData; checks solely by explicit isDemoSample flag)
  if (!shouldSeedDemoData) {
    console.log("ℹ️ Skipping sample demo waste analysis creation (production safety default).");
  } else if (firstUserId) {
    const existingDemo = await prisma.wasteAnalysis.findFirst({
      where: { isDemoSample: true },
    });

    if (existingDemo) {
      console.log(`ℹ️ Sample demo waste analysis already exists (ID: ${existingDemo.id}), skipping duplicate creation.`);
    } else {
      const sampleAnalysis = await prisma.wasteAnalysis.create({
        data: {
          userId: firstUserId,
          imageUrl: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&auto=format&fit=crop&q=80",
          detectedItem: "Clear Polyethylene Terephthalate (PET) 1-Liter Water Bottle",
        materialCategory: "plastic",
        confidence: 0.94,
        isReusable: true,
        isRepairable: false,
        isRecyclable: true,
        isCompostable: false,
        isUnsuitable: false,
        safetyConcerns: "Ensure the bottle is thoroughly rinsed with warm soapy water before repurposing. Take care when using scissors or craft knives to cut plastic edges smooth to avoid minor cuts.",
        qualitativeImpact: JSON.stringify({
          summary: "Repurposing a 1-liter PET bottle saves energy required for virgin polymer resin synthesis and prevents lightweight plastic litter from polluting marine waterways.",
          divertedGramsEstimate: "Approx. 25-35 grams PET resin diverted from landfill",
          benefits: [
            "Avoids emissions from virgin resin petroleum extraction and polymerization",
            "Encourages household self-sufficiency and low-cost container creation",
            "Can be recycled in standard curb bins at the end of its transformed life"
          ],
          disadvantages: [
            "PET degrades under sustained UV exposure; outdoor planters may become brittle after 12-18 months",
            "Does not tolerate hot liquids above 60°C (140°F)",
            "Cannot be home-composted"
          ],
          comparisonRoutes: {
            reuseOrRepair: "Excellent for storage, seedling starter pots, or slow-release watering tools.",
            diyTransformation: "High feasibility with standard kitchen scissors and household string.",
            formalRecycling: "Accepted by virtually all municipal curb programs (#1 PETE code).",
            safeDisposal: "Avoid incineration; place in curbside recycling if transformation is not feasible."
          }
        }),
        localNotes: "Most municipalities globally accept PET #1 bottles in curbside recycling. Always rinse and discard food residues. Check local rules regarding keeping bottle caps on or off.",
        isDemoSample: true,
        options: {
          create: [
            {
              title: "Self-Watering Seedling & Herb Planter",
              shortExplanation: "Cut the bottle into two inverted halves to create a capillary-wicking self-watering planter ideal for basil, mint, or starter vegetable seeds.",
              difficulty: "Easy",
              estimatedTime: "20 minutes",
              materialsTools: JSON.stringify(["1 PET bottle", "Scissors or craft knife", "Cotton string or shoelace wick", "Potting soil", "Seeds or herb cuttings"]),
              estimatedCost: "$0 - $2 (soil/seeds)",
              stepByStep: JSON.stringify([
                { step: 1, instruction: "Rinse and thoroughly clean the bottle and remove the label." },
                { step: 2, instruction: "Carefully cut the bottle in half horizontally about 10 cm below the neck." },
                { step: 3, instruction: "Puncture a 4mm hole in the bottle cap and thread a 15cm cotton wick halfway through." },
                { step: 4, instruction: "Screw the cap back on and invert the top half (funnel side down) into the bottom base." },
                { step: 5, instruction: "Fill the base reservoir with fresh water ensuring the string dangles into the water." },
                { step: 6, instruction: "Fill the top funnel with potting soil around the wick and plant your seeds." }
              ]),
              safetyPrecautions: "Smooth cut plastic edges with sandpaper or cover with a small strip of cloth tape to avoid sharp edge scratches.",
              expectedResult: "A sleek, transparent sub-irrigation planter that keeps soil moisture consistent for over a week without daily watering.",
              environmentalBenefits: "Directly extends container lifecycle, reduces plastic waste, and eliminates the need to purchase synthetic plastic nursery pots.",
              limitations: "Best suited for small herbs and microgreens; root-bound plants must be transplanted as they expand.",
              disposalMethod: "When brittle after 1-2 years of sunlight, empty soil into garden and place PET in standard curbside plastics recycling."
            },
            {
              title: "Sub-Surface Drip Irrigation Stake for Garden Beds",
              shortExplanation: "Transform the bottle into a gravity-fed deep root drip-feeder for tomato, pepper, or ornamental flower beds.",
              difficulty: "Easy",
              estimatedTime: "15 minutes",
              materialsTools: JSON.stringify(["1 PET bottle with cap", "Sewing pin or small drill bit", "Lighter or candle to heat pin", "Trowel"]),
              estimatedCost: "$0 (uses existing tools)",
              stepByStep: JSON.stringify([
                { step: 1, instruction: "Wash the bottle clean and retain the secure screw cap." },
                { step: 2, instruction: "Heat a thin safety pin and puncture 4-6 tiny pinholes in the bottom half of the bottle." },
                { step: 3, instruction: "Dig a vertical hole beside the root zone of your target garden plant." },
                { step: 4, instruction: "Bury the bottle leaving the top neck exposed above the soil surface." },
                { step: 5, instruction: "Fill with water and loosely screw the cap to regulate airflow and slow the drip." }
              ]),
              safetyPrecautions: "Use pliers or tweezers when heating pins to prevent fingertip burns.",
              expectedResult: "A targeted root irrigation stake that prevents 70% of surface water evaporation compared to spray watering.",
              environmentalBenefits: "Conserves fresh water by delivering moisture directly to root zones, eliminating fungal leaf splash diseases.",
              limitations: "Soil may occasionally clog micro-holes; wrap with a small cloth scrap if soil is heavy clay.",
              disposalMethod: "Remove before winter frost or tilling; rinse and deposit in curbside plastic recycling."
            },
            {
              title: "Modular Desk & Craft Drawer Organizer",
              shortExplanation: "Cut the bottom fluted bases of several bottles to uniform heights to create interlocking modular organizers for stationery, screws, or art supplies.",
              difficulty: "Easy",
              estimatedTime: "15 minutes",
              materialsTools: JSON.stringify(["2-4 PET bottles", "Craft knife or scissors", "Fine sandpaper", "Ruler"]),
              estimatedCost: "$0",
              stepByStep: JSON.stringify([
                { step: 1, instruction: "Mark cut lines 6 cm from the bottom of each bottle." },
                { step: 2, instruction: "Carefully cut off the fluted bases using your scissors." },
                { step: 3, instruction: "Rub the rims on fine sandpaper or iron gently over parchment paper for 3 seconds to round the rim." },
                { step: 4, instruction: "Arrange side-by-side in desk drawers to store paperclips, USB drives, buttons, or screws." }
              ]),
              safetyPrecautions: "Do not touch hot iron surface or melt plastic directly onto iron plates.",
              expectedResult: "Sturdy, crystal-clear drawer dividers that keep clutter organized and visible at a glance.",
              environmentalBenefits: "Eliminates the purchase of manufactured plastic drawer organizers made from non-recycled virgin plastics.",
              limitations: "Lightweight; heavier items might tip small containers if not arranged snugly side by side.",
              disposalMethod: "Rinse and place in curbside recycling bin when no longer needed."
            }
          ]
        }
      }
    });

    console.log(`✅ Seeded sample analysis with 3 rich transformation options (ID: ${sampleAnalysis.id})`);
    }
  }

  console.log("🌱 Database seeding complete!");
}

try {
  await main();
} catch (e) {
  console.error("❌ Error seeding database:", e.message || e);
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
