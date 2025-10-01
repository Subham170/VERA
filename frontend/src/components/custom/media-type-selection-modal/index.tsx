"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Image, Link, Music, Video, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface MediaTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMediaTypeSelected: (type: "image" | "video" | "audio" | "text") => void;
  onUrlImport: (
    url: string,
    mediaType: "image" | "video" | "audio" | "text"
  ) => void;
}

export default function MediaTypeSelectionModal({
  isOpen,
  onClose,
  onMediaTypeSelected,
  onUrlImport,
}: MediaTypeSelectionModalProps) {
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  if (!isOpen) return null;

  const mediaTypes = [
    {
      type: "image" as const,
      icon: Image,
      title: "Image",
      description: "JPG, PNG, GIF, SVG",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      type: "video" as const,
      icon: Video,
      title: "Video",
      description: "MP4, WEBM, MOV",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      type: "audio" as const,
      icon: Music,
      title: "Audio",
      description: "MP3, WAV, AAC",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      type: "text" as const,
      icon: FileText,
      title: "Text",
      description: "TXT, PDF, DOC",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
  ];

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    const url = urlInput.trim();
    const detectedType = detectMediaTypeFromUrl(url);

    if (!detectedType) {
      toast.error(
        "Unable to detect media type from URL. Please check the file extension or select media type manually."
      );
      return;
    }

    // Simulate URL validation and media extraction
    try {
      toast.loading("Extracting media from URL...", { id: "url-import" });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate successful extraction
      const isValidUrl = await validateUrl(url);

      if (!isValidUrl) {
        toast.error(
          "Failed to access the URL. Please check if the link is valid and accessible.",
          { id: "url-import" }
        );
        return;
      }

      toast.success(`Successfully extracted ${detectedType} media from URL!`, {
        id: "url-import",
      });
      onUrlImport(url, detectedType);
      setUrlInput("");
    } catch (error) {
      toast.error(
        "Failed to extract media from URL. Please try again or select media type manually.",
        { id: "url-import" }
      );
    }
  };

  const validateUrl = async (url: string): Promise<boolean> => {
    try {
      // Basic URL validation
      new URL(url);

      // Simulate checking if URL is accessible
      // In a real app, you would make a HEAD request to check if the URL is accessible
      const isValidExtension =
        /\.(jpg|jpeg|png|gif|svg|webp|bmp|ico|mp4|webm|mov|avi|mkv|flv|wmv|m4v|mp3|wav|aac|flac|ogg|m4a|wma|txt|pdf|doc|docx|rtf|md)$/i.test(
          url
        );

      if (!isValidExtension) {
        throw new Error("URL does not have a supported file extension");
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  const detectMediaTypeFromUrl = (
    url: string
  ): "image" | "video" | "audio" | "text" | null => {
    const lowerUrl = url.toLowerCase();

    // Image extensions
    if (/\.(jpg|jpeg|png|gif|svg|webp|bmp|ico)$/i.test(lowerUrl)) {
      return "image";
    }

    // Video extensions
    if (/\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v)$/i.test(lowerUrl)) {
      return "video";
    }

    // Audio extensions
    if (/\.(mp3|wav|aac|flac|ogg|m4a|wma)$/i.test(lowerUrl)) {
      return "audio";
    }

    // Text extensions
    if (/\.(txt|pdf|doc|docx|rtf|md)$/i.test(lowerUrl)) {
      return "text";
    }

    return null;
  };

  const handleUrlInputChange = (value: string) => {
    setUrlInput(value);
    const detectedType = detectMediaTypeFromUrl(value);
    if (detectedType) {
      // Auto-select the detected media type
      onMediaTypeSelected(detectedType);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-[#2A2D35] border-[#3A3D45] shadow-2xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Select Media Type</h1>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-[#3A3D45] rounded-lg flex items-center justify-center hover:bg-[#4A4D55] transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* URL Import Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Link className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">
                Import from URL
              </h2>
            </div>

            <div className="flex space-x-3">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => handleUrlInputChange(e.target.value)}
                placeholder="Paste media URL here (auto-detects type)"
                className="flex-1 px-4 py-3 bg-[#3A3D45] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-200"
              />
              <Button
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim()}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import
              </Button>
            </div>

            {urlInput && detectMediaTypeFromUrl(urlInput) && (
              <p className="text-green-400 text-sm mt-2">
                ✓ Detected as {detectMediaTypeFromUrl(urlInput)} media
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center mb-8">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">
              or select manually
            </span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Media Type Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {mediaTypes.map((mediaType) => {
              const IconComponent = mediaType.icon;
              return (
                <button
                  key={mediaType.type}
                  onClick={() => onMediaTypeSelected(mediaType.type)}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${mediaType.bgColor} ${mediaType.borderColor} hover:border-opacity-40`}
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div
                        className={`w-16 h-16 ${mediaType.bgColor} rounded-full flex items-center justify-center`}
                      >
                        <IconComponent
                          className={`w-8 h-8 ${mediaType.color}`}
                        />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {mediaType.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {mediaType.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-gray-600 text-white hover:bg-[#3A3D45] hover:border-gray-500 transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
