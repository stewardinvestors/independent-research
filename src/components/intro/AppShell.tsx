"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IntroSplash } from "./IntroSplash";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [introFinished, setIntroFinished] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // 세션 중 한 번만 인트로 보여주기
    const seen = sessionStorage.getItem("intro-seen");
    if (seen) {
      setShowIntro(false);
      setIntroFinished(true);
    }
  }, []);

  useEffect(() => {
    if (!showIntro) return;
    const timer = setTimeout(() => {
      setIntroFinished(true);
      sessionStorage.setItem("intro-seen", "1");
    }, 4200);
    return () => clearTimeout(timer);
  }, [showIntro]);

  return (
    <>
      {showIntro && <IntroSplash />}

      <motion.div
        initial={showIntro ? { opacity: 0 } : { opacity: 1 }}
        animate={introFinished ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </motion.div>
    </>
  );
}
