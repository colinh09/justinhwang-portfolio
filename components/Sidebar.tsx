"use client";

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "hero", label: "Index" },
  { id: "technical", label: "Technical Projects" },
  { id: "construction", label: "Construction Projects" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
];

interface Props {
  activeSection: string;
  onNav: (id: string) => void;
}

export default function Sidebar({ activeSection, onNav }: Props) {
  return (
    <aside className="jh-sidebar">
      <div>
        <div className="jh-sidebar__id">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="jh-sidebar__avatar"
            src="/justin.jpg"
            alt="Portrait of Justin Hwang"
            width={48}
            height={48}
          />
          <div className="jh-sidebar__name">
            <span>Justin</span>
            <span>Hwang</span>
          </div>
        </div>
        <div className="jh-sidebar__title">
          Senior Project Controls Engineer
          <span className="jh-sep"> · </span>PMP
        </div>
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
            <span className="jh-status__co">Naik Group</span>
          </span>
        </div>
        <div className="jh-meta">
          <div>
            New York, NY <span className="jh-sep">·</span> Seattle, WA
          </div>
          <a href="mailto:JKH.Build@gmail.com">JKH.Build@gmail.com</a>
          <a href="/Justin_Hwang_Resume.pdf" target="_blank" rel="noopener noreferrer">
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
