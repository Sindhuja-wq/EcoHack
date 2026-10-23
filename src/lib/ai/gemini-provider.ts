import { GoogleGenerativeAI } from "@google/generative-ai";
import type { IWasteAnalysisProvider, WasteAnalysisResult } from "./types.ts";

// Prioritized list of high-availability, low-latency Gemini vision models
const VERIFIED_VISION_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
];

// Overall and per-attempt time budgets (in milliseconds)
const OVERALL_TIMEOUT_MS = 28000; // 28s overall budget to finish well within Vercel execution limits
const PER_CALL_TIMEOUT_MS = 18000; // 18s max per single model call to allow rich blueprint generation

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

    const locationContext = userCity
      ? `The user is located in or near '${userCity}'. Provide specific municipal waste context if known, or emphasize checking local guidelines.`
      : "No user city specified. Emphasize checking regional municipal waste rules rather than assuming uniform curbside recycling.";

    const imageContext = imageName
      ? `User photo file name hint: '${imageName}'. Use this only as supplementary context; prioritize genuine visual analysis of the actual photo pixels.`
      : "";

    const prompt = `
You are EcoHack's AI Waste-to-Value Assistant and Materials Engineer.
Carefully examine the actual image provided. Analyze the visual shape, color, surface texture, transparency, labels, markings, and physical condition of the item.
${imageContext}

CRITICAL INSTRUCTIONS:
1. Identify the specific object and its primary material from the photo.
   Material category MUST be exactly one of:
   ["plastic", "paper", "cardboard", "glass", "metal", "fabric", "electronics", "organic", "mixed", "unknown"]
2. Item Condition & Uncertainty:
   - Identify "itemCondition": Describe the physical state visible in the image (e.g. "Clean and intact", "Crushed/creased", "Rinsed with label attached", "Food-soiled organic scraps", "Worn/frayed textile").
   - Identify "uncertaintyNotes": Note any ambiguity or limits of visual inspection (e.g. "Resin identification code not visible; PET inferred from bottle geometry and clarity", or "Specific fabric blend unconfirmed; 100% cotton assumed based on weave"). If uncertain or ambiguous, be honest rather than fabricating.
   - If the image is blurry, obscured, dark, or does not depict a recognizable item, set isImageClear=false, confidence < 0.4, and provide an unclearPromptNote explaining what is needed.
3. NEVER make false promises about local recycling. Provide localRecyclingCaveats acknowledging that municipal acceptance varies.
4. You MUST generate at least THREE (3) DISTINCT, practical, and safe transformation options tailored specifically to this item and material.
   Do not provide repetitive or generic advice! Diversify across:
   - Option 1: Functional Household Repurposing (e.g. self-watering planter, seed starter, drawer organizer, storage canister, rag)
   - Option 2: Practical DIY Tool / Upcycling Project (e.g. cord organizer, garden weed barrier, produce bag, compost accelerator)
   - Option 3: Certified Repair, Restoration, or Circular Processing / Drop-off
5. For each transformation option:
   - Title must be specific to the item (e.g., "Sub-Irrigation Self-Watering Planter" for plastic bottles, "Garden Sheet Mulch Barrier" for cardboard, "No-Sew Braided Produce Bag" for T-shirts, "Airtight Pantry Dry-Goods Canister" for glass jars, "Nutrient-Rich Compost Booster" for vegetable scraps).
   - Provide realistic tools, difficulty, estimated time, and numbered step-by-step instructions.
   - Provide clear safety precautions and end-of-life disposal instructions.
6. For Environmental Impact:
   - Provide transparent assumptions, qualitative advantages, possible disadvantages, and a comparison matrix across: (1) Reuse/Repair, (2) DIY Transformation, (3) Formal Recycling, (4) Safe Disposal.
   - Recommend the best overall route based on item condition.
7. Keep descriptions, instructions, and comparison text clear, practical, and concise (1-2 sentences max per step or section; avoid unnecessary filler).

${locationContext}

Return ONLY valid JSON matching this exact structure:
{
  "detectedItem": "Detailed, specific item name",
  "materialCategory": "plastic",
  "confidence": 0.92,
  "isImageClear": true,
  "unclearPromptNote": "",
  "itemCondition": "Clean, transparent, intact container with cap attached",
  "uncertaintyNotes": "Visible geometry indicates PET #1; resin stamp not directly visible",
  "isReusable": true,
  "isRepairable": false,
  "isRecyclable": true,
  "isCompostable": false,
  "isUnsuitable": false,
  "safetyConcerns": "Specific safety and cleaning precautions",
  "environmentalImpact": {
    "summary": "Impact summary",
    "divertedGramsEstimate": "Approx. 25-40g",
    "transparentAssumptions": "Explicit methodology and assumptions",
    "qualitativeAdvantages": ["Advantage 1", "Advantage 2", "Advantage 3"],
    "possibleDisadvantages": ["Limitation or disadvantage 1", "Disadvantage 2"],
    "comparisonMatrix": {
      "reuseOrRepair": "Analysis of reuse or repair",
      "diyTransformation": "Analysis of DIY transformation",
      "formalRecycling": "Analysis of formal recycling",
      "safeDisposal": "Analysis of safe disposal"
    },
    "recommendedRoute": "diy_transformation",
    "recommendationRationale": "Clear rationale for this recommendation"
  },
  "localRecyclingCaveats": "Caveats regarding local municipal facility acceptance",
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
        { "step": 2, "instruction": "Step 2 details" },
        { "step": 3, "instruction": "Step 3 details" }
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
      // Calculate remaining overall time budget
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

          // If another candidate model is available, proceed immediately to the next candidate
          // Only retry the same model if it is the last candidate and sufficient time budget remains
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
        return parsed;
      } catch (err: any) {
        lastError = err;
        const msg = err.message || "";
        const lower = msg.toLowerCase();

        console.warn(`Model [${modelToTry}] attempt note: ${msg}`);

        // Immediate fatal errors: DO NOT try other models if credentials/API key are invalid
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

        // For Quota exceeded (429), log clearly and move to next model without retrying the same model
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

