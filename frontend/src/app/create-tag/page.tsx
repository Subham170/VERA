"use client";

import AuthenticatedLayout from "@/components/custom/layouts/authenticated-layout";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/config";
import {
  ArrowRight,
  CheckCircle,
  ShieldAlert,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

interface DetectionResult {
  media_type: string;
  deepfake_probability: number;
  natural_probability: number;
  reasoning: {
    content_analysis: string;
    deepfake_indicators: string;
    authentic_indicators: string;
    overall: string;
  };
  raw_model_output: string;
  sdk_raw: any;
  provided_source: string;
  cloudinary_url: string;
  cloudinary_public_id: string;
}

interface PreparedData {
  name: string;
  description: string;
  mediaType: string;
  filePreview: string;
  detectionResult: DetectionResult;
}

export default function CreateTagPage() {
  const { isAuthorized, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDetecting, setIsDetecting] = useState(false);
  const [deepfakeWarning, setDeepfakeWarning] = useState<string | null>(null);
  const [preparedData, setPreparedData] = useState<PreparedData | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthorized) {
      router.push("/");
    }
  }, [isAuthorized, isAuthLoading, router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setPreparedData(null);
      setDeepfakeWarning(null);
    }
  };

  const handleAnalysis = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      toast.error("Please select a file to analyze.");
      return;
    }

    setIsDetecting(true);
    setDeepfakeWarning(null);
    setPreparedData(null);

    try {
      const formData = new FormData();
      formData.append("file_data", file);

      const response = await fetch(`${API_BASE_URL}/api/detect`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Detection service failed: ${errorText}`);
      }

      const detectionResult: DetectionResult = await response.json();

      if (detectionResult.deepfake_probability > 50) {
        setDeepfakeWarning(
          `Warning: AI analysis indicates a high probability (${detectionResult.deepfake_probability}%) that this media is a deepfake. Please review the full report carefully before proceeding.`
        );
      }

      const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      };

      const base64Preview = await fileToDataUrl(file);

      const tagDataPayload: PreparedData = {
        name: fileName,
        description: description || "",
        mediaType: file.type.split("/")[0] || "image",
        filePreview: base64Preview,
        detectionResult: detectionResult,
      };

      setPreparedData(tagDataPayload);
      toast.success("Analysis complete. You can now proceed.");
    } catch (err: any) {
      console.error("Detection error:", err);
      toast.error(err.message || "Could not analyze the media.");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleProceedToReview = () => {
    if (!preparedData) {
      toast.error("Please analyze the media first.");
      return;
    }
    localStorage.setItem("uploadedTagData", JSON.stringify(preparedData));
    router.push("/review-tag");
  };

  const handleCancel = () => {
    router.push("/");
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <AuthenticatedLayout>
      <main className="min-h-screen bg-[#181A1D]">
        {/* Loading Overlay */}
        {isDetecting && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#2A2D35] rounded-2xl p-8 max-w-md mx-4 border border-gray-700/50 shadow-2xl">
              {/* Main Loading Animation */}
              <div className="flex flex-col items-center space-y-6">
                {/* Animated Shield Icon */}
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                    <ShieldAlert className="w-10 h-10 text-white animate-pulse" />
                  </div>
                  {/* Rotating Ring */}
                  <div className="absolute inset-0 w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                  {/* Outer Pulse Ring */}
                  <div className="absolute inset-0 w-20 h-20 border-2 border-blue-400/20 rounded-full animate-ping"></div>
                </div>

                {/* Loading Text */}
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-white">
                    Analyzing Media
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Detecting deepfake indicators...
                  </p>
                </div>

                {/* Progress Steps */}
                <div className="w-full space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-300">
                      Uploading media to secure servers
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                    <span className="text-sm text-gray-300">
                      Running AI analysis algorithms
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                      style={{ animationDelay: "1s" }}
                    ></div>
                    <span className="text-sm text-gray-300">
                      Verifying authenticity markers
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm text-gray-500">
                      Generating detailed report
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 w-full">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-blue-300">
                      Your media is processed securely and never stored
                      permanently
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleCancel}
          className="fixed top-20 right-4 w-10 h-10 bg-[#3A3D45] rounded-lg flex items-center justify-center hover:bg-[#4A4D55] transition-colors z-40"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center mb-12">
            <div className="flex items-center space-x-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-blue-600">
                  <span className="font-bold text-lg text-white">1</span>
                </div>
                <span className="text-white text-sm mt-3 font-medium">
                  Add & Analyze Media
                </span>
              </div>
              <div className="w-16 h-0.5 bg-gray-600"></div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-white border-2 border-blue-600">
                  <span className="font-bold text-lg text-blue-600">2</span>
                </div>
                <span className="text-white text-sm mt-3 font-medium">
                  Review & Register
                </span>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={handleAnalysis}
              className="bg-[#2A2D35] p-8 rounded-lg border border-[#3A3D45] space-y-6"
            >
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Upload Media
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,video/*,audio/*"
                  />
                  <div className="mx-auto w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    <UploadCloud className="w-6 h-6 text-gray-400" />
                  </div>
                  {file ? (
                    <p className="mt-2 text-sm text-green-400">
                      {file.name} selected
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-gray-400">
                      Click to browse or drag & drop
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="fileName"
                  className="text-sm font-medium text-gray-300 mb-2 block"
                >
                  Media Name
                </label>
                <input
                  type="text"
                  id="fileName"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g., My Summer Vacation Video"
                  className="w-full bg-[#3A3D45] border border-gray-600 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-300 mb-2 block"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A short description of your media file..."
                  rows={3}
                  className="w-full bg-[#3A3D45] border border-gray-600 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={isDetecting || !file}
                className={`w-full font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isDetecting || !file
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
                }`}
              >
                {isDetecting ? (
                  "Analyzing..."
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 mr-2" />
                    Detect Deepfake
                  </>
                )}
              </button>
            </form>
          </div>

          {deepfakeWarning && (
            <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-900/50 border border-red-500/60 rounded-lg flex items-start space-x-4">
              <ShieldAlert className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-red-300">
                  High Deepfake Probability Detected
                </h4>
                <p className="text-sm text-red-300/80 mt-1">
                  {deepfakeWarning}
                </p>
              </div>
            </div>
          )}

          {preparedData && !isDetecting && (
            <div className="max-w-2xl mx-auto mt-6 p-4 bg-green-900/50 border border-green-500/60 rounded-lg flex items-center space-x-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-300 font-medium">
                Analysis complete. You can now proceed to the review step.
              </p>
            </div>
          )}

          <div className="max-w-2xl mx-auto mt-6">
            <button
              onClick={handleProceedToReview}
              disabled={!preparedData || isDetecting}
              className={`w-full font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                !preparedData || isDetecting
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/25"
              }`}
            >
              <span>Continue to Review</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#2A2D35",
            color: "#fff",
            border: "1px solid #3A3D45",
          },
        }}
      />
    </AuthenticatedLayout>
  );
}
