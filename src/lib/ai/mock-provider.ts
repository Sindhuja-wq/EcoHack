import type { IWasteAnalysisProvider, WasteAnalysisResult } from "./types.ts";

export class MockWasteAnalysisProvider implements IWasteAnalysisProvider {
  async analyzeImage(
    imageBase64: string,
    mimeType: string,
    userCity?: string,
    imageName?: string
  ): Promise<WasteAnalysisResult> {
    // Simulated processing delay to match realistic AI latency
    await new Promise((res) => setTimeout(res, 350));

    // 1. Gather all hint sources: imageName, SVG text, decoded base64 strings
    let lowerHint = (imageName || "").toLowerCase();

    try {
      if (imageBase64.includes("data:image/svg+xml;base64,")) {
        const decoded = Buffer.from(
          imageBase64.replace("data:image/svg+xml;base64,", ""),
          "base64"
        ).toString("utf-8");
        lowerHint += " " + decoded.toLowerCase();
      } else {
        // Check raw base64 data for embedded ascii keywords (common in sample files or metadata)
        const cleanData = imageBase64.replace(/^data:[^;]+;base64,/, "");
        const rawBuffer = Buffer.from(cleanData, "base64");
        const asciiSnippet = rawBuffer.subarray(0, Math.min(rawBuffer.length, 2048)).toString("utf-8").toLowerCase();
        lowerHint += " " + asciiSnippet;
      }
    } catch {
      // Ignore decoding errors
    }

    // 2. Evaluate specific categories from accumulated hints
    if (
      lowerHint.includes("glass") ||
      lowerHint.includes("jar") ||
      lowerHint.includes("mason") ||
      (lowerHint.includes("bottle") && (lowerHint.includes("lid") || lowerHint.includes("flint") || lowerHint.includes("glass")))
    ) {
      return this.getGlassSample(userCity);
    }

    if (
      lowerHint.includes("cardboard") ||
      lowerHint.includes("box") ||
      lowerHint.includes("package") ||
      lowerHint.includes("shipping") ||
      lowerHint.includes("corrugated") ||
      lowerHint.includes("carton")
    ) {
      return this.getCardboardSample(userCity);
    }

    if (
      lowerHint.includes("denim") ||
      lowerHint.includes("fabric") ||
      lowerHint.includes("shirt") ||
      lowerHint.includes("cotton") ||
      lowerHint.includes("textile") ||
      lowerHint.includes("jeans") ||
      lowerHint.includes("clothes") ||
      lowerHint.includes("garment") ||
      lowerHint.includes("apparel")
    ) {
      return this.getFabricSample(userCity);
    }

    if (
      lowerHint.includes("plastic") ||
      lowerHint.includes("bottle") ||
      lowerHint.includes("pet") ||
      lowerHint.includes("beverage") ||
      lowerHint.includes("polymer")
    ) {
      return this.getPlasticSample(userCity);
    }

    if (
      lowerHint.includes("coffee") ||
      lowerHint.includes("organic") ||
      lowerHint.includes("scrap") ||
      lowerHint.includes("vegetable") ||
      lowerHint.includes("peel") ||
      lowerHint.includes("compost") ||
      lowerHint.includes("apple") ||
      lowerHint.includes("banana") ||
      lowerHint.includes("food_scrap") ||
      lowerHint.includes("food_waste") ||
      lowerHint.includes("produce")
    ) {
      return this.getOrganicSample(userCity);
    }

    // 3. Ambiguous / Unrecognized item: Report uncertainty rather than defaulting to plastic
    return this.getAmbiguousSample(userCity);
  }

  private getPlasticSample(userCity?: string): WasteAnalysisResult {
    return {
      detectedItem: "Polyethylene Terephthalate (PET #1) Beverage Bottle & Cap",
      materialCategory: "plastic",
      confidence: 0.94,
      isImageClear: true,
      itemCondition: "Clean, intact 500ml transparent plastic bottle with HDPE screw cap",
      uncertaintyNotes: "[Demonstration Engine] Synthetic sample blueprint. For real-time multimodal AI analysis of your specific photo, configure GEMINI_API_KEY in .env.",
      isReusable: true,
      isRepairable: false,
      isRecyclable: true,
      isCompostable: false,
      isUnsuitable: false,
      safetyConcerns: "Rinse thoroughly to remove sweet residues before cutting. Wear protective gloves when slicing plastic edges to avoid friction cuts.",
      environmentalImpact: {
        summary: "Repurposing this 500ml PET bottle diverts 28-35g of virgin polymer from landfills and eliminates demand for commercial injection-molded plastic planters.",
        divertedGramsEstimate: "Approx. 28 - 35g virgin PET resin",
        transparentAssumptions: "Standard EPA municipal solid waste packaging density for 500ml PET beverage containers.",
        qualitativeAdvantages: [
          "Eliminates demand for virgin petrochemical monomers and stabilizers",
          "Lowers municipal collection volume and hauling emissions",
          "Durable indoor capillary action reduces household water usage by up to 50%",
        ],
        possibleDisadvantages: [
          "UV sunlight will photodegrade PET over 18-24 months if kept outdoors",
          "Cannot withstand hot liquids above 60°C",
        ],
        comparisonMatrix: {
          reuseOrRepair: "Highest immediate efficiency. Extends container lifespan without energy-intensive smelting.",
          diyTransformation: "Ideal for sub-irrigation planters, drip root stakes, and workshop hardware organizers.",
          formalRecycling: "Globally accepted in curbside blue bins (#1 PET code). Leave cap screwed on.",
          safeDisposal: "Avoid landfilling. Curbside recycling is widely available.",
        },
        recommendedRoute: "diy_transformation",
        recommendationRationale: "Container is structurally intact and food-safe, making it perfect for immediate sub-irrigation herb gardening.",
      },
      localRecyclingCaveats: userCity
        ? `In ${userCity}, clean PET #1 bottles are accepted in municipal curbside dry recycling. Keep caps attached.`
        : "Curbside recycling accepted in over 90% of municipal systems worldwide (PET #1). Rinse clean.",
      transformationOptions: [
        {
          title: "Sub-Irrigation Self-Watering Herb Planter",
          shortExplanation: "Invert the upper cone into the bottom reservoir with a cotton wick to deliver constant moisture directly to roots.",
          difficulty: "Easy",
          estimatedTime: "15 minutes",
          materialsTools: ["Clean 500ml-1L PET bottle", "Scissors or craft blade", "Cotton string or shoelace (15cm)", "Potting soil & herb seeds"],
          estimatedCost: "$0 - $1",
          stepByStep: [
            { step: 1, instruction: "Rinse bottle thoroughly and remove the outer wrap label." },
            { step: 2, instruction: "Cut the bottle horizontally in half approximately 10cm below the cap line." },
            { step: 3, instruction: "Drill or pierce a 5mm hole through the center of the plastic bottle cap." },
            { step: 4, instruction: "Thread the 15cm cotton wick through the cap hole so 5cm dangles into the base and 10cm reaches up into the soil." },
            { step: 5, instruction: "Invert the top half into the bottom cylinder, add soil and plant your herb seed or cutting, and fill the base with water." },
          ],
          safetyPrecautions: "Use steady pressure when cutting plastic walls; place bottle flat on a cutting board.",
          expectedResult: "A self-watering indoor windowsill planter that keeps herbs flourishing with watering needed only once every 10 days.",
          environmentalBenefits: "Replaces store-bought plastic planters while preventing water loss from evaporation.",
          limitations: "Suitable for small kitchen herbs (basil, mint, cilantro) rather than taproot vegetables.",
          disposalMethod: "When the plant outgrows the container, empty the soil into compost and place the rinsed plastic into curbside recycling.",
        },
        {
          title: "Slow-Drip Garden Irrigation Spike",
          shortExplanation: "Puncture micro-holes in the cap and bury the bottle neck beside high-demand plants for direct root hydration.",
          difficulty: "Easy",
          estimatedTime: "10 minutes",
          materialsTools: ["PET bottle with cap", "Push pin or fine heated nail", "Water"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Using a heated push pin or small needle, pierce 3-4 tiny holes through the plastic cap." },
            { step: 2, instruction: "Cut off the bottom 2cm of the bottle base to serve as an easy top-fill funnel." },
            { step: 3, instruction: "Dig a 10cm hole next to tomatoes or shrubs and invert the neck into the soil." },
            { step: 4, instruction: "Fill with water; gravity delivers slow steady hydration straight to deep root systems." },
          ],
          safetyPrecautions: "Exercise extreme care when heating pins; hold with pliers, never bare fingers.",
          expectedResult: "Eliminates surface water evaporation and maintains steady moisture during hot afternoons.",
          environmentalBenefits: "Saves up to 60% of irrigation water compared to overhead sprinkling.",
          limitations: "Pinholes may slowly clog in heavy clay soils without a coarse gravel barrier.",
          disposalMethod: "Rinse and place in curbside recycling at the end of the harvest season.",
        },
        {
          title: "Modular Drawer & Hardware Organizer Cups",
          shortExplanation: "Trim the bottom fluted cups of multiple bottles to create interlocking modular organizing bins.",
          difficulty: "Easy",
          estimatedTime: "15 minutes",
          materialsTools: ["2-4 clean PET bottles", "Scissors", "Parchment paper and warm clothing iron (optional)"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Mark a line 5cm from the base of each bottle." },
            { step: 2, instruction: "Carefully cut along the line with scissors to create uniform shallow organizing bowls." },
            { step: 3, instruction: "Lightly press cut rim against parchment paper over a warm iron for 2 seconds to roll the edge smooth." },
            { step: 4, instruction: "Arrange side-by-side in desk drawers or toolboxes to sort paperclips, nails, or seeds." },
          ],
          safetyPrecautions: "Never apply iron directly to raw plastic without parchment paper.",
          expectedResult: "Neat, transparent, compartmentalized drawer trays.",
          environmentalBenefits: "Prevents buying new plastic organizers made from virgin fossil fuels.",
          limitations: "Lightweight trays should be snug against drawer dividers so they don't tip.",
          disposalMethod: "Rinse and place in curbside plastics bin when retiring.",
        },
      ],
      isDemoSample: true,
      providerUsed: "mock (educational sample engine)",
    };
  }

  private getCardboardSample(userCity?: string): WasteAnalysisResult {
    return {
      detectedItem: "Corrugated Cardboard Delivery Shipping Box",
      materialCategory: "cardboard",
      confidence: 0.95,
      isImageClear: true,
      itemCondition: "Clean, dry unbleached corrugated fiberboard with plastic tape attached",
      uncertaintyNotes: "[Demonstration Engine] Synthetic sample blueprint. For real-time multimodal AI analysis of your specific photo, configure GEMINI_API_KEY in .env.",
      isReusable: true,
      isRepairable: false,
      isRecyclable: true,
      isCompostable: true,
      isUnsuitable: false,
      safetyConcerns: "Flatten carefully. Wear light work gloves to prevent cardboard paper cuts. Remove plastic shipping tape and labels.",
      environmentalImpact: {
        summary: "Repurposing or composting corrugated cardboard sequesters carbon in soils and diverts bulk cellulose volume from methane-producing municipal dumps.",
        divertedGramsEstimate: "Approx. 250 - 450g unbleached cellulose",
        transparentAssumptions: "Standard UNEP packaging weight for corrugated shipping cartons (ECT-32 single-wall).",
        qualitativeAdvantages: [
          "Suppresses weed germination without synthetic microplastic landscape fabrics",
          "Rich carbon ('brown') layer feeds earthworms and fungal soil networks",
          "Saves virgin wood pulp and water-intensive industrial re-pulping cycles",
        ],
        possibleDisadvantages: [
          "Must strip synthetic packing tape and plastic shipping slips",
          "Wet cardboard attracts mildew if stored indoors damp",
        ],
        comparisonMatrix: {
          reuseOrRepair: "Ideal for shipping parcels, drawer dividers, or cat scratching boards.",
          diyTransformation: "Best for garden sheet-mulching (lasagna gardening) or biodegradable seed starter pots.",
          formalRecycling: "Accepted in 98% of paper/cardboard collection streams worldwide.",
          safeDisposal: "Compostable if unprinted/uncoated; curbside recycle otherwise.",
        },
        recommendedRoute: "diy_transformation",
        recommendationRationale: "Unbleached kraft cardboard is non-toxic and serves as a premier soil-building weed barrier for urban garden beds.",
      },
      localRecyclingCaveats: userCity
        ? `In ${userCity}, cardboard must be flattened and free of oily food residues before placing in curbside paper/cardboard bins.`
        : "Accepted universally in clean, flattened condition. Greasy sections (like pizza boxes) should be composted.",
      transformationOptions: [
        {
          title: "Sheet-Mulch Weed Suppression Layer (Lasagna Gardening)",
          shortExplanation: "Lay flattened unprinted cardboard directly over weeds and top with compost to naturally build rich soil without chemicals.",
          difficulty: "Easy",
          estimatedTime: "25 minutes",
          materialsTools: ["Cardboard boxes", "Box cutter / scissors", "Garden hose (water)", "Organic compost or mulch (5cm depth)"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Remove all plastic adhesive tape, shipping labels, and metal staples from the carton." },
            { step: 2, instruction: "Slit the corners so the box lays completely flat on the soil, overlapping seams by at least 10cm to block sunlight." },
            { step: 3, instruction: "Thoroughly soak the cardboard with a garden hose until soft and pliable." },
            { step: 4, instruction: "Cover with 5-10cm of compost or wood chips. Earthworms will consume the cellulose within 4-6 months." },
          ],
          safetyPrecautions: "Always cut away from your body with box cutters; inspect cardboard for sharp packaging staples.",
          expectedResult: "A completely weed-free, moisture-retentive organic planting bed without plastic weed barrier textiles.",
          environmentalBenefits: "Feeds soil microbiome, prevents synthetic fabric breakdown in soil, and conserves garden water.",
          limitations: "Do not use glossy or wax-coated cardboard boxes.",
          disposalMethod: "Natural decomposition into rich humus; zero waste remaining.",
        },
        {
          title: "Biodegradable Seedling Starter Pots",
          shortExplanation: "Fold cut strips of cardboard into small biodegradable seedling cups that can be planted directly into soil.",
          difficulty: "Easy",
          estimatedTime: "20 minutes",
          materialsTools: ["Clean unprinted cardboard", "Ruler", "Scissors", "Seedling soil & seeds"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Cut cardboard into 8cm x 20cm strips." },
            { step: 2, instruction: "Fold into square tubes and score bottom tabs to fold inward as a base." },
            { step: 3, instruction: "Fill with seedling starter mix and plant seeds." },
            { step: 4, instruction: "When seedlings sprout, plant the entire cardboard pot directly into the garden; roots easily penetrate as it decomposes." },
          ],
          safetyPrecautions: "Watch your fingers when cutting thick corrugated walls.",
          expectedResult: "Zero-plastic seedling pots that eliminate transplant root shock.",
          environmentalBenefits: "Eliminates single-use plastic nursery seedling trays.",
          limitations: "Degrades rapidly if kept in standing water; use a drainage tray.",
          disposalMethod: "Planted directly into garden soil where it naturally biodegrades.",
        },
        {
          title: "Reversible Spiral Cat Scratcher & Lounger",
          shortExplanation: "Slice cardboard into uniform 4cm strips, roll into a tight spiral, and secure with non-toxic glue to create a durable feline scratch pad.",
          difficulty: "Medium",
          estimatedTime: "35 minutes",
          materialsTools: ["2-3 corrugated shipping boxes", "Ruler", "Box cutter", "Non-toxic PVA wood glue or masking tape"],
          estimatedCost: "$0 - $2",
          stepByStep: [
            { step: 1, instruction: "Cut cardboard along corrugated flutes into identical 4cm wide strips." },
            { step: 2, instruction: "Roll the first strip tightly into a central cylinder." },
            { step: 3, instruction: "Continuously wrap subsequent strips around the core, applying small dabs of non-toxic glue between layers." },
            { step: 4, instruction: "Continue until disc reaches 25-30cm diameter. Secure outer boundary with a strip of kraft paper." },
          ],
          safetyPrecautions: "Use a metal ruler as a cutting guide; keep fingers well behind the blade edge.",
          expectedResult: "A rugged, dense scratching pad that cats love, equal to commercial $20 pet store models.",
          environmentalBenefits: "Diverts 400g of cardboard and eliminates synthetic carpet scrapers.",
          limitations: "Will create paper dust over months of active scratching.",
          disposalMethod: "When shredded by cat claws, compost or recycle the worn remnants.",
        },
      ],
      isDemoSample: true,
      providerUsed: "mock (educational sample engine)",
    };
  }

  private getFabricSample(userCity?: string): WasteAnalysisResult {
    return {
      detectedItem: "Worn 100% Cotton Crewneck T-Shirt",
      materialCategory: "fabric",
      confidence: 0.93,
      isImageClear: true,
      itemCondition: "Clean, washed cotton textile with small collar fraying and underarm wear",
      uncertaintyNotes: "[Demonstration Engine] Synthetic sample blueprint. For real-time multimodal AI analysis of your specific photo, configure GEMINI_API_KEY in .env.",
      isReusable: true,
      isRepairable: true,
      isRecyclable: true,
      isCompostable: true,
      isUnsuitable: false,
      safetyConcerns: "Wash fabric thoroughly before cutting. Use sharp textile shears rather than dull craft scissors to prevent hand strain.",
      environmentalImpact: {
        summary: "Cotton production consumes 2,700 liters of water per shirt. Upcycling worn cotton textiles preserves embodied agriculture energy and prevents synthetic shedding.",
        divertedGramsEstimate: "Approx. 150 - 200g natural cotton fibers",
        transparentAssumptions: "Standard adult jersey knit T-shirt weight (approx. 180 GSM).",
        qualitativeAdvantages: [
          "Preserves embodied fresh water and pesticide-intensive agricultural cultivation",
          "Pure cotton rags leave zero lint residue on glass and counter surfaces",
          "Keeps textiles out of anaerobic landfill conditions where dyes leach into groundwater",
        ],
        possibleDisadvantages: [
          "Synthetic polyester-blend tees cannot be composted; only pure natural cotton",
          "Edges may fray slightly if not sewn or pinked",
        ],
        comparisonMatrix: {
          reuseOrRepair: "Patching, visible mending (sashiko), or tie-dye extends wearable lifespan by years.",
          diyTransformation: "No-sew shopping tote, braided plant hanger, or lint-free detailing cloths.",
          formalRecycling: "Textile drop-off bins shred into automotive insulation or furniture padding.",
          safeDisposal: "100% pure untreated cotton can be shredded into home compost bins.",
        },
        recommendedRoute: "diy_transformation",
        recommendationRationale: "Jersey knit cotton fabric does not fray easily, making it the premier material for no-sew durable bags and cleaning rags.",
      },
      localRecyclingCaveats: userCity
        ? `In ${userCity}, textiles must not be placed in curbside dry recycling bins. Use dedicated textile drop-off banks or charity donation centers.`
        : "Never put clothing in curbside recycling bins (they tangle sorting machinery). Use dedicated textile bins.",
      transformationOptions: [
        {
          title: "No-Sew Durable Farmer's Market Produce Bag",
          shortExplanation: "Transform an old T-shirt into a sturdy washable grocery tote in under 10 minutes using only scissors and simple fringe knotting.",
          difficulty: "Easy",
          estimatedTime: "10 minutes",
          materialsTools: ["Old cotton T-shirt", "Sharp fabric scissors"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Lay shirt flat and cut off both sleeves along the inner seam line to form tote handles." },
            { step: 2, instruction: "Cut a deep scoop around the collar to open the bag's main opening." },
            { step: 3, instruction: "Turn the shirt inside out. Cut vertical 8cm slits along the bottom hem spaced 2cm apart to form matching fringe pairs." },
            { step: 4, instruction: "Firmly tie each top fringe strip to its bottom partner with a double square knot to seal the bottom." },
            { step: 5, instruction: "Turn the shirt right side out. The bottom knots are now hidden inside a durable washable tote!" },
          ],
          safetyPrecautions: "Use steady cutting strokes on thick hem seams.",
          expectedResult: "A stretchy, strong, washable tote bag that holds up to 10kg of groceries.",
          environmentalBenefits: "Replaces dozens of single-use plastic shopping bags every month.",
          limitations: "Stretches under heavy loads; avoid carrying wet produce without a cloth liner.",
          disposalMethod: "When worn out after years of shopping, cut into shop rags.",
        },
        {
          title: "Lint-Free Microfiber-Alternative Cleaning Rags",
          shortExplanation: "Cut worn jersey cotton into uniform 25x25cm squares for streak-free window, mirror, and kitchen counter cleaning.",
          difficulty: "Easy",
          estimatedTime: "10 minutes",
          materialsTools: ["Cotton shirt", "Ruler", "Scissors"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Cut away side seams, neckband, and thick hem ridges." },
            { step: 2, instruction: "Cut front and back panels into 25cm x 25cm cleaning squares." },
            { step: 3, instruction: "Store in a reusable jar or caddy beside your cleaning supplies." },
          ],
          safetyPrecautions: "None.",
          expectedResult: "8-12 washable, ultra-absorbent, lint-free cleaning cloths.",
          environmentalBenefits: "Eliminates disposable paper towels and stops plastic microfiber shedding into wastewater.",
          limitations: "Stains easily from grease or engine oil.",
          disposalMethod: "Wash and reuse 100+ times; compost if 100% cotton without chemical cleaner residues.",
        },
        {
          title: "Braided Macrame Hanging Plant Holder",
          shortExplanation: "Cut cotton into long continuous strips, stretch into t-shirt yarn, and braid into a boho hanging basket for indoor houseplants.",
          difficulty: "Medium",
          estimatedTime: "30 minutes",
          materialsTools: ["Cotton T-shirt", "Scissors", "Small metal or wooden ring (optional)"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Cut the body of the shirt into 8 continuous 3cm wide strips." },
            { step: 2, instruction: "Pull each strip firmly from both ends; cotton jersey curls into smooth durable cords ('t-shirt yarn')." },
            { step: 3, instruction: "Gather all 8 cords and tie a strong knot at the bottom leaving a decorative 10cm tassel." },
            { step: 4, instruction: "Pair adjacent cords and tie simple knots 5cm up, then switch pairs and tie another row of knots 5cm higher to create an open net cradle." },
            { step: 5, instruction: "Insert a flowerpot into the net, gather the cords at the top, and suspend from a ceiling hook." },
          ],
          safetyPrecautions: "Ensure top knot is securely tightened before placing fragile ceramic pots inside.",
          expectedResult: "A stylish suspended plant hanger tailored to your favorite houseplant.",
          environmentalBenefits: "Diverts clothing waste while creating handmade functional home decor.",
          limitations: "For indoor use; prolonged outdoor dampness may mold cotton fibers.",
          disposalMethod: "Untie or compost at end of life.",
        },
      ],
      isDemoSample: true,
      providerUsed: "mock (educational sample engine)",
    };
  }

  private getGlassSample(userCity?: string): WasteAnalysisResult {
    return {
      detectedItem: "Wide-Mouth Glass Food Jar with Metal Screw Lid",
      materialCategory: "glass",
      confidence: 0.96,
      isImageClear: true,
      itemCondition: "Clean, intact flint (clear) soda-lime glass jar with tinplate twist-off lid",
      uncertaintyNotes: "[Demonstration Engine] Synthetic sample blueprint. For real-time multimodal AI analysis of your specific photo, configure GEMINI_API_KEY in .env.",
      isReusable: true,
      isRepairable: false,
      isRecyclable: true,
      isCompostable: false,
      isUnsuitable: false,
      safetyConcerns: "Inspect rim and base for chips or hairline cracks before repurposing. Do not pour boiling liquids directly into cold glass to avoid thermal shock breakage.",
      environmentalImpact: {
        summary: "Glass is 100% endlessly recyclable and inert, but melting virgin silica requires temperatures exceeding 1,500°C. Reusing glass containers delivers instant energy conservation.",
        divertedGramsEstimate: "Approx. 220 - 320g soda-lime glass",
        transparentAssumptions: "Standard 350-500ml food preserves glass jar with lug lid.",
        qualitativeAdvantages: [
          "100% chemically non-reactive; zero plasticizer, BPA, or microplastic leaching into foods",
          "Airtight silicone gasket on metal lid preserves dried bulk goods indefinitely",
          "Glass can be sanitized with hot water and reused for decades without degrading",
        ],
        possibleDisadvantages: [
          "Heavy to transport compared to plastics",
          "Fragile if dropped on tile or concrete surfaces",
        ],
        comparisonMatrix: {
          reuseOrRepair: "Unmatched performance. Excellent for pantry storage, sourdough starter, or sewing kits.",
          diyTransformation: "Terrarium ecosystem, solar mason jar lantern, or pen holder.",
          formalRecycling: "Infinitely recyclable without loss of purity or quality in glass drop-off banks.",
          safeDisposal: "Never throw in trash if recycling or reuse is possible; glass takes over 1M years to break down in landfills.",
        },
        recommendedRoute: "reuse",
        recommendationRationale: "Glass containers are durable, airtight, food-safe, and visually transparent, making immediate pantry reuse superior to energy-intensive re-smelting.",
      },
      localRecyclingCaveats: userCity
        ? `In ${userCity}, glass bottles and jars are collected in designated glass bins or municipal bottle banks. Rinse clean and remove lids if required.`
        : "Curbside or bottle bank recycling is widely supported. Separate by color where regional facilities require.",
      transformationOptions: [
        {
          title: "Airtight Zero-Waste Bulk Pantry Storage Canister",
          shortExplanation: "Remove adhesive label and sterilize to create odor-free, moisture-proof bulk storage for oats, lentils, rice, or spices.",
          difficulty: "Easy",
          estimatedTime: "15 minutes",
          materialsTools: ["Glass jar with lid", "Warm water & baking soda (for label removal)", "Rubbing alcohol or dish soap"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Soak jar in warm water with 1 tbsp baking soda for 10 minutes; peel label off cleanly." },
            { step: 2, instruction: "Rub off any leftover adhesive gum with a drop of cooking oil or vinegar, then wash with dish soap." },
            { step: 3, instruction: "Allow to dry completely inside and out." },
            { step: 4, instruction: "Fill with dry pantry goods (quinoa, coffee beans, spices, or loose tea) and label with chalk pen or paper tape." },
          ],
          safetyPrecautions: "Do not expose cold glass to boiling water suddenly.",
          expectedResult: "A clean, airtight pantry container that looks beautiful and keeps pantry pests out.",
          environmentalBenefits: "Eliminates purchase of plastic pantry storage sets; enables zero-waste bulk-bin shopping.",
          limitations: "Not freezer-safe when filled with liquids (liquid expands and cracks glass).",
          disposalMethod: "When chipped or retired, place clean glass in municipal recycling.",
        },
        {
          title: "Self-Sustaining Moss & Fern Mini Terrarium",
          shortExplanation: "Layer pebbles, activated charcoal, soil, and small woodland mosses inside the jar to build a self-watering micro-ecosystem.",
          difficulty: "Medium",
          estimatedTime: "25 minutes",
          materialsTools: ["Clean glass jar", "Small drainage pebbles (2cm layer)", "Activated charcoal powder or granules", "Potting soil", "Small moss patch or miniature fern"],
          estimatedCost: "$0 - $3",
          stepByStep: [
            { step: 1, instruction: "Add a 2cm bottom layer of small gravel or pebbles for drainage." },
            { step: 2, instruction: "Add a thin sprinkle of activated charcoal to keep water fresh and filter odors." },
            { step: 3, instruction: "Add 3cm of potting soil and gently plant small gathered moss or tiny cuttings." },
            { step: 4, instruction: "Lightly mist with water (do not soak) and seal the lid tightly." },
            { step: 5, instruction: "Place in indirect sunlight; condensation will cycle inside indefinitely without watering for months." },
          ],
          safetyPrecautions: "Wipe glass exterior dry so hands do not slip.",
          expectedResult: "A charming living closed-loop desk garden that cycles water autonomously.",
          environmentalBenefits: "Brings nature indoors, educates on hydrological cycles, and repurposes discarded packaging.",
          limitations: "Keep away from intense direct sun which can overheat closed glass.",
          disposalMethod: "Return moss and soil to garden; recycle glass.",
        },
        {
          title: "Desk Stationery & Art Supply Organizer",
          shortExplanation: "Repurpose the wide-mouth jar as an upright organizer for paintbrushes, colored pencils, knitting needles, or kitchen utensils.",
          difficulty: "Easy",
          estimatedTime: "5 minutes",
          materialsTools: ["Glass jar", "Clean cloth"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Wash and dry the jar thoroughly." },
            { step: 2, instruction: "Store paintbrushes, calligraphy pens, or makeup brushes upright." },
            { step: 3, instruction: "Optional: Wrap twine or ribbon around the rim thread for a rustic aesthetic." },
          ],
          safetyPrecautions: "Ensure jar is placed on a stable flat surface.",
          expectedResult: "Heavy, stable desktop organizer that won't easily tip over.",
          environmentalBenefits: "Replaces acrylic or plastic desktop pen holders.",
          limitations: "Keep lid safe in a drawer in case you need it for storage later.",
          disposalMethod: "Recycle in curbside glass bin when finished.",
        },
      ],
      isDemoSample: true,
      providerUsed: "mock (educational sample engine)",
    };
  }

  private getOrganicSample(userCity?: string): WasteAnalysisResult {
    return {
      detectedItem: "Raw Kitchen Vegetable & Fruit Scraps (Peels, Ends, & Stems)",
      materialCategory: "organic",
      confidence: 0.94,
      isImageClear: true,
      itemCondition: "Fresh moist raw vegetable trimmings (carrot peels, onion skins, celery tops, herb stems)",
      uncertaintyNotes: "[Demonstration Engine] Synthetic sample blueprint. For real-time multimodal AI analysis of your specific photo, configure GEMINI_API_KEY in .env.",
      isReusable: true,
      isRepairable: false,
      isRecyclable: false,
      isCompostable: true,
      isUnsuitable: false,
      safetyConcerns: "Do not use moldy, slimy, or rotted scraps for food broth. Keep separate from raw meat or pet waste. Ensure compost bin maintains adequate airflow.",
      environmentalImpact: {
        summary: "Food waste rotting anaerobically in landfills generates methane (CH4), a greenhouse gas 28x more potent than CO2. Composting or simmering scraps keeps organic matter in circular biological cycles.",
        divertedGramsEstimate: "Approx. 200 - 350g moist biomass",
        transparentAssumptions: "Typical daily household preparation scraps for fresh root vegetables and alliums.",
        qualitativeAdvantages: [
          "Prevents potent anaerobic methane emissions in municipal landfill cells",
          "Returns nitrogen, phosphorus, and potassium directly into garden soils",
          "Extracts 100% of rich aromatic nutrients before final biological degradation",
        ],
        possibleDisadvantages: [
          "Perishable; must be frozen or processed within 3 days to avoid fruit flies",
          "Meat, dairy, and oils must not be added to standard backyard aerobic compost",
        ],
        comparisonMatrix: {
          reuseOrRepair: "Freeze clean scraps to brew rich, zero-cost culinary vegetable stock.",
          diyTransformation: "Citrus peel vinegar cleaner, or regrowing scallion/celery roots in water.",
          formalRecycling: "Municipal green bin / organic curbside collection where available.",
          safeDisposal: "Home vermicomposting, trench composting, or municipal anaerobic digester.",
        },
        recommendedRoute: "diy_transformation",
        recommendationRationale: "Clean allium and root vegetable scraps make outstanding rich mineral vegetable broth, after which the remaining solids can still be fully composted.",
      },
      localRecyclingCaveats: userCity
        ? `In ${userCity}, organic food scraps should go into municipal green organics carts. Do not bag in standard plastic.`
        : "Use municipal green bins or home compost. Avoid sending food waste to municipal landfills.",
      transformationOptions: [
        {
          title: "Golden Mineral Vegetable Broth Base",
          shortExplanation: "Collect clean trimmings in a freezer bag, then simmer for 45 minutes to extract restaurant-quality umami cooking broth.",
          difficulty: "Easy",
          estimatedTime: "45 minutes",
          materialsTools: ["Frozen clean vegetable scraps (onion skins, celery leaves, carrot tops, mushroom stems)", "Stock pot", "Water (1.5L)", "Colander / fine strainer"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Keep a sealed container in your freezer to accumulate daily clean vegetable cuttings until you have 4-5 cups." },
            { step: 2, instruction: "Transfer frozen scraps to a pot, cover with 1.5 liters of cold water, and add a bay leaf or peppercorns." },
            { step: 3, instruction: "Bring to a boil, then reduce heat to low and simmer covered for 45 minutes." },
            { step: 4, instruction: "Strain out and compost the spent solids. Pour golden broth into jars for soups, risotto, or rice cooking." },
          ],
          safetyPrecautions: "Avoid brassicas (cabbage, broccoli, Brussels sprouts) which can turn broth bitter.",
          expectedResult: "1.5 liters of deeply flavorful, nutrient-dense culinary vegetable stock.",
          environmentalBenefits: "Zero food waste; saves money on commercial boxed broths with sodium and preservatives.",
          limitations: "Refrigerate up to 5 days, or freeze in silicone trays for up to 6 months.",
          disposalMethod: "Spent strained cellulose goes directly into compost.",
        },
        {
          title: "Aerobic Compost Pile 'Green' Nitrogen Layer",
          shortExplanation: "Balance food scraps with carbon 'browns' (dry leaves or shredded cardboard) at a 1:2 ratio to produce dark humus in 8-12 weeks.",
          difficulty: "Easy",
          estimatedTime: "10 minutes",
          materialsTools: ["Vegetable scraps ('greens')", "Dry leaves or shredded cardboard ('browns')", "Compost bin or pile", "Garden fork"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Chop large scraps into 2-3cm pieces to accelerate microbial colonization." },
            { step: 2, instruction: "Add scraps to the compost bin, spreading them in a thin layer." },
            { step: 3, instruction: "Immediately cover with twice the volume of dry leaves, straw, or shredded unprinted cardboard." },
            { step: 4, instruction: "Turn the pile once weekly with a garden fork to introduce oxygen and prevent odors." },
          ],
          safetyPrecautions: "Always cover fresh food scraps with browns to prevent attracting flies or rodents.",
          expectedResult: "Rich, dark, earthy compost (humus) that revitalizes potted plants and garden beds.",
          environmentalBenefits: "Sequesters carbon into soil and completely eliminates methane emissions.",
          limitations: "Do not add dog/cat feces, dairy, or cooked grease.",
          disposalMethod: "Spread mature compost over lawn or vegetable garden.",
        },
        {
          title: "Regrowing Scallions & Celery Root Stubs",
          shortExplanation: "Place discarded root bases of green onions, leeks, or celery in shallow water on a sunny sill to grow fresh produce indefinitely.",
          difficulty: "Easy",
          estimatedTime: "5 minutes",
          materialsTools: ["Root ends of scallions or celery (3cm length)", "Shallow glass or dish", "Water", "Sunny windowsill"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "When cutting scallions, leave 3cm of the white root base intact." },
            { step: 2, instruction: "Stand roots upright in a small glass with 1cm of clean water covering the roots." },
            { step: 3, instruction: "Place on a bright windowsill and change the water every 2 days." },
            { step: 4, instruction: "Fresh green shoots will emerge within 48 hours and reach harvestable height in 7-10 days. Snip with scissors and let them regrow." },
          ],
          safetyPrecautions: "Change water regularly to keep roots fresh and clear of bacterial slime.",
          expectedResult: "A continuous indoor windowsill harvest of fresh organic green onions.",
          environmentalBenefits: "Cuts down grocery packaging, transport emissions, and food waste simultaneously.",
          limitations: "After 3-4 harvests in water, transplant into soil for full mineral nutrition.",
          disposalMethod: "Compost the root base when energy is exhausted.",
        },
      ],
      isDemoSample: true,
      providerUsed: "mock (educational sample engine)",
    };
  }

  private getAmbiguousSample(userCity?: string): WasteAnalysisResult {
    return {
      detectedItem: "Unidentified / Ambiguous Discard",
      materialCategory: "unknown",
      confidence: 0.35,
      isImageClear: false,
      unclearPromptNote: "Visual composition is ambiguous. Please provide a clear, well-lit photo showing the item's material texture, edges, or recycling code.",
      itemCondition: "Indeterminate from photo; lighting or angle obscures material classification",
      uncertaintyNotes: "[Demonstration Engine] The visual characteristics in this photo do not conclusively match known material patterns. Manual inspection of resin stamps (#1-#7) or material composition labels is recommended.",
      isReusable: false,
      isRepairable: false,
      isRecyclable: false,
      isCompostable: false,
      isUnsuitable: true,
      safetyConcerns: "Handle unknown waste with care. Do not touch sharp edges, unsealed chemicals, or biohazards without protective gloves.",
      environmentalImpact: {
        summary: "Accurately categorizing waste prevents recycling stream contamination. Mixed or ambiguous items sent to recycling bins can cause entire batches to be rejected and sent to landfills.",
        divertedGramsEstimate: "Pending accurate material classification",
        transparentAssumptions: "Classification requires visual identification of material substrate.",
        qualitativeAdvantages: [
          "Prevents batch contamination at municipal materials recovery facilities (MRFs)",
          "Avoids hazardous chemical exposure or improper composting",
        ],
        possibleDisadvantages: [
          "Requires manual user inspection of physical recycling stamps",
        ],
        comparisonMatrix: {
          reuseOrRepair: "Inspect physical durability. If intact and clean, seek local reuse.",
          diyTransformation: "Hold off until material composition (toxicity, heat tolerance) is confirmed.",
          formalRecycling: "Only place in blue/green bins if universal material symbols are visible.",
          safeDisposal: "If material remains unidentifiable, consult municipal hazardous waste guidelines.",
        },
        recommendedRoute: "safe_disposal",
        recommendationRationale: "Avoid wish-cycling. Confirm material code before sorting.",
      },
      localRecyclingCaveats: userCity
        ? `In ${userCity}, items without identifiable material numbers should not be placed in curbside recycling bins.`
        : "Most municipal recycling facilities reject unlabelled materials to protect sorting streams.",
      transformationOptions: [
        {
          title: "Material Identification & Resin Stamp Inspection",
          shortExplanation: "Locate embossed triangular chasing arrows or manufacturer stamps to verify true material composition.",
          difficulty: "Easy",
          estimatedTime: "5 minutes",
          materialsTools: ["Good lighting / flashlight", "Magnifying glass (optional)"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Examine the underside, rim, or seam of the object for embossed recycling numbers (1 through 7 for plastics, 20-22 for paper/cardboard, 70-72 for glass)." },
            { step: 2, instruction: "Check for fabric tags (e.g., 100% cotton vs polyester blend) on garments." },
            { step: 3, instruction: "Take a close-up photo of the stamp in bright lighting and re-scan in EcoHack for specific transformation instructions." },
          ],
          safetyPrecautions: "Do not touch unknown residues.",
          expectedResult: "Accurate material identification enabling safe recycling or upcycling.",
          environmentalBenefits: "Prevents contamination of municipal recycling streams.",
          limitations: "Some handmade or unbranded items may lack commercial stamps.",
          disposalMethod: "Sort according to identified material code once found.",
        },
        {
          title: "Multi-Material Disassembly & Separation",
          shortExplanation: "Dismantle composite items into homogeneous single-material components before recycling.",
          difficulty: "Medium",
          estimatedTime: "15 minutes",
          materialsTools: ["Work gloves", "Screwdriver or scissors"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Separate plastic film, metal fasteners, or tape from cardboard and containers." },
            { step: 2, instruction: "Rinse food residues from all hard surfaces." },
            { step: 3, instruction: "Group identical separated materials into dedicated bins." },
          ],
          safetyPrecautions: "Wear puncture-resistant gloves when detaching metal clips or glass.",
          expectedResult: "Separated, pure single-stream materials ready for transformation.",
          environmentalBenefits: "Pure single-stream materials have an 85%+ higher recycling success rate.",
          limitations: "Glued composite packaging cannot always be separated mechanically.",
          disposalMethod: "Place each separated piece into its appropriate recycling or compost stream.",
        },
        {
          title: "Municipal Sorting Guide & Drop-off Verification",
          shortExplanation: "Cross-reference ambiguous items with regional hazardous waste or specialized drop-off directories.",
          difficulty: "Easy",
          estimatedTime: "10 minutes",
          materialsTools: ["Smartphone / web browser"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Check your local municipal waste authority portal (search 'What Goes Where in [Your City]')." },
            { step: 2, instruction: "If item contains batteries, electronics, or chemical residues, locate the nearest household hazardous waste (HHW) depot." },
            { step: 3, instruction: "Avoid 'wish-cycling' in curbside bins if municipal acceptance is unconfirmed." },
          ],
          safetyPrecautions: "Store hazardous or unknown chemical containers sealed upright.",
          expectedResult: "Guaranteed compliant disposal without risking facility equipment or worker safety.",
          environmentalBenefits: "Keeps heavy metals and hazardous residues out of municipal landfills.",
          limitations: "Special drop-off sites may require scheduled appointments or transit.",
          disposalMethod: "Deliver to certified regional collection depot.",
        },
      ],
      isDemoSample: true,
      providerUsed: "mock (educational sample engine)",
    };
  }
}
