import ContactForm from "./ContactForm";
import SectionHeader from "./SectionHeader";

export default function ContactFooter() {
  return (
    <section id="contact" className="jh-section jh-footer">
      <SectionHeader num="04" kicker="Contact" title="Get in touch." />
      <div className="jh-contact">
        <a className="jh-contact__big" href="mailto:JKH.Build@gmail.com">
          JKH.Build@gmail.com
        </a>
        <div className="jh-contact__row">
          <a
            href="https://www.linkedin.com/in/justinnynj/"
            target="_blank"
            rel="noopener noreferrer"
            className="jh-contact__link"
          >
            LinkedIn ↗
          </a>
          <span className="jh-contact__sep">·</span>
          <span>New York, NY · Seattle, WA</span>
        </div>
      </div>
      <div className="jh-contact-form-wrap">
        <div className="jh-contact-form-h">
          <span className="jh-contact-form-rule" />
          Or send a message
        </div>
        <ContactForm />
      </div>
      <div className="jh-copyright">
        <span>© 2026 Justin Hwang</span>
      </div>
    </section>
  );
}
