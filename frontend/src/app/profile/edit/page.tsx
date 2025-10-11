"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { API_ENDPOINTS } from "@/lib/config";
import { Loader2, Pencil, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

interface UserProfile {
  username: string;
  email: string;
  address: string;
  bio: string;
  profile_img: string;
  banner_url: string;
}

export default function EditProfilePage() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  const profileImageRef = useRef<HTMLInputElement>(null);
  const bannerImageRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    let userSessionAddress: string | null = null;
    try {
      const savedUserJSON = localStorage.getItem("userSession");
      if (savedUserJSON) {
        const savedUser = JSON.parse(savedUserJSON);
        if (savedUser && savedUser.address) {
          userSessionAddress = savedUser.address;
          setConnectedAddress(userSessionAddress);
        }
      }
    } catch (e) {
      console.error("Failed to parse user session.", e);
    }

    if (!userSessionAddress) {
      toast.error("You must be logged in to edit your profile.");
      router.push("/login");
      setIsFetchingInitialData(false);
      return;
    }

    const fetchUserData = async (address: string) => {
      try {
        const response = await fetch(`${API_ENDPOINTS.USERS}/${address}`);
        if (!response.ok) throw new Error("Failed to fetch user data.");
        const data: UserProfile = (await response.json()).data.user;
        setUsername(data.username || "");
        setBio(data.bio || "");
        setEmail(data.email || "");
        setProfileImage(data.profile_img || null);
        setBannerImage(data.banner_url || null);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsFetchingInitialData(false);
      }
    };
    fetchUserData(userSessionAddress);
  }, []);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "banner"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (type === "profile") {
          setProfileImage(result);
          setProfileImageFile(file);
        } else {
          setBannerImage(result);
          setBannerImageFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    if (!connectedAddress) {
      toast.error("Wallet address not found.");
      return;
    }
    setIsLoading(true);
    const toastId = toast.loading("Saving all changes...");

    try {
      let profile_img = null;
      let banner_url = null;

      if (profileImageFile) {
        const profileFormData = new FormData();
        profileFormData.append("profile_img", profileImageFile);
        const profileResponse = await fetch(
          `${API_ENDPOINTS.USERS}/${connectedAddress}/profile-image`,
          {
            method: "PUT",
            body: profileFormData,
          }
        );
        
        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          throw new Error(errorData.message || "Failed to upload profile image");
        }
        
        const profileData = await profileResponse.json();
        profile_img = profileData.url;
      }

      if (bannerImageFile) {
        const bannerFormData = new FormData();
        bannerFormData.append("banner_url", bannerImageFile);
        const bannerResponse = await fetch(
          `${API_ENDPOINTS.USERS}/${connectedAddress}/banner-image`,
          {
            method: "PUT",
            body: bannerFormData,
          }
        );
        
        if (!bannerResponse.ok) {
          const errorData = await bannerResponse.json();
          throw new Error(errorData.message || "Failed to upload banner image");
        }
        
        const bannerData = await bannerResponse.json();
        banner_url = bannerData.url;
      }

      const updateData: any = { username, bio, email };
      if (profile_img) updateData.profile_img = profile_img;
      if (banner_url) updateData.banner_url = banner_url;

      const updateResponse = await fetch(
        `${API_ENDPOINTS.USERS}/${connectedAddress}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      toast.success("Profile updated successfully!", { id: toastId });
      router.push("/profile");
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <main className="min-h-screen bg-[#1A1A1A] text-white p-6">
        <div className="max-w-5xl mx-auto pt-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-white">
              Profile details
            </h1>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-gray-700 hover:bg-gray-600"
              aria-label="Close and return to profile"
            >
              <Link href="/profile">
                <X className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isFetchingInitialData ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="text-sm font-medium text-white"
                  >
                    Username
                  </label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="bg-[#2D2D30] border-gray-600 text-white rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="bio"
                    className="text-sm font-medium text-white"
                  >
                    Bio
                  </label>
                  <Textarea
                    id="bio"
                    rows={8}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell the world your story."
                    className="bg-[#2D2D30] border-gray-600 text-white rounded-lg resize-y h-48"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-white"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="bg-[#2D2D30] border-gray-600 text-white rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    Profile image
                  </label>
                  <div className="relative h-32 w-32 group">
                    <div className="relative h-32 w-32 overflow-hidden rounded-full bg-gray-700">
                      {profileImage && (
                        <Image
                          src={profileImage}
                          alt="Profile image preview"
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <button
                      onClick={() => profileImageRef.current?.click()}
                      className="cursor-pointer absolute -bottom-1 -right-1 h-10 w-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Pencil className="h-5 w-5 text-white" />
                    </button>
                    <input
                      ref={profileImageRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "profile")}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    Profile Banner
                  </label>
                  <div className="relative h-40 w-full group rounded-lg overflow-hidden bg-[#2D2D30]">
                    {bannerImage && (
                      <Image
                        src={bannerImage}
                        alt="Profile banner preview"
                        fill
                        className="object-cover"
                      />
                    )}
                    <button
                      onClick={() => bannerImageRef.current?.click()}
                      className="cursor-pointer absolute bottom-2 right-2 h-10 w-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Pencil className="h-5 w-5 text-white" />
                    </button>
                    <input
                      ref={bannerImageRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "banner")}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 mt-4">
                <Button
                  onClick={handleSaveChanges}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save All Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
