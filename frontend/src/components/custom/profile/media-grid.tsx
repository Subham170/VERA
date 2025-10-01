import { MediaCard } from "./media-card"
import Image from "next/image"
import { Button } from "@/components/ui/button"

type MediaItem = {
  id: string;
  title: string;
  handle: string;
  thumbnail: string;
}

interface MediaGridProps {
  items?: MediaItem[];
}

export function MediaGrid({ items = [] }: MediaGridProps) {
  if (items.length === 0) {
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
        <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 transition-all duration-200 shadow-lg hover:shadow-xl">Create tag</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  )
}
