"use client";

import { ChevronLeft, ChevronRight, Clock, Eye, FileText, Shield } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type BulkMedia = {
  id: string;
  title: string;
  handle: string;
  thumbnail: string;
  type: string;
  img_urls?: string[];
  video_urls?: string[];
  audio_urls?: string[];
  file_count: number;
  is_bulk_upload: boolean;
};

export function BulkMediaCard({ item }: { item: BulkMedia }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "img":
        return <FileText className="w-3 h-3" />;
      case "video":
        return <Eye className="w-3 h-3" />;
      case "audio":
        return <Clock className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const getMediaUrls = () => {
    switch (item.type) {
      case "img":
        return item.img_urls || [];
      case "video":
        return item.video_urls || [];
      case "audio":
        return item.audio_urls || [];
      default:
        return [];
    }
  };

  const mediaUrls = getMediaUrls();
  const currentMediaUrl = mediaUrls[currentIndex] || item.thumbnail;

  const handleCardClick = () => {
    router.push(`/tag/${item.id}`);
  };

  const handleViewDetails = () => {
    setIsNavigating(true);
    router.push(`/tag/${item.id}`);
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaUrls.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < mediaUrls.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      className="group relative bg-[#2E3137]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={currentMediaUrl || "/placeholder.svg"}
          alt={item.title}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Verification Badge */}
        <div className="absolute top-3 right-3 w-8 h-8 bg-green-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
          <Shield className="w-4 h-4 text-white" />
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg flex items-center gap-1">
          {getTypeIcon(item.type)}
          <span className="text-xs text-white font-medium">
            {item.type?.toUpperCase() || "IMG"}
          </span>
        </div>

        {/* File Count Badge */}
        {item.is_bulk_upload && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-blue-500/90 backdrop-blur-sm rounded-lg">
            <span className="text-xs text-white font-medium">
              {item.file_count} files
            </span>
          </div>
        )}

        {/* Carousel Navigation */}
        {item.is_bulk_upload && mediaUrls.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            {/* Dots Indicator */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {mediaUrls.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
            isHovered || isNavigating ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-white/90 text-blue-600 font-semibold px-6 py-2 rounded-xl shadow-lg">
            View Details
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="text-white font-semibold truncate text-sm">
            {item.title}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-blue-400 text-xs">{item.handle}</p>
            {item.is_bulk_upload && (
              <p className="text-gray-400 text-xs">
                {currentIndex + 1} of {mediaUrls.length}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Verified</span>
          </div>
          <span className="text-gray-400">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
