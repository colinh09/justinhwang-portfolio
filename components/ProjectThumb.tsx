"use client";

import { useRef } from "react";

interface Props {
  swatch: string;
  label: string;
  image?: string;
  /** When set, an mp4 that plays as a muted, looping hover video layered over
      the static `image` poster. Reverts to the image when the cursor leaves. */
  video?: string;
}

export default function ProjectThumb({ swatch, label, image, video }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleEnter = () => {
    const v = videoRef.current;
    if (!v) return;
    // Respect reduced-motion: leave the static poster in place, never autoplay.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    v.currentTime = 0;
    // play() can reject if a leave/pause interrupts it mid-load — swallow it.
    void v.play().catch(() => {});
  };

  const handleLeave = () => {
    videoRef.current?.pause();
  };

  return (
    <div
      className="jh-thumb"
      style={{ background: swatch }}
      onMouseEnter={video ? handleEnter : undefined}
      onMouseLeave={video ? handleLeave : undefined}
    >
      {image ? (
        <img
          src={image}
          alt={label}
          className="jh-thumb__img"
          loading="lazy"
        />
      ) : (
        <div className="jh-thumb__grid" />
      )}
      {video ? (
        <video
          ref={videoRef}
          className="jh-thumb__video"
          muted
          loop
          playsInline
          preload="none"
          poster={image}
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src={video} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}
