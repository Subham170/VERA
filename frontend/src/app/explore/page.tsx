"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Bell,
  Filter,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ExplorePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Advanced Search",
      description:
        "Discover content with AI-powered search across all media types",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Trending Content",
      description: "Explore what's popular and trending in the community",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Discovery",
      description: "Find and connect with creators and their amazing content",
    },
    {
      icon: <Filter className="w-6 h-6" />,
      title: "Smart Filters",
      description: "Filter by category, date, popularity, and more",
    },
  ];

  return (
    <main className="min-h-screen bg-[#181A1D] text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[#181A1D]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-teal-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div
          className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium mb-8 animate-pulse">
            <Sparkles className="w-4 h-4" />
            Coming Soon
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-teal-200 bg-clip-text text-transparent">
            Explore
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover amazing content from creators around the world.
            <span className="text-blue-400 font-semibold">
              {" "}
              Coming soon
            </span>{" "}
            with powerful search, trending content, and community features.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`p-6 bg-[#2E3137]/50 border-gray-700/50 backdrop-blur-sm hover:bg-[#2E3137]/70 transition-all duration-300 hover:scale-105 hover:border-blue-500/30 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              asChild
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="px-8 py-3 border-gray-600 text-gray-300 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 font-semibold rounded-lg transition-all duration-200 hover:scale-105"
            >
              <Link href="/create-tag">
                <Sparkles className="w-4 h-4 mr-2" />
                Create Content
              </Link>
            </Button>
          </div>

          {/* Notification Signup */}
          <Card className="p-6 bg-[#2E3137]/30 border-gray-700/50 backdrop-blur-sm max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Get Notified</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Be the first to know when Explore launches with all its amazing
              features!
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-[#181A1D] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <Button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                Notify Me
              </Button>
            </div>
          </Card>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-teal-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-blue-300 rounded-full animate-ping opacity-60"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-teal-300 rounded-full animate-pulse"></div>
      </div>
    </main>
  );
}
