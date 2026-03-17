"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "stones" | "strike" | "sparks" | "ignite" | "exit";

interface Spark {
  id: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
  decay: number; // how quickly it fades
}

function generateSparks(count: number): Spark[] {
  const colors = ["#EA580C", "#F59E0B", "#FBBF24", "#FB923C", "#FDE68A"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: Math.random() * Math.PI * 2,
    speed: 60 + Math.random() * 180,
    size: 2 + Math.random() * 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    decay: 0.6 + Math.random() * 0.4,
  }));
}

export function IntroSplash() {
  const [phase, setPhase] = useState<Phase>("stones");
  const [done, setDone] = useState(false);

  const sparks = useMemo(() => generateSparks(25), []);

  const startSequence = useCallback(() => {
    setPhase("stones");

    // Phase "strike" at 0.8s
    setTimeout(() => setPhase("strike"), 800);

    // Phase "sparks" at 1.5s
    setTimeout(() => setPhase("sparks"), 1500);

    // Phase "ignite" at 2.5s
    setTimeout(() => setPhase("ignite"), 2500);

    // Phase "exit" at 3.5s
    setTimeout(() => setPhase("exit"), 3500);

    // Done at 4.2s
    setTimeout(() => setDone(true), 4200);
  }, []);

  useEffect(() => {
    startSequence();
  }, [startSequence]);

  if (done) return null;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: "#1C1917" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* ── Left Stone ── */}
          <motion.div
            className="absolute"
            style={{
              width: 64,
              height: 56,
              borderRadius: "38% 62% 52% 48% / 45% 55% 45% 55%",
              backgroundColor: "#292524",
              boxShadow: "inset 2px 2px 6px rgba(255,255,255,0.05), inset -2px -2px 6px rgba(0,0,0,0.4)",
            }}
            initial={{ x: -120, y: 0, opacity: 0, scale: 0.7 }}
            animate={
              phase === "stones"
                ? { x: -120, y: 0, opacity: 1, scale: 1, rotate: -8 }
                : phase === "strike"
                  ? { x: -4, y: 0, opacity: 1, scale: 1, rotate: 5 }
                  : phase === "sparks"
                    ? { x: -4, y: 0, opacity: 1, scale: 0.95, rotate: 5 }
                    : phase === "ignite"
                      ? { x: -4, y: 0, opacity: 0, scale: 0.6, rotate: 5 }
                      : { x: -4, y: 0, opacity: 0, scale: 0.3 }
            }
            transition={
              phase === "stones"
                ? { duration: 0.6, ease: "easeOut" }
                : phase === "strike"
                  ? { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                  : { duration: 0.5 }
            }
          />

          {/* ── Right Stone ── */}
          <motion.div
            className="absolute"
            style={{
              width: 58,
              height: 52,
              borderRadius: "52% 48% 42% 58% / 55% 45% 55% 45%",
              backgroundColor: "#1C1917",
              border: "2px solid #3F3F46",
              boxShadow: "inset 2px 2px 6px rgba(255,255,255,0.04), inset -2px -2px 6px rgba(0,0,0,0.5)",
            }}
            initial={{ x: 120, y: 0, opacity: 0, scale: 0.7 }}
            animate={
              phase === "stones"
                ? { x: 120, y: 0, opacity: 1, scale: 1, rotate: 12 }
                : phase === "strike"
                  ? { x: 4, y: 0, opacity: 1, scale: 1, rotate: -3 }
                  : phase === "sparks"
                    ? { x: 4, y: 0, opacity: 1, scale: 0.95, rotate: -3 }
                    : phase === "ignite"
                      ? { x: 4, y: 0, opacity: 0, scale: 0.6, rotate: -3 }
                      : { x: 4, y: 0, opacity: 0, scale: 0.3 }
            }
            transition={
              phase === "stones"
                ? { duration: 0.6, ease: "easeOut" }
                : phase === "strike"
                  ? { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                  : { duration: 0.5 }
            }
          />

          {/* ── Impact shake wrapper ── */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={
              phase === "sparks"
                ? { x: [0, -3, 4, -2, 1, 0], y: [0, 2, -3, 1, -1, 0] }
                : {}
            }
            transition={
              phase === "sparks"
                ? { duration: 0.3, ease: "easeOut" }
                : {}
            }
          />

          {/* ── Impact flash ── */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 40,
              height: 40,
              background: "radial-gradient(circle, rgba(251,191,36,0.9) 0%, rgba(234,88,12,0.4) 50%, transparent 80%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={
              phase === "sparks"
                ? { scale: [0, 3, 1.5], opacity: [0, 1, 0.3] }
                : phase === "ignite"
                  ? { scale: 0.5, opacity: 0 }
                  : { scale: 0, opacity: 0 }
            }
            transition={
              phase === "sparks"
                ? { duration: 0.4, ease: "easeOut" }
                : { duration: 0.3 }
            }
          />

          {/* ── Spark Particles ── */}
          {sparks.map((spark) => {
            const dx = Math.cos(spark.angle) * spark.speed;
            const dy = Math.sin(spark.angle) * spark.speed - 40; // bias upward
            return (
              <motion.div
                key={spark.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: spark.size,
                  height: spark.size,
                  backgroundColor: spark.color,
                  boxShadow: `0 0 ${spark.size * 2}px ${spark.color}`,
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={
                  phase === "sparks"
                    ? {
                        x: [0, dx * 0.6, dx],
                        y: [0, dy * 0.4, dy + 30], // gravity pull at end
                        opacity: [0, 1, 0],
                        scale: [0, 1.2, 0],
                      }
                    : { x: 0, y: 0, opacity: 0, scale: 0 }
                }
                transition={
                  phase === "sparks"
                    ? {
                        duration: 0.7 + spark.decay * 0.3,
                        ease: "easeOut",
                        delay: Math.random() * 0.08,
                      }
                    : { duration: 0 }
                }
              />
            );
          })}

          {/* ── Fire Glow (ignite phase) ── */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 400,
              height: 400,
              background:
                "radial-gradient(circle, rgba(251,146,60,0.25) 0%, rgba(234,88,12,0.12) 30%, rgba(245,158,11,0.06) 55%, transparent 75%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={
              phase === "ignite"
                ? { scale: [0.3, 1.2, 1], opacity: [0, 0.9, 0.7] }
                : phase === "exit"
                  ? { scale: 1.5, opacity: 0 }
                  : { scale: 0, opacity: 0 }
            }
            transition={
              phase === "ignite"
                ? { duration: 0.8, ease: "easeOut" }
                : { duration: 0.5 }
            }
          />

          {/* ── Inner warm glow ── */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 160,
              height: 160,
              background:
                "radial-gradient(circle, rgba(251,191,36,0.4) 0%, rgba(245,158,11,0.15) 50%, transparent 80%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={
              phase === "ignite"
                ? { scale: [0, 1.3, 1], opacity: [0, 1, 0.6] }
                : phase === "exit"
                  ? { scale: 0.5, opacity: 0 }
                  : { scale: 0, opacity: 0 }
            }
            transition={
              phase === "ignite"
                ? { duration: 0.6, ease: "easeOut", delay: 0.1 }
                : { duration: 0.4 }
            }
          />

          {/* ── Brand Name ── */}
          <motion.div
            className="absolute text-center flex flex-col items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={
              phase === "ignite"
                ? { opacity: 1, y: 0 }
                : phase === "exit"
                  ? { opacity: 0, y: -20, scale: 0.9 }
                  : { opacity: 0, y: 10 }
            }
            transition={
              phase === "ignite"
                ? { duration: 0.6, delay: 0.2, ease: "easeOut" }
                : { duration: 0.4 }
            }
          >
            <h1
              className="text-5xl font-black tracking-widest text-white sm:text-6xl"
              style={{
                textShadow:
                  "0 0 30px rgba(251,146,60,0.5), 0 0 60px rgba(234,88,12,0.3), 0 0 90px rgba(245,158,11,0.15)",
              }}
            >
              FLINT
            </h1>
            <p
              className="mt-3 text-sm tracking-wide sm:text-base"
              style={{ color: "#D6D3D1" }}
            >
              작은 불꽃이 시장을 밝힙니다
            </p>
          </motion.div>

          {/* ── Ambient floating embers (ignite phase) ── */}
          {phase === "ignite" &&
            Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={`ember-${i}`}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 3,
                  height: 3,
                  backgroundColor: i % 2 === 0 ? "#F59E0B" : "#EA580C",
                }}
                initial={{
                  x: (Math.random() - 0.5) * 60,
                  y: 20 + Math.random() * 30,
                  opacity: 0,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 120,
                  y: -80 - Math.random() * 100,
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 1.2 + Math.random() * 0.8,
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
              />
            ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
