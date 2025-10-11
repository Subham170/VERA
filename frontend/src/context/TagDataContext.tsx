"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface TagData {
  fileName: string;
  description: string;
  mediaType: "image" | "video" | "audio" | "text";
  isBulkUpload: boolean;
  fileCount: number;
  importedUrl?: string | null;
}

interface TagDataContextType {
  tagData: TagData | null;
  setTagData: (data: TagData) => void;
  clearTagData: () => void;
}

const TagDataContext = createContext<TagDataContextType | undefined>(undefined);

export function TagDataProvider({ children }: { children: ReactNode }) {
  const [tagData, setTagData] = useState<TagData | null>(null);

  const clearTagData = () => {
    setTagData(null);
  };

  return (
    <TagDataContext.Provider value={{ tagData, setTagData, clearTagData }}>
      {children}
    </TagDataContext.Provider>
  );
}

export function useTagData() {
  const context = useContext(TagDataContext);
  if (context === undefined) {
    throw new Error("useTagData must be used within a TagDataProvider");
  }
  return context;
}
