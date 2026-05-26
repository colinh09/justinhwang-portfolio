"use client";

import { useMemo, useState } from "react";
import { CONSTRUCTION_PROJECTS, ROLES, SECTORS } from "@/lib/content";
import type { ConstructionProject, Role, Sector } from "@/lib/types";
import ProjectThumb from "./ProjectThumb";
import SectionHeader from "./SectionHeader";

interface Props {
  onOpen: (p: ConstructionProject) => void;
}

interface FilterRowProps<T extends string> {
  label: string;
  options: readonly T[];
  selected: T | null;
  onChange: (v: T | null) => void;
}

function FilterRow<T extends string>({
  label,
  options,
  selected,
  onChange,
}: FilterRowProps<T>) {
  return (
    <div className="jh-filter">
      <div className="jh-filter__label">{label}</div>
      <div className="jh-filter__chips">
        <button
          className={`jh-fchip ${selected === null ? "is-on" : ""}`}
          onClick={() => onChange(null)}
        >
          All
        </button>
        {options.map((opt) => (
          <button
            key={opt}
            className={`jh-fchip ${selected === opt ? "is-on" : ""}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ConstructionSection({ onOpen }: Props) {
  const [sector, setSector] = useState<Sector | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  // JSON is stored oldest-first so new entries just get appended;
  // reverse here so newest renders at the top (filter preserves order).
  const filtered = useMemo(
    () =>
      [...CONSTRUCTION_PROJECTS]
        .reverse()
        .filter(
          (p) =>
            (!sector || p.sector === sector) && (!role || p.role === role)
        ),
    [sector, role]
  );

  return (
    <section id="construction" className="jh-section">
      <SectionHeader
        num="02"
        kicker="Construction Work"
        title="Construction projects."
      />
      <div className="jh-filters">
        <FilterRow
          label="Sector"
          options={SECTORS}
          selected={sector}
          onChange={setSector}
        />
        <FilterRow
          label="Role"
          options={ROLES}
          selected={role}
          onChange={setRole}
        />
      </div>
      <div className="jh-result-count">
        {filtered.length} {filtered.length === 1 ? "project" : "projects"}
      </div>
      {filtered.length > 0 ? (
        <div className="jh-grid jh-grid--const">
          {filtered.map((p) => (
            <button
              key={p.id}
              className="jh-card"
              onClick={() => onOpen(p)}
            >
              <ProjectThumb
                swatch={p.swatch}
                label={p.label}
                image={p.image}
              />
              <div className="jh-card__body">
                <div className="jh-card__title">{p.title}</div>
                <div className="jh-card__location">{p.location}</div>
                <div className="jh-chips">
                  <span className="jh-chip jh-chip--sector">{p.sector}</span>
                  <span className="jh-chip jh-chip--role">{p.role}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="jh-empty">No projects match those filters.</div>
      )}
    </section>
  );
}
