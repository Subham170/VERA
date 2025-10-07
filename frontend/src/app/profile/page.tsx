"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ProfileHeader } from "@/components/custom/profile/profile-header";
import { MediaGrid } from "@/components/custom/profile/media-grid";

const ABI = [
  "function getMediaByOwner(address owner) public view returns (string[] memory)",
];
const CONTRACT_ADDRESS = "0x38a9487b69d3b8f810b5DFC53f671db002e827A4";

const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

interface MediaItem {
  id: string;
  title: string;
  handle: string;
  thumbnail: string;
}

interface Metadata {
    name: string;
    description: string;
    image: string;
}

export default function ProfilePage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);

      if (typeof window.ethereum === "undefined") {
        setError("MetaMask is not installed. Please install it to view your profile.");
        setIsLoading(false);
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);

        if (accounts.length === 0) {
          setError("Please connect your wallet to view your media.");
          setIsLoading(false);
          return;
        }

        const address = accounts[0];
        setConnectedAddress(address);

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        const metadataCids: string[] = await contract.getMediaByOwner(address);

        if (metadataCids.length === 0) {
          setIsLoading(false);
          return;
        }

        const itemsPromise = metadataCids.map(async (cid) => {
            try {
                const response = await fetch(`${IPFS_GATEWAY}${cid}`);
                if (!response.ok) return null;
                const metadata: Metadata = await response.json();
                
                return {
                    id: cid,
                    title: metadata.name,
                    handle: `@${address.slice(2, 8)}`,
                    thumbnail: metadata.image.replace("ipfs://", IPFS_GATEWAY),
                };
            } catch (e) {
                console.error("Failed to fetch metadata for CID:", cid, e);
                return null;
            }
        });
        
        const fetchedItems = (await Promise.all(itemsPromise)).filter(item => item !== null) as MediaItem[];
        setMediaItems(fetchedItems.reverse());

      } catch (err: any) {
        console.error("Failed to fetch profile data:", err);
        setError("Failed to load profile data. The user may have rejected the connection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-white text-center">Loading your media...</p>;
    }
    if (error) {
      return <p className="text-yellow-500 text-center">{error}</p>;
    }
    if (mediaItems.length === 0) {
      return <p className="text-gray-400 text-center">You haven't registered any media yet.</p>;
    }
    return <MediaGrid items={mediaItems} />;
  };

  return (
    <main className="min-h-screen bg-[#181A1D]">
      <ProfileHeader
        name={connectedAddress ? `User...${connectedAddress.slice(-4)}` : "Not Connected"}
        handle={connectedAddress ? `@${connectedAddress.slice(2, 10)}` : "@..."}
        address={connectedAddress || "0x00...0000"}
        coverSrc="/images/banner.jpg"
        avatarSrc="/images/dp.jpg"
      />

      <section className="mx-auto w-full max-w-6xl px-4 pb-12">
        <div className="mb-6">
          <h2 className="text-lg text-white font-semibold tracking-tight mb-2">
            All media
          </h2>
          <div className="h-0.5 bg-gradient-to-r from-blue-500 to-teal-400 w-24"></div>
        </div>
        
        {renderContent()}
      </section>
    </main>
  );
}

