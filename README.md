# EcoHack 2.0 — AI-Powered Waste-to-Value Assistant

> **Turn everyday household discards into high-value resources through multimodal AI vision diagnostics, actionable DIY upcycling blueprints, verified safe disposal protocols, and community habit formation.**

---

## 1. Live Application

- **Production Deployment**: [https://eco-hack-two.vercel.app](https://eco-hack-two.vercel.app)
- **Repository**: [https://github.com/Sindhuja-wq/EcoHack](https://github.com/Sindhuja-wq/EcoHack)
- **Latest Verified Quality Status**: 73/73 Automated Tests Passing | 0 TypeScript Errors | Clean Production Build

---

## 2. Practical Waste Problems Addressed

Every year, municipal solid waste management systems face severe bottlenecks driven by household consumption patterns. EcoHack 2.0 addresses five concrete, real-world challenges:

1. **Recycling Stream Contamination ("Wishcycling")**: Well-intentioned residents place non-recyclable, dirty, or unwashed items into curbside recycling bins. Contaminated batches ruin entire processing streams at Materials Recovery Facilities (MRFs), sending otherwise recyclable materials to landfills.
2. **Premature Discard of Reusable & Repairable Materials**: Everyday items (glass jars, sturdy corrugated packaging, textiles, plastic containers) are discarded after a single use simply because residents lack immediate, practical ideas on how to reuse or mend them.
3. **Hazardous Household Waste in General Bins**: Batteries, chemical cleaners, electronics, and broken glass are frequently tossed into general trash bins, creating catastrophic lithium fire risks in sorting facilities and leaching heavy metals into local aquifers.
4. **The "Execution Drop-off" in DIY Upcycling**: People encounter generic upcycling tips online but abandon them because instructions lack specific material requirements, safety precautions, time commitments, or sequential step-by-step directions.
5. **Lack of Sustained Environmental Motivation**: Environmental stewardship is often perceived as demanding and unrewarding, leading to habit abandonment without structured positive reinforcement and accountability.

*(Note: These represent the practical challenges addressed by this project's architecture and are not claimed to be an official hackathon problem statement.)*

---

## 3. The EcoHack 2.0 Solution

EcoHack 2.0 provides an end-to-end, computer-vision-driven sustainability assistant. When a user captures or uploads a photo of a household discard:

- **Instant Multimodal AI Inspection**: Diagnoses the material composition, polymer resin identification number, cleanliness, physical condition, and contamination status.
- **Actionable 6-R Transformation Engine**: Delivers at least 3 structured, practical transformation blueprints spanning reuse, repair, functional tools, or safe circular disposal.
- **Smart Waste Disposal & Hazard Mitigation**: Explicitly routes hazardous discards away from standard bins and differentiates between confirmed curbside recyclables versus items requiring local facility verification.
- **Transparent Impact Metrics**: Quantifies diverted mass using published EPA Municipal Solid Waste and UNEP packaging density indices, avoiding unverified carbon claims.
- **Verified Habit Loop**: Users bookmark blueprints into a personal DIY library, complete daily eco quests, and submit photo evidence of completed projects for admin audit review before earning eco-points and badge achievements.

---

## 4. Problem-to-Solution Alignment Matrix

| Household Waste Problem | Implemented EcoHack Feature | How It Directly Solves the Problem | Implementation Evidence |
|---|---|---|---|
| **Recycling Contamination & "Wishcycling"** | **Material & Purity Diagnostics** | Inspects resin codes (#1-#7), evaluates contamination, and explicitly flags confirmed recyclables vs items needing local verification. | `src/lib/ai/smart-disposal-guide.ts`<br>`src/app/scanner/page.tsx` |
| **Premature Disposal of Usable Discards** | **3+ Structured Transformation Blueprints** | Provides at least 3 tailored reuse and repurposing ideas with full tool lists, steps, and time estimates for every scanned discard. | `src/lib/ai/gemini-provider.ts`<br>`TransformationOption` model |
| **Discard of Mended Textiles & Tools** | **Dedicated Repair & Restoration Guidance** | Surfaces restorative mending and structural repair possibilities before suggesting recycling or disposal. | `src/lib/ai/types.ts`<br>`src/app/scanner/page.tsx` |
| **Sorting Facility Fires & Toxic Leaching** | **Smart Waste Disposal Guide** | Automatically detects batteries, chemicals, e-waste, and medical items; provides terminal-taping and hazardous depot routing. | `src/lib/ai/smart-disposal-guide.ts`<br>`tests/smart-disposal.test.mjs` |
| **DIY Complexity & Abandonment** | **Sequential Step-by-Step Instructions & Tool Lists** | Breaks down each project into sequential numbered instructions, estimated costs ($0/free), required materials, and safety guidelines. | `TransformationOption.stepByStep`<br>`TransformationOption.materialsTools` |
| **Greenwashing & Exaggerated Claims** | **Lifecycle Impact & 4-Way Comparison Matrix** | Evaluates Diverted Mass using transparent EPA/UNEP physical densities and compares *Reuse* vs *Upcycling* vs *Recycling* vs *Safe Disposal*. | `src/app/scanner/page.tsx`<br>`EnvironmentalImpactDTO` |
| **Disorganization & Lost Upcycling Guides** | **Personal DIY Library with Difficulty Filters** | Allows users to bookmark blueprints to `/saved-ideas`, filter by difficulty (*All, Easy, Medium, Advanced*), and open guide modals. | `src/app/saved-ideas/page.tsx`<br>`src/app/api/waste/save-idea/route.ts` |
| **Gamification Fraud & Fake Eco-Claims** | **Human-in-the-Loop Photo Evidence Auditing** | Points (+40) are locked until users upload a photo of their completed upcycled project and an admin audits the evidence. | `src/app/api/waste/submissions/route.ts`<br>`src/app/admin/submissions/page.tsx` |
| **Habit Inconsistency** | **Daily Eco Quests & Honor Roll Leaderboard** | Features daily rotating sustainability challenges, active streaks, 6 progression tiers, and all-time/monthly/weekly leaderboards. | `src/app/challenges/page.tsx`<br>`src/app/leaderboard/page.tsx` |

---

## 5. Verified Key Capabilities

### 🔍 AI Scanner & Diagnostics
- Multi-input capture: mobile camera capture, file upload, drag-and-drop, or 6 instant discard presets.
- Client-side image canvas optimization (strips EXIF, scales under 1200px, optimizes under 1MB).
- Multimodal classification: detected item name, material category, confidence rating, observed physical condition, and uncertainty notes when photos are blurry.

### 🛠️ Practical Transformation Blueprints
- At least 3 distinct options per analyzed discard.
- Difficulty ratings (*Easy, Medium, Advanced*), estimated time, estimated cost ($0/free), and full materials checklist.
- Detailed step-by-step instructions and safety precautions (e.g. blade safety, heat handling).
- Expected final result, environmental benefits, limitations/lifespan, and scrap disposal instructions.

### 🛡️ Smart Waste Disposal Guide
- Recovery status badge: *Reusable*, *Repairable*, *Recyclable*, *Special Disposal Required*, or *No Safe Recovery Option Identified*.
- Explicit handling protocols for hazardous materials (batteries, chemical solvents, e-waste, fluorescent tubes, broken glass).
- Clear distinction between confirmed recyclables and items requiring municipal verification.

### 📚 Personal DIY Library (`/saved-ideas`)
- Dedicated authenticated bookmarking library.
- Interactive difficulty filtering chips (*All Blueprints, Easy, Medium, Advanced*) with live item counters.
- Project cards displaying thumbnail photos of the original waste discard, detected item tags, and quick-action modals.

### 🏆 Gamification & Admin Verification
- Daily eco quests across 6 categories: *plastic, transport, food, zero-waste, energy, circular*.
- Photo proof submission: users submit photographic evidence and project notes.
- Atomic admin approval workflow: points and badges commit inside database transactions only upon verified approval.
- 6 progression ranks: *Eco Seedling* (0 pts) to *Planetary Champion* (2000+ pts).

---

## 6. End-to-End User Workflow

```
[ 1. Capture Discard ]
       │
       ▼
[ 2. AI Diagnostics ] ────► Identifies Material, Resin Code, Condition & Safety Flags
       │
       ▼
[ 3. Review Blueprints ] ──► Compares 3+ Options: Reuse, Repair, Upcycle, or Safe Disposal
       │
       ├─────────────────────────┬─────────────────────────┐
       ▼                         ▼                         ▼
[ Save to DIY Library ]   [ Smart Disposal Guide ]  [ 4-Way Route Matrix ]
       │                         │                         │
       ▼                         ▼                         ▼
[ Craft Upcycled Project ]   [ Safe Local Sorting ]   [ Transparent EPA Mass ]
       │
       ▼
[ 4. Submit Proof Photo ] ──► Upload evidence photo + experience notes
       │
       ▼
[ 5. Admin Verification ] ──► Human review prevents gaming / fraudulent claims
       │
       ▼
[ 6. Reward & Leaderboard ] ─► +40 Eco-Points awarded, Level advancement, Badge unlocked
```

---

## 7. Environmental Impact Methodology

EcoHack 2.0 adopts a strict **anti-greenwashing policy**. All environmental figures in the platform adhere to documented physical standards:

- **What Is Estimated**: Diverted physical material mass (grams or kilograms) prevented from entering municipal solid waste streams.
- **Reference Benchmarks**: Density approximations (e.g. ~32g for a 500ml PET water bottle, ~180g for an unbleached corrugated carton) are derived from published **US EPA Municipal Solid Waste Characterization tables** and **UNEP packaging density guidelines**.
- **Important Distinctions**:
  - Diverted mass estimates are **model-based calculations**, not independently measured laboratory life-cycle assessments (LCAs).
  - Extended carbon avoidance (CO2e) and water savings displayed on user dashboards represent indicative estimates based on avoided virgin raw material manufacturing.
  - EcoHack explicitly advises users that upcycling does not indefinitely prevent landfilling; materials eventually degrade and require responsible residual disposal.

---

## 8. User Interface Walkthrough

| Interface | Route | Primary Purpose |
|---|---|---|
| **Waste Scanner** | `/scanner` | Image upload, live AI material diagnostics, 3+ blueprints, and Smart Disposal Guide. |
| **DIY Library** | `/saved-ideas` | Dedicated bookmark collection with difficulty filter chips (*All, Easy, Medium, Advanced*). |
| **Personal Dashboard** | `/dashboard` | Cumulative ecological footprint, quick library launcher, badge showcase, and activity ledger. |
| **Daily Eco Quests** | `/challenges` | Daily rotating habit challenges with photo evidence submission modals. |
| **Honor Roll Leaderboard** | `/leaderboard` | All-time, monthly (30d), and weekly (7d) community rankings based on verified points. |
| **Admin Portal** | `/admin/submissions` | Human-in-the-loop audit desk to approve or reject submitted photo proof. |

*(To add visual screenshots to this repository, place exported images into `public/images/screenshots/` and link them here using standard Markdown notation).*

---

## 9. Technology Stack

Verified directly from repository configuration and dependencies:

- **Framework**: [Next.js 14.2.24](https://nextjs.org/) (App Router, React Server Components, Server Actions)
- **Frontend & UI**: [React 18.3.1](https://react.dev/), [TypeScript 5.7.3](https://www.typescriptlang.org/), [Tailwind CSS 3.4.17](https://tailwindcss.com/), [Framer Motion 11.18.2](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/)
- **AI Diagnostics**: [@google/generative-ai 0.24.1](https://www.npmjs.com/package/@google/generative-ai) (Google Gemini Multimodal Vision API with Flash models and structured JSON schema enforcement)
- **Offline/Test Provider**: Local rule-based demonstration engine (`src/lib/ai/mock-provider.ts`) for offline testing and deterministic CI runs.
- **Database & ORM**: [Prisma ORM 5.22.0](https://www.prisma.io/) with [Neon Serverless PostgreSQL](https://neon.tech/) in production (connection pooling + direct migration URLs), and SQLite for zero-setup local development.
- **Authentication**: Stateless, tamper-proof JSON Web Tokens using [jose 5.9.6](https://github.com/panva/jose) with `HS256`, password hashing with [bcryptjs 2.4.3](https://github.com/dcodeIO/bcrypt.js), and secure `HTTP-Only` cookies.
- **Object Storage**: [@vercel/blob 2.8.2](https://vercel.com/docs/storage/vercel-blob) for evidence photo uploads.
- **Validation**: [Zod 3.24.2](https://zod.dev/) for strict runtime request payload parsing.
- **Testing**: Node.js built-in test runner (`node --test`) with strict assertions (`node:assert/strict`).
- **Hosting & Infrastructure**: [Vercel](https://vercel.com/) (Fluid Compute, Edge/Serverless runtime, custom domain routing).

---

## 10. Architecture Overview

```
                        ┌──────────────────────────────────────────────┐
                        │              Client Browser                  │
                        │ (Next.js 14 App Router / React 18 / Tailwind)│
                        └──────────────────────┬───────────────────────┘
                                               │
                        HTTP / JSON (Protected by jose JWT & Rate Limiter)
                                               │
                                               ▼
                        ┌──────────────────────────────────────────────┐
                        │             API Route Handlers               │
                        │  /api/waste/analyze   /api/waste/save-idea   │
                        │  /api/challenges      /api/admin/submissions │
                        └──────────────┬────────────────┬──────────────┘
                                       │                │
                    ┌──────────────────┘                └──────────────────┐
                    ▼                                                      ▼
     ┌─────────────────────────────┐                        ┌─────────────────────────────┐
     │      AI Provider Layer      │                        │     Database Layer (ORM)    │
     │  Google Gemini Vision SDK   │                        │  Prisma 5.22.0 Client       │
     │  (gemini-2.5-flash / 1.5)   │                        │  Neon Serverless PostgreSQL │
     │  Structured Schema Parser   │                        │  (Pooled + Non-Pooling URLs)│
     └─────────────────────────────┘                        └─────────────────────────────┘
```

1. **Client Tier**: Manages responsive views, client-side photo compression, dark/light theme switching, and local state.
2. **Security & Rate Limiting**: All incoming requests pass through IP-based rate limiters (15 requests/min for scans, 5 for auth) and require verified JWT tokens for protected routes.
3. **AI Vision Tier**: Sends optimized base64 image data to the Google Gemini Vision API, enforcing a strict JSON schema contract. If the Gemini API key is unset or in test mode, the local mock engine activates transparently.
4. **Persistence Tier**: Prisma ORM executes transactional queries against Neon PostgreSQL, guaranteeing atomicity during point awards, reviews, and library operations.

---

## 11. Security, Privacy & Responsible AI

- **Cryptographic Security**: Passwords hashed with `bcryptjs` (salt factor 10); session tokens signed with 32+ character secrets via `jose` using `HS256`.
- **Upload Safety & Magic Byte Validation**: Image uploads undergo magic-byte inspection (verifying authentic JPEG, PNG, and WebP signatures) to prevent script execution or MIME-spoofing attacks.
- **Protection Against AI Hallucinations**:
  - The AI prompt instructs the vision model never to invent fictitious recycling facilities.
  - When image clarity is low or resin identification is uncertain, the system outputs an explicit **Uncertainty Notice** advising the user to inspect physical markings rather than guessing.
- **Maker Safety Warnings**: Blueprints flag sharp cutting hazards, thermal risks, and food safety caveats (e.g. prohibiting the reuse of motor oil containers for herb planters).

---

## 12. Quality, Testing & Verification Status

EcoHack 2.0 has been verified through strict multi-tier quality gates. The following results reflect the verified baseline at commit `5a08951`:

```bash
# Automated Test Suite
npm test
# Result: 73 passed, 0 failed, 5 test suites (Auth, Gamification, Rate Limiting, Smart Disposal, Saved Ideas)

# TypeScript Compiler Check
npx tsc --noEmit
# Result: 0 errors across all routes, components, and libraries

# Production Next.js Build
npm run build
# Result: Exit code 0; all 27 static and dynamic routes compiled successfully
```

---

## 13. Future Enhancements

The following capabilities represent potential future milestones (clearly designated as not yet implemented in the current production release):

- **GIS Municipal Recycling API Integration**: Direct integration with city-specific hauler databases via postal code or geolocation.
- **Neighborhood Tool & Material Sharing**: Community bulletin board enabling neighbors to lend DIY tools (drills, glue guns, sandpaper) to eliminate crafting purchase costs.
- **Automated Barcode & UPC Recycling Lookup**: Complementing computer vision with UPC barcode scanning to retrieve verified manufacturer packaging recycling specifications.

---

## 14. License

This project is developed for educational and hackathon demonstration purposes under the MIT License.
