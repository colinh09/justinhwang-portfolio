import ContactForm from "./ContactForm";
import SectionHeader from "./SectionHeader";

export default function ContactFooter() {
  return (
    <section id="contact" className="jh-section jh-footer">
      <SectionHeader num="04" kicker="Contact" title="Get in touch." />
      <div className="jh-contact-block">
        <p className="jh-prose jh-contact-intro">
          Send a message below, or email{" "}
          <a href="mailto:JKH.Build@gmail.com">JKH.Build@gmail.com</a> directly
          for time-sensitive requests. Also reachable on{" "}
          <a
            href="https://www.linkedin.com/in/justinnynj/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
          . Based in New York, NY · Seattle, WA.
        </p>
        <ContactForm />
      </div>
      <div className="jh-copyright">
        <span>© 2026 Justin Hwang</span>
      </div>
    </section>
  );
}
