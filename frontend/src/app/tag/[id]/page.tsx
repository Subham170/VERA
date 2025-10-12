"use client";

import { useParams } from "next/navigation";
import TagPageClient from "./TagPageClient";

export default function TagPage() {
  const params = useParams();
  const id = params.id as string;

  return <TagPageClient id={id} />;
}