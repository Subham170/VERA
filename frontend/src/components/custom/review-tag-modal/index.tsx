"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Eye, Wallet } from "lucide-react";
import { useState } from "react";

interface ReviewTagModalProps {
  onCancel?: () => void;
  onPayFees?: () => void;
  isLoading?: boolean;
}

export default function ReviewTagModal({
  onCancel,
  onPayFees,
  isLoading = false,
}: ReviewTagModalProps) {
  const [isSliderEnabled, setIsSliderEnabled] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Enhanced Modal Container */}
      <Card className="bg-[#2A2D35] border-[#3A3D45] shadow-2xl">
        <CardContent className="p-8">
          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Review your media tag
          </h1>

          {/* Description */}
          <p className="text-gray-300 text-base mb-8">
            Check out your media tag preview and continue once your happy with
            it
          </p>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left Card - Media Preview */}
            <Card className="bg-[#3A3D45] border-[#4A4D55]">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Image Container */}
                  <div className="relative">
                    <div className="w-full h-64 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                      {/* Placeholder for uploaded image */}
                      <div className="text-center text-white">
                        <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Eye className="w-12 h-12 text-blue-400" />
                        </div>
                        <p className="text-sm text-gray-400">Media Preview</p>
                      </div>

                      {/* Checkmark overlay */}
                      <div className="absolute bottom-3 right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold">
                      BrandTripTalk.jpg
                    </h3>
                    <p className="text-blue-400 text-sm">@JordanLeex</p>
                  </div>

                  {/* View Tag Button */}
                  <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200">
                    <Eye className="w-4 h-4 mr-2" />
                    View Tag
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right Card - Tag Details & Fees */}
            <Card className="bg-[#3A3D45] border-[#4A4D55] relative">
              <CardContent className="p-6">
                {/* Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-[#3A3D45]/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                      {/* Animated Loading Spinner */}
                      <div className="relative w-16 h-16 mb-4">
                        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-green-500 rounded-full animate-spin"></div>
                      </div>
                      <p className="text-white text-sm">
                        Processing payment...
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Tag ID */}
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Tag ID</p>
                    <p className="text-white font-mono text-sm">
                      0xe7k2...f3b76
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Description</p>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Influencer Jordan Lee speaks at a luxurious retreat,
                      hosted by Ladi Travels, sharing insights on sustainable
                      living and eco-friendly choices.
                    </p>
                  </div>

                  {/* Fees Breakdown */}
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Fees</h4>

                    <div className="space-y-3">
                      {/* Platform Fees */}
                      <div className="flex justify-between items-center py-2 border-b border-gray-600">
                        <span className="text-gray-300 text-sm">
                          Platform Fees:
                        </span>
                        <div className="text-right">
                          <p className="text-white font-semibold">0.001 ETH</p>
                          <p className="text-gray-400 text-xs">$3.25</p>
                        </div>
                      </div>

                      {/* Gas Fees */}
                      <div className="flex justify-between items-center py-2 border-b border-gray-600">
                        <span className="text-gray-300 text-sm">Gas Fees:</span>
                        <div className="text-right">
                          <p className="text-white font-semibold">0.002 ETH</p>
                          <p className="text-gray-400 text-xs">$6.50</p>
                        </div>
                      </div>

                      {/* Total Fees */}
                      <div className="flex justify-between items-center py-2 bg-blue-500/10 rounded-lg px-3">
                        <span className="text-white font-semibold">
                          Total Fees:
                        </span>
                        <div className="text-right">
                          <p className="text-white font-bold">0.003 ETH</p>
                          <p className="text-blue-400 text-sm font-semibold">
                            $9.75
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={onCancel}
              className="bg-transparent border-gray-600 text-white hover:bg-[#3A3D45] hover:border-gray-500 transition-all duration-200"
            >
              Cancel
            </Button>

            <div className="flex items-center space-x-4">
              {/* Slider */}
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 text-sm">Auto-pay</span>
                <button
                  onClick={() => setIsSliderEnabled(!isSliderEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    isSliderEnabled ? "bg-blue-500" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      isSliderEnabled ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Pay Fees Button */}
              <Button
                onClick={onPayFees}
                className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isLoading ? "Processing..." : "Pay fees"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
