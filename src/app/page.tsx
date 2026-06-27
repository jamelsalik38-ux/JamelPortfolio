export const dynamic = "force-dynamic";

import AppShell from "@/components/AppShell";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProfileCard from "@/components/ProfileCard";
import ProjectsSection from "@/components/ProjectsSection";
import SkillsSection from "@/components/SkillsSection";
import CertificatesSection from "@/components/CertificatesSection";
import ContactSection from "@/components/ContactSection";
import SmoothScroll from "@/components/SmoothScroll";
import { getProjects, getCertificates, getSkills, getSettings } from "@/lib/db";

export default async function Home() {
  const [projects, certificates, skills, settings] = await Promise.all([
    getProjects(),
    getCertificates(),
    getSkills(),
    getSettings(),
  ]);

  return (
    <AppShell>
      <SmoothScroll>
        <Navbar resumeUrl={settings.resumeUrl || undefined} />
        <main className="relative">
          <Hero settings={settings} />
          <ProfileCard settings={settings} skills={skills} />
          <ProjectsSection projects={projects} />
          <SkillsSection skills={skills} />
          <CertificatesSection certificates={certificates} />
          <ContactSection settings={settings} />
          <footer className="border-t border-white/5 py-8 text-center font-mono text-xs text-white/20">
            Portfolio 2026
          </footer>
        </main>
      </SmoothScroll>
    </AppShell>
  );
}
