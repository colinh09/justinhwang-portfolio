"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const tm = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(tm);
  }, []);

  const name = "Justin Hwang";
  const words = name.split(" ");
  let charIdx = 0;
  const renderedName = words.map((word, wi) => (
    <span key={wi} className="jh-word">
      {word.split("").map((c) => {
        const i = charIdx++;
        return (
          <span
            key={i}
            className={`jh-char ${revealed ? "is-in" : ""}`}
            style={{ transitionDelay: `${i * 35}ms` }}
          >
            {c}
          </span>
        );
      })}
    </span>
  ));

  return (
    <section id="hero" className="jh-section jh-hero">
      <div className="jh-hero__split-grid">
        <div>
          <div className="jh-eyebrow">Portfolio · 2026</div>
          <h1 className="jh-display">{renderedName}</h1>
        </div>
        <div>
          <p className="jh-lede">
            I work at the intersection of <em>design intent</em> and{" "}
            <em>commercial reality</em>.
          </p>
          <p className="jh-sub">
            A decade across preconstruction estimating, procurement, project
            management, and commercial management — transit infrastructure,
            healthcare, residential, and Class-A corporate interiors.
          </p>
        </div>
      </div>
    </section>
  );
}
