"use client";

import { TECH_PROJECTS } from "@/lib/content";
import type { TechProject } from "@/lib/types";
import ProjectThumb from "./ProjectThumb";
import SectionHeader from "./SectionHeader";

interface Props {
  onOpen: (p: TechProject) => void;
}

export default function TechSection({ onOpen }: Props) {
  return (
    <section id="technical" className="jh-section">
      <SectionHeader
        num="01"
        kicker="Technical Work"
        title="Technical projects."
      />
      <p className="jh-sec-intro">
        Internal tools, dashboards, and models to reduce manual work in
        project controls.
      </p>
      <div className="jh-grid jh-grid--tech">
        {TECH_PROJECTS.map((p) => (
          <button
            key={p.id}
            className="jh-card jh-card--tech"
            onClick={() => onOpen(p)}
          >
            <ProjectThumb
              swatch={p.swatch}
              label={p.label}
              image={p.images?.[0]}
            />
            <div className="jh-card__body">
              <div className="jh-card__title-row">
                <div className="jh-card__title">{p.title}</div>
                {p.embedUrl && (
                  <span
                    className="jh-chip jh-chip--interactive"
                    aria-label="Interactive Power BI report — opens in modal"
                  >
                    <span
                      className="jh-embed__badge-dot"
                      aria-hidden="true"
                    />
                    INTERACTIVE · POWER BI
                  </span>
                )}
              </div>
              <div className="jh-card__blurb">{p.blurb}</div>
              <div className="jh-chips">
                {p.tags.map((tag) => (
                  <span key={tag} className="jh-chip">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
