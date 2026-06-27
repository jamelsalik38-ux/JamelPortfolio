import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { getProjects, getCertificates, getSkills, getSettings } from "@/lib/db";
import Dashboard from "./Dashboard";

export default async function DashboardPage() {
  if (!isAdminAuthed()) {
    redirect("/admin");
  }

  const [projects, certificates, skills, settings] = await Promise.all([
    getProjects(),
    getCertificates(),
    getSkills(),
    getSettings(),
  ]);

  return (
    <Dashboard
      initialProjects={projects}
      initialCertificates={certificates}
      initialSkills={skills}
      initialSettings={settings}
    />
  );
}
