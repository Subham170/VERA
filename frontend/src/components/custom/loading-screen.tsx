"use client";

import { BadgeCheck, Shield, Sparkles } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export default function LoadingScreen({
  message = "Loading Media Details",
  subMessage = "Verifying authenticity and fetching metadata",
}: LoadingScreenProps) {
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-teal-900/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.1),transparent_50%)]"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 max-w-md mx-auto px-6">
        {/* Animated Logo/Icon */}
        <div className="relative">
          {/* Outer Ring */}
          <div className="w-24 h-24 border-4 border-blue-500/20 rounded-full animate-spin">
            <div
              className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            />
          </div>

          {/* Inner Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Shield className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>

          {/* Sparkle Effects */}
          <div className="absolute -top-2 -right-2">
            <Sparkles
              className="w-4 h-4 text-yellow-400 animate-bounce"
              style={{ animationDelay: "0.5s" }}
            />
          </div>
          <div className="absolute -bottom-2 -left-2">
            <Sparkles
              className="w-3 h-3 text-blue-400 animate-bounce"
              style={{ animationDelay: "1s" }}
            />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            {message}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">{subMessage}</p>
        </div>

        {/* Progress Indicators */}
        <div className="w-full max-w-xs space-y-4">
          {/* Main Progress Bar */}
          <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full animate-pulse"
              style={{ width: "75%" }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Verifying</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
              <span>Loading</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-600 rounded-full" />
              <span>Complete</span>
            </div>
          </div>
        </div>

        {/* Verification Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
          <BadgeCheck className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">
            Content Verified
          </span>
        </div>
      </div>

      {/* Bottom Wave Animation */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-500/5 to-transparent">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-pulse" />
      </div>
    </main>
  );
}
