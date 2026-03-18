"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Dynamic import to avoid SSR issues with Three.js
const FlintIntro = dynamic(
  () => import("./FlintIntro").then((mod) => ({ default: mod.FlintIntro })),
  { ssr: false }
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("intro-seen");
    if (seen) {
      setShowIntro(false);
      setIntroFinished(true);
    }
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroFinished(true);
    sessionStorage.setItem("intro-seen", "1");
    // Remove intro after fade-out transition
    setTimeout(() => setShowIntro(false), 900);
  }, []);

  return (
    <LanguageProvider>
      {showIntro && <FlintIntro onComplete={handleIntroComplete} />}

      <motion.div
        initial={showIntro ? { opacity: 0 } : { opacity: 1 }}
        animate={introFinished ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </motion.div>
    </LanguageProvider>
  );
}
