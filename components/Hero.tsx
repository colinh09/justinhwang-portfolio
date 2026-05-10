"use client";

import { Fragment, useEffect, useState } from "react";
import { SITE } from "@/lib/content";

export default function Hero() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const tm = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(tm);
  }, []);

  let charIndex = 0;
  const words = SITE.profile.name.split(" ");
  const renderedName = words.flatMap((word, wi) => {
    const wordSpan = (
      <span key={`w${wi}`} className="jh-word">
        {Array.from(word).map((c) => {
          const i = charIndex++;
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
    );
    return wi < words.length - 1
      ? [wordSpan, <Fragment key={`s${wi}`}> </Fragment>]
      : [wordSpan];
  });

  return (
    <section id="hero" className="jh-section jh-hero">
      <div className="jh-about-grid">
        <div className="jh-hero__lead">
          <h1 className="jh-display jh-display--inline">{renderedName}</h1>
          <div className="jh-eyebrow jh-eyebrow--under">
            {SITE.hero.eyebrow}
          </div>
          <p className="jh-lede">
            I work at the intersection of <em>design intent</em> and{" "}
            <em>commercial reality</em>
          </p>

          <div className="jh-hero__divider" />

          {SITE.hero.bio.map((paragraph, i) => (
            <p key={i} className="jh-prose">
              {paragraph}
            </p>
          ))}
        </div>
        <aside className="jh-about-side">
          <div className="jh-about-card">
            <div className="jh-about-h">Credentials</div>
            <ul className="jh-about-list">
              {SITE.credentials.map((c) => (
                <li key={c.name}>
                  <strong>{c.name}</strong>
                  <span>{c.issuer}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="jh-about-card">
            <div className="jh-about-h">Toolkit</div>
            <ul className="jh-about-tools">
              {SITE.toolkit.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
          <div className="jh-about-card">
            <div className="jh-about-h">Connect</div>
            <ul className="jh-connect-list">
              <li>
                <a href={`mailto:${SITE.profile.email}`}>
                  <span>Email</span>
                  <span className="jh-connect-list__cue">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={SITE.profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>LinkedIn</span>
                  <span className="jh-connect-list__cue">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={SITE.profile.resumePath}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Resume</span>
                  <span className="jh-connect-list__cue">↓</span>
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
