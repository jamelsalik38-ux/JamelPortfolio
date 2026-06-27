"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LINKS = [
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#certificates", label: "Certificates" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar({ resumeUrl }: { resumeUrl?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={`flex w-full max-w-3xl items-center justify-between rounded-full border px-5 py-3 transition-all duration-300 ${
          scrolled
            ? "border-white/10 bg-black/70 backdrop-blur-xl shadow-glass"
            : "border-transparent bg-transparent"
        }`}
      >
        <a href="#home" className="font-display text-sm font-bold tracking-wide text-white">
          jamel<span className="text-white/40">.</span>dev
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative font-mono text-xs uppercase tracking-wider text-white/40 transition-colors hover:text-white group"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs uppercase tracking-wider text-white/40 transition-colors hover:text-white"
            >
              Resume
            </a>
          )}
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-full bg-white px-4 py-2 font-mono text-xs font-medium text-black transition-opacity hover:opacity-80"
          >
            Hire me
          </motion.a>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span className={`h-0.5 w-5 bg-white transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-5 bg-white transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-5 bg-white transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-strong absolute left-4 right-4 top-20 flex flex-col gap-4 p-6 md:hidden border border-white/10"
          >
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-mono text-sm uppercase tracking-wider text-white/60 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="font-mono text-sm uppercase tracking-wider text-white/60 hover:text-white transition-colors"
              >
                Resume
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
