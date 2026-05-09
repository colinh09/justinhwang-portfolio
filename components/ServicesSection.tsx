import SectionHeader from "./SectionHeader";

const SERVICES = [
  {
    n: "01",
    title: "Cost Estimating",
    desc: "Conceptual through GMP — line-item, parametric, and benchmark methods aligned to RSMeans, EquipmentWatch, and live market data. Page-turn reconciliation against contractor proposals to confirm full scope coverage.",
  },
  {
    n: "02",
    title: "Change Management",
    desc: "PCO origination through closeout. Independent estimates, scope reconciliation, and contractual correspondence supporting equitable settlements.",
  },
  {
    n: "03",
    title: "Procurement",
    desc: "Long-lead equipment tracking, A/E fee analysis, bid leveling, and vendor negotiation. Procurement schedules built backwards from installation milestones to protect TCO dates.",
  },
  {
    n: "04",
    title: "Project Controls",
    desc: "Schedule baseline, EAC forecasting, variance analysis against the capital plan, and Power BI / Excel reporting on cost and schedule.",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="jh-section">
      <SectionHeader num="05" kicker="Services" title="Capabilities." />
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
