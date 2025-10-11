"use client";

import { Shield } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export default function LoadingScreen({
  message = "Loading...",
  subMessage = "Please wait while we fetch your data",
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-[#181A1D] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-6">
        {/* Simple Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-white">{message}</h2>
          <p className="text-gray-400 text-sm">{subMessage}</p>
        </div>

        {/* Simple Progress Bar */}
        <div className="w-48 bg-gray-700/50 rounded-full h-1">
          <div
            className="h-full bg-blue-500 rounded-full animate-pulse"
            style={{ width: "60%" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
