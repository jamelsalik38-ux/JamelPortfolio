import fs from "fs";
import path from "path";
import type { DBShape, Project, Certificate, Skill, SiteSettings } from "@/types";

/**
 * Lightweight file-based "database" so the app runs out of the box with
 * zero setup. It reads/writes a single JSON file on disk.
 *
 * SWAPPING TO A REAL DATABASE
 * ----------------------------------
 * For production you'll want MongoDB or MySQL instead of a JSON file.
 * This module is the *only* place that touches storage — every API route
 * imports from here, so you only need to rewrite the functions below.
 *
 * MongoDB (Mongoose) sketch:
 *   - npm install mongoose
 *   - connect once in a `lib/mongoose.ts` singleton
 *   - define Project/Certificate schemas matching src/types/index.ts
 *   - replace each function body with the equivalent Model.find()/create()/
 *     findByIdAndUpdate()/findByIdAndDelete() call
 *
 * MySQL (matches your usual PHP/MySQL stack) sketch:
 *   - npm install mysql2
 *   - create a connection pool in `lib/mysql.ts`
 *   - create `projects` / `certificates` tables mirroring the types
 *   - replace each function body with the equivalent SQL query
 *
 * Because every function here is async and returns the same shapes,
 * nothing outside this file needs to change.
 */

const DB_PATH = path.join(process.cwd(), "data", "db.json");
const SEED_PATH = path.join(process.cwd(), "data", "seed.json");

const DEFAULT_SETTINGS: SiteSettings = {
  name: "Jamel Salik",
  role: "Aspiring Full Stack Developer",
  profileImage: "",
  githubUrl: "https://github.com/jamelsalik38-ux",
  facebookUrl: "",
  email: "",
  resumeUrl: "",
  status: "Open to freelance & internship work",
};

function ensureDB(): DBShape {
  if (!fs.existsSync(DB_PATH)) {
    const seed = fs.existsSync(SEED_PATH)
      ? JSON.parse(fs.readFileSync(SEED_PATH, "utf-8"))
      : { projects: [], certificates: [], skills: [], settings: DEFAULT_SETTINGS };
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
  }

  const data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));

  // Migration safety: older db.json files (created before skills/settings
  // existed) won't have these keys. Backfill them in place so upgrading
  // never breaks an existing local database.
  let migrated = false;
  if (!data.skills) {
    data.skills = [];
    migrated = true;
  }
  if (!data.settings) {
    data.settings = DEFAULT_SETTINGS;
    migrated = true;
  }
  if (migrated) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }

  return data as DBShape;
}

function saveDB(data: DBShape) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ---------- Projects ----------

export async function getProjects(): Promise<Project[]> {
  return ensureDB().projects.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getProject(id: string): Promise<Project | undefined> {
  return ensureDB().projects.find((p) => p.id === id);
}

export async function createProject(project: Project): Promise<Project> {
  const db = ensureDB();
  db.projects.unshift(project);
  saveDB(db);
  return project;
}

export async function updateProject(
  id: string,
  patch: Partial<Project>
): Promise<Project | undefined> {
  const db = ensureDB();
  const idx = db.projects.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  db.projects[idx] = { ...db.projects[idx], ...patch };
  saveDB(db);
  return db.projects[idx];
}

export async function deleteProject(id: string): Promise<boolean> {
  const db = ensureDB();
  const before = db.projects.length;
  db.projects = db.projects.filter((p) => p.id !== id);
  saveDB(db);
  return db.projects.length < before;
}

// ---------- Certificates ----------

export async function getCertificates(): Promise<Certificate[]> {
  return ensureDB().certificates.sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
  );
}

export async function createCertificate(
  cert: Certificate
): Promise<Certificate> {
  const db = ensureDB();
  db.certificates.unshift(cert);
  saveDB(db);
  return cert;
}

export async function updateCertificate(
  id: string,
  patch: Partial<Certificate>
): Promise<Certificate | undefined> {
  const db = ensureDB();
  const idx = db.certificates.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  db.certificates[idx] = { ...db.certificates[idx], ...patch };
  saveDB(db);
  return db.certificates[idx];
}

export async function deleteCertificate(id: string): Promise<boolean> {
  const db = ensureDB();
  const before = db.certificates.length;
  db.certificates = db.certificates.filter((c) => c.id !== id);
  saveDB(db);
  return db.certificates.length < before;
}

// ---------- Skills ----------

export async function getSkills(): Promise<Skill[]> {
  return ensureDB().skills;
}

export async function createSkill(skill: Skill): Promise<Skill> {
  const db = ensureDB();
  db.skills.push(skill);
  saveDB(db);
  return skill;
}

export async function updateSkill(
  id: string,
  patch: Partial<Skill>
): Promise<Skill | undefined> {
  const db = ensureDB();
  const idx = db.skills.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  db.skills[idx] = { ...db.skills[idx], ...patch };
  saveDB(db);
  return db.skills[idx];
}

export async function deleteSkill(id: string): Promise<boolean> {
  const db = ensureDB();
  const before = db.skills.length;
  db.skills = db.skills.filter((s) => s.id !== id);
  saveDB(db);
  return db.skills.length < before;
}

// ---------- Settings (singleton) ----------

export async function getSettings(): Promise<SiteSettings> {
  return ensureDB().settings;
}

export async function updateSettings(
  patch: Partial<SiteSettings>
): Promise<SiteSettings> {
  const db = ensureDB();
  db.settings = { ...db.settings, ...patch };
  saveDB(db);
  return db.settings;
}
