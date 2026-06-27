"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { Project } from "@/types";

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  const [reelOpen, setReelOpen] = useState(false);
  const [reelIndex, setReelIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartY = useRef(0);

  const nextReel = useCallback(() => {
    setReelIndex((i) => (i + 1) % projects.length);
  }, [projects.length]);

  const prevReel = useCallback(() => {
    setReelIndex((i) => (i - 1 + projects.length) % projects.length);
  }, [projects.length]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (reelOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [reelOpen]);

  useEffect(() => {
    if (!reelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") nextReel();
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") prevReel();
      if (e.key === "Escape") setReelOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reelOpen, reelIndex, nextReel, prevReel]);

  const n = projects.length;
  const center = (n - 1) / 2;
  const maxSpread = isMobile ? 46 : 72;
  const spread = n > 1 ? Math.min(maxSpread, 16 * (n - 1)) : 0;
  const cardWidth = isMobile ? 168 : 228;

  function openReel(index: number) {
    setReelIndex(index);
    setReelOpen(true);
  }

  return (
    <section id="projects" className="section-pad">
      <p className="eyebrow mb-2">Selected work</p>
      <h2 className="mb-2 font-display text-3xl font-bold text-white sm:text-4xl">Projects</h2>
      <p className="mb-16 font-mono text-xs text-white/30">
        Click a card to explore.
      </p>

      {projects.length === 0 ? (
        <p className="font-mono text-sm text-white/40">No projects yet — add some from the admin.</p>
      ) : (
        <div
          className="relative mx-auto flex justify-center"
          style={{ height: isMobile ? 360 : 460 }}
        >
          {projects.map((project, i) => {
            const angle = n > 1 ? -spread / 2 + (spread / (n - 1)) * i : 0;
            const isHovered = activeIndex === i;
            const someoneElseActive = activeIndex !== null && !isHovered;
            const dist = Math.abs(i - center);
            const restZ = Math.round(n - dist);

            return (
              <motion.button
                key={project.id}
                onClick={() => openReel(i)}
                onHoverStart={() => setActiveIndex(i)}
                onHoverEnd={() => setActiveIndex(null)}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                animate={{
                  rotate: isHovered ? 0 : someoneElseActive ? angle * 1.4 : angle,
                  y: isHovered ? -60 : 0,
                  scale: isHovered ? 1.08 : someoneElseActive ? 0.92 : 1,
                  opacity: someoneElseActive ? 0.5 : 1,
                }}
                whileTap={{ scale: 0.96 }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  x: "-50%",
                  transformOrigin: "50% 130%",
                  width: cardWidth,
                  zIndex: isHovered ? 50 : restZ,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 22, delay: i * 0.06 }}
                className={`glass flex flex-col overflow-hidden text-left transition-shadow ${
                  isHovered ? "shadow-glow-white bw-border" : "shadow-glass"
                }`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-white/10">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
                    unoptimized={project.image.startsWith("/uploads")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  {project.featured && (
                    <span className="absolute right-2 top-2 rounded-full border border-white/20 bg-black/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/70">
                      Featured
                    </span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                    <div className="rounded-full bg-white/10 p-3 backdrop-blur-sm border border-white/20">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 0 0 0-1.69L9.54 5.98A.998.998 0 0 0 8 6.82Z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 p-3">
                  <h3 className="truncate font-display text-sm font-bold text-white">{project.title}</h3>
                  <div className="flex flex-wrap gap-1">
                    {project.tech.slice(0, 2).map((t) => (
                      <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] text-white/50">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Reel Viewer */}
      <AnimatePresence>
        {reelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center"
            onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
            onTouchEnd={(e) => {
              const delta = touchStartY.current - e.changedTouches[0].clientY;
              if (delta > 50) nextReel();
              if (delta < -50) prevReel();
            }}
          >
            {/* Close */}
            <button
              onClick={() => setReelOpen(false)}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Reel counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 font-mono text-xs text-white/40">
              {reelIndex + 1} / {projects.length}
            </div>

            {/* Dots */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              {projects.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setReelIndex(i)}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${i === reelIndex ? "bg-white scale-125" : "bg-white/30"}`}
                />
              ))}
            </div>

            {/* Card stack */}
            <div className="relative w-full max-w-sm h-full flex items-center justify-center overflow-hidden px-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={reelIndex}
                  initial={{ y: "60%", opacity: 0, scale: 0.92 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: "-60%", opacity: 0, scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 280, damping: 26 }}
                  className="w-full"
                >
                  {(() => {
                    const project = projects[reelIndex];
                    return (
                      <div className="glass-strong bw-border overflow-hidden rounded-2xl">
                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover"
                            unoptimized={project.image.startsWith("/uploads")}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                          {project.featured && (
                            <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/60 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/70">
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-4 p-5">
                          <div>
                            <h3 className="font-display text-xl font-bold text-white">{project.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-white/60">{project.description}</p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {project.tech.map((t) => (
                              <span key={t} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-xs text-white/60">
                                {t}
                              </span>
                            ))}
                          </div>

                          {/* Visit Site + GitHub buttons */}
                          {(project.demo || project.github) && (
                            <div className="flex gap-3 pt-1 border-t border-white/[0.08]">
                              {project.demo && (
                                <a
                                  href={project.demo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 font-mono text-xs text-white backdrop-blur-sm transition-all hover:bg-white hover:text-black hover:border-white"
                                >
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                  </svg>
                                  Visit Site
                                </a>
                              )}
                              {project.github && (
                                <a
                                  href={project.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-xs text-white/60 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white hover:border-white/25"
                                >
                                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
                                  </svg>
                                  GitHub
                                </a>
                              )}
                            </div>
                          )}

                          {/* Built with tag (shown when no links) */}
                          {!project.demo && !project.github && (
                            <div className="pt-1 border-t border-white/[0.08] flex items-center gap-2">
                              <span className="font-mono text-[10px] uppercase tracking-widest text-white/25">Built with</span>
                              <span className="font-mono text-[10px] text-white/40">
                                {project.tech.slice(0, 3).join(" · ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Nav arrows */}
            <button
              onClick={prevReel}
              className="absolute bottom-8 left-1/2 -translate-x-16 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
              aria-label="Previous"
            >
              ↑
            </button>
            <button
              onClick={nextReel}
              className="absolute bottom-8 left-1/2 translate-x-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
              aria-label="Next"
            >
              ↓
            </button>

            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[10px] text-white/30 whitespace-nowrap">
              Swipe or use arrows to navigate
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
