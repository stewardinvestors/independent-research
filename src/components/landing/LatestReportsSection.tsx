"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { mockReports } from "@/data/mock";
import { ReportCard } from "@/components/report/ReportCard";

export function LatestReportsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const latestReports = mockReports.slice(0, 4);

  return (
    <section ref={ref} className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
              최신 리포트
            </h2>
            <p className="mt-2 text-[#6B7280]">
              방금 발간된 독립 기업분석 리포트
            </p>
          </div>
          <Link
            href="/reports"
            className="hidden items-center gap-1 text-sm font-medium text-[#0D2137] hover:underline sm:flex"
          >
            전체 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="mt-10 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-5 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
            {latestReports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                className="w-[280px] flex-shrink-0 sm:w-auto"
              >
                <ReportCard report={report} />
              </motion.div>
            ))}
          </div>
        </div>

        <Link
          href="/reports"
          className="mt-8 flex items-center justify-center gap-1 text-sm font-medium text-[#0D2137] hover:underline sm:hidden"
        >
          전체 보기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
