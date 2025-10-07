"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Wallet } from "lucide-react";
import { ethers, type TransactionResponse } from "ethers";
import toast from "react-hot-toast";


const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjYWQ4ZTFkMC0xYzEwLTRlODYtYjQ5MS04ZDE3NmNlZTIwMTciLCJlbWFpbCI6InRlY2hub3RvcGljczIwMDRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjM2MzM3MGNjMGZhMTI2ZjA1OTEzIiwic2NvcGVkS2V5U2VjcmV0IjoiOTQ4NjkxMjY1OTJjNGY1NjZhYmYwN2IyZjZmNDcyN2NhODM0MTg4YmMyNTRiNDM4MzkxMWUyMTBjNmMzMWYyNiIsImV4cCI6MTc5MTM4NDc1N30.Bz9Xc2IHRZUZ-ts2bo7Dvsn7gF3K7CPFAgqAJsMOzCI";

const ABI = [
  "function registerMedia(string memory cid, string memory watermarkHash) public",
  "function getMediaByOwner(address owner) public view returns (string[] memory)",
];
const CONTRACT_ADDRESS = "0x38a9487b69d3b8f810b5DFC53f671db002e827A4";
const SEPOLIA_CHAIN_ID = "0xaa36a7";

async function uploadToPinata(file: File): Promise<string> {
  const data = new FormData();
  data.append("file", file, file.name);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`, 
    },
    body: data,
  });

  if (!res.ok) {
    const errorBody = await res.json();
    const errorMessage = errorBody.error?.details || errorBody.error || "An unknown error occurred with Pinata.";
    throw new Error(`Pinata upload failed: ${errorMessage}`);
  }

  const result = await res.json();
  if (!result.IpfsHash) {
    throw new Error("Pinata response did not include an IPFS hash.");
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
  if (!window.ethereum) throw new Error("MetaMask is not installed");
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
       await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID, chainName: "Sepolia Test Network", rpcUrls: ["https://rpc.sepolia.org"], nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18, }, blockExplorerUrls: ["https://sepolia.etherscan.io"], }],
        });
    } else {
      throw switchError;
    }
  }
}

interface StoredTagData {
  name: string;
  description: string;
  mediaType: string;
  filePreview: string;
}

export default function ReviewTagModal({ onCancel }: { onCancel?: () => void; }) {
  const [isLoading, setIsLoading] = useState(false);
  const [tagData, setTagData] = useState<StoredTagData | null>(null);
  const [gasFeeEth, setGasFeeEth] = useState<string | null>(null);
  const [gasFeeUsd, setGasFeeUsd] = useState<string | null>(null);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const router = useRouter();

  const platformFeeEth = 0.001;

  useEffect(() => {
    const storedDataRaw = localStorage.getItem("uploadedTagData");
    if (storedDataRaw) {
      setTagData(JSON.parse(storedDataRaw));
    }

    const estimateFees = async () => {
      if (!window.ethereum) return;

      try {
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
      }
    };

    estimateFees();
  }, []);

  const handlePayFees = async () => {
    if (!tagData) {
      toast.error("No file data found to upload.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Preparing your media...");

    try {
      await switchToSepolia();
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getEthersContract(signer);

      const mimeType = tagData.filePreview.match(/:(.*?);/)?.[1] || 'application/octet-stream';
      const mediaFile = base64ToFile(tagData.filePreview, tagData.name, mimeType);

      toast.loading("1/4: Uploading media to IPFS...", { id: toastId });
      const mediaCid = await uploadToPinata(mediaFile);
      const watermarkHash = await generateSha256Hash(mediaFile);

      toast.loading("2/4: Creating metadata...", { id: toastId });
      const metadata = {
        name: tagData.name,
        description: tagData.description,
        image: `ipfs://${mediaCid}`,
      };
      const metadataFile = new File([JSON.stringify(metadata)], "metadata.json", { type: "application/json" });

      toast.loading("3/4: Uploading metadata to IPFS...", { id: toastId });
      const metadataCid = await uploadToPinata(metadataFile);

      toast.loading("4/4: Waiting for transaction confirmation...", { id: toastId });
      const tx: TransactionResponse = await contract.registerMedia(metadataCid, watermarkHash);
      await tx.wait();

      toast.success("Media successfully registered on the blockchain!", { id: toastId });
      localStorage.removeItem("uploadedTagData");
      onCancel?.();

    } catch (err: any) {
      console.error(err);
      toast.error(err.reason || err.message || "An error occurred.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem("uploadedTagData");
    router.push("/create-tag");
    onCancel?.();
  };

  const base64ToFile = (base64: string, fileName: string, mimeType: string): File => {
      const bstr = atob(base64.split(',')[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--) u8arr[n] = bstr.charCodeAt(n);
      return new File([u8arr], fileName, { type: mimeType });
  };

  const totalFeeEth = gasFeeEth && gasFeeEth !== "N/A" ? (platformFeeEth + parseFloat(gasFeeEth)).toFixed(5) : null;
  const platformFeeUsd = ethPrice ? (platformFeeEth * ethPrice).toFixed(2) : null;
  const totalFeeUsd = gasFeeUsd && platformFeeUsd ? (parseFloat(platformFeeUsd) + parseFloat(gasFeeUsd)).toFixed(2) : null;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-[#2A2D35] border-[#3A3D45] shadow-2xl">
        <CardContent className="p-8">
            <h1 className="text-3xl font-bold text-white mb-4">Review your media tag</h1>
            <p className="text-gray-300 text-base mb-8">Check out your media tag preview and continue once you're happy with it.</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-[#3A3D45] border-[#4A4D55]">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="relative">
                    <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                      {tagData ? (
                        <img
                          src={tagData.filePreview}
                          alt="Media Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-gray-400"><Eye className="w-12 h-12 mx-auto mb-2" /><p>Media Preview</p></div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold">{tagData?.name || "Loading..."}</h3>
                    <p className="text-blue-400 text-sm">{`@${tagData?.mediaType} media`}</p>
                  </div>
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
                      <p className="text-white text-sm">Processing...</p>
                    </div>
                  </div>
                )}
                <div className="space-y-6">
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
                          <p className="text-white font-semibold">{platformFeeEth.toFixed(4)} ETH</p>
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
                onClick={handleCancel}
                className="bg-transparent border-gray-600 text-white hover:bg-[#3A3D45] hover:border-gray-500 transition-all duration-200"
              >
                Cancel
              </Button>
             <Button
                onClick={handlePayFees}
                className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isLoading ? "Processing..." : "Register Media"}
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

