# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio site for Justin Hwang (project controls engineer), deployed to jh-projectcontrols.com. Next.js 15 (App Router), React 19, TypeScript (strict mode).

## Recent work

The technical project modal was redesigned and shipped via PR #6 (6 phases plus user polish iterations): responsive sizing, schema extension, header topbar with action pills, sidenav body with scroll-spy, Power BI live embed, a11y / keyboard polish. Durable phase-by-phase record in [PROJECT_STATE.md](PROJECT_STATE.md). Spec, kickoff, phase prompts, prototype, and screenshots live locally under `side projects/powerbiembed/` (gitignored; reference by path, do not paste into context).

Since PR #6 the tech project lineup on `main` has stabilized at 8 entries (tech-2, tech-2b, tech-3, tech-5, tech-6, tech-7, tech-8, tech-9). tech-1 (58 Devices Labor Burn Dashboard) and tech-4 (Basic Expense Report) were scrapped and removed entirely along with their image assets; every remaining tech entry carries `description` + `objectives` + `challenges` + `futureFeatures`, so the `detail[]` legacy-fallback in `getActiveSections` is unreachable. New since the redesign: tech-7 (d3bi.app capstone, image rasterized from `capstone1.pdf` at 2x), tech-8 (PMIS Parser; v1 vendor target repointed from Procore to Oracle Primavera Unifier, image rasterized from `Parser1.pdf` and padded to 16:9), tech-9 (ConBon.app; `liveUrl: https://conbon.app`, `liveStyle: "demo"`, dark-mode board screenshot padded to 16:9). tech-3 (Agency Contingent Employee Staffing Tracker) gained `embedUrl` post-redesign, so tech-2b and tech-3 now both render live Power BI reports inline. Card chip is schema-driven across three variants: `● INTERACTIVE` (`.jh-chip--interactive`, all-caps 9px) when `embedUrl` is set; `● Live Link` (`.jh-chip--live`, title-case 11px) for default `liveUrl` projects; `● Request Demo` (`.jh-chip--demo`, burgundy 11px) when `liveStyle: "demo"` is set. SCA Mentor Program role was corrected from Estimator to Project Controls. `scripts/build-tech-content-doc.py` is intentionally untracked; one-off helper that exported tech-project records as an editable Word doc during content authoring.

Two subtle CSS fixes worth flagging: `.jh-chip { line-height: 1.2 }` is now set explicitly (without it, chips inherited body's 1.55 and the row-to-row vertical gap read cramped against the wider horizontal padding); and the tech modal grew a short-viewport scroll fallback at `@media (max-height: 1100px) and (min-width: 701px)` that mirrors the existing mobile fallback (drops the inner's max-height plus internal sn-scroll, lets the outer overlay handle overflow). The 1100px threshold (originally 900px) accounts for the `html { zoom: 1.1 }` interaction: a CSS 100vh box renders 1.1× taller in device pixels, so even ~960–1080 CSS-px viewports (typical 1080p monitors with Chrome chrome) overflow without the fallback.

Frontend-design pass shipped on top of those fixes: (1) `components/FadeUp.tsx` was rewritten as progressive enhancement — SSR renders `<div class="jh-fadeup">` with no styles, and JS adds `jh-fadeup--prime` in a `useLayoutEffect` before paint, then `is-in` via IntersectionObserver. If JS fails to hydrate, all four main sections stay visible. (2) Body sans swapped from Inter to **IBM Plex Sans** (`--jh-sans`) — pairs warm-serif Newsreader with a slightly-technical sans that matches the project-controls identity. (3) Paper-grain overlay on `body::before` (fixed, full-viewport, opacity 0.06, mix-blend-mode multiply, z-index 1 below the z:50 modal) — adds subtle paper-stock texture to the cream background while staying near-invisible on the dark sidebar. Honors `prefers-reduced-motion: reduce`. (4) Section eyebrows breathe wider — `.jh-kicker` letter-spacing transitions from `0.16em` (primed) to `0.22em` (in-view) over 1.2s when the FadeUp wrapper enters view; reduced-motion pins it at 0.16em. (5) `.jh-copyright` flex no-op removed (single child); ultrawide breakpoint lowered from 2600 → 2560 so 27" 1440p monitors get the bigger sidebar tier.

The chip-variant family also evolved: `.jh-chip--demo` (burgundy card chip) and `.jh-embed__badge--demo` (matching modal topbar-left badge) join the green `.jh-chip--interactive` / `.jh-chip--live` / `.jh-embed__badge` pair. All four share one `@keyframes jh-embed-pulse` block by threading a `--jh-dot-color` RGB-triplet custom property through `.jh-embed__badge-dot`, so each variant just sets that property to recolor the dot + pulse — no keyframe duplication. INTERACTIVE on the card was also dropped to `font-size: 9px` with `line-height: 13.2px` pinned to the 11×1.2 line-box of the title-case variants, so all three card chip variants render at identical 25.30px pill heights. Depth: see [`portfolio-update`](.claude/skills/portfolio-update/SKILL.md) "Card chip variants" for the full table + the responsive `· POWER BI` suffix shrink pattern (viewport media query in the topbar, container query on the card).

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

## Claude Code skills

Skills available from `.claude/skills/`:

- `portfolio-update` — project-specific quick-reference. Auto-triggers on any portfolio edit; covers architecture, gotchas, deploy flow, things-not-to-do. Start here for any work in this repo.
- `next-best-practices`, `vercel-react-best-practices`, `typescript-advanced-types` — project-scoped (real source under `.agents/skills/`, symlinked into `.claude/skills/`).
- `frontend-design` — real directory in `.claude/skills/`. Visual-quality guardrail against AI-generic styling.

These are not auto-invoked on every change. For ad-hoc work, invoke explicitly when relevant; do not lean on every rule for every diff.

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

`components/Modal.tsx` is the only modal. It renders both technical and construction projects, branching at runtime on the `isTechProject()` type guard from `lib/types.ts`. Project cards (`TechSection` / `ConstructionSection`) do not open their own modals — they call an `onOpen(project)` callback that sets `activeProject` on `Portfolio`, and the shared `Modal` renders it. The modal owns its image carousel, focus trap, body-scroll lock, and Escape / click-outside close behavior. For tech projects, the body is delegated to `components/TechModalBody.tsx`, driven by the section registry in `lib/sections.ts` (Description / Learning Goals / Challenges / What's Next?); construction projects keep the simpler inline body (Project / My contributions / Related) in `Modal.tsx`. All tech modals carry a dark `.jh-modal__topbar` band at the very top with the action pills (PDF, Repo, View live, ×); for embed projects the band's left side carries the INTERACTIVE badge. When a tech project has `embedUrl`, the hero is replaced by `components/TechEmbed.tsx` (Power BI iframe with a load / timeout / error state machine); the `frame-src` CSP in `next.config.mjs` whitelists `app.powerbi.com` and `*.powerbi.com`.

### Contact form

`components/ContactForm.tsx` (client) POSTs to `app/api/contact/route.ts` — the only API route. The route validates input and sends mail via AWS SES (`@aws-sdk/client-sesv2`). It requires the server-side env vars `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SES_FROM_EMAIL`; if any are missing it returns a graceful 503 instead of crashing. `NEXT_PUBLIC_SITE_URL` is the only public env var (canonical URL for sitemap, OG image, JSON-LD). Copy `.env.example` → `.env.local` for local development.

### Styling

All styling is in one global stylesheet, `app/globals.css`. No CSS modules, no Tailwind, no CSS-in-JS. Class names follow a BEM-ish `jh-` prefix convention. Design tokens are CSS custom properties on `:root` (`--jh-bg`, `--jh-ink`, `--jh-mute`, `--jh-line`, `--jh-accent`, `--jh-display-font`, `--jh-sans`, `--jh-sidebar-w`, `--jh-pad`). Fonts — Newsreader (serif, display) and IBM Plex Sans (sans, body) — are loaded from Google Fonts in `app/layout.tsx`'s `<head>`.

**Gotcha:** `globals.css` sets `html { zoom: 1.1; }` — the whole site is intentionally rendered at 110%. This skews pixel-precise work: `getBoundingClientRect()` returns zoomed viewport pixels, `Element.scrollTop` / `scrollTo()` operate in unzoomed CSS pixels, and `getComputedStyle()` returns unzoomed values. Any scroll math that crosses these boundaries must divide the BCR delta by the live zoom factor (see `getZoom()` in `components/TechModalBody.tsx`). Prefer `em` / relative units, which are unaffected.

### Layout & SEO

`app/layout.tsx` defines `metadata` (title template, description, OpenGraph/Twitter) and injects a `Person` JSON-LD `<script>`. `app/sitemap.ts`, `app/robots.ts`, `app/icon.svg`, and `app/not-found.tsx` are Next.js convention files.

`components/AboutSection.tsx` exists but is not referenced anywhere (`Portfolio` uses `Hero` for the intro section) — treat it as dead code unless it gets wired up.

## Deployment

Pushes to `main` auto-deploy to Vercel; other branches get preview deployments. A broken `content/*.json` commit fails the Vercel build and leaves the previous deploy live (no downtime).
