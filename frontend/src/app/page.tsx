"use client";

import { useAuth } from "@/context/AuthContext";
import WelcomeScreen from "@/components/custom/welcome-screen";
import { useRouter } from "next/navigation";

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
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome back, {userData?.name || 'User'}!
        </h1>
        <p className="text-gray-300 mb-8">
          You are logged in as: {userData?.email}
        </p>
        <div className="bg-gray-800 p-6 rounded-lg border-0">
          <h2 className="text-xl font-semibold text-white mb-4">User Info</h2>
          <div className="text-left text-gray-300 space-y-2">
            <p><strong>Data:</strong> {JSON.stringify(userData, null, 2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
