"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CONSTRUCTION_PROJECTS } from "@/lib/content";
import { isTechProject, type AnyProject } from "@/lib/types";

interface Props {
  project: AnyProject | null;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const hasMeaningfulValue = (v: string) => v && v.trim() !== "" && v !== "—";

export default function Modal({ project, onClose }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    setImgIdx(0);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;

    triggerRef.current = document.activeElement as HTMLElement | null;

    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    const focusables = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [];
    focusables[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && dialog) {
        const list = Array.from(
          dialog.querySelectorAll<HTMLElement>(FOCUSABLE)
        ).filter((el) => !el.hasAttribute("disabled"));
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      triggerRef.current?.focus?.();
    };
  }, [project, onClose]);

  if (!project) return null;

  const tech = isTechProject(project);
  const images = tech
    ? project.images ?? []
    : project.image
    ? [project.image]
    : [];
  const hasImages = images.length > 0;
  const prev = () =>
    setImgIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setImgIdx((i) => (i + 1) % images.length);
  const related = !tech
    ? CONSTRUCTION_PROJECTS.filter(
        (p) =>
          p.id !== project.id &&
          (p.sector === project.sector || p.role === project.role)
      ).slice(0, 3)
    : [];

  return (
    <div
      className="jh-modal"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="jh-modal__inner"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="jh-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 5 L15 15 M15 5 L5 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div
          className={`jh-modal__hero ${tech ? "jh-modal__hero--tech" : ""}`}
          style={{ background: hasImages ? "#0d0a07" : project.swatch }}
        >
          {hasImages ? (
            <>
              {images.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`${project.title} — image ${i + 1}`}
                  className={`jh-modal__hero-img ${i === imgIdx ? "is-active" : ""}`}
                />
              ))}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="jh-modal__hero-nav jh-modal__hero-nav--prev"
                    onClick={prev}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="jh-modal__hero-nav jh-modal__hero-nav--next"
                    onClick={next}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                  <div className="jh-modal__hero-dots" role="tablist">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`jh-modal__hero-dot ${i === imgIdx ? "is-active" : ""}`}
                        onClick={() => setImgIdx(i)}
                        aria-label={`Go to image ${i + 1}`}
                        aria-selected={i === imgIdx}
                        role="tab"
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="jh-thumb__grid" />
          )}
          <div className="jh-modal__hero-label">{project.label}</div>
        </div>

        <div className="jh-modal__body">
          <div className="jh-modal__head">
            <div>
              <h2 id={titleId} className="jh-display">
                {project.title}
              </h2>
              {!tech && <div className="jh-modal__sub">{project.sub}</div>}
            </div>
            <div className="jh-chips">
              {tech ? (
                project.tags.map((t) => (
                  <span key={t} className="jh-chip">
                    {t}
                  </span>
                ))
              ) : (
                <>
                  <span className="jh-chip jh-chip--sector">
                    {project.sector}
                  </span>
                  <span className="jh-chip jh-chip--role">
                    {project.role}
                  </span>
                </>
              )}
            </div>
          </div>

          {!tech && (
            <div className="jh-modal__meta">
              <div>
                <div className="jh-modal__meta-k">Location</div>
                <div className="jh-modal__meta-v">{project.location}</div>
              </div>
              {hasMeaningfulValue(project.value) && (
                <div>
                  <div className="jh-modal__meta-k">Value</div>
                  <div className="jh-modal__meta-v">{project.value}</div>
                </div>
              )}
              <div>
                <div className="jh-modal__meta-k">Dates</div>
                <div className="jh-modal__meta-v">{project.dates}</div>
              </div>
              <div>
                <div className="jh-modal__meta-k">Role</div>
                <div className="jh-modal__meta-v">{project.role}</div>
              </div>
            </div>
          )}

          <div className="jh-modal__section">
            <div className="jh-modal__h">Project</div>
            <p className="jh-prose">
              {tech ? project.detail : project.description}
            </p>
          </div>

          {!tech && (
            <div className="jh-modal__section">
              <div className="jh-modal__h">My contributions</div>
              <ul className="jh-list">
                {project.contributions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {related.length > 0 && (
            <div className="jh-modal__section">
              <div className="jh-modal__h">Related</div>
              <div className="jh-related">
                {related.map((r) => (
                  <div key={r.id} className="jh-related__item">
                    <div
                      className="jh-related__sw"
                      style={{ background: r.swatch }}
                    />
                    <div>
                      <div className="jh-related__t">{r.title}</div>
                      <div className="jh-related__l">{r.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
