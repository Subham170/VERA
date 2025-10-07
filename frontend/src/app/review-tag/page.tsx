"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Eye, Wallet } from "lucide-react";
import { ethers, type TransactionResponse } from "ethers";
import toast from "react-hot-toast";

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjYWQ4ZTFkMC0xYzEwLTRlODYtYjQ5MS04ZDE3NmNlZTIwMTciLCJlbWFpbCI6InRlY2hub3RvcGljczIwMDRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImQxMTM3ZmNkMDZkZDNmYTE5ZGUwIiwic2NvcGVkS2V5U2VjcmV0IjoiNGFkODZmNDViMTU0ZTQ4ZjhhMzEwMzg0Y2JjMzg4YWVlOTQwZWYxY2I2NzQ2YmExNzZhNjIyNmM3ODVjYmIxZiIsImV4cCI6MTc5MDgxMjA3NX0.6nfJ1WwFxNMmitTtO80QN8Y-zww4ItGTuIMjpjpzvEA";

const ABI = [
  "function registerMedia(string memory cid, string memory watermarkHash) public",
  "function verifyMedia(string memory cid, string memory watermarkHash) public view returns (bool)",
  "function getMedia(string memory cid) public view returns (string memory, string memory, address, uint25)",
];
const CONTRACT_ADDRESS = "0x9050951e49aD03be8B972542f6474f2f8A12beA3";
const SEPOLIA_CHAIN_ID = "0xaa36a7";
const SEPOLIA_RPC_URL = "https://rpc.sepolia.org";

async function uploadFileToPinata(file: File): Promise<string> {
  const data = new FormData();
  data.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
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

async function switchToSepolia() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID,
              chainName: "Sepolia Test Network",
              rpcUrls: [SEPOLIA_RPC_URL],
              nativeCurrency: {
                name: "SepoliaETH",
                symbol: "ETH",
                decimals: 18,
              },
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } catch (addError) {
        console.error("Failed to add Sepolia network", addError);
        throw new Error("Could not add Sepolia network to MetaMask.");
      }
    } else {
      console.error("Failed to switch network", switchError);
      throw new Error("Failed to switch to the Sepolia network.");
    }
  }
}

interface StoredTagData {
  fileName: string;
  description: string;
  mediaType: string;
  isBulkUpload: boolean;
  fileCount: number;
  files: string[];
}

export default function ReviewTagModal({ onCancel }: { onCancel?: () => void; }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSliderEnabled, setIsSliderEnabled] = useState(false);
  const [tagData, setTagData] = useState<StoredTagData | null>(null);
  const [gasFeeEth, setGasFeeEth] = useState<string | null>(null);
  const [gasFeeUsd, setGasFeeUsd] = useState<string | null>(null);
  const [ethPrice, setEthPrice] = useState<number | null>(null);

  const platformFeeEth = 0.001;

  useEffect(() => {
    const storedDataRaw = localStorage.getItem("uploadedTagData");
    if (storedDataRaw) {
      try {
        setTagData(JSON.parse(storedDataRaw));
      } catch (error) {
        console.error("Failed to parse tag data:", error);
        toast.error("Could not load media for review.");
      }
    }

    const estimateFees = async () => {
      try {
        if (!window.ethereum) return;

        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = getEthersContract(provider);

        const [feeData, ethPriceResponse] = await Promise.all([
          provider.getFeeData(),
          fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
        ]);

        const ethPriceData = await ethPriceResponse.json();
        const currentEthPrice = ethPriceData.ethereum.usd;
        setEthPrice(currentEthPrice);

        if (!feeData.maxFeePerGas) {
          throw new Error("Fee data not available.");
        }

        const estimatedGasLimit = await contract.registerMedia.estimateGas(
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        );

        const estimatedFeeWei = estimatedGasLimit * feeData.maxFeePerGas;
        const feeInEth = ethers.formatEther(estimatedFeeWei);
        const feeInUsd = (parseFloat(feeInEth) * currentEthPrice).toFixed(2);

        setGasFeeEth(parseFloat(feeInEth).toFixed(5));
        setGasFeeUsd(feeInUsd);
      } catch (err) {
        console.error("Could not estimate gas fees:", err);
        setGasFeeEth("N/A");
        setGasFeeUsd("N/A");
      }
    };

    estimateFees();
  }, []);

  const handlePayFees = async () => {
    if (!tagData || tagData.files.length === 0) {
      toast.error("No file data found to upload.");
      return;
    }

    setIsLoading(true);
    let allSucceeded = true;

    try {
      await switchToSepolia();
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getEthersContract(signer);

      const base64ToFile = (base64: string, fileName: string) => {
        const arr = base64.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "application/octet-stream";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], fileName, { type: mime });
      };

      for (let i = 0; i < tagData.files.length; i++) {
        const toastId = toast.loading(`Processing file ${i + 1} of ${tagData.files.length}...`);
        try {
          const file = base64ToFile(tagData.files[i], `${tagData.fileName}_${i + 1}`);
          const cid = await uploadFileToPinata(file);
          const watermarkHash = await generateSha256Hash(file);
          
          toast.loading(`Waiting for transaction confirmation...`, { id: toastId });
          const tx: TransactionResponse = await contract.registerMedia(cid, watermarkHash);
          await tx.wait();

          toast.success(`File ${i + 1} transaction succeeded!`, { id: toastId });

        } catch (fileError: any) {
          allSucceeded = false;
          console.error(`Error processing file ${i + 1}:`, fileError);
          const errorMessage = fileError.reason || fileError.message || "An unknown error occurred.";
          toast.error(`File ${i + 1} transaction failed: ${errorMessage}`, { id: toastId });
        }
      }

      if (allSucceeded) {
        toast.success("All files registered successfully!");
        localStorage.removeItem("uploadedTagData");
      } else {
        toast.error("Some files failed to register. Check the console for details.");
      }

    } catch (err: any) {
      console.error(err);
      toast.error(err.reason || err.message || "An error occurred during setup.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalFeeEth = gasFeeEth ? (platformFeeEth + parseFloat(gasFeeEth)).toFixed(5) : null;
  const platformFeeUsd = ethPrice ? (platformFeeEth * ethPrice).toFixed(2) : null;
  const totalFeeUsd = gasFeeUsd && platformFeeUsd ? (parseFloat(platformFeeUsd) + parseFloat(gasFeeUsd)).toFixed(2) : null;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-[#2A2D35] border-[#3A3D45] shadow-2xl">
        <CardContent className="p-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            {tagData?.isBulkUpload ? "Review your bulk media collection" : "Review your media tag"}
          </h1>
          <p className="text-gray-300 text-base mb-8">
            {tagData?.isBulkUpload ? `Review your bulk media collection (${tagData.fileCount} files) and continue once you're happy with it` : "Check out your media tag preview and continue once your happy with it"}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-[#3A3D45] border-[#4A4D55]">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="relative">
                    <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                      {tagData && tagData.files[0] ? (
                        <img
                          src={tagData.files[0]}
                          alt="Media Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-gray-400">
                          <Eye className="w-12 h-12 mx-auto mb-2" />
                          <p>Media Preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold">{tagData?.fileName || "Loading..."}</h3>
                    <p className="text-blue-400 text-sm">{tagData?.isBulkUpload ? `${tagData.fileCount} files in collection` : `@${tagData?.mediaType} media`}</p>
                  </div>
                  <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200">
                    <Eye className="w-4 h-4 mr-2" />
                    {tagData?.isBulkUpload ? "View Collection" : "View Tag"}
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
                    <p className="text-gray-300 text-sm leading-relaxed">{tagData?.description || "No description provided"}</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Fees</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-600">
                        <span className="text-gray-300 text-sm">Platform Fees:</span>
                        <div className="text-right">
                          <p className="text-white font-semibold">{platformFeeEth} ETH</p>
                          <p className="text-gray-400 text-xs">${platformFeeUsd || '...'}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-600">
                        <span className="text-gray-300 text-sm">Gas Fees (est.):</span>
                        <div className="text-right">
                          <p className="text-white font-semibold">{gasFeeEth || '...'} ETH</p>
                          <p className="text-gray-400 text-xs">${gasFeeUsd || '...'}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 bg-blue-500/10 rounded-lg px-3">
                        <span className="text-white font-semibold">Total Fees:</span>
                        <div className="text-right">
                          <p className="text-white font-bold">{totalFeeEth || '...'} ETH</p>
                          <p className="text-blue-400 text-sm font-semibold">${totalFeeUsd || '...'}</p>
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
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isSliderEnabled ? "bg-blue-500" : "bg-gray-600"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isSliderEnabled ? "translate-x-7" : "translate-x-1"}`} />
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