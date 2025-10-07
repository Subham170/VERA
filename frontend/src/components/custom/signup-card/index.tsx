"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, Mail, Wallet, CheckCircle, Loader2 } from "lucide-react";

interface SignUpCardProps {
  username: string;
  onUsernameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  connectedAddress: string | null;
  onConnectWallet: () => void;
  onSignUp: () => void;
  isLoading: boolean;
}

export function SignUpCard({
  username,
  onUsernameChange,
  email,
  onEmailChange,
  connectedAddress,
  onConnectWallet,
  onSignUp,
  isLoading,
}: SignUpCardProps) {

  return (
    <Card className="relative rounded-xl bg-[#1A1D20] p-1 border-0 text-white">
      <CardHeader className="pt-10">
        <CardTitle className="text-center text-xl">Create Your Account</CardTitle>
        <CardDescription className="text-center text-white/70">
          Join the V.E.R.A. community by creating an account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Username Input */}
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

        {/* Email Input */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 bg-[#222529] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        
        {/* Wallet Connection Section */}
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
            className="w-full bg-transparent border-gray-600 hover:bg-[#2a2d32] text-white"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={onSignUp}
          disabled={!username || !email || !connectedAddress || isLoading}
          className="w-full bg-blue-600 text-white font-semibold py-3 transition-all duration-300 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Creating Account..." : "Sign Up"}
        </Button>
      </CardFooter>
    </Card>
  );
}
