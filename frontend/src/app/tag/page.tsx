"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TagIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page if someone visits /tag without an ID
    router.push("/");
  }, [router]);

  return <div>Redirecting...</div>;
}
