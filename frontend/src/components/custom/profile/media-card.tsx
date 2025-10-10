"use client";
import { Button } from "@/components/ui/button";
import { Clock, Eye, FileText, Shield } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Media = {
  id: string;
  title: string;
  handle: string;
  href?: string;
  thumbnail: string;
  type?: string;
};

export function MediaCard({ item }: { item: Media }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

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

  const handleViewDetails = () => {
    setIsNavigating(true);
    router.push(`/tag/${item.id}`);
  };

  return (
    <div
      className={`group relative bg-[#2E3137]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10 ${
        isNavigating ? "opacity-75 pointer-events-none" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={item.thumbnail || "/placeholder.svg"}
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
          {getTypeIcon(item.type || "img")}
          <span className="text-xs text-white font-medium">
            {item.type?.toUpperCase() || "IMG"}
          </span>
        </div>

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
            isHovered || isNavigating ? "opacity-100" : "opacity-0"
          }`}
        >
          <Button
            onClick={handleViewDetails}
            disabled={isNavigating}
            className="bg-white/90 hover:bg-white text-blue-600 font-semibold px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isNavigating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : (
              "View Details"
            )}
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="text-white text-sm font-semibold truncate group-hover:text-blue-100 transition-colors duration-200">
            {item.title}
          </h3>
          <p className="text-blue-400 text-xs font-medium truncate">
            {item.handle}
          </p>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Verified</span>
          </div>
          <div className="text-xs text-gray-500">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
