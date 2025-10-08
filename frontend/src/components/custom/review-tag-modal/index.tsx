"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Eye, Wallet, UploadCloud } from "lucide-react";
import { ethers, type TransactionResponse } from "ethers";
import toast from "react-hot-toast";

const ABI = [
  "function registerMedia(string memory mediaCid, string memory metadataCid, bytes32 contentHash) public",
  "function getMedia(bytes32 contentHash) public view returns (string memory mediaCid, string memory metadataCid, address uploader, uint256 timestamp)",
  "function getMediaByOwner(address owner) public view returns (bytes32[] memory)",
  "error MediaAlreadyRegistered(bytes32 contentHash)",
  "error MediaNotFound(bytes32 contentHash)",
];

const CONTRACT_ADDRESS = "0x6Aa81Da4f2505F545370a5fC6DAceecD2B9F29E6";

function base64ToFile(base64: string, fileName: string): File {
  const arr = base64.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) throw new Error("Invalid Base64 string: MIME type not found.");
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
    throw new Error(`Failed to upload to Pinata: ${res.statusText} - ${errorBody}`);
  }
  const result = await res.json();
  if (!result.IpfsHash) throw new Error("Invalid response from Pinata: IPFS hash not found.");
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
  const [uploadData, setUploadData] = useState<{ mediaCid: string; metadataCid: string; contentHash: string } | null>(null);

  const handleUploads = async () => {
    const tagDataRaw = localStorage.getItem("uploadedTagData");
    const metadataRaw = localStorage.getItem("metadata");
    if (!tagDataRaw) return toast.error("Media data not found. Please go back and re-upload.");
    if (!metadataRaw) return toast.error("Metadata not found. Please go back and re-analyze.");
    if (typeof window.ethereum === "undefined") return toast.error("MetaMask is not installed.");

    setIsUploading(true);
    const toastId = toast.loading("Step 1: Uploading files to IPFS...");

    try {
      const tagData = JSON.parse(tagDataRaw);
      
      const mediaFile = base64ToFile(tagData.filePreview, tagData.name);
      const metadataFile = new File([metadataRaw], "metadata.json", { type: "application/json" });

      const [mediaCid, metadataCid, contentHash] = await Promise.all([
        uploadFileToPinata(mediaFile),
        uploadFileToPinata(metadataFile),
        generateSha256Hash(mediaFile)
      ]);

      setUploadData({ mediaCid, metadataCid, contentHash });

      toast.success("Step 1 Complete! Files uploaded. Ready to register.", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred during upload.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePayFees = async () => {
    if (typeof window.ethereum === "undefined") return toast.error("MetaMask is not installed.");
    if (!uploadData) return toast.error("Please upload the files first.");

    setIsLoading(true);
    const toastId = toast.loading("Step 2: Awaiting on-chain registration...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getEthersContract(signer);
      const formattedHash = '0x' + uploadData.contentHash;

      const tx: TransactionResponse = await contract.registerMedia(
        uploadData.mediaCid,
        uploadData.metadataCid,
        formattedHash
      );
      await tx.wait();

      toast.success("Step 2 Complete! Media registered on-chain.", { id: toastId });
      localStorage.removeItem("uploadedTagData");
      localStorage.removeItem("metadata");
      onCancel?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err.reason || err.message || "An unexpected error occurred.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const tagData = JSON.parse(localStorage.getItem("uploadedTagData") || "{}");
  const fileName = tagData.name || defaultFileName;
  const mediaType = tagData.mediaType || defaultMediaType;

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
              : "Check out your media tag preview and continue once you're happy with it"}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-[#3A3D45] border-[#4A4D55]">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="relative">
                    <div className="w-full h-64 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                      {tagData.filePreview ? (
                        <img src={tagData.filePreview} alt="Media Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-white">
                          <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Eye className="w-12 h-12 text-blue-400" />
                          </div>
                          <p className="text-sm text-gray-400">Media Preview</p>
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
                      {isBulkUpload ? `${fileCount} files in collection` : `@${mediaType} media`}
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
                onClick={handleUploads}
                className="bg-gray-600 text-white hover:bg-gray-700 transition-all duration-200"
                disabled={isUploading || isLoading || !!uploadData}
              >
                {uploadData ? <Check className="w-4 h-4 mr-2" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                {isUploading ? "Uploading..." : uploadData ? "Uploaded" : "1. Upload Files"}
              </Button>

              {uploadData && (
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
  );
}