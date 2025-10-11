"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Edit3,
  FileText,
  Image,
  Info,
  Music,
  Save,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Validation schema for update form
const createUpdateFormSchema = (isBulkUpdate: boolean) =>
  z.object({
    fileName: z
      .string()
      .min(1, "Name is required")
      .min(3, "Name must be at least 3 characters"),
    description: z
      .string()
      .min(1, "Description is required")
      .min(10, "Description must be at least 10 characters"),
    mediaType: z.enum(["image", "video", "audio", "text"]),
  });

type UpdateFormData = z.infer<ReturnType<typeof createUpdateFormSchema>>;

interface UpdateMediaTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: UpdateFormData & { isBulkUpdate: boolean; fileCount?: number }
  ) => void;
  isBulkUpdate?: boolean;
  fileCount?: number;
  currentData?: {
    fileName: string;
    description: string;
    mediaType: "image" | "video" | "audio" | "text";
  };
}

export default function UpdateMediaTagModal({
  isOpen,
  onClose,
  onSave,
  isBulkUpdate = false,
  fileCount = 1,
  currentData = {
    fileName: "My Media",
    description: "A sample media description",
    mediaType: "image",
  },
}: UpdateMediaTagModalProps) {
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(createUpdateFormSchema(isBulkUpdate)),
    mode: "onChange",
    defaultValues: {
      fileName: currentData.fileName,
      description: currentData.description,
      mediaType: currentData.mediaType,
    },
  });

  const fileName = watch("fileName");
  const description = watch("description");
  const mediaType = watch("mediaType");

  const getMediaTypeDisplayName = () => {
    switch (mediaType) {
      case "image":
        return "Image";
      case "video":
        return "Video";
      case "audio":
        return "Audio";
      case "text":
        return "Text";
      default:
        return "Media";
    }
  };

  const getMediaTypeIcon = () => {
    switch (mediaType) {
      case "image":
        return <Image className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "audio":
        return <Music className="w-5 h-5" />;
      case "text":
        return <FileText className="w-5 h-5" />;
      default:
        return <Upload className="w-5 h-5" />;
    }
  };

  const onSubmit = (data: UpdateFormData) => {
    onSave({
      ...data,
      isBulkUpdate,
      fileCount,
    });
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="bg-[#2A2D35] border-[#3A3D45] shadow-2xl w-full max-w-2xl mx-4 relative">
        <CardContent className="p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-[#3A3D45] rounded-lg flex items-center justify-center hover:bg-[#4A4D55] transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-white">
                  {isBulkUpdate ? "Update Bulk Collection" : "Update Media Tag"}
                </h1>
                {mediaType && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
                    {getMediaTypeIcon()}
                    <span className="text-blue-400 text-sm font-medium">
                      {getMediaTypeDisplayName()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bulk Update Info */}
            {isBulkUpdate && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-blue-400 font-semibold">
                      Bulk Collection Update
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Updating {fileCount} files in this collection
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Media Type Selection */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-3">
                Media Type <span className="text-red-400">*</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "image", label: "Image", icon: Image },
                  { value: "video", label: "Video", icon: Video },
                  { value: "audio", label: "Audio", icon: Music },
                  { value: "text", label: "Text", icon: FileText },
                ].map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <label
                      key={type.value}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        mediaType === type.value
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-gray-600 bg-[#3A3D45] hover:border-gray-500"
                      }`}
                    >
                      <input
                        {...register("mediaType")}
                        type="radio"
                        value={type.value}
                        className="hidden"
                      />
                      <IconComponent className="w-5 h-5 text-white" />
                      <span className="text-white font-medium">
                        {type.label}
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.mediaType && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.mediaType.message}
                </p>
              )}
            </div>

            {/* File/Collection Name */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-2">
                {isBulkUpdate ? "Collection name" : "File name"}{" "}
                <span className="text-red-400">*</span>
              </h2>
              <div className="relative">
                <input
                  {...register("fileName")}
                  type="text"
                  placeholder={
                    isBulkUpdate ? "Enter collection name" : "Enter file name"
                  }
                  className={`w-full px-4 py-3 bg-[#3A3D45] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-all duration-200 ${
                    errors.fileName
                      ? "border-red-400 focus:border-red-300 focus:ring-red-400"
                      : "border-gray-600 focus:border-blue-400 focus:ring-blue-400"
                  }`}
                />
                {fileName && !errors.fileName && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                )}
              </div>
              {errors.fileName && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.fileName.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-2">
                Description <span className="text-red-400">*</span>
              </h2>
              <div className="relative">
                <textarea
                  {...register("description")}
                  rows={4}
                  placeholder="Add a detailed description of your media"
                  className={`w-full px-4 py-3 bg-[#3A3D45] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-all duration-200 resize-none ${
                    errors.description
                      ? "border-red-400 focus:border-red-300 focus:ring-red-400"
                      : "border-gray-600 focus:border-blue-400 focus:ring-blue-400"
                  }`}
                />
                {description && !errors.description && (
                  <div className="absolute right-3 top-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                )}
              </div>
              {errors.description && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-600">
              <div className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 cursor-pointer">
                <Info className="w-4 h-4" />
                <span className="text-sm">Help Centre</span>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="bg-transparent border-gray-600 text-white hover:bg-[#3A3D45] hover:border-gray-500 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-6 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isValid}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
