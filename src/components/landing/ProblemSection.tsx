"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

function CountUp({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: Donut chart */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex justify-center"
          >
            <div className="relative h-64 w-64 sm:h-80 sm:w-80">
              <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="24"
                />
                {/* Coverage (14.3%) */}
                <motion.circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#EA580C"
                  strokeWidth="24"
                  strokeDasharray={`${80 * 2 * Math.PI * 0.143} ${80 * 2 * Math.PI}`}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 80 * 2 * Math.PI * 0.143 }}
                  animate={isInView ? { strokeDashoffset: 0 } : {}}
                  transition={{ duration: 1.5, delay: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-[#1C1917]">
                  14.3%
                </span>
                <span className="mt-1 text-sm text-[#6B7280]">실질 커버리지</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
              대부분의 상장사는
              <br />
              정보 사각지대에 있습니다
            </h2>

            <div className="mt-8 space-y-6">
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] p-5">
                <p className="text-sm text-[#6B7280]">전체 상장사</p>
                <p className="mt-1 text-3xl font-bold text-[#1C1917]">
                  <CountUp end={2674} />개
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
                  <p className="text-sm text-[#6B7280]">실질 커버</p>
                  <p className="mt-1 text-2xl font-bold text-[#1C1917]">
                    <CountUp end={382} />개
                  </p>
                  <p className="text-xs text-[#78716C]">14.3%</p>
                </div>
                <div className="rounded-2xl border border-[#C94040]/20 bg-[#C94040]/5 p-5">
                  <p className="text-sm text-[#6B7280]">정보 사각지대</p>
                  <p className="mt-1 text-2xl font-bold text-[#C94040]">
                    <CountUp end={2292} />개
                  </p>
                  <p className="text-xs text-[#C94040]">85.7%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
