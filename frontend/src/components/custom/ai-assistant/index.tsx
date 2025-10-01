"use client";

import { HelpCircle, Mic, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: Implement AI chat functionality
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatRef.current &&
        !chatRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* AI Assistant Chat Bubble */}
      {isOpen && (
        <div
          ref={chatRef}
          className="fixed bottom-20 right-4 w-80 bg-[#2A2D35] rounded-lg shadow-2xl border border-[#3A3D45] z-50 animate-in slide-in-from-bottom-2 duration-300"
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-[#3A3D45]">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  AI Assistant
                </h3>
                <p className="text-gray-400 text-xs">Online</p>
              </div>
            </div>
          </div>

          {/* Chat Content */}
          <div className="p-4">
            <div className="mb-4">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">AI</span>
                </div>
                <div className="bg-[#3A3D45] rounded-lg p-3 max-w-xs">
                  <p className="text-white text-sm">
                    👋 Hi! I'm an AI-powered assistant who can help you with
                    ideas, advice and questions.
                  </p>
                </div>
              </div>
            </div>

            {/* Input Field */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="How can I help?"
                  className="w-full px-4 py-2 bg-[#3A3D45] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-sm"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
              <button className="p-2 bg-[#3A3D45] rounded-lg hover:bg-[#4A4D55] transition-colors">
                <Mic className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Mark Button with Notification Dot */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative">
          {/* Notification Dot */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>

          {/* Main Button */}
          <button
            ref={buttonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <HelpCircle className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </>
  );
}
