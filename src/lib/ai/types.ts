export interface TransformationStep {
  step: number;
  instruction: string;
}

export interface TransformationOptionDTO {
  id?: string;
  title: string;
  shortExplanation: string;
  difficulty: "Easy" | "Medium" | "Advanced";
  estimatedTime: string;
  materialsTools: string[];
  estimatedCost: string;
  stepByStep: TransformationStep[];
  safetyPrecautions: string;
  expectedResult: string;
  environmentalBenefits: string;
  limitations: string;
  disposalMethod: string;
}

export interface EnvironmentalImpactDTO {
  summary: string;
  divertedGramsEstimate?: string;
  transparentAssumptions: string;
  qualitativeAdvantages: string[];
  possibleDisadvantages: string[];
  comparisonMatrix: {
    reuseOrRepair: string;
    diyTransformation: string;
    formalRecycling: string;
    safeDisposal: string;
  };
  recommendedRoute: "reuse" | "repair" | "diy_transformation" | "formal_recycling" | "safe_disposal";
  recommendationRationale: string;
}

export interface WasteAnalysisResult {
  detectedItem: string;
  materialCategory:
    | "plastic"
    | "paper"
    | "cardboard"
    | "glass"
    | "metal"
    | "fabric"
    | "electronics"
    | "organic"
    | "mixed"
    | "unknown";
  confidence: number; // 0.0 to 1.0
  isImageClear: boolean;
  unclearPromptNote?: string;
  isReusable: boolean;
  isRepairable: boolean;
  isRecyclable: boolean;
  isCompostable: boolean;
  isUnsuitable: boolean;
  safetyConcerns: string;
  environmentalImpact: EnvironmentalImpactDTO;
  localRecyclingCaveats: string;
  transformationOptions: TransformationOptionDTO[];
  itemCondition?: string;
  uncertaintyNotes?: string;
  isDemoSample: boolean;
  providerUsed: string;
}

export interface IWasteAnalysisProvider {
  analyzeImage(
    imageBase64: string,
    mimeType: string,
    userCity?: string,
    imageName?: string
  ): Promise<WasteAnalysisResult>;
}
