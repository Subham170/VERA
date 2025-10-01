"use client";

import AuthenticatedLayout from "@/components/custom/layouts/authenticated-layout";
import SiteNavbar from "@/components/custom/layouts/navbar";
import MediaTypeSelectionModal from "@/components/custom/media-type-selection-modal";
import TagNewMediaModal from "@/components/custom/tag-new-media-modal";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function CreateTagPage() {
  const { isAuthorized, isLoading } = useAuth();
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showMediaTypeSelection, setShowMediaTypeSelection] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState<
    "image" | "video" | "audio" | "text" | null
  >(null);
  const [importedUrl, setImportedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.push("/");
    }
  }, [isAuthorized, isLoading, router]);

  const handleContinue = (data: any) => {
    console.log("Form data:", data);
    setIsTransitioning(true);
    // Add a small delay for the transition animation
    setTimeout(() => {
      router.push("/review-tag");
    }, 800);
  };

  const handleMediaTypeSelected = (
    type: "image" | "video" | "audio" | "text"
  ) => {
    setSelectedMediaType(type);
    setShowMediaTypeSelection(false);
    setShowUploadModal(true);
  };

  const handleUrlImport = (
    url: string,
    mediaType: "image" | "video" | "audio" | "text"
  ) => {
    console.log("URL import:", url, "Media type:", mediaType);
    setImportedUrl(url);
    setSelectedMediaType(mediaType);
    setShowMediaTypeSelection(false);
    setShowUploadModal(true);
  };

  const handleCloseMediaTypeSelection = () => {
    setShowMediaTypeSelection(false);
    router.push("/");
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setShowMediaTypeSelection(true);
    setImportedUrl(null);
  };

  if (isLoading) {
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
        <SiteNavbar />

        {/* Close Button - Positioned just below navbar on top-right */}
        <button
          onClick={() => router.push("/")}
          className="fixed top-20 right-4 w-10 h-10 bg-[#3A3D45] rounded-lg flex items-center justify-center hover:bg-[#4A4D55] transition-colors z-50"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="container mx-auto px-4 py-8">
          {/* Progress Indicator with Transition Animation */}
          <div className="flex justify-center items-center mb-12">
            <div className="flex items-center space-x-8">
              {/* Step 1 - Active */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
                    isTransitioning
                      ? "bg-white border-2 border-blue-600"
                      : "bg-blue-600"
                  }`}
                >
                  <span
                    className={`font-bold text-lg transition-colors duration-500 ${
                      isTransitioning ? "text-blue-600" : "text-white"
                    }`}
                  >
                    1
                  </span>
                </div>
                <span className="text-white text-sm mt-3 font-medium">
                  Add New Tag
                </span>
              </div>

              {/* Connecting line with transition */}
              <div className="relative w-16 h-0.5">
                <div
                  className={`absolute top-0 left-0 h-0.5 transition-all duration-500 ${
                    isTransitioning ? "w-full bg-blue-400" : "w-0 bg-blue-400"
                  }`}
                ></div>
                <div
                  className={`absolute top-0 left-0 w-full h-0.5 border-t-2 border-dashed border-blue-400 transition-opacity duration-500 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                  }`}
                ></div>
              </div>

              {/* Step 2 - Inactive to Active */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
                    isTransitioning
                      ? "bg-blue-600"
                      : "bg-white border-2 border-blue-600"
                  }`}
                >
                  <span
                    className={`font-bold text-lg transition-colors duration-500 ${
                      isTransitioning ? "text-white" : "text-blue-600"
                    }`}
                  >
                    2
                  </span>
                </div>
                <span className="text-white text-sm mt-3 font-medium">
                  Review Tag
                </span>
              </div>
            </div>
          </div>

          {/* Media Type Selection Modal */}
          <MediaTypeSelectionModal
            isOpen={showMediaTypeSelection}
            onClose={handleCloseMediaTypeSelection}
            onMediaTypeSelected={handleMediaTypeSelected}
            onUrlImport={handleUrlImport}
          />

          {/* Tag New Media Modal with Transition */}
          {showUploadModal && (
            <div
              className={`transition-all duration-500 ${
                isTransitioning
                  ? "opacity-0 transform scale-95"
                  : "opacity-100 transform scale-100"
              }`}
            >
              <TagNewMediaModal
                onCancel={handleCloseUploadModal}
                onContinue={handleContinue}
                mediaType={selectedMediaType}
                importedUrl={importedUrl}
              />
            </div>
          )}
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
