"use client";

import { ProfileDropdown } from "@/components/custom/layouts/profile-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {  Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";

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
  const pathname = usePathname();
  const { isAuthorized, isLoading } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  // Don't render navbar if user is not authenticated or still loading
  if (isLoading || !isAuthorized) {
    return null;
  }

  // Define routes where search bar should be hidden
  const hideSearchBarRoutes = [
    "/create-tag",
    "/review-tag",
    "/login",
    "/explore",
    "/profile",
    "/profile/edit",
  ];

  // Check if current route should hide search bar
  const shouldHideSearchBar = hideSearchBarRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const handleCreateTag = () => {
    router.push("/create-tag");
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full text-white py-2 bg-[#181A1D] shadow-lg backdrop-blur-sm border-b border-gray-800/50">
      <nav className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3 px-4 py-3">
        <LogoMark />

        {!shouldHideSearchBar && (
          <div className="flex flex-1 items-center justify-center">
            <SearchInput />
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateTag}
            className={cn(
              "hidden sm:inline-flex h-9 items-center rounded-full px-3 text-sm transition-all duration-200 hover:scale-105 cursor-pointer",
              pathname === "/create-tag"
                ? "bg-blue-600 text-white font-semibold shadow-md"
                : "text-white hover:text-blue-400"
            )}
          >
            Create tag
          </button>

          <Link
            href="/explore"
            className={cn(
              "hidden sm:inline-flex h-9 items-center rounded-full px-3 text-sm transition-all duration-200 hover:scale-105 cursor-pointer",
              pathname === "/explore"
                ? "bg-blue-600 text-white font-semibold shadow-md"
                : "text-white hover:text-blue-400"
            )}
          >
            Explore
          </Link>

          <Link
            href="/upgrade"
            className={cn(
              "hidden md:inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm transition-all duration-200 hover:scale-105 cursor-pointer group",
              pathname === "/upgrade"
                ? "bg-blue-600 text-white font-semibold shadow-md"
                : "text-white hover:text-blue-400"
            )}
          >
            <Sparkles
              className={cn(
                "size-4 transition-colors duration-200",
                pathname === "/upgrade"
                  ? "text-white"
                  : "text-blue-500 group-hover:text-blue-400"
              )}
              aria-hidden
            />
            <span>Upgrade</span>
          </Link>

          {/* <button
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
          </button> */}

          <div className="relative">
            <button
              ref={profileButtonRef}
              onClick={handleProfileClick}
              aria-label="Profile"
            >
              <Avatar className="size-9 ring-1 ring-gray-600 hover:ring-blue-400/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                <AvatarImage src="/avatar-placeholder.png" alt="Your profile" />
                <AvatarFallback className="bg-[#2E3137] text-white hover:bg-[#3A3D45] transition-colors duration-200">
                  YO
                </AvatarFallback>
              </Avatar>
            </button>

            <ProfileDropdown
              isOpen={isProfileDropdownOpen}
              onClose={closeProfileDropdown}
              triggerRef={profileButtonRef}
            />
          </div>
        </div>
      </nav>
    </header>
  );
}
