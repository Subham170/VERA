"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

interface CancelConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: () => void;
  onKeepEditing: () => void;
}

export default function CancelConfirmationPopup({
  isOpen,
  onClose,
  onConfirmCancel,
  onKeepEditing,
}: CancelConfirmationPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="bg-[#2A2D35] border-[#3A3D45] shadow-2xl w-full max-w-md mx-4 relative">
        <CardContent className="p-6">
          {/* Close Button - Inside Modal */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-[#3A3D45] rounded-lg flex items-center justify-center hover:bg-[#4A4D55] transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Worried Face Emoji */}
            <div className="flex justify-center mb-4">
              <div className="text-6xl">😟</div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-2">Cancel?</h2>

            {/* Message */}
            <p className="text-gray-300 mb-6">
              You are about to cancel your media tag upload. Are you sure you
              want to continue?
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={onConfirmCancel}
                className="bg-transparent border-gray-600 text-white hover:bg-[#3A3D45] hover:border-gray-500 transition-all duration-200 flex-1"
              >
                Cancel Tagging
              </Button>

              <Button
                onClick={onKeepEditing}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 transition-all duration-200 shadow-lg hover:shadow-xl flex-1"
              >
                Keep editing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
