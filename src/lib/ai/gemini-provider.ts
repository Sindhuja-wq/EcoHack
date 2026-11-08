import { GoogleGenerativeAI } from "@google/generative-ai";
import type { IWasteAnalysisProvider, WasteAnalysisResult, RecoveryStatus } from "./types.ts";
import { buildSmartDisposalGuide } from "./smart-disposal-guide.ts";

// Prioritized list of high-availability, low-latency Gemini vision models
const VERIFIED_VISION_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
];

// Overall and per-attempt time budgets (in milliseconds)
const OVERALL_TIMEOUT_MS = 28000;
const PER_CALL_TIMEOUT_MS = 18000;

export class GeminiWasteAnalysisProvider implements IWasteAnalysisProvider {
  private apiKey: string;
  private modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
    this.modelName = modelName || process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
    if (this.modelName.includes("pro") || this.modelName.includes("omni") || this.modelName.includes("tts")) {
      this.modelName = "gemini-3.5-flash-lite";
    }
  }

  private getCandidateModels(): string[] {
    const requested = this.modelName.trim();
    const candidates = [requested, ...VERIFIED_VISION_MODELS];
    // Filter out duplicate, audio/tts, omni, pro, or empty model strings
    return Array.from(new Set(candidates)).filter(
      (m) => Boolean(m) && !m.includes("pro") && !m.includes("omni") && !m.includes("tts")
    );
  }

  async analyzeImage(
    imageBase64: string,
    mimeType: string,
    userCity?: string,
    imageName?: string
  ): Promise<WasteAnalysisResult> {
    if (!this.apiKey || this.apiKey.trim() === "") {
      throw new Error(
        "GEMINI_API_KEY is not configured in .env. Please configure your Gemini API key to enable live AI vision analysis. To test in demonstration mode without an API key, set AI_PROVIDER='mock' in .env."
      );
    }

    // Extract clean Base64 data and normalize MIME type
    let cleanBase64 = imageBase64;
    let effectiveMime = mimeType || "image/jpeg";

    const dataUrlMatch = imageBase64.match(/^data:([^;]+);base64,([\s\S]+)$/);
    if (dataUrlMatch) {
      effectiveMime = dataUrlMatch[1].trim();
      cleanBase64 = dataUrlMatch[2];
    } else {
      cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
    }
    // Remove whitespace or newline characters introduced during transport
    cleanBase64 = cleanBase64.replace(/\s+/g, "");

    // Validate base64 payload length
    if (!cleanBase64 || cleanBase64.length < 50) {
      throw new Error("Invalid or empty image data received for AI vision analysis.");
    }

    // Standardize mime type for Gemini vision API
    if (effectiveMime === "image/svg+xml") {
      effectiveMime = "image/png";
    }

    const genAI = new GoogleGenerativeAI(this.apiKey);

    const imageContext = imageName
      ? `User photo file name hint: '${imageName}'. Use this only as supplementary context; prioritize genuine visual analysis of the actual photo pixels.`
      : "";

    const prompt = `
You are EcoHack's AI Waste-to-Value Assistant and Circular Materials Engineer.
Carefully examine the actual image provided. Analyze the visual shape, color, surface texture, transparency, labels, markings, and physical condition of the item.
${imageContext}

CRITICAL INSTRUCTIONS:
1. Waste Identification:
   - Identify the specific object and its primary material from the photo.
   - Material category MUST be exactly one of:
     ["plastic", "paper", "cardboard", "glass", "metal", "fabric", "electronics", "organic", "mixed", "unknown"]
   - Item Condition: Describe the physical state visible (e.g. "Clean and intact", "Crushed/creased", "Rinsed with label attached", "Food-soiled organic scraps", "Worn/frayed textile").
   - Uncertainty Notes: Note any ambiguity or limits of visual inspection. If the image is blurry, obscured, dark, or does not depict a recognizable item, set isImageClear=false, confidence < 0.45, and provide an unclearPromptNote asking for a clearer photo or more details.
   - DO NOT automatically classify an item as non-recyclable simply because identification is uncertain.

2. Waste Recovery Status:
   Assign "recoveryStatus" from exactly:
   - "Reusable" (if item can be repurposed or reused directly)
   - "Repairable" (if item has fixable defects or tears)
   - "Recyclable" (if material is widely accepted in curbside recycling)
   - "Special Disposal Required" (if item requires hazardous waste, battery, biomedical, or e-waste processing)
   - "No Safe Recovery Option Identified" (if item is contaminated, ambiguous, or no safe circular option exists)

3. Key Analysis Elements:
   Provide:
   - reusePossibilities: Array of 2-3 specific reuse ideas
   - repairPossibilities: Array of 1-2 practical repair suggestions (or state if not applicable)
   - recyclingPossibilities: Array of 1-2 recycling routes (clearly note if verification is needed)
   - environmentalBenefits: Array of 2-3 ecological benefits of proper diversion
   - environmentalDisadvantages: Array of 1-2 drawbacks, limitations, or hazards
   - confirmedRecycling: boolean (true if globally accepted curbside, false if requires verification)

4. Smart Waste Disposal Guide:
   Provide safe, category-specific instructions when reuse, repair, and recycling are not practical:
   - For Food waste: explain suitable composting options and municipal organic collection.
   - For Plastic: explain acceptance depends on plastic resin type and local recycling rules; recommend clean separation.
   - For Paper: recommend keeping paper dry and separating food-contaminated sections.
   - For Glass: explain suitable glass collection and safe handling of broken glass (wrap broken shards).
   - For Batteries: recommend authorized battery collection; NEVER recommend putting batteries in household trash or recycling (fire risk).
   - For Electronic waste: recommend authorized e-waste collection; NEVER recommend dismantling without expertise.
   - For Medical waste: explain appropriate biomedical routes; NEVER ordinary household trash.
   - For Chemical waste / Paint: recommend authorized hazardous waste drop-off; NEVER pour into drains or soil.
   - For Unknown / Hazardous waste: provide conservative safety instructions, do NOT invent disposal methods, recommend contacting authorized municipal services.
   - DO NOT invent local collection center names, addresses, or phone numbers. Explain that local municipal rules may vary.

5. Transformation Options:
   Generate at least THREE (3) DISTINCT, practical, and safe transformation options tailored specifically to this item:
   - Option 1: Functional Household Repurposing
   - Option 2: Practical DIY Tool / Upcycling Project
   - Option 3: Certified Repair, Restoration, or Circular Processing / Drop-off
   Each option must have: title, shortExplanation, difficulty ("Easy"|"Medium"|"Advanced"), estimatedTime, materialsTools, estimatedCost, stepByStep (array of {step, instruction}), safetyPrecautions, expectedResult, environmentalBenefits, limitations, disposalMethod.

6. Environmental Impact:
   Provide summary, divertedGramsEstimate, transparentAssumptions, qualitativeAdvantages, possibleDisadvantages, comparisonMatrix (reuseOrRepair, diyTransformation, formalRecycling, safeDisposal), recommendedRoute, and recommendationRationale.

Return ONLY valid JSON matching this exact structure:
{
  "detectedItem": "Detailed item name",
  "materialCategory": "plastic",
  "confidence": 0.92,
  "isImageClear": true,
  "unclearPromptNote": "",
  "itemCondition": "Clean, transparent, intact container with cap attached",
  "uncertaintyNotes": "Visible geometry indicates PET #1; resin stamp not directly visible",
  "recoveryStatus": "Reusable",
  "confirmedRecycling": true,
  "isReusable": true,
  "isRepairable": false,
  "isRecyclable": true,
  "isCompostable": false,
  "isUnsuitable": false,
  "safetyConcerns": "Specific safety and cleaning precautions",
  "reusePossibilities": ["Idea 1", "Idea 2"],
  "repairPossibilities": ["Suggestion 1"],
  "recyclingPossibilities": ["Route 1"],
  "environmentalBenefits": ["Benefit 1", "Benefit 2"],
  "environmentalDisadvantages": ["Limitation 1"],
  "smartDisposalGuide": {
    "categoryTitle": "Rigid & Flexible Polymers",
    "recoveryStatus": "Recyclable",
    "primaryGuidance": "Check the resin identification code (#1 through #7)...",
    "safeDisposalSteps": ["Step 1", "Step 2"],
    "safetyWarnings": ["Warning 1"],
    "municipalDiscretionNote": "Municipal sorting capabilities vary by region. Check with your local waste authority.",
    "residualDisposalRoute": "Municipal managed residual waste.",
    "requiresSpecialHandling": false
  },
  "environmentalImpact": {
    "summary": "Impact summary",
    "divertedGramsEstimate": "Approx. 25-40g",
    "transparentAssumptions": "Explicit methodology and assumptions",
    "qualitativeAdvantages": ["Advantage 1", "Advantage 2"],
    "possibleDisadvantages": ["Disadvantage 1"],
    "comparisonMatrix": {
      "reuseOrRepair": "Analysis of reuse or repair",
      "diyTransformation": "Analysis of DIY transformation",
      "formalRecycling": "Analysis of formal recycling",
      "safeDisposal": "Analysis of safe disposal"
    },
    "recommendedRoute": "diy_transformation",
    "recommendationRationale": "Clear rationale for this recommendation"
  },
  "localRecyclingCaveats": "General recycling caveats; municipal acceptance rules vary.",
  "transformationOptions": [
    {
      "title": "Specific Transformation Title 1",
      "shortExplanation": "Concise summary",
      "difficulty": "Easy",
      "estimatedTime": "20 minutes",
      "materialsTools": ["Tool 1", "Material 2"],
      "estimatedCost": "$0 - $2",
      "stepByStep": [
        { "step": 1, "instruction": "Step 1 details" },
        { "step": 2, "instruction": "Step 2 details" }
      ],
      "safetyPrecautions": "Precautions to take",
      "expectedResult": "Description of final result",
      "environmentalBenefits": "Tangible eco benefit",
      "limitations": "Durability or usage limitations",
      "disposalMethod": "Proper end-of-life disposal"
    },
    {
      "title": "Specific Transformation Title 2",
      "shortExplanation": "Concise summary",
      "difficulty": "Medium",
      "estimatedTime": "35 minutes",
      "materialsTools": ["Tool 1", "Material 2"],
      "estimatedCost": "$0 - $5",
      "stepByStep": [
        { "step": 1, "instruction": "Step 1 details" },
        { "step": 2, "instruction": "Step 2 details" }
      ],
      "safetyPrecautions": "Precautions to take",
      "expectedResult": "Description of final result",
      "environmentalBenefits": "Tangible eco benefit",
      "limitations": "Durability or usage limitations",
      "disposalMethod": "Proper end-of-life disposal"
    },
    {
      "title": "Specific Transformation Title 3",
      "shortExplanation": "Concise summary",
      "difficulty": "Easy",
      "estimatedTime": "15 minutes",
      "materialsTools": ["Tool 1"],
      "estimatedCost": "$0",
      "stepByStep": [
        { "step": 1, "instruction": "Step 1 details" },
        { "step": 2, "instruction": "Step 2 details" }
      ],
      "safetyPrecautions": "Precautions to take",
      "expectedResult": "Description of final result",
      "environmentalBenefits": "Tangible eco benefit",
      "limitations": "Durability or usage limitations",
      "disposalMethod": "Proper end-of-life disposal"
    }
  ]
}
`;

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: effectiveMime,
      },
    };

    const modelsToTry = this.getCandidateModels();
    const overallStartTime = Date.now();
    let lastError: any = null;

    for (const modelToTry of modelsToTry) {
      const elapsedTotal = Date.now() - overallStartTime;
      const remainingTotal = OVERALL_TIMEOUT_MS - elapsedTotal;

      if (remainingTotal < 3500) {
        console.warn(`Overall time budget nearly exhausted (${elapsedTotal}ms elapsed). Halting fallback attempts.`);
        break;
      }

      const callTimeout = Math.min(PER_CALL_TIMEOUT_MS, remainingTotal);

      try {
        const model = genAI.getGenerativeModel({
          model: modelToTry,
          generationConfig: {
            temperature: 0.2,
            topP: 0.95,
            responseMimeType: "application/json",
          },
        });

        const executeCall = async (timeoutMs: number): Promise<any> => {
          let timeoutHandle: NodeJS.Timeout | null = null;
          const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutHandle = setTimeout(
              () => reject(new Error(`Model ${modelToTry} request timed out after ${timeoutMs}ms`)),
              timeoutMs
            );
          });

          try {
            const apiPromise = model.generateContent([prompt, imagePart]);
            return await Promise.race([apiPromise, timeoutPromise]);
          } finally {
            if (timeoutHandle) clearTimeout(timeoutHandle);
          }
        };

        let response: any;
        try {
          response = await executeCall(callTimeout);
        } catch (callErr: any) {
          const errLower = (callErr.message || "").toLowerCase();
          const isDemandSpike =
            callErr.status === 503 ||
            errLower.includes("503") ||
            errLower.includes("overloaded") ||
            errLower.includes("spikes in demand");

          const currentIndex = modelsToTry.indexOf(modelToTry);
          const hasAlternative = currentIndex >= 0 && currentIndex < modelsToTry.length - 1;
          const remainingAfterErr = OVERALL_TIMEOUT_MS - (Date.now() - overallStartTime);

          if (isDemandSpike && !hasAlternative && remainingAfterErr > 12000) {
            console.warn(`Transient 503 on final candidate [${modelToTry}]. Waiting 600ms before single retry...`);
            await new Promise((resolve) => setTimeout(resolve, 600));
            const retryTimeout = Math.min(PER_CALL_TIMEOUT_MS, OVERALL_TIMEOUT_MS - (Date.now() - overallStartTime));
            response = await executeCall(retryTimeout);
          } else {
            throw callErr;
          }
        }

        const responseText = response.response.text();
        let cleanedJson = responseText.trim();
        if (cleanedJson.startsWith("```json")) {
          cleanedJson = cleanedJson.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
        } else if (cleanedJson.startsWith("```")) {
          cleanedJson = cleanedJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

        const parsed = JSON.parse(cleanedJson) as WasteAnalysisResult;
        parsed.isDemoSample = false;
        parsed.providerUsed = `Google Gemini (${modelToTry})`;

        // Post-process to guarantee verified Smart Waste Disposal Guide integrity
        const guaranteedGuide = buildSmartDisposalGuide(
          parsed.materialCategory || "unknown",
          parsed.detectedItem || "Waste item",
          {
            isReusable: parsed.isReusable,
            isRepairable: parsed.isRepairable,
            isRecyclable: parsed.isRecyclable,
            isCompostable: parsed.isCompostable,
            isImageClear: parsed.isImageClear,
            confidence: parsed.confidence,
          }
        );

        parsed.smartDisposalGuide = parsed.smartDisposalGuide || guaranteedGuide;
        parsed.recoveryStatus = (parsed.recoveryStatus as RecoveryStatus) || guaranteedGuide.recoveryStatus;
        parsed.reusePossibilities = parsed.reusePossibilities || [
          "Evaluate item condition for clean domestic repurposing",
        ];
        parsed.repairPossibilities = parsed.repairPossibilities || [
          "Check structural seams or connections for repair feasibility",
        ];
        parsed.recyclingPossibilities = parsed.recyclingPossibilities || [
          "Check local municipal curbside dry recycling rules",
        ];
        parsed.environmentalBenefits = parsed.environmentalBenefits || [
          "Reduces municipal landfill volume and raw material extraction demand",
        ];
        parsed.environmentalDisadvantages = parsed.environmentalDisadvantages || [
          "End-of-life disposal depends on local facility capabilities",
        ];
        parsed.confirmedRecycling = parsed.confirmedRecycling ?? Boolean(parsed.isRecyclable);

        return parsed;
      } catch (err: any) {
        lastError = err;
        const msg = err.message || "";
        const lower = msg.toLowerCase();

        console.warn(`Model [${modelToTry}] attempt note: ${msg}`);

        if (
          lower.includes("api_key_invalid") ||
          lower.includes("api key not valid") ||
          lower.includes("api_key") ||
          err.status === 401 ||
          (err.status === 403 && (lower.includes("key") || lower.includes("credential")))
        ) {
          throw new Error(
            `Gemini API Key validation failed: ${msg}. Please verify your GEMINI_API_KEY in .env.`
          );
        }

        if (lower.includes("quota exceeded") || lower.includes("resource_exhausted") || err.status === 429) {
          console.warn(`Quota reached on ${modelToTry}. Continuing to alternative model...`);
        }
      }
    }

    const finalMsg = lastError?.message || "All Gemini vision service attempts timed out or failed.";
    throw new Error(
      `Gemini Vision Analysis unavailable: ${finalMsg}. Please check network connection and try again.`
    );
  }
}
