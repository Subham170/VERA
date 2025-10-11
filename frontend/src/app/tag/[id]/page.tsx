"use client";

import LoadingScreen from "@/components/custom/loading-screen";
import { Button } from "@/components/ui/button";
import {
  API_ENDPOINTS,
  NEXT_PUBLIC_PINATA_GATEWAY_TOKEN,
  NEXT_PUBLIC_PINATA_GATEWAY_URL,
  NEXT_PUBLIC_PINATA_JWT,
} from "@/lib/config";
import { ethers, type TransactionResponse } from "ethers";
import { BadgeCheck, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Download, Music, Share2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const ABI = [
  "function registerMedia(string memory mediaCid, string memory metadataCid, bytes32 contentHash) public",
  "function deregisterMedia(bytes32 contentHash) public",
  "function getMedia(bytes32 contentHash) public view returns (string memory mediaCid, string memory metadataCid, address uploader, uint256 timestamp)",
  "function getMediaByOwner(address owner) public view returns (bytes32[] memory)",
  "error MediaAlreadyRegistered(bytes32 contentHash)",
  "error MediaNotFound(bytes32 contentHash)",
  "error Unauthorized()",
  "error MediaNotRegistered(bytes32 contentHash)",
  "error NotOwner()",
  "error AlreadyDeregistered(bytes32 contentHash)",
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const WATERMARK_URL =
  "https://res.cloudinary.com/dmxn5vut7/image/upload/v1760146871/vera/detection/images/pm1gjtyunblk5kyfxltr.png";

function getEthersContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(CONTRACT_ADDRESS as string, ABI, signerOrProvider);
}

function decodeCustomError(errorData: string) {
  const errorSelectors = {
    "0x6999de4a": "MediaNotFound",
    "0xaa31b366": "MediaNotRegistered",
    "0x30c41534": "Unauthorized",
    "0x4f6de9d0": "NotOwner",
    "0xe7e78fd5": "AlreadyDeregistered",
    "0x95c1cb93": "MediaAlreadyRegistered",
  };

  const selector = errorData.slice(0, 10);
  return (
    errorSelectors[selector as keyof typeof errorSelectors] || "UnknownError"
  );
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
    throw new Error(
      `Failed to unpin from Pinata: ${res.statusText} - ${errorBody}`
    );
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
  img_urls?: string[];
  video_urls?: string[];
  audio_urls?: string[];
  file_count?: number;
  is_bulk_upload?: boolean;
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
  isBulkUpload?: boolean;
  totalFiles?: number;
  files?: Array<{
    name: string;
    description: string;
    mediaType: string;
    detectionResult: any;
    cloudinaryUrl: string;
  }>;
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
  const [currentUserAddress, setCurrentUserAddress] = useState<string | null>(
    null
  );
  const [isDeregistering, setIsDeregistering] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isFilesDropdownOpen, setIsFilesDropdownOpen] = useState(false);

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
    // Reset carousel index when tag changes
    setCurrentMediaIndex(0);
  }, [tag]);

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
        if (result.status !== "success" || !result.data.tag)
          throw new Error("The requested tag could not be found.");
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
        if (!gatewayUrl || !gatewayToken)
          throw new Error("Pinata gateway configuration is missing.");

        const response = await fetch(
          `${gatewayUrl}/ipfs/${tag.metadatacid}?pinataGatewayToken=${gatewayToken}`
        );
        if (!response.ok)
          throw new Error("Could not fetch metadata from IPFS.");
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

    const toastId = toast.loading("Preparing download...");

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

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        if (!blob) throw new Error("Could not create image blob");

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${tag.file_name.replace(/\.[^/.]+$/, "")}_verafied.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success("Download started!", { id: toastId });
      } else if (tag.type === "video") {
        toast.loading("Applying watermark...", { id: toastId });

        const payload = {
          videoUrl: tag.primary_media_url,
          watermarkUrl: WATERMARK_URL,
        };
        console.log(payload);

        const watermarkResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tags/watermark`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!watermarkResponse.ok) {
          const errorData = await watermarkResponse.json();
          throw new Error(errorData.message || "Failed to apply watermark.");
        }

        const result = await watermarkResponse.json();
        const watermarkedUrl = result.data.watermarkedUrl;

        if (!watermarkedUrl) {
          throw new Error("Backend did not return a watermarked URL.");
        }

        const a = document.createElement("a");
        a.href = watermarkedUrl;
        a.download = `watermarked_${tag.file_name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        toast.success("Watermarked video download started!", { id: toastId });
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
        toast.success("Download started!", { id: toastId });
      }
    } catch (err: any) {
      console.error("Download/Watermark error:", err);
      toast.error(err.message || "An error occurred.", { id: toastId });
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
    if (!tag || !currentUserAddress)
      return toast.error("Cannot perform action. Data is missing.");
    if (currentUserAddress.toLowerCase() !== tag.address.toLowerCase())
      return toast.error("You are not authorized to deregister this media.");
    if (typeof window.ethereum === "undefined")
      return toast.error("MetaMask is not installed.");

    setIsDeregistering(true);
    const toastId = toast.loading("Deregistering media...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getEthersContract(signer);
      const formattedHash = "0x" + tag.hash_address;

      toast.loading("Checking media status on blockchain...", { id: toastId });
      try {
        const mediaData = await contract.getMedia(formattedHash);
        if (
          mediaData.uploader.toLowerCase() !== currentUserAddress.toLowerCase()
        ) {
          throw new Error("You are not the original uploader of this media.");
        }
      } catch (getMediaError: any) {
        console.error("Error checking media on blockchain:", getMediaError);
        if (getMediaError.message?.includes("MediaNotFound")) {
          throw new Error("This media is not registered on the blockchain.");
        }
        throw new Error("Failed to verify media status on blockchain.");
      }

      toast.loading("Awaiting on-chain transaction...", { id: toastId });

      try {
        await contract.deregisterMedia.estimateGas(formattedHash);
      } catch (estimateError: any) {
        console.error("Gas estimation failed:", estimateError);
        if (
          estimateError.message?.includes("MediaNotFound") ||
          estimateError.message?.includes("MediaNotRegistered")
        ) {
          throw new Error("This media is not registered on the blockchain.");
        }
        if (
          estimateError.message?.includes("Unauthorized") ||
          estimateError.message?.includes("NotOwner")
        ) {
          throw new Error("You are not authorized to deregister this media.");
        }
        if (estimateError.message?.includes("AlreadyDeregistered")) {
          throw new Error("This media has already been deregistered.");
        }
        throw new Error(
          `Transaction will fail: ${estimateError.message || "Unknown error"}`
        );
      }

      const tx: TransactionResponse = await contract.deregisterMedia(
        formattedHash
      );
      await tx.wait();

      toast.loading("Unpinning files from IPFS...", { id: toastId });
      await Promise.all([
        unpinFromPinata(tag.mediacid),
        unpinFromPinata(tag.metadatacid),
      ]);

      toast.loading("Deleting from database...", { id: toastId });
      const deleteResponse = await fetch(API_ENDPOINTS.TAG_BY_ID(id), {
        method: "DELETE",
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        console.error("Database deletion failed:", {
          status: deleteResponse.status,
          statusText: deleteResponse.statusText,
          errorData,
          url: API_ENDPOINTS.TAG_BY_ID(id),
        });
        throw new Error(errorData.message || "Failed to delete from database.");
      }

      toast.success("Media successfully deregistered from all systems.", {
        id: toastId,
      });
      router.push("/");
    } catch (err: any) {
      console.error("Deregister error:", err);

      let errorMessage =
        err.reason || err.message || "Failed to deregister media.";

      if (err.data) {
        const decodedError = decodeCustomError(err.data);

        switch (decodedError) {
          case "MediaNotFound":
          case "MediaNotRegistered":
            errorMessage = "This media is not registered on the blockchain.";
            break;
          case "Unauthorized":
          case "NotOwner":
            errorMessage = "You are not authorized to deregister this media.";
            break;
          case "AlreadyDeregistered":
            errorMessage = "This media has already been deregistered.";
            break;
          default:
            errorMessage = `Smart contract error: ${decodedError}`;
        }
      }

      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsDeregistering(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingScreen
        message="Loading Media Details"
        subMessage="Fetching content and verifying authenticity"
      />
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

  const isOwner =
    currentUserAddress &&
    tag &&
    currentUserAddress.toLowerCase() === tag.address.toLowerCase();
  const isProcessing = isDeregistering;

  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="relative">
            <div className="aspect-[1/1] w-full overflow-hidden rounded-[20px] bg-black flex items-center justify-center">
              {tag.is_bulk_upload ? (
                // Bulk upload carousel
                <div className="relative w-full h-full">
                  {(() => {
                    const mediaUrls = tag.type === "img" ? (tag.img_urls || []) : 
                                     tag.type === "video" ? (tag.video_urls || []) : 
                                     (tag.audio_urls || []);
                    const currentUrl = mediaUrls[currentMediaIndex] || tag.primary_media_url;
                    
                    // Ensure currentMediaIndex is within bounds
                    if (currentMediaIndex >= mediaUrls.length) {
                      setCurrentMediaIndex(0);
                    }
                    
                    return (
                      <>
                        {tag.type === "video" ? (
                          <video
                            src={currentUrl}
                            className="w-full h-full object-cover"
                            controls
                            autoPlay
                            muted
                            loop
                            playsInline
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : tag.type === "audio" ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-4">
                            <Music className="w-24 h-24 text-gray-500 mb-4" />
                            <audio
                              src={currentUrl}
                              controls
                              className="w-full"
                            >
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        ) : (
                          <Image
                            src={currentUrl}
                            alt={tag.file_name}
                            fill
                            className="object-cover"
                            priority
                          />
                        )}
                        
                        {/* Carousel Navigation */}
                        {mediaUrls.length > 1 && (
                          <>
                            <button
                              onClick={() => setCurrentMediaIndex(prev => prev > 0 ? prev - 1 : mediaUrls.length - 1)}
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setCurrentMediaIndex(prev => prev < mediaUrls.length - 1 ? prev + 1 : 0)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                            
                            {/* File counter */}
                            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
                              <span className="text-white text-sm font-medium">
                                {currentMediaIndex + 1} of {mediaUrls.length}
                              </span>
                            </div>
                            
                            {/* Dots indicator */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                              {mediaUrls.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentMediaIndex(index)}
                                  className={`w-2 h-2 rounded-full transition-colors ${
                                    index === currentMediaIndex ? "bg-white" : "bg-white/50"
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                // Single media display
                <>
                  {tag.type === "video" ? (
                    <video
                      src={tag.primary_media_url}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : tag.type === "audio" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-4">
                      <Music className="w-24 h-24 text-gray-500 mb-4" />
                      <audio
                        src={tag.primary_media_url}
                        controls
                        className="w-full"
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ) : (
                    <Image
                      src={tag.primary_media_url}
                      alt={tag.file_name}
                      fill
                      className="object-cover"
                      priority
                    />
                  )}
                </>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{tag.file_name}</h1>
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <BadgeCheck className="w-4 h-4 text-white" />
              </div>
              {tag.is_bulk_upload && (
                <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-sm font-medium">
                  {tag.file_count} files
                </div>
              )}
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <div>
                {isMetadataLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-gray-400">Loading...</span>
                  </div>
                ) : (
                  metadata?.description || "No description provided."
                )}
              </div>
              
              {/* Bulk upload file details - Dropdown */}
              {tag.is_bulk_upload && metadata?.isBulkUpload && metadata.files && metadata.files.length > 0 && (
                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={() => setIsFilesDropdownOpen(!isFilesDropdownOpen)}
                    className="flex items-center justify-between w-full p-3 rounded-lg border border-gray-700 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-white">
                        Files in Collection ({metadata.files.length})
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          (() => {
                            const currentFile = metadata.files?.[currentMediaIndex];
                            const naturalProb = currentFile?.detectionResult?.natural_probability || currentFile?.detectionResult?.natural || 0;
                            const deepfakeProb = currentFile?.detectionResult?.deepfake_probability || currentFile?.detectionResult?.deepfake || 0;
                            return naturalProb > deepfakeProb ? "bg-green-500" : "bg-red-500";
                          })()
                        }`} />
                        <span className="text-sm text-gray-400">
                          {(() => {
                            const currentFile = metadata.files?.[currentMediaIndex];
                            const naturalProb = currentFile?.detectionResult?.natural_probability || currentFile?.detectionResult?.natural || 0;
                            return `${naturalProb}% natural`;
                          })()}
                        </span>
                      </div>
                    </div>
                    {isFilesDropdownOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {isFilesDropdownOpen && (
                    <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                      {metadata.files.map((file, index) => {
                        if (!file) return null;
                        
                        const naturalProb = file.detectionResult?.natural_probability || file.detectionResult?.natural || 0;
                        const deepfakeProb = file.detectionResult?.deepfake_probability || file.detectionResult?.deepfake || 0;
                        
                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              index === currentMediaIndex
                                ? "bg-blue-500/20 border-blue-500/50"
                                : "bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
                            }`}
                            onClick={() => setCurrentMediaIndex(index)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">
                                  {file.name || `File ${index + 1}`}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  {file.mediaType || 'unknown'} • {naturalProb}% natural
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 ml-3">
                                <div className={`w-2 h-2 rounded-full ${
                                  naturalProb > deepfakeProb
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`} />
                                <span className="text-xs text-gray-400">
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              <div className="pt-4 border-t border-gray-700 space-y-4">
                <h2 className="text-lg font-semibold text-white">
                  AI Analysis Report
                </h2>
                {isMetadataLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-400">
                      Loading analysis...
                    </span>
                  </div>
                ) : metadata ? (
                  <>
                    {metadata.isBulkUpload ? (
                      // Bulk upload analysis - show current file's analysis
                      <>
                        {(() => {
                          const currentFile = metadata.files?.[currentMediaIndex];
                          if (!currentFile?.detectionResult) {
                            return (
                              <p className="text-sm text-red-400">
                                No analysis data available for this file.
                              </p>
                            );
                          }
                          
                          const detectionResult = currentFile.detectionResult;
                          return (
                            <>
                              <div>
                                <p className="text-xs font-semibold text-gray-400 mb-2">
                                  PROBABILITY (Current File)
                                </p>
                                <div className="w-full bg-gray-700 rounded-full h-2.5 flex overflow-hidden">
                                  <div
                                    className="bg-green-500 h-2.5"
                                    style={{
                                      width: `${detectionResult.natural_probability || 0}%`,
                                    }}
                                  ></div>
                                  <div
                                    className="bg-yellow-500 h-2.5"
                                    style={{
                                      width: `${detectionResult.deepfake_probability || 0}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-xs mt-1">
                                  <span className="text-green-400">
                                    Natural: {detectionResult.natural_probability || 0}%
                                  </span>
                                  <span className="text-yellow-400">
                                    Deepfake: {detectionResult.deepfake_probability || 0}%
                                  </span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-400 mb-1">
                                  CONTENT ANALYSIS
                                </p>
                                <p className="text-sm text-gray-300">
                                  {detectionResult.reasoning?.overall || "No analysis available"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-400 mb-1">
                                  FILE DETAILS
                                </p>
                                <p className="text-sm text-gray-300">
                                  <strong>Name:</strong> {currentFile.name}<br/>
                                  <strong>Type:</strong> {currentFile.mediaType}<br/>
                                  <strong>File {currentMediaIndex + 1} of {metadata.files?.length || 0}</strong>
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-400 mb-1">
                                  REGISTERED BY
                                </p>
                                <p className="font-mono text-sm text-white">
                                  {(metadata as any).uploader || "Unknown"}
                                </p>
                              </div>
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      // Single upload analysis
                      <>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 mb-2">
                            PROBABILITY
                          </p>
                          <div className="w-full bg-gray-700 rounded-full h-2.5 flex overflow-hidden">
                            <div
                              className="bg-green-500 h-2.5"
                              style={{
                                width: `${metadata.probabilities?.natural || 0}%`,
                              }}
                            ></div>
                            <div
                              className="bg-yellow-500 h-2.5"
                              style={{
                                width: `${metadata.probabilities?.deepfake || 0}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-green-400">
                              Natural: {metadata.probabilities?.natural || 0}%
                            </span>
                            <span className="text-yellow-400">
                              Deepfake: {metadata.probabilities?.deepfake || 0}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 mb-1">
                            CONTENT ANALYSIS
                          </p>
                          <p className="text-sm text-gray-300">
                            {metadata.contentAnalysis || "No analysis available"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 mb-1">
                            REGISTERED BY
                          </p>
                          <p className="font-mono text-sm text-white">
                            {metadata.signerAddress || "Unknown"}
                          </p>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-red-400">
                    Could not load analysis report.
                  </p>
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
