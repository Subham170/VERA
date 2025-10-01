"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";

type Media = {
  id: string
  title: string
  handle: string
  href?: string
  thumbnail: string
}

export function MediaCard({ item }: { item: Media }) {
  const router = useRouter();

  return (
    <div className="bg-[#45484E] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200">
      {/* Image Section */}
      <div className="relative aspect-square w-full">
        <Image
          src={item.thumbnail || "/placeholder.svg"}
          alt={item.title}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover p-2"
        />
        {/* Checkmark Icon in bottom-right corner of image */}
        <div className="absolute bottom-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Text Section */}
      <div className="p-3 space-y-1">
        <h3 className="text-white text-sm font-medium truncate">{item.title}</h3>
        <p className="text-cyan-400 text-xs truncate">{item.handle}</p>
      </div>

      {/* Button Section */}
      <div className="px-3 pb-3">
        <Button onClick={() => router.push(`/tag/${item.id}`)} className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-4 rounded transition-all duration-200 hover:scale-105">
          View Tag
        </Button>
      </div>
    </div>
  )
}
