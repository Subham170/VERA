"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import { Upload, X, Check, Pause, Play, Image as ImageIcon } from "lucide-react";

interface TagNewMediaFormProps {
  onContinue?: (data: any) => void;
  onCancel?: () => void;
}

export default function TagNewMediaForm({ onContinue, onCancel }: TagNewMediaFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] = useState<"video" | "image" | "audio">("video");
  const [urlInput, setUrlInput] = useState("");
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: "uploading" | "completed" | "paused" | "error" }>({});
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      selectedFiles.forEach(file => {
        if (file.type.startsWith("image/")) {
          URL.revokeObjectURL(URL.createObjectURL(file));
        }
      });
    };
  }, [selectedFiles]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      
      // Auto-fill file name if not already set
      if (!fileName && fileArray.length === 1) {
        setFileName(fileArray[0].name.split('.')[0]);
      }

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
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      
      // Auto-fill file name if not already set
      if (!fileName && fileArray.length === 1) {
        setFileName(fileArray[0].name.split('.')[0]);
      }

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

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5" />;
    if (type.startsWith("video/")) return <Upload className="w-5 h-5" />;
    if (type.startsWith("audio/")) return <Upload className="w-5 h-5" />;
    return <Upload className="w-5 h-5" />;
  };

  const getFilePreview = (file: File) => {
    const type = file.type;
    if (type.startsWith("image/")) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="w-12 h-12 object-cover rounded-lg"
        />
      );
    }
    return (
      <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
        {getFileIcon(file)}
      </div>
    );
  };

  const handleUrlImport = () => {
    if (urlInput.trim()) {
      // Create a mock file from URL
      const mockFile = new File([], urlInput.split('/').pop() || 'imported-file', {
        type: 'image/jpeg'
      });
      setSelectedFiles(prev => [...prev, mockFile]);
      setUrlInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onContinue) {
      onContinue({
        files: selectedFiles,
        fileName,
        description,
        mediaType,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-[#2A2D35] border-[#3A3D45] shadow-2xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Upload Media</h1>
            <div className="flex items-center space-x-4">
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
                onClick={onCancel}
                className="w-8 h-8 bg-[#3A3D45] rounded-lg flex items-center justify-center hover:bg-[#4A4D55] transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Drag and Drop Area */}
            <div
              className="border-2 border-dashed border-gray-500 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors mb-8"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={handleBrowseClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple={isBulkUpload}
                accept=".jpg,.jpeg,.png,.gif,.svg,.mp4,.webm,.ogg,.aac,.mp3,.wav,.flac,.m4a"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <div className="flex space-x-1">
                      <ImageIcon className="w-8 h-8 text-blue-400" />
                      <ImageIcon className="w-8 h-8 text-blue-400 -ml-2" />
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-lg">
                  {isBulkUpload 
                    ? "Drop your media files here, or browse to select multiple files"
                    : "Drop your media here, or browse to select a file"
                  }
                </p>
                <p className="text-sm text-gray-400">
                  Supported: JPG, PNG, GIF, SVG, MP4, WEBM, OGG, AAC, MP3, WAV, and TXT
                  {isBulkUpload && " • Multiple files allowed"}
                </p>
              </div>
            </div>

            {/* Uploaded Files List */}
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
                      {getFilePreview(file)}

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
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
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <button
                            onClick={() => togglePause(file.name)}
                            className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors"
                          >
                            {status === "paused" ? (
                              <Play className="w-3 h-3 text-white" />
                            ) : (
                              <Pause className="w-3 h-3 text-white" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => removeFile(index)}
                          className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Or Separator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex-1 h-px bg-gray-600"></div>
              <span className="px-4 text-gray-400 text-sm font-medium">or</span>
              <div className="flex-1 h-px bg-gray-600"></div>
            </div>

            {/* Import from URL Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Import from URL</h3>
              <div className="flex space-x-3">
                <Input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Add file URL"
                  className="flex-1 bg-[#3A3D45] border-gray-600 text-white placeholder-gray-400 rounded-lg"
                />
                <Button
                  type="button"
                  onClick={handleUrlImport}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  Import
                </Button>
              </div>
            </div>

            {/* File Name Field */}
            <div className="mb-8">
              <label className="block text-white text-sm font-medium mb-3">
                {isBulkUpload ? "Collection name" : "File name"} <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder={isBulkUpload ? "Enter collection name" : "Enter file name"}
                className="bg-[#3A3D45] border-gray-600 text-white placeholder-gray-400 rounded-lg"
                required
              />
            </div>

            {/* Description Field */}
            <div className="mb-8">
              <label className="block text-white text-sm font-medium mb-3">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a short description of the media (optional)"
                rows={4}
                className="bg-[#3A3D45] border-gray-600 text-white placeholder-gray-400 rounded-lg resize-none"
              />
            </div>

            {/* Media Type Section */}
            <div className="mb-8">
              <label className="block text-white text-sm font-medium mb-4">
                Media Type
              </label>
              <p className="text-sm text-gray-400 mb-4">
                What type of media file are you uploading today? (Supports images, video, and audio)
              </p>
              
              <div className="space-y-3">
                {[
                  { value: "video", label: "Video" },
                  { value: "image", label: "Image" },
                  { value: "audio", label: "Audio" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="mediaType"
                      value={option.value}
                      checked={mediaType === option.value}
                      onChange={(e) => setMediaType(e.target.value as "video" | "image" | "audio")}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-white">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-600">
              <div className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 cursor-pointer">
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
                  disabled={!fileName || selectedFiles.length === 0}
                >
                  Continue
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
