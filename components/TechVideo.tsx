"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  title: string;
}

type Status = "idle" | "playing" | "paused" | "ended";

/**
 * Modal hero video player. Renders in place of the image carousel for tech
 * projects that set `video`. A single full-bleed toggle button overlays the
 * video: it shows a Play glyph when idle/paused and a Replay glyph once the
 * clip ends; while playing it's chrome-less but still clickable to pause.
 * Muted by design — the clip is a silent wireframe animation.
 */
export default function TechVideo({ src, title }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  // Show the first video frame as soon as the modal opens, so it reads as a
  // paused video rather than a blank hero. preload="auto" pulls the (tiny)
  // clip on mount; nudging currentTime forces browsers that would otherwise
  // paint nothing to decode and display frame 0.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const paintFirstFrame = () => {
      if (v.currentTime === 0) {
        try {
          v.currentTime = 0.001;
        } catch {
          /* not seekable yet; the loadedmetadata listener retries */
        }
      }
    };
    if (v.readyState >= 1) paintFirstFrame();
    else v.addEventListener("loadedmetadata", paintFirstFrame, { once: true });
    return () => v.removeEventListener("loadedmetadata", paintFirstFrame);
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (status === "playing") {
      v.pause();
      return;
    }
    // Restart from the top when replaying a finished clip.
    if (status === "ended" || v.ended) v.currentTime = 0;
    void v.play().catch(() => {});
  };

  const label =
    status === "playing"
      ? "Pause video"
      : status === "ended"
      ? "Replay video"
      : "Play video";

  return (
    <div className="jh-video">
      <video
        ref={videoRef}
        className="jh-video__el"
        muted
        playsInline
        preload="auto"
        onPlay={() => setStatus("playing")}
        onPause={() =>
          setStatus((s) => (videoRef.current?.ended ? s : "paused"))
        }
        onEnded={() => setStatus("ended")}
      >
        <source src={src} type="video/mp4" />
      </video>

      <button
        type="button"
        className={`jh-video__btn${
          status === "playing" ? " is-playing" : ""
        }`}
        onClick={toggle}
        aria-label={`${label} — ${title}`}
      >
        <span className="jh-video__btn-icon" aria-hidden="true">
          {status === "ended" ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          ) : (
            <svg
              className="jh-video__play-glyph"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="100%"
              height="100%"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}
