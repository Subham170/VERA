"use client";

import AnnouncementBanner from "@/components/custom/announcement-banner";
import HeroEmptyState from "@/components/custom/hero";
import { MediaGrid } from "@/components/custom/profile/media-grid";
import WelcomeScreen from "@/components/custom/welcome-screen";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAddress } from "ethers";

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

  // Fetch user tags once user is authenticated
  useEffect(() => {
    const fetchUserTags = async () => {
      setTagsLoading(true);
      setTagsError(null);

      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length === 0) {
          router.push("/login");
          return;
        }

        const checksummedAddress = getAddress(accounts[0]);
        const res = await fetch(`http://localhost:5000/api/tags/user/${checksummedAddress}`);
        if (!res.ok) throw new Error("Failed to fetch user tags.");

        const tagsData = await res.json();
        console.log(tagsData)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }

  return (
    <main className="min-h-dvh pt-4 bg-[#181A1D]">
      {showAnnouncementBanner && (
        <div
          className={`transition-all duration-500 ease-in-out ${
            isAnimating ? "opacity-0 transform -translate-y-4" : "opacity-100 transform translate-y-0"
          }`}
        >
          <AnnouncementBanner />
        </div>
      )}

      <section className="mx-auto w-full max-w-6xl px-4 pb-12">
        {/* Navigation Bar */}
        <div className="mb-8">
          <nav className="flex space-x-6 overflow-x-auto pb-2">
            {["All", "Trending", "Travel", "People", "Politics", "News", "Vlog"].map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  category === "All" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>

        <div className="mb-6">
          <h2 className="text-lg text-white font-semibold tracking-tight mb-2">All media</h2>
          <div className="h-0.5 bg-gradient-to-r from-blue-500 to-teal-400 w-24"></div>
        </div>

        {tagsLoading && <p className="text-white text-center">Loading your media...</p>}
        {tagsError && <p className="text-yellow-500 text-center">{tagsError}</p>}
        {!tagsLoading && !tagsError && userTags.length === 0 && <HeroEmptyState />}
        {!tagsLoading && !tagsError && userTags.length > 0 && (
          <MediaGrid
            mediaItems={userTags}
          />
        )}
      </section>
    </main>
  );
}
