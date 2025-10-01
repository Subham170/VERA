"use client"

import { X } from "lucide-react"
import { useState } from "react"

export default function AnnouncementBanner() {
  const [open, setOpen] = useState(true)
  if (!open) return null

  return (
    <div className="mx-auto mt-6 max-w-screen-2xl px-4 text-white">
      <div className="relative flex items-start gap-3 rounded-xl bg-surface px-4 py-3 text-sm ring-1 ring-border">
        <p className="text-muted-foreground">
          <span className="font-medium">Welcome to V.E.R.A.</span> Your very own Verification Engine for
          Real Assets. Upload a media file to start tagging.{" "}
          <a className="underline hover:no-underline" href="#">
            Learn more
          </a>
          .
        </p>
        <button
          className="absolute right-2 top-2 grid size-7 place-items-center rounded-md hover:bg-secondary"
          aria-label="Dismiss announcement"
          onClick={() => setOpen(false)}
        >
          <X className="size-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
