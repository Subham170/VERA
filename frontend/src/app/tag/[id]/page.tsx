"use client";

import { Button } from "@/components/ui/button";
import { BadgeCheck, Download, MoreHorizontal, Share2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { API_ENDPOINTS, NEXT_PUBLIC_PINATA_JWT, NEXT_PUBLIC_PINATA_GATEWAY_URL, NEXT_PUBLIC_PINATA_GATEWAY_TOKEN } from "@/lib/config";
import { ethers, type TransactionResponse } from "ethers";
import toast, { Toaster } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";

const ABI = [
  "function registerMedia(string memory mediaCid, string memory metadataCid, bytes32 contentHash) public",
  "function deregisterMedia(bytes32 contentHash) public",
  "function getMedia(bytes32 contentHash) public view returns (string memory mediaCid, string memory metadataCid, address uploader, uint256 timestamp)",
  "function getMediaByOwner(address owner) public view returns (bytes32[] memory)",
  "error MediaAlreadyRegistered(bytes32 contentHash)",
  "error MediaNotFound(bytes32 contentHash)",
  "error Unauthorized()",
];

const CONTRACT_ADDRESS = "0xc8DfF35746db2604b9feEEb48828d9F721D24530";

function getEthersContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signerOrProvider);
}

async function unpinFromPinata(cid: string) {
  const pinataJWT = NEXT_PUBLIC_PINATA_JWT;
  if (!pinataJWT) throw new Error("Pinata JWT is not configured.");

  const res = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${pinataJWT}`,
    },
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to unpin from Pinata: ${res.statusText} - ${errorBody}`);
  }
}

interface Tag {
  _id: string;
  file_name: string;
  description?: string;
  hash_address: string;
  address: string;
  type: "img" | "video" | "audio";
  primary_media_url: string;
  createdAt: string;
  mediacid: string;
  metadatacid: string;
}

interface Metadata {
  fileName: string;
  description: string;
  signerAddress: string;
  probabilities: {
    deepfake: number;
    natural: number;
  };
  contentAnalysis: string;
}

export default function TagPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const [tag, setTag] = useState<Tag | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMetadataLoading, setIsMetadataLoading] = useState(true);
  const [currentUserAddress, setCurrentUserAddress] = useState<string | null>(null);
  const [isDeregistering, setIsDeregistering] = useState(false);

  useEffect(() => {
    const getAddress = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          setCurrentUserAddress(await signer.getAddress());
        } catch (err) {
          console.error("Could not get wallet address:", err);
        }
      }
    };
    getAddress();
  }, []);

  useEffect(() => {
    if (!id) {
      setError("Tag ID is missing from the URL.");
      setIsLoading(false);
      return;
    }

    const fetchTagData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_ENDPOINTS.TAG_BY_ID(id));
        if (!response.ok) throw new Error("Failed to fetch the tag data.");
        const result = await response.json();
        if (result.status !== "success" || !result.data.tag) throw new Error("The requested tag could not be found.");
        setTag(result.data.tag);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTagData();
  }, [id]);

  useEffect(() => {
    if (!tag?.metadatacid) {
      setIsMetadataLoading(false);
      return;
    }

    const fetchMetadata = async () => {
      setIsMetadataLoading(true);
      try {
        const gatewayUrl = NEXT_PUBLIC_PINATA_GATEWAY_URL;
        const gatewayToken = NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;
        if (!gatewayUrl || !gatewayToken) throw new Error("Pinata gateway configuration is missing.");

        const response = await fetch(`${gatewayUrl}/ipfs/${tag.metadatacid}?pinataGatewayToken=${gatewayToken}`);
        if (!response.ok) throw new Error("Could not fetch metadata from IPFS.");
        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        console.error("IPFS metadata fetch error:", err);
      } finally {
        setIsMetadataLoading(false);
      }
    };

    fetchMetadata();
  }, [tag]);

 const handleDownload = async () => {
  if (!tag?.primary_media_url) {
    toast.error("No media file found to download.");
    return;
  }

  try {
    if (tag.type === "img") {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = tag.primary_media_url;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);


      const fontSize = Math.floor(canvas.width / 15);
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.textAlign = "center";
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText("VERAFIED", 0, 0);


      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not create image blob");

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tag.file_name.replace(/\.[^/.]+$/, "")}_verafied.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Downloaded");
    } else {
      const response = await fetch(tag.primary_media_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = tag.file_name || "media_file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Downloaded original media");
    }
  } catch (err: any) {
    console.error("Download error:", err);
    toast.error("Failed to download with watermark.");
  }
};

  const handleShare = async () => {
    if (!tag?.primary_media_url) {
      toast.error("No media available to share.");
      return;
    }

    const shareData = {
      title: tag.file_name,
      text: tag.description || "Check out this verified media!",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard!");
      }
    } catch (err: any) {
      console.error("Share error:", err);
      toast.error("Failed to share link.");
    }
  };

  const handleDeregister = async () => {
    if (!tag || !currentUserAddress) return toast.error("Cannot perform action. Data is missing.");
    if (currentUserAddress.toLowerCase() !== tag.address.toLowerCase()) return toast.error("You are not authorized to deregister this media.");
    if (typeof window.ethereum === "undefined") return toast.error("MetaMask is not installed.");

    setIsDeregistering(true);
    const toastId = toast.loading("Deregistering media...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getEthersContract(signer);
      const formattedHash = "0x" + tag.hash_address;

      toast.loading("Awaiting on-chain transaction...", { id: toastId });
      const tx: TransactionResponse = await contract.deregisterMedia(formattedHash);
      await tx.wait();

      toast.loading("Unpinning files from IPFS...", { id: toastId });
      await Promise.all([unpinFromPinata(tag.mediacid), unpinFromPinata(tag.metadatacid)]);

      toast.loading("Deleting from database...", { id: toastId });
      const deleteResponse = await fetch(`http://localhost:5000/api/tags/${id}`, {
        method: "DELETE",
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.message || "Failed to delete from database.");
      }

      toast.success("Media successfully deregistered from all systems.", { id: toastId });
      router.push("/");
    } catch (err: any) {
      console.error("Deregister error:", err);
      toast.error(err.reason || err.message || "Failed to deregister media.", { id: toastId });
    } finally {
      setIsDeregistering(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] text-white flex items-center justify-center">
        <div className="text-xl">Loading Tag...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] text-white flex items-center justify-center">
        <div className="text-xl text-red-400">Error: {error}</div>
      </main>
    );
  }

  if (!tag) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] text-white flex items-center justify-center">
        <div className="text-xl">Tag not found.</div>
      </main>
    );
  }

  const isOwner = currentUserAddress && tag && currentUserAddress.toLowerCase() === tag.address.toLowerCase();
  const isProcessing = isDeregistering;

  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="relative">
            <div className="aspect-[1/1] w-full overflow-hidden rounded-[20px]">
              <Image src={tag.primary_media_url} alt={tag.file_name} fill className="object-cover" priority />
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{tag.file_name}</h1>
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <BadgeCheck className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>{isMetadataLoading ? "No description provided." : metadata?.description}</p>
              <div className="pt-4 border-t border-gray-700 space-y-4">
                <h2 className="text-lg font-semibold text-white">AI Analysis Report</h2>
                {isMetadataLoading ? (
                  <p className="text-sm text-gray-400">Loading analysis report...</p>
                ) : metadata ? (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-2">PROBABILITY</p>
                      <div className="w-full bg-gray-700 rounded-full h-2.5 flex overflow-hidden">
                        <div className="bg-green-500 h-2.5" style={{ width: `${metadata.probabilities.natural}%` }}></div>
                        <div className="bg-yellow-500 h-2.5" style={{ width: `${metadata.probabilities.deepfake}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-green-400">Natural: {metadata.probabilities.natural}%</span>
                        <span className="text-yellow-400">Deepfake: {metadata.probabilities.deepfake}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1">CONTENT ANALYSIS</p>
                      <p className="text-sm text-gray-300">{metadata.contentAnalysis}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1">REGISTERED BY</p>
                      <p className="font-mono text-sm text-white">{metadata.signerAddress}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-red-400">Could not load analysis report.</p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                variant="outline"
                size="icon"
                className="h-12 w-12 bg-[#2D2D30] border-gray-600 hover:bg-[#3D3D40] text-white rounded-lg"
              >
                <Download className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                size="icon"
                className="h-12 w-12 bg-[#2D2D30] border-gray-600 hover:bg-[#3D3D40] text-white rounded-lg"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              {isOwner && (
                <Button
                  onClick={handleDeregister}
                  variant="destructive"
                  size="icon"
                  className="h-12 w-12 bg-red-800/50 border-red-500/60 hover:bg-red-700/50 text-red-300 rounded-lg"
                  disabled={isProcessing}
                >
                  {isDeregistering ? (
                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </main>
  );
}
