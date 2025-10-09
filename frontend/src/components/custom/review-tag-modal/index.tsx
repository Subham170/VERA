"use client";

import LoadingModal from "@/components/custom/loading-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/lib/config";
import { ethers, type TransactionResponse } from "ethers";
import { Check, Eye, RefreshCw, Wallet, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ABI = [
  "function registerMedia(string memory mediaCid, string memory metadataCid, bytes32 contentHash) public",
  "function getMedia(bytes32 contentHash) public view returns (string memory mediaCid, string memory metadataCid, address uploader, uint256 timestamp)",
  "function getMediaByOwner(address owner) public view returns (bytes32[] memory)",
  "error MediaAlreadyRegistered(bytes32 contentHash)",
  "error MediaNotFound(bytes32 contentHash)",
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

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
  return new ethers.Contract(CONTRACT_ADDRESS as string, ABI, signerOrProvider);
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
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [gasFee, setGasFee] = useState<string>("0");
  const [gasPrice, setGasPrice] = useState<string>("0");
  const [isLoadingFees, setIsLoadingFees] = useState(false);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [gasPriceSource, setGasPriceSource] = useState<string>("Etherscan");
  const [networkInfo, setNetworkInfo] = useState<{
    name: string;
    chainId: string;
  }>({ name: "Sepolia Testnet", chainId: "0xaa36a7" });
  const [loadingModal, setLoadingModal] = useState({
    isVisible: false,
    title: "",
    subtitle: "",
    steps: [] as { text: string; completed: boolean }[],
    progress: 0,
  });

  const fetchEthPrice = async () => {
    // For Sepolia testnet, ETH has no real value
    // We'll set a placeholder value to indicate it's testnet
    setEthPrice(0);
  };

  const getNetworkInfo = async () => {
    if (typeof window.ethereum === "undefined") return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      // Get network name from chainId
      const networkNames: { [key: string]: string } = {
        "0xaa36a7": "Sepolia Testnet",
        "0x1": "Ethereum Mainnet",
        "0x5": "Goerli Testnet",
        "0x89": "Polygon Mainnet",
        "0x13881": "Polygon Mumbai Testnet",
      };

      const chainId = `0x${network.chainId.toString(16)}`;
      const networkName =
        networkNames[chainId] || `Chain ID: ${network.chainId}`;

      setNetworkInfo({
        name: networkName,
        chainId: chainId,
      });
    } catch (error) {
      console.error("Error getting network info:", error);
    }
  };

  const getGasPriceFromEtherscan = async () => {
    try {
      // Fetch gas prices from Etherscan API for Sepolia testnet
      // Note: Etherscan API doesn't require an API key for basic gas price queries
      const response = await fetch(
        "https://api-sepolia.etherscan.io/api?module=gastracker&action=gasoracle"
      );
      const data = await response.json();

      if (data.status === "1" && data.result) {
        // Use the "Safe" gas price from Etherscan (recommended for most transactions)
        // SafeGasPrice is typically the 30th percentile of recent gas prices
        const safeGasPrice = data.result.SafeGasPrice;
        console.log("Etherscan gas prices:", data.result);
        setGasPriceSource("Etherscan Sepolia");
        return ethers.parseUnits(safeGasPrice, "gwei");
      }
    } catch (error) {
      console.error("Error fetching gas price from Etherscan:", error);
    }

    // Fallback to default if Etherscan fails
    setGasPriceSource("Default");
    return ethers.parseUnits("20", "gwei");
  };

  const estimateGasFees = async () => {
    if (
      typeof window === "undefined" ||
      typeof window.ethereum === "undefined"
    ) {
      // Set default values if MetaMask is not available or during SSR
      setGasPrice("20");
      setGasFee("0.001");
      return;
    }

    setIsLoadingFees(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getEthersContract(signer);

      // Get current gas price from Etherscan for Sepolia
      const currentGasPrice = await getGasPriceFromEtherscan();
      setGasPrice(ethers.formatUnits(currentGasPrice, "gwei"));

      // Estimate gas for registerMedia function
      const tagDataRaw = localStorage.getItem("uploadedTagData");
      if (tagDataRaw) {
        const tagData = JSON.parse(tagDataRaw);
        const mediaFile = base64ToFile(tagData.filePreview, tagData.name);
        const metadataRaw = localStorage.getItem("metadata");

        if (metadataRaw) {
          const metadataFile = new File([metadataRaw], "metadata.json", {
            type: "application/json",
          });

          const [mediaCid, metadataCid, contentHash] = await Promise.all([
            uploadFileToPinata(mediaFile),
            uploadFileToPinata(metadataFile),
            generateSha256Hash(mediaFile),
          ]);

          const formattedHash = "0x" + contentHash;

          // Estimate gas with current gas price
          const gasEstimate = await contract.registerMedia.estimateGas(
            mediaCid,
            metadataCid,
            formattedHash
          );

          const estimatedFee = gasEstimate * currentGasPrice;
          setGasFee(ethers.formatEther(estimatedFee));
        }
      }
    } catch (error) {
      console.error("Error estimating gas fees:", error);
      // Set default values if estimation fails
      setGasPrice("20");
      setGasFee("0.001");
    } finally {
      setIsLoadingFees(false);
    }
  };

  useEffect(() => {
    estimateGasFees();
    fetchEthPrice();
    getNetworkInfo();
  }, []);

  const handleRegister = async () => {
    if (typeof window === "undefined") {
      return toast.error("This function can only be called in the browser.");
    }

    const tagDataRaw = localStorage.getItem("uploadedTagData");
    const metadataRaw = localStorage.getItem("metadata");
    if (!tagDataRaw)
      return toast.error("Media data not found. Please re-analyze.");
    if (!metadataRaw)
      return toast.error("Metadata not found. Please re-analyze.");
    if (typeof window.ethereum === "undefined")
      return toast.error("MetaMask is not installed.");

    setIsRegistering(true);

    // Initialize loading modal
    setLoadingModal({
      isVisible: true,
      title: "Registering Media",
      subtitle: "Processing blockchain registration...",
      steps: [
        { text: "Connecting to Sepolia network", completed: false },
        { text: "Uploading files to IPFS", completed: false },
        { text: "Saving record to database", completed: false },
        { text: "Confirming on blockchain", completed: false },
      ],
      progress: 0,
    });

    try {
      // Step 1: Switch to Sepolia network
      setLoadingModal((prev) => ({
        ...prev,
        progress: 10,
        steps: prev.steps.map((step, index) =>
          index === 0 ? { ...step, completed: true } : step
        ),
      }));

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // Sepolia chain ID
      } as any);
    } catch (switchError: any) {
      // If Sepolia is not added to MetaMask, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa36a7",
                chainName: "Sepolia",
                rpcUrls: ["https://sepolia.infura.io/v3/"],
                nativeCurrency: {
                  name: "SepoliaETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          } as any);
        } catch (addError) {
          toast.error("Failed to add Sepolia network to MetaMask.");
          setIsRegistering(false);
          setLoadingModal((prev) => ({ ...prev, isVisible: false }));
          return;
        }
      } else {
        toast.error("Failed to switch to Sepolia network.");
        setIsRegistering(false);
        setLoadingModal((prev) => ({ ...prev, isVisible: false }));
        return;
      }
    }

    try {
      const tagData = JSON.parse(tagDataRaw);
      const mediaFile = base64ToFile(tagData.filePreview, tagData.name);
      const metadataFile = new File([metadataRaw], "metadata.json", {
        type: "application/json",
      });

      // Step 2: Upload files to IPFS
      setLoadingModal((prev) => ({
        ...prev,
        progress: 30,
        steps: prev.steps.map((step, index) =>
          index === 1 ? { ...step, completed: true } : step
        ),
      }));

      const [mediaCid, metadataCid, contentHash] = await Promise.all([
        uploadFileToPinata(mediaFile),
        uploadFileToPinata(metadataFile),
        generateSha256Hash(mediaFile),
      ]);

      // Step 3: Save to database
      setLoadingModal((prev) => ({
        ...prev,
        progress: 60,
        steps: prev.steps.map((step, index) =>
          index === 2 ? { ...step, completed: true } : step
        ),
      }));

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const mediaType = tagData.mediaType || "image";
      const fileFieldName = `${mediaType}s`;

      const routeMap: Record<string, string> = {
        images: API_ENDPOINTS.TAGS_WITH_IMAGES,
        videos: API_ENDPOINTS.TAGS_WITH_VIDEOS,
        audios: API_ENDPOINTS.TAGS_WITH_AUDIO,
      };
      const route = routeMap[fileFieldName] || API_ENDPOINTS.TAGS;

      const backendFormData = new FormData();
      backendFormData.append(fileFieldName, mediaFile);
      backendFormData.append("file_name", tagData.name);
      backendFormData.append("hash_address", contentHash);
      backendFormData.append("mediacid", mediaCid);
      backendFormData.append("metadatacid", metadataCid);
      backendFormData.append("address", walletAddress);
      backendFormData.append("type", mediaType === "image" ? "img" : mediaType);

      const backendRes = await fetch(route, {
        method: "POST",
        body: backendFormData,
      });
      if (!backendRes.ok) {
        const errorData = await backendRes.json();
        throw new Error(errorData.message || "Failed to save to database.");
      }

      // Step 4: Confirm on blockchain
      setLoadingModal((prev) => ({
        ...prev,
        progress: 80,
        steps: prev.steps.map((step, index) =>
          index === 3 ? { ...step, completed: true } : step
        ),
      }));

      const contract = getEthersContract(signer);
      const formattedHash = "0x" + contentHash;

      const tx: TransactionResponse = await contract.registerMedia(
        mediaCid,
        metadataCid,
        formattedHash
      );
      await tx.wait();

      // Complete
      setLoadingModal((prev) => ({
        ...prev,
        progress: 100,
      }));

      toast.success("Media successfully registered on-chain!");
      localStorage.removeItem("uploadedTagData");
      localStorage.removeItem("metadata");

      // Close modal and redirect after a brief delay
      setTimeout(() => {
        setLoadingModal((prev) => ({ ...prev, isVisible: false }));
        router.push("/");
      }, 1000);
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error(err.reason || err.message || "An unexpected error occurred.");
      setLoadingModal((prev) => ({ ...prev, isVisible: false }));
    } finally {
      setIsRegistering(false);
    }
  };

  // Safely get tagData from localStorage, with fallback for SSR
  const [tagData, setTagData] = useState<{
    name?: string;
    mediaType?: string;
    filePreview?: string;
  }>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("uploadedTagData");
      if (storedData) {
        try {
          setTagData(JSON.parse(storedData));
        } catch (error) {
          console.error("Error parsing stored tag data:", error);
        }
      }
    }
  }, []);

  const fileName = tagData.name || defaultFileName;
  const mediaType = tagData.mediaType || defaultMediaType;

  return (
    <>
      <LoadingModal
        isVisible={loadingModal.isVisible}
        title={loadingModal.title}
        subtitle={loadingModal.subtitle}
        steps={loadingModal.steps}
        progress={loadingModal.progress}
        showSecurityNote={true}
      />
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
              {/* Media Preview Card */}
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

              {/* Transaction Fee Card */}
              <Card className="bg-[#3A3D45] border-[#4A4D55]">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-blue-400" />
                        Transaction Fees
                      </h3>
                      <Button
                        onClick={() => {
                          estimateGasFees();
                          getNetworkInfo();
                        }}
                        disabled={isLoadingFees}
                        className="bg-gray-600 hover:bg-gray-700 text-white p-2 h-8 w-8"
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${
                            isLoadingFees ? "animate-spin" : ""
                          }`}
                        />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-[#2A2D35] rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-300 text-sm">
                            Gas Price
                          </span>
                          <div className="text-right">
                            <div className="text-white font-medium">
                              {isLoadingFees
                                ? "..."
                                : `${parseFloat(gasPrice).toFixed(2)} Gwei`}
                            </div>
                            <div className="text-gray-400 text-xs">
                              via {gasPriceSource}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 text-sm">
                            Estimated Fee
                          </span>
                          <div className="text-right">
                            <div className="text-green-400 font-semibold">
                              {isLoadingFees
                                ? "..."
                                : `${parseFloat(gasFee).toFixed(6)} ETH`}
                            </div>
                            <div className="text-gray-400 text-xs">
                              Testnet (No Real Value)
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#2A2D35] rounded-lg p-4">
                        <div className="text-center">
                          <p className="text-gray-300 text-sm mb-1">Network</p>
                          <p className="text-blue-400 font-medium">
                            {networkInfo.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Chain ID: {networkInfo.chainId}
                          </p>
                        </div>
                      </div>

                      <div className="bg-[#2A2D35] rounded-lg p-4">
                        <div className="text-center">
                          <p className="text-gray-300 text-sm mb-1">Contract</p>
                          <p className="text-gray-400 text-xs font-mono break-all">
                            {CONTRACT_ADDRESS}
                          </p>
                        </div>
                      </div>

                      <div className="bg-[#1a1d23] border border-yellow-500/30 rounded-lg p-4">
                        <div className="text-center">
                          <p className="text-yellow-400 text-sm font-medium mb-1">
                            💡 Need SepoliaETH?
                          </p>
                          <p className="text-gray-300 text-xs">
                            Get free testnet ETH from{" "}
                            <a
                              href="https://sepoliafaucet.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              Sepolia Faucet
                            </a>
                          </p>
                        </div>
                      </div>
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
                  onClick={handleRegister}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={isRegistering}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {isRegistering ? "Processing..." : "Register on Chain"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
