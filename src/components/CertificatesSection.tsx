"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { Certificate } from "@/types";

const FILTERS = ["All", "Web Dev", "AI", "UI/UX", "Other"] as const;

export default function CertificatesSection({ certificates }: { certificates: Certificate[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [active, setActive] = useState<Certificate | null>(null);

  const filtered = useMemo(
    () => filter === "All" ? certificates : certificates.filter((c) => c.category === filter),
    [certificates, filter]
  );

  return (
    <section id="certificates" className="section-pad">
      <p className="eyebrow mb-2">Proof of work</p>
      <h2 className="mb-8 font-display text-3xl font-bold text-white sm:text-4xl">Certificates</h2>

      <div className="mb-10 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <motion.button
            key={f}
            onClick={() => setFilter(f)}
            whileTap={{ scale: 0.95 }}
            className={`relative rounded-full px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              filter === f ? "text-black" : "text-white/40 hover:text-white"
            }`}
          >
            {filter === f && (
              <motion.span
                layoutId="cert-filter-pill"
                className="absolute inset-0 rounded-full bg-white"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{f}</span>
          </motion.button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="font-mono text-sm text-white/40">No certificates in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((cert, i) => (
            <motion.button
              key={cert.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.25)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActive(cert)}
              className="glass group relative aspect-[4/5] overflow-hidden text-left transition-all"
            >
              <Image
                src={cert.image}
                alt={cert.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                unoptimized={cert.image.startsWith("/uploads")}
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-3">
                <p className="font-display text-sm font-bold text-white">{cert.title}</p>
                <p className="font-mono text-[10px] text-white/50">{cert.issuer}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6 backdrop-blur-sm"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[95vh] w-full max-w-5xl"
            >
              <div className="relative h-[70vh] max-h-[80vh] w-full overflow-hidden rounded-2xl border border-white/15 bg-surface shadow-glow-white sm:h-[78vh]">
                <Image
                  src={active.image}
                  alt={active.title}
                  fill
                  className="object-contain p-2 sm:p-4"
                  sizes="(max-width: 768px) 90vw, 70vw"
                  unoptimized={active.image.startsWith("/uploads")}
                />
              </div>
              <div className="mt-4 text-center">
                <p className="font-display text-lg font-bold text-white">{active.title}</p>
                <p className="font-mono text-xs text-white/40">
                  {active.issuer} · {new Date(active.issuedAt).getFullYear()}
                </p>
              </div>
              <button
                onClick={() => setActive(null)}
                aria-label="Close preview"
                className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-surface-2 text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
