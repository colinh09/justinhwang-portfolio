export type Sector =
  | "Transit"
  | "K-12"
  | "Higher Ed"
  | "Healthcare"
  | "Corporate Interiors"
  | "Residential";

export type Role =
  | "Project Controls"
  | "Estimator"
  | "Change Manager"
  | "Project Manager"
  | "Project Engineer"
  | "Procurement Manager"
  | "Commercial Manager";

export interface ConstructionProject {
  id: string;
  title: string;
  sub: string;
  location: string;
  sector: Sector;
  role: Role;
  value: string;
  dates: string;
  swatch: string;
  label: string;
  image?: string;
  contributions: string[];
  description: string;
}

export interface TechProject {
  id: string;
  title: string;
  blurb: string;
  tags: string[];
  swatch: string;
  label: string;
  detail: string[];
  images?: string[];
}

export type AnyProject = ConstructionProject | TechProject;

export const isTechProject = (p: AnyProject): p is TechProject =>
  Array.isArray((p as TechProject).tags);
