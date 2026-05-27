"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CONSTRUCTION_PROJECTS } from "@/lib/content";
import { isTechProject, type AnyProject } from "@/lib/types";
import TechModalBody from "@/components/TechModalBody";
import TechEmbed from "@/components/TechEmbed";

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
  const pdf = tech ? project.pdf : undefined;
  const repo = tech ? project.repo : undefined;
  const embedUrl = tech ? project.embedUrl : undefined;
  const liveHref = tech ? project.liveUrl ?? project.embedUrl : undefined;
  const liveStyle = tech ? project.liveStyle : undefined;
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
      className={`jh-modal${tech ? " jh-modal--tech" : ""}`}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`jh-modal__inner${tech ? " jh-modal__inner--tech" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        {!tech && (
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
        )}

        {tech && (
          <div className="jh-modal__topbar">
            <div className="jh-modal__topbar-left">
              {embedUrl && (
                <span
                  className="jh-embed__badge"
                  aria-label="Interactive Power BI report"
                >
                  <span className="jh-embed__badge-dot" aria-hidden="true" />
                  <span>
                    INTERACTIVE
                    <span className="jh-embed__badge-suffix">
                      {" · POWER BI"}
                    </span>
                  </span>
                </span>
              )}
              {!embedUrl && liveStyle === "demo" && (
                <span
                  className="jh-embed__badge jh-embed__badge--demo"
                  aria-label="This project gates access behind a demo request"
                >
                  <span className="jh-embed__badge-dot" aria-hidden="true" />
                  <span>REQUEST DEMO</span>
                </span>
              )}
            </div>
            <div className="jh-modal__topbar-right">
              {pdf && (
                <a
                  className="jh-pill jh-pill--dark"
                  href={pdf}
                  download
                  aria-label={`Download ${project.title} as PDF`}
                >
                  <svg
                    className="jh-pill__icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M12 7.2V15.1M8.4 11.5L12 15.5L15.6 11.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  PDF
                </a>
              )}
              {repo && (
                <a
                  className="jh-pill jh-pill--dark"
                  href={repo}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${project.title} repository in a new tab`}
                >
                  <svg
                    className="jh-pill__icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-1.92c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.27-5.24-5.67 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.9 10.9 0 015.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.41-2.7 5.37-5.27 5.66.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
                  </svg>
                  Repo
                </a>
              )}
              {liveHref && (
                <a
                  className="jh-pill jh-pill--dark"
                  href={liveHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`View ${project.title} live in a new tab`}
                >
                  View live <span aria-hidden="true">↗</span>
                </a>
              )}
              <button
                type="button"
                className="jh-pill jh-pill--dark jh-pill--close"
                onClick={onClose}
                aria-label="Close"
              >
                <svg
                  className="jh-pill__icon"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M5 5 L15 15 M15 5 L5 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div
          className={`jh-modal__hero${tech ? " jh-modal__hero--tech" : ""}`}
          style={{
            background: embedUrl || hasImages ? "#0d0a07" : project.swatch,
          }}
          onKeyDown={
            hasImages && images.length > 1
              ? (e) => {
                  if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    prev();
                  } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    next();
                  }
                }
              : undefined
          }
        >
          {tech && embedUrl ? (
            <TechEmbed key={embedUrl} project={project} embedUrl={embedUrl} />
          ) : hasImages ? (
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
        </div>

        <div className="jh-modal__body">
          <div className="jh-modal__head">
            <div className="jh-modal__head-main">
              <h2 id={titleId} className="jh-display">
                {project.title}
              </h2>
              {!tech && <div className="jh-modal__sub">{project.sub}</div>}
            </div>
            {tech ? (
              <div
                className={`jh-chips${
                  project.tags.length > 5 ? " jh-chips--grid5" : ""
                }`}
              >
                {project.tags.map((t) => (
                  <span key={t} className="jh-chip">
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <div className="jh-chips">
                <span className="jh-chip jh-chip--sector">
                  {project.sector}
                </span>
                <span className="jh-chip jh-chip--role">{project.role}</span>
              </div>
            )}
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

          {tech ? (
            <TechModalBody project={project} />
          ) : (
            <div className="jh-modal__section">
              <div className="jh-modal__h">Project</div>
              <p className="jh-prose">{project.description}</p>
            </div>
          )}

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
