"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export function CTASection() {
  const { t } = useLang();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="bg-gradient-to-br from-[#1C1917] to-[#292524] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl"
        >
          {t("모든 투자자는", "Every investor")}
          <br />
          {t("정보를 받을 자격이 있습니다", "deserves access to information")}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-4 text-[#A8A29E]"
        >
          {t(
            "지금 바로 증권사가 다루지 않는 기업 이야기를 만나보세요",
            "Discover the stories of companies that brokerages don't cover"
          )}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <Link
            href="/reports"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 text-sm font-semibold text-[#1C1917] shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            {t("무료로 시작하기", "Get Started for Free")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
