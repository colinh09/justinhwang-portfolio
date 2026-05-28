import type { Metadata } from "next";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jh-projectcontrols.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Justin Hwang — Senior Project Controls Engineer · PMP",
    template: "%s · Justin Hwang",
  },
  description:
    "Twelve years estimating, scheduling, and controlling complex construction work across transit, healthcare, residential, and Class-A corporate interiors.",
  keywords: [
    "project controls",
    "cost estimating",
    "construction",
    "PMP",
    "MTA",
    "preconstruction",
    "change management",
    "procurement",
    "Power BI",
    "Primavera P6",
  ],
  authors: [{ name: "Justin Hwang" }],
  creator: "Justin Hwang",
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Justin Hwang — Senior Project Controls Engineer · PMP",
    description:
      "Twelve years at the intersection of design intent and commercial reality across transit, healthcare, residential, and Class-A corporate interiors.",
    siteName: "Justin Hwang",
    images: [
      {
        url: "/website_preview.png",
        width: 1757,
        height: 1117,
        alt: "Justin Hwang — Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Justin Hwang — Senior Project Controls Engineer · PMP",
    description:
      "Twelve years at the intersection of design intent and commercial reality across transit, healthcare, residential, and Class-A corporate interiors.",
    images: ["/website_preview.png"],
  },
  robots: { index: true, follow: true },
};

const PERSON_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Justin Hwang",
  jobTitle: "Senior Project Controls Engineer",
  email: "JKH.Build@gmail.com",
  url: SITE_URL,
  address: { "@type": "PostalAddress", addressLocality: "New York", addressRegion: "NY" },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "SUNY at Buffalo",
  },
  hasCredential: ["PMP", "AACE Membership"],
  worksFor: { "@type": "Organization", name: "Naik Group" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSONLD) }}
        />
      </head>
      <body>
        <a className="jh-skip" href="#hero">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
