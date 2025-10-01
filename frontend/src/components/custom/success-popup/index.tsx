"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, PartyPopper, Share, X } from "lucide-react";

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  blockchainId?: string;
  onViewTaggedMedia?: () => void;
  onShare?: () => void;
  onCreateNewTag?: () => void;
}

export default function SuccessPopup({
  isOpen,
  onClose,
  blockchainId = "0x000...0000",
  onViewTaggedMedia,
  onShare,
  onCreateNewTag,
}: SuccessPopupProps) {
  if (!isOpen) return null;

  const handleCloseClick = () => {
    if (onCreateNewTag) {
      onCreateNewTag();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="bg-[#2A2D35] border-[#3A3D45] shadow-2xl w-full max-w-md mx-4 relative">
        <CardContent className="p-6">
          {/* Close Button - Inside Modal */}
          <button
            onClick={handleCloseClick}
            className="absolute top-4 right-4 w-8 h-8 bg-[#3A3D45] rounded-lg flex items-center justify-center hover:bg-[#4A4D55] transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Confetti Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <PartyPopper className="w-8 h-8 text-green-400" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-2">Success</h2>

            {/* Message */}
            <p className="text-gray-300 mb-4">
              Your media is now tagged & traceable.
            </p>

            {/* Blockchain ID */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-1">Blockchain ID:</p>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-mono transition-colors">
                {blockchainId}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onViewTaggedMedia}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 transition-all duration-200 shadow-lg hover:shadow-xl flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View tagged media
              </Button>

              <Button
                variant="outline"
                onClick={onShare}
                className="bg-transparent border-gray-600 text-white hover:bg-[#3A3D45] hover:border-gray-500 transition-all duration-200 flex-1"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
