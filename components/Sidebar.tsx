"use client";

import { SITE } from "@/lib/content";

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "hero", label: "Index" },
  { id: "technical", label: "Technical Projects" },
  { id: "construction", label: "Construction Projects" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
];

interface Props {
  activeSection: string;
  onNav: (id: string) => void;
}

export default function Sidebar({ activeSection, onNav }: Props) {
  const [first, ...rest] = SITE.profile.name.split(" ");
  const nameParts = rest.length ? [first, rest.join(" ")] : [first];
  const locationLine = SITE.profile.locations.join(" · ");

  return (
    <aside className="jh-sidebar">
      <div>
        <div className="jh-sidebar__id">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="jh-sidebar__avatar"
            src="/justin.jpg"
            alt={`Portrait of ${SITE.profile.name}`}
            width={64}
            height={64}
          />
          <div className="jh-sidebar__name">
            {nameParts.map((part) => (
              <span key={part}>{part}</span>
            ))}
          </div>
        </div>
        <div className="jh-sidebar__title">{SITE.profile.jobTitle}</div>
      </div>

      <div className="jh-divider" />

      <nav className="jh-nav" aria-label="Primary">
        {NAV_ITEMS.map((it, i) => (
          <button
            key={it.id}
            className={`jh-nav__item ${
              activeSection === it.id ? "is-active" : ""
            }`}
            onClick={() => onNav(it.id)}
          >
            <span className="jh-nav__num">{String(i).padStart(2, "0")}</span>
            <span className="jh-nav__label">{it.label}</span>
          </button>
        ))}
      </nav>

      <div className="jh-sidebar__bottom">
        <div className="jh-status">
          <span className="jh-status__dot" />
          <span className="jh-status__text">
            <span className="jh-status__live">Currently at</span>
            <span className="jh-status__co">
              {SITE.profile.currentEmployer}
            </span>
          </span>
        </div>
        <div className="jh-meta">
          <div>{locationLine}</div>
          <a href={`mailto:${SITE.profile.email}`}>{SITE.profile.email}</a>
          <a
            href={SITE.profile.resumePath}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download CV ↓
          </a>
        </div>
        <div className="jh-sidebar__mark" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={28} height={28} />
        </div>
      </div>
    </aside>
  );
}
