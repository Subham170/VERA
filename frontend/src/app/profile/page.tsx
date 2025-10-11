"use client";

import { MediaGrid } from "@/components/custom/profile/media-grid";
import { ProfileHeader } from "@/components/custom/profile/profile-header";
import { API_ENDPOINTS } from "@/lib/config";
import { getAddress } from "ethers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserProfile {
  username: string;
  email: string;
  address: string;
  bio: string;
  profile_img: string;
  banner_url: string;
  createdAt: string;
  updatedAt: string;
}

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

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userTags, setUserTags] = useState<Tag[]>([]);
  const router = useRouter();

  useEffect(() => {
    const getWalletAddress = async () => {
      if (!window.ethereum) {
        setError("MetaMask is not installed.");
        return;
      }

      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length === 0) {
          router.push("/login");
          return;
        }
        const checksummedAddress = getAddress(accounts[0]);
        setConnectedAddress(checksummedAddress);
      } catch (err) {
        console.error("Failed to connect wallet:", err);
        setError("Failed to connect wallet.");
      }
    };

    getWalletAddress();
  }, [router]);

  useEffect(() => {
    if (!connectedAddress) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userProfileResponse = await fetch(
          `${API_ENDPOINTS.USERS}/${connectedAddress}`,
          {
            signal: controller.signal,
          }
        );
        if (!userProfileResponse.ok)
          throw new Error("Failed to fetch user profile.");
        const userProfile: UserProfile = (await userProfileResponse.json())
          ?.data.user;
        setProfileData(userProfile);
      } catch (err: any) {
        if (err.name === "AbortError") {
          setError("Could not connect to the profile server.");
        } else {
          console.error(err);
          setError("Failed to load profile data.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUserTags = async () => {
      try {
        console.log(connectedAddress);
        const res = await fetch(API_ENDPOINTS.TAGS_USER(connectedAddress));
        if (!res.ok) throw new Error("Failed to fetch user tags.");
        const tagsData = await res.json();
        console.log(tagsData);
        setUserTags(tagsData?.data.tags || []);
      } catch (err: any) {
        console.error("Failed to fetch tags:", err);
      }
    };

    fetchProfileData();
    fetchUserTags();
    clearTimeout(timeoutId);
  }, [connectedAddress]);

  return (
    <main className="min-h-screen bg-[#181A1D]">
      <ProfileHeader
        name={profileData?.username || "Loading..."}
        handle={`@${profileData?.username || "..."}`}
        address={connectedAddress || "0x00...0000"}
        coverSrc={profileData?.banner_url || "/images/banner.jpg"}
        avatarSrc={profileData?.profile_img || "/images/dp.jpg"}
        bio={profileData?.bio}
      />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12">
        <div className="mb-6">
          <h2 className="text-lg text-white font-semibold tracking-tight mb-2">
            All media
          </h2>
          <div className="h-0.5 bg-gradient-to-r from-blue-500 to-teal-400 w-24"></div>
        </div>
        {isLoading && (
          <p className="text-white text-center">Loading profile...</p>
        )}
        {error && <p className="text-yellow-500 text-center">{error}</p>}
        {!isLoading && !error && userTags.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p>No media found for this user.</p>
          </div>
        )}
        {!isLoading && !error && userTags.length > 0 && (
          <MediaGrid mediaItems={userTags} />
        )}
      </section>
    </main>
  );
}
