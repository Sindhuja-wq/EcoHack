import type { IWasteAnalysisProvider, WasteAnalysisResult } from "./types.ts";
import { buildSmartDisposalGuide } from "./smart-disposal-guide.ts";

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
    const item = "Polyethylene Terephthalate (PET #1) Beverage Bottle & Cap";
    return {
      detectedItem: item,
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
      recoveryStatus: "Reusable",
      smartDisposalGuide: buildSmartDisposalGuide("plastic", item, { isReusable: true, isRecyclable: true }),
      reusePossibilities: [
        "Sub-irrigation herb planter for kitchen windowsills",
        "Drip irrigation root stake for vegetable beds",
        "Funnel for pantry grains or automotive fluids",
      ],
      repairPossibilities: [
        "Reshape dented bottle sidewalls using warm water (under 60°C)",
        "Replace damaged screw cap with standard 28mm PCO thread cap",
      ],
      recyclingPossibilities: [
        "Curbside municipal recycling container (#1 PET code; keep cap attached)",
        "Bottle deposit return kiosk for immediate cash/token rebate",
      ],
      environmentalBenefits: [
        "Diverts 28-35g of virgin PET polymer from landfills",
        "Eliminates petrochemical extraction for equivalent new plastic pots",
        "Reduces household plant watering requirements by up to 50%",
      ],
      environmentalDisadvantages: [
        "PET degrades under continuous outdoor UV sunlight over 18-24 months",
        "Cannot withstand hot liquids above 60°C",
      ],
      confirmedRecycling: true,
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
          shortExplanation: "Invert the cut bottle top into the base with a wick to automatically hydrate plants via capillary action.",
          difficulty: "Easy",
          estimatedTime: "20 minutes",
          materialsTools: ["500ml or 1L plastic bottle", "Cotton string or shoelace (20cm)", "Utility knife or sturdy scissors", "Potting soil & herb seeds"],
          estimatedCost: "$0 - $2",
          stepByStep: [
            { step: 1, instruction: "Carefully cut the bottle in half horizontally about 10cm below the neck." },
            { step: 2, instruction: "Poke a small 4mm hole through the plastic screw cap using a heated metal skewer or drill." },
            { step: 3, instruction: "Thread the cotton string through the cap so 5cm hangs into the base reservoir." },
            { step: 4, instruction: "Invert the top funnel into the base, add potting soil, plant your herb, and fill the base with water." },
          ],
          safetyPrecautions: "Always cut away from your body on a firm cutting mat. Sand rough edges with fine sandpaper to prevent finger cuts.",
          expectedResult: "A self-regulating desktop planter that keeps soil moisture optimal for 7-10 days between refills.",
          environmentalBenefits: "Directly extends container lifecycle and eliminates demand for commercial injection-molded pots.",
          limitations: "Indoor or shaded outdoor use only; clear PET becomes brittle under direct hot UV sun after 18-24 months.",
          disposalMethod: "Rinse and place in curbside plastics bin (PET #1) when retiring the planter.",
        },
        {
          title: "Slow-Drip Garden Deep-Root Irrigation Stake",
          shortExplanation: "Perforate the lower half and bury alongside thirsty garden plants for zero-evaporation root watering.",
          difficulty: "Easy",
          estimatedTime: "10 minutes",
          materialsTools: ["Plastic bottle with cap", "Nail or pushpin", "Pliers and lighter or candle"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Using a heated pin, puncture 6-8 tiny pinholes along the lower third and bottom of the bottle." },
            { step: 2, instruction: "Dig a vertical hole 15cm deep adjacent to tomatoes, peppers, or squash plants." },
            { step: 3, instruction: "Insert the bottle neck-up, pack soil around it, and fill with water." },
            { step: 4, instruction: "Loosely screw on the cap to control drip rate and prevent mosquito entry." },
          ],
          safetyPrecautions: "Use pliers when heating pins. Avoid breathing plastic fumes.",
          expectedResult: "Targeted root-zone watering that reduces water consumption by up to 60% compared to surface spraying.",
          environmentalBenefits: "Drastically reduces evaporation loss during heatwaves and prevents fungal leaf diseases.",
          limitations: "Requires occasional flushing if soil sediment clogs tiny pinholes.",
          disposalMethod: "Rinse and place in curbside recycling at the end of the harvest season.",
        },
        {
          title: "Workshop Hardware & Screws Storage Canister",
          shortExplanation: "Transform two bottle bottoms into an interlocking, transparent container for nails, bolts, and craft beads.",
          difficulty: "Medium",
          estimatedTime: "25 minutes",
          materialsTools: ["Two identical plastic bottles", "Scissors", "Utility knife", "Sandpaper"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Cut the bottom 8cm off both identical bottles." },
            { step: 2, instruction: "Smooth the rim of both cups with sandpaper." },
            { step: 3, instruction: "Cut a 1cm vertical slit into one cup rim so it can compress slightly." },
            { step: 4, instruction: "Slide the compressed cup inside the other to create an airtight, drop-proof storage pod." },
          ],
          safetyPrecautions: "Ensure cut rims are completely sanded smooth before handling.",
          expectedResult: "Durable, transparent hardware organizer pods that stack neatly on workshop shelves.",
          environmentalBenefits: "Replaces commercial acrylic organizers made of non-recyclable composite resins.",
          limitations: "Store away from heat sources.",
          disposalMethod: "Rinse and place in curbside plastics bin when retiring.",
        },
      ],
      isDemoSample: true,
      providerUsed: "mock (educational sample engine)",
    };
  }

  private getCardboardSample(userCity?: string): WasteAnalysisResult {
    const item = "Corrugated Cardboard Shipping Box";
    return {
      detectedItem: item,
      materialCategory: "cardboard",
      confidence: 0.96,
      isImageClear: true,
      itemCondition: "Clean, dry unlaminated brown Kraft corrugated box with adhesive shipping label",
      uncertaintyNotes: "[Demonstration Engine] Synthetic sample blueprint for standard single-wall C-flute corrugated fiberboard.",
      isReusable: true,
      isRepairable: false,
      isRecyclable: true,
      isCompostable: true,
      isUnsuitable: false,
      safetyConcerns: "Wear work gloves when handling to avoid deep cardboard paper cuts. Ensure all plastic packaging tape is peeled before composting.",
      recoveryStatus: "Recyclable",
      smartDisposalGuide: buildSmartDisposalGuide("cardboard", item, { isCompostable: true, isRecyclable: true }),
      reusePossibilities: [
        "Sheet mulch weed barrier for garden beds and fruit tree rings",
        "Biodegradable seed starter pots that plant directly into soil",
        "Textured scratching pad for indoor cats",
      ],
      repairPossibilities: [
        "Reinforce crushed edges with paper water-activated tape",
        "Score and re-fold damaged flaps for smaller packaging needs",
      ],
      recyclingPossibilities: [
        "Curbside corrugated fiberboard recycling (flatten before binning)",
        "Industrial drop-off bale depot at local municipal transfer station",
      ],
      environmentalBenefits: [
        "Replaces synthetic plastic weed barriers and geotextiles",
        "Adds essential carbon/brown matter to soil organic microbial biology",
        "Diverts 220-300g of unbleached wood pulp from landfill methane generation",
      ],
      environmentalDisadvantages: [
        "Breaks down quickly if waterlogged in wet storage",
        "Tape and synthetic adhesives must be mechanically stripped before composting",
      ],
      confirmedRecycling: true,
      environmentalImpact: {
        summary: "Repurposing or composting corrugated cardboard diverts substantial bulk fiber volume from municipal landfills, sequestering organic carbon directly in garden soil.",
        divertedGramsEstimate: "Approx. 220 - 310g unbleached Kraft wood pulp",
        transparentAssumptions: "Standard corrugated single-wall shipping box dimensions (approx. 30x20x15cm).",
        qualitativeAdvantages: [
          "Zero-carbon alternative to petrochemical plastic weed barrier geotextiles",
          "Attracts beneficial earthworms and mycorrhizal fungal networks in garden soil",
          "Recyclable up to 7 times before wood fibers become too short for papermaking",
        ],
        possibleDisadvantages: [
          "Plastic packaging tape and wax coatings must be manually stripped prior to composting",
          "Decomposition consumes available soil nitrogen if not balanced with compost greens",
        ],
        comparisonMatrix: {
          reuseOrRepair: "Excellent for storage, moving, or workshop drawer division.",
          diyTransformation: "Best for garden sheet mulching (lasagna gardening) or cat scratching boards.",
          formalRecycling: "Highly efficient. Flatten and place in curbside paper/cardboard bin.",
          safeDisposal: "Compostable if unprinted/uncoated; curbside recycle otherwise.",
        },
        recommendedRoute: "diy_transformation",
        recommendationRationale: "Clean unprinted corrugated cardboard is ideal for garden weed suppression, building organic humus while eliminating plastic weed-barrier fabrics.",
      },
      localRecyclingCaveats: userCity
        ? `In ${userCity}, cardboard must be flattened and free of oily food residues before placing in curbside paper/cardboard bins.`
        : "Cardboard is widely recyclable globally. Remove heavy packing tape and flatten completely.",
      transformationOptions: [
        {
          title: "Garden Sheet Mulch Weed Barrier (Lasagna Gardening)",
          shortExplanation: "Lay flattened unprinted cardboard over weed patches to suppress unwanted growth and build rich microbial topsoil.",
          difficulty: "Easy",
          estimatedTime: "15 minutes",
          materialsTools: ["Corrugated cardboard box", "Garden hose / water bucket", "Organic mulch, compost, or woodchips", "Utility knife to strip tape"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Peel all plastic shipping tape, stickers, and metal staples from the cardboard." },
            { step: 2, instruction: "Mow or flatten weeds over the targeted garden bed." },
            { step: 3, instruction: "Lay cardboard sheets overlapping by at least 15cm to prevent weeds from sneaking between cracks." },
            { step: 4, instruction: "Thoroughly soak the cardboard with water until damp and heavy." },
            { step: 5, instruction: "Top immediately with 5-8cm of organic compost, shredded leaves, or wood chips." },
          ],
          safetyPrecautions: "Remove all glossy plastic tape and check for hidden staples that could puncture garden gloves.",
          expectedResult: "Complete weed suppression for an entire season without herbicides, breaking down into rich soil humus.",
          environmentalBenefits: "Eliminates petrochemical weed-barrier fabrics and sequesters carbon directly in domestic garden soil.",
          limitations: "Do not use cardboard with heavy synthetic wax coating or colored glossy inks.",
          disposalMethod: "Natural decomposition into rich humus; zero waste remaining.",
        },
        {
          title: "Biodegradable Nursery Seed-Starting Pots",
          shortExplanation: "Fold cardboard into small square planters that can be planted directly into garden soil when seedlings mature.",
          difficulty: "Easy",
          estimatedTime: "20 minutes",
          materialsTools: ["Cardboard box", "Ruler", "Scissors or craft knife", "Potting soil & seeds"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Cut cardboard into 12x12cm squares." },
            { step: 2, instruction: "Score lines 3cm in from each edge with a dull butter knife to make clean folds." },
            { step: 3, instruction: "Cut corner slits, fold sides upright, and tuck flaps into a small open-top cube." },
            { step: 4, instruction: "Fill with seed-starting mix, plant seeds, and keep moist on a drainage tray." },
          ],
          safetyPrecautions: "Use scissors carefully when cutting through thick corrugated layers.",
          expectedResult: "Sturdy seed pots that prevent root shock because seedlings are planted whole into the ground.",
          environmentalBenefits: "Eliminates single-use plastic nursery seedling trays and peat moss extraction.",
          limitations: "Pots will begin softening after 3-4 weeks of continuous daily watering.",
          disposalMethod: "Planted directly into garden soil where it naturally biodegrades.",
        },
        {
          title: "Textured Heavy-Duty Cat Scratching Pad",
          shortExplanation: "Cut cardboard into uniform 6cm strips, coil tightly into a disc or glue into a block to create an irresistible feline scratcher.",
          difficulty: "Medium",
          estimatedTime: "30 minutes",
          materialsTools: ["Cardboard shipping boxes", "Ruler & pencil", "Heavy utility knife", "Non-toxic PVA or flour paste glue"],
          estimatedCost: "$0 - $1",
          stepByStep: [
            { step: 1, instruction: "Mark out 6cm wide strips along the corrugation ridges of your box." },
            { step: 2, instruction: "Cut 15-20 strips with exposed honeycomb edges facing upward." },
            { step: 3, instruction: "Roll the first strip into a tight coil, gluing the tip with non-toxic glue." },
            { step: 4, instruction: "Add consecutive strips tightly wrapped around the core until reaching a 25cm diameter disc." },
            { step: 5, instruction: "Secure perimeter with twine or a shallow cardboard box base until dry." },
          ],
          safetyPrecautions: "Always cut along a metal straight-edge on a safe cutting mat. Use non-toxic water-based glue safe for pets.",
          expectedResult: "A resilient cat scratcher that lasts 6-12 months and saves furniture from claw marks.",
          environmentalBenefits: "Replaces commercial plastic cat toys and disposable scratchers shipped in plastic packaging.",
          limitations: "Produces small cardboard bits as claws shed outer sheaths (easy to vacuum or sweep into compost).",
          disposalMethod: "When shredded by cat claws, compost or recycle the worn remnants.",
        },
      ],
      isDemoSample: true,
      providerUsed: "mock (educational sample engine)",
    };
  }

  private getFabricSample(userCity?: string): WasteAnalysisResult {
    const item = "100% Worn Denim Cotton Fabric / Apparel";
    return {
      detectedItem: item,
      materialCategory: "fabric",
      confidence: 0.91,
      isImageClear: true,
      itemCondition: "Frayed denim fabric with torn knee seam; natural blue indigo dye",
      uncertaintyNotes: "[Demonstration Engine] Synthetic sample blueprint for standard 12-14oz cotton twill denim textile.",
      isReusable: true,
      isRepairable: true,
      isRecyclable: false,
      isCompostable: false,
      isUnsuitable: false,
      safetyConcerns: "Wash fabric before crafting. Exercise care with heavy fabric shears and sewing needles.",
      recoveryStatus: "Repairable",
      smartDisposalGuide: buildSmartDisposalGuide("fabric", item, { isRepairable: true, isReusable: true }),
      reusePossibilities: [
        "Heavy-duty no-sew braided market tote bag",
        "Washable lint-free workshop shop rags",
        "Macramé indoor hanging plant holder",
      ],
      repairPossibilities: [
        "Japanese Sashiko decorative visible mending over tear",
        "Iron-on denim patch reinforcement on high-friction inner thigh seams",
      ],
      recyclingPossibilities: [
        "Dedicated textile recycling deposit bank (never curbside paper/plastic bin)",
        "Charity clothing donation for fiber shredding into acoustic insulation",
      ],
      environmentalBenefits: [
        "Offsets up to 20,000 liters of water required to produce 1kg of virgin denim",
        "Prevents synthetic dye leaching and microfiber contamination in municipal landfills",
        "Eliminates purchase of plastic reusable shopping bags",
      ],
      environmentalDisadvantages: [
        "Mixed elastane/spandex denim blends cannot be cleanly composted",
        "Curbside municipal recycling cannot handle textiles without sorting jam",
      ],
      confirmedRecycling: false,
      environmentalImpact: {
        summary: "Repurposing worn cotton textiles saves thousands of liters of embodied agricultural water and diverts non-biodegradable synthetic threads from landfill decomposition.",
        divertedGramsEstimate: "Approx. 400 - 550g heavyweight cotton twill",
        transparentAssumptions: "Standard adult denim jeans weight and textile lifecycle data (UNEP Textile Assessment).",
        qualitativeAdvantages: [
          "Bypasses the water-intensive cotton farming footprint (up to 10,000L per pair of jeans)",
          "Dense denim weave provides extreme durability lasting 5-10 additional years",
          "Replaces disposable synthetic paper towels and microfiber wipes",
        ],
        possibleDisadvantages: [
          "Denim blended with elastane/spandex is difficult to recycle mechanically",
          "Requires basic cutting tools and scissors",
        ],
        comparisonMatrix: {
          reuseOrRepair: "Top recommendation. Visible mending (Sashiko) or transforming into totes retains maximum textile value.",
          diyTransformation: "Ideal for grocery bags, shop rags, potholders, and plant hangers.",
          formalRecycling: "Textiles must NEVER be placed in curbside recycling bins. Use dedicated clothing donation bins.",
          safeDisposal: "100% pure untreated cotton can be shredded into home compost bins.",
        },
        recommendedRoute: "repair",
        recommendationRationale: "Denim possesses extraordinary structural strength; repairing tears or converting legs into market bags gives another decade of utility.",
      },
      localRecyclingCaveats: userCity
        ? `In ${userCity}, textiles must not be placed in curbside dry recycling bins. Use dedicated textile drop-off banks or charity donation centers.`
        : "Textiles jam sorting machinery in municipal MRFs. Use dedicated clothing drop-off bins.",
      transformationOptions: [
        {
          title: "No-Sew Durable Market Produce & Grocery Bag",
          shortExplanation: "Transform the top half of worn jeans into a heavy-duty tote bag using simple scissor cuts and bottom knots.",
          difficulty: "Easy",
          estimatedTime: "20 minutes",
          materialsTools: ["Pair of worn jeans", "Fabric scissors or sharp kitchen shears"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Cut off both pant legs straight across right below the crotch seam." },
            { step: 2, instruction: "Turn the jeans inside out and cut 10cm vertical slits along the bottom leg openings spaced 2cm apart." },
            { step: 3, instruction: "Firmly tie matching front and back strips together in tight double knots to seal the bag bottom." },
            { step: 4, instruction: "Turn right-side out; use the waistband and belt loops as heavy-duty handles." },
          ],
          safetyPrecautions: "Use sharp fabric shears with clean cutting motions to prevent hand fatigue.",
          expectedResult: "A rugged reusable tote that can effortlessly carry 15kg+ of groceries without tearing.",
          environmentalBenefits: "Replaces dozens of single-use plastic grocery bags over years of shopping.",
          limitations: "Wash in cold water to prevent indigo dye bleeding onto light fabrics.",
          disposalMethod: "When worn out after years of shopping, cut into shop rags.",
        },
        {
          title: "Heavy-Duty Workshop & Garage Shop Rags",
          shortExplanation: "Cut denim pant legs into uniform squares for indestructible, washable workshop grease wipers.",
          difficulty: "Easy",
          estimatedTime: "10 minutes",
          materialsTools: ["Denim pant legs", "Fabric scissors", "Ruler"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Slit open pant leg seams to lay the denim fabric flat." },
            { step: 2, instruction: "Cut into 20x20cm squares." },
            { step: 3, instruction: "Stack in garage or workshop for wiping bike chains, engine oil, and paint spills." },
          ],
          safetyPrecautions: "Do not machine-wash rags saturated with flammable solvents or oils.",
          expectedResult: "10-15 virtually indestructible cleaning rags that withstand vigorous scrubbing.",
          environmentalBenefits: "Eliminates purchase of single-use paper towels and synthetic shop wipes.",
          limitations: "Not as absorbent as terrycloth towels for light water spills, but excels on oil and grease.",
          disposalMethod: "Wash and reuse 100+ times; compost if 100% cotton without chemical cleaner residues.",
        },
        {
          title: "Braided Macramé Hanging Plant Holder",
          shortExplanation: "Cut fabric into strips, braid together, and knot a secure cradle for indoor potted plants.",
          difficulty: "Medium",
          estimatedTime: "35 minutes",
          materialsTools: ["Denim fabric strips (8 strips of 1.2m)", "Scissors", "Plant pot", "Keyring or metal loop"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Cut eight 2cm-wide strips of denim, each roughly 1.2 meters long." },
            { step: 2, instruction: "Thread all 8 strips halfway through the metal ring and tie a master knot at the top." },
            { step: 3, instruction: "Divide strips into 4 pairs. Tie a simple knot in each pair 30cm down." },
            { step: 4, instruction: "Take one string from adjacent pairs and knot them together 10cm further down to create a net." },
            { step: 5, instruction: "Gather all 8 strings at the bottom and tie one large, secure gathering knot under the pot base." },
          ],
          safetyPrecautions: "Test weight capacity over a soft cushion before hanging over furniture.",
          expectedResult: "A bohemian hanging planter cradle that suspends potted plants from ceilings or curtain rods.",
          environmentalBenefits: "Replaces commercial synthetic polyester plant hangers shipped overseas.",
          limitations: "Keep indoors or under covered patios away from sustained rainfall.",
          disposalMethod: "Untie or compost at end of life.",
        },
      ],
      isDemoSample: true,
      providerUsed: "mock (educational sample engine)",
    };
  }

  private getGlassSample(userCity?: string): WasteAnalysisResult {
    const item = "Clear Flint Glass Food / Jam Jar with Metal Lid";
    return {
      detectedItem: item,
      materialCategory: "glass",
      confidence: 0.97,
      isImageClear: true,
      itemCondition: "Clean, intact 400ml clear flint glass jar with threaded metal twist cap",
      uncertaintyNotes: "[Demonstration Engine] Synthetic sample blueprint for soda-lime container glass.",
      isReusable: true,
      isRepairable: false,
      isRecyclable: true,
      isCompostable: false,
      isUnsuitable: false,
      safetyConcerns: "Inspect rim for micro-chips before handling. Never pour boiling liquid directly into cold glass jars to avoid thermal shock breakage.",
      recoveryStatus: "Reusable",
      smartDisposalGuide: buildSmartDisposalGuide("glass", item, { isReusable: true, isRecyclable: true }),
      reusePossibilities: [
        "Airtight pantry dry-goods canister for rice, beans, or tea",
        "Closed desktop biosphere terrarium for moss and ferns",
        "Workshop hardware organizer mounted under shelving",
      ],
      repairPossibilities: [
        "Replace damaged lid gasket with food-safe silicone canning ring",
        "Sterilize in boiling water to restore food-safe storage grade",
      ],
      recyclingPossibilities: [
        "Curbside municipal container glass recycling bin",
        "Municipal bottle bank sorting by clear/amber/green glass",
      ],
      environmentalBenefits: [
        "100% infinitely recyclable without quality or purity degradation",
        "Zero chemical leaching into stored foods (unlike many plastics)",
        "Diverts 240-300g of silicate packaging from landfills",
      ],
      environmentalDisadvantages: [
        "High transport weight increases vehicle freight fuel usage",
        "Brittle; broken shards present puncture hazards to waste handlers",
      ],
      confirmedRecycling: true,
      environmentalImpact: {
        summary: "Glass is 100% infinitely recyclable without loss of purity or structural integrity. Reusing jars eliminates energy-intensive smelting furnaces completely.",
        divertedGramsEstimate: "Approx. 240 - 290g container glass",
        transparentAssumptions: "Standard 375-450ml commercial salsa/jam jar weight.",
        qualitativeAdvantages: [
          "Zero chemical leaching into stored food (completely inert)",
          "Airtight seal protects spices and bulk dry goods from pantry pests",
          "Can be sterilized and reused hundreds of times",
        ],
        possibleDisadvantages: [
          "Vulnerable to thermal shock if sudden boiling water is introduced",
          "Heavier than plastic equivalents when transporting",
        ],
        comparisonMatrix: {
          reuseOrRepair: "Prime candidate. Clean glass jars with intact lids are premier food storage vessels.",
          diyTransformation: "Superb for desk terrariums, candle holders, and magnetic spice organizers.",
          formalRecycling: "Infinitely recyclable. Rinse and sort into glass stream or curbside bin.",
          safeDisposal: "Never throw in trash if recycling or reuse is possible; glass takes over 1M years to break down in landfills.",
        },
        recommendedRoute: "reuse",
        recommendationRationale: "Flint glass is chemically inert and completely food-safe; immediate pantry reuse eliminates plastic container purchases.",
      },
      localRecyclingCaveats: userCity
        ? `In ${userCity}, glass bottles and jars are collected in designated glass bins or municipal bottle banks. Rinse clean and remove lids if required.`
        : "Glass is universally recyclable in municipal bottle banks or curbside bins.",
      transformationOptions: [
        {
          title: "Airtight Pantry Dry-Goods Storage Canister",
          shortExplanation: "Sterilize and label to create pest-proof pantry storage for grains, seeds, dried herbs, and spices.",
          difficulty: "Easy",
          estimatedTime: "15 minutes",
          materialsTools: ["Glass jar with metal lid", "Warm soapy water", "Baking soda / vinegar (for label glue removal)", "Chalkboard label or marker"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Soak the jar in warm soapy water with 1 tbsp baking soda for 15 minutes to soften adhesive." },
            { step: 2, instruction: "Peel label clean and rub away glue residues with vinegar or cooking oil." },
            { step: 3, instruction: "Wash with dish soap, rinse with hot water, and air dry completely." },
            { step: 4, instruction: "Fill with bulk oats, rice, lentils, or loose-leaf tea, and label with contents and expiration date." },
          ],
          safetyPrecautions: "Do not shock hot glass with ice-cold water to avoid cracking.",
          expectedResult: "Airtight, insect-proof dry goods storage that looks uniform and beautiful on kitchen shelves.",
          environmentalBenefits: "Eliminates single-use plastic zip bags and commercial plastic food storage containers.",
          limitations: "Keep away from edge of high counters where children might knock it down.",
          disposalMethod: "When chipped or retired, place clean glass in municipal recycling.",
        },
        {
          title: "Self-Sustaining Desktop Moss Terrarium",
          shortExplanation: "Build a miniature closed water-cycle ecosystem with gravel, activated charcoal, soil, and wild moss.",
          difficulty: "Medium",
          estimatedTime: "30 minutes",
          materialsTools: ["Glass jar with lid", "Small gravel or aquarium pebbles (2cm)", "Activated charcoal (1 tsp)", "Potting soil (3cm)", "Wild moss or small fittonia plant", "Spray bottle"],
          estimatedCost: "$0 - $3",
          stepByStep: [
            { step: 1, instruction: "Add a 2cm layer of clean pebbles at the bottom for drainage." },
            { step: 2, instruction: "Sprinkle a thin layer of activated charcoal to prevent fungal growth and odors." },
            { step: 3, instruction: "Add 3-4cm of damp potting soil." },
            { step: 4, instruction: "Plant living moss cushion and miniature ferns with tweezers." },
            { step: 5, instruction: "Mist lightly with water, wipe inner walls clean, and screw the lid on tightly." },
          ],
          safetyPrecautions: "Do not overwater; the internal closed cycle recycles humidity naturally.",
          expectedResult: "A self-sustaining micro-rainforest that thrives for months on natural diffuse daylight without frequent watering.",
          environmentalBenefits: "Connects indoor workspaces with living biodiversity without purchasing plastic synthetic decorations.",
          limitations: "Keep away from direct scorch sunlight which overheats the glass chamber.",
          disposalMethod: "Return moss and soil to garden; recycle glass.",
        },
        {
          title: "Under-Shelf Screws & Nails Workshop Organizer",
          shortExplanation: "Screw the jar lid to the underside of a wooden shelf, creating a quick-twist floating hardware dispenser.",
          difficulty: "Easy",
          estimatedTime: "15 minutes",
          materialsTools: ["Glass jar with metal lid", "2 short wood screws (12mm)", "Screwdriver or cordless drill", "Hammer & small nail"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Puncture two holes 2cm apart through the metal jar lid using a hammer and small nail." },
            { step: 2, instruction: "Position the lid on the underside of a wooden garage or workshop shelf." },
            { step: 3, instruction: "Drive the two short screws through the lid holes into the shelf bottom." },
            { step: 4, instruction: "Fill the jar with nails, washers, or screws, and screw the jar into the mounted lid." },
          ],
          safetyPrecautions: "Ensure screws do not poke through the top surface of the shelf. Do not over-tighten.",
          expectedResult: "Space-saving suspended storage that keeps workbench surfaces 100% clutter-free.",
          environmentalBenefits: "Eliminates purchase of plastic organizer drawers and repurposes sturdy metal caps.",
          limitations: "Twist gently when opening so jar doesn't slip from greasy hands.",
          disposalMethod: "Recycle in curbside glass bin when finished.",
        },
      ],
      isDemoSample: true,
      providerUsed: "mock (educational sample engine)",
    };
  }

  private getOrganicSample(userCity?: string): WasteAnalysisResult {
    const item = "Kitchen Vegetable & Fruit Scraps (Food Waste)";
    return {
      detectedItem: item,
      materialCategory: "organic",
      confidence: 0.95,
      isImageClear: true,
      itemCondition: "Fresh, unseasoned raw vegetable trimmings, onion skins, carrot peels, and coffee grounds",
      uncertaintyNotes: "[Demonstration Engine] Synthetic sample blueprint for non-meat, non-dairy plant-based organic discard.",
      isReusable: true,
      isRepairable: false,
      isRecyclable: false,
      isCompostable: true,
      isUnsuitable: false,
      safetyConcerns: "Do not include moldy bread, pet feces, or meat bones in indoor composters to prevent odor, bacteria, and pests.",
      recoveryStatus: "Reusable",
      smartDisposalGuide: buildSmartDisposalGuide("organic", item, { isCompostable: true }),
      reusePossibilities: [
        "Simmer into rich golden vegetable broth stock",
        "Regrow scallions, celery, or garlic greens in water",
        "High-nitrogen compost pile activator",
      ],
      repairPossibilities: [
        "Not applicable for organic matter (biological recovery through composting)",
      ],
      recyclingPossibilities: [
        "Aerobic home vermicomposting (worm bin)",
        "Municipal green organics cart for industrial composting",
      ],
      environmentalBenefits: [
        "Prevents methane generation in anaerobic landfill environments (methane is 28x more potent than CO2)",
        "Enriches garden topsoil with slow-release organic nitrogen, potassium, and phosphorus",
        "Diverts 350-500g of biodegradable food matter per kitchen meal prep",
      ],
      environmentalDisadvantages: [
        "Improper aeration can cause localized odor if compost browns (carbon) are omitted",
      ],
      confirmedRecycling: true,
      environmentalImpact: {
        summary: "Diverting kitchen scraps from landfills eliminates methane generation (a greenhouse gas 28x more potent than CO2) and restores depleted organic topsoil.",
        divertedGramsEstimate: "Approx. 350 - 500g wet organic matter",
        transparentAssumptions: "Average EPA household organic discard yield per preparation session.",
        qualitativeAdvantages: [
          "Eliminates anaerobic methane generation in municipal landfills",
          "Produces nutrient-rich bio-fertilizer with zero synthetic chemical runoff",
          "Stimulates microbial soil life and water retention in home gardens",
        ],
        possibleDisadvantages: [
          "Indoor compost without adequate carbon browns can generate fruit flies if unattended",
        ],
        comparisonMatrix: {
          reuseOrRepair: "Simmer fresh trimmings into vegetable broth before composting the spent fiber.",
          diyTransformation: "Best for indoor worm composting (vermicompost) or trench composting.",
          formalRecycling: "Place in municipal green organics bin. Do not bag in conventional plastic.",
          safeDisposal: "Home vermicomposting, trench composting, or municipal anaerobic digester.",
        },
        recommendedRoute: "reuse",
        recommendationRationale: "Extract culinary flavor by boiling clean peelings into rich broth, then compost the spent pulp for 100% zero-waste circular utilization.",
      },
      localRecyclingCaveats: userCity
        ? `In ${userCity}, organic food scraps should go into municipal green organics carts. Do not bag in standard plastic.`
        : "Compost or place in municipal green organics collection. Never bag in conventional plastic.",
      transformationOptions: [
        {
          title: "Golden Freezer-Scrap Vegetable Broth Stock",
          shortExplanation: "Freeze carrot ends, celery leaves, onion skins, and mushroom stems, then simmer into a flavorful soup base.",
          difficulty: "Easy",
          estimatedTime: "45 minutes",
          materialsTools: ["Freezer container/bag", "Carrot tops, onion skins, herb stems, leeks", "Large stockpot & water", "Fine mesh strainer"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Rinse dirt from vegetable trimmings and store in a designated freezer container until full." },
            { step: 2, instruction: "Dump frozen scraps into a large stockpot, cover with 2.5 liters of cold water, and add bay leaf and peppercorns." },
            { step: 3, instruction: "Bring to a boil, then reduce heat and simmer gently for 45 minutes until deep amber in color." },
            { step: 4, instruction: "Strain out spent solids and pour liquid broth into mason jars for soups, stews, and risottos." },
          ],
          safetyPrecautions: "Avoid brassicas (broccoli, cauliflower, cabbage) in large quantities as they can make broth bitter.",
          expectedResult: "2 liters of rich, preservative-free aromatic vegetable stock worth $6-8 at organic markets.",
          environmentalBenefits: "Extracts 100% of culinary nutrition from food prep discards before composting.",
          limitations: "Keep strained liquid refrigerated for up to 5 days or freeze for up to 6 months.",
          disposalMethod: "Spent strained cellulose goes directly into compost.",
        },
        {
          title: "Trench Composting & Direct Soil Nutrition Burial",
          shortExplanation: "Bury food scraps directly between garden rows 25cm deep for odorless, zero-maintenance underground decomposition.",
          difficulty: "Easy",
          estimatedTime: "10 minutes",
          materialsTools: ["Garden spade or trowel", "Vegetable scraps / coffee grounds", "Water"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Chop food scraps into small 2cm chunks to accelerate microbial surface breakdown." },
            { step: 2, instruction: "Dig a narrow trench 25-30cm deep between garden beds or around fruit tree drip lines." },
            { step: 3, instruction: "Scatter scraps in a 5cm layer, dampen with water, and backfill with soil, packing down firmly." },
          ],
          safetyPrecautions: "Bury at least 25cm deep to ensure urban wildlife or domestic dogs cannot smell or excavate the scraps.",
          expectedResult: "Nutrient-rich sub-surface worm buffet that feeds plant roots directly without building an above-ground compost bin.",
          environmentalBenefits: "Zero methane emissions; builds subterranean organic carbon sponge in dry soil.",
          limitations: "Do not bury meat, grease, dairy, or bones.",
          disposalMethod: "Spread mature compost over lawn or vegetable garden.",
        },
        {
          title: "Kitchen Counter Scallion & Celery Water Regrowth",
          shortExplanation: "Submerge the root bases of green onions or celery in shallow water to regenerate fresh harvests on your windowsill.",
          difficulty: "Easy",
          estimatedTime: "5 minutes",
          materialsTools: ["Scallion root bottoms (3cm) or celery base", "Shallow saucer or shot glass", "Fresh tap water"],
          estimatedCost: "$0",
          stepByStep: [
            { step: 1, instruction: "Leave 3cm of the pale root base intact when chopping scallions for cooking." },
            { step: 2, instruction: "Stand the root bases upright in a shot glass with 1cm of water covering roots." },
            { step: 3, instruction: "Place on a sunny windowsill and refresh the water every 2 days." },
            { step: 4, instruction: "Snip fresh green shoots with scissors as they grow over the next 2-3 weeks." },
          ],
          safetyPrecautions: "Change water regularly to keep roots healthy and free of stagnation.",
          expectedResult: "Continuous fresh green onion harvests from kitchen scraps without purchasing seeds or soil.",
          environmentalBenefits: "Reduces grocery plastic packaging and minimizes food transportation footprint.",
          limitations: "Can be regrown 3-4 cycles in water before soil planting is required for mineral replenishment.",
          disposalMethod: "Compost the root base when energy is exhausted.",
        },
      ],
      isDemoSample: true,
      providerUsed: "mock (educational sample engine)",
    };
  }

  private getAmbiguousSample(userCity?: string): WasteAnalysisResult {
    const item = "Unidentified / Ambiguous Discard";
    return {
      detectedItem: item,
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
      recoveryStatus: "No Safe Recovery Option Identified",
      smartDisposalGuide: buildSmartDisposalGuide("unknown", item, { isImageClear: false, confidence: 0.35 }),
      reusePossibilities: [
        "Hold off on immediate reuse until material purity and toxicity are verified",
        "Inspect container for embossed resin code or manufacturer stamps",
      ],
      repairPossibilities: [
        "Check manufacturer documentation or repair manual if equipment is electronic or mechanical",
      ],
      recyclingPossibilities: [
        "Do not place in curbside recycling without verified resin code or universal recycling symbol",
        "Consult regional municipal waste lookup ('What Goes Where') portal",
      ],
      environmentalBenefits: [
        "Prevents municipal recycling contamination ('wish-cycling')",
        "Ensures potentially hazardous materials are directed to specialized treatment facilities",
      ],
      environmentalDisadvantages: [
        "Unidentified mixed items are typically relegated to residual waste unless disassembled",
      ],
      confirmedRecycling: false,
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
