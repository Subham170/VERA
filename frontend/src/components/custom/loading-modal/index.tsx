"use client";

import { Info, Shield } from "lucide-react";

interface LoadingModalProps {
  isVisible: boolean;
  title: string;
  subtitle: string;
  steps: {
    text: string;
    completed: boolean;
  }[];
  progress: number; // 0-100
  showSecurityNote?: boolean;
}

export default function LoadingModal({
  isVisible,
  title,
  subtitle,
  steps,
  progress,
  showSecurityNote = true,
}: LoadingModalProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#2A2D35] border border-[#3A3D45] rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-300 text-sm">{subtitle}</p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-6">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  step.completed ? "bg-blue-500" : "bg-gray-600"
                }`}
              />
              <span
                className={`text-sm ${
                  step.completed ? "text-white" : "text-gray-400"
                }`}
              >
                {step.text}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Security Note */}
        {showSecurityNote && (
          <div className="bg-[#1a1d23] border border-blue-500/30 rounded-lg p-3 flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-300 text-xs">
              Your media is processed securely and never stored permanently
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
