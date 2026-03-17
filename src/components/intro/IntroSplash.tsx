"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 문서 아이콘을 구성하는 도트들의 최종 좌표 (16x20 grid 기준, 중앙 정렬)
// FileText 아이콘 모양: 문서 윤곽 + 접힌 모서리 + 텍스트 라인
const ICON_DOTS: { x: number; y: number }[] = [];

// 문서 외곽선 (왼쪽 변)
for (let y = 0; y <= 19; y++) ICON_DOTS.push({ x: 1, y });
// 문서 외곽선 (아래 변)
for (let x = 1; x <= 12; x++) ICON_DOTS.push({ x, y: 19 });
// 문서 외곽선 (오른쪽 변)
for (let y = 4; y <= 19; y++) ICON_DOTS.push({ x: 12, y });
// 문서 외곽선 (위 변, 접히기 전까지)
for (let x = 1; x <= 8; x++) ICON_DOTS.push({ x, y: 0 });
// 접힌 모서리 (대각선)
ICON_DOTS.push({ x: 9, y: 0 });
ICON_DOTS.push({ x: 10, y: 1 });
ICON_DOTS.push({ x: 11, y: 2 });
ICON_DOTS.push({ x: 12, y: 3 });
// 접힌 부분 가로선
for (let x = 9; x <= 12; x++) ICON_DOTS.push({ x, y: 4 });
// 접힌 부분 세로선
ICON_DOTS.push({ x: 8, y: 1 });
ICON_DOTS.push({ x: 8, y: 2 });
ICON_DOTS.push({ x: 8, y: 3 });

// 텍스트 라인들 (문서 안의 줄)
for (let x = 3; x <= 10; x++) ICON_DOTS.push({ x, y: 8 });
for (let x = 3; x <= 10; x++) ICON_DOTS.push({ x, y: 10 });
for (let x = 3; x <= 10; x++) ICON_DOTS.push({ x, y: 12 });
for (let x = 3; x <= 7; x++) ICON_DOTS.push({ x, y: 14 });

// 중복 제거
const uniqueKey = (d: { x: number; y: number }) => `${d.x},${d.y}`;
const seen = new Set<string>();
const UNIQUE_DOTS = ICON_DOTS.filter((d) => {
  const k = uniqueKey(d);
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

// 도트 크기와 간격 설정
const DOT_SIZE = 6;
const DOT_GAP = 10;
const GRID_W = 14;
const GRID_H = 20;

interface Particle {
  id: number;
  // 최종 위치
  targetX: number;
  targetY: number;
  // 시작 위치 (랜덤)
  startX: number;
  startY: number;
  // 지연 시간
  delay: number;
  // 크기
  size: number;
}

export function IntroSplash() {
  const [phase, setPhase] = useState<"scatter" | "assemble" | "logo" | "exit">(
    "scatter"
  );
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 파티클 생성 (한 번만)
  const [particles] = useState<Particle[]>(() => {
    return UNIQUE_DOTS.map((dot, i) => {
      // 화면 밖 랜덤 위치에서 시작
      const angle = Math.random() * Math.PI * 2;
      const dist = 300 + Math.random() * 400;
      return {
        id: i,
        targetX: dot.x * DOT_GAP,
        targetY: dot.y * DOT_GAP,
        startX: Math.cos(angle) * dist + (GRID_W * DOT_GAP) / 2,
        startY: Math.sin(angle) * dist + (GRID_H * DOT_GAP) / 2,
        delay: Math.random() * 0.6,
        size: DOT_SIZE * (0.6 + Math.random() * 0.8),
      };
    });
  });

  const startSequence = useCallback(() => {
    // Phase 1: 흩어진 상태 잠깐 보여주기
    setPhase("scatter");

    // Phase 2: 모여들기 (0.3초 후)
    setTimeout(() => setPhase("assemble"), 300);

    // Phase 3: 로고 완성 (2초 후)
    setTimeout(() => setPhase("logo"), 2200);

    // Phase 4: 퇴장 (3.5초 후)
    setTimeout(() => setPhase("exit"), 3500);

    // 완전히 사라짐 (4.2초 후)
    setTimeout(() => setDone(true), 4200);
  }, []);

  useEffect(() => {
    startSequence();
  }, [startSequence]);

  if (done) return null;

  const canvasW = GRID_W * DOT_GAP;
  const canvasH = GRID_H * DOT_GAP;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0D2137]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 파티클 캔버스 */}
          <div
            className="relative"
            style={{ width: canvasW, height: canvasH }}
          >
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  marginLeft: -p.size / 2,
                  marginTop: -p.size / 2,
                }}
                initial={{
                  x: p.startX,
                  y: p.startY,
                  opacity: 0.3,
                  scale: 0.3,
                  backgroundColor: "rgba(255,255,255,0.3)",
                }}
                animate={
                  phase === "scatter"
                    ? {
                        x: p.startX,
                        y: p.startY,
                        opacity: 0.6,
                        scale: Math.random() * 0.5 + 0.5,
                        backgroundColor: "rgba(255,255,255,0.4)",
                      }
                    : phase === "assemble"
                    ? {
                        x: p.targetX,
                        y: p.targetY,
                        opacity: 1,
                        scale: 1,
                        backgroundColor: "rgba(255,255,255,0.95)",
                      }
                    : phase === "logo"
                    ? {
                        x: p.targetX,
                        y: p.targetY,
                        opacity: 1,
                        scale: 1,
                        backgroundColor: "rgba(255,255,255,1)",
                      }
                    : {
                        x: p.targetX,
                        y: p.targetY + 20,
                        opacity: 0,
                        scale: 0.5,
                        backgroundColor: "rgba(255,255,255,0)",
                      }
                }
                transition={
                  phase === "assemble"
                    ? {
                        type: "spring",
                        stiffness: 60,
                        damping: 12,
                        mass: 0.8,
                        delay: p.delay,
                      }
                    : phase === "logo"
                    ? {
                        duration: 0.3,
                      }
                    : phase === "exit"
                    ? {
                        duration: 0.4,
                        delay: p.delay * 0.3,
                      }
                    : { duration: 0.3 }
                }
              />
            ))}
          </div>

          {/* 로고 텍스트 (로고 완성 후 나타남) */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={
              phase === "logo"
                ? { opacity: 1, y: 0 }
                : phase === "exit"
                ? { opacity: 0, y: -10 }
                : { opacity: 0, y: 10 }
            }
            transition={
              phase === "logo"
                ? { duration: 0.5, delay: 0.1 }
                : { duration: 0.3 }
            }
          >
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              독립리서치
            </h1>
            <p className="mt-2 text-sm text-[#8BA4BE]">
              증권사가 다루지 않는 기업의 이야기
            </p>
          </motion.div>

          {/* 배경 글로우 이펙트 */}
          <motion.div
            className="pointer-events-none absolute rounded-full"
            style={{
              width: 300,
              height: 300,
              background:
                "radial-gradient(circle, rgba(74,109,140,0.15) 0%, transparent 70%)",
            }}
            animate={
              phase === "assemble" || phase === "logo"
                ? { scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }
                : { scale: 0.5, opacity: 0 }
            }
            transition={
              phase === "assemble" || phase === "logo"
                ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.3 }
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
