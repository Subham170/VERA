import AuthenticatedLayout from "@/components/custom/layouts/authenticated-layout";
import SiteNavbar from "@/components/custom/layouts/navbar";
import { AuthProvider } from "@/context/AuthContext";
import { TagDataProvider } from "@/context/TagDataContext";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VERA",
  description:
    "V.E.R.A. - Verify Everything Real Always. Authentic content verification platform with AI-powered deepfake detection and blockchain security.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthenticatedLayout>
          <AuthProvider>
            <SiteNavbar />
            <TagDataProvider>{children}</TagDataProvider>
          </AuthProvider>
        </AuthenticatedLayout>
      </body>
    </html>
  );
}
