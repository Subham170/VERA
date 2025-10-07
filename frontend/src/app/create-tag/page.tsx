"use client";

import AuthenticatedLayout from "@/components/custom/layouts/authenticated-layout";
import TagNewMediaForm from "@/components/custom/tag-new-media-form";
import { useAuth } from "@/context/AuthContext";
import { useTagData } from "@/context/TagDataContext";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

interface TagFormData {
  files: File[];
  fileName: string;
  description?: string;
  mediaType?: string;
}

export default function CreateTagPage() {
  const { isAuthorized, isLoading } = useAuth();
  const { setTagData } = useTagData();
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.push("/");
    }
  }, [isAuthorized, isLoading, router]);

  const handleContinue = async (data: TagFormData) => {
    setIsTransitioning(true);
    
    const files = data.files || [];
    if (files.length === 0) {
      toast.error("Please select at least one file to continue.");
      setIsTransitioning(false);
      return;
    }

    const fileToDataUrl = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    };

    try {
      const base64Files = await Promise.all(files.map(fileToDataUrl));
      
      const tagDataPayload = {
        fileName: data.fileName,
        description: data.description || "",
        mediaType: data.mediaType || "image",
        isBulkUpload: files.length > 1,
        fileCount: files.length,
        files: base64Files,
      };

      try {
        localStorage.setItem("uploadedTagData", JSON.stringify(tagDataPayload));
      } catch (error) {
        console.error("localStorage error:", error);
        toast.error("File is too large for preview. Please select a smaller file.");
        setIsTransitioning(false);
        return;
      }
      
      setTagData(tagDataPayload);

      setTimeout(() => {
        router.push("/review-tag");
      }, 800);

    } catch (err) {
      console.error("Error processing files:", err);
      toast.error("There was an error processing your files.");
      setIsTransitioning(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <AuthenticatedLayout>
      <main className="min-h-screen bg-[#181A1D]">
        <button
          onClick={handleCancel}
          className="fixed top-20 right-4 w-10 h-10 bg-[#3A3D45] rounded-lg flex items-center justify-center hover:bg-[#4A4D55] transition-colors z-50"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center mb-12">
            <div className="flex items-center space-x-8">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${isTransitioning ? "bg-white border-2 border-blue-600" : "bg-blue-600"}`}>
                  <span className={`font-bold text-lg transition-colors duration-500 ${isTransitioning ? "text-blue-600" : "text-white"}`}>1</span>
                </div>
                <span className="text-white text-sm mt-3 font-medium">Add New Tag</span>
              </div>
              <div className="relative w-16 h-0.5">
                <div className={`absolute top-0 left-0 h-0.5 transition-all duration-500 ${isTransitioning ? "w-full bg-blue-400" : "w-0 bg-blue-400"}`}></div>
                <div className={`absolute top-0 left-0 w-full h-0.5 border-t-2 border-dashed border-blue-400 transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}></div>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${isTransitioning ? "bg-blue-600" : "bg-white border-2 border-blue-600"}`}>
                  <span className={`font-bold text-lg transition-colors duration-500 ${isTransitioning ? "text-white" : "text-blue-600"}`}>2</span>
                </div>
                <span className="text-white text-sm mt-3 font-medium">Review Tag</span>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-500 ${isTransitioning ? "opacity-0 transform scale-95" : "opacity-100 transform scale-100"}`}>
            <TagNewMediaForm onCancel={handleCancel} onContinue={handleContinue} />
          </div>
        </div>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#2A2D35",
            color: "#fff",
            border: "1px solid #3A3D45",
          },
        }}
      />
    </AuthenticatedLayout>
  );
}