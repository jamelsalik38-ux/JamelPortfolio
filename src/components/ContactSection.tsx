"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "./Button";
import type { SiteSettings } from "@/types";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactSection({ settings }: { settings: SiteSettings }) {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const socialLinks = [
    settings.githubUrl && { label: "GitHub", href: settings.githubUrl },
    settings.email && { label: "Email", href: `mailto:${settings.email}` },
    settings.facebookUrl && { label: "Facebook", href: settings.facebookUrl },
    settings.resumeUrl && { label: "Resume (PDF)", href: settings.resumeUrl },
  ].filter(Boolean) as { label: string; href: string }[];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="section-pad">
      <p className="eyebrow mb-2">Let&rsquo;s build something</p>
      <h2 className="mb-12 font-display text-3xl font-bold text-white sm:text-4xl">Contact</h2>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-6">
          <p className="max-w-sm text-white/50">
            Got a project, an internship slot, or just want to talk PHP vs. Next.js? My inbox is open.
          </p>
          <div className="flex flex-col gap-3">
            {socialLinks.length === 0 ? (
              <p className="font-mono text-xs text-white/40">No links yet — add from the admin dashboard.</p>
            ) : (
              socialLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  whileHover={{ x: 4, borderColor: "rgba(255,255,255,0.25)" }}
                  whileTap={{ scale: 0.98 }}
                  className="glass flex items-center justify-between px-5 py-4 font-mono text-sm text-white/50 transition-colors hover:text-white"
                >
                  {link.label}
                  <span aria-hidden>↗</span>
                </motion.a>
              ))
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong flex flex-col gap-5 p-6 sm:p-8 border border-white/10">
          {(["name", "email", "message"] as const).map((field) => (
            <div key={field} className="flex flex-col gap-1.5">
              <label
                htmlFor={field}
                className="font-mono text-xs uppercase tracking-wider text-white/40"
              >
                {field}
              </label>
              {field === "message" ? (
                <textarea
                  id={field}
                  required
                  rows={4}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="resize-none rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white/80 outline-none transition-colors focus:border-white/30 placeholder:text-white/20"
                  placeholder="Tell me about the project..."
                />
              ) : (
                <input
                  id={field}
                  type={field === "email" ? "email" : "text"}
                  required
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white/80 outline-none transition-colors focus:border-white/30 placeholder:text-white/20"
                  placeholder={field === "email" ? "you@example.com" : "Your name"}
                />
              )}
            </div>
          ))}

          <Button type="submit" disabled={status === "loading"} className="self-start">
            <motion.span key={status} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
              {status === "loading" ? "Sending..." : status === "success" ? "Sent ✓" : "Send Message"}
            </motion.span>
          </Button>

          {status === "error" && (
            <p className="font-mono text-xs text-red-400">Something went wrong — try again, or email me directly.</p>
          )}
        </form>
      </div>
    </section>
  );
}
