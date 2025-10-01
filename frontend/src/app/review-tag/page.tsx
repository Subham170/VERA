"use client";

import CancelConfirmationPopup from "@/components/custom/cancel-confirmation-popup";
import AuthenticatedLayout from "@/components/custom/layouts/authenticated-layout";
import SiteNavbar from "@/components/custom/layouts/navbar";
import ReviewTagModal from "@/components/custom/review-tag-modal";
import SuccessPopup from "@/components/custom/success-popup";
import UpdateMediaTagModal from "@/components/custom/update-media-tag-modal";
import { useAuth } from "@/context/AuthContext";
import { useTagData } from "@/context/TagDataContext";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReviewTagPage() {
  const { isAuthorized, isLoading } = useAuth();
  const { tagData, clearTagData } = useTagData();
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [uploadData, setUploadData] = useState<{
    isBulkUpload?: boolean;
    fileCount?: number;
    collectionName?: string;
    fileName?: string;
    description?: string;
    mediaType?: string;
    importedUrl?: string;
  }>({});
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.push("/");
    }
  }, [isAuthorized, isLoading, router]);

  useEffect(() => {
    // Simulate page loading for smooth transition
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Get data from context
  useEffect(() => {
    if (tagData) {
      const data = {
        fileName: tagData.fileName,
        description: tagData.description,
        mediaType: tagData.mediaType,
        isBulkUpload: tagData.isBulkUpload,
        fileCount: tagData.fileCount,
        collectionName: tagData.fileName,
        importedUrl: tagData.importedUrl || undefined,
      };
      setUploadData(data);
    } else {
      // Redirect to create-tag if no data available
      router.push("/create-tag");
    }
  }, [tagData, router]);

  // Handle payment processing
  const handlePayFees = () => {
    setIsProcessingPayment(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowSuccessPopup(true);
    }, 3000);
  };

  // Handle cancel actions
  const handleCancel = () => {
    setShowCancelConfirmation(true);
  };

  const handleCloseButton = () => {
    setShowCancelConfirmation(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirmation(false);
    clearTagData(); // Clear the tag data when canceling
    router.push("/create-tag");
  };

  const handleKeepEditing = () => {
    setShowCancelConfirmation(false);
  };

  // Handle success popup actions
  const handleViewTaggedMedia = () => {
    setShowSuccessPopup(false);
    clearTagData(); // Clear the tag data after successful completion
    router.push("/");
  };

  const handleShare = () => {
    // Implement share functionality
    console.log("Share functionality");
  };

  const handleCreateNewTag = () => {
    setShowSuccessPopup(false);
    router.push("/create-tag"); // Navigate to create-tag page
  };

  // Handle update functionality
  const handleUpdate = () => {
    setShowUpdateModal(true);
  };

  const handleUpdateSave = (data: any) => {
    console.log("Updating media tag:", data);
    // Here you would typically make an API call to update the media tag
    setShowUpdateModal(false);
    // Show success message or update the UI
  };

  const handleUpdateClose = () => {
    setShowUpdateModal(false);
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

        {/* Close Button - Positioned just below navbar on top-right */}
        <button
          onClick={handleCloseButton}
          className="fixed top-20 right-4 w-10 h-10 bg-[#3A3D45] rounded-lg flex items-center justify-center hover:bg-[#4A4D55] transition-colors z-50"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="container mx-auto px-4 py-8">
          {/* Progress Indicator - Step 2 Active */}
          <div className="flex justify-center items-center mb-12">
            <div className="flex items-center space-x-8">
              {/* Step 1 - Completed */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-blue-600 shadow-lg">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <span className="text-white text-sm mt-3 font-medium">
                  Add New Tag
                </span>
              </div>

              {/* Solid connecting line */}
              <div className="w-16 h-0.5 bg-blue-400"></div>

              {/* Step 2 - Active */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <span className="text-white text-sm mt-3 font-medium">
                  Review Tag
                </span>
              </div>
            </div>
          </div>

          {/* Review Tag Modal with Animation */}
          <div
            className={`transition-all duration-500 ${
              isPageLoading
                ? "opacity-0 transform translate-y-4"
                : "opacity-100 transform translate-y-0"
            }`}
          >
            <ReviewTagModal
              onCancel={handleCancel}
              onPayFees={handlePayFees}
              isLoading={isProcessingPayment}
              isBulkUpload={uploadData.isBulkUpload}
              fileCount={uploadData.fileCount}
              collectionName={uploadData.collectionName}
              fileName={uploadData.fileName}
              description={uploadData.description}
              mediaType={uploadData.mediaType}
            />
          </div>
        </div>

        {/* Success Popup */}
        <SuccessPopup
          isOpen={showSuccessPopup}
          onClose={() => setShowSuccessPopup(false)}
          onViewTaggedMedia={handleViewTaggedMedia}
          onShare={handleShare}
          onCreateNewTag={handleCreateNewTag}
        />

        {/* Cancel Confirmation Popup */}
        <CancelConfirmationPopup
          isOpen={showCancelConfirmation}
          onClose={() => setShowCancelConfirmation(false)}
          onConfirmCancel={handleConfirmCancel}
          onKeepEditing={handleKeepEditing}
        />

        {/* Update Media Tag Modal */}
        <UpdateMediaTagModal
          isOpen={showUpdateModal}
          onClose={handleUpdateClose}
          onSave={handleUpdateSave}
          isBulkUpdate={uploadData.isBulkUpload}
          fileCount={uploadData.fileCount}
          currentData={{
            fileName: uploadData.fileName || "My Media",
            description: uploadData.description || "No description provided",
            mediaType:
              (uploadData.mediaType as "image" | "video" | "audio" | "text") ||
              "image",
          }}
        />
      </main>
    </AuthenticatedLayout>
  );
}
