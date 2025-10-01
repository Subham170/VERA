"use client";

import AnnouncementBanner from "@/components/custom/announcement-banner";
import HeroEmptyState from "@/components/custom/hero";
import { MediaGrid } from "@/components/custom/profile/media-grid";
import AuthenticatedLayout from "@/components/custom/layouts/authenticated-layout";
import WelcomeScreen from "@/components/custom/welcome-screen";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export const mediaItems = [
  {
    id: "1",
    title: "BrandTripTalk.jpg",
    handle: "@JordanLeex",
    thumbnail: "/images/tag1.png",
  },
  {
    id: "2",
    title: "CubaTravelPodcast.mp3",
    handle: "@JordanLeex",
    thumbnail: "/audio-waveform-teal.jpg",
  },
  {
    id: "3",
    title: "Travelvlog.mp4",
    handle: "@JordanLeex",
    thumbnail: "/airport-window-sunset.jpg",
  },
  {
    id: "4",
    title: "TravelWithMeToTurkey.mp4",
    handle: "@JordanLeex",
    thumbnail: "/passport-luggage-flatlay.jpg",
  },
];
export default function Home() {
  const { isAuthorized, isLoading, userData } = useAuth();
  const router = useRouter();

  // Mock data - in a real app, this would come from an API or context

  const handleGetStarted = () => {
    // Navigate to login page
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show welcome screen if user is not authenticated
  if (!isAuthorized) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }

  // Show main app if user is authenticated
  return (
    <AuthenticatedLayout>
      <main className="min-h-dvh pt-4 bg-[#181A1D]">
        <AnnouncementBanner />
        {mediaItems.length > 0 ? (
          <section className="mx-auto w-full max-w-6xl px-4 pb-12">
            {/* Navigation Bar */}
            <div className="mb-8">
              <nav className="flex space-x-6 overflow-x-auto pb-2">
                {["All", "Trending", "Travel", "People", "Politics", "News", "Vlog"].map((category) => (
                  <button
                    key={category}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      category === "All"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
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
            <MediaGrid items={mediaItems} />
          </section>
        ) : (
          <HeroEmptyState />
        )}
      </main>
    </AuthenticatedLayout>
  );
}
