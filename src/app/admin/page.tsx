"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Access denied.");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 overflow-hidden">
      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:48px_48px] opacity-40" />

      {/* Corner brackets decoration */}
      <div className="pointer-events-none absolute inset-8 hidden sm:block">
        {/* TL */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/15" />
        {/* TR */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/15" />
        {/* BL */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/15" />
        {/* BR */}
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/15" />
      </div>

      {/* Ambient blob */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-white/[0.015] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30 mb-3">
            Restricted area
          </p>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl border border-white/10 bg-white/[0.04] mb-4">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/50 fill-current">
              <path d="M12 2C9.24 2 7 4.24 7 7v1H5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-2V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v1H9V7c0-1.66 1.34-3 3-3zm0 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Login</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-strong flex flex-col gap-5 p-6 border border-white/[0.08]"
        >
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="font-mono text-[10px] uppercase tracking-widest text-white/35">
              Username
            </label>
            <input
              id="username"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all focus:border-white/30 focus:bg-white/[0.05] placeholder:text-white/15 font-mono"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="font-mono text-[10px] uppercase tracking-widest text-white/35">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 pr-11 text-sm text-white outline-none transition-all focus:border-white/30 focus:bg-white/[0.05] placeholder:text-white/15 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                tabIndex={-1}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  {showPass
                    ? <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    : <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  }
                </svg>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-xs text-red-400 border border-red-400/20 bg-red-400/5 px-3 py-2 rounded-lg"
            >
              ✕ {error}
            </motion.p>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            className="mt-1 w-full rounded-full bg-white py-3 font-mono text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Authenticating...
              </span>
            ) : "Sign in"}
          </motion.button>
        </form>

        <p className="mt-4 text-center font-mono text-[10px] text-white/20 uppercase tracking-widest">
          jamel.dev · control panel
        </p>
      </motion.div>
    </div>
  );
}
