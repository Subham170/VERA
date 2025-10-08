"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/lib/config";
import { ethers, type TransactionResponse } from "ethers";
import { Check, Eye, Shield, UploadCloud, Wallet } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const ABI = [
  "function registerMedia(string memory cid, string memory watermarkHash) public",
  "function verifyMedia(string memory cid, string memory watermarkHash) public view returns (bool)",
  "function getMedia(string memory cid) public view returns (string memory, string memory, address, uint25)",
];

const CONTRACT_ADDRESS = "0x38a9487b69d3b8f810b5DFC53f671db002e827A4";

function base64ToFile(base64: string, fileName: string): File {
  const arr = base64.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch)
    throw new Error("Invalid Base64 string: MIME type not found.");
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], fileName, { type: mime });
}

async function uploadFileToPinata(file: File): Promise<string> {
  const data = new FormData();
  data.append("file", file);
  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjYWQ4ZTFkMC0xYzEwLTRlODYtYjQ5MS04ZDE3NmNlZTIwMTciLCJlbWFpbCI6InRlY2hub3RvcGljczIwMDRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjQzMjVhMDYzYWViMTNhMzIwYWFmIiwic2NvcGVkS2V5U2VjcmV0IjoiNjI5ZTljOWM1NjRlNjI0ZDdiMjU5ODFmMzQ0MDIzNzQyM2U5ODc4OWQwYTU2YTdmYWYwZmM3ZDkwNzY0ZjBjMyIsImV4cCI6MTc5MTQwNzg0Mn0.WtLYbmqgguRrXI44F78F8DCbQ_8MadDF_J2GY2PLrlE`,
    },
    body: data,
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `Failed to upload to Pinata: ${res.statusText} - ${errorBody}`
    );
  }
  const result = await res.json();
  if (!result.IpfsHash)
    throw new Error("Invalid response from Pinata: IPFS hash not found.");
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
        const hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
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
  fileName: defaultFileName = "My Media",
  description = "A sample media description",
  mediaType: defaultMediaType = "image",
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>("");
  const [isPaymentStep, setIsPaymentStep] = useState(false);
  const [ipfsUploadData, setIpfsUploadData] = useState<{
    cid: string;
    watermarkHash: string;
  } | null>(null);

  const handleUploadToIPFS = async () => {
    const tagDataRaw = localStorage.getItem("uploadedTagData");
    if (!tagDataRaw)
      return toast.error(
        "No file data found. Please go back and upload your media first."
      );
    if (typeof window.ethereum === "undefined")
      return toast.error("MetaMask is not installed.");

    setIsUploading(true);
    setUploadStep("Preparing file for upload...");

    try {
      const tagData = JSON.parse(tagDataRaw);
      const file = base64ToFile(tagData.filePreview, tagData.name);

      setUploadStep("Uploading to IPFS...");
      const cid = await uploadFileToPinata(file);

      setUploadStep("Connecting to wallet...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      let mediaType = tagData.mediaType || "image";
      const typeMap: Record<string, string> = {
        image: "img",
        video: "video",
        audio: "audio",
      };
      const backendType = typeMap[mediaType] || "img";

      let route: string = API_ENDPOINTS.TAGS;
      if (backendType === "img") route = API_ENDPOINTS.TAGS_WITH_IMAGES;
      else if (backendType === "video") route = API_ENDPOINTS.TAGS_WITH_VIDEOS;
      else if (backendType === "audio") route = API_ENDPOINTS.TAGS_WITH_AUDIO;

      const formData = new FormData();
      if (backendType === "img") formData.append("images", file);
      else if (backendType === "video") formData.append("videos", file);
      else if (backendType === "audio") formData.append("audio", file);

      formData.append("file_name", tagData.name);
      formData.append("hash_address", cid);
      formData.append("address", walletAddress);
      formData.append("type", backendType);

      setUploadStep("Saving to database...");
      const backendRes = await fetch(route, { method: "POST", body: formData });

      if (!backendRes.ok) {
        const errorData = await backendRes.json();
        throw new Error(errorData.message || "Backend registration failed.");
      }

      setUploadStep("Generating security hash...");
      const watermarkHash = await generateSha256Hash(file);
      setIpfsUploadData({ cid, watermarkHash });

      setUploadStep("Upload complete!");
      toast.success("File uploaded and registered successfully!");

      // Auto-proceed to payment after a short delay
      setTimeout(() => {
        setIsPaymentStep(true);
        setUploadStep("Preparing blockchain transaction...");
        handlePayFees();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
      setUploadStep("");
    }
  };

  const handlePayFees = async () => {
    if (typeof window.ethereum === "undefined")
      return toast.error("MetaMask is not installed.");
    if (!ipfsUploadData)
      return toast.error("Please upload the file to IPFS first.");

    setIsLoading(true);
    setUploadStep("Connecting to MetaMask...");

    try {
      setUploadStep("Preparing blockchain transaction...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getEthersContract(signer);

      setUploadStep("Waiting for transaction confirmation...");
      const tx: TransactionResponse = await contract.registerMedia(
        ipfsUploadData.cid,
        ipfsUploadData.watermarkHash
      );

      setUploadStep("Confirming transaction...");
      await tx.wait();

      setUploadStep("Transaction complete!");
      toast.success("Transaction successful! Media registered on-chain.");
      localStorage.removeItem("uploadedTagData");

      // Close modal after success
      setTimeout(() => {
        onCancel?.();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.reason || err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      setIsPaymentStep(false);
      setUploadStep("");
    }
  };

  const tagData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("uploadedTagData") || "{}")
      : {};
  const fileName = tagData.name || defaultFileName;
  const mediaType = tagData.mediaType || defaultMediaType;

  return (
    <>
      {/* Upload/Payment Loading Overlay */}
      {(isUploading || isLoading) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#2A2D35] rounded-2xl p-8 max-w-md mx-4 border border-gray-700/50 shadow-2xl">
            {/* Main Loading Animation */}
            <div className="flex flex-col items-center space-y-6">
              {/* Animated Icon */}
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
                    isPaymentStep
                      ? "bg-gradient-to-br from-purple-500 to-purple-700"
                      : "bg-gradient-to-br from-blue-500 to-blue-700"
                  }`}
                >
                  {isPaymentStep ? (
                    <Wallet className="w-10 h-10 text-white animate-pulse" />
                  ) : (
                    <UploadCloud className="w-10 h-10 text-white animate-pulse" />
                  )}
                </div>
                {/* Rotating Ring */}
                <div
                  className={`absolute inset-0 w-20 h-20 border-4 rounded-full animate-spin ${
                    isPaymentStep
                      ? "border-purple-500/30 border-t-purple-500"
                      : "border-blue-500/30 border-t-blue-500"
                  }`}
                ></div>
                {/* Outer Pulse Ring */}
                <div
                  className={`absolute inset-0 w-20 h-20 border-2 rounded-full animate-ping ${
                    isPaymentStep
                      ? "border-purple-400/20"
                      : "border-blue-400/20"
                  }`}
                ></div>
              </div>

              {/* Loading Text */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">
                  {isPaymentStep ? "Processing Payment" : "Uploading Media"}
                </h3>
                <p className="text-gray-400 text-sm">{uploadStep}</p>
              </div>

              {/* Progress Steps */}
              <div className="w-full space-y-3">
                {isPaymentStep ? (
                  // Payment steps
                  <>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          uploadStep.includes("MetaMask")
                            ? "bg-purple-500 animate-pulse"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-300">
                        Connecting to MetaMask
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          uploadStep.includes("Preparing blockchain")
                            ? "bg-purple-500 animate-pulse"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-300">
                        Preparing blockchain transaction
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          uploadStep.includes("Waiting for transaction")
                            ? "bg-purple-500 animate-pulse"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-300">
                        Waiting for transaction confirmation
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          uploadStep.includes("Confirming")
                            ? "bg-purple-500 animate-pulse"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-300">
                        Confirming transaction
                      </span>
                    </div>
                  </>
                ) : (
                  // Upload steps
                  <>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          uploadStep.includes("Preparing")
                            ? "bg-blue-500 animate-pulse"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-300">
                        Preparing file for upload
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          uploadStep.includes("IPFS")
                            ? "bg-blue-500 animate-pulse"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-300">
                        Uploading to IPFS
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          uploadStep.includes("wallet")
                            ? "bg-blue-500 animate-pulse"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-300">
                        Connecting to wallet
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          uploadStep.includes("database")
                            ? "bg-blue-500 animate-pulse"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-300">
                        Saving to database
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          uploadStep.includes("hash")
                            ? "bg-blue-500 animate-pulse"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-300">
                        Generating security hash
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full animate-pulse ${
                    isPaymentStep
                      ? "bg-gradient-to-r from-purple-500 to-purple-600"
                      : "bg-gradient-to-r from-blue-500 to-blue-600"
                  }`}
                ></div>
              </div>

              {/* Security Notice */}
              <div
                className={`rounded-lg p-3 w-full ${
                  isPaymentStep
                    ? "bg-purple-900/20 border border-purple-500/30"
                    : "bg-blue-900/20 border border-blue-500/30"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Shield
                    className={`w-4 h-4 ${
                      isPaymentStep ? "text-purple-400" : "text-blue-400"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      isPaymentStep ? "text-purple-300" : "text-blue-300"
                    }`}
                  >
                    {isPaymentStep
                      ? "Your transaction is being processed securely on the blockchain"
                      : "Your media is being securely uploaded and verified"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <Card className="bg-[#2A2D35] border-[#3A3D45] shadow-2xl">
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              {isBulkUpload
                ? "Review your bulk media collection"
                : "Review your media tag"}
            </h1>
            <p className="text-gray-300 text-base mb-8">
              {isBulkUpload
                ? `Review your bulk media collection (${fileCount} files) and continue once you're happy with it`
                : "Check out your media tag preview and continue once you're happy with it"}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-[#3A3D45] border-[#4A4D55]">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="w-full h-64 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                        {tagData.filePreview ? (
                          <img
                            src={tagData.filePreview}
                            alt="Media Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center text-white">
                            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Eye className="w-12 h-12 text-blue-400" />
                            </div>
                            <p className="text-sm text-gray-400">
                              Media Preview
                            </p>
                          </div>
                        )}
                        <div className="absolute bottom-3 right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-white font-semibold truncate">
                        {isBulkUpload ? collectionName : fileName}
                      </h3>
                      <p className="text-blue-400 text-sm">
                        {isBulkUpload
                          ? `${fileCount} files in collection`
                          : `@${mediaType} media`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-[#2A2D35] border-t border-[#3A3D45] p-4 flex justify-between items-center -mx-8 -mb-8 mt-8">
              <Button
                variant="outline"
                onClick={onCancel}
                className="bg-transparent border-gray-600 text-white hover:bg-[#3A3D45] hover:border-gray-500 transition-all duration-200"
              >
                Cancel
              </Button>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleUploadToIPFS}
                  className="bg-gray-600 text-white hover:bg-gray-700 transition-all duration-200"
                  disabled={isUploading || isLoading || !!ipfsUploadData}
                >
                  {ipfsUploadData ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <UploadCloud className="w-4 h-4 mr-2" />
                  )}
                  {isUploading
                    ? "Uploading..."
                    : ipfsUploadData
                    ? "Uploaded"
                    : "1. Upload to IPFS"}
                </Button>

                {ipfsUploadData && (
                  <Button
                    onClick={handlePayFees}
                    className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={isLoading || isUploading}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isLoading ? "Processing..." : "2. Pay & Register"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
