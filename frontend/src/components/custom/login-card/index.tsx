"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LoginCard() {

  const WalletRow = ({
    label,
    query,
  }: {
    label: string
    query: string
  }) => (
    <button
      className={cn(
        "flex w-full items-center justify-between bg-[#222529] px-3 py-3 text-left transition-all duration-200 cursor-pointer hover:bg-[#2a2d32] hover:scale-[1.02] hover:shadow-lg",
      )}
      type="button"
      aria-label={`Connect ${label}`}
    >
      <span className="flex items-center gap-3">
        <img
          src={`/images/wallets/${query}.png`}
          alt={`${label} icon`}
          className="h-5 w-5 rounded"
        />
        <span className="text-sm">{label}</span>
      </span>
      <span aria-hidden="true" className="size-2 rounded-full bg-white/60" />
    </button>
  )

  return (
    <Card className="relative rounded-xl bg-[#1A1D20] p-1 border-0">
      {/* <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-md border border-border bg-background/60 text-muted-foreground transition-colors hover:bg-background"
      >
        ×
      </button> */}
      <CardHeader className="pt-10 text-white">
        <CardTitle className="text-center text-xl">Hey There!</CardTitle>
        <CardDescription className="text-center  text-white">
          Sign Up to V.E.R.A. To get started, connect to your crypto wallet. If you do not have a wallet, you&apos;ll be
          prompted to create a new account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg bg-[#222529] p-2 text-white border-0">
          <div className="space-y-2">
            <WalletRow label="Metamask" query="meta-mask" />
            <WalletRow label="Coinbase Wallet" query="coinbase" />
            <WalletRow label="WalletConnect" query="wallet-connect" />
          </div>
        </div>
        <div className="pt-1 text-center">
          <Button variant="link" className="text-white hover:text-blue-400 hover:scale-105 transition-all duration-200 p-0">
            View more wallets
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
