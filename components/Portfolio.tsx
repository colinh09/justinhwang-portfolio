"use client";

import { useEffect, useState } from "react";
import type { AnyProject } from "@/lib/types";
import Sidebar from "./Sidebar";
import Hero from "./Hero";
import TechSection from "./TechSection";
import ConstructionSection from "./ConstructionSection";
import AboutSection from "./AboutSection";
import ServicesSection from "./ServicesSection";
import ContactFooter from "./ContactFooter";
import Modal from "./Modal";
import FadeUp from "./FadeUp";

const SECTION_IDS = [
  "hero",
  "technical",
  "construction",
  "about",
  "services",
  "contact",
];

export default function Portfolio() {
  const [activeProject, setActiveProject] = useState<AnyProject | null>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        }),
      { rootMargin: "-30% 0px -50% 0px" }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const onNav = (id: string) => {
    setMobileNav(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="jh-app">
      <button
        className="jh-mobile-toggle"
        onClick={() => setMobileNav((v) => !v)}
        aria-label="Menu"
      >
        <span className="jh-mobile-name">Justin Hwang</span>
        <span className="jh-mobile-burger">
          <span />
          <span />
          <span />
        </span>
      </button>

      <div className={`jh-sidebar-wrap ${mobileNav ? "is-open" : ""}`}>
        <Sidebar activeSection={activeSection} onNav={onNav} />
      </div>

      <main className="jh-main">
        <Hero />
        <FadeUp>
          <TechSection onOpen={setActiveProject} />
        </FadeUp>
        <FadeUp>
          <ConstructionSection onOpen={setActiveProject} />
        </FadeUp>
        <FadeUp>
          <AboutSection />
        </FadeUp>
        <FadeUp>
          <ServicesSection />
        </FadeUp>
        <FadeUp>
          <ContactFooter />
        </FadeUp>
      </main>

      <Modal project={activeProject} onClose={() => setActiveProject(null)} />
    </div>
  );
}
