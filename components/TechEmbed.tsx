"use client";

import { useEffect, useRef, useState } from "react";
import type { TechProject } from "@/lib/types";

interface Props {
  project: TechProject;
  embedUrl: string;
}

type EmbedState =
  | { status: "loading" }
  | { status: "loaded" }
  | { status: "failed"; reason: "timeout" | "error" };

const LOAD_TIMEOUT_MS = 10_000;

export default function TechEmbed({ project, embedUrl }: Props) {
  const [state, setState] = useState<EmbedState>({ status: "loading" });
  const timerRef = useRef<number | null>(null);

  // Mount once. Modal sets key={embedUrl} on this component, so a switch
  // between two embed projects remounts and reinitializes state cleanly.
  useEffect(() => {
    timerRef.current = window.setTimeout(() => {
      setState((prev) =>
        prev.status === "loading"
          ? { status: "failed", reason: "timeout" }
          : prev
      );
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timerRef.current ?? undefined);
  }, []);

  const handleLoad = () => {
    window.clearTimeout(timerRef.current ?? undefined);
    setState({ status: "loaded" });
  };

  const handleError = () => {
    window.clearTimeout(timerRef.current ?? undefined);
    setState({ status: "failed", reason: "error" });
  };

  const title = project.embedLabel || project.title;
  const fallback = project.embedFallbackImage;

  return (
    <div className="jh-embed">
      {state.status !== "failed" && (
        <iframe
          className="jh-embed__iframe"
          src={embedUrl}
          title={title}
          frameBorder="0"
          allowFullScreen
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={handleLoad}
          onError={handleError}
          style={{ width: "100%", height: "100%", display: "block", border: 0 }}
        />
      )}

      {state.status === "loading" && (
        <div className="jh-embed__overlay" role="status" aria-live="polite">
          {fallback && (
            <img
              src={fallback}
              alt=""
              className="jh-embed__fallback-img"
              aria-hidden="true"
            />
          )}
          <div className="jh-embed__loading">
            <span className="jh-embed__spinner" aria-hidden="true" />
            <span className="jh-embed__loading-text">
              Loading interactive report…
            </span>
          </div>
        </div>
      )}

      {state.status === "failed" && (
        <div className="jh-embed__overlay jh-embed__overlay--failed" role="alert">
          {fallback && (
            <img
              src={fallback}
              alt={`${title} (static preview)`}
              className="jh-embed__fallback-img"
            />
          )}
          <div className="jh-embed__failure">
            <p className="jh-embed__failure-msg">
              {state.reason === "timeout"
                ? "This report is taking longer than usual to load."
                : "This report couldn't be loaded here."}
            </p>
            <a
              className="jh-embed__cta"
              href={embedUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open dashboard in a new tab <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
