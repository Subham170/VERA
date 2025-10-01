"use client";

import CancelConfirmationPopup from "@/components/custom/cancel-confirmation-popup";
import AuthenticatedLayout from "@/components/custom/layouts/authenticated-layout";
import SiteNavbar from "@/components/custom/layouts/navbar";
import ReviewTagModal from "@/components/custom/review-tag-modal";
import SuccessPopup from "@/components/custom/success-popup";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReviewTagPage() {
  const { isAuthorized, isLoading } = useAuth();
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

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
    router.push("/");
  };

  const handleKeepEditing = () => {
    setShowCancelConfirmation(false);
  };

  // Handle success popup actions
  const handleViewTaggedMedia = () => {
    setShowSuccessPopup(false);
    router.push("/");
  };

  const handleShare = () => {
    // Implement share functionality
    console.log("Share functionality");
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
            />
          </div>
        </div>

        {/* Success Popup */}
        <SuccessPopup
          isOpen={showSuccessPopup}
          onClose={() => setShowSuccessPopup(false)}
          onViewTaggedMedia={handleViewTaggedMedia}
          onShare={handleShare}
        />

        {/* Cancel Confirmation Popup */}
        <CancelConfirmationPopup
          isOpen={showCancelConfirmation}
          onClose={() => setShowCancelConfirmation(false)}
          onConfirmCancel={handleConfirmCancel}
          onKeepEditing={handleKeepEditing}
        />
      </main>
    </AuthenticatedLayout>
  );
}
