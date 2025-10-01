"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Download, Share2, MoreHorizontal, BadgeCheck } from "lucide-react";

export default function TagPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Image */}
          <div className="relative">
            <div className="aspect-[1/1] w-full overflow-hidden rounded-[20px]">
              <Image
                src="/images/tag1.png"
                alt="Brand Trip Talk - Jordan Lee with suitcase"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6">
            {/* Title and Verified Badge */}
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">Brand Trip Talk</h1>
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* ID/Address */}
            <div className="text-gray-400 text-sm">
              <span className="font-mono">Oxe7k2...f3b76</span>
            </div>

            {/* Description */}
            <div className="text-gray-300 leading-relaxed">
              <p>
                Influencer Jordan Lee speaks at a luxurious retreat, hosted by Ladi Travels, 
                sharing insights on sustainable living and eco-friendly choices.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* Download Button */}
              <Button 
                variant="outline" 
                size="icon"
                className="h-12 w-12 bg-[#2D2D30] border-gray-600 hover:bg-[#3D3D40] text-white rounded-lg"
              >
                <Download className="h-5 w-5" />
              </Button>

              {/* Share Button */}
              <Button 
                variant="outline" 
                size="icon"
                className="h-12 w-12 bg-[#2D2D30] border-gray-600 hover:bg-[#3D3D40] text-white rounded-lg"
              >
                <Share2 className="h-5 w-5" />
              </Button>

              {/* More Options Button */}
              <Button 
                variant="outline" 
                size="icon"
                className="h-12 w-12 bg-[#2D2D30] border-gray-600 hover:bg-[#3D3D40] text-white rounded-lg"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
