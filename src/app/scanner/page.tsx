"use client";

import React, { useState, useRef } from "react";
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
  Clock,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Info,
  Check,
  Recycle,
  Wrench,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Compass,
  Layers,
  FileCheck,
  AlertOctagon,
  Scan,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SpiderLoader } from "@/components/SpiderLoader";

// Sample items with pre-encoded demonstration triggers
const QUICK_SAMPLES = [
  {
    name: "PET Plastic Bottle",
    category: "plastic",
    icon: "🍾",
    description: "500ml clear beverage container with cap",
  },
  {
    name: "Cardboard Box",
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
  {
    name: "Ambiguous / Blurry Item",
    category: "unknown",
    icon: "❓",
    description: "Unidentified mixed discard to test safety guidance",
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
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [optimizingImage, setOptimizingImage] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [analysisProgressMessage, setAnalysisProgressMessage] = useState<string>("Preparing photo...");
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

  // Process image file with client-side dimension optimization
  const processImageFile = (file: File) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!analyzing && !optimizingImage) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (analyzing || optimizingImage) return;
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  // Quick sample selection for instant testing
  const handleSelectSample = (sample: (typeof QUICK_SAMPLES)[0]) => {
    const sampleFileName = `${sample.category}_${sample.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.png`;
    setImageName(sampleFileName);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 600, 600);
        grad.addColorStop(0, "#121C19");
        grad.addColorStop(1, "#0B1110");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 600);

        ctx.beginPath();
        ctx.arc(300, 300, 190, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(67, 230, 161, 0.12)";
        ctx.fill();

        ctx.font = "110px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(sample.icon, 300, 270);

        ctx.fillStyle = "#43E6A1";
        ctx.font = "bold 32px sans-serif";
        ctx.fillText(sample.name, 300, 370);

        ctx.fillStyle = "#F1F5F2";
        ctx.font = "18px sans-serif";
        ctx.fillText(sample.description, 300, 415);

        const pngData = canvas.toDataURL("image/png");
        setSelectedImage(pngData);
        setMimeType("image/png");
      } else {
        throw new Error("Canvas context unavailable");
      }
    } catch {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="#121C19"/><text x="300" y="300" font-size="100" text-anchor="middle" fill="#FFFFFF">${sample.icon}</text><text x="300" y="400" font-size="28" font-weight="bold" text-anchor="middle" fill="#43E6A1">${sample.name}</text></svg>`;
      setSelectedImage(`data:image/svg+xml;base64,${btoa(svg)}`);
      setMimeType("image/svg+xml");
    }

    setAnalysisResult(null);
    setAnalysisError(null);
    showToast(`Loaded sample: ${sample.name}. Click Analyze below!`, "info");
  };

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

    const progressTimer1 = setTimeout(() => {
      setAnalysisProgressMessage("Analyzing material composition & resin classification...");
    }, 3500);

    const progressTimer2 = setTimeout(() => {
      setAnalysisProgressMessage("Compiling Smart Waste Disposal Guide & blueprints...");
    }, 9000);

    const progressTimer3 = setTimeout(() => {
      setAnalysisProgressMessage("Calculating lifecycle environmental benefits...");
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

  const handleSubmitCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceFile || !selectedOptionForCompletion?.id) {
      showToast("Please select a photo of your completed project as evidence.", "error");
      return;
    }

    setSubmittingCompletion(true);

    try {
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
        showToast(projectData.error || "Failed to submit project completion", "error");
        setSubmittingCompletion(false);
        return;
      }

      showToast("Project submitted! +40 points awarded to your profile 🌱", "success");
      setCompletionModalOpen(false);
    } catch {
      showToast("Network error submitting project. Please try again.", "error");
    } finally {
      setSubmittingCompletion(false);
    }
  };

  const currentOption = analysisResult?.transformationOptions?.[selectedOptionIndex] || null;

  // Recovery status styling and icons
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Reusable":
        return {
          bg: "bg-emerald-500/15 text-forest dark:text-emeraldaccent border-emerald-500/30",
          icon: <Sparkles className="w-4 h-4 text-forest dark:text-emeraldaccent" />,
          label: "Reusable",
        };
      case "Repairable":
        return {
          bg: "bg-teal-500/15 text-forest-light dark:text-emeraldaccent-light border-teal-500/30",
          icon: <Wrench className="w-4 h-4 text-forest-light dark:text-emeraldaccent-light" />,
          label: "Repairable",
        };
      case "Recyclable":
        return {
          bg: "bg-emerald-500/10 text-forest dark:text-[#B6EAD0] border-emerald-500/30",
          icon: <Recycle className="w-4 h-4 text-forest dark:text-emeraldaccent" />,
          label: "Recyclable",
        };
      case "Special Disposal Required":
        return {
          bg: "bg-[#E07A5F]/15 text-terra dark:text-[#E07A5F] border-[#E07A5F]/30",
          icon: <AlertOctagon className="w-4 h-4 text-terra dark:text-[#E07A5F]" />,
          label: "Special Disposal Required",
        };
      case "No Safe Recovery Option Identified":
      default:
        return {
          bg: "bg-cream-50 dark:bg-night-card text-charcoal/70 dark:text-darktext-secondary border-sage/40 dark:border-night-border",
          icon: <HelpCircle className="w-4 h-4 text-charcoal/60 dark:text-darktext-muted" />,
          label: "No Safe Recovery Option Identified",
        };
    }
  };

  const isSpecialOrUnknown =
    analysisResult?.recoveryStatus === "Special Disposal Required" ||
    analysisResult?.recoveryStatus === "No Safe Recovery Option Identified" ||
    analysisResult?.materialCategory === "unknown" ||
    !analysisResult?.isImageClear;

  return (
    <div className="w-full min-h-[calc(100vh-68px)] py-12 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-night text-charcoal dark:text-darktext flex justify-center transition-colors relative overflow-hidden">
      {/* Subtle atmospheric glow background */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-96 bg-emerald-500/10 dark:bg-[#43E6A1]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl w-full space-y-8 relative z-10">
        {/* ======================================================== */}
        {/* HEADER SECTION */}
        {/* ======================================================== */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-semibold tracking-wider uppercase">
            <Scan className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
            <span>AI Waste-to-Value Diagnostics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-charcoal dark:text-darktext">
            Waste Scanner & Circular Guide
          </h1>
          <p className="text-sm sm:text-base text-charcoal/70 dark:text-darktext-secondary max-w-2xl mx-auto font-normal">
            Capture or upload any household discard. Get instant AI material identification, practical reuse and repair options, and the verified Smart Waste Disposal Guide.
          </p>
        </div>

        {/* ======================================================== */}
        {/* IMAGE UPLOADER & CAMERA SECTION */}
        {/* ======================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-6 transition-colors">
          {!selectedImage ? (
            <div className="space-y-6">
              {/* Dropzone Area */}
              <div
                onClick={() => {
                  if (!analyzing && !optimizingImage) fileInputRef.current?.click();
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all group flex flex-col items-center justify-center space-y-4 ${
                  isDragging
                    ? "border-forest dark:border-emeraldaccent bg-forest/5 dark:bg-emeraldaccent/10 scale-[1.01]"
                    : "border-sage/40 dark:border-night-border hover:border-forest/60 dark:hover:border-emeraldaccent/60 hover:bg-cream-50/60 dark:hover:bg-night-card/60"
                } ${
                  analyzing || optimizingImage
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/40 dark:border-night-border text-forest dark:text-emeraldaccent flex items-center justify-center group-hover:scale-105 group-hover:border-forest/40 dark:group-hover:border-emeraldaccent/40 transition-all shadow-sm">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold font-heading text-charcoal dark:text-darktext">
                    {optimizingImage
                      ? "Optimizing photo for fast AI inspection..."
                      : isDragging
                      ? "Drop your image file here"
                      : "Click to browse or drag and drop your waste photo"}
                  </p>
                  <p className="text-xs text-charcoal/60 dark:text-darktext-muted">
                    Supports JPEG, PNG, WebP up to 15MB (automatically optimized client-side)
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
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm text-white dark:text-night bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glow flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-4 h-4 text-white dark:text-night" />
                  <span>Choose Photo File</span>
                </button>

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
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm text-charcoal dark:text-darktext bg-cream-50 dark:bg-night-card hover:bg-cream-100 dark:hover:bg-night-border border border-sage/40 dark:border-night-border disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4 text-forest dark:text-emeraldaccent" />
                  <span>Take Live Photo (Mobile)</span>
                </button>
              </div>

              {/* Quick Sample Selector */}
              <div className="pt-4 border-t border-sage/30 dark:border-night-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted mb-3 text-center sm:text-left">
                  Or Test Instantly With A Common Discard:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {QUICK_SAMPLES.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(s)}
                      disabled={analyzing || optimizingImage}
                      className="px-3.5 py-2 rounded-xl border border-sage/40 dark:border-night-border bg-cream-50 dark:bg-night-card/80 hover:bg-cream-100 dark:hover:bg-night-border hover:border-forest/40 dark:hover:border-emeraldaccent/40 text-xs font-medium text-charcoal dark:text-darktext disabled:opacity-50 transition-all flex items-center gap-2"
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
              <div className="relative w-full max-w-md mx-auto aspect-square rounded-3xl overflow-hidden border border-sage/40 dark:border-night-border shadow-elevated bg-black/10 dark:bg-night">
                <img
                  src={selectedImage}
                  alt="Selected waste item"
                  className="w-full h-full object-cover"
                />

                {/* Laser Scanning Reticle Overlay during analysis */}
                {analyzing && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <motion.div
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-forest dark:via-[#43E6A1] to-transparent shadow-[0_0_15px_#43E6A1]"
                    />
                    <div className="absolute inset-0 bg-emerald-500/10 dark:bg-[#43E6A1]/10 backdrop-contrast-125" />
                  </div>
                )}

                {!analyzing && (
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Action Buttons: Remove & Submit */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRemoveImage}
                  disabled={analyzing}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-sage/40 dark:border-night-border text-charcoal/70 dark:text-darktext-secondary text-sm font-semibold hover:bg-cream-50 dark:hover:bg-night-card hover:text-charcoal dark:hover:text-darktext disabled:opacity-50 transition-colors"
                >
                  Choose Different Item
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || optimizingImage}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-white dark:text-night bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover shadow-glow transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 dark:border-night/30 border-t-white dark:border-t-night rounded-full animate-spin" />
                      <span>Inspecting with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white dark:text-night" />
                      <span>Analyze Waste & Identify Materials</span>
                    </>
                  )}
                </button>
              </div>

              {/* Camera re-take helper */}
              <div className="text-center">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  disabled={analyzing}
                  className="hidden"
                />
                {!analyzing && (
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-sage/40 dark:border-night-border bg-cream-50 dark:bg-night-card text-charcoal/70 dark:text-darktext-secondary hover:text-charcoal dark:hover:text-darktext font-semibold text-xs transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
                    <span>Take Another Photo</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* LOADING STATE - ORIGINAL STYLIZED SPIDER EMBLEM */}
        {/* ======================================================== */}
        {analyzing && (
          <div
            className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated text-center transition-colors"
          >
            <SpiderLoader size="lg" />
          </div>
        )}

        {/* ======================================================== */}
        {/* ENHANCED AI WASTE ANALYSIS RESULTS */}
        {/* ======================================================== */}
        {analysisResult && (
          <div
            className="space-y-8"
          >
            {/* Mode Banner */}
            {analysisResult.isDemoSample ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-[#E07A5F]/10 border border-amber-500/25 dark:border-[#E07A5F]/25 text-amber-800 dark:text-[#E07A5F] text-xs font-semibold flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-[#E07A5F] shrink-0" />
                <span>
                  <strong>Educational Demonstration Sample:</strong> Generated using synthetic sample blueprints. For live camera analysis of any item, configure <code className="px-1.5 py-0.5 bg-amber-500/20 dark:bg-[#E07A5F]/20 rounded text-charcoal dark:text-[#F1F5F2]">GEMINI_API_KEY</code> in <code className="px-1.5 py-0.5 bg-amber-500/20 dark:bg-[#E07A5F]/20 rounded text-charcoal dark:text-[#F1F5F2]">.env</code>.
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-[#43E6A1]/10 border border-emerald-500/25 dark:border-[#43E6A1]/25 text-forest dark:text-[#43E6A1] text-xs font-semibold flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-forest dark:text-[#43E6A1] shrink-0" />
                <span>
                  <strong>Verified Live Gemini AI Analysis:</strong> Inspected using {providerName || "Google Gemini Vision Model"}.
                </span>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* 1. WASTE IDENTIFICATION CARD */}
            {/* ---------------------------------------------------- */}
            <div className="p-8 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-6 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sage/30 dark:border-night-border">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cream-50 dark:bg-night-card text-forest dark:text-emeraldaccent border border-sage/30 dark:border-night-border">
                      Material: {analysisResult.materialCategory}
                    </span>
                    {/* Recovery Status Badge */}
                    {(() => {
                      const badge = getStatusBadge(analysisResult.recoveryStatus || "Recyclable");
                      return (
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${badge.bg}`}>
                          {badge.icon}
                          <span>Status: {badge.label}</span>
                        </span>
                      );
                    })()}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black font-heading text-charcoal dark:text-darktext tracking-tight">
                    {analysisResult.detectedItem}
                  </h2>
                </div>

                {/* Confidence Indicator */}
                <div className="flex flex-col items-start md:items-end justify-center shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-charcoal/70 dark:text-darktext-secondary">AI Confidence:</span>
                    <span className="text-sm font-bold text-forest dark:text-emeraldaccent">
                      {Math.round((analysisResult.confidence || 0.85) * 100)}%
                    </span>
                  </div>
                  <div className="w-32 h-2 rounded-full bg-cream-100 dark:bg-night-card border border-sage/30 dark:border-night-border overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-forest to-forest-light dark:from-emeraldaccent dark:to-emeraldaccent-light rounded-full transition-all duration-700"
                      style={{ width: `${Math.round((analysisResult.confidence || 0.85) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Uncertainty / Image Clarity Notice */}
              {(!analysisResult.isImageClear || analysisResult.confidence < 0.6) && (
                <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-[#E07A5F]/10 border border-amber-500/30 dark:border-[#E07A5F]/30 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-amber-600 dark:text-[#E07A5F] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-[#E07A5F]">
                      Identification Uncertainty Note
                    </h4>
                    <p className="text-xs text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
                      {analysisResult.unclearPromptNote ||
                        "Material composition could not be positively identified from this angle or lighting. This item is NOT classified as non-recyclable simply because the AI is uncertain. Please inspect physical resin codes (#1-#7) or take a closer photo."}
                    </p>
                  </div>
                </div>
              )}

              {/* Observed Physical Condition & Inspection Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {analysisResult.itemCondition && (
                  <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-xs space-y-1 transition-colors">
                    <span className="font-bold text-forest dark:text-emeraldaccent block uppercase tracking-wider text-[11px]">
                      Observed Physical Condition
                    </span>
                    <span className="text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
                      {analysisResult.itemCondition}
                    </span>
                  </div>
                )}
                {analysisResult.uncertaintyNotes && (
                  <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-xs space-y-1 transition-colors">
                    <span className="font-bold text-forest dark:text-emeraldaccent block uppercase tracking-wider text-[11px]">
                      Inspection & Purity Notes
                    </span>
                    <span className="text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
                      {analysisResult.uncertaintyNotes}
                    </span>
                  </div>
                )}
              </div>

              {/* Safety Concern Alert if present */}
              {analysisResult.safetyConcerns && (
                <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-[#E07A5F]/10 border border-amber-500/25 dark:border-[#E07A5F]/25 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-[#E07A5F] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-[#E07A5F]">
                      Safety & Precaution Advisory
                    </h4>
                    <p className="text-xs text-charcoal/70 dark:text-darktext-secondary mt-0.5 leading-relaxed">
                      {analysisResult.safetyConcerns}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ---------------------------------------------------- */}
            {/* 2. SMART WASTE DISPOSAL GUIDE (High Priority Section) */}
            {/* ---------------------------------------------------- */}
            {analysisResult.smartDisposalGuide && (
              <div
                className={`p-8 rounded-3xl border shadow-elevated space-y-6 transition-colors ${
                  isSpecialOrUnknown
                    ? "bg-white dark:bg-night-secondary border-amber-500/40 dark:border-[#E07A5F]/40"
                    : "bg-white dark:bg-night-secondary border-sage/40 dark:border-night-border"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sage/30 dark:border-night-border">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-bold uppercase tracking-wider">
                      <Compass className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
                      <span>Smart Waste Disposal Guide</span>
                    </div>
                    <h3 className="text-2xl font-black font-heading text-charcoal dark:text-darktext tracking-tight">
                      {analysisResult.smartDisposalGuide.categoryTitle}
                    </h3>
                  </div>

                  {isSpecialOrUnknown && (
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 dark:bg-[#E07A5F]/20 border border-amber-500/40 dark:border-[#E07A5F]/40 text-amber-800 dark:text-[#E07A5F] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto">
                      <AlertOctagon className="w-4 h-4" />
                      Special Routing Required
                    </span>
                  )}
                </div>

                {/* Primary Guidance Statement */}
                <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-forest dark:text-emeraldaccent block">
                    Safe Disposal Protocol
                  </span>
                  <p className="text-sm font-semibold text-charcoal dark:text-darktext leading-relaxed">
                    {analysisResult.smartDisposalGuide.primaryGuidance}
                  </p>
                </div>

                {/* Step-by-Step Safe Disposal Instructions */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted mb-3">
                    Category-Specific Disposal Steps:
                  </h4>
                  <div className="space-y-2.5">
                    {analysisResult.smartDisposalGuide.safeDisposalSteps?.map((step: string, sIdx: number) => (
                      <div
                        key={sIdx}
                        className="p-3.5 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border flex items-start gap-3 text-xs transition-colors"
                      >
                        <span className="w-5 h-5 rounded-full bg-forest dark:bg-emeraldaccent text-white dark:text-night font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                          {sIdx + 1}
                        </span>
                        <span className="text-charcoal dark:text-darktext font-medium leading-relaxed">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety & Hazard Warnings if hazardous / special */}
                {analysisResult.smartDisposalGuide.safetyWarnings &&
                  analysisResult.smartDisposalGuide.safetyWarnings.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-[#E07A5F]/10 border border-amber-500/30 dark:border-[#E07A5F]/30 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-[#E07A5F]">
                        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-[#E07A5F]" />
                        <span>Safety & Hazard Warnings</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-charcoal/70 dark:text-darktext-secondary">
                        {analysisResult.smartDisposalGuide.safetyWarnings.map((warn: string, wIdx: number) => (
                          <li key={wIdx} className="flex items-start gap-1.5">
                            <span className="text-amber-600 dark:text-[#E07A5F] font-bold">•</span>
                            <span>{warn}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Residual Disposal Route & Municipal Disclaimer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-forest dark:text-emeraldaccent block">
                      Residual / Specialized Route
                    </span>
                    <p className="text-xs text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
                      {analysisResult.smartDisposalGuide.residualDisposalRoute ||
                        "Standard municipal solid waste or specialized regional processing depot."}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-forest dark:text-emeraldaccent block">
                      Municipal Regulatory Notice
                    </span>
                    <p className="text-xs text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
                      {analysisResult.smartDisposalGuide.municipalDiscretionNote}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* 3. REUSE, REPAIR & RECYCLING POSSIBILITIES */}
            {/* ---------------------------------------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Reuse Possibilities */}
              <div className="p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-3 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border flex items-center justify-center text-forest dark:text-emeraldaccent">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold font-heading uppercase tracking-wider text-charcoal dark:text-darktext">
                    Reuse Ideas
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-charcoal/70 dark:text-darktext-secondary">
                  {(analysisResult.reusePossibilities || [
                    "Inspect structural condition for household storage or sorting",
                  ]).map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-emeraldaccent mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Repair Possibilities */}
              <div className="p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-3 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border flex items-center justify-center text-forest-light dark:text-emeraldaccent-light">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold font-heading uppercase tracking-wider text-charcoal dark:text-darktext">
                    Repair Suggestions
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-charcoal/70 dark:text-darktext-secondary">
                  {(analysisResult.repairPossibilities || [
                    "Examine seams, fasteners, and structural integrity for restorative mending",
                  ]).map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest-light dark:bg-emeraldaccent-light mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recycling Guidance */}
              <div className="p-6 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-3 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border flex items-center justify-center text-forest dark:text-[#B6EAD0]">
                    <Recycle className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold font-heading uppercase tracking-wider text-charcoal dark:text-darktext">
                    Recycling Guidance
                  </h4>
                </div>
                <div className="pb-1">
                  <span
                    className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                      analysisResult.confirmedRecycling
                        ? "bg-emerald-500/15 text-forest dark:text-emeraldaccent border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-700 dark:text-[#E07A5F] border-amber-500/30"
                    }`}
                  >
                    {analysisResult.confirmedRecycling
                      ? "✓ Widely Confirmed Recyclable"
                      : "⚠️ Verify With Local Recycler"}
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-charcoal/70 dark:text-darktext-secondary">
                  {(analysisResult.recyclingPossibilities || [
                    "Consult municipal solid waste directory for local sorting guidelines",
                  ]).map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-[#B6EAD0] mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* 4. TRANSFORMATION BLUEPRINTS */}
            {/* ---------------------------------------------------- */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-2xl font-black font-heading text-charcoal dark:text-darktext tracking-tight">
                    Transformation Blueprints ({analysisResult.transformationOptions?.length || 0})
                  </h3>
                  <p className="text-xs text-charcoal/60 dark:text-darktext-muted">
                    Switch between distinct options below (repurpose, repair, functional tools, or responsible circular processing).
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {analysisResult.transformationOptions?.map((opt: any, idx: number) => {
                  const isSelected = selectedOptionIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedOptionIndex(idx)}
                      className={`px-5 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition-all border flex items-center gap-2 ${
                        isSelected
                          ? "bg-forest text-white border-forest shadow-glow dark:bg-emeraldaccent dark:text-night dark:border-emeraldaccent"
                          : "bg-white dark:bg-night-secondary text-charcoal/70 dark:text-darktext-secondary border-sage/40 dark:border-night-border hover:bg-cream-50 dark:hover:bg-night-card hover:text-charcoal dark:hover:text-darktext"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isSelected
                            ? "bg-white text-forest dark:bg-night dark:text-emeraldaccent"
                            : "bg-cream-50 text-forest dark:bg-night-card dark:text-emeraldaccent"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span>{opt.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Option Detail Card */}
              {currentOption && (
                <div className="p-8 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-6 transition-colors">
                  {/* Top Bar with actions */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sage/30 dark:border-night-border">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent">
                          {currentOption.difficulty} Difficulty
                        </span>
                        <span className="text-xs font-medium text-charcoal/70 dark:text-darktext-secondary flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
                          {currentOption.estimatedTime}
                        </span>
                        <span className="text-xs font-medium text-charcoal/70 dark:text-darktext-secondary flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
                          {currentOption.estimatedCost || "Free / $0"}
                        </span>
                      </div>
                      <h4 className="text-2xl font-black font-heading text-charcoal dark:text-darktext">
                        {currentOption.title}
                      </h4>
                      <p className="text-sm text-charcoal/70 dark:text-darktext-secondary mt-1">
                        {currentOption.shortExplanation}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => currentOption.id && handleToggleSaveIdea(currentOption.id)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-1.5 ${
                          savedOptionIds.has(currentOption.id)
                            ? "bg-emerald-500/20 border-emerald-500/40 text-forest dark:text-emeraldaccent"
                            : "bg-cream-50 dark:bg-night-card border-sage/40 dark:border-night-border text-charcoal dark:text-darktext hover:bg-cream-100 dark:hover:bg-night-border"
                        }`}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            savedOptionIds.has(currentOption.id) ? "fill-forest text-forest dark:fill-emeraldaccent dark:text-emeraldaccent" : ""
                          }`}
                        />
                        <span>{savedOptionIds.has(currentOption.id) ? "Saved to Ideas" : "Save This Idea"}</span>
                      </button>

                      <button
                        onClick={() => handleOpenCompletionModal(currentOption)}
                        className="px-5 py-2.5 rounded-xl font-bold text-xs text-white dark:text-night bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover shadow-glow transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4 text-white dark:text-night" />
                        <span>I Completed This (+40 pts)</span>
                      </button>
                    </div>
                  </div>

                  {/* Materials & Tools */}
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted mb-2">
                      Materials & Tools Required
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {currentOption.materialsTools?.map((m: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-xs font-medium text-charcoal dark:text-darktext"
                        >
                          • {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Step-by-Step Instructions */}
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted mb-3">
                      Step-by-Step Transformation Guide
                    </h5>
                    <div className="space-y-3">
                      {currentOption.stepByStep?.map((stepItem: any, sIdx: number) => (
                        <div
                          key={sIdx}
                          className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border flex items-start gap-3.5 text-sm transition-colors"
                        >
                          <span className="w-6 h-6 rounded-full bg-forest dark:bg-emeraldaccent text-white dark:text-night flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {stepItem.step || sIdx + 1}
                          </span>
                          <span className="text-charcoal dark:text-darktext font-medium leading-relaxed">
                            {stepItem.instruction}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grid of Results, Precautions, Disadvantages, Disposal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-forest dark:text-emeraldaccent">
                        ✨ Expected Final Result
                      </span>
                      <p className="text-xs text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
                        {currentOption.expectedResult}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-forest dark:text-emeraldaccent">
                        🌱 Environmental Benefits
                      </span>
                      <p className="text-xs text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
                        {currentOption.environmentalBenefits}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-[#E07A5F]/10 border border-amber-500/25 dark:border-[#E07A5F]/25 space-y-1 transition-colors">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-[#E07A5F]">
                        ⚠️ Limitations & Lifespan
                      </span>
                      <p className="text-xs text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
                        {currentOption.limitations}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-forest dark:text-emeraldaccent">
                        ♻️ Leftover Scrap Disposal
                      </span>
                      <p className="text-xs text-charcoal/70 dark:text-darktext-secondary leading-relaxed">
                        {currentOption.disposalMethod}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ---------------------------------------------------- */}
            {/* 5. ENVIRONMENTAL IMPACT SECTION */}
            {/* ---------------------------------------------------- */}
            {analysisResult.environmentalImpact && (
              <div className="p-8 rounded-3xl bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border shadow-elevated space-y-6 transition-colors">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-forest dark:text-emeraldaccent text-xs font-bold uppercase tracking-wider mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent" />
                    <span>Environmental Impact Section</span>
                  </div>
                  <h3 className="text-2xl font-black font-heading text-charcoal dark:text-darktext tracking-tight">
                    Ecological Impact Analysis
                  </h3>
                  <p className="text-xs text-charcoal/60 dark:text-darktext-muted mt-1">
                    Transparent lifecycle evaluation based on UNEP & EPA solid waste documentation.
                  </p>
                </div>

                {/* Estimate & Assumptions */}
                <div className="p-5 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-2 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-forest dark:text-emeraldaccent uppercase tracking-wider">
                      Diverted Material Mass (Estimate)
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-forest dark:text-emeraldaccent border border-emerald-500/30">
                      Verified Methodology
                    </span>
                  </div>
                  <div className="text-xl font-black font-heading text-charcoal dark:text-darktext">
                    {analysisResult.environmentalImpact.divertedGramsEstimate || "Estimated 30 - 100g"}
                  </div>
                  <p className="text-xs text-charcoal/60 dark:text-darktext-muted italic leading-relaxed">
                    Assumptions: {analysisResult.environmentalImpact.transparentAssumptions}
                  </p>
                </div>

                {/* Benefits vs Disadvantages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-2 transition-colors">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-forest dark:text-emeraldaccent">
                      Environmental Benefits
                    </h5>
                    <ul className="space-y-1.5 text-xs text-charcoal/70 dark:text-darktext-secondary">
                      {(
                        analysisResult.environmentalBenefits ||
                        analysisResult.environmentalImpact.qualitativeAdvantages || [
                          "Diverts virgin polymers from landfill streams",
                          "Reduces greenhouse gas hauling emissions",
                        ]
                      ).map((adv: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest dark:text-emeraldaccent shrink-0 mt-0.5" />
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-500/10 dark:bg-[#E07A5F]/10 border border-amber-500/25 dark:border-[#E07A5F]/25 space-y-2 transition-colors">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-[#E07A5F]">
                      Environmental Disadvantages & Limitations
                    </h5>
                    <ul className="space-y-1.5 text-xs text-charcoal/70 dark:text-darktext-secondary">
                      {(
                        analysisResult.environmentalDisadvantages ||
                        analysisResult.environmentalImpact.possibleDisadvantages || [
                          "Material integrity degrades over extended multi-year outdoor exposure",
                        ]
                      ).map((dis: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-[#E07A5F] shrink-0 mt-0.5" />
                          <span>{dis}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 4-Way Route Comparison Matrix */}
                {analysisResult.environmentalImpact.comparisonMatrix && (
                  <div className="space-y-3">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 dark:text-darktext-muted">
                      Route Comparison Matrix
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="p-4 rounded-xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
                        <span className="font-bold text-forest dark:text-emeraldaccent">1. Reuse or Repair</span>
                        <p className="text-charcoal/70 dark:text-darktext-secondary">
                          {analysisResult.environmentalImpact.comparisonMatrix.reuseOrRepair}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
                        <span className="font-bold text-forest dark:text-emeraldaccent">2. DIY Transformation</span>
                        <p className="text-charcoal/70 dark:text-darktext-secondary">
                          {analysisResult.environmentalImpact.comparisonMatrix.diyTransformation}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
                        <span className="font-bold text-forest dark:text-emeraldaccent">3. Formal Recycling</span>
                        <p className="text-charcoal/70 dark:text-darktext-secondary">
                          {analysisResult.environmentalImpact.comparisonMatrix.formalRecycling}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border space-y-1 transition-colors">
                        <span className="font-bold text-forest dark:text-emeraldaccent">4. Safe Disposal</span>
                        <p className="text-charcoal/70 dark:text-darktext-secondary">
                          {analysisResult.environmentalImpact.comparisonMatrix.safeDisposal}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Final Recommended Action */}
                <div className="p-5 rounded-2xl bg-cream-50 dark:bg-night-card border border-forest/30 dark:border-[#43E6A1]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-forest dark:text-emeraldaccent">
                      Final Recommended Action
                    </span>
                    <p className="text-sm font-semibold text-charcoal dark:text-darktext mt-0.5">
                      {analysisResult.environmentalImpact.recommendationRationale}
                    </p>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-xl bg-forest dark:bg-[#43E6A1] text-white dark:text-[#0B1110] font-bold text-xs uppercase tracking-wider shrink-0 shadow-sm">
                    Route: {analysisResult.environmentalImpact.recommendedRoute || analysisResult.recoveryStatus}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* "I COMPLETED THIS PROJECT" SUBMISSION MODAL */}
        {/* ======================================================== */}
        <AnimatePresence>
          {completionModalOpen && selectedOptionForCompletion && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-night-secondary border border-sage/40 dark:border-night-border rounded-3xl p-6 sm:p-8 shadow-elevated space-y-6 max-h-[90vh] overflow-y-auto transition-colors"
              >
                <div className="flex items-center justify-between border-b border-sage/30 dark:border-night-border pb-4">
                  <div>
                    <h3 className="text-xl font-black font-heading text-charcoal dark:text-darktext">
                      Submit Completed Project
                    </h3>
                    <p className="text-xs text-charcoal/60 dark:text-darktext-muted mt-0.5">
                      Earn +40 eco-points and verified impact badge credit
                    </p>
                  </div>
                  <button
                    onClick={() => setCompletionModalOpen(false)}
                    className="p-1.5 rounded-lg text-charcoal/60 dark:text-darktext-muted hover:text-charcoal dark:hover:text-darktext hover:bg-cream-100 dark:hover:bg-night-card transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitCompletion} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-cream-50 dark:bg-night-card border border-sage/30 dark:border-night-border text-xs space-y-1 transition-colors">
                    <span className="font-bold text-forest dark:text-emeraldaccent block uppercase tracking-wider">
                      Target Blueprint:
                    </span>
                    <span className="text-charcoal dark:text-darktext font-semibold text-sm block">
                      {selectedOptionForCompletion.title}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-2">
                      Upload Proof / Evidence Photo *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEvidenceFileChange}
                      required
                      className="w-full text-xs text-charcoal/70 dark:text-darktext-secondary file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-forest dark:file:bg-[#43E6A1] file:text-white dark:file:text-[#0B1110] hover:file:bg-forest-light dark:hover:file:bg-[#75F0B7] file:cursor-pointer"
                    />
                  </div>

                  {evidencePreview && (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-sage/40 dark:border-night-border">
                      <img
                        src={evidencePreview}
                        alt="Evidence preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 dark:text-darktext-secondary mb-2">
                      Project Notes or Reflections (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      placeholder="Share how the project went, tools you substituted, or where you're using it..."
                      className="w-full p-3.5 rounded-xl border border-sage/40 dark:border-night-border bg-white dark:bg-night-card text-xs text-charcoal dark:text-darktext placeholder:text-charcoal/40 dark:placeholder:text-darktext-muted focus:outline-none focus:border-forest dark:focus:border-emeraldaccent focus:ring-1 focus:ring-forest dark:focus:ring-emeraldaccent"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-sage/30 dark:border-night-border">
                    <button
                      type="button"
                      onClick={() => setCompletionModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold text-charcoal/70 dark:text-darktext-secondary hover:bg-cream-100 dark:hover:bg-night-card transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingCompletion || !evidenceFile}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white dark:text-night bg-forest hover:bg-forest-light dark:bg-emeraldaccent dark:hover:bg-emeraldaccent-hover disabled:opacity-50 transition-all shadow-glow"
                    >
                      {submittingCompletion ? "Submitting..." : "Submit Completion (+40 pts)"}
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
