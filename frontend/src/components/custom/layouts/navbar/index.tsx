"use client";

import { ProfileDropdown } from "@/components/custom/layouts/profile-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Search, Sparkles } from "lucide-react";
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
      className="flex items-center gap-3 cursor-pointer group"
      onClick={handleLogoClick}
    >
      <div
        aria-hidden
        className="size-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-1 ring-blue-500/30 grid place-items-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blue-500/25"
      >
        <img
          src="/images/logo.png"
          alt="V.E.R.A. logo"
          className="h-6 w-auto group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-white transition-all duration-300">
          V.E.R.A.
        </span>
        {/* <span className="text-xs text-gray-400 group-hover:text-blue-400 transition-colors duration-300">
          Verify Everything Real Always
        </span> */}
      </div>
    </div>
  );
}

function SearchInput() {
  return (
    <form
      action="#"
      className="hidden md:flex items-center gap-3 rounded-2xl bg-[#2E3137]/50 backdrop-blur-sm px-4 py-2.5 ring-1 ring-gray-600/50 hover:ring-blue-400/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 group"
      role="search"
    >
      <Search
        className="size-4 text-gray-400 group-hover:text-blue-400 transition-colors duration-300"
        aria-hidden
      />
      <input
        type="search"
        placeholder="Search for videos, images & audio"
        className={cn(
          "w-72 bg-transparent text-sm text-white placeholder:text-gray-400/70 focus:outline-none transition-all duration-300"
        )}
        aria-label="Search for videos, images and audio"
      />
      <button
        type="submit"
        className="grid size-8 place-items-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg hover:scale-105"
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
  const { isAuthorized, isLoading, user } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  // Helper function to get user initials
  const getUserInitials = (username: string) => {
    return username
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
    <header className="sticky top-0 z-40 w-full text-white bg-[#181A1D]/80 backdrop-blur-xl border-b border-gray-800/30 shadow-2xl">
      <nav className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-4">
        <LogoMark />

        {!shouldHideSearchBar && (
          <div className="flex flex-1 items-center justify-center">
            <SearchInput />
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateTag}
            className={cn(
              "hidden sm:inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium transition-all duration-300 hover:scale-105 cursor-pointer",
              pathname === "/create-tag"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
                : "text-white hover:text-blue-400 hover:bg-[#2E3137]/50 backdrop-blur-sm border border-transparent hover:border-gray-600/50"
            )}
          >
            Create tag
          </button>

          <Link
            href="/explore"
            className={cn(
              "hidden sm:inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium transition-all duration-300 hover:scale-105 cursor-pointer",
              pathname === "/explore"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
                : "text-white hover:text-blue-400 hover:bg-[#2E3137]/50 backdrop-blur-sm border border-transparent hover:border-gray-600/50"
            )}
          >
            Explore
          </Link>

          <Link
            href="/upgrade"
            className={cn(
              "hidden md:inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-all duration-300 hover:scale-105 cursor-pointer group",
              pathname === "/upgrade"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25"
                : "text-white hover:text-purple-400 hover:bg-[#2E3137]/50 backdrop-blur-sm border border-transparent hover:border-gray-600/50"
            )}
          >
            <Sparkles
              className={cn(
                "size-4 transition-colors duration-300",
                pathname === "/upgrade"
                  ? "text-white"
                  : "text-purple-500 group-hover:text-purple-400"
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
              className="group"
            >
              <Avatar className="size-10 ring-2 ring-gray-600/50 hover:ring-blue-400/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-blue-500/25 hover:scale-105">
                <AvatarImage src={user?.profile_img} alt="Your profile" />
                <AvatarFallback className="bg-gradient-to-br from-[#2E3137] to-[#3A3D45] text-white font-semibold group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300">
                  {user?.username ? getUserInitials(user.username) : "U"}
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
