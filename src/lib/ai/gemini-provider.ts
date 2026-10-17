import { GoogleGenerativeAI } from "@google/generative-ai";
import type { IWasteAnalysisProvider, WasteAnalysisResult } from "./types.ts";

export class GeminiWasteAnalysisProvider implements IWasteAnalysisProvider {
  private apiKey: string;
  private modelName: string;
  private static cachedSupportedModels: string[] | null = null;
  private static lastModelCheckTime = 0;

  constructor(apiKey?: string, modelName?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
    this.modelName = modelName || process.env.GEMINI_MODEL || "gemini-3.8-flash";
    if (this.modelName === "gemini-3.8-pro" || this.modelName.includes("pro")) {
      this.modelName = "gemini-3.8-flash";
    }
  }

  private async getAvailableVisionModels(): Promise<string[]> {
    const verifiedFallbacks = [
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash",
    ];

    const requestedModel =
      this.modelName === "gemini-3.8-pro" || this.modelName.includes("pro")
        ? "gemini-3.8-flash"
        : this.modelName;

    // Cache model list for 10 minutes to avoid overhead on every request
    const now = Date.now();
    if (
      GeminiWasteAnalysisProvider.cachedSupportedModels &&
      now - GeminiWasteAnalysisProvider.lastModelCheckTime < 10 * 60 * 1000
    ) {
      const candidates = [requestedModel, ...GeminiWasteAnalysisProvider.cachedSupportedModels, ...verifiedFallbacks];
      return Array.from(new Set(candidates)).filter((m) => Boolean(m) && !m.includes("pro"));
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const availableFromApi: string[] = [];
        for (const m of data.models || []) {
          const name = (m.name || "").replace("models/", "");
          const methods = m.supportedGenerationMethods || [];
          if (
            methods.includes("generateContent") &&
            name.includes("flash") &&
            !name.includes("tts") &&
            !name.includes("preview") &&
            !name.includes("pro")
          ) {
            availableFromApi.push(name);
          }
        }

        availableFromApi.sort((a, b) => b.localeCompare(a));

        if (availableFromApi.length > 0) {
          GeminiWasteAnalysisProvider.cachedSupportedModels = availableFromApi;
          GeminiWasteAnalysisProvider.lastModelCheckTime = now;
          const combined = [requestedModel, ...availableFromApi, ...verifiedFallbacks];
          return Array.from(new Set(combined)).filter((m) => Boolean(m) && !m.includes("pro"));
        }
      }
    } catch {
      // Dynamic query timed out or offline, safely proceed with verified fallbacks
    }

    const fallbackList = [requestedModel, ...verifiedFallbacks];
    return Array.from(new Set(fallbackList)).filter((m) => Boolean(m) && !m.includes("pro"));
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
    // Remove any whitespace or newline characters introduced during transport
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

    // Dynamically query supported models or use verified vision models
    const verifiedModels = await this.getAvailableVisionModels();

    let lastError: any = null;
    for (const modelToTry of verifiedModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelToTry,
          generationConfig: {
            temperature: 0.2,
            topP: 0.95,
            responseMimeType: "application/json",
          },
        });

        let response: any;
        try {
          response = await model.generateContent([prompt, imagePart]);
        } catch (callErr: any) {
          const isTransient =
            callErr.status === 503 ||
            callErr.status === 429 ||
            callErr.message?.includes("503") ||
            callErr.message?.includes("overloaded") ||
            callErr.message?.includes("spikes in demand") ||
            callErr.message?.includes("Resource has been exhausted");

          if (isTransient) {
            console.warn(`Transient notice on ${modelToTry} (${callErr.message}). Retrying in 1.2s...`);
            await new Promise((resolve) => setTimeout(resolve, 1200));
            response = await model.generateContent([prompt, imagePart]);
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
        console.warn(`Gemini model ${modelToTry} attempt notice: ${err.message || err}. Trying next candidate...`);
        // If it's an authentication error (e.g. invalid API key), do not retry other models
        if (
          err.message?.includes("API_KEY_INVALID") ||
          err.message?.includes("API key not valid") ||
          err.message?.includes("API_KEY") ||
          err.status === 401 ||
          (err.status === 403 && (err.message?.toLowerCase().includes("key") || err.message?.toLowerCase().includes("credential")))
        ) {
          throw new Error(
            `Gemini API Key validation failed: ${err.message}. Please verify your GEMINI_API_KEY in .env.`
          );
        }
      }
    }

    throw new Error(
      `Gemini Vision Analysis failed: ${lastError?.message || "Unable to reach Gemini vision services"}. Please check your GEMINI_API_KEY and network connection.`
    );
  }
}

