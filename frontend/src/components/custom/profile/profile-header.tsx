"use client"

import Image from "next/image"
import { BadgeCheck, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation";

type Props = {
  name: string
  handle: string
  address: string
  coverSrc: string
  avatarSrc: string
  bio:any
}

export function ProfileHeader({ name, handle, address, coverSrc, avatarSrc ,bio}: Props) {
  const router = useRouter();

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
    } catch {
      // silent fail in preview
    }
  }

  const handleEditProfile = () => {
    router.push("/profile/edit");
  }

  return (
    <header className="mb-8 border-b border-border/60 bg-[#181A1D] text-white">
      <div className="relative h-40 w-full overflow-hidden md:h-56">
        <Image
          src={coverSrc || "/placeholder.svg"}
          alt={`${name} cover image`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Profile photo positioned outside banner to avoid clipping */}
      <div className="relative -mt-12 ml-4 z-10">
        <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-black shadow-xl bg-[#2E3137]">
          <Image
            src={avatarSrc || "/placeholder.svg"}
            alt={`${name} avatar`}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="mx-auto mt-4 w-full max-w-6xl px-4 pb-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold leading-none md:text-2xl">{name}</h1>
            <BadgeCheck aria-hidden className="h-5 w-5 text-blue-500" strokeWidth={2.5} />
          </div>

          <Button onClick={handleEditProfile} size="sm" className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 transition-all duration-200 shadow-lg hover:shadow-xl" aria-label="Edit profile">
            Edit profile
          </Button>
        </div>

        <div className="mt-3 space-y-2 text-sm text-gray-400">
          <p>
            Created by <span className="text-white">{name}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Address:</span>
            <span className="truncate text-white" aria-label="wallet address">
              {address}
            </span>
            <Button variant="secondary" size="icon" className="h-7 w-7 cursor-pointer" onClick={copyAddress} aria-label="Copy address">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ul className="mt-4 grid gap-2 text-sm text-white">
             <li className="flex items-start gap-2">
              <span className={cn("mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/70 text-white")} />
              <span className="text-pretty">{bio}</span>
            </li>
        </ul>
      </div>
    </header>
  )
}
