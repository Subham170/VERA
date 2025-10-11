"use client";

import { AlertTriangle, Download, Trash2 } from "lucide-react";

interface ConfirmationModalProps {
  isVisible: boolean;
  type: "delete" | "download";
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  loadingText?: string;
}

export default function ConfirmationModal({
  isVisible,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  loadingText = "Processing...",
}: ConfirmationModalProps) {
  if (!isVisible) return null;

  const isDelete = type === "delete";
  const iconColor = isDelete ? "text-red-400" : "text-blue-400";
  const bgColor = isDelete ? "bg-red-500/20" : "bg-blue-500/20";
  const borderColor = isDelete ? "border-red-500/60" : "border-blue-500/60";
  const buttonColor = isDelete
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#2A2D35] border border-[#3A3D45] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            {isDelete ? (
              <Trash2 className={`w-8 h-8 ${iconColor}`} />
            ) : (
              <Download className={`w-8 h-8 ${iconColor}`} />
            )}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Warning for delete action */}
        {isDelete && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 text-sm font-medium mb-1">Warning</p>
              <p className="text-red-300/80 text-xs">
                This action cannot be undone. The media will be permanently
                removed from the blockchain and all storage systems.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonColor}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                <span>{loadingText}</span>
              </div>
            ) : isDelete ? (
              "Delete Media"
            ) : (
              "Download Media"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
