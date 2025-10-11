"use client";

import { ChevronLeft, ChevronRight, Clock, FileText, Shield } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Media {
  _id: string;
  file_name: string;
  description: string;
  img_urls: string[];
  video_urls: string[];
  audio_urls: string[];
  file_count: number;
  is_bulk_upload: boolean;
  createdAt: string;
  view_count: number;
  like_count: number;
  type?: string;
}

interface BulkMediaCardProps {
  media: Media;
}

export default function BulkMediaCard({ media }: BulkMediaCardProps) {
  const router = useRouter();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const allMediaUrls = [
    ...media.img_urls,
    ...media.video_urls,
    ...media.audio_urls,
  ];

  const currentMediaUrl = allMediaUrls[currentMediaIndex];
  const isImage = media.img_urls.includes(currentMediaUrl);
  const isVideo = media.video_urls.includes(currentMediaUrl);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "img":
        return <FileText className="w-3 h-3" />;
      case "video":
        return <Clock className="w-3 h-3" />;
      case "audio":
        return <Clock className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => 
      prev === 0 ? allMediaUrls.length - 1 : prev - 1
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => 
      prev === allMediaUrls.length - 1 ? 0 : prev + 1
    );
  };

  const handleCardClick = () => {
    router.push(`/tag/${media._id}`);
  };

  const handleViewDetails = () => {
    setIsNavigating(true);
    router.push(`/tag/${media._id}`);
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
        {currentMediaUrl ? (
          isImage ? (
            <Image
              src={currentMediaUrl}
              alt={media.file_name}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : isVideo ? (
            <video
              src={currentMediaUrl}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800">
              <span className="text-gray-400 text-sm">Audio Preview</span>
            </div>
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800">
            <span className="text-gray-400 text-sm">No Preview</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Verification Badge */}
        <div className="absolute top-3 right-3 w-8 h-8 bg-green-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
          <Shield className="w-4 h-4 text-white" />
        </div>

        {/* Type Badge with File Count */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg flex items-center gap-1">
          {getTypeIcon(media.type || "img")}
          <span className="text-xs text-white font-medium">
            {media.type?.toUpperCase() || "IMG"}
          </span>
          <span className="text-xs text-blue-300 font-bold ml-1">
            ({media.file_count})
          </span>
        </div>

        {/* File Counter */}
        {allMediaUrls.length > 1 && (
          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs font-medium">
            {currentMediaIndex + 1} of {allMediaUrls.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {allMediaUrls.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {allMediaUrls.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
            {allMediaUrls.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentMediaIndex
                    ? "bg-white"
                    : "bg-white/50"
                }`}
              />
            ))}
          </div>
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
          <h3 className="text-white text-sm font-semibold truncate group-hover:text-blue-100 transition-colors duration-200">
            {media.file_name}
          </h3>
          <p className="text-blue-400 text-xs font-medium truncate">
            @{media.type || "img"}
          </p>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Verified</span>
          </div>
          <div className="text-xs text-gray-500">
            {new Date(media.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
