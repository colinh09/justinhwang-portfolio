import { SERVICES } from "@/lib/content";
import SectionHeader from "./SectionHeader";

export default function ServicesSection() {
  return (
    <section id="services" className="jh-section">
      <SectionHeader num="03" kicker="Services" title="Capabilities." />
      <div className="jh-services">
        {SERVICES.map((s) => (
          <div key={s.n} className="jh-service">
            <div className="jh-service__num">{s.n}</div>
            <div className="jh-service__title">{s.title}</div>
            <div className="jh-service__desc">{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
