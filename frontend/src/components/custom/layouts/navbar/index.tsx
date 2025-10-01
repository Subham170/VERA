"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, Grid2X2, Search, Sparkles } from "lucide-react";
import Link from "next/link";

function LogoMark() {
  return (
    <div className="flex items-center gap-2">
      <div
        aria-hidden
        className="size-6 rounded-full bg-brand/20 ring-1 ring-brand/30 grid place-items-center"
      >
        <img
          src="images/logo.png"
          alt="V.E.R.A. logo"
          className="h-6 w-auto md:h-6 hover:scale-110 transition-transform duration-200 cursor-pointer"
        />
      </div>
      <span className="font-medium tracking-tight">V.E.R.A.</span>
    </div>
  );
}

function SearchInput() {
  return (
    <form
      action="#"
      className="hidden md:flex items-center gap-2 rounded-md bg-surface px-4 py-1 ring-1 ring-border bg-[#2E3137]"
      role="search"
    >
      <Search className="size-4 text-muted-foreground" aria-hidden />
      <input
        type="search"
        placeholder="Search for videos, images & audio"
        className={cn(
          "w-72 bg-transparent text-sm placeholder:text-muted-foreground/70 focus:outline-none"
        )}
        aria-label="Search for videos, images and audio"
      />
      <button
        type="submit"
        className="grid size-7 place-items-center rounded-full bg-secondary text-secondary-foreground hover:opacity-90 transition"
        aria-label="Submit search"
      >
        <Search className="size-3.5" />
      </button>
    </form>
  );
}

export default function SiteNavbar() {
  return (
    <header className="sticky top-0 z-40 w-full text-white pt-4 bg-[#181A1D]">
      <nav className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3 px-4 py-3">
        <LogoMark />

        <div className="flex flex-1 items-center justify-center">
          <SearchInput />
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="rounded-md bg-blue-500 text-brand-foreground hover:bg-brand/90"
            size="sm"
          >
            Create tag
          </Button>

          <Link
            href="/explore"
            className="hidden sm:inline-flex h-9 items-center rounded-full px-3 text-sm hover:text-foreground transition hover:scale-105"
          >
            Explore
          </Link>

          <Link
            href="/upgrade"
            className="hidden md:inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm hover:text-foreground transition hover:scale-105 text-white"
          >
            <Sparkles className="size-4 text-blue-500" aria-hidden />
            <span>Upgrade</span>
          </Link>

          <button
            aria-label="Apps"
            className="grid size-9 place-items-center rounded-lg bg-surface ring-1 ring-border hover:bg-secondary transition"
          >
            <Grid2X2 className="size-5 text-muted-foreground" />
          </button>

          <button
            aria-label="Notifications"
            className="grid size-9 place-items-center rounded-lg bg-surface ring-1 ring-border hover:bg-secondary transition"
          >
            <Bell className="size-5 text-muted-foreground" />
          </button>

          <Avatar className="size-9 ring-1 ring-border">
            <AvatarImage src="/avatar-placeholder.png" alt="Your profile" />
            <AvatarFallback>YO</AvatarFallback>
          </Avatar>
        </div>
      </nav>
    </header>
  );
}
