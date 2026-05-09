import Link from "next/link";

export default function NotFound() {
  return (
    <main className="jh-404">
      <div className="jh-404__num">404</div>
      <h1 className="jh-404__title">Page not found.</h1>
      <p className="jh-prose">The link is broken or the page has moved.</p>
      <Link className="jh-404__back" href="/">
        ← Back to portfolio
      </Link>
    </main>
  );
}
