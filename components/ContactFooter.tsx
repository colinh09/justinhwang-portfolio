import { SITE } from "@/lib/content";
import ContactForm from "./ContactForm";
import SectionHeader from "./SectionHeader";

export default function ContactFooter() {
  const locationLine = SITE.profile.locations.join(" · ");
  const year = new Date().getFullYear();

  return (
    <section id="contact" className="jh-section jh-footer">
      <SectionHeader num="04" kicker="Contact" title="Get in touch." />
      <div className="jh-contact-block">
        <p className="jh-prose jh-contact-intro">
          Send a message below, or email{" "}
          <a href={`mailto:${SITE.profile.email}`}>{SITE.profile.email}</a>{" "}
          directly for time-sensitive requests. Also reachable on{" "}
          <a
            href={SITE.profile.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
          . Based in {locationLine}.
        </p>
        <ContactForm />
      </div>
      <div className="jh-copyright">
        <span>
          © {year} {SITE.profile.name}
        </span>
      </div>
    </section>
  );
}
