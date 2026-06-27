"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
} from "framer-motion";
import type { SiteSettings, Skill } from "@/types";

const ICONS: Record<string, JSX.Element> = {
  github: (
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.13-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.27 5.69.42.36.78 1.07.78 2.16 0 1.56-.01 2.81-.01 3.19 0 .31.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  ),
  email: (
    <path d="M2.5 4.75A1.25 1.25 0 0 1 3.75 3.5h16.5a1.25 1.25 0 0 1 1.25 1.25v14.5a1.25 1.25 0 0 1-1.25 1.25H3.75a1.25 1.25 0 0 1-1.25-1.25V4.75Zm1.94.25 7.07 5.66a.75.75 0 0 0 .94 0L19.56 5H4.44ZM4 6.4v12.1h16V6.4l-7.13 5.7a2.25 2.25 0 0 1-2.74 0L4 6.4Z" />
  ),
  facebook: (
    <path d="M13.5 22v-8h2.7l.5-3.2h-3.2V8.4c0-.93.26-1.56 1.6-1.56h1.7V4a18 18 0 0 0-2.45-.13c-2.42 0-4.08 1.48-4.08 4.2v2.65H7.5V13h2.75v9h3.25Z" />
  ),
};

export default function ProfileCard({
  settings,
  skills,
}: {
  settings: SiteSettings;
  skills: Skill[];
}) {
  const [flipped, setFlipped] = useState(false);
  const [dragging, setDragging] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const springX = useSpring(px, { stiffness: 100, damping: 14 });
  const springY = useSpring(py, { stiffness: 100, damping: 14 });
  const tiltZ = useTransform(springX, [-1, 1], [-8, 8]);
  const tiltX = useTransform(springY, [-1, 1], [6, -6]);

  const swingAngle = useMotionValue(0);
  const swingSpring = useSpring(swingAngle, { stiffness: 60, damping: 8 });

  function handleClick() {
    if (dragging) return;
    animate(swingAngle, 18, { duration: 0.12, ease: "easeOut" }).then(() => {
      animate(swingAngle, -14, { duration: 0.22, ease: "easeOut" }).then(() => {
        animate(swingAngle, 8, { duration: 0.18 }).then(() => {
          animate(swingAngle, -4, { duration: 0.14 }).then(() => {
            animate(swingAngle, 0, { duration: 0.3, ease: "easeOut" });
          });
        });
      });
    });
    setFlipped((f) => !f);
  }

  function handlePointerMove(e: React.PointerEvent) {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    px.set(x * 2);
    py.set(y * 2);
  }

  function handlePointerLeave() {
    px.set(0);
    py.set(0);
  }

  useEffect(() => {
    let cancelled = false;
    function sway() {
      if (cancelled) return;
      animate(swingAngle, 2.5, { duration: 2.8, ease: "easeInOut" }).then(() => {
        if (cancelled) return;
        animate(swingAngle, -2.5, { duration: 2.8, ease: "easeInOut" }).then(() => {
          if (cancelled) return;
          sway();
        });
      });
    }
    const t = setTimeout(sway, 1000);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [swingAngle]);

  const socials = [
    settings.githubUrl && { label: "GitHub", href: settings.githubUrl, icon: ICONS.github },
    settings.email && { label: "Email", href: `mailto:${settings.email}`, icon: ICONS.email },
    settings.facebookUrl && { label: "Facebook", href: settings.facebookUrl, icon: ICONS.facebook },
  ].filter(Boolean) as { label: string; href: string; icon: JSX.Element }[];

  const topSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 8);
  const initials = settings.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section id="profile" className="relative px-6 py-24">
      <div className="mx-auto w-full max-w-6xl">
        <p className="eyebrow mb-2">Digital identity</p>
        <h2 className="mb-16 font-display text-3xl font-bold sm:text-4xl text-white">
          Who I am
        </h2>

        {/* Side-by-side layout */}
        <div className="flex flex-col items-center gap-14 lg:flex-row lg:items-start lg:gap-20">

          {/* LEFT — ID Card with lanyard */}
          <div className="flex flex-col items-center flex-shrink-0">
            {/* Lanyard */}
            <div
              className="h-28 w-3 rounded-b-sm sm:h-36"
              style={{
                background: "repeating-linear-gradient(135deg, #ffffff 0 8px, #333 8px 16px)",
                boxShadow: "0 0 10px rgba(255,255,255,0.1)",
              }}
            />
            {/* Clip */}
            <div className="z-10 -mt-2 h-4 w-8 rounded-md border border-white/20 bg-surface-2 shadow-glass" />

            {/* Card */}
            <div
              ref={wrapperRef}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              style={{ perspective: 1200 }}
              className="-mt-1"
            >
              <motion.div style={{ rotate: swingSpring, transformOrigin: "top center" }}>
                <motion.div style={{ rotateZ: tiltZ, rotateX: tiltX, transformOrigin: "top center" }}>
                  <motion.div
                    ref={cardRef}
                    onClick={handleClick}
                    whileHover={{ y: -4 }}
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    className="relative h-[420px] w-72 cursor-pointer select-none"
                  >
                    {/* FRONT */}
                    <div
                      style={{ backfaceVisibility: "hidden" }}
                      className="glass-strong bw-border absolute inset-0 flex flex-col items-center gap-4 p-6 shadow-glow-white"
                    >
                      <span className="eyebrow self-start">ID · 0xJ4M3L</span>
                      <div className="relative mt-2 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-gradient-to-br from-surface-2 to-surface shadow-glow-sm">
                        {settings.profileImage ? (
                          <Image
                            src={settings.profileImage}
                            alt={settings.name}
                            fill
                            className="object-cover"
                            unoptimized={settings.profileImage.startsWith("/uploads")}
                          />
                        ) : (
                          <span className="font-display text-4xl font-bold text-white">{initials}</span>
                        )}
                      </div>
                      <div className="text-center">
                        <h3 className="font-display text-xl font-bold text-white">{settings.name}</h3>
                        <p className="font-mono text-xs uppercase tracking-wider text-white/50">{settings.role}</p>
                      </div>
                      {socials.length > 0 && (
                        <div className="mt-1 flex gap-4">
                          {socials.map((s) => (
                            <a
                              key={s.label}
                              href={s.href}
                              target={s.href.startsWith("http") ? "_blank" : undefined}
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={s.label}
                              className="text-white/40 transition-colors hover:text-white"
                            >
                              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                                {s.icon}
                              </svg>
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="mt-auto w-full border-t border-white/10 pt-4">
                        <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                          Tap to flip
                        </p>
                      </div>
                    </div>

                    {/* BACK */}
                    <div
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                      className="glass-strong bw-border absolute inset-0 flex flex-col gap-4 p-6"
                    >
                      <span className="eyebrow">Stack</span>
                      {topSkills.length > 0 ? (
                        <ul className="flex flex-wrap gap-2 font-mono text-[11px]">
                          {topSkills.map((s) => (
                            <li
                              key={s.id}
                              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70"
                            >
                              {s.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="font-mono text-xs text-white/40">Add skills from the admin.</p>
                      )}
                      <p className="text-sm leading-relaxed text-white/60">
                        3rd-year BSCS student building production-ready PHP/MySQL apps and freelance
                        projects, currently exploring Next.js, 3D web, and Linux system tinkering.
                      </p>
                      <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Status</p>
                        <p className="mt-1 text-sm text-white/80">{settings.status}</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* RIGHT — About content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="flex flex-col gap-8 lg:pt-40"
          >
            {/* Headline */}
            <div>
              <h3 className="font-display text-2xl font-bold text-white sm:text-3xl leading-tight">
                Aspiring Full Stack Developer
                <br />
                <span className="text-white/40 text-lg sm:text-xl font-normal">building real things while still in school.</span>
              </h3>
            </div>

            {/* Bio paragraphs */}
            <div className="flex flex-col gap-4 max-w-lg">
              <p className="text-white/55 leading-relaxed">
                I'm a 3rd-year BSCS student from Cotabato City, PH. I've been shipping
                production-level PHP/MySQL web apps since my sophomore year — including a file-sharing
                platform, a team collaboration tool, and an e-commerce storefront.
              </p>
              <p className="text-white/55 leading-relaxed">
                Right now I'm leveling up into the JavaScript/TypeScript ecosystem, learning Next.js, 
                experimenting with 3D web graphics, and tinkering with Linux servers on the side.
                I learn fastest when I build real things for real users.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6">
              {[
                { label: "Projects shipped", value: "4+" },
                { label: "Years coding", value: "3" },
                { label: "Stack growing", value: "∞" },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="font-display text-3xl font-bold text-white">{value}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/35">{label}</span>
                </div>
              ))}
            </div>

            {/* Currently tag */}
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-30" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white/60" />
              </span>
              <p className="font-mono text-xs text-white/40 uppercase tracking-widest">
                {settings.status || "Open to freelance & internship work"}
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
