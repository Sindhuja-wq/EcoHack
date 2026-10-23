"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth, useToast } from "@/components/Providers";
import {
  Camera,
  UploadCloud,
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  Share2,
  Clock,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Info,
  Check,
  Award,
  Layers,
  MapPin,
  RefreshCw,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Sample items with pre-encoded base64 / demonstration triggers
const QUICK_SAMPLES = [
  {
    name: "PET Plastic Bottle",
    category: "plastic",
    icon: "🍾",
    description: "Standard 500ml or 1L clear beverage container with cap",
  },
  {
    name: "Cardboard Shipping Box",
    category: "cardboard",
    icon: "📦",
    description: "Corrugated delivery packaging box",
  },
  {
    name: "Organic Coffee Grounds",
    category: "organic",
    icon: "☕",
    description: "Used brewed espresso or filter grounds",
  },
  {
    name: "Glass Jam Jar",
    category: "glass",
    icon: "🫙",
    description: "Clean glass container with metal screw lid",
  },
  {
    name: "Worn Denim Jeans",
    category: "fabric",
    icon: "👖",
    description: "Cotton denim fabric with tears or fraying",
  },
];

export default function ScannerPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [imageName, setImageName] = useState<string>("");
  const [userCity, setUserCity] = useState<string>("");
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [optimizingImage, setOptimizingImage] = useState<boolean>(false);
  const [analysisProgressMessage, setAnalysisProgressMessage] = useState<string>("Analyzing waste item...");
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [isMockEngine, setIsMockEngine] = useState<boolean>(false);
  const [providerName, setProviderName] = useState<string>("");

  // Selected transformation option tab index
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);
  const [savedOptionIds, setSavedOptionIds] = useState<Set<string>>(new Set());

  // "I Completed This Project" Modal
  const [completionModalOpen, setCompletionModalOpen] = useState<boolean>(false);
  const [selectedOptionForCompletion, setSelectedOptionForCompletion] = useState<any | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState<string>("");
  const [submittingCompletion, setSubmittingCompletion] = useState<boolean>(false);

  // Handle local image file selection with safe client-side dimension optimization
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file (JPEG, PNG, WebP)", "error");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast("Image file is too large. Maximum size is 15MB", "error");
      return;
    }

    setImageName(file.name);
    setOptimizingImage(true);

    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new window.Image();
      img.onload = () => {
        // Downscale oversized images to max dimension 1024px
        // Preserves sharp visual indicators (resin codes, seams, textures) while shrinking payload by >95%
        const maxDimension = 1024;
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        try {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Export as standard JPEG at 0.82 quality to strip EXIF and dramatically reduce transport overhead
            const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
            setSelectedImage(optimizedDataUrl);
            setMimeType("image/jpeg");
          } else {
            setSelectedImage(rawDataUrl);
            setMimeType(file.type || "image/jpeg");
          }
        } catch {
          setSelectedImage(rawDataUrl);
          setMimeType(file.type || "image/jpeg");
        } finally {
          setOptimizingImage(false);
          setAnalysisResult(null);
          setAnalysisError(null);
        }
      };

      img.onerror = () => {
        setSelectedImage(rawDataUrl);
        setMimeType(file.type || "image/jpeg");
        setOptimizingImage(false);
        setAnalysisResult(null);
        setAnalysisError(null);
      };

      img.src = rawDataUrl;
    };

    reader.onerror = () => {
      setOptimizingImage(false);
      showToast("Could not read image file. Please try again.", "error");
    };

    reader.readAsDataURL(file);
  };

  // Quick sample selection for fast testing: renders an authentic raster PNG via canvas
  const handleSelectSample = (sample: typeof QUICK_SAMPLES[0]) => {
    const sampleFileName = `${sample.category}_${sample.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.png`;
    setImageName(sampleFileName);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Nature background gradient
        const grad = ctx.createLinearGradient(0, 0, 600, 600);
        grad.addColorStop(0, "#064e3b");
        grad.addColorStop(1, "#022c22");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 600);

        // Halo
        ctx.beginPath();
        ctx.arc(300, 300, 190, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(34, 197, 94, 0.12)";
        ctx.fill();

        // Icon
        ctx.font = "110px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(sample.icon, 300, 270);

        // Title & Description
        ctx.fillStyle = "#86efac";
        ctx.font = "bold 32px sans-serif";
        ctx.fillText(sample.name, 300, 370);

        ctx.fillStyle = "#e2f5ec";
        ctx.font = "18px sans-serif";
        ctx.fillText(sample.description, 300, 415);

        const pngData = canvas.toDataURL("image/png");
        setSelectedImage(pngData);
        setMimeType("image/png");
      } else {
        throw new Error("Canvas context unavailable");
      }
    } catch {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="#14532D"/><text x="300" y="300" font-size="100" text-anchor="middle" fill="#FFFFFF">${sample.icon}</text><text x="300" y="400" font-size="28" font-weight="bold" text-anchor="middle" fill="#86EFAC">${sample.name}</text></svg>`;
      setSelectedImage(`data:image/svg+xml;base64,${btoa(svg)}`);
      setMimeType("image/svg+xml");
    }

    setAnalysisResult(null);
    setAnalysisError(null);
    showToast(`Loaded sample: ${sample.name}. Click Analyze below!`, "info");
  };

  // Reset or remove photo
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImageName("");
    setAnalysisResult(null);
    setAnalysisError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // Run AI analysis
  const handleAnalyze = async () => {
    if (!selectedImage || analyzing) return;

    setAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);
    setAnalysisProgressMessage("Preparing photo & connecting to AI vision...");

    // Stepped honest loading feedback to keep the user informed if network/AI is busy
    const progressTimer1 = setTimeout(() => {
      setAnalysisProgressMessage("Analyzing waste material composition via AI...");
    }, 3500);

    const progressTimer2 = setTimeout(() => {
      setAnalysisProgressMessage("Inspecting material purity and generating transformation blueprints...");
    }, 9000);

    const progressTimer3 = setTimeout(() => {
      setAnalysisProgressMessage("Finalizing environmental impact and localized guidelines...");
    }, 17000);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch("/api/waste/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType,
          userCity: userCity.trim() || undefined,
          imageName: imageName || undefined,
        }),
      });

      clearTimeout(timeoutId);
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      clearTimeout(progressTimer3);

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        const rawText = await res.text().catch(() => "");
        data = {
          success: false,
          error:
            rawText.length > 0 && rawText.length < 250
              ? rawText
              : `Server returned HTTP status ${res.status} (${res.statusText || "Internal Server Error"}).`,
        };
      }

      if (!res.ok || !data.success) {
        const errorMsg =
          data.error ||
          `Analysis failed with status ${res.status}. Please check your image and configuration.`;
        setAnalysisError(errorMsg);
        showToast(errorMsg, "error");
        return;
      }

      setAnalysisResult(data.result);
      setAnalysisId(data.analysisId);
      setIsMockEngine(Boolean(data.isMock || data.result?.isDemoSample));
      setProviderName(data.providerName);
      setSelectedOptionIndex(0);
      showToast(
        data.isMock || data.result?.isDemoSample
          ? "Demonstration sample loaded."
          : "Waste item analyzed with live AI vision!",
        "success"
      );
    } catch (err: any) {
      clearTimeout(timeoutId);
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      clearTimeout(progressTimer3);

      let errorMsg: string;
      if (err.name === "AbortError") {
        errorMsg = "Analysis request timed out after 45 seconds. Please try again with a clear photo.";
      } else if (
        err instanceof TypeError &&
        (err.message.toLowerCase().includes("failed to fetch") ||
          err.message.toLowerCase().includes("networkerror"))
      ) {
        errorMsg =
          "Unable to connect to the EcoHack analysis server. Please check your internet connection and try again.";
      } else {
        errorMsg = err.message || "An unexpected error occurred during waste analysis.";
      }

      setAnalysisError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      clearTimeout(timeoutId);
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      clearTimeout(progressTimer3);
      setAnalyzing(false);
    }
  };

  // Toggle saving idea
  const handleToggleSaveIdea = async (optionId: string) => {
    if (!user) {
      showToast("Please sign in to save transformation ideas to your profile.", "info");
      return;
    }

    try {
      const res = await fetch("/api/waste/save-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transformationOptionId: optionId }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedOptionIds((prev) => {
          const next = new Set(prev);
          if (data.saved) {
            next.add(optionId);
          } else {
            next.delete(optionId);
          }
          return next;
        });
        showToast(data.message, data.saved ? "success" : "info");
      } else {
        showToast(data.error || "Could not update saved idea.", "error");
      }
    } catch {
      showToast("Error updating saved status.", "error");
    }
  };

  // Open completion modal
  const handleOpenCompletionModal = (option: any) => {
    if (!user) {
      showToast("Please sign in to submit completed projects and earn eco-points.", "info");
      return;
    }
    setSelectedOptionForCompletion(option);
    setEvidenceFile(null);
    setEvidencePreview(null);
    setCompletionNotes("");
    setCompletionModalOpen(true);
  };

  // Handle completion evidence upload
  const handleEvidenceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image (JPEG, PNG, WebP)", "error");
      return;
    }

    setEvidenceFile(file);
    const reader = new FileReader();
    reader.onload = () => setEvidencePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Submit project completion
  const handleSubmitCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceFile || !selectedOptionForCompletion?.id) {
      showToast("Please select a photo of your completed project as evidence.", "error");
      return;
    }

    setSubmittingCompletion(true);

    try {
      // 1. Upload photo to server
      const formData = new FormData();
      formData.append("file", evidenceFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        showToast(uploadData.error || "Failed to upload evidence photo", "error");
        setSubmittingCompletion(false);
        return;
      }

      // 2. Submit project record
      const projectRes = await fetch("/api/waste/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transformationOptionId: selectedOptionForCompletion.id,
          evidenceUrl: uploadData.url,
          notes: completionNotes,
        }),
      });

      const projectData = await projectRes.json();
      if (!projectRes.ok || !projectData.success) {
        showToast(projectData.error || "Failed to submit project.", "error");
        setSubmittingCompletion(false);
        return;
      }

      showToast("Project evidence submitted! Status: Pending Moderator Review.", "success");
      setCompletionModalOpen(false);
    } catch {
      showToast("Network error submitting project completion.", "error");
    } finally {
      setSubmittingCompletion(false);
    }
  };

  const currentOption = analysisResult?.transformationOptions?.[selectedOptionIndex];

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8 bg-nature-gradient dark:bg-night flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-10">
        {/* Header Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Waste-To-Value Scanner</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-emerald-950 dark:text-emerald-50 tracking-tight">
            Turn Any Discard Into Worth
          </h1>
          <p className="text-sm sm:text-base text-emerald-950/70 dark:text-emerald-300/80 max-w-2xl mx-auto">
            Upload or snap a photo of any waste item. Our AI analyzes material purity, safety guidelines, and generates at least 3 distinct practical transformation options.
          </p>
        </div>

        {/* Scanner Engine Notice Banner */}
        {providerName && (
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-night-card/70 border border-emerald-500/20 shadow-soft flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Active Provider: <strong className="font-bold">{providerName}</strong>
              </span>
            </div>
            {isMockEngine && (
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 font-semibold">
                Educational Sample Engine (Add GEMINI_API_KEY in .env for live vision)
              </span>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* IMAGE UPLOADER & CAMERA SECTION */}
        {/* ======================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/20 shadow-soft-lg space-y-6">
          {!selectedImage ? (
            <div className="space-y-6">
              {/* Dropzone Area */}
              <div
                onClick={() => {
                  if (!analyzing && !optimizingImage) fileInputRef.current?.click();
                }}
                className={`border-2 border-dashed border-emerald-500/35 hover:border-emerald-500 rounded-3xl p-8 sm:p-12 text-center transition-all group flex flex-col items-center justify-center space-y-4 ${
                  analyzing || optimizingImage
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer hover:bg-emerald-500/5"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                    {optimizingImage
                      ? "Optimizing photo for fast AI inspection..."
                      : "Click to browse or drag and drop your waste photo"}
                  </p>
                  <p className="text-xs text-emerald-900/60 dark:text-emerald-400">
                    Supports high-resolution JPEG, PNG, WebP up to 15MB (automatically optimized)
                  </p>
                </div>
              </div>

              {/* Action Buttons: File Picker & Camera trigger */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={analyzing || optimizingImage}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={analyzing || optimizingImage}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-soft flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Choose Photo File</span>
                </button>

                {/* Mobile camera direct trigger */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  disabled={analyzing || optimizingImage}
                  className="hidden"
                />
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={analyzing || optimizingImage}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-emerald-900 dark:text-emerald-100 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Take Live Photo (Mobile)</span>
                </button>
              </div>

              {/* Quick Sample Selector */}
              <div className="pt-4 border-t border-emerald-500/10">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-900/70 dark:text-emerald-400 mb-3 text-center sm:text-left">
                  Or Test Instantly With A Common Discard:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {QUICK_SAMPLES.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(s)}
                      disabled={analyzing || optimizingImage}
                      className="px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-night-hover/60 hover:bg-emerald-100/60 dark:hover:bg-night-border text-xs font-semibold text-emerald-900 dark:text-emerald-200 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      <span>{s.icon}</span>
                      <span>{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Selected Image Preview & Control */
            <div className="space-y-6">
              <div className="relative w-full max-w-md mx-auto aspect-square rounded-3xl overflow-hidden border-2 border-emerald-500/30 shadow-soft-lg bg-emerald-950/10">
                <img
                  src={selectedImage}
                  alt="Selected waste item"
                  className="w-full h-full object-cover"
                />
                {!analyzing && (
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Optional City Input for localized recycling rules */}
              <div className="max-w-md mx-auto space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  Your City or Region (Optional for local recycling laws):
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-700/60 dark:text-emerald-400/60">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={userCity}
                    onChange={(e) => setUserCity(e.target.value)}
                    disabled={analyzing}
                    placeholder="e.g. Seattle, Mumbai, London, Toronto"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-500/25 dark:border-emerald-500/30 bg-white/70 dark:bg-night-hover/70 text-emerald-950 dark:text-white placeholder:text-emerald-900/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Action Buttons: Remove & Submit */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRemoveImage}
                  disabled={analyzing}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-night-hover disabled:opacity-50 transition-colors"
                >
                  Choose Different Item
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || optimizingImage}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 shadow-soft-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{analysisProgressMessage}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Analyze Waste Item</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Analysis Error Alert with Preserved Photo and Retry Button */}
          {analysisError && (
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-2 text-xs flex-1">
                <h4 className="font-bold text-rose-900 dark:text-rose-200 text-sm">Analysis Notice</h4>
                <p className="text-rose-800 dark:text-rose-300 leading-relaxed">{analysisError}</p>
                {analysisError.includes("GEMINI_API_KEY") && (
                  <p className="text-rose-700 dark:text-rose-400 mt-1 font-medium">
                    To enable live AI vision, configure your Gemini API key in <code className="px-1.5 py-0.5 bg-rose-500/20 rounded">.env</code>. Or, to explore with sample blueprints without a key, set <code className="px-1.5 py-0.5 bg-rose-500/20 rounded">AI_PROVIDER="mock"</code> in <code className="px-1.5 py-0.5 bg-rose-500/20 rounded">.env</code>.
                  </p>
                )}
                {selectedImage && !analyzing && (
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleAnalyze}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Analysis (Keep Photo)</span>
                    </button>
                    <button
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-500/30 bg-white/60 dark:bg-night-hover/60 hover:bg-white text-rose-800 dark:text-rose-300 font-semibold text-xs transition-colors"
                    >
                      <span>Take / Upload Another Photo</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* LOADING ANIMATION */}
        {/* ======================================================== */}
        {analyzing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/25 shadow-soft-lg text-center space-y-4"
          >
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-100">
                {analysisProgressMessage}
              </h3>
              <p className="text-xs text-emerald-900/60 dark:text-emerald-400 max-w-sm mx-auto">
                Running vision inspection for polymer codes, fiber density, safety guidelines, and calculating potential divertible mass...
              </p>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* AI ANALYSIS RESULTS SECTION */}
        {/* ======================================================== */}
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* 1. Identification Summary Card */}
            <div className="p-8 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/25 shadow-soft-lg space-y-6">
              {/* Authenticity Mode Badge */}
              {analysisResult.isDemoSample ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>
                    <strong>Educational Demonstration Sample:</strong> This blueprint was generated using synthetic educational sample models. For verified live computer vision on your uploaded photo, configure <code className="px-1.5 py-0.5 bg-amber-500/20 rounded">GEMINI_API_KEY</code> in <code className="px-1.5 py-0.5 bg-amber-500/20 rounded">.env</code>.
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    <strong>Verified Live Gemini Vision Analysis:</strong> Processed from your uploaded image using {providerName || "Google Gemini Vision Model"}.
                  </span>
                </div>
              )}

              {/* Uncertainty / Ambiguity Notice when confidence is low or image is unclear */}
              {(!analysisResult.isImageClear || analysisResult.confidence < 0.6 || analysisResult.materialCategory === "unknown") && (
                <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-950 dark:text-amber-200 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-amber-900 dark:text-amber-100 text-sm">
                      ⚠️ Ambiguous or Low-Confidence Classification ({Math.round(analysisResult.confidence * 100)}%)
                    </h4>
                    <p className="leading-relaxed">
                      {analysisResult.unclearPromptNote || analysisResult.uncertaintyNotes || "The material composition could not be determined with high certainty from this photo."}
                    </p>
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 pt-1">
                      💡 <strong>Tip for higher accuracy:</strong> Take a well-lit photo focusing on the bottom, rim, or label of the item to show any recycling resin symbols (e.g. ♳ PET, ♴ HDPE) or fabric composition tags.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-500/15">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25">
                      Category: {analysisResult.materialCategory.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-night-hover text-emerald-700 dark:text-emerald-400">
                      Confidence: {Math.round(analysisResult.confidence * 100)}%
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100">
                    {analysisResult.detectedItem}
                  </h2>
                </div>

                {/* Compatibility Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {analysisResult.isReusable && (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                      ✓ Reusable
                    </span>
                  )}
                  {analysisResult.isRepairable && (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300">
                      ✓ Repairable
                    </span>
                  )}
                  {analysisResult.isRecyclable && (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300">
                      ✓ Recyclable
                    </span>
                  )}
                  {analysisResult.isCompostable && (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-lime-100 dark:bg-lime-950/70 text-lime-800 dark:text-lime-300">
                      ✓ Compostable
                    </span>
                  )}
                  {analysisResult.isUnsuitable && (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                      ⚠️ Needs Specialized Drop-off
                    </span>
                  )}
                </div>
              </div>

              {/* Physical Condition and Uncertainty Inspection Badges */}
              {(analysisResult.itemCondition || analysisResult.uncertaintyNotes) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {analysisResult.itemCondition && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                      <span className="font-bold text-emerald-950 dark:text-emerald-100 block mb-0.5">
                        Observed Condition
                      </span>
                      <span className="text-emerald-900/80 dark:text-emerald-300">
                        {analysisResult.itemCondition}
                      </span>
                    </div>
                  )}
                  {analysisResult.uncertaintyNotes && (
                    <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs">
                      <span className="font-bold text-teal-950 dark:text-teal-100 block mb-0.5">
                        Material & Inspection Notes
                      </span>
                      <span className="text-teal-900/80 dark:text-teal-300">
                        {analysisResult.uncertaintyNotes}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Safety Warning if present */}
              {analysisResult.safetyConcerns && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                      Safety & Precaution Notes
                    </h4>
                    <p className="text-xs text-amber-900/80 dark:text-amber-300 mt-0.5 leading-relaxed">
                      {analysisResult.safetyConcerns}
                    </p>
                  </div>
                </div>
              )}

              {/* Localized recycling caveats */}
              {analysisResult.localRecyclingCaveats && (
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-start gap-3 text-xs text-blue-950 dark:text-blue-200">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Regional Recycling Advice: </span>
                    <span>{analysisResult.localRecyclingCaveats}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* 2. AT LEAST THREE DISTINCT TRANSFORMATION OPTIONS */}
            {/* ======================================================== */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
                    Transformation Blueprints ({analysisResult.transformationOptions?.length || 0})
                  </h3>
                  <p className="text-xs text-emerald-900/60 dark:text-emerald-400">
                    Switch between distinct options below (repurpose, repair, functional tools, or responsible processing).
                  </p>
                </div>
              </div>

              {/* Tabs for switching between options */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {analysisResult.transformationOptions?.map((opt: any, idx: number) => {
                  const isSelected = selectedOptionIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedOptionIndex(idx)}
                      className={`px-5 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition-all border flex items-center gap-2 ${
                        isSelected
                          ? "bg-emerald-700 text-white border-emerald-700 shadow-soft"
                          : "bg-white/80 dark:bg-night-card/80 text-emerald-950/80 dark:text-emerald-200 border-emerald-500/20 hover:bg-emerald-50"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isSelected ? "bg-white text-emerald-800" : "bg-emerald-500/20 text-emerald-700"}`}>
                        {idx + 1}
                      </span>
                      <span>{opt.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Option Detail Card */}
              {currentOption && (
                <div className="p-8 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/25 shadow-soft-lg space-y-6">
                  {/* Top Bar with actions */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-500/15">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                          {currentOption.difficulty} Difficulty
                        </span>
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {currentOption.estimatedTime}
                        </span>
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {currentOption.estimatedCost || "Free / $0"}
                        </span>
                      </div>
                      <h4 className="text-2xl font-black text-emerald-950 dark:text-emerald-100">
                        {currentOption.title}
                      </h4>
                      <p className="text-sm text-emerald-950/70 dark:text-emerald-300/80 mt-1">
                        {currentOption.shortExplanation}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Save This Idea Button */}
                      <button
                        onClick={() => currentOption.id && handleToggleSaveIdea(currentOption.id)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-1.5 ${
                          savedOptionIds.has(currentOption.id)
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-800 dark:text-amber-200"
                            : "bg-white dark:bg-night-hover border-emerald-500/25 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50"
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${savedOptionIds.has(currentOption.id) ? "fill-amber-500 text-amber-500" : ""}`} />
                        <span>{savedOptionIds.has(currentOption.id) ? "Saved to Ideas" : "Save This Idea"}</span>
                      </button>

                      {/* I Completed This Project Action */}
                      <button
                        onClick={() => handleOpenCompletionModal(currentOption)}
                        className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 shadow-soft transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>I Completed This (+40 pts)</span>
                      </button>
                    </div>
                  </div>

                  {/* Materials & Tools */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-2">
                      Materials & Tools Required
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {currentOption.materialsTools?.map((m: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-night-hover border border-emerald-500/20 text-xs font-medium text-emerald-950 dark:text-emerald-200"
                        >
                          • {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Numbered Step-by-Step Instructions */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-3">
                      Step-by-Step Transformation Guide
                    </h5>
                    <div className="space-y-3">
                      {currentOption.stepByStep?.map((stepItem: any, sIdx: number) => (
                        <div
                          key={sIdx}
                          className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-night-hover/60 border border-emerald-500/15 flex items-start gap-3.5 text-sm"
                        >
                          <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {stepItem.step || sIdx + 1}
                          </span>
                          <span className="text-emerald-950 dark:text-emerald-100 font-medium leading-relaxed">
                            {stepItem.instruction}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grid of Results, Precautions, Disadvantages, Disposal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-night-hover/40 border border-emerald-500/15 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        ✨ Expected Final Result
                      </span>
                      <p className="text-xs text-emerald-950/80 dark:text-emerald-200 leading-relaxed">
                        {currentOption.expectedResult}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-night-hover/40 border border-emerald-500/15 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        🌱 Environmental Benefits
                      </span>
                      <p className="text-xs text-emerald-950/80 dark:text-emerald-200 leading-relaxed">
                        {currentOption.environmentalBenefits}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                        ⚠️ Limitations & Lifespan
                      </span>
                      <p className="text-xs text-amber-950/80 dark:text-amber-200 leading-relaxed">
                        {currentOption.limitations}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-night-hover/40 border border-emerald-500/15 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        ♻️ Leftover Scrap Disposal
                      </span>
                      <p className="text-xs text-emerald-950/80 dark:text-emerald-200 leading-relaxed">
                        {currentOption.disposalMethod}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* 3. ENVIRONMENTAL IMPACT ANALYZER SECTION */}
            {/* ======================================================== */}
            {analysisResult.environmentalImpact && (
              <div className="p-8 rounded-3xl bg-white/95 dark:bg-night-card/95 border border-emerald-500/25 shadow-soft-lg space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Environmental Impact Analyzer</span>
                  </div>
                  <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
                    Measurable vs Qualitative Assessment
                  </h3>
                  <p className="text-xs text-emerald-900/60 dark:text-emerald-400 mt-1">
                    Transparent lifecycle evaluation based on UNEP & EPA solid waste documentation.
                  </p>
                </div>

                {/* Estimate & Assumptions */}
                <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-night-hover/80 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                      Diverted Material Mass (Estimate)
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                      Transparent Methodology
                    </span>
                  </div>
                  <div className="text-xl font-black text-emerald-950 dark:text-emerald-100">
                    {analysisResult.environmentalImpact.divertedGramsEstimate}
                  </div>
                  <p className="text-xs text-emerald-950/70 dark:text-emerald-300/80 italic leading-relaxed">
                    Assumptions: {analysisResult.environmentalImpact.transparentAssumptions}
                  </p>
                </div>

                {/* Advantages vs Disadvantages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-night-hover/50 border border-emerald-500/20 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      Potential Advantages
                    </h5>
                    <ul className="space-y-1.5 text-xs text-emerald-950/80 dark:text-emerald-200">
                      {analysisResult.environmentalImpact.qualitativeAdvantages?.map((adv: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      Possible Disadvantages & Trade-offs
                    </h5>
                    <ul className="space-y-1.5 text-xs text-amber-950/80 dark:text-amber-200">
                      {analysisResult.environmentalImpact.possibleDisadvantages?.map((dis: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{dis}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 4-Way Comparison Matrix */}
                {analysisResult.environmentalImpact.comparisonMatrix && (
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                      Route Comparison Matrix
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">1. Reuse or Repair</span>
                        <p className="text-emerald-950/70 dark:text-emerald-300/80">
                          {analysisResult.environmentalImpact.comparisonMatrix.reuseOrRepair}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">2. DIY Transformation</span>
                        <p className="text-emerald-950/70 dark:text-emerald-300/80">
                          {analysisResult.environmentalImpact.comparisonMatrix.diyTransformation}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">3. Formal Recycling</span>
                        <p className="text-emerald-950/70 dark:text-emerald-300/80">
                          {analysisResult.environmentalImpact.comparisonMatrix.formalRecycling}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">4. Safe Disposal</span>
                        <p className="text-emerald-950/70 dark:text-emerald-300/80">
                          {analysisResult.environmentalImpact.comparisonMatrix.safeDisposal}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Final Recommended Route */}
                <div className="p-4 rounded-2xl bg-emerald-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                      EcoHack Recommendation
                    </span>
                    <p className="text-sm font-semibold mt-0.5">
                      {analysisResult.environmentalImpact.recommendationRationale}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-white text-emerald-900 font-bold text-xs uppercase tracking-wide shrink-0">
                    Route: {analysisResult.environmentalImpact.recommendedRoute}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* "I COMPLETED THIS PROJECT" SUBMISSION MODAL */}
        {/* ======================================================== */}
        <AnimatePresence>
          {completionModalOpen && selectedOptionForCompletion && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-night-card rounded-3xl p-6 sm:p-8 shadow-soft-lg border border-emerald-500/25 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-emerald-500/15 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-emerald-950 dark:text-emerald-100">
                      Submit Completed Project
                    </h3>
                    <p className="text-xs text-emerald-900/60 dark:text-emerald-400 mt-0.5">
                      {selectedOptionForCompletion.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setCompletionModalOpen(false)}
                    className="p-1 rounded-lg text-emerald-900/60 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitCompletion} className="space-y-4">
                  {/* Photo Upload for Evidence */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-2">
                      Upload Proof Photo of Completed Transformation
                    </label>
                    {evidencePreview ? (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-emerald-500/30">
                        <img
                          src={evidencePreview}
                          alt="Evidence preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setEvidenceFile(null);
                            setEvidencePreview(null);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-emerald-500/35 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer block hover:bg-emerald-500/5 transition-colors">
                        <Camera className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                          Select photo of your finished work
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEvidenceFileChange}
                          className="hidden"
                          required
                        />
                      </label>
                    )}
                  </div>

                  {/* Notes input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                      Notes or Learnings (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      placeholder="e.g. Added a wick from an old t-shirt, working great with my basil plant!"
                      className="w-full p-3 rounded-xl border border-emerald-500/25 dark:border-emerald-500/30 bg-white/70 dark:bg-night-hover/70 text-emerald-950 dark:text-white placeholder:text-emerald-900/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      Earn <strong>+40 Eco-Points</strong> upon verification by the moderation team.
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCompletionModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-emerald-500/20 text-xs font-semibold text-emerald-900 dark:text-emerald-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingCompletion || !evidenceFile}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 transition-colors shadow-soft"
                    >
                      {submittingCompletion ? "Uploading..." : "Submit for Verification"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
