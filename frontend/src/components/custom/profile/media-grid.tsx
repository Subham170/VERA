import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MediaCard } from "./media-card";
import BulkMediaCard from "./bulk-media-card";

interface TagItem {
  _id: string;
  file_name: string;
  description?: string;
  type: "img" | "video" | "audio";
  img_urls?: string[];
  video_urls?: string[];
  audio_urls?: string[];
  file_count?: number;
  is_bulk_upload?: boolean;
  createdAt?: string;
  view_count?: number;
  like_count?: number;
}

interface MediaGridProps {
  mediaItems?: TagItem[];
}

export function MediaGrid({ mediaItems = [] }: MediaGridProps) {
  if (mediaItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg p-8 text-center text-white">
        <Image
          src="/images/robot.png"
          alt="No tags yet"
          width={84}
          height={84}
          className="mb-6 h-auto w-full max-w-xs"
          priority
        />
        <p className="text-sm text-gray-400">{`You have no tags created yet. You'll see all created tags here.`}</p>
        <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 transition-all duration-200 shadow-lg hover:shadow-xl">
          Create tag
        </Button>
      </div>
    );
  }

  const mappedItems = mediaItems.map((tag) => {
    let thumbnail = "";
    switch (tag.type) {
      case "img":
        thumbnail = tag.img_urls?.[0] || "/images/placeholder.png";
        break;
      case "video":
        thumbnail = tag.video_urls?.[0] || "/images/video-placeholder.png";
        break;
      case "audio":
        thumbnail = "/images/audio-placeholder.png";
        break;
    }
    return {
      id: tag._id,
      title: tag.file_name,
      handle: `@${tag.type}`,
      thumbnail,
      type: tag.type,
      img_urls: tag.img_urls || [],
      video_urls: tag.video_urls || [],
      audio_urls: tag.audio_urls || [],
      file_count: tag.file_count || 1,
      is_bulk_upload: tag.is_bulk_upload || false,
      // Add properties needed for BulkMediaCard
      _id: tag._id,
      file_name: tag.file_name,
      description: tag.description || "",
      createdAt: tag.createdAt || new Date().toISOString(),
      view_count: tag.view_count || 0,
      like_count: tag.like_count || 0,
    };
  });

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {mappedItems.map((item, index) => (
        <div
          key={item.id}
          className="animate-in fade-in slide-in-from-bottom-4"
          style={{
            animationDelay: `${index * 100}ms`,
            animationFillMode: "both",
          }}
        >
          {item.is_bulk_upload ? (
            <BulkMediaCard media={item as any} />
          ) : (
            <MediaCard item={item} />
          )}
        </div>
      ))}
    </div>
  );
}
