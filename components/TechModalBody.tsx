"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TechProject } from "@/lib/types";
import { getActiveSections, type ActiveSection } from "@/lib/sections";

interface Props {
  project: TechProject;
}

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* The tech modal no longer scrolls internally — the outer `.jh-modal`
 * overlay is the scroller. Spy + click-jump both target that element,
 * which is resolved lazily because TechModalBody mounts as a child of
 * the modal. */
const findOuterScroller = (start: HTMLElement | null): HTMLElement | null => {
  let el: HTMLElement | null = start;
  while (el) {
    if (el.classList.contains("jh-modal")) return el;
    el = el.parentElement;
  }
  return null;
};

export default function TechModalBody({ project }: Props) {
  const sections = useMemo(() => getActiveSections(project), [project]);
  const [activeId, setActiveId] = useState<string | undefined>(
    () => sections[0]?.id
  );
  const rootRef = useRef<HTMLDivElement | null>(null);
  const refsMap = useRef<Record<string, HTMLElement | null>>({});
  // Suppress the scroll-spy briefly after a click so intermediate scroll
  // frames don't override the just-set activeId.
  const programmaticScrollRef = useRef(false);
  const programmaticTimerRef = useRef<number | null>(null);

  // Derive in render rather than syncing via effect — when the project
  // changes mid-modal, the previous activeId may no longer match.
  const renderedActiveId = sections.some((s) => s.id === activeId)
    ? activeId
    : sections[0]?.id;

  const sectionTopWithinScroller = (
    id: string,
    scroller: HTMLElement
  ): number | null => {
    const el = refsMap.current[id];
    if (!el) return null;
    return (
      el.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop
    );
  };

  const jump = (id: string) => {
    const scroller = findOuterScroller(rootRef.current);
    if (!scroller) return;
    const top = sectionTopWithinScroller(id, scroller);
    if (top == null) return;
    programmaticScrollRef.current = true;
    if (programmaticTimerRef.current != null) {
      window.clearTimeout(programmaticTimerRef.current);
    }
    scroller.scrollTo({
      top,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    setActiveId(id);
    // Release the spy after a typical smooth-scroll settles. Reduced
    // motion finishes instantly, so the suppression is just a no-op.
    programmaticTimerRef.current = window.setTimeout(() => {
      programmaticScrollRef.current = false;
      programmaticTimerRef.current = null;
    }, 800);
  };

  useEffect(() => {
    const scroller = findOuterScroller(rootRef.current);
    if (!scroller) return;

    const onScroll = () => {
      // Click-initiated smooth scroll owns the activeId until it settles.
      if (programmaticScrollRef.current) return;
      let cur: string | undefined = sections[0]?.id;
      // At the bottom: the last section is active by definition — its
      // heading can't reach the top of the scroller because there isn't
      // enough content below to scroll it that far.
      const atBottom =
        scroller.scrollTop + scroller.clientHeight >=
        scroller.scrollHeight - 2;
      if (atBottom) {
        cur = sections[sections.length - 1]?.id ?? cur;
      } else {
        for (const s of sections) {
          const top = sectionTopWithinScroller(s.id, scroller);
          if (top != null && top - 6 <= scroller.scrollTop) cur = s.id;
        }
      }
      setActiveId((prev) => (prev === cur ? prev : cur));
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      if (programmaticTimerRef.current != null) {
        window.clearTimeout(programmaticTimerRef.current);
        programmaticTimerRef.current = null;
      }
    };
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <div ref={rootRef} className="jh-sn-body">
      <aside className="jh-sn-nav" aria-label="Project section navigation">
        {sections.map((s) => {
          const active = renderedActiveId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              className={`jh-sn-link${active ? " is-active" : ""}`}
              onClick={() => jump(s.id)}
              aria-current={active ? "true" : undefined}
            >
              <span className="jh-sn-dot" aria-hidden="true" />
              {s.navLabel}
            </button>
          );
        })}
      </aside>
      <div className="jh-sn-scroll">
        {sections.map((sec) => (
          <section
            key={sec.id}
            ref={(el) => {
              refsMap.current[sec.id] = el;
            }}
            className="jh-sec"
          >
            <div className="jh-sec-label">
              <span>{sec.label}</span>
              <span className="jh-sec-label__rule" aria-hidden="true" />
            </div>
            <SectionContent section={sec} />
          </section>
        ))}
      </div>
    </div>
  );
}

function SectionContent({ section }: { section: ActiveSection }) {
  if (section.kind === "prose") {
    return (
      <>
        {section.value.map((para, i) => (
          <p key={i} className="jh-sec-desc">
            {para}
          </p>
        ))}
      </>
    );
  }
  return (
    <ol className="jh-ni-list">
      {section.value.map((item, i) => (
        <li key={i} className="jh-ni">
          <span className="jh-ni-num" aria-hidden="true">
            {i + 1}.
          </span>
          <div className="jh-ni-text">
            <span className="jh-ni-lead">{item.lead}.</span> {item.body}
          </div>
        </li>
      ))}
    </ol>
  );
}
