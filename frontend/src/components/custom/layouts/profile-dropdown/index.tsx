"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Pencil, 
  Tag, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Settings, 
  Globe, 
  LogOut, 
  ChevronDown,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function ProfileDropdown({ isOpen, onClose, triggerRef }: ProfileDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  const menuItems = [
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Pencil, label: "Create Tag", href: "/create-tag" },
    { icon: Tag, label: "Tagged Media", href: "/tagged-media" },
    { icon: Sparkles, label: "Upgrade", href: "/upgrade" },
    { icon: BookOpen, label: "Learn", href: "/learn" },
    { icon: HelpCircle, label: "Help Center", href: "/help" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: Globe, label: "Language", href: "/language" },
    { icon: LogOut, label: "Logout", href: "/logout" },
  ];

  const handleItemClick = (href: string) => {
    onClose();
    if (href === "/logout") {
      console.log("Logout clicked");
    } else {
      router.push(href);
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setConnectedAddress(accounts[0]);
      } else {
        alert("MetaMask not found. Please install it to connect your wallet.");
      }
    } catch (error) {
      console.error("Wallet connection failed", error);
    }
  };

  const copyAddress = async () => {
    if (!connectedAddress) return;
    try {
      await navigator.clipboard.writeText(connectedAddress);
    } catch {}
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-64 bg-[#181A1D] rounded-lg shadow-xl border border-gray-700 z-100"
    >
      <div className="p-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => handleItemClick(item.href)}
              className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-[#2D2D30] rounded-md transition-colors duration-200"
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mx-2 mb-2 p-3 bg-[#2D2D30] rounded-lg">
        {connectedAddress ? (
          <div className="flex items-center gap-3">
            <img
              src="/images/wallets/meta-mask.png"
              alt="MetaMask"
              className="h-5 w-5"
            />
            <span className="text-sm text-white font-mono">
              {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
            </span>
            <button
              onClick={copyAddress}
              className="ml-auto p-1 hover:bg-[#3D3D40] rounded transition-colors duration-200"
            >
              <Copy className="h-3 w-3 text-gray-400" />
            </button>
            <button className="p-1 hover:bg-[#3D3D40] rounded transition-colors duration-200">
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Connect Wallet
          </button>
        )}
      </div>

      <div className="mx-2 mb-2 p-3 bg-[#2D2D30] rounded-lg">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">Ξ</span>
          </div>
          <span className="text-sm text-white">Ethereum $0.50 USD</span>
          <button className="ml-auto p-1 hover:bg-[#3D3D40] rounded transition-colors duration-200">
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
