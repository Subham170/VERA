"use client";

import { useParams } from "next/navigation";
import TagPageClient from "../[id]/TagPageClient";

export default function DynamicTagPage() {
  const params = useParams();
  const slug = params.slug as string[];

  // The first element of slug array is our tag ID
  const tagId = slug[0];

  return <TagPageClient id={tagId} />;
}
