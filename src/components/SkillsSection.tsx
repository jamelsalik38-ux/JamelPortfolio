"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Skill } from "@/types";

const FILTERS = ["All", "Language", "Framework/Library", "Database", "Tool", "Other"] as const;

// Brand colors per tech
const TECH_COLORS: Record<string, { color: string; glow: string; bg: string }> = {
  php:               { color: "#8892BF", glow: "rgba(136,146,191,0.45)", bg: "rgba(136,146,191,0.1)" },
  javascript:        { color: "#F7DF1E", glow: "rgba(247,223,30,0.45)",  bg: "rgba(247,223,30,0.1)"  },
  typescript:        { color: "#3178C6", glow: "rgba(49,120,198,0.45)",  bg: "rgba(49,120,198,0.1)"  },
  html:              { color: "#E34F26", glow: "rgba(227,79,38,0.45)",   bg: "rgba(227,79,38,0.1)"   },
  css:               { color: "#1572B6", glow: "rgba(21,114,182,0.45)",  bg: "rgba(21,114,182,0.1)"  },
  python:            { color: "#3776AB", glow: "rgba(55,118,171,0.45)",  bg: "rgba(55,118,171,0.1)"  },
  "next.js":         { color: "#FFFFFF", glow: "rgba(255,255,255,0.3)",  bg: "rgba(255,255,255,0.07)"},
  nextjs:            { color: "#FFFFFF", glow: "rgba(255,255,255,0.3)",  bg: "rgba(255,255,255,0.07)"},
  react:             { color: "#61DAFB", glow: "rgba(97,218,251,0.45)",  bg: "rgba(97,218,251,0.1)"  },
  tailwind:          { color: "#06B6D4", glow: "rgba(6,182,212,0.45)",   bg: "rgba(6,182,212,0.1)"   },
  "tailwind css":    { color: "#06B6D4", glow: "rgba(6,182,212,0.45)",   bg: "rgba(6,182,212,0.1)"   },
  mysql:             { color: "#4479A1", glow: "rgba(68,121,161,0.45)",  bg: "rgba(68,121,161,0.1)"  },
  mongodb:           { color: "#47A248", glow: "rgba(71,162,72,0.45)",   bg: "rgba(71,162,72,0.1)"   },
  git:               { color: "#F05032", glow: "rgba(240,80,50,0.45)",   bg: "rgba(240,80,50,0.1)"   },
  linux:             { color: "#FCC624", glow: "rgba(252,198,36,0.45)",  bg: "rgba(252,198,36,0.1)"  },
  docker:            { color: "#2496ED", glow: "rgba(36,150,237,0.45)",  bg: "rgba(36,150,237,0.1)"  },
  vscode:            { color: "#007ACC", glow: "rgba(0,122,204,0.45)",   bg: "rgba(0,122,204,0.1)"   },
  "vs code":         { color: "#007ACC", glow: "rgba(0,122,204,0.45)",   bg: "rgba(0,122,204,0.1)"   },
  node:              { color: "#339933", glow: "rgba(51,153,51,0.45)",   bg: "rgba(51,153,51,0.1)"   },
  "node.js":         { color: "#339933", glow: "rgba(51,153,51,0.45)",   bg: "rgba(51,153,51,0.1)"   },
  figma:             { color: "#F24E1E", glow: "rgba(242,78,30,0.45)",   bg: "rgba(242,78,30,0.1)"   },
  firebase:          { color: "#FFCA28", glow: "rgba(255,202,40,0.45)",  bg: "rgba(255,202,40,0.1)"  },
  supabase:          { color: "#3ECF8E", glow: "rgba(62,207,142,0.45)",  bg: "rgba(62,207,142,0.1)"  },
  framer:            { color: "#0055FF", glow: "rgba(0,85,255,0.45)",    bg: "rgba(0,85,255,0.1)"    },
  gsap:              { color: "#88CE02", glow: "rgba(136,206,2,0.45)",   bg: "rgba(136,206,2,0.1)"   },
  "three.js":        { color: "#FFFFFF", glow: "rgba(255,255,255,0.3)",  bg: "rgba(255,255,255,0.07)"},
  wordpress:         { color: "#21759B", glow: "rgba(33,117,155,0.45)",  bg: "rgba(33,117,155,0.1)"  },
  laravel:           { color: "#FF2D20", glow: "rgba(255,45,32,0.45)",   bg: "rgba(255,45,32,0.1)"   },
  vue:               { color: "#4FC08D", glow: "rgba(79,192,141,0.45)",  bg: "rgba(79,192,141,0.1)"  },
  "vue.js":          { color: "#4FC08D", glow: "rgba(79,192,141,0.45)",  bg: "rgba(79,192,141,0.1)"  },
  angular:           { color: "#DD0031", glow: "rgba(221,0,49,0.45)",    bg: "rgba(221,0,49,0.1)"    },
  sass:              { color: "#CC6699", glow: "rgba(204,102,153,0.45)", bg: "rgba(204,102,153,0.1)" },
  redis:             { color: "#DC382D", glow: "rgba(220,56,45,0.45)",   bg: "rgba(220,56,45,0.1)"   },
  postgresql:        { color: "#4169E1", glow: "rgba(65,105,225,0.45)",  bg: "rgba(65,105,225,0.1)"  },
  postgres:          { color: "#4169E1", glow: "rgba(65,105,225,0.45)",  bg: "rgba(65,105,225,0.1)"  },
  sqlite:            { color: "#003B57", glow: "rgba(0,59,87,0.45)",     bg: "rgba(0,59,87,0.1)"     },
  aws:               { color: "#FF9900", glow: "rgba(255,153,0,0.45)",   bg: "rgba(255,153,0,0.1)"   },
  vercel:            { color: "#FFFFFF", glow: "rgba(255,255,255,0.3)",  bg: "rgba(255,255,255,0.07)"},
  github:            { color: "#FFFFFF", glow: "rgba(255,255,255,0.3)",  bg: "rgba(255,255,255,0.07)"},
  graphql:           { color: "#E10098", glow: "rgba(225,0,152,0.45)",   bg: "rgba(225,0,152,0.1)"   },
  rust:              { color: "#CE412B", glow: "rgba(206,65,43,0.45)",   bg: "rgba(206,65,43,0.1)"   },
  go:                { color: "#00ADD8", glow: "rgba(0,173,216,0.45)",   bg: "rgba(0,173,216,0.1)"   },
  java:              { color: "#ED8B00", glow: "rgba(237,139,0,0.45)",   bg: "rgba(237,139,0,0.1)"   },
  kotlin:            { color: "#7F52FF", glow: "rgba(127,82,255,0.45)",  bg: "rgba(127,82,255,0.1)"  },
  swift:             { color: "#FA7343", glow: "rgba(250,115,67,0.45)",  bg: "rgba(250,115,67,0.1)"  },
};

const DEFAULT_STYLE = { color: "#FFFFFF", glow: "rgba(255,255,255,0.2)", bg: "rgba(255,255,255,0.05)" };

function getTechStyle(name: string) {
  const key = name.toLowerCase().trim();
  if (TECH_COLORS[key]) return TECH_COLORS[key];
  for (const k of Object.keys(TECH_COLORS)) {
    if (key.includes(k) || k.includes(key)) return TECH_COLORS[k];
  }
  return DEFAULT_STYLE;
}

// SVG tech icons by skill name (lowercase)
const TECH_ICONS: Record<string, (color: string) => JSX.Element> = {
  php: (c) => (
    <svg viewBox="0 0 128 128" className="w-8 h-8">
      <ellipse cx="64" cy="64" rx="60" ry="60" fill={c} opacity=".15"/>
      <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fontSize="36" fontWeight="800" fontFamily="monospace" fill={c}>PHP</text>
    </svg>
  ),
  javascript: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8">
      <rect width="32" height="32" rx="5" fill={c} opacity=".2"/>
      <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fontWeight="900" fontFamily="monospace" fill={c}>JS</text>
    </svg>
  ),
  typescript: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8">
      <rect width="32" height="32" rx="5" fill={c} opacity=".2"/>
      <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fontSize="13" fontWeight="900" fontFamily="monospace" fill={c}>TS</text>
    </svg>
  ),
  html: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8">
      <polygon points="3,2 6,28 16,31 26,28 29,2" fill={c} opacity=".2"/>
      <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" fontSize="7.5" fontWeight="900" fontFamily="monospace" fill={c}>HTML5</text>
    </svg>
  ),
  css: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8">
      <polygon points="3,2 6,28 16,31 26,28 29,2" fill={c} opacity=".2"/>
      <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fontWeight="900" fontFamily="monospace" fill={c}>CSS3</text>
    </svg>
  ),
  python: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8">
      <circle cx="16" cy="16" r="14" fill={c} opacity=".15"/>
      <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fontSize="9.5" fontWeight="800" fontFamily="monospace" fill={c}>PY</text>
    </svg>
  ),
  react: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8">
      <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke={c} strokeWidth="1.5" opacity=".7"/>
      <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke={c} strokeWidth="1.5" opacity=".7" transform="rotate(60 16 16)"/>
      <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke={c} strokeWidth="1.5" opacity=".7" transform="rotate(120 16 16)"/>
      <circle cx="16" cy="16" r="2.5" fill={c}/>
    </svg>
  ),
  tailwind: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill={c}>
      <path d="M16 7c-2.4 0-4 1.2-4.8 3.6 1.2-2.4 2.4-3 4-2.8.96.12 1.64.96 2.4 1.8C18.8 11.16 20.12 12 22.4 12c2.4 0 4-1.2 4.8-3.6-1.2 2.4-2.4 3-4 2.8-.96-.12-1.64-.96-2.4-1.8C19.6 7.84 18.28 7 16 7zm-4.8 9.6c-2.4 0-4 1.2-4.8 3.6 1.2-2.4 2.4-3 4-2.8.96.12 1.64.96 2.4 1.8 1.2 1.36 2.52 2.2 4.8 2.2 2.4 0 4-1.2 4.8-3.6-1.2 2.4-2.4 3-4 2.8-.96-.12-1.64-.96-2.4-1.8-1.2-1.36-2.52-2.2-4.8-2.2z"/>
    </svg>
  ),
  "tailwind css": (c) => TECH_ICONS["tailwind"](c),
  mysql: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8">
      <ellipse cx="16" cy="8" rx="12" ry="4" fill={c} opacity=".25"/>
      <path d="M4 8v16c0 2.2 5.4 4 12 4s12-1.8 12-4V8" fill="none" stroke={c} strokeWidth="1.5" opacity=".7"/>
      <path d="M4 16c0 2.2 5.4 4 12 4s12-1.8 12-4" fill="none" stroke={c} strokeWidth="1.2" opacity=".4"/>
    </svg>
  ),
  mongodb: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8">
      <path d="M16 2c-.5 0-1 .3-1 1l-1 18 2 2 2-2-1-18c0-.7-.5-1-1-1z" fill={c}/>
      <path d="M16 21c-3-1-8-4-8-9.5C8 6.4 11.6 3 16 3s8 3.4 8 8.5c0 5.5-5 8.5-8 9.5z" fill={c} opacity=".35"/>
      <ellipse cx="16" cy="26" rx="2" ry="3" fill={c} opacity=".65"/>
    </svg>
  ),
  git: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill={c}>
      <path d="M29.5 14.5L17.5 2.5a1.7 1.7 0 0 0-2.4 0l-2.4 2.4 3 3a2 2 0 0 1 2.6 2.6l2.9 2.9a2 2 0 1 1-1.2 1.2l-2.7-2.7v7.1a2 2 0 1 1-1.6 0V11.8a2 2 0 0 1-1.1-2.6L11.7 6.3l-9.2 9.2a1.7 1.7 0 0 0 0 2.4l12 12a1.7 1.7 0 0 0 2.4 0l12.6-12.6a1.7 1.7 0 0 0 0-2.8z"/>
    </svg>
  ),
  linux: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8">
      <ellipse cx="16" cy="13" rx="7" ry="9" fill={c} opacity=".2" stroke={c} strokeWidth="1.2"/>
      <circle cx="13" cy="11" r="1.5" fill={c}/>
      <circle cx="19" cy="11" r="1.5" fill={c}/>
      <path d="M13 15s1.5 2 3 2 3-2 3-2" stroke={c} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M9 22s2-4 7-4 7 4 7 4" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  docker: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill={c}>
      <rect x="3" y="12" width="4" height="3" rx=".5"/>
      <rect x="8.5" y="12" width="4" height="3" rx=".5"/>
      <rect x="14" y="12" width="4" height="3" rx=".5"/>
      <rect x="14" y="7" width="4" height="3" rx=".5"/>
      <rect x="8.5" y="7" width="4" height="3" rx=".5"/>
      <rect x="19.5" y="12" width="4" height="3" rx=".5"/>
      <path d="M29 16.5c-.5-1.5-2-2-3.5-1.5-.5-2.5-2.5-4-5-4H4c-.5 2.5 0 5 1.5 7s4 3 6.5 3h8c2.5 0 4.5-1.5 5.5-3.5 1.5.5 3 0 3.5-1z" opacity=".4"/>
    </svg>
  ),
  vscode: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill={c}>
      <path d="M24 4L12.5 15.5 6 10 2 12l6 4-6 4 4 2 6.5-5.5L24 28l6-3V7l-6-3zm0 18.5L14.5 16 24 9.5v13z"/>
    </svg>
  ),
  "vs code": (c) => TECH_ICONS["vscode"](c),
  "next.js": (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8">
      <circle cx="16" cy="16" r="14" fill={c} opacity=".12"/>
      <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fontSize="8" fontWeight="900" fontFamily="monospace" fill={c}>NEXT</text>
    </svg>
  ),
  nextjs: (c) => TECH_ICONS["next.js"](c),
  figma: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill={c}>
      <rect x="10" y="2" width="12" height="8" rx="4" opacity=".9"/>
      <rect x="10" y="12" width="6" height="8" rx="3" opacity=".7"/>
      <circle cx="19" cy="16" r="3" opacity=".9"/>
      <rect x="10" y="22" width="6" height="8" rx="3" opacity=".5"/>
    </svg>
  ),
  node: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill={c}>
      <path d="M16 2L3 9.5v13L16 30l13-7.5v-13L16 2zm0 3.5l9.5 5.5v11L16 27.5 6.5 22v-11L16 5.5z" opacity=".4"/>
      <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fontSize="6.5" fontWeight="900" fontFamily="monospace" fill={c}>NODE</text>
    </svg>
  ),
  "node.js": (c) => TECH_ICONS["node"](c),
  laravel: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill={c}>
      <path d="M30 7.5c.1.4 0 .8-.2 1.1L22 18.2l.1 7.5c0 .5-.3 1-.7 1.2l-4.5 2.7c-.2.1-.4.1-.6 0-.2-.1-.3-.3-.3-.5v-7.4L4.2 10.9c-.3-.3-.4-.8-.2-1.2.2-.4.6-.6 1-.5l16 2.7 6.3-5.3c.3-.3.8-.4 1.2-.2.4.2.6.6.5 1.1z" opacity=".85"/>
    </svg>
  ),
  vue: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill={c}>
      <polygon points="16,28 2,4 8,4 16,18 24,4 30,4" opacity=".9"/>
      <polygon points="16,20 8.5,7 12,7 16,14 20,7 23.5,7" opacity=".5"/>
    </svg>
  ),
  "vue.js": (c) => TECH_ICONS["vue"](c),
  firebase: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill={c}>
      <path d="M5 24L10 4l5.5 10L10 18z" opacity=".5"/>
      <path d="M13 16l4-12 4 8z" opacity=".8"/>
      <path d="M5 24l22-8-9-12-3 8-5-8-5 20z" opacity=".35"/>
    </svg>
  ),
  graphql: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill={c}>
      <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="none" stroke={c} strokeWidth="1.5" opacity=".7"/>
      <circle cx="16" cy="2" r="2" opacity=".9"/>
      <circle cx="28" cy="9" r="2" opacity=".9"/>
      <circle cx="28" cy="23" r="2" opacity=".9"/>
      <circle cx="16" cy="30" r="2" opacity=".9"/>
      <circle cx="4" cy="23" r="2" opacity=".9"/>
      <circle cx="4" cy="9" r="2" opacity=".9"/>
      <circle cx="16" cy="16" r="3" opacity=".7"/>
    </svg>
  ),
  sass: (c) => (
    <svg viewBox="0 0 32 32" className="w-8 h-8">
      <circle cx="16" cy="16" r="14" fill={c} opacity=".15"/>
      <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fontWeight="900" fontFamily="monospace" fill={c}>SASS</text>
    </svg>
  ),
};

function getIcon(name: string, color: string): JSX.Element {
  const key = name.toLowerCase().trim();
  if (TECH_ICONS[key]) return TECH_ICONS[key](color);
  for (const k of Object.keys(TECH_ICONS)) {
    if (key.includes(k) || k.includes(key)) return TECH_ICONS[k](color);
  }
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <svg viewBox="0 0 32 32" className="w-8 h-8">
      <rect width="32" height="32" rx="6" fill={color} opacity=".15"/>
      <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fontSize={initials.length > 2 ? "9" : "13"} fontWeight="800" fontFamily="monospace" fill={color}>{initials}</text>
    </svg>
  );
}

function OrbitRing({
  skills,
  radius,
  duration,
  direction = 1,
  iconSize = 36,
}: {
  skills: Skill[];
  radius: number;
  duration: number;
  direction?: number;
  iconSize?: number;
}) {
  const angleStep = (2 * Math.PI) / skills.length;

  return (
    <motion.div
      className="absolute inset-0"
      animate={{ rotate: direction * 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
      style={{ transformOrigin: "center center" }}
    >
      {skills.map((skill, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const style = getTechStyle(skill.name);

        return (
          <motion.div
            key={skill.id}
            className="absolute flex flex-col items-center gap-1 cursor-default group"
            style={{
              left: `calc(50% + ${x}px - ${iconSize / 2}px)`,
              top: `calc(50% + ${y}px - ${iconSize / 2}px)`,
              width: iconSize,
              height: iconSize,
            }}
            animate={{ rotate: direction * -360 }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
          >
            <div
              className="relative flex items-center justify-center w-full h-full rounded-xl border transition-all duration-300"
              style={{
                background: style.bg,
                borderColor: `${style.color}30`,
                color: style.color,
                boxShadow: `0 0 0px ${style.glow}`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 18px ${style.glow}, 0 0 6px ${style.glow}`;
                (e.currentTarget as HTMLDivElement).style.borderColor = `${style.color}80`;
                (e.currentTarget as HTMLDivElement).style.background = style.bg.replace("0.1)", "0.2)").replace("0.07)", "0.14)");
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0px ${style.glow}`;
                (e.currentTarget as HTMLDivElement).style.borderColor = `${style.color}30`;
                (e.currentTarget as HTMLDivElement).style.background = style.bg;
              }}
            >
              {getIcon(skill.name, style.color)}
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                <span
                  className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border"
                  style={{
                    color: style.color,
                    background: "rgba(0,0,0,0.85)",
                    borderColor: `${style.color}40`,
                    boxShadow: `0 0 8px ${style.glow}`,
                  }}
                >
                  {skill.name}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default function SkillsSection({ skills }: { skills: Skill[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const categoriesPresent = useMemo(() => new Set(skills.map((s) => s.category)), [skills]);
  const visibleFilters = FILTERS.filter((f) => f === "All" || categoriesPresent.has(f));
  const filtered = useMemo(
    () => (filter === "All" ? skills : skills.filter((s) => s.category === filter)),
    [skills, filter]
  );

  if (skills.length === 0) return null;

  const ring1 = filtered.slice(0, Math.min(6, filtered.length));
  const ring2 = filtered.length > 6 ? filtered.slice(6, Math.min(12, filtered.length)) : [];
  const ring3 = filtered.length > 12 ? filtered.slice(12, Math.min(20, filtered.length)) : [];

  const orbitSize = 340;

  return (
    <section id="skills" className="section-pad">
      <p className="eyebrow mb-2">Toolbox</p>
      <h2 className="mb-8 font-display text-3xl font-bold text-white sm:text-4xl">Skills</h2>

      {visibleFilters.length > 2 && (
        <div className="mb-14 flex flex-wrap gap-2">
          {visibleFilters.map((f) => (
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
                  layoutId="skill-filter-pill"
                  className="absolute inset-0 rounded-full bg-white"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{f}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Orbit system */}
      <div className="flex items-center justify-center">
        <div
          className="relative flex items-center justify-center"
          style={{ width: orbitSize, height: orbitSize }}
        >
          {/* Background glow blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full blur-3xl opacity-10"
              style={{ background: "radial-gradient(circle, #61DAFB, transparent)" }} />
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full blur-3xl opacity-10"
              style={{ background: "radial-gradient(circle, #8892BF, transparent)" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-3xl opacity-5"
              style={{ background: "radial-gradient(circle, #F7DF1E, transparent)" }} />
          </div>

          {/* Orbit tracks */}
          {ring1.length > 0 && (
            <div className="absolute rounded-full border border-white/[0.06]"
              style={{ width: 200, height: 200, left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
          )}
          {ring2.length > 0 && (
            <div className="absolute rounded-full border border-white/[0.04]"
              style={{ width: 290, height: 290, left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
          )}
          {ring3.length > 0 && (
            <div className="absolute rounded-full border border-white/[0.03]"
              style={{ width: 340, height: 340, left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
          )}

          {/* Center glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06), transparent)" }}>
              <div className="w-8 h-8 rounded-full animate-pulse"
                style={{ background: "radial-gradient(circle, rgba(255,255,255,0.15), transparent)" }} />
            </div>
          </div>

          {/* Orbit rings */}
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              {ring1.length > 0 && (
                <OrbitRing skills={ring1} radius={100} duration={22} direction={1} iconSize={36} />
              )}
              {ring2.length > 0 && (
                <OrbitRing skills={ring2} radius={145} duration={34} direction={-1} iconSize={34} />
              )}
              {ring3.length > 0 && (
                <OrbitRing skills={ring3} radius={170} duration={50} direction={1} iconSize={30} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Legend list below */}
      <motion.div
        key={filter + "-list"}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-10 flex flex-wrap justify-center gap-2"
      >
        {filtered.map((skill) => {
          const style = getTechStyle(skill.name);
          return (
            <span
              key={skill.id}
              className="rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-default"
              style={{
                color: `${style.color}99`,
                background: style.bg,
                border: `1px solid ${style.color}25`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLSpanElement).style.color = style.color;
                (e.currentTarget as HTMLSpanElement).style.borderColor = `${style.color}60`;
                (e.currentTarget as HTMLSpanElement).style.boxShadow = `0 0 10px ${style.glow}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLSpanElement).style.color = `${style.color}99`;
                (e.currentTarget as HTMLSpanElement).style.borderColor = `${style.color}25`;
                (e.currentTarget as HTMLSpanElement).style.boxShadow = "none";
              }}
            >
              {skill.name}
            </span>
          );
        })}
      </motion.div>
    </section>
  );
}
