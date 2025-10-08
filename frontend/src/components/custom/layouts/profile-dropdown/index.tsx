"use client";

import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  ChevronDown,
  Copy,
  Globe,
  HelpCircle,
  LogOut,
  Pencil,
  Settings,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function ProfileDropdown({
  isOpen,
  onClose,
  triggerRef,
}: ProfileDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const connectedAddress = user?.address;

  const menuItems = [
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Pencil, label: "Create Tag", href: "/create-tag" },
    { icon: Tag, label: "Tagged Media", href: "/tagged-media" },
    { icon: Sparkles, label: "Upgrade", href: "/upgrade" },
    { icon: BookOpen, label: "Learn", href: "/learn" },
    { icon: HelpCircle, label: "Help Center", href: "/help" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: Globe, label: "Language", href: "/language" },
    { icon: LogOut, label: "Logout", href: "/login" },
  ];

  const handleItemClick = (href: string) => {
    onClose();
    if (href === "/login") {
      logout();
      router.push("/login");
    } else {
      router.push(href);
    }
  };

  const copyAddress = async () => {
    if (!connectedAddress) return;
    try {
      await navigator.clipboard.writeText(connectedAddress);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
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

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 top-full mt-2 w-64 bg-[#181A1D]/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-700/50 z-100 transition-all duration-300 ease-out ${
        isOpen
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
      }`}
    >
      <div className="p-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => handleItemClick(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-white hover:bg-[#2D2D30] rounded-md transition-all duration-200 hover:scale-[1.02] hover:shadow-sm group ${
                isOpen ? "animate-in slide-in-from-top-2 fade-in" : ""
              }`}
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: "both",
              }}
            >
              <Icon className="h-4 w-4 transition-colors duration-200 group-hover:text-blue-400" />
              <span className="text-sm transition-colors duration-200 group-hover:text-blue-100">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={`mx-2 mb-2 p-3 bg-[#2D2D30]/80 backdrop-blur-sm rounded-lg transition-all duration-300 ${
          isOpen ? "animate-in slide-in-from-bottom-2 fade-in" : ""
        }`}
        style={{ animationDelay: "200ms", animationFillMode: "both" }}
      >
        {connectedAddress ? (
          <div className="flex items-center gap-3">
            <img
              src="/images/wallets/meta-mask.png"
              alt="MetaMask"
              className="h-5 w-5 transition-transform duration-200 hover:scale-110"
            />
            <span className="text-sm text-white font-mono transition-colors duration-200 hover:text-blue-100">
              {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
            </span>
            <button
              onClick={copyAddress}
              className="ml-auto p-1.5 hover:bg-[#3D3D40] rounded-md transition-all duration-200 hover:scale-110 group"
            >
              <Copy className="h-3 w-3 text-gray-400 transition-colors duration-200 group-hover:text-blue-400" />
            </button>
            <button className="p-1.5 hover:bg-[#3D3D40] rounded-md transition-all duration-200 hover:scale-110 group">
              <ChevronDown className="h-3 w-3 text-gray-400 transition-colors duration-200 group-hover:text-blue-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 rounded-md text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg shadow-blue-500/25"
          >
            Connect Wallet
          </button>
        )}
      </div>

      <div
        className={`mx-2 mb-2 p-3 bg-[#2D2D30]/80 backdrop-blur-sm rounded-lg transition-all duration-300 ${
          isOpen ? "animate-in slide-in-from-bottom-2 fade-in" : ""
        }`}
        style={{ animationDelay: "250ms", animationFillMode: "both" }}
      >
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110 hover:rotate-12">
            <span className="text-xs font-bold text-white">Ξ</span>
          </div>
          <span className="text-sm text-white transition-colors duration-200 hover:text-blue-100">
            Ethereum $0.50 USD
          </span>
          <button className="ml-auto p-1.5 hover:bg-[#3D3D40] rounded-md transition-all duration-200 hover:scale-110 group">
            <ChevronDown className="h-3 w-3 text-gray-400 transition-colors duration-200 group-hover:text-blue-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
