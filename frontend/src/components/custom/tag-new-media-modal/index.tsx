"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  FileText,
  Image,
  Info,
  Music,
  Pause,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Validation schema - will be created dynamically based on whether URL is imported
const createFormSchema = (hasImportedUrl: boolean) =>
  z.object({
    files: hasImportedUrl
      ? z.array(z.instanceof(File)).optional()
      : z.array(z.instanceof(File)).min(1, "Please upload at least one file"),
    fileName: z
      .string()
      .min(1, "File name is required")
      .min(3, "File name must be at least 3 characters"),
    description: z.string().optional(),
  });

type FormData = z.infer<ReturnType<typeof createFormSchema>>;

interface TagNewMediaModalProps {
  onCancel?: () => void;
  onContinue?: (data: FormData) => void;
  mediaType?: "image" | "video" | "audio" | "text" | null;
  importedUrl?: string | null;
}

export default function TagNewMediaModal({
  onCancel,
  onContinue,
  mediaType,
  importedUrl,
}: TagNewMediaModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadStatus, setUploadStatus] = useState<{
    [key: string]: "uploading" | "completed" | "paused" | "error";
  }>({});
  const [isBulkUpload, setIsBulkUpload] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(createFormSchema(!!importedUrl)),
    mode: "onChange",
    defaultValues: {
      files: [],
      fileName: "",
      description: "",
    },
  });

  const fileName = watch("fileName");
  const description = watch("description");

  const getAcceptedFileTypes = () => {
    switch (mediaType) {
      case "image":
        return ".jpg,.jpeg,.png,.gif,.svg,.webp,.bmp,.ico";
      case "video":
        return ".mp4,.webm,.mov,.avi,.mkv,.flv,.wmv,.m4v";
      case "audio":
        return ".mp3,.wav,.aac,.flac,.ogg,.m4a,.wma";
      case "text":
        return ".txt,.pdf,.doc,.docx,.rtf,.md";
      default:
        return ".jpg,.jpeg,.png,.gif,.svg,.mp4,.webm,.wav,.aac,.mp3,.txt,.pdf,.doc,.docx";
    }
  };

  const getMediaTypeDescription = () => {
    switch (mediaType) {
      case "image":
        return "JPG, PNG, GIF, SVG, WebP, BMP, ICO";
      case "video":
        return "MP4, WEBM, MOV, AVI, MKV, FLV, WMV, M4V";
      case "audio":
        return "MP3, WAV, AAC, FLAC, OGG, M4A, WMA";
      case "text":
        return "TXT, PDF, DOC, DOCX, RTF, MD";
      default:
        return "JPG, PNG, GIF, SVG, MP4, WEBM, WAV, AAC, MP3, TXT, PDF, DOC, DOCX";
    }
  };

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      setValue("files", fileArray, { shouldValidate: true });

      // Simulate upload progress for each file
      fileArray.forEach((file) => {
        const fileName = file.name;
        setUploadStatus((prev) => ({ ...prev, [fileName]: "uploading" }));
        setUploadProgress((prev) => ({ ...prev, [fileName]: 0 }));

        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            const currentProgress = prev[fileName] || 0;
            if (currentProgress >= 100) {
              clearInterval(interval);
              setUploadStatus((prevStatus) => ({
                ...prevStatus,
                [fileName]: "completed",
              }));
              return { ...prev, [fileName]: 100 };
            }
            return {
              ...prev,
              [fileName]: currentProgress + Math.random() * 20,
            };
          });
        }, 200);
      });
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      setValue("files", fileArray, { shouldValidate: true });

      // Simulate upload progress for each file
      fileArray.forEach((file) => {
        const fileName = file.name;
        setUploadStatus((prev) => ({ ...prev, [fileName]: "uploading" }));
        setUploadProgress((prev) => ({ ...prev, [fileName]: 0 }));

        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            const currentProgress = prev[fileName] || 0;
            if (currentProgress >= 100) {
              clearInterval(interval);
              setUploadStatus((prevStatus) => ({
                ...prevStatus,
                [fileName]: "completed",
              }));
              return { ...prev, [fileName]: 100 };
            }
            return {
              ...prev,
              [fileName]: currentProgress + Math.random() * 20,
            };
          });
        }, 200);
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setValue("files", newFiles, { shouldValidate: true });

    // Clean up progress and status for removed file
    if (fileToRemove) {
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[fileToRemove.name];
        return newProgress;
      });
      setUploadStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus[fileToRemove.name];
        return newStatus;
      });
    }
  };

  const togglePause = (fileName: string) => {
    setUploadStatus((prev) => ({
      ...prev,
      [fileName]: prev[fileName] === "paused" ? "uploading" : "paused",
    }));
  };

  const onSubmit = (data: FormData) => {
    if (onContinue) {
      // If URL is imported, add it to the form data
      const formData = {
        ...data,
        importedUrl: importedUrl || undefined,
        mediaType: mediaType || undefined,
        isBulkUpload: isBulkUpload,
        fileCount: selectedFiles.length,
      };
      onContinue(formData as any);
    }
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith("image/")) return <Image className="w-5 h-5" />;
    if (type.startsWith("video/")) return <Video className="w-5 h-5" />;
    if (type.startsWith("audio/")) return <Music className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Enhanced Modal Container */}
      <Card className="bg-[#2A2D35] border-[#3A3D45] shadow-2xl">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-white">
                  {isBulkUpload
                    ? `Bulk Upload ${getMediaTypeDisplayName()}`
                    : `Upload ${getMediaTypeDisplayName()}`}
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
              <div className="flex items-center space-x-3">
                {/* Bulk Upload Toggle */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Bulk Upload</span>
                  <button
                    type="button"
                    onClick={() => setIsBulkUpload(!isBulkUpload)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      isBulkUpload ? "bg-blue-500" : "bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        isBulkUpload ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-8 h-8 bg-[#3A3D45] rounded-lg flex items-center justify-center hover:bg-[#4A4D55] transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Imported URL Section */}
            {importedUrl && (
              <div className="mb-8">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-green-400 font-semibold">
                        Media Imported Successfully
                      </h3>
                      <p className="text-gray-300 text-sm truncate">
                        {importedUrl}
                      </p>
                      <p className="text-green-400 text-xs mt-1">
                        {getMediaTypeDisplayName()} media ready for tagging
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Media Section */}
            <div className="mb-8">
              {/* Enhanced File Dropzone */}
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer group hover:bg-[#2A2D35]/50 ${
                  errors.files
                    ? "border-red-400 hover:border-red-300"
                    : "border-gray-500 hover:border-blue-400"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  multiple={isBulkUpload}
                  accept={getAcceptedFileTypes()}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      <div className="flex space-x-1">
                        <Image className="w-8 h-8 text-blue-400" />
                        <Image className="w-8 h-8 text-blue-400 -ml-2" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-white mb-2">
                      {isBulkUpload
                        ? "Drop your media files here, or browse to select multiple files"
                        : "Drop your media here, or browse to select a file"}
                    </p>
                    <p className="text-sm text-gray-400">
                      Supports: {getMediaTypeDescription()}, Max size 10MB
                      {isBulkUpload && " • Multiple files allowed"}
                    </p>
                  </div>
                </div>
              </div>

              {/* File Upload Error Message */}
              {errors.files && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.files.message}
                </p>
              )}
            </div>

            {/* File Upload Progress List */}
            {selectedFiles.length > 0 && (
              <div className="mb-8 space-y-4">
                {selectedFiles.map((file, index) => {
                  const progress = uploadProgress[file.name] || 0;
                  const status = uploadStatus[file.name] || "uploading";

                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-[#3A3D45] rounded-lg"
                    >
                      {/* File Thumbnail */}
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium text-white truncate"
                          title={file.name}
                        >
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatFileSize(file.size)}
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-2">
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                status === "completed"
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Status Icons */}
                      <div className="flex items-center space-x-2">
                        {status === "completed" ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : status === "paused" ? (
                          <Pause className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <button
                            onClick={() => togglePause(file.name)}
                            className="p-1 hover:bg-gray-600 rounded transition-colors"
                          >
                            <Pause className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* File Name Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-2">
                {isBulkUpload ? "Collection name" : "File name"}{" "}
                <span className="text-red-400">*</span>
              </h2>

              <div className="relative">
                <input
                  {...register("fileName")}
                  type="text"
                  placeholder={
                    isBulkUpload ? "Enter collection name" : "Enter file name"
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

              {/* File Name Error Message */}
              {errors.fileName && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.fileName.message}
                </p>
              )}

              {/* Bulk Upload Info */}
              {isBulkUpload && selectedFiles.length > 0 && (
                <p className="text-blue-400 text-sm mt-2">
                  📁 {selectedFiles.length} file
                  {selectedFiles.length !== 1 ? "s" : ""} selected for bulk
                  upload
                </p>
              )}
            </div>

            {/* Description Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-2">
                Description
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
                  onClick={onCancel}
                  className="bg-transparent border-blue-400 text-blue-400 hover:bg-blue-400/10 hover:border-blue-300 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-6 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isValid}
                >
                  Done
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
