"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Wallet, CheckCircle, Loader2 } from "lucide-react";

interface LoginCardProps {
  username: string;
  onUsernameChange: (value: string) => void;
  connectedAddress: string | null;
  onConnectWallet: () => void;
  onLogin: () => void;
  onNavigateToSignup: () => void;
  isLoading: boolean;
}

export function LoginCard({
  username,
  onUsernameChange,
  connectedAddress,
  onConnectWallet,
  onLogin,
  onNavigateToSignup,
  isLoading,
}: LoginCardProps) {

  return (
    <Card className="relative rounded-xl bg-[#1A1D20] p-1 border-0 text-white">
      <CardHeader className="pt-10">
        <CardTitle className="text-center text-xl">Welcome Back!</CardTitle>
        <CardDescription className="text-center text-white/70">
          Enter your username and connect your wallet to log in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 bg-[#222529] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        
        {connectedAddress ? (
          <div className="flex items-center justify-center gap-3 bg-[#222529] px-3 py-3 text-left rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium text-green-300">Wallet Connected</span>
            <span className="text-sm font-mono text-gray-400">
              ({connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)})
            </span>
          </div>
        ) : (
          <Button
            onClick={onConnectWallet}
            variant="outline"
            disabled={isLoading}
            className="w-full bg-transparent border-gray-600 hover:bg-[#2a2d32] text-white"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button
          onClick={onLogin}
          disabled={!username || !connectedAddress || isLoading}
          className="w-full bg-blue-600 text-white font-semibold py-3 transition-all duration-300 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Verifying..." : "Login"}
        </Button>
        
        <div className="text-center">
          <span className="text-sm text-white/70">Don't have an account? </span>
          <button
            onClick={onNavigateToSignup}
            className="text-sm text-blue-400 hover:text-blue-300 underline transition-colors cursor-pointer"
          >
            Sign up
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}

