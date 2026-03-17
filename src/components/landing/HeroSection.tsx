"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#1C1917]">
      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-sm font-medium tracking-wide text-[#78716C]"
        >
          Independent Research Platform
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-[52px]"
        >
          상장사의 85%는
          <br />
          아무도 분석하지 않습니다
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#A8A29E] sm:text-lg"
        >
          우리는 증권사가 다루지 않는 2,292개 기업의 이야기를 씁니다
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4"
        >
          <Link
            href="/reports"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-semibold text-[#1C1917] shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] sm:w-auto"
          >
            리포트 둘러보기
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/write"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/30 px-8 text-sm font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10 active:scale-[0.98] sm:w-auto"
          >
            <Users className="h-4 w-4" />
            애널리스트로 참여하기
          </Link>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
