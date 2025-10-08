"use client";

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
    };
  }
}

import { LoginCard } from "@/components/custom/login-card";
import { useAuth } from "@/context/AuthContext";
import { API_ENDPOINTS } from "@/lib/config";
import { getAddress } from "ethers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const { isAuthorized, login, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && isAuthorized) {
      router.push("/");
    }
  }, [isAuthorized, isAuthLoading, router]);

  const handleConnectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask is not installed.");
      return;
    }
    setIsLoading(true);
    const toastId = toast.loading("Connecting wallet...");
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const checksummedAddress = getAddress(accounts[0]);
      setConnectedAddress(checksummedAddress);
      toast.success("Wallet connected!", { id: toastId });
    } catch (err) {
      toast.error("Failed to connect wallet.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !connectedAddress) {
      toast.error("Please enter your username and connect your wallet.");
      return;
    }
    setIsLoading(true);
    const toastId = toast.loading("Verifying user...");

    try {
      const response = await fetch(
        `${API_ENDPOINTS.USERS}/${connectedAddress}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User not found. Please sign up first.");
        }
        throw new Error("Login failed. Please try again.");
      }

      const userData = await response.json();
      if (getAddress(userData.data.user.address) !== connectedAddress) {
        throw new Error("Address does not match the connected wallet address.");
      }

      login(userData);
      toast.success("Login successful! Redirecting...", { id: toastId });

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || "An unknown error occurred.", { id: toastId });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading || isAuthorized) {
    return <div className="relative min-h-dvh overflow-hidden bg-gray-900" />;
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <main className="relative min-h-dvh overflow-hidden">
        <img
          src="/images/login-bg.jpg"
          alt="Abstract 3D ring background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <section className="relative mx-[7%] flex min-h-dvh max-w-7xl items-center justify-end px-4">
          <div className="w-full max-w-md">
            <LoginCard
              username={username}
              onUsernameChange={setUsername}
              connectedAddress={connectedAddress}
              onConnectWallet={handleConnectWallet}
              onLogin={handleLogin}
              isLoading={isLoading}
            />
          </div>
        </section>
      </main>
    </>
  );
}
