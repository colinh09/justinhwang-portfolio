import constructionProjects from "@/content/construction-projects.json";
import technicalProjects from "@/content/technical-projects.json";
import services from "@/content/services.json";
import site from "@/content/site.json";
import type {
  ConstructionProject,
  Role,
  Sector,
  TechProject,
} from "./types";

// Filter chip values are tied to the type system; not editable from JSON.
export const SECTORS: Sector[] = [
  "Transit",
  "K-12",
  "Higher Ed",
  "Healthcare",
  "Corporate Interiors",
  "Residential",
];

export const ROLES: Role[] = [
  "Project Controls",
  "Estimator",
  "Change Manager",
  "Project Manager",
  "Project Engineer",
  "Procurement Manager",
  "Commercial Manager",
];

export const TECH_PROJECTS = technicalProjects as unknown as TechProject[];
export const CONSTRUCTION_PROJECTS =
  constructionProjects as unknown as ConstructionProject[];

export interface Service {
  n: string;
  title: string;
  desc: string;
}
export const SERVICES = services as Service[];

export interface Credential {
  name: string;
  issuer: string;
}

export interface Profile {
  name: string;
  jobTitle: string;
  currentEmployer: string;
  locations: string[];
  email: string;
  linkedinUrl: string;
  resumePath: string;
}

export interface HeroContent {
  eyebrow: string;
  bio: string[];
}

export interface SiteContent {
  profile: Profile;
  hero: HeroContent;
  credentials: Credential[];
  toolkit: string[];
}

export const SITE = site as SiteContent;
