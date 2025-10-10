"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#181A1D] text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[#181A1D]">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-orange-900/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Error Icon */}
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/25">
              <AlertTriangle className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -top-4 -right-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">!</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Something went wrong
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              We encountered an unexpected error. Don't worry, our team has been
              notified.
            </p>
            {error.digest && (
              <p className="text-sm text-gray-500 font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={reset}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="bg-[#2E3137]/50 border-gray-600 hover:bg-[#3D3D40] text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </div>

          {/* Additional Help */}
          <div className="pt-8">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 font-medium">
                If this problem persists, please contact our{" "}
                <button
                  onClick={() => router.push("/help")}
                  className="underline hover:text-red-300"
                >
                  support team
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
