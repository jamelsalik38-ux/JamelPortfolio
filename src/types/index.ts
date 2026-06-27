export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tech: string[];
  github?: string;
  demo?: string;
  featured?: boolean;
  createdAt: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  category: "Web Dev" | "AI" | "UI/UX" | "Other";
  image: string;
  issuedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: "Language" | "Framework/Library" | "Database" | "Tool" | "Other";
  level: number; // 0-100, used for the proficiency bar
}

export interface SiteSettings {
  name: string;
  role: string;
  profileImage: string; // empty string = fall back to monogram
  githubUrl: string;
  facebookUrl: string;
  email: string;
  resumeUrl: string; // empty string = no resume uploaded yet
  status: string; // short availability blurb, shown on the ID card back
}

export interface DBShape {
  projects: Project[];
  certificates: Certificate[];
  skills: Skill[];
  settings: SiteSettings;
}
