"use client";

import { useEffect, useState } from "react";

const TOOLS = [
  "Power BI",
  "Excel",
  "SQL",
  "TypeScript",
  "Primavera P6",
  "On-Screen Takeoff",
  "Bluebeam",
  "RSMeans",
  "EquipmentWatch",
  "Procore",
  "Kahua",
];

export default function Hero() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const tm = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(tm);
  }, []);

  const name = "Justin Hwang";
  const renderedName = Array.from(name).map((c, i) => (
    <span
      key={i}
      className={`jh-char ${revealed ? "is-in" : ""}`}
      style={{ transitionDelay: `${i * 35}ms` }}
    >
      {c === " " ? " " : c}
    </span>
  ));

  return (
    <section id="hero" className="jh-section jh-hero">
      <div className="jh-about-grid">
        <div>
          <h1 className="jh-display jh-display--inline">{renderedName}</h1>
          <div className="jh-eyebrow jh-eyebrow--under">Portfolio · 2026</div>
          <p className="jh-lede">
            I work at the intersection of <em>design intent</em> and{" "}
            <em>commercial reality</em>.
          </p>

          <div className="jh-hero__divider" />

          <p className="jh-prose">
            What was designed, what&apos;s being built, and what it costs
            don&apos;t always line up. The gap shows up later — as change
            orders, cost overruns, and budget variance against the approved
            capital plan.
          </p>
          <p className="jh-prose">
            My background spans preconstruction estimating, procurement,
            project management, and commercial management across transit
            infrastructure, commercial buildings, and other sectors. That
            range wasn&apos;t a career plan — it came from repeatedly stepping
            into unfamiliar scope and closing knowledge gaps quickly enough
            to add real value.
          </p>
          <p className="jh-prose">
            I approach unfamiliar scope by breaking down the sequence of work,
            closing knowledge gaps through the right conversations, and taking
            ownership of the learning curve. That approach, compounded over a
            decade of project delivery, has put me in a position to engage any
            project stakeholder on a technical level, lead clients to informed
            decisions they can defend, and represent client interests in front
            of industry experts in their own trades.
          </p>
          <p className="jh-prose">
            Currently at Naik Group in New York. Previously at Steel Equities,
            Gardiner &amp; Theobald, The LiRo Group, and the Gilbane / LiRo
            Joint Venture in NYC and Buffalo.
          </p>
        </div>
        <aside className="jh-about-side">
          <div className="jh-about-card">
            <div className="jh-about-h">Credentials</div>
            <ul className="jh-about-list">
              <li>
                <strong>B.Eng Civil</strong>
                <span>SUNY at Buffalo</span>
              </li>
              <li>
                <strong>PMP</strong>
                <span>Project Management Institute</span>
              </li>
              <li>
                <strong>AACE Member</strong>
                <span>Cost &amp; Schedule</span>
              </li>
            </ul>
          </div>
          <div className="jh-about-card">
            <div className="jh-about-h">Toolkit</div>
            <ul className="jh-about-tools">
              {TOOLS.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
          <div className="jh-about-card">
            <div className="jh-about-h">Connect</div>
            <ul className="jh-connect-list">
              <li>
                <a href="mailto:JKH.Build@gmail.com">
                  <span>Email</span>
                  <span className="jh-connect-list__cue">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/justinnynj/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>LinkedIn</span>
                  <span className="jh-connect-list__cue">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="/Justin_Hwang_Resume.pdf"
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
