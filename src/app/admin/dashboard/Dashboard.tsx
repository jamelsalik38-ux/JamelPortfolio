"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Project, Certificate, Skill, SiteSettings } from "@/types";

type Tab = "profile" | "projects" | "skills" | "certificates" | "analytics";

const TABS: { id: Tab; label: string; icon: JSX.Element }[] = [
  {
    id: "profile",
    label: "Profile",
    icon: <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>,
  },
  {
    id: "projects",
    label: "Projects",
    icon: <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>,
  },
  {
    id: "skills",
    label: "Skills",
    icon: <path d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.34 8-7 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm0-4h-2c0-3.25 3-3 3-5 0-1.1-.9-2-2-2s-2 .9-2 2h-2c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.5-3 2.75-3 5z"/>,
  },
  {
    id: "certificates",
    label: "Certs",
    icon: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>,
  },
  {
    id: "analytics",
    label: "Stats",
    icon: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>,
  },
];

const EMPTY_PROJECT = {
  id: null as string | null,
  title: "",
  description: "",
  image: "",
  techText: "",
  github: "",
  demo: "",
  featured: false,
};

const EMPTY_CERT = {
  id: null as string | null,
  title: "",
  issuer: "",
  category: "Web Dev" as Certificate["category"],
  image: "",
  issuedAt: new Date().toISOString().slice(0, 10),
};

const EMPTY_SKILL = {
  id: null as string | null,
  name: "",
  category: "Language" as Skill["category"],
  level: 70,
};

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url;
}

const inputClass =
  "rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/90 outline-none transition-all focus:border-white/25 focus:bg-white/[0.05] placeholder:text-white/20 font-mono";
const labelClass = "font-mono text-[10px] uppercase tracking-widest text-white/35";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="glass p-5 flex flex-col gap-1">
      <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">{label}</p>
      <p className="font-display text-3xl font-bold text-white">{value}</p>
      {sub && <p className="font-mono text-[10px] text-white/25">{sub}</p>}
    </div>
  );
}

export default function Dashboard({
  initialProjects,
  initialCertificates,
  initialSkills,
  initialSettings,
}: {
  initialProjects: Project[];
  initialCertificates: Certificate[];
  initialSkills: Skill[];
  initialSettings: SiteSettings;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");
  const [projects, setProjects] = useState(initialProjects);
  const [certificates, setCertificates] = useState(initialCertificates);
  const [skills, setSkills] = useState(initialSkills);
  const [settings, setSettings] = useState(initialSettings);

  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT);
  const [certForm, setCertForm] = useState(EMPTY_CERT);
  const [skillForm, setSkillForm] = useState(EMPTY_SKILL);
  const [settingsForm, setSettingsForm] = useState(initialSettings);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [savedSettings, setSavedSettings] = useState(false);

  const analytics = useMemo(() => {
    const byCategory = certificates.reduce<Record<string, number>>((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});
    return {
      totalProjects: projects.length,
      featuredProjects: projects.filter((p) => p.featured).length,
      totalCertificates: certificates.length,
      totalSkills: skills.length,
      byCategory,
    };
  }, [projects, certificates, skills]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  async function submitSettings(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setSavedSettings(false);
    try {
      const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settingsForm) });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error);
      setSettings(updated); setSettingsForm(updated); setSavedSettings(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setBusy(false); }
  }

  async function submitProject(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const payload = { title: projectForm.title, description: projectForm.description, image: projectForm.image || undefined, tech: projectForm.techText.split(",").map((t) => t.trim()).filter(Boolean), github: projectForm.github, demo: projectForm.demo, featured: projectForm.featured };
    try {
      if (projectForm.id) {
        const res = await fetch(`/api/projects/${projectForm.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const updated = await res.json();
        if (!res.ok) throw new Error(updated.error);
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const created = await res.json();
        if (!res.ok) throw new Error(created.error);
        setProjects((prev) => [created, ...prev]);
      }
      setProjectForm(EMPTY_PROJECT);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setBusy(false); }
  }

  function editProject(p: Project) {
    setProjectForm({ id: p.id, title: p.title, description: p.description, image: p.image, techText: p.tech.join(", "), github: p.github || "", demo: p.demo || "", featured: !!p.featured });
  }

  async function removeProject(id: string) {
    if (!confirm("Delete this project?")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  async function submitCert(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const payload = { title: certForm.title, issuer: certForm.issuer, category: certForm.category, image: certForm.image || undefined, issuedAt: new Date(certForm.issuedAt).toISOString() };
    try {
      if (certForm.id) {
        const res = await fetch(`/api/certificates/${certForm.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const updated = await res.json();
        if (!res.ok) throw new Error(updated.error);
        setCertificates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const res = await fetch("/api/certificates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const created = await res.json();
        if (!res.ok) throw new Error(created.error);
        setCertificates((prev) => [created, ...prev]);
      }
      setCertForm(EMPTY_CERT);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setBusy(false); }
  }

  function editCert(c: Certificate) {
    setCertForm({ id: c.id, title: c.title, issuer: c.issuer, category: c.category, image: c.image, issuedAt: c.issuedAt.slice(0, 10) });
  }

  async function removeCert(id: string) {
    if (!confirm("Delete this certificate?")) return;
    const res = await fetch(`/api/certificates/${id}`, { method: "DELETE" });
    if (res.ok) setCertificates((prev) => prev.filter((c) => c.id !== id));
  }

  async function submitSkill(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const payload = { name: skillForm.name, category: skillForm.category, level: Number(skillForm.level) };
    try {
      if (skillForm.id) {
        const res = await fetch(`/api/skills/${skillForm.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const updated = await res.json();
        if (!res.ok) throw new Error(updated.error);
        setSkills((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        const res = await fetch("/api/skills", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const created = await res.json();
        if (!res.ok) throw new Error(created.error);
        setSkills((prev) => [...prev, created]);
      }
      setSkillForm(EMPTY_SKILL);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setBusy(false); }
  }

  function editSkill(s: Skill) {
    setSkillForm({ id: s.id, name: s.name, category: s.category, level: s.level });
  }

  async function removeSkill(id: string) {
    if (!confirm("Delete this skill?")) return;
    const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
    if (res.ok) setSkills((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>, onDone: (url: string) => void) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setError("");
    try { const url = await uploadFile(file); onDone(url); }
    catch (err) { setError(err instanceof Error ? err.message : "Upload failed"); }
    finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Grid bg */}
      <div className="pointer-events-none fixed inset-0 bg-grid-faint bg-[size:48px_48px] opacity-30" />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 z-40 w-16 flex flex-col items-center border-r border-white/[0.06] bg-black/40 backdrop-blur-xl py-5 gap-1 sm:w-56 sm:items-start sm:px-3">
        {/* Logo */}
        <div className="mb-6 flex items-center gap-3 px-1 w-full">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
            <span className="font-mono text-xs font-bold text-white">j.</span>
          </div>
          <span className="hidden sm:block font-mono text-xs text-white/40 uppercase tracking-widest">Control</span>
        </div>

        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex w-full items-center gap-3 rounded-xl px-2 py-2.5 transition-all ${
              tab === t.id
                ? "bg-white/[0.08] text-white"
                : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
            }`}
          >
            {tab === t.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-white"
              />
            )}
            <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 fill-current">
              {t.icon}
            </svg>
            <span className="hidden sm:block font-mono text-xs uppercase tracking-wider">{t.label}</span>
          </button>
        ))}

        <div className="mt-auto w-full">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-white/25 hover:text-red-400/70 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 fill-current">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            <span className="hidden sm:block font-mono text-xs uppercase tracking-wider">Log out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-16 sm:pl-56">
        <div className="mx-auto max-w-5xl px-6 py-10">

          {/* Header */}
          <div className="mb-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/25 mb-1">
              {TABS.find((t) => t.id === tab)?.label}
            </p>
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
              {tab === "profile" && "Profile & Settings"}
              {tab === "projects" && "Manage Projects"}
              {tab === "skills" && "Manage Skills"}
              {tab === "certificates" && "Manage Certificates"}
              {tab === "analytics" && "Analytics"}
            </h1>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-red-400 flex-shrink-0 fill-current">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <p className="font-mono text-xs text-red-400">{error}</p>
                <button onClick={() => setError("")} className="ml-auto text-red-400/50 hover:text-red-400">✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== PROFILE ===== */}
          {tab === "profile" && (
            <form onSubmit={submitSettings} className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
              {/* Photo column */}
              <div className="glass p-6 flex flex-col items-center gap-4">
                <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-white/15 bg-white/[0.03]">
                  {settingsForm.profileImage ? (
                    <Image src={settingsForm.profileImage} alt="Profile" fill className="object-cover grayscale" unoptimized />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-display text-3xl font-bold text-white/30">
                        {settingsForm.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-display text-base font-bold text-white">{settingsForm.name}</p>
                  <p className="font-mono text-xs text-white/35">{settingsForm.role}</p>
                </div>
                <label className="flex flex-col items-center gap-2 cursor-pointer w-full">
                  <span className={labelClass}>Change photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e, (url) => setSettingsForm({ ...settingsForm, profileImage: url }))} />
                  <span className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-center font-mono text-xs text-white/40 hover:text-white hover:border-white/20 transition-colors cursor-pointer">
                    Upload image
                  </span>
                </label>
                <label className="flex flex-col items-center gap-2 cursor-pointer w-full">
                  <span className={labelClass}>Resume PDF</span>
                  <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleImagePick(e, (url) => setSettingsForm({ ...settingsForm, resumeUrl: url }))} />
                  <span className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-center font-mono text-xs text-white/40 hover:text-white hover:border-white/20 transition-colors cursor-pointer">
                    {settingsForm.resumeUrl ? "Replace PDF" : "Upload PDF"}
                  </span>
                </label>
                {settingsForm.resumeUrl && (
                  <a href={settingsForm.resumeUrl} target="_blank" rel="noreferrer" className="font-mono text-[10px] text-white/30 hover:text-white transition-colors">
                    View current →
                  </a>
                )}
              </div>

              {/* Fields column */}
              <div className="glass p-6 flex flex-col gap-4">
                <Field label="Display name">
                  <input required value={settingsForm.name} onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Role / title">
                  <input required value={settingsForm.role} onChange={(e) => setSettingsForm({ ...settingsForm, role: e.target.value })} className={inputClass} placeholder="Full Stack Developer" />
                </Field>
                <Field label="Status (shown on ID card back)">
                  <input value={settingsForm.status} onChange={(e) => setSettingsForm({ ...settingsForm, status: e.target.value })} className={inputClass} placeholder="Open to freelance & internship" />
                </Field>
                <div className="h-px bg-white/[0.06]" />
                <Field label="GitHub URL">
                  <input value={settingsForm.githubUrl} onChange={(e) => setSettingsForm({ ...settingsForm, githubUrl: e.target.value })} className={inputClass} placeholder="https://github.com/yourname" />
                </Field>
                <Field label="Facebook URL">
                  <input value={settingsForm.facebookUrl} onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })} className={inputClass} placeholder="https://facebook.com/yourname" />
                </Field>
                <Field label="Email">
                  <input type="email" value={settingsForm.email} onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })} className={inputClass} placeholder="you@gmail.com" />
                </Field>

                <div className="mt-2 flex items-center gap-3">
                  <motion.button
                    type="submit"
                    disabled={busy}
                    whileHover={{ scale: busy ? 1 : 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="rounded-full bg-white px-6 py-2.5 font-mono text-sm font-medium text-black disabled:opacity-50 transition-opacity hover:opacity-90"
                  >
                    {busy ? "Saving..." : "Save settings"}
                  </motion.button>
                  <AnimatePresence>
                    {savedSettings && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-xs text-white/40">
                        ✓ Saved — live now
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </form>
          )}

          {/* ===== PROJECTS ===== */}
          {tab === "projects" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
              <form onSubmit={submitProject} className="glass flex flex-col gap-4 p-6 h-fit">
                <h2 className="font-display text-base font-bold text-white">
                  {projectForm.id ? "Edit project" : "New project"}
                </h2>
                <Field label="Title">
                  <input required placeholder="My Project" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Description">
                  <textarea required rows={3} placeholder="What does it do?" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} className={`resize-none ${inputClass}`} />
                </Field>
                <Field label="Tech stack (comma separated)">
                  <input placeholder="PHP, MySQL, HTML, CSS" value={projectForm.techText} onChange={(e) => setProjectForm({ ...projectForm, techText: e.target.value })} className={inputClass} />
                </Field>
                <Field label="GitHub URL">
                  <input placeholder="https://github.com/..." value={projectForm.github} onChange={(e) => setProjectForm({ ...projectForm, github: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Demo / Visit site URL">
                  <input placeholder="https://..." value={projectForm.demo} onChange={(e) => setProjectForm({ ...projectForm, demo: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Preview image">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 font-mono text-xs text-white/40 hover:text-white hover:border-white/20 transition-colors text-center">
                      {projectForm.image ? "Replace image" : "Upload image"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e, (url) => setProjectForm({ ...projectForm, image: url }))} />
                    </label>
                    {projectForm.image && (
                      <div className="relative h-10 w-16 overflow-hidden rounded-lg border border-white/10 flex-shrink-0">
                        <Image src={projectForm.image} alt="" fill className="object-cover" unoptimized />
                      </div>
                    )}
                  </div>
                </Field>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={projectForm.featured} onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })} className="rounded" />
                  <span className="font-mono text-xs text-white/50">Mark as featured</span>
                </label>
                <div className="flex gap-3 mt-1">
                  <motion.button type="submit" disabled={busy} whileTap={{ scale: 0.97 }} className="rounded-full bg-white px-5 py-2 font-mono text-xs font-medium text-black disabled:opacity-50 hover:opacity-90 transition-opacity">
                    {projectForm.id ? "Save changes" : "Add project"}
                  </motion.button>
                  {projectForm.id && (
                    <button type="button" onClick={() => setProjectForm(EMPTY_PROJECT)} className="rounded-full border border-white/10 px-5 py-2 font-mono text-xs text-white/40 hover:text-white transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="flex flex-col gap-3">
                {projects.length === 0 && <p className="font-mono text-xs text-white/25">No projects yet. Add one →</p>}
                {projects.map((p) => (
                  <motion.div key={p.id} layout className="glass flex items-center gap-4 p-4">
                    <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-white/10">
                      <Image src={p.image} alt={p.title} fill className="object-cover grayscale" unoptimized />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-display text-sm font-bold text-white">{p.title}</p>
                        {p.featured && <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[9px] text-white/40">featured</span>}
                      </div>
                      <p className="mt-0.5 truncate font-mono text-xs text-white/30">{p.tech.slice(0, 3).join(" · ")}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => editProject(p)} className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-[11px] text-white/40 hover:text-white hover:border-white/25 transition-colors">Edit</button>
                      <button onClick={() => removeProject(p.id)} className="rounded-full border border-red-400/20 px-3 py-1.5 font-mono text-[11px] text-red-400/50 hover:text-red-400 hover:border-red-400/40 transition-colors">Del</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ===== SKILLS ===== */}
          {tab === "skills" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
              <form onSubmit={submitSkill} className="glass flex flex-col gap-4 p-6 h-fit">
                <h2 className="font-display text-base font-bold text-white">
                  {skillForm.id ? "Edit skill" : "New skill"}
                </h2>
                <Field label="Skill name">
                  <input required placeholder="e.g. MySQL, React, Git" value={skillForm.name} onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Category">
                  <select value={skillForm.category} onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value as Skill["category"] })} className={inputClass}>
                    {["Language", "Framework/Library", "Database", "Tool", "Other"].map((c) => (
                      <option key={c} value={c} className="bg-[#111]">{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label={`Proficiency — ${skillForm.level}%`}>
                  <div className="flex items-center gap-3">
                    <input type="range" min={0} max={100} step={5} value={skillForm.level} onChange={(e) => setSkillForm({ ...skillForm, level: Number(e.target.value) })} className="flex-1 accent-white" />
                    <span className="font-mono text-xs text-white/40 w-8 text-right">{skillForm.level}</span>
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white/60 rounded-full transition-all" style={{ width: `${skillForm.level}%` }} />
                  </div>
                </Field>
                <div className="flex gap-3 mt-1">
                  <motion.button type="submit" disabled={busy} whileTap={{ scale: 0.97 }} className="rounded-full bg-white px-5 py-2 font-mono text-xs font-medium text-black disabled:opacity-50 hover:opacity-90 transition-opacity">
                    {skillForm.id ? "Save changes" : "Add skill"}
                  </motion.button>
                  {skillForm.id && (
                    <button type="button" onClick={() => setSkillForm(EMPTY_SKILL)} className="rounded-full border border-white/10 px-5 py-2 font-mono text-xs text-white/40 hover:text-white transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="flex flex-col gap-2">
                {skills.length === 0 && <p className="font-mono text-xs text-white/25">No skills yet. Add one →</p>}
                {skills.map((s) => (
                  <motion.div key={s.id} layout className="glass flex items-center gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="font-display text-sm font-bold text-white">{s.name}</p>
                        <span className="font-mono text-[10px] text-white/25">{s.level}%</span>
                      </div>
                      <div className="h-[2px] w-full bg-white/[0.07] rounded-full overflow-hidden">
                        <div className="h-full bg-white/40 rounded-full" style={{ width: `${s.level}%` }} />
                      </div>
                      <p className="mt-1.5 font-mono text-[10px] text-white/25">{s.category}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => editSkill(s)} className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-[11px] text-white/40 hover:text-white hover:border-white/25 transition-colors">Edit</button>
                      <button onClick={() => removeSkill(s.id)} className="rounded-full border border-red-400/20 px-3 py-1.5 font-mono text-[11px] text-red-400/50 hover:text-red-400 hover:border-red-400/40 transition-colors">Del</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ===== CERTIFICATES ===== */}
          {tab === "certificates" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
              <form onSubmit={submitCert} className="glass flex flex-col gap-4 p-6 h-fit">
                <h2 className="font-display text-base font-bold text-white">
                  {certForm.id ? "Edit certificate" : "New certificate"}
                </h2>
                <Field label="Title">
                  <input required placeholder="Certificate title" value={certForm.title} onChange={(e) => setCertForm({ ...certForm, title: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Issuer">
                  <input required placeholder="e.g. Coursera, Google" value={certForm.issuer} onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Category">
                  <select value={certForm.category} onChange={(e) => setCertForm({ ...certForm, category: e.target.value as Certificate["category"] })} className={inputClass}>
                    {["Web Dev", "AI", "UI/UX", "Other"].map((c) => (
                      <option key={c} value={c} className="bg-[#111]">{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Issue date">
                  <input type="date" value={certForm.issuedAt} onChange={(e) => setCertForm({ ...certForm, issuedAt: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Certificate image">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 font-mono text-xs text-white/40 hover:text-white hover:border-white/20 transition-colors text-center">
                      {certForm.image ? "Replace image" : "Upload image"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e, (url) => setCertForm({ ...certForm, image: url }))} />
                    </label>
                    {certForm.image && (
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-white/10 flex-shrink-0">
                        <Image src={certForm.image} alt="" fill className="object-cover" unoptimized />
                      </div>
                    )}
                  </div>
                </Field>
                <div className="flex gap-3 mt-1">
                  <motion.button type="submit" disabled={busy} whileTap={{ scale: 0.97 }} className="rounded-full bg-white px-5 py-2 font-mono text-xs font-medium text-black disabled:opacity-50 hover:opacity-90 transition-opacity">
                    {certForm.id ? "Save changes" : "Add certificate"}
                  </motion.button>
                  {certForm.id && (
                    <button type="button" onClick={() => setCertForm(EMPTY_CERT)} className="rounded-full border border-white/10 px-5 py-2 font-mono text-xs text-white/40 hover:text-white transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="grid grid-cols-2 gap-3">
                {certificates.length === 0 && <p className="col-span-2 font-mono text-xs text-white/25">No certificates yet. Add one →</p>}
                {certificates.map((c) => (
                  <motion.div key={c.id} layout className="glass overflow-hidden group">
                    <div className="relative aspect-[3/4]">
                      <Image src={c.image} alt={c.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all" unoptimized />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="font-display text-xs font-bold text-white leading-snug">{c.title}</p>
                        <p className="font-mono text-[10px] text-white/40">{c.issuer}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 p-2 border-t border-white/[0.06]">
                      <button onClick={() => editCert(c)} className="flex-1 rounded-lg border border-white/10 py-1.5 font-mono text-[11px] text-white/40 hover:text-white hover:border-white/25 transition-colors">Edit</button>
                      <button onClick={() => removeCert(c.id)} className="flex-1 rounded-lg border border-red-400/20 py-1.5 font-mono text-[11px] text-red-400/50 hover:text-red-400 hover:border-red-400/40 transition-colors">Delete</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ===== ANALYTICS ===== */}
          {tab === "analytics" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Total projects" value={analytics.totalProjects} sub={`${analytics.featuredProjects} featured`} />
                <StatCard label="Total skills" value={analytics.totalSkills} />
                <StatCard label="Certificates" value={analytics.totalCertificates} />
                <StatCard label="Stack" value={skills.length > 0 ? skills[0].name : "—"} sub="top skill" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="glass p-6">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/35 mb-4">Certs by category</p>
                  <div className="flex flex-col gap-3">
                    {Object.entries(analytics.byCategory).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-3">
                        <span className="font-mono text-xs text-white/50 w-20 flex-shrink-0">{k}</span>
                        <div className="flex-1 h-[2px] bg-white/[0.07] rounded-full overflow-hidden">
                          <div className="h-full bg-white/40 rounded-full" style={{ width: `${(v / analytics.totalCertificates) * 100}%` }} />
                        </div>
                        <span className="font-mono text-xs text-white/30 w-4 text-right">{v}</span>
                      </div>
                    ))}
                    {Object.keys(analytics.byCategory).length === 0 && (
                      <p className="font-mono text-xs text-white/20">No certificates yet.</p>
                    )}
                  </div>
                </div>

                <div className="glass p-6">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/35 mb-4">Skills by category</p>
                  <div className="flex flex-col gap-3">
                    {(() => {
                      const byCat = skills.reduce<Record<string, number>>((a, s) => { a[s.category] = (a[s.category] || 0) + 1; return a; }, {});
                      return Object.entries(byCat).map(([k, v]) => (
                        <div key={k} className="flex items-center gap-3">
                          <span className="font-mono text-[11px] text-white/50 w-28 flex-shrink-0 truncate">{k}</span>
                          <div className="flex-1 h-[2px] bg-white/[0.07] rounded-full overflow-hidden">
                            <div className="h-full bg-white/40 rounded-full" style={{ width: `${(v / analytics.totalSkills) * 100}%` }} />
                          </div>
                          <span className="font-mono text-xs text-white/30 w-4 text-right">{v}</span>
                        </div>
                      ));
                    })()}
                    {skills.length === 0 && <p className="font-mono text-xs text-white/20">No skills yet.</p>}
                  </div>
                </div>
              </div>

              {/* Recent projects list */}
              <div className="glass p-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/35 mb-4">Recent projects</p>
                <div className="flex flex-col gap-2">
                  {projects.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0">
                      <div className="relative h-8 w-12 flex-shrink-0 overflow-hidden rounded border border-white/10">
                        <Image src={p.image} alt={p.title} fill className="object-cover grayscale" unoptimized />
                      </div>
                      <p className="flex-1 font-display text-sm text-white truncate">{p.title}</p>
                      <span className="font-mono text-[10px] text-white/25">{p.tech.slice(0, 2).join(", ")}</span>
                      {p.featured && <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] text-white/30">★</span>}
                    </div>
                  ))}
                  {projects.length === 0 && <p className="font-mono text-xs text-white/20">No projects yet.</p>}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
