"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <path
          d="M16.667 5.833 8.125 14.375 3.333 9.583"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#081B38]">
    {/* Background collage */}
    <Image src="/welcomeBg.png" alt="" priority aria-hidden="true" fill className="absolute inset-0 bg-cover bg-center object-cover w-full h-full brightness-40 rotate-[-7deg]"  />

    {/* Dark overlay over the collage */}
    <div className="absolute inset-0 bg-[var(--overlay)]" />

    {/* Header brand (top-left) */}
    <header className="absolute left-0 right-0 top-0 flex items-center gap-3 p-4 md:p-6">
      <img src="images/logo.png" alt="V.E.R.A. logo" className="h-8 w-auto md:h-10 hover:scale-110 transition-transform duration-200 cursor-pointer" />
      <span className="text-white/90 text-lg md:text-xl font-semibold tracking-wide hover:text-white transition-colors duration-200 cursor-pointer">V.E.R.A.</span>
    </header>

    {/* Center content */}
    <section className="relative z-10 flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-xl p-6 md:p-8 transparent-bg shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h1 className="text-center text-xl md:text-2xl lg:text-3xl font-semibold leading-tight text-white/95 text-balance">
          Unlimited Authenticity.
          <br className="hidden sm:block" />
          Real People. Real Stories
        </h1>

         <ul className="mt-5 md:mt-6 space-y-3 text-white/85 text-[12px] md:text-base flex flex-col items-center">
           <li className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 cursor-pointer">
             <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-blue)] text-white hover:bg-blue-600 transition-colors duration-200">
               <CheckIcon className="h-3.5 w-3.5" />
             </span>
             <span>Easily Verify Your Content</span>
           </li>
           <li className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 cursor-pointer">
             <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-blue)] text-white hover:bg-blue-600 transition-colors duration-200">
               <CheckIcon className="h-3.5 w-3.5" />
             </span>
             <span>Protect against Deepfakes</span>
           </li>
           <li className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 cursor-pointer">
             <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-blue)] text-white hover:bg-blue-600 transition-colors duration-200">
               <CheckIcon className="h-3.5 w-3.5" />
             </span>
             <span>Simple, Fast, and Reliable.</span>
           </li>
         </ul>

        <div className="mt-6 md:mt-8 flex justify-center">
          <Button 
            onClick={onGetStarted}
            className="w-full px-8 py-6 text-base font-semibold rounded-lg bg-[var(--brand-blue)] text-[var(--brand-foreground)] cursor-pointer hover:bg-blue-700 hover:scale-105 hover:shadow-xl transition-all duration-300 transform"
          >
            {"Let's Go"}
          </Button>
        </div>
      </div>
    </section>
  </main>
  );
}
