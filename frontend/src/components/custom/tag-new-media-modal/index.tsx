"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Image, Music, Trash2, Upload, Video } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Validation schema
const formSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, "Please upload at least one file"),
  fileName: z
    .string()
    .min(1, "File name is required")
    .min(3, "File name must be at least 3 characters"),
});

type FormData = z.infer<typeof formSchema>;

interface TagNewMediaModalProps {
  onCancel?: () => void;
  onContinue?: (data: FormData) => void;
}

export default function TagNewMediaModal({
  onCancel,
  onContinue,
}: TagNewMediaModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      files: [],
      fileName: "",
    },
  });

  const fileName = watch("fileName");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      setValue("files", fileArray, { shouldValidate: true });
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      setValue("files", fileArray, { shouldValidate: true });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setValue("files", newFiles, { shouldValidate: true });
  };

  const onSubmit = (data: FormData) => {
    if (onContinue) {
      onContinue(data);
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
    <div className="max-w-2xl mx-auto">
      {/* Enhanced Modal Container */}
      <Card className="bg-[#2A2D35] border-[#3A3D45] shadow-2xl">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-4">
              Tag New Media
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-base mb-2">
              You can now upload your media and get it tagged. Remember to
              upload using the correct file types.
            </p>

            {/* Required Fields Note */}
            <p className="text-blue-400 text-sm mb-8">*Required fields</p>

            {/* Upload Media Section */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-2">
                Upload Media <span className="text-red-400">*</span>
              </h2>

              <p className="text-gray-400 text-sm mb-4">
                Image, Video or Audio
                <br />
                file types supported: JPG, PNG, GIF, SVG, MP4, WEBM, WAV, AAC,
                MP3, Max size 10MB
              </p>

              {/* Enhanced File Dropzone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer group hover:bg-[#2A2D35]/50 ${
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
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.svg,.mp4,.webm,.wav,.aac,.mp3"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {selectedFiles.length > 0 ? (
                  <div className="text-white space-y-4">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <Upload className="w-6 h-6 text-blue-400" />
                      <p className="text-lg font-medium">
                        {selectedFiles.length} file(s) selected
                      </p>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-[#3A3D45] rounded-lg hover:bg-[#4A4D55] transition-colors group"
                        >
                          <div className="text-blue-400">
                            {getFileIcon(file)}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-[#3A3D45] rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-white mb-2">
                        Drop files here or click to upload
                      </p>
                      <p className="text-sm text-gray-400 mb-4">
                        Supports images, videos, and audio files
                      </p>
                      <Button
                        variant="outline"
                        className="bg-[#3A3D45] border-gray-600 text-white hover:bg-[#4A4D55] hover:border-gray-500 transition-colors"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Add files
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* File Upload Error Message */}
              {errors.files && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.files.message}
                </p>
              )}
            </div>

            {/* File Name Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-2">
                File name <span className="text-red-400">*</span>
              </h2>

              <div className="relative">
                <input
                  {...register("fileName")}
                  type="text"
                  placeholder="Enter file name"
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
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="bg-transparent border-gray-600 text-white hover:bg-[#3A3D45] hover:border-gray-500 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isValid}
              >
                Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
