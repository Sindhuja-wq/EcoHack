import type { SmartDisposalGuideDTO, RecoveryStatus } from "./types.ts";

/**
 * Generates verified category-specific safe disposal instructions and recovery status
 * adhering strictly to the Smart Waste Disposal Guide protocol.
 *
 * Rules:
 * - Never invent local facility names, addresses, or phone numbers.
 * - Always explain that local municipal regulations and facility capabilities may vary.
 * - Clearly distinguish between confirmed recycling and suggestions requiring verification.
 * - For hazardous items (batteries, chemicals, medical waste, e-waste), provide explicit safety warnings.
 * - If no safe recovery option exists, provide the appropriate residual route.
 */
export function buildSmartDisposalGuide(
  materialCategory: string,
  detectedItem: string,
  options?: {
    isReusable?: boolean;
    isRepairable?: boolean;
    isRecyclable?: boolean;
    isCompostable?: boolean;
    isImageClear?: boolean;
    confidence?: number;
    specificNotes?: string;
  }
): SmartDisposalGuideDTO {
  const itemLower = detectedItem.toLowerCase();
  const cat = materialCategory.toLowerCase();
  const isClear = options?.isImageClear ?? true;
  const conf = options?.confidence ?? 0.85;

  // 1. Batteries / Battery detection
  if (
    itemLower.includes("battery") ||
    itemLower.includes("batteries") ||
    itemLower.includes("accumulator") ||
    itemLower.includes("lithium") ||
    itemLower.includes("alkaline")
  ) {
    return {
      categoryTitle: "Batteries & Energy Storage (Hazardous)",
      recoveryStatus: "Special Disposal Required",
      primaryGuidance:
        "Batteries require designated hazardous-waste drop-off. Never discard in ordinary household trash or standard curbside recycling bins.",
      safeDisposalSteps: [
        "Tape both terminals (+ and - ends) with clear tape or electrical tape to prevent friction sparks and short-circuits during transport.",
        "Store in a cool, dry, non-conductive plastic or cardboard container away from metal objects.",
        "Deliver to an authorized battery collection drop-box (commonly situated at municipal depots, electronics retailers, or hardware stores).",
      ],
      safetyWarnings: [
        "CRITICAL FIRE HAZARD: Compacted or punctured lithium and alkaline batteries cause severe fires in municipal collection trucks and sorting facilities.",
        "Do not puncture, crush, incinerate, or attempt to disassemble battery cells.",
      ],
      municipalDiscretionNote:
        "Municipal battery collection policies differ by region. Check your local municipal authority's hazardous waste schedule for authorized collection points.",
      residualDisposalRoute:
        "Certified hazardous-materials reclamation center for pyro-metallurgical and hydrometallurgical heavy-metal extraction.",
      requiresSpecialHandling: true,
    };
  }

  // 2. Medical Waste / Sharps / Pharmaceuticals
  if (
    cat === "medical" ||
    itemLower.includes("syringe") ||
    itemLower.includes("needle") ||
    itemLower.includes("lancet") ||
    itemLower.includes("medicine") ||
    itemLower.includes("pharmaceutical") ||
    itemLower.includes("pill") ||
    itemLower.includes("blister") ||
    itemLower.includes("iv bag") ||
    itemLower.includes("bandage")
  ) {
    return {
      categoryTitle: "Biomedical & Healthcare Waste (Biohazard)",
      recoveryStatus: "Special Disposal Required",
      primaryGuidance:
        "Biomedical waste and pharmaceuticals must be routed through authorized clinical drop-off channels. Never dispose of needles, medication, or clinical waste in household bins.",
      safeDisposalSteps: [
        "Place sharps (needles, lancets) immediately into an approved, puncture-resistant biohazard container or rigid heavy-plastic jug with a sealed lid.",
        "Return unused or expired medications to an authorized pharmacy take-back program or hospital medicine disposal kiosk.",
        "Never flush medicines down the toilet or pour liquids into household sinks, which pollutes aquatic ecosystems and municipal water tables.",
      ],
      safetyWarnings: [
        "BIOHAZARD WARNING: Loose sharps pose immediate puncture and infection hazards to sanitation and waste-sorting workers.",
        "Pharmaceutical compounds pass through standard wastewater treatment facilities and contaminate waterways.",
      ],
      municipalDiscretionNote:
        "Biomedical and pharmaceutical waste regulations are governed by public health authorities. Contact your local pharmacy or municipal health department for drop-off guidelines.",
      residualDisposalRoute:
        "High-temperature medical waste autoclaving or certified biohazard incineration.",
      requiresSpecialHandling: true,
    };
  }

  // 3. Chemical Waste / Paint / Motor Oil / Solvents
  if (
    itemLower.includes("paint") ||
    itemLower.includes("solvent") ||
    itemLower.includes("chemical") ||
    itemLower.includes("motor oil") ||
    itemLower.includes("pesticide") ||
    itemLower.includes("bleach") ||
    itemLower.includes("aerosol") ||
    itemLower.includes("varnish") ||
    itemLower.includes("turpentine")
  ) {
    return {
      categoryTitle: "Hazardous Chemical & Solvent Waste",
      recoveryStatus: "Special Disposal Required",
      primaryGuidance:
        "Chemicals, paints, and automotive fluids must be brought to an authorized Household Hazardous Waste (HHW) depot. Never pour chemicals into drains, gutters, or onto soil.",
      safeDisposalSteps: [
        "Retain chemicals in their original labelled containers to facilitate safe identification by depot technicians.",
        "Ensure containers are tightly capped and transported upright inside a sturdy cardboard box with absorbent material.",
        "Take to an authorized municipal household hazardous waste collection depot or scheduled community hazardous drop-off event.",
      ],
      safetyWarnings: [
        "TOXICITY & GROUNDWATER HAZARD: Pouring hazardous fluids down storm drains or domestic sinks causes irreversible damage to waterways and water tables.",
        "Never mix different chemical products together; unpredictable chemical reactions, toxic fumes, or explosions may occur.",
      ],
      municipalDiscretionNote:
        "Most regional governments operate scheduled Household Hazardous Waste (HHW) drop-offs. Verify accepted chemical categories on your municipal solid-waste portal.",
      residualDisposalRoute:
        "Certified hazardous-waste neutralization, fuel-blending, or specialized thermal treatment facility.",
      requiresSpecialHandling: true,
    };
  }

  // 4. Electronic Waste (E-waste)
  if (
    cat === "electronics" ||
    itemLower.includes("phone") ||
    itemLower.includes("laptop") ||
    itemLower.includes("computer") ||
    itemLower.includes("circuit") ||
    itemLower.includes("cord") ||
    itemLower.includes("cable") ||
    itemLower.includes("charger") ||
    itemLower.includes("appliance") ||
    itemLower.includes("printer")
  ) {
    const isRepairable = options?.isRepairable ?? true;
    return {
      categoryTitle: "Electronic & Electrical Waste (E-Waste)",
      recoveryStatus: isRepairable ? "Repairable" : "Special Disposal Required",
      primaryGuidance:
        "Deliver redundant or broken electronics to certified e-waste recyclers or municipal collection depots. Never place electronic devices in regular trash bins.",
      safeDisposalSteps: [
        "Factory-reset and delete all personal accounts, credentials, and sensitive data from digital storage drives before disposal.",
        "Remove detachable batteries and transport them separately with terminals taped.",
        "Deliver the hardware intact to an authorized municipal e-waste depot or certified electronics recycler (e.g., e-Stewards or R2 certified).",
      ],
      safetyWarnings: [
        "Never smash, burn, or disassemble electronics without professional protective gear. CRTs, capacitors, mercury backlights, and leaded solder present toxicity and shock hazards.",
      ],
      municipalDiscretionNote:
        "Many municipalities and electronics retailers offer free consumer e-waste drop-off programs. Confirm current accepted equipment categories with your municipal waste authority.",
      residualDisposalRoute:
        "Mechanized industrial e-waste shredding, magnetic separation, optical sorting, and precious metal smelting.",
      requiresSpecialHandling: true,
    };
  }

  // 5. Food waste / Organic Discards
  if (
    cat === "organic" ||
    itemLower.includes("coffee") ||
    itemLower.includes("food") ||
    itemLower.includes("scrap") ||
    itemLower.includes("peel") ||
    itemLower.includes("produce") ||
    itemLower.includes("fruit") ||
    itemLower.includes("vegetable") ||
    itemLower.includes("leaf") ||
    itemLower.includes("compost")
  ) {
    return {
      categoryTitle: "Organic & Biodegradable Discards",
      recoveryStatus: "Reusable",
      primaryGuidance:
        "Divert organic discards through home composting, vermicomposting, or municipal green organic waste collection rather than sending them to landfills.",
      safeDisposalSteps: [
        "For home composting: Balance nitrogen-rich organic greens (food scraps, coffee grounds) with carbon-rich browns (dry leaves, shredded unprinted cardboard).",
        "For municipal organic collection: Place scraps in your designated green organics cart. Use certified compostable liner bags or wrap scraps in unlined paper.",
        "Do not include plastic packaging, produce stickers, synthetic tea bags, or chemical-treated materials in compost bins.",
      ],
      safetyWarnings: [
        "Never use conventional polyethylene plastic bags for organics; they do not biodegrade and contaminate municipal compost batches with microplastics.",
      ],
      municipalDiscretionNote:
        "Organics acceptance rules vary: some municipal digesters accept meat, dairy, and bones, while basic home compost piles should typically focus on fruit and vegetable trimmings.",
      residualDisposalRoute:
        "Aerobic municipal industrial windrow composting or anaerobic municipal bio-digester.",
      requiresSpecialHandling: false,
    };
  }

  // 6. Paper & Cardboard Discards
  if (
    cat === "paper" ||
    cat === "cardboard" ||
    itemLower.includes("cardboard") ||
    itemLower.includes("paper") ||
    itemLower.includes("box") ||
    itemLower.includes("carton")
  ) {
    return {
      categoryTitle: "Paper & Corrugated Fiber Discards",
      recoveryStatus: "Recyclable",
      primaryGuidance:
        "Keep paper and cardboard clean and dry to preserve fiber strength. Separate food-contaminated sections before placing in curbside paper recycling.",
      safeDisposalSteps: [
        "Flatten boxes completely to save space in collection vehicles and prevent jam hazards in sorting machinery.",
        "Remove excessive plastic packing tape, poly mailers, and plastic window films where practical.",
        "Separate heavily grease-soaked or food-soiled paper (e.g. greasy pizza box bottoms) — food oils spoil the paper pulping slurry.",
      ],
      safetyWarnings: [
        "Wax-coated, foil-laminated, or plastic-lined paper packaging cannot be processed in standard dry paper mills.",
      ],
      municipalDiscretionNote:
        "Clean cardboard and dry office paper are widely accepted in curbside recycling programs. Heavily food-stained unlined paper may be accepted in municipal organics carts.",
      residualDisposalRoute:
        "Municipal paper repulping mill for re-manufacturing into corrugated packaging or recycled tissue.",
      requiresSpecialHandling: false,
    };
  }

  // 7. Glass Containers & Broken Glass
  if (cat === "glass" || itemLower.includes("glass") || itemLower.includes("jar")) {
    const isBroken = itemLower.includes("broken") || itemLower.includes("shattered") || itemLower.includes("shard");
    return {
      categoryTitle: "Container Glass & Silicates",
      recoveryStatus: isBroken ? "Special Disposal Required" : "Recyclable",
      primaryGuidance:
        "Glass bottles and jars are 100% recyclable infinitely. Handle damaged or broken glass with safety precautions to protect waste handlers.",
      safeDisposalSteps: [
        isBroken
          ? "Wrap broken glass securely in several layers of heavy paper, bubble wrap, or place inside a sealed puncture-resistant box clearly marked 'BROKEN GLASS'."
          : "Rinse container thoroughly to remove food or liquid residues. Labels may generally remain attached.",
        "Check local glass collection preferences: remove metal lids and recycle them separately in the metal stream if required.",
        "Do not mix window pane glass, mirrors, Pyrex cookware, lightbulbs, or crystal glassware with bottle glass; their different melting points ruin glass furnaces.",
      ],
      safetyWarnings: [
        "SHARP EDGE HAZARD: Loose shards in plastic trash bags can puncture bags and inflict serious cuts on collection workers.",
      ],
      municipalDiscretionNote:
        "Some municipal systems collect glass curbside in mixed recycling, while others require dedicated glass bottle banks or drop-off depots to prevent broken glass from contaminating paper.",
      residualDisposalRoute:
        isBroken
          ? "Packaged residual waste stream or industrial aggregate cullet recycling."
          : "Direct cullet melting in regional glass container furnace.",
      requiresSpecialHandling: isBroken,
    };
  }

  // 8. Plastic Packaging & Polymers
  if (cat === "plastic" || itemLower.includes("plastic") || itemLower.includes("bottle") || itemLower.includes("tub")) {
    return {
      categoryTitle: "Rigid & Flexible Polymers (Plastics)",
      recoveryStatus: "Recyclable",
      primaryGuidance:
        "Check the resin identification code (#1 through #7). Acceptance depends strictly on your local material recovery facility (MRF) sorting capabilities.",
      safeDisposalSteps: [
        "Rinse food and beverage containers clean and shake dry to prevent contamination of other dry recyclables.",
        "Keep screw caps attached to PET (#1) and HDPE (#2) bottles unless your municipal rules specifically require separate disposal.",
        "Separate thin plastic films, carrier bags, and chip packets from rigid containers; flexible films jam rotating sorting screens.",
        "If the item is unmarked, expanded polystyrene (#6 foam), or chemically contaminated, check with your local authority before placing in curbside bins.",
      ],
      safetyWarnings: [
        "Do not place plastics containing residual motor oils, automotive fluids, or harsh agricultural chemicals in curbside recycling.",
      ],
      municipalDiscretionNote:
        "Rigid plastics #1 (PET) and #2 (HDPE) are accepted in almost all municipal recycling programs. Plastics #3, #4, #5, #6, and #7 vary greatly by regional facility.",
      residualDisposalRoute:
        "Flake extrusion and polymer pelletizing, or managed municipal residual waste.",
      requiresSpecialHandling: false,
    };
  }

  // 9. Unknown / Unrecognized / Ambiguous items
  if (cat === "unknown" || !isClear || conf < 0.5) {
    return {
      categoryTitle: "Unverified / Ambiguous Discard",
      recoveryStatus: "No Safe Recovery Option Identified",
      primaryGuidance:
        "Material composition cannot be determined with confidence. Conservative safety instructions apply; do not place unverified items into curbside recycling.",
      safeDisposalSteps: [
        "Inspect the physical object for imprinted resin identification codes (#1-#7), recycling logos, or manufacturer stampings.",
        "Take a clearer, well-lit photo focusing directly on material stamps, seams, or labels for improved AI analysis.",
        "Consult your local municipal solid waste authority's 'What Goes Where' online search tool.",
        "If you suspect the item may contain hazardous materials, electronics, or pressurized chemicals, store safely and contact an authorized municipal depot.",
      ],
      safetyWarnings: [
        "Placing unrecognized or composite items in curbside recycling causes contamination ('wish-cycling') and risks damaging sorting machinery.",
      ],
      municipalDiscretionNote:
        "Municipalities provide definitive disposal directories for unusual items. Search your local waste authority portal for item-specific guidance.",
      residualDisposalRoute:
        "Retain for verification, consult local waste management office, or place in standard residual waste if confirmed non-hazardous.",
      requiresSpecialHandling: true,
    };
  }

  // 10. Default / Metal / Mixed / General Discard
  const isMetal = cat === "metal" || itemLower.includes("can") || itemLower.includes("aluminum") || itemLower.includes("tin");
  return {
    categoryTitle: isMetal ? "Ferrous & Non-Ferrous Metals" : "General Material Discard",
    recoveryStatus: isMetal ? "Recyclable" : "Special Disposal Required",
    primaryGuidance: isMetal
      ? "Aluminum and steel cans are infinitely recyclable. Rinse clean and place in curbside metal recycling."
      : "Safely dispose of composite or mixed materials following verified municipal guidelines.",
    safeDisposalSteps: [
      "Rinse container clean of food residues and flatten cans where possible.",
      "Separate multi-material components (e.g., metal lids from glass jars, plastic liners from paper sleeves).",
      "Deliver larger scrap metals (pots, pans, hardware) to a dedicated municipal metal scrap depot.",
    ],
    safetyWarnings: [
      "Check that pressurized aerosol containers are completely empty before recycling. Never puncture or incinerate aerosol cans.",
    ],
    municipalDiscretionNote:
      "Clean food and beverage cans are universally accepted in municipal curbside programs. Scrap metal objects require drop-off at designated municipal scrap bays.",
    residualDisposalRoute:
      isMetal ? "Regional electric arc furnace or scrap metal shredder." : "Municipal managed residual waste.",
    requiresSpecialHandling: false,
  };
}

