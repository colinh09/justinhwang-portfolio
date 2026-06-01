import type { ProjectItem, TechProject } from "@/lib/types";

/**
 * Section registry — single source of truth for which body sections exist,
 * in what order, and how each renders. All consumers iterate over
 * getActiveSections(); no hand-rolled lists.
 *
 * `as const satisfies` preserves literal types for `id`/`key`/`kind` while
 * the satisfies clause forces every `key` to be a valid TechProject field
 * at compile time.
 */
export const SECTION_DEFS = [
  { id: "desc",   key: "description",    label: "Description",                 navLabel: "Description",        kind: "prose" },
  { id: "obj",    key: "objectives",     label: "Learning Goals & Objectives", navLabel: "Learning Goals",     kind: "list"  },
  { id: "chal",   key: "challenges",     label: "Challenges & Fixes",          navLabel: "Challenges & Fixes", kind: "list"  },
  { id: "future", key: "futureFeatures", label: "What's Next?",                navLabel: "What's Next?",       kind: "list"  },
] as const satisfies readonly {
  readonly id: string;
  readonly key: keyof TechProject;
  readonly label: string;
  readonly navLabel: string;
  readonly kind: "prose" | "list";
}[];

export type SectionDef = (typeof SECTION_DEFS)[number];
export type SectionId = SectionDef["id"];

/**
 * Render-ready section. The `kind` discriminant narrows `value` to either
 * paragraphs (prose) or numbered items (list), so the renderer switch
 * stays type-safe without casts.
 */
export type ActiveSection =
  | (Extract<SectionDef, { kind: "prose" }> & { value: readonly string[] })
  | (Extract<SectionDef, { kind: "list" }> & { value: readonly ProjectItem[] });

/**
 * Resolve which body sections to render for a tech project. Empty fields
 * collapse: no header, no sidenav link, no reserved space.
 *
 * The Description section falls back to the legacy `detail: string[]`
 * paragraph array when the new `description: string` field isn't set, so
 * projects that haven't been migrated to the new schema still render their
 * existing body copy as the Description prose.
 */
export function getActiveSections(project: TechProject): ActiveSection[] {
  const out: ActiveSection[] = [];
  for (const def of SECTION_DEFS) {
    if (def.kind === "prose") {
      const description = project.description;
      if (description && description.trim().length > 0) {
        // Allow authors to split a `description` into multiple paragraphs
        // by inserting blank lines. Single-paragraph descriptions still
        // collapse to one <p>, so existing records render unchanged.
        const paragraphs = description
          .split(/\n\s*\n+/)
          .map((p) => p.trim())
          .filter((p) => p.length > 0);
        out.push({ ...def, value: paragraphs });
        continue;
      }
      const paragraphs = project.detail.filter((p) => p.trim().length > 0);
      if (paragraphs.length > 0) {
        out.push({ ...def, value: paragraphs });
      }
    } else {
      const items = project[def.key];
      if (items && items.length > 0) {
        out.push({ ...def, value: items });
      }
    }
  }
  return out;
}
