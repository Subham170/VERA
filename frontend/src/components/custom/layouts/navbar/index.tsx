"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, Grid2X2, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function LogoMark() {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push("/");
  };

  return (
    <div
      className="flex items-center gap-2 cursor-pointer group"
      onClick={handleLogoClick}
    >
      <div
        aria-hidden
        className="size-6 rounded-full bg-brand/20 ring-1 ring-brand/30 grid place-items-center group-hover:bg-brand/30 transition-colors duration-200"
      >
        <img
          src="/images/logo.png"
          alt="V.E.R.A. logo"
          className="h-6 w-auto md:h-6 group-hover:scale-110 transition-transform duration-200"
        />
      </div>
      <span className="font-medium tracking-tight group-hover:text-blue-400 transition-colors duration-200">
        V.E.R.A.
      </span>
    </div>
  );
}

function SearchInput() {
  return (
    <form
      action="#"
      className="hidden md:flex items-center gap-2 rounded-md bg-[#2E3137] px-4 py-1 ring-1 ring-gray-600 hover:ring-blue-400/50 transition-all duration-200 shadow-sm hover:shadow-md"
      role="search"
    >
      <Search className="size-4 text-gray-400" aria-hidden />
      <input
        type="search"
        placeholder="Search for videos, images & audio"
        className={cn(
          "w-72 bg-transparent text-sm text-white placeholder:text-gray-400/70 focus:outline-none"
        )}
        aria-label="Search for videos, images and audio"
      />
      <button
        type="submit"
        className="grid size-7 place-items-center rounded-full bg-gray-600 text-white hover:bg-blue-500 transition-all duration-200 cursor-pointer"
        aria-label="Submit search"
      >
        <Search className="size-3.5" />
      </button>
    </form>
  );
}

export default function SiteNavbar() {
  const router = useRouter();

  const handleCreateTag = () => {
    router.push("/create-tag");
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  return (
    <header className="sticky top-0 z-40 w-full text-white py-2 bg-[#181A1D] shadow-lg backdrop-blur-sm border-b border-gray-800/50">
      <nav className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3 px-4 py-3">
        <LogoMark />

        <div className="flex flex-1 items-center justify-center">
          <SearchInput />
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreateTag}
            className="rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
            size="sm"
          >
            Create tag
          </Button>

          <Link
            href="/explore"
            className="hidden sm:inline-flex h-9 items-center rounded-full px-3 text-sm text-white hover:text-blue-400 transition-all duration-200 hover:scale-105 cursor-pointer"
          >
            Explore
          </Link>

          <Link
            href="/upgrade"
            className="hidden md:inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm text-white hover:text-blue-400 transition-all duration-200 hover:scale-105 cursor-pointer group"
          >
            <Sparkles
              className="size-4 text-blue-500 group-hover:text-blue-400 transition-colors duration-200"
              aria-hidden
            />
            <span>Upgrade</span>
          </Link>

          <button
            aria-label="Apps"
            className="grid size-9 place-items-center rounded-lg bg-[#2E3137] ring-1 ring-gray-600 hover:bg-[#3A3D45] hover:ring-blue-400/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
          >
            <Grid2X2 className="size-5 text-gray-400 hover:text-white transition-colors duration-200" />
          </button>

          <button
            aria-label="Notifications"
            className="grid size-9 place-items-center rounded-lg bg-[#2E3137] ring-1 ring-gray-600 hover:bg-[#3A3D45] hover:ring-blue-400/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
          >
            <Bell className="size-5 text-gray-400 hover:text-white transition-colors duration-200" />
          </button>

          <button onClick={handleProfile} aria-label="Profile">
          <Avatar className="size-9 ring-1 ring-gray-600 hover:ring-blue-400/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
            <AvatarImage src="/avatar-placeholder.png" alt="Your profile" />
            <AvatarFallback className="bg-[#2E3137] text-white hover:bg-[#3A3D45] transition-colors duration-200">
              YO
            </AvatarFallback>
          </Avatar>
          </button>
        </div>
      </nav>
    </header>
  );
}
