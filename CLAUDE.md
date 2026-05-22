# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio site for Justin Hwang (project controls engineer), deployed to jh-projectcontrols.com. Next.js 15 (App Router), React 19, TypeScript (strict mode).

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server at http://localhost:3000
npm run build      # production build — also type-checks and lints
npm run start      # serve the production build
npm run lint       # next lint
```

No test suite is configured — there is no test runner and no test files.

`@/*` is aliased to the repo root (`tsconfig.json`), so imports look like `@/lib/content`, `@/components/Modal`.

## Architecture

### Content is data, not code

Every piece of editable site content lives as JSON in `content/` (`site.json`, `services.json`, `construction-projects.json`, `technical-projects.json`). The flow is:

`content/*.json` → typed and re-exported by `lib/content.ts` → imported directly by components as `SITE`, `SERVICES`, `TECH_PROJECTS`, `CONSTRUCTION_PROJECTS`.

There is no CMS, no data fetching, and no props-drilling of content — components do `import { SITE } from "@/lib/content"` directly. To change what the site displays, edit the JSON. All project/content schemas are defined in `lib/types.ts`.

`SECTORS` and `ROLES` are hardcoded as constants in `lib/content.ts` (not in JSON) because they are string unions tied to the TypeScript types and drive the construction-project filter chips. A `sector` or `role` value in `construction-projects.json` that does not exactly match one of these strings makes that project silently disappear from its filter — treat these fields as enums.

### Rendering & state

`app/page.tsx` renders one client component, `components/Portfolio.tsx`, which owns essentially all app state:

- `activeProject` — which project's modal is open (`null` = closed)
- `activeSection` — scroll-spy highlight, driven by an `IntersectionObserver` over the five section IDs (`hero`, `technical`, `construction`, `services`, `contact`)
- `mobileNav` — mobile sidebar toggle

`Portfolio` composes the `Sidebar`, the section components (`Hero`, `TechSection`, `ConstructionSection`, `ServicesSection`, `ContactFooter`), and a single `Modal`.

### One modal for two project types

`components/Modal.tsx` is the only modal. It renders both technical and construction projects, branching at runtime on the `isTechProject()` type guard from `lib/types.ts`. Project cards (`TechSection` / `ConstructionSection`) do not open their own modals — they call an `onOpen(project)` callback that sets `activeProject` on `Portfolio`, and the shared `Modal` renders it. The modal owns its image carousel, focus trap, body-scroll lock, and Escape / click-outside close behavior.

### Contact form

`components/ContactForm.tsx` (client) POSTs to `app/api/contact/route.ts` — the only API route. The route validates input and sends mail via AWS SES (`@aws-sdk/client-sesv2`). It requires the server-side env vars `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SES_FROM_EMAIL`; if any are missing it returns a graceful 503 instead of crashing. `NEXT_PUBLIC_SITE_URL` is the only public env var (canonical URL for sitemap, OG image, JSON-LD). Copy `.env.example` → `.env.local` for local development.

### Styling

All styling is in one global stylesheet, `app/globals.css`. No CSS modules, no Tailwind, no CSS-in-JS. Class names follow a BEM-ish `jh-` prefix convention. Design tokens are CSS custom properties on `:root` (`--jh-bg`, `--jh-ink`, `--jh-mute`, `--jh-line`, `--jh-accent`, `--jh-display-font`, `--jh-sans`, `--jh-sidebar-w`, `--jh-pad`). Fonts — Newsreader (serif, display) and Inter (sans, body) — are loaded from Google Fonts in `app/layout.tsx`'s `<head>`.

**Gotcha:** `globals.css` sets `html { zoom: 1.1; }` — the whole site is intentionally rendered at 110%. This skews pixel-precise work: `getBoundingClientRect()` returns zoomed pixels while `getComputedStyle()` returns unzoomed values. Prefer `em` / relative units, which are unaffected.

### Layout & SEO

`app/layout.tsx` defines `metadata` (title template, description, OpenGraph/Twitter) and injects a `Person` JSON-LD `<script>`. `app/sitemap.ts`, `app/robots.ts`, `app/icon.svg`, and `app/not-found.tsx` are Next.js convention files.

`components/AboutSection.tsx` exists but is not referenced anywhere (`Portfolio` uses `Hero` for the intro section) — treat it as dead code unless it gets wired up.

## Deployment

Pushes to `main` auto-deploy to Vercel; other branches get preview deployments. A broken `content/*.json` commit fails the Vercel build and leaves the previous deploy live (no downtime).
