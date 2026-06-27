"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_LINES = [
  "INITIALIZING SYSTEM...",
  "LOADING MODULES........",
  "MOUNTING FILESYSTEM....",
  "RESOLVING ASSETS.......",
  "HANDSHAKE COMPLETE.....",
];

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"boot" | "bar" | "out">("boot");
  const doneRef = useRef(false);

  // Boot lines ticker
  useEffect(() => {
    if (phase !== "boot") return;
    if (lineIndex < BOOT_LINES.length - 1) {
      const t = setTimeout(() => setLineIndex((i) => i + 1), 320);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setPhase("bar"), 300);
      return () => clearTimeout(t);
    }
  }, [lineIndex, phase]);

  // Progress bar
  useEffect(() => {
    if (phase !== "bar") return;
    let raf: number;
    let start: number | null = null;
    const duration = 900;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(Math.round(p * 100));
      if (p < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setTimeout(() => setPhase("out"), 300);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // Exit
  useEffect(() => {
    if (phase === "out" && !doneRef.current) {
      doneRef.current = true;
      setTimeout(onDone, 700);
    }
  }, [phase, onDone]);

  return (
    <AnimatePresence>
      {phase !== "out" ? (
        <motion.div
          key="loading"
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#0a0a0a] gap-8 select-none"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Scan line */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <motion.div
              className="absolute left-0 right-0 h-[2px] bg-white/5"
              animate={{ y: ["0vh", "100vh"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-20 w-20 items-center justify-center"
          >
            <svg viewBox="0 0 80 80" className="absolute inset-0" fill="none">
              <motion.rect
                x="2" y="2" width="76" height="76"
                stroke="white" strokeWidth="1.5"
                strokeDasharray="300"
                initial={{ strokeDashoffset: 300 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </svg>
            <span className="font-mono text-2xl font-bold text-white">j.</span>
          </motion.div>

          {/* Boot log */}
          <div className="w-72 font-mono text-[11px] space-y-1">
            {BOOT_LINES.slice(0, lineIndex + 1).map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={i === lineIndex ? "text-white" : "text-white/30"}
              >
                {i < lineIndex ? (
                  <><span className="text-white/40">✓ </span>{line}</>
                ) : (
                  <><span className="text-white/70 animate-blink">▋ </span>{line}</>
                )}
              </motion.p>
            ))}
          </div>

          {/* Progress bar */}
          <AnimatePresence>
            {phase === "bar" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-72"
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-white/40 mb-2">
                  <span>LOADING PORTFOLIO</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
