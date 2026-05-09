import SectionHeader from "./SectionHeader";

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

export default function AboutSection() {
  return (
    <section id="about" className="jh-section">
      <SectionHeader num="04" kicker="About" title="Background." />
      <div className="jh-about-grid">
        <div>
          <p className="jh-prose jh-prose--lg">
            I work at the intersection of design intent and commercial reality
            — where what was designed, what&apos;s being built, and what it
            costs begin to diverge.
          </p>
          <p className="jh-prose">
            My background spans preconstruction estimating, procurement,
            project management, and commercial management across transit
            infrastructure, commercial buildings, and other sectors. That
            breadth wasn&apos;t a career plan — it came from repeatedly
            stepping into unfamiliar scope and closing knowledge gaps quickly
            enough to add real value.
          </p>
          <p className="jh-prose">
            I approach unfamiliar scope by breaking down the sequence of work,
            closing knowledge gaps through the right conversations, and taking
            ownership of the learning curve. Compounded over a decade of
            project delivery, that approach has put me in a position to engage
            any project stakeholder on a technical level, lead clients to
            informed decisions they can defend, and represent client interests
            in front of industry experts in their own trades.
          </p>
          <p className="jh-prose">
            Currently at Naik Group in New York. Previously at Steel Equities,
            Gardiner &amp; Theobald, The LiRo Group, and the Gilbane / LiRo
            Joint Venture across NYC and Buffalo.
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
        </aside>
      </div>
    </section>
  );
}
