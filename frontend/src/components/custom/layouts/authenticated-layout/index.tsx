"use client";

import AIAssistant from "@/components/custom/ai-assistant";
import { ReactNode } from "react";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return (
    <>
      {children}
      <AIAssistant />
    </>
  );
}
