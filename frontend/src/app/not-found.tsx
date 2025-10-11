"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Home, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#181A1D] text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[#181A1D]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-teal-900/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* 404 Icon */}
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

          {/* Error Code */}
          <div className="space-y-4">
            <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Page Not Found
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Suggestions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              What you can do:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-[#2E3137]/50 rounded-lg border border-gray-700/50">
                <Search className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">Check the URL for typos</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#2E3137]/50 rounded-lg border border-gray-700/50">
                <Home className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Go back to the home page</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 font-medium">
                Need help? Try visiting our{" "}
                <button
                  onClick={() => router.push("/help")}
                  className="underline hover:text-blue-300"
                >
                  Help Center
                </button>{" "}
                or{" "}
                <button
                  onClick={() => router.push("/")}
                  className="underline hover:text-blue-300"
                >
                  Home Page
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
