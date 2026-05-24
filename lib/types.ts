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

/** A single numbered item in an objectives / challenges / futureFeatures list,
    rendered as "1. Lead. Body…" in the redesigned modal body. */
export interface ProjectItem {
  lead: string;
  body: string;
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
  /** Path under /public to a downloadable PDF. When set, a download link
      appears inline beside the title in the project modal. */
  pdf?: string;
  /** Public URL to the project's source repository (e.g. GitHub). When set,
      a Repo pill appears in the modal header. Added in Phase 2. */
  repo?: string;
  /** Public URL to a deployed live version of the project (web app, etc.).
      When set, a "View live" pill appears in the modal topbar. For embed
      projects, embedUrl is used as the View-live target if liveUrl is unset. */
  liveUrl?: string;
  /** Power BI "Publish to web" URL. When set, the modal renders a live
      iframe in place of the photo carousel. Added in Phase 2. */
  embedUrl?: string;
  /** Label shown in the dark strip above the embed iframe. */
  embedLabel?: string;
  /** Caption shown in the dark strip below the embed label. */
  embedCaption?: string;
  /** Path under /public to an image shown during iframe load and on embed failure. */
  embedFallbackImage?: string;
  /** Body-section: short prose description rendered in the redesigned modal body. */
  description?: string;
  /** Body-section: numbered list of learning goals / objectives. */
  objectives?: ProjectItem[];
  /** Body-section: numbered list of challenges encountered. */
  challenges?: ProjectItem[];
  /** Body-section: numbered list of planned future features. */
  futureFeatures?: ProjectItem[];
}

export type AnyProject = ConstructionProject | TechProject;

export const isTechProject = (p: AnyProject): p is TechProject =>
  Array.isArray((p as TechProject).tags);
