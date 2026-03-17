"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Building2, FileText, Send } from "lucide-react";

const steps = [
  {
    icon: Building2,
    title: "기업 탐방 & 분석",
    description: "증권사 커버리지 밖 기업을 직접 탐방하고 심층 분석합니다",
  },
  {
    icon: FileText,
    title: "리포트 발간",
    description: "독립 애널리스트가 투자의견과 함께 리포트를 작성합니다",
  },
  {
    icon: Send,
    title: "투자자에게 전달",
    description: "모든 투자자가 무료로 양질의 기업 분석 정보를 받습니다",
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-[#F7F8FA] py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
            이렇게 작동합니다
          </h2>
          <p className="mt-3 text-[#6B7280]">
            간단한 3단계로 정보 사각지대를 해소합니다
          </p>
        </motion.div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          {/* Connector line (desktop) */}
          <div className="absolute top-12 left-[16.67%] right-[16.67%] hidden h-[2px] bg-[#E5E7EB] md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#E5E7EB]">
                <step.icon className="h-10 w-10 text-[#0D2137]" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-[#1A1A1A]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
