"use client";

import { useAuth } from "@/context/AuthContext";
import WelcomeScreen from "@/components/custom/welcome-screen";
import { useRouter } from "next/navigation";
import AnnouncementBanner from "@/components/custom/announcement-banner";
import HeroEmptyState from "@/components/custom/hero";
import SiteNavbar from "@/components/custom/layouts/navbar";

export default function Home() {
  const { isAuthorized, isLoading, userData } = useAuth();
  const router = useRouter();

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
    <main className="min-h-dvh bg-[#181A1D]">
      <SiteNavbar />
      <AnnouncementBanner />
      <HeroEmptyState />
    </main>
  );
}
