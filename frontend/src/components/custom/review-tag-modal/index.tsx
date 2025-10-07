"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Eye, Wallet } from "lucide-react";
import { ethers, type TransactionResponse } from "ethers";
import toast from "react-hot-toast";


const ABI = [
  "function registerMedia(string memory cid, string memory watermarkHash) public",
  "function verifyMedia(string memory cid, string memory watermarkHash) public view returns (bool)",
  "function getMedia(string memory cid) public view returns (string memory, string memory, address, uint25)",
];

const CONTRACT_ADDRESS = "0x9050951e49aD03be8B972542f6474f2f8A12beA3";

async function uploadFileToPinata(file: File): Promise<string> {
  const data = new FormData();
  data.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjYWQ4ZTFkMC0xYzEwLTRlODYtYjQ5MS04ZDE3NmNlZTIwMTciLCJlbWFpbCI6InRlY2hub3RvcGljczIwMDRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImQxMTM3ZmNkMDZkZDNmYTE5ZGUwIiwic2NvcGVkS2V5U2VjcmV0IjoiNGFkODZmNDViMTU0ZTQ4ZjhhMzEwMzg0Y2JjMzg4YWVlOTQwZWYxY2I2NzQ2YmExNzZhNjIyNmM3ODVjYmIxZiIsImV4cCI6MTc5MDgxMjA3NX0.6nfJ1WwFxNMmitTtO80QN8Y-zww4ItGTuIMjpjpzvEA`,
    },
    body: data,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to upload to Pinata: ${res.statusText} - ${errorBody}`);
  }

  const result = await res.json();
  if (!result.IpfsHash) {
    throw new Error("Invalid response from Pinata: IPFS hash not found.");
  }
  return result.IpfsHash;
}

function generateSha256Hash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = reader.result as ArrayBuffer;
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        resolve(hashHex);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

function getEthersContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signerOrProvider);
}

export default function ReviewTagModal({
  onCancel,
  isBulkUpload = false,
  fileCount = 1,
  collectionName = "My Media",
  fileName = "My Media",
  description = "A sample media description",
  mediaType = "image",
}: {
  onCancel?: () => void;
  isBulkUpload?: boolean;
  fileCount?: number;
  collectionName?: string;
  fileName?: string;
  description?: string;
  mediaType?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSliderEnabled, setIsSliderEnabled] = useState(false);

  const handlePayFees = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask is not installed. Please install it to continue.");
      return;
    }

    const tagDataRaw = localStorage.getItem("uploadedTagData");
    if (!tagDataRaw) {
      toast.error("No file data found. Please upload your media first.");
      return;
    }

    setIsLoading(true);

    try {
      const tagData = JSON.parse(tagDataRaw);
      const files: string[] = tagData.files || [];
      if (files.length === 0) {
        throw new Error("No files found in the upload data.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getEthersContract(signer);

      const base64ToFile = (base64: string, fileNameLocal: string) => {
        const arr = base64.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "application/octet-stream";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], fileNameLocal, { type: mime });
      };

      for (let i = 0; i < files.length; i++) {
        const file = base64ToFile(files[i], tagData.fileName || `file_${i + 1}`);
        const toastId = toast.loading(`Processing file ${i + 1} of ${files.length}...`);

        try {
          toast.loading(`Uploading file ${i + 1} to IPFS...`, { id: toastId });
          const cid = await uploadFileToPinata(file);

          toast.loading(`Generating hash for file ${i + 1}...`, { id: toastId });
          const watermarkHash = await generateSha256Hash(file);

          toast.loading(`Waiting for transaction confirmation for file ${i + 1}...`, { id: toastId });
          const tx: TransactionResponse = await contract.registerMedia(cid, watermarkHash);

          await tx.wait();

          toast.success(`File ${i + 1} registered successfully!`, { id: toastId });
        } catch (fileError) {
          console.error(`Failed to process file ${i + 1}:`, fileError);
          toast.error(`Failed to process file ${i + 1}.`, { id: toastId });
        }
      }

      toast.success("All files have been processed!");
      localStorage.removeItem("uploadedTagData");
      onCancel?.();

    } catch (err: any) {
      console.error(err);
      const message = err.reason || err.message || "An unexpected error occurred.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
        <Card className="bg-[#2A2D35] border-[#3A3D45] shadow-2xl">
            <CardContent className="p-8">
                <h1 className="text-3xl font-bold text-white mb-4">
                    {isBulkUpload ? "Review your bulk media collection" : "Review your media tag"}
                </h1>
                <p className="text-gray-300 text-base mb-8">
                    {isBulkUpload
                        ? `Review your bulk media collection (${fileCount} files) and continue once you're happy with it`
                        : "Check out your media tag preview and continue once your happy with it"}
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <Card className="bg-[#3A3D45] border-[#4A4D55]">
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="w-full h-64 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                                        <div className="text-center text-white">
                                            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Eye className="w-12 h-12 text-blue-400" />
                                            </div>
                                            <p className="text-sm text-gray-400">Media Preview</p>
                                        </div>
                                        <div className="absolute bottom-3 right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                            <Check className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-white font-semibold">{isBulkUpload ? collectionName : fileName}</h3>
                                    <p className="text-blue-400 text-sm">{isBulkUpload ? `${fileCount} files in collection` : `@${mediaType} media`}</p>
                                </div>
                                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200">
                                    <Eye className="w-4 h-4 mr-2" />
                                    {isBulkUpload ? "View Collection" : "View Tag"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#3A3D45] border-[#4A4D55] relative">
                        <CardContent className="p-6">
                            {isLoading && (
                                <div className="absolute inset-0 bg-[#3A3D45]/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                                    <div className="flex flex-col items-center">
                                        <div className="relative w-16 h-16 mb-4">
                                            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                                            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-green-500 rounded-full animate-spin"></div>
                                        </div>
                                        <p className="text-white text-sm">Processing transaction...</p>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-6">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Tag ID</p>
                                    <p className="text-white font-mono text-sm">0xe7k2...f3b76</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-2">Description</p>
                                    <p className="text-gray-300 text-sm leading-relaxed">{description || "No description provided"}</p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-white font-semibold">Fees</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-600">
                                            <span className="text-gray-300 text-sm">Platform Fees:</span>
                                            <div className="text-right">
                                                <p className="text-white font-semibold">0.001 ETH</p>
                                                <p className="text-gray-400 text-xs">$3.25</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-600">
                                            <span className="text-gray-300 text-sm">Gas Fees:</span>
                                            <div className="text-right">
                                                <p className="text-white font-semibold">0.002 ETH</p>
                                                <p className="text-gray-400 text-xs">$6.50</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center py-2 bg-blue-500/10 rounded-lg px-3">
                                            <span className="text-white font-semibold">Total Fees:</span>
                                            <div className="text-right">
                                                <p className="text-white font-bold">0.003 ETH</p>
                                                <p className="text-blue-400 text-sm font-semibold">$9.75</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        className="bg-transparent border-gray-600 text-white hover:bg-[#3A3D45] hover:border-gray-500 transition-all duration-200"
                    >
                        Cancel
                    </Button>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <span className="text-gray-400 text-sm">Auto-pay</span>
                            <button
                                onClick={() => setIsSliderEnabled(!isSliderEnabled)}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                                    isSliderEnabled ? "bg-blue-500" : "bg-gray-600"
                                }`}
                            >
                                <div
                                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                                        isSliderEnabled ? "translate-x-7" : "translate-x-1"
                                    }`}
                                />
                            </button>
                        </div>
                        <Button
                            onClick={handlePayFees}
                            className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                            disabled={isLoading}
                        >
                            <Wallet className="w-4 h-4 mr-2" />
                            {isLoading ? "Processing..." : "Pay fees"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}