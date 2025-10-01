"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LoginCard } from "@/components/custom/login-card"
export default function LoginPage() {
  const { isAuthorized } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  if (isAuthorized) {
    router.push('/');
    return null;
  }

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <img
        src="/images/login-bg.jpg"
        alt="Abstract 3D ring background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <section className="relative mx-[7%] flex min-h-dvh max-w-7xl items-center justify-end px-4">
        <div className="w-full max-w-md">
          <LoginCard />
        </div>
      </section>
    </main>
  );
}
