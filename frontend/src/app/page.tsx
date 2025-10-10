"use client";

import AnnouncementBanner from "@/components/custom/announcement-banner";
import HeroEmptyState from "@/components/custom/hero";
import { MediaGrid } from "@/components/custom/profile/media-grid";
import WelcomeScreen from "@/components/custom/welcome-screen";
import { useAuth } from "@/context/AuthContext";
import { API_ENDPOINTS } from "@/lib/config";
import { getAddress } from "ethers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Tag {
  _id: string;
  file_name: string;
  description?: string;
  img_urls?: string[];
  video_urls?: string[];
  audio_urls?: string[];
  type: "img" | "video" | "audio";
  hash_address: string;
  address: string;
  createdAt: string;
}

export default function Home() {
  const { isAuthorized, isLoading } = useAuth();
  const router = useRouter();
  const [showAnnouncementBanner, setShowAnnouncementBanner] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userTags, setUserTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [authTimeout, setAuthTimeout] = useState(false);

  const handleGetStarted = () => {
    router.push("/login");
  };

  // Hide AnnouncementBanner after 3 seconds with animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      setTimeout(() => setShowAnnouncementBanner(false), 500);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Add timeout for authentication loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Authentication loading timeout - redirecting to login");
        setAuthTimeout(true);
      }
    }, 5000); // 5 second timeout (reduced from 10)

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Debug authentication state
  useEffect(() => {
    console.log("Auth state:", { isLoading, isAuthorized, authTimeout });
  }, [isLoading, isAuthorized, authTimeout]);

  useEffect(() => {
    const fetchUserTags = async () => {
      setTagsLoading(true);
      setTagsError(null);

      try {
        if (!window.ethereum) {
          router.push("/login");
          return;
        }

        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length === 0) {
          router.push("/login");
          return;
        }

        const checksummedAddress = getAddress(accounts[0]);
        const res = await fetch(API_ENDPOINTS.TAGS);
        if (!res.ok) throw new Error("Failed to fetch user tags.");

        const tagsData = await res.json();
        setUserTags(tagsData?.data.tags || []);
      } catch (err: any) {
        console.error("Failed to fetch tags:", err);
        setTagsError("Failed to load user media.");
      } finally {
        setTagsLoading(false);
      }
    };

    if (isAuthorized) fetchUserTags();
  }, [isAuthorized, router]);

  if (isLoading && !authTimeout) {
    return (
      <div className="min-h-screen bg-[#181A1D] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-white">Loading VERA</h2>
            <p className="text-gray-400 text-sm">
              Connecting to your wallet and verifying access
            </p>
          </div>
          <div className="w-48 bg-gray-700/50 rounded-full h-1">
            <div
              className="h-full bg-blue-500 rounded-full animate-pulse"
              style={{ width: "60%" }}
            ></div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("userSession");
              window.location.reload();
            }}
            className="text-xs text-gray-500 hover:text-white underline"
          >
            Clear session & reload
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorized || authTimeout) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }

  return (
    <main className="min-h-dvh bg-[#181A1D]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[#181A1D]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-teal-900/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]"></div>
      </div>

      {showAnnouncementBanner && (
        <div
          className={`relative z-10 transition-all duration-500 ease-in-out ${
            isAnimating
              ? "opacity-0 transform -translate-y-4"
              : "opacity-100 transform translate-y-0"
          }`}
        >
          <AnnouncementBanner />
        </div>
      )}

      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8">
        {/* Enhanced Category Navigation */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Your Media Library
              </h1>
              <p className="text-gray-400">
                Discover and manage your verified content
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
              <span>{userTags.length} items</span>
            </div>
          </div>

          <nav className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              "All",
              "Trending",
              "Travel",
              "People",
              "Politics",
              "News",
              "Vlog",
            ].map((category, index) => (
              <button
                key={category}
                className={`px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 hover:scale-105 ${
                  category === "All"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-400 hover:text-white hover:bg-[#2E3137]/50 backdrop-blur-sm border border-transparent hover:border-gray-600/50"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Section */}
        <div className="space-y-8">
          {tagsLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-white text-lg mt-4 font-medium">
                Loading your media...
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Fetching verified content
              </p>
            </div>
          )}

          {tagsError && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="text-red-400 text-lg font-medium">{tagsError}</p>
              <p className="text-gray-400 text-sm mt-1">
                Please try refreshing the page
              </p>
            </div>
          )}

          {!tagsLoading && !tagsError && userTags.length === 0 && (
            <HeroEmptyState />
          )}

          {!tagsLoading && !tagsError && userTags.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">
                    All Media
                  </h2>
                  <div className="h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-purple-500 rounded-full w-32"></div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>All verified</span>
                </div>
              </div>
              <MediaGrid mediaItems={userTags} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
