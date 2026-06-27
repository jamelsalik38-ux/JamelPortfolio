"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { SiteSettings } from "@/types";

// Roles always start with "Aspiring Full Stack Developer"
const BASE_ROLES = ["Aspiring Full Stack Developer", "PHP / MySQL Builder", "Linux Tinkerer", "BSCS Student"];

function TypingTagline({ roles }: { roles: string[] }) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = roles[roleIndex % roles.length];
    const speed = deleting ? 40 : 70;
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (text.length < current.length) {
          setText(current.slice(0, text.length + 1));
        } else {
          setTimeout(() => setDeleting(true), 1400);
        }
      } else {
        if (text.length > 0) {
          setText(text.slice(0, -1));
        } else {
          setDeleting(false);
          setRoleIndex((i) => (i + 1) % roles.length);
        }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [text, deleting, roleIndex, roles]);

  return (
    <span className="font-mono text-base text-white/60 md:text-lg">
      <span className="text-white/30">$</span> {text}
      <span className="ml-0.5 inline-block w-2 animate-blink bg-white align-middle">&nbsp;</span>
    </span>
  );
}

const letterVariants = {
  hidden: { y: "110%", opacity: 0 },
  visible: (i: number) => ({
    y: "0%",
    opacity: 1,
    transition: { delay: 0.3 + i * 0.038, duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Hero({ settings }: { settings: SiteSettings }) {
  // Always use base roles — "Aspiring Full Stack Developer" is always first
  const roles = BASE_ROLES;

  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
    >
      {/* Grid bg */}
      <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:48px_48px] opacity-100" />
      {/* Radial vignette */}
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />

      {/* Animated pulse rings for "alive" feel */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/[0.04]"
            animate={{
              width: [100 + i * 160, 200 + i * 160],
              height: [100 + i * 160, 200 + i * 160],
              opacity: [0.4, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 1.3,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Drifting blobs */}
      <motion.div
        className="pointer-events-none absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white/[0.015] blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-white/[0.01] blur-3xl"
        animate={{ x: [0, -25, 0], y: [0, 15, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-void to-transparent" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="eyebrow mb-6"
        >
          Available for freelance · Cotabato City, PH
        </motion.p>

        <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl md:text-8xl">
          {settings.name.split("").map((char, i) => (
            <span key={i} className="inline-block overflow-hidden">
              <motion.span
                custom={i}
                initial="hidden"
                animate="visible"
                variants={letterVariants}
                className={`inline-block ${char === " " ? "w-4 md:w-6" : "text-white"}`}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="mt-6"
        >
          <TypingTagline roles={roles} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-primary shadow-glow-white"
          >
            View Projects
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-ghost"
          >
            Contact Me
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">Scroll</span>
        <div className="h-9 w-5 rounded-full border border-white/20 p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-white"
          />
        </div>
      </motion.div>
    </section>
  );
}
