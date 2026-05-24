# PROJECT_STATE.md — Project Modal Redesign

Durable record between sessions for the Power BI–embed modal redesign described in [side projects/powerbiembed/PHASED_PLAN.md](side projects/powerbiembed/PHASED_PLAN.md), [side projects/powerbiembed/README.md](side projects/powerbiembed/README.md), and [side projects/powerbiembed/KICKOFF.md](side projects/powerbiembed/KICKOFF.md). Every phase reads this file at start and writes to it at end.

The `side projects/` folder is local-only (see [side projects/.gitignore](side projects/.gitignore)); reference it by path, do not paste it into context.

---

## Phase status

| Phase | Title                                  | Status                |
|-------|----------------------------------------|-----------------------|
| 0     | Reconnaissance                         | **DONE — awaiting Phase 1 go-ahead** |
| 1     | Responsive sizing fix on existing modal | **DONE — visually signed off after one tuning iteration** |
| 2     | Data schema + QA fixture                | **DONE — pending user-supplied content from parallel CC session for `challenges`, `pdf`, `repo`, `embedUrl`, `embedFallbackImage`, `images`** |
| 3     | Header chrome (PDF / Repo / × pills)    | **DONE — pending visual sign-off** |
| 4     | Body restructure + sidenav              | **DONE — pending visual sign-off** |
| 5     | Embed mode (iframe + CSP + lifecycle)   | **DONE — pending visual sign-off** |
| 6     | A11y, keyboard, cross-browser           | **DONE (code) — pending user-driven Lighthouse + cross-browser smoke** |

---

## Phase 0 — Inventory

### Framework

- **Next.js 15.1.6**, App Router (verified: [app/layout.tsx](app/layout.tsx), [app/page.tsx](app/page.tsx)).
- React 19, TypeScript 5, `"strict": true`.
- No test runner. Build = type-check + lint.
- `@/*` aliased to repo root.

### Styling system

- **One global stylesheet**: [app/globals.css](app/globals.css). No Tailwind, no CSS modules, no CSS-in-JS.
- BEM-ish `jh-` class prefix throughout.
- **Gotcha**: [app/globals.css:25](app/globals.css#L25) — `html { zoom: 1.1; }`. The whole site renders at 110%; `getBoundingClientRect()` returns zoomed pixels, `getComputedStyle()` returns unzoomed values. Affects the Phase 4 scroll-spy math. Use relative units (`em`, `rem`, `vw`, `clamp`) wherever possible.
- Design tokens are CSS custom properties on `:root` at [app/globals.css:7-18](app/globals.css#L7-L18).

### Icon library

- **None installed.** All icons are inline SVG inside the component that uses them — e.g. [components/Modal.tsx:115-122](components/Modal.tsx#L115-L122) (close ×) and [components/Modal.tsx:194-215](components/Modal.tsx#L194-L215) (download circle).
- Phase 3 will need icons for the PDF and Repo pills. Two reasonable paths:
  1. **Continue inline SVG**. Zero new deps, matches existing pattern, gives full design control. Recommendation.
  2. Add `lucide-react` (~tree-shaken, ~2 kB per icon). Convenient but adds a runtime dep for what amounts to two glyphs.

### Project data shape (technical projects)

[lib/types.ts:34-46](lib/types.ts#L34-L46):

```ts
interface TechProject {
  id: string;
  title: string;
  blurb: string;          // shown on card, not in modal
  tags: string[];
  swatch: string;         // fallback bg when no images
  label: string;          // e.g. "DASHBOARD"
  detail: string[];       // array of paragraphs — body of current modal
  images?: string[];      // string array, not objects
  pdf?: string;           // path under /public, e.g. "/downloads/foo.pdf"
}
```

**Consumers of `project.images`:**

- [components/Modal.tsx:79-83](components/Modal.tsx#L79-L83) — `images = project.images ?? []`, drives the carousel.
- [components/Modal.tsx:131-138](components/Modal.tsx#L131-L138) — renders all images with opacity-fade.
- [components/Modal.tsx:158-167](components/Modal.tsx#L158-L167) — renders dot indicators.
- [components/TechSection.tsx:34](components/TechSection.tsx#L34) — `image={p.images?.[0]}` for the card thumbnail.

**Consumers of `project.tags`:**

- [components/Modal.tsx:227, 231](components/Modal.tsx#L227) — modal header chips (with a `jh-chips--grid5` variant when tag count > 5).
- [components/TechSection.tsx:40](components/TechSection.tsx#L40) — card chips.

**Consumers of `project.pdf`:**

- [components/Modal.tsx:71, 188-216](components/Modal.tsx#L71) — inline download glyph glued to the title's last word. Phase 3 will remove this inline arrow and replace it with the pill in the action row.

### Modal trigger location

- Card click: [components/TechSection.tsx:26-29](components/TechSection.tsx#L26-L29) — `<button class="jh-card jh-card--tech" onClick={() => onOpen(p)}>`.
- `onOpen` is `setActiveProject`, defined at [components/Portfolio.tsx:23](components/Portfolio.tsx#L23).
- The single shared `Modal` is rendered at [components/Portfolio.tsx:83](components/Portfolio.tsx#L83).
- Same modal handles construction projects too — branches via [lib/types.ts:50](lib/types.ts#L50) `isTechProject()`. **Spec is for the technical modal only**; construction rendering must stay untouched (see open question 7 below).

### Current modal width constraint (the regression source)

[app/globals.css:991-1002](app/globals.css#L991-L1002):

```css
.jh-modal__inner {
  background: var(--jh-bg);
  max-width: 920px;            /* ← the regression: caps at 920px on any monitor */
  width: 100%;
  border-radius: 12px;
  ...
}
.jh-modal {
  padding: 56px 24px;          /* ← also fixed, not clamp() */
  ...
}
```

Target per README "Responsive sizing" table:

- Wrapper padding → `clamp(16px, 2.5vw, 40px)`
- Modal width → `min(1240px, 100%)`
- Modal max-height → `calc(100vh - 32px)`
- Title size → `clamp(22px, 0.6vw + 18px, 32px)` (currently `clamp(24px, 3.1vw, 38px)` at [app/globals.css:1114](app/globals.css#L1114) — close, but the README value is calmer)

Existing tech-hero already does `.jh-modal__hero--tech { aspect-ratio: 16 / 9; }` + `object-fit: contain` ([app/globals.css:1046-1047](app/globals.css#L1046-L1047)). Phase 1 only needs to add `height: auto; max-height: 60vh` (the spec) to that block. Construction hero stays at 21:9.

### Existing CSS custom properties — and overlap with README tokens

Current tokens at [app/globals.css:7-18](app/globals.css#L7-L18):

| Site token (current)        | Value             | Closest README token       | Notes                                                                 |
|-----------------------------|-------------------|----------------------------|-----------------------------------------------------------------------|
| `--jh-bg`                   | `#EFEAE0`         | `--bg-modal #f3eee5`       | Cream-on-cream — site shade is very close, reuse `--jh-bg` directly.  |
| `--jh-ink`                  | `#111111`         | `--ink #1d2230`            | Site is closer to black; spec is navy-tinted. See **Q4 — accent**.    |
| `--jh-ink-2`                | `#2a2a28`         | `--ink-2 #353c4d`          | Both are "body copy" shade. Reuse.                                    |
| `--jh-mute`                 | `#6b6660`         | `--ink-mute #6c6c6c`       | Equivalent.                                                           |
| `--jh-faint`                | `#d6cfc2`         | `--ink-faint #9c9c9c`      | Different function — site uses faint for hairlines, README uses for counters. Need a NEW counter color OR repurpose. |
| `--jh-line`                 | `#e0d8c6`         | `--rule #d9d2c4`           | Equivalent.                                                           |
| (none)                      | —                 | `--rule-strong #c7bfb0`    | **Missing** — needed for pill borders in Phase 3.                     |
| (none)                      | —                 | `--tag-border #c9c1b0`     | **Missing** — but site already has its own chip border via `--jh-line`; reuse. |
| `--jh-accent`               | `#1F4E3C` 🟢       | `--accent #1d2536` 🔵       | **DIFFERENT — site is deep forest green, spec is navy.** See **Q4**.  |
| `--jh-display-font`         | `Newsreader, Fraunces, Georgia, serif` | `--serif EB Garamond` | README itself says "use what's already imported" → keep Newsreader.   |
| `--jh-sans`                 | `Inter`           | `--sans Inter`             | Equivalent.                                                           |
| (none)                      | —                 | `--mono JetBrains Mono`    | **Missing** — needed for section labels (`DESCRIPTION`) and `1.` `2.` `3.` counters in Phase 4. See **Q6**.            |

### Existing CSP

- **None.** [next.config.mjs](next.config.mjs) is two lines: `reactStrictMode: true`. No middleware, no `vercel.json`, no meta-tag CSP, no `headers()` block.
- Phase 5 will add `frame-src https://app.powerbi.com https://*.powerbi.com` via `next.config.mjs`'s `async headers()` (cleanest path — single source of truth, applied to all routes, no extra runtime).
- Because there's no existing CSP, the iframe will technically render without any CSP change. The Phase-5 deliverable is still "add the explicit `frame-src`" so a future tightening of `default-src` doesn't break embeds.

### Git state at end of Phase 0

- Branch: `website-edits`. Up to date with `origin/main` (fast-forward merge brought in 7 commits, content delta = updated `public/Justin_Hwang_Resume.pdf`).
- Local `website-edits` is now **ahead of `origin/website-edits` by 7 commits** — not pushed.
- `side projects/` is gitignored from within itself; `git status` no longer shows it.

---

## Phase 0 — Open questions (block Phase 1 start until answered)

### Q1. `images: string[]` migration — defer, or upgrade to `{src, alt?, caption?, label?}[]` now?

- **Recommendation: defer.** Current shape is `string[]`. Upgrading touches every project record in [content/technical-projects.json](content/technical-projects.json), the type in [lib/types.ts](lib/types.ts), and two consumers ([components/Modal.tsx](components/Modal.tsx), [components/TechSection.tsx](components/TechSection.tsx)) for zero user-visible benefit until anyone actually writes a caption. Treat strings as `{src: string}` internally where needed.

### Q2. Feature flag infrastructure — does any exist?

- **Finding: no.** No env-gated code paths, no flag service. Recommendation: gate the new behavior on **field presence** (e.g. `embedUrl ? <iframe …/> : <carousel …/>`). This is what the README's data contract already implies. No separate flag system needed.

### Q3. QA fixture project — which one is "Risk Register Revamp"?

- **There is no project literally named "Risk Register Revamp" in the data.** Closest match: `tech-2` **"Power BI - Risk Register Dashboard"** ([content/technical-projects.json](content/technical-projects.json#L15)). It already has a `pdf` (`/downloads/riskregister1.pdf`) and 3 images, so it's a sensible candidate.
- **Need: confirm tech-2 is the QA fixture**, OR tell me the actual canonical project, OR have me create a new "Risk Register Revamp" entry.

### Q4. Accent color — site green vs README navy (highest-impact aesthetic decision)

- Site's `--jh-accent` is `#1F4E3C` (deep forest green). Spec's `--accent` is `#1d2536` (dark navy). This drives the carousel strip, active sidenav dot, pill hover background, and the `● INTERACTIVE · POWER BI` badge container.
- Per the frontend-design skill loaded as a quality bar — and PHASED_PLAN's framing of that skill as a *guardrail against AI-generic styling*, not a license to redecorate — recommendation is to **map the spec's "accent" role onto the site's existing green** so the modal continues to feel like part of the same site instead of a transplant. The "● INTERACTIVE" pill would then be a soft-green chip on a deep-green strip rather than soft-green-on-navy.
- Pick one:
  1. **Keep the site green** (recommended). Re-skin the spec's navy-role usages with `var(--jh-accent)`.
  2. **Adopt the spec's navy** for modal carousel strip / sidenav active. Two accent systems coexist (page = green, modal = navy). Higher fidelity to the prototype, weaker site coherence.
  3. **Repaint the whole site to navy.** Out of scope for this work, but flagging.

### Q5. Mono font — load JetBrains Mono, or skip it?

- README requires monospace for section labels (`DESCRIPTION`, `LEARNING GOALS & OBJECTIVES`, etc.) and the `1.` `2.` `3.` numbered-item counters. Site loads no mono font today.
- Options:
  1. **Add JetBrains Mono** to the existing Google Fonts `<link>` in [app/layout.tsx](app/layout.tsx). +1 font request, +faithfulness to spec. Recommendation.
  2. Use a system mono fallback (`ui-monospace, Menlo, monospace`) — saves the request but loses the typographic intent (the labels get the OS default mono, which varies).
  3. Skip the mono treatment entirely — render labels in Inter caps + letter-spacing. Cheapest, drifts furthest from the spec.

### Q6. Construction modal scope

- [components/Modal.tsx](components/Modal.tsx) renders BOTH project types. The redesign spec is for the *technical* modal only. Construction projects have their own meta grid, contributions list, and related-project block that aren't in the spec.
- **Recommendation: leave construction rendering untouched. Gate all new behavior (sidenav, sections, embed, header pills, expanded width) behind `isTechProject(project)`.** The two rendering paths already live in the same component via `tech ?` branches; we'd just add more branches.
- Confirm or override.

### Q7. Inline title download arrow — remove in Phase 3?

- The existing inline `↓` glyph glued to the title's last word ([components/Modal.tsx:182-218](components/Modal.tsx#L182-L218), styled at [app/globals.css:1146-1163](app/globals.css#L1146-L1163)) duplicates the new `PDF` pill. Phase 3 calls for its removal.
- **Recommendation: remove in Phase 3 as scheduled.** Confirm.

### Q8. Tech hero `max-height: 60vh` — apply, or leave as-is?

- The spec's Phase 1 calls for `aspect-ratio: 16/9; height: auto; max-height: 60vh` on the carousel container. The site already does `aspect-ratio: 16 / 9` on tech ([app/globals.css:1046](app/globals.css#L1046)), so only the `max-height: 60vh` clamp is new. This caps the hero on tall narrow viewports.
- **Recommendation: add it.** Construction hero stays at 21:9 with no `max-height` — out of scope.

---

---

## Phase 0 — Answers received (recorded for Phase 1+)

| # | Question                          | Decision                                                                                  |
|---|-----------------------------------|-------------------------------------------------------------------------------------------|
| Q3 | Construction modal scope         | **Leave construction untouched.** Gate ALL new behavior — sidenav, sections, embed, header pills, AND the expanded responsive width — on `isTechProject(project)`. Construction modal stays at its current 920px shell and current rendering. Implementation: add `jh-modal__inner--tech` modifier class in [components/Modal.tsx](components/Modal.tsx) and put every new sizing/structure rule on that selector. |
| Q4 | Accent color (green vs navy)     | **Use the site's existing treatment.** Site-wide `--jh-accent: #1F4E3C` is reused wherever the spec calls for an accent (sidenav active dot, hover states). The carousel strip background stays at the existing `#0d0a07` hero bg, not the spec's navy `#1d2536`. No new color tokens. **User intent: the photo or embed should fill the visible canvas — minimize swatch/bg showing through.** See "Residual ambiguity" below. |
| Q3 (PHASED_PLAN) | QA fixture project   | **Add a NEW project record** named "Risk Register Revamp" in [content/technical-projects.json](content/technical-projects.json), positioned immediately after `tech-2` "Power BI - Risk Register Dashboard". Content is being finalized by the user in another Claude Code session. User option to delete `tech-4` "Basic Expense Report" later if alignment requires. Phase 2 cannot complete the backfill until the user delivers the content; Phase 2 will create the placeholder slot and stop. |
| Q5 | Mono font                         | **No new font.** The site uses no monospace; mimic the existing label/eyebrow treatment (Inter caps + letter-spacing). Section labels (`DESCRIPTION`, `LEARNING GOALS & OBJECTIVES`) render in Inter caps. The `1.` `2.` numbered-item counters render in the display font (Newsreader) or Inter depending on what reads cleanest beside the body text — to be tuned during Phase 4. |

### Residual ambiguity — image/embed canvas fill

User said: "The photo or embed should populate the entire canvas." This conflicts with the README spec ("Image area: white bg with `object-fit: contain` so screenshots are never cropped").

- **For the iframe**: no conflict — the spec already calls for `width: 100%; height: 100%; display: block`. Iframe fills.
- **For photos**: the current site already uses `aspect-ratio: 16/9` + `object-fit: contain` on `.jh-modal__hero--tech` ([app/globals.css:1046-1047](app/globals.css#L1046-L1047)) with hero bg `#0d0a07`. If screenshots are pre-framed to 16:9 (the user's recent commits — `bbe80ad`, `8b27c95` — explicitly re-framed tech screenshots), there is no visible letterboxing and the canvas already reads as "all image".
- **Plan**: do nothing on this front in Phase 1 (Phase 1 is only the wrapper/width/title clamps + adding `max-height: 60vh` to the carousel). Revisit in Phase 5 when we're already in the media-area code. If letterboxing IS visible on the QA fixture's screenshots, switch the hero bg to cream `var(--jh-bg)` so any bars blend into the modal, OR adopt `object-fit: cover` if the user is willing to accept crop on non-16:9 screenshots.

### Recommendations awaiting confirmation (non-blocking for Phase 1)

These four were filed with recommendations and have not been objected to. Defaulting to the recommendation unless the user pushes back. Re-listed here so they don't get lost:

- **Q1 — `images: string[]` migration**: defer. Treat strings as `{src: string}` internally; full schema migration only if/when caption strings are actually written.
- **Q2 — feature flags**: skip. Gate behavior on field presence (e.g. `embedUrl ? …`); no flag system needed.
- **Q7 — inline title download arrow**: remove in Phase 3 (replaced by `PDF` pill in the action row).
- **Q8 — add `max-height: 60vh` to tech hero carousel**: yes, in Phase 1.

---

---

## Phase 1 — Changes shipped

Tech-only responsive sizing. Construction modal untouched per Q3.

**[components/Modal.tsx](components/Modal.tsx)** — added two modifier classes, gated on the existing `tech` boolean:
- Outer backdrop: `jh-modal jh-modal--tech` when tech.
- Inner shell: `jh-modal__inner jh-modal__inner--tech` when tech.

**[app/globals.css](app/globals.css)** — added a tech-only sizing block after `.jh-modal__inner` and extended `.jh-modal__hero--tech`:

```css
.jh-modal--tech                                  { padding: clamp(16px, 2.5vw, 40px); }
.jh-modal__inner--tech                           { max-width: clamp(920px, 70vw, 1240px); }
.jh-modal__inner--tech .jh-modal__head .jh-display
                                                 { font-size: clamp(22px, 0.6vw + 18px, 32px); }
.jh-modal__hero--tech                            { aspect-ratio: 16 / 9; }
```

**Sizing curve** (`clamp(920px, 70vw, 1240px)`):

| Viewport | Modal width | Notes |
|----------|-------------|-------|
| ≥ 1772px | 1240px      | Spec ceiling hit. ~340px gutters on a 1920px monitor. |
| 1314–1772px | 70vw      | Visibly scales with the viewport between the two anchors. |
| ≤ 1314px | 920px       | Original floor — modal fills the parent when parent < 920. |

**Deviations from the README spec, recorded for Phase 4:**

- `max-width` is `clamp(920px, 70vw, 1240px)` instead of spec's static `min(1240px, 100%)`. Pinned 70vw mid-range so the modal visibly grows/shrinks with viewport on mid-size screens (the user explicitly wanted scaling feedback); kept the original 920px floor so modals on ~1280px monitors don't shrink below their pre-Phase-1 size. Spec cap (1240px) preserved.
- `max-height: calc(100vh - 32px)` on the inner shell **dropped**. Spec assumes Phase 4's sidenav adds an internal scrollable column; until that lands, capping inner height while `.jh-modal__inner` has `overflow: hidden` clips body content. The whole modal scrolls within the outer `.jh-modal { overflow-y: auto }` backdrop, which matches user preference ("don't mind if the bottom summary text has to scroll"). **Re-add `max-height` in Phase 4** once internal scrolling exists.
- `max-height: 60vh` on the tech carousel **dropped**. With it, on common 1080p / 1440p monitors the carousel was capped before reaching its natural 16:9 height, causing `object-fit: contain` to letterbox the image with substantial dark-bg bars. Picture now grows to full 16:9 at modal width.

**Tuning history this phase:** initial spec value (1240px static) → user asked for "a little wider" → bumped to 1440px → user reported "way too wide, doesn't scale" → settled on `clamp(920px, 70vw, 1240px)`. Lesson for Phase 4 onward: present sizing changes with the explicit scaling curve at typical viewport widths, not just the cap.

**Build**: `npm run build` clean. No type errors, no lint warnings, no console output regressions.

**Visual verification**: pending user sign-off. Test table per PHASED_PLAN Phase 1:

| Viewport | Tech modal — expected                                                              | Construction — expected |
|----------|-------------------------------------------------------------------------------------|--------------------------|
| 375px    | Fills with ~16px gutters, close button visible, title wraps cleanly.               | Identical to before.     |
| 768px    | Fills with ~19px gutters, carousel 16:9.                                           | Identical to before.     |
| 1280px   | ~1240px wide (effective ceiling), carousel scales up, title ~30-32px.              | Capped at 920px.         |
| 1920px   | 1240px wide ceiling, centered with ~340px gutters, title at 32px. **Regression fixed.** | Capped at 920px.         |

Also confirm: card grid on homepage unchanged at every viewport; no new console warnings; on a short-wide viewport (e.g. 1920×600) the tech carousel caps at 60vh (~360px) instead of trying for 698px tall.

---

## Phase 2 — Changes shipped

Data-layer only. No UI consumer reads the new fields yet, so every existing project renders the current modal unchanged. Phase 4 will wire up `description` / `objectives` / `challenges` / `futureFeatures` rendering; Phase 5 wires `embedUrl`. Phase 3 wires `repo`.

**[lib/types.ts](lib/types.ts)** — added `ProjectItem` interface, extended `TechProject` with all spec fields as optional:

```ts
interface ProjectItem { lead: string; body: string; }

interface TechProject {
  // ...existing fields...
  pdf?: string;                    // already existed
  repo?: string;                   // new
  embedUrl?: string;               // new
  embedLabel?: string;             // new
  embedCaption?: string;           // new
  embedFallbackImage?: string;     // new
  description?: string;            // new
  objectives?: ProjectItem[];      // new
  challenges?: ProjectItem[];      // new
  futureFeatures?: ProjectItem[];  // new
}
```

`images: string[]` left as-is per Q1 (defer migration). Existing `detail: string[]` kept alongside new `description` until Phase 4 swaps the modal body renderer — current modal still reads `detail`, so we can't drop it without breaking rendering.

**[content/technical-projects.json](content/technical-projects.json)** — inserted new `tech-2b` entry between `tech-2` (Risk Register Dashboard) and `tech-3`. Content sourced from [side projects/powerbiembed/modal.reference.jsx](side projects/powerbiembed/modal.reference.jsx)'s `CONTENT` object:

- `title`, `blurb`, `tags`, `swatch`, `label`: filled
- `detail`: short single-paragraph copy of `description` so the current modal renders something until Phase 4 swaps to `description`-based rendering
- `description`, `objectives` (5 items), `futureFeatures` (3 items): filled from CONTENT
- `embedLabel`, `embedCaption`: filled from CONTENT's `MEDIA.embed`
- `challenges`: **omitted** — the prototype's CONTENT.challenges contained literal `"XX"` / `"XXX"` placeholders the prototype author left for the user to fill in. Including them would render unfinished text on the site.
- `pdf`, `repo`, `embedUrl`, `embedFallbackImage`, `images`: **omitted** — awaiting real URLs from your parallel Claude Code session.

**Card fallback check** (per PHASED_PLAN Phase 2 downstream check): the new entry has no `images`, so [components/TechSection.tsx:34](components/TechSection.tsx#L34) passes `image={undefined}` to `ProjectThumb`, which falls back to the swatch + `"DASHBOARD"` label badge. Renders cleanly. Same path works if user later adds `embedUrl` without `images`.

**Build**: `npm run build` clean. Page bundle 13.6 → 14.4 kB from the added JSON.

### Open follow-ups for Phase 2

When your parallel CC session delivers content, add to `tech-2b`:

| Field                | Use                                                                                                              |
|----------------------|------------------------------------------------------------------------------------------------------------------|
| `challenges`         | Array of `{lead, body}` items — your actual challenges (not the prototype's XX placeholders).                    |
| `pdf`                | Path under `/public` (e.g. `"/downloads/risk-register-revamp.pdf"`).                                              |
| `repo`               | Full GitHub URL.                                                                                                 |
| `embedUrl`           | Power BI "Publish to web" URL.                                                                                   |
| `embedFallbackImage` | Path under `/public` to the image shown while the iframe loads / on embed failure.                                |
| `images`             | Array of paths under `/public/images/projects/technical/`. Used for the card thumbnail and Phase-5 photo fallback. |

These are all optional in the schema, so the entry compiles and renders without them. No further code changes needed when you add them — just edit the JSON.

### Test deltas vs. PHASED_PLAN

- ✓ Existing projects render unchanged (no consumer reads new fields).
- ✓ QA project carries every new field that has user-ready content; remaining fields are documented above.
- ⚠ "Homepage cards unchanged" test is satisfied in spirit but not literally — a NEW card now appears in the grid. You opted in to this via Q3 answer ("We need to add it manually to the json").
- → If the new 7th card disrupts the grid layout (you mentioned possibly deleting `tech-4` "Basic Expense Report" for alignment), confirm and I'll remove it.

---

## Phase 3 — Changes shipped

Tech-only header chrome. Construction modal untouched.

**[components/Modal.tsx](components/Modal.tsx)**:
- Dropped the title-splitting (`titleSplitAt` / `titleHead` / `titleTail`) and the inline `<a class="jh-modal__download">` arrow inside the `<h2>`. Title is now a plain `{project.title}` string.
- Added `repo` extraction alongside the existing `pdf` extraction (both gated on `tech`).
- For tech: head right column is a new `.jh-modal__head-right` wrapper containing `.jh-modal__actions` (PDF → Repo → close, in that DOM order) on top and the existing `.jh-chips` block below.
- PDF and Repo render as `<a class="jh-pill" target="_blank" rel="noreferrer">`. Close renders as `<button class="jh-pill jh-pill--close">`. Each pill carries an `aria-label`; inner SVGs are `aria-hidden` + `focusable="false"`.
- The absolute hero-corner `.jh-modal__close` is now wrapped in `{!tech && ...}` — only construction renders it. For tech, the close lives inside the title row's actions group instead.

**[app/globals.css](app/globals.css)** — replaced the now-dead `.jh-modal__title-tail` / `.jh-modal__download` / `.jh-modal__download-glyph` rules with:
- `.jh-modal__inner--tech .jh-modal__head` — switches the head from flex to `grid-template-columns: 1fr auto; gap: 28px; align-items: start`. Construction's head stays flex.
- `.jh-modal__head-right` — column flex, `align-items: flex-end`, `gap: 14px`.
- `.jh-modal__inner--tech .jh-modal__head .jh-chips { margin-top: 0; }` — neutralizes the existing `margin-top: 14px` since the gap is now owned by the wrapper.
- `.jh-modal__actions` — flex row, `gap: 8px`, `align-items: center`.
- `.jh-pill` — `7px 12px` padding, Inter 11.5px / 500, 999px radius, `var(--jh-line)` border, transparent bg, `var(--jh-ink)` color, 150ms color/bg/border transitions.
- `.jh-pill:hover, .jh-pill:focus-visible` — bg `var(--jh-ink)`, color `var(--jh-bg)`, border `var(--jh-ink)`. Icon opacity goes 0.8 → 1.
- `.jh-pill__icon` — 14×14, opacity 0.8 default.
- `.jh-pill--close` — `28×28`, `padding: 0`, `justify-content: center` (icon-only circle, same hover spec).

### Deviations from README spec, recorded

| README literal | Substituted with | Reason |
|----------------|------------------|--------|
| Border `#c7bfb0` (spec's `--rule-strong`) | `var(--jh-line)` (`#e0d8c6`) | No `--rule-strong` token exists on the site; Q4 answer rules out new color tokens. Existing hairline color reads as a clean pill border on the cream bg. |
| Hover bg `#1d2230` | `var(--jh-ink)` (`#111111`) | Site ink is closer to black than spec's navy-tinted ink. Phase 1 set the precedent for site-token substitution. |
| Hover color `#f3eee5` | `var(--jh-bg)` (`#EFEAE0`) | Same precedent as Phase 1 (modal bg substitution). Visually identical at this size. |

Visual treatment matches the spec's intent (dark ink on cream, hover inverts to cream on dark ink). If the literal hex values matter for any cross-site pixel comparison, swap in three local rules under `.jh-modal__inner--tech .jh-pill` and override.

### Test status vs PHASED_PLAN Phase 3

| # | Test                                                                       | Status                                                                          |
|---|----------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| 1 | QA project shows both pills; no-`pdf` shows only Repo; neither shows only × | **Code-verified.** `tech-2b` currently has no `pdf` / `repo` → shows only × (until your parallel session fills them). `tech-2` "Risk Register Dashboard" has `pdf` only → shows PDF + ×. No project carries `repo` in source yet. Add `repo` to any tech project to see the Repo pill render. |
| 2 | Pill hover state matches README hex                                         | **Visual sign-off pending.** See "Deviations" above — using site tokens, not literal hex. Confirm or request swap. |
| 3 | Both pills open in a new tab (`target="_blank"`, `rel="noreferrer"`)        | **Repo: code-verified.** **PDF: user override — uses `download` attribute** so the file downloads instead of opening in a new tab, preserving the prior inline-arrow behavior. README spec test deferred for PDF. |
| 4 | Esc still closes; tab order sensible                                        | **Esc**: unchanged, key handler still fires `onClose`. **Tab order**: pills DOM order is `PDF → Repo → close`. First focusable in the modal is now the first carousel arrow (if multi-image) or first pill (if not). Previously was the absolute close. |

**Build**: `npm run build` clean. Page bundle 14.4 → 14.8 kB (extra ~400 B = GitHub SVG path).

**Visual verification**: NOT performed by me — I can't observe a running browser from this environment. Manual check needed: open `tech-2` modal at any viewport, confirm the PDF pill sits to the right of the title with the × beside it, chips sit below the actions row, hover inverts cream/ink cleanly, and tab cycles through PDF → × in that order.

### Notes for Phase 4

- Currently `.jh-modal__head` for tech uses `align-items: start` so the title's top aligns with the actions row's top. If Phase 4 introduces a multi-row title-block (eyebrow + title + sub), revisit this alignment.
- Construction modal's head still uses the original flex layout — when Phase 4 lifts the sidenav for tech, leave construction's head untouched.
- The `.jh-modal__head-main`'s `flex: 1; min-width: 0` (from before) is unused for tech now that the head is `grid 1fr auto`. Harmless. Phase 4 can clean up if it touches that selector.

---

## Phase 4 — Changes shipped

Tech-only body restructure + sidenav. Construction modal untouched per Q3. Skill stack invoked at session start: `next-best-practices`, `vercel-react-best-practices`, `typescript-advanced-types`, `frontend-design`.

### New files

**[lib/sections.ts](lib/sections.ts)** — section registry + types + `getActiveSections`.

- `SECTION_DEFS` is declared `as const satisfies readonly {...}[]`. The `satisfies` clause forces every `key` to be a real `keyof TechProject` at compile time; `as const` preserves literal types so `(typeof SECTION_DEFS)[number]` is a usable discriminated union on `kind` (`"prose" | "list"`).
- `ActiveSection` narrows by kind: prose → `value: readonly string[]`, list → `value: readonly ProjectItem[]`. The renderer switch on `section.kind` narrows `value` without casts.
- `getActiveSections(project)`:
  - **Prose** pulls from `description` first, falls back to legacy `detail: string[]` paragraphs filtered for non-empty content. This preserves rendering for tech-1, tech-3, tech-4, tech-5, tech-6 — they were never migrated to the new schema and would otherwise render zero body content. The fallback joins paragraphs into an array; the renderer maps each to a `<p class="jh-sec-desc">`.
  - **List** sections render iff the array is present and non-empty.
  - Empty fields collapse totally: no nav link, no header, no spacing.

**[components/TechModalBody.tsx](components/TechModalBody.tsx)** — extracted from Modal.tsx per `rerender-no-inline-components`.

- `sections = useMemo(() => getActiveSections(project), [project])` — stable identity within a project lifetime; regenerates on project switch.
- `renderedActiveId` derived in render (not synced via effect) per `rerender-derived-state-no-effect`. If the previously-active id no longer exists, falls back to `sections[0]?.id`.
- Scroll-spy effect attaches `scroll` listener with `{ passive: true }` per `client-passive-event-listeners`. Listener uses functional `setActiveId((prev) => prev === cur ? prev : cur)` to short-circuit re-renders when the active id hasn't changed (`rerender-functional-setstate`).
- `sectionTopWithinScroller` uses `getBoundingClientRect()` delta math (not `offsetTop`) per spec and PHASED_PLAN line 109.
- 6px tolerance on the active flip.
- `jump(id)` runs `setActiveId(id)` synchronously, then `scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" })`. Instant feedback; spy reconfirms on settle.
- Refs map via `useRef<Record<string, HTMLElement | null>>({})` for stable identity across section adds/removes (per `rerender-use-ref-transient-values`).
- `SectionContent` is a sibling function at module scope (not nested inside `TechModalBody`).

### [components/Modal.tsx](components/Modal.tsx)

Single-statement swap: the tech "Project" block (old `<div class="jh-modal__section">` with `<div class="jh-modal__h">Project</div>` + `project.detail.map(...)`) replaced with `<TechModalBody project={project} />` when tech. Construction's "Project" + "My contributions" + "Related" sections untouched. One new import.

### [app/globals.css](app/globals.css)

Phase 4 block inserted after `.jh-pill--close`, before `.jh-modal__meta`. Every selector is gated under `.jh-modal__inner--tech` or a new tech-only class prefix (`jh-sn-*`, `jh-sec*`, `jh-ni*`).

- `.jh-modal__inner--tech` — **re-added `max-height: calc(100vh - 32px)`** per spec, now that internal scrolling exists. Plus `display: flex; flex-direction: column;`.
- `.jh-modal__inner--tech .jh-modal__hero, .jh-modal__inner--tech .jh-modal__head` — `flex-shrink: 0` (don't compress the carousel or title row).
- `.jh-modal__inner--tech .jh-modal__body` — flex column, flex: 1, min-height: 0.
- `.jh-sn-body` — grid `clamp(140px, 14%, 200px) 1fr`, gap `clamp(24px, 3vw, 48px)`. Flexes within body.
- `.jh-sn-nav` — flex column, align-self: start.
- `.jh-sn-link` / `.jh-sn-dot` — Inter 12.5px, color mute → ink-2 (hover) → ink + 500 weight (active). Dot 6px, --jh-line default → **--jh-accent (deep forest green per Q4)** + scale 1.2 active.
- `.jh-sn-scroll` — `overflow-y: auto`, min-height: 0, flex column gap 28px (section ↔ section spacing per spec). Thin custom scrollbar via `scrollbar-width` + `::-webkit-scrollbar`.
- `.jh-sec-label` — Inter 10.5px caps + letter-spacing 0.14em (no JetBrains Mono per Q5), trailing 1px hairline filler in `--jh-line`.
- `.jh-sec-desc` — Newsreader serif 17px / line-height 1.55 / `text-wrap: pretty`. Adjacent `.jh-sec-desc + .jh-sec-desc` stack with 14px top margin (multi-paragraph fallback for legacy projects).
- `.jh-ni-list` / `.jh-ni` / `.jh-ni-num` / `.jh-ni-text` / `.jh-ni-lead` — grid `22px 1fr`, gap 8px. Numbers in Inter 11px / `--jh-faint`. Body in Inter 14px / line-height 1.6 / `--jh-ink-2`. Lead bold + `--jh-ink`. 18px gap between items.
- `@media (prefers-reduced-motion: reduce)` — kills sidenav `transition` + active-dot `transform: scale(1.2)`.
- `@media (max-width: 700px)` — collapses sidenav to a horizontal wrapping pill row above the content, drops `max-height` and internal scroll so outer `.jh-modal` handles overflow as it did pre-Phase 4.

### Deviations from README spec, recorded

| README literal | Substituted with | Reason |
|----------------|------------------|--------|
| Section label / counter font: **JetBrains Mono** | Inter caps + letter-spacing 0.14em (labels); Inter 11px + letter-spacing 0.04em + `--jh-faint` (counters) | Q5 — no new font family. |
| Sidenav active dot color: `#1d2536` (spec navy) | `var(--jh-accent)` (deep forest green) | Q4 — reuse site accent. |
| `position: sticky` on `.jh-sn-nav` | Grid layout + right-column `overflow-y: auto` | Same visual effect (nav stays put because it's a non-scrolling grid cell). Adding sticky would require dropping `.jh-modal__inner`'s `overflow: hidden` (or switching to `overflow: clip`) to escape the sticky-containing-block trap — not worth the side effects for a no-op visual. |
| Description: `description: string` only | Fallback to legacy `detail: string[]` if no description | Five existing tech projects (tech-1, tech-3, tech-4, tech-5, tech-6) only carry `detail` — without the fallback they'd lose all body content under Phase 4. Tech-2b uses `description` and is unaffected. |

### Tests vs PHASED_PLAN Phase 4 test list

| # | Test                                                                          | Status |
|---|-------------------------------------------------------------------------------|--------|
| 1 | tech-2b renders all four sections in order: Description, Objectives, Challenges, Future Features. | **Expected partial: 3 of 4.** tech-2b has no `challenges` yet (pending the parallel CC session). Per the hand-off note: "expect 3 of the 4 body sections to render (no challenges)." Render order will be Description → Objectives → Future Features. When `challenges` lands in the JSON, the fourth section renders automatically (no code change). |
| 2 | description-only project: one section, single-link sidenav. | **Code-verified.** Single section → `sections.length === 1`. The sidenav renders one link; empty-collapse holds for the other three. |
| 3 | A project with no body fields: no body wrapper. | **Code-verified.** `if (sections.length === 0) return null;` in TechModalBody. No project in the JSON currently hits this — every tech project carries `detail`. |
| 4 | Scroll-spy flips active state within 6px tolerance. | **Visual sign-off pending.** Math mirrors the prototype's `getBoundingClientRect()` delta against the scroller. Listener attaches with `{ passive: true }`. Manual browser test needed. |
| 5 | Sidenav click → smooth scroll + immediate active flip. | **Visual sign-off pending.** `setActiveId(id)` fires synchronously inside `jump()`; `scrollTo` runs after. Manual browser test needed. |
| 6 | prefers-reduced-motion: smooth → auto. | **Code-verified.** `prefersReducedMotion()` is checked at click time and swaps the `behavior` argument. Sidenav transition + active-dot scale are also disabled via the matching media query in CSS. |
| 7 | Sidenav column scales 140px ↔ 200px. | **Code-verified.** `grid-template-columns: clamp(140px, 14%, 200px) 1fr` — spec value, no deviation. |

**Build**: `npm run build` clean. Page bundle 14.8 → 15.6 kB (~800 B from sections.ts + TechModalBody.tsx, mostly the JSON-constant registry).

**Visual verification**: NOT performed by me — Windows CLI session with no Playwright/headless browser, and a curl of `/` can't drive the client-side modal-open click. Dev server SSR confirms HTTP 200, no compile errors, no runtime errors in the dev log. Dev server was running on port **3002** (port 3000 held by another process) at the end of this session. Manual verification recipe:

1. Open tech-2b modal — confirm sidenav appears with three links (`Description`, `Learning Goals`, `What's Next?`).
2. Click each link in turn — confirm right column smooth-scrolls to that section; active dot + label flip instantly on click.
3. Scroll the right column manually — confirm active dot follows the section that's currently at the top, with the 6px tolerance.
4. DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Click a sidenav link — scroll should be instant (no smooth animation). Active-dot scale should not animate.
5. Confirm tech-1 / tech-3 etc. open with one Description section showing their existing `detail` paragraphs (the legacy-fallback path).
6. Confirm a construction project modal is visually unchanged.

### Notes for Phase 5

- Internal scrolling now happens on `.jh-sn-scroll`. Phase 5's embed iframe lives inside `.jh-modal__hero--tech`, which is `flex-shrink: 0` — the iframe gets its natural 16:9 height regardless of body scroll state. No layout conflict.
- The `embedUrl ? <iframe …/> : <carousel …/>` branch sits entirely inside the existing `.jh-modal__hero` block. Phase 4 didn't touch that block; Phase 5 owns it cleanly.
- The Phase 1 user feedback against `max-height: 60vh` on the carousel still stands. If Phase 5 finds the iframe at full 16:9 is too tall on common 1080p displays (squeezing the body), revisit — but don't pre-emptively add the cap.
- `.jh-modal__inner--tech`'s `max-height: calc(100vh - 32px)` is now in place. If a Phase 5 fallback state (revoked embed + image fallback) grows the hero, the body shrinks to absorb — no overflow into the page.

### Post-ship fix — clicking the last sidenav link landed on the second-to-last section

User reported: clicking "What's Next?" from Description left the active dot on "Learning Goals" — needed a second click to settle on "What's Next?". Two interacting bugs:

1. **Last section can't physically reach the scroller's top.** `scrollTo({ top })` clamps at `scrollHeight - clientHeight`. For the final section, that clamp leaves its heading below the top edge — the spy's `section.top ≤ scrollTop` test never triggered for the last section. The same is true of any user-driven scroll to the very bottom — they'd never see "What's Next?" highlight either.
2. **Smooth-scroll fires intermediate scroll events.** Even with #1 fixed, the spy would re-evaluate on every intermediate frame and flicker through the sections we're scrolling past, overriding the optimistic `setActiveId(id)` from `jump()`.

Fix in [components/TechModalBody.tsx](components/TechModalBody.tsx):
- Added a `programmaticScrollRef` flag set inside `jump()` and cleared 800 ms later (covers typical smooth-scroll duration; reduced-motion mode clears it harmlessly because the scroll completes instantly). The spy bails early while the flag is set, so the optimistic `setActiveId` from the click survives.
- Added an `atBottom` check inside the spy (`scrollTop + clientHeight >= scrollHeight - 2`) that pins the last section as active whenever the scroller has nothing left to scroll. Works for both click-initiated and manual scrolling.
- The settle timer is cleaned up in the effect's teardown (and re-cleared on the next click), so unmounting mid-scroll doesn't leak.

### Post-ship fix — sidenav-click overshoot from `html { zoom: 1.1 }`

User reported (with screenshot): clicking a sidenav link landed the section heading clipped ~10–12 px past the scroller's top edge. This is the `html { zoom: 1.1 }` gotcha flagged in [CLAUDE.md](CLAUDE.md) and Phase 0 inventory:

- `Element.getBoundingClientRect()` returns **zoomed** viewport pixels (1.1× CSS pixels).
- `Element.scrollTop` / `Element.scrollTo({ top })` use **unzoomed** CSS pixels.
- The Phase 4 formula `el.BCR.top - scroller.BCR.top + scroller.scrollTop` mixed the two: target overshoot = `(zoom − 1) × delta` ≈ `0.1 × 120` = 12 px clipped.

Fix in [components/TechModalBody.tsx](components/TechModalBody.tsx): added `getZoom()` (reads `getComputedStyle(documentElement).zoom`, falls back to 1) and divided the BCR delta by it inside `sectionTopWithinScroller`. Math is now consistent in unzoomed CSS pixels, so both `scrollTo` and the 6 px tolerance comparison hold whether zoom is 1.0 or 1.1.

**Read this before writing more BCR-based scroll math in Phases 5/6.** Anywhere a measurement crosses the BCR / scrollTop boundary on this site, the zoom factor has to be applied. Use the same `getZoom()` helper or compute inline. Build clean after fix; page bundle 15.6 → 15.7 kB (zoom helper).

### Cleanup left for Phase 6 / future passes

- `.jh-modal__head-main { flex: 1; min-width: 0 }` is now unused for tech (`.jh-modal__inner--tech .jh-modal__head` is `display: grid`, not flex). Phase 3 already flagged this; still harmless dead-ish.
- The legacy-fallback in `getActiveSections` could go away once tech-1/3/4/5/6 are migrated to `description`. Until then, deleting it would silently drop body content. Leave in place.
- No font request changes. Newsreader + Inter only — same set as before Phase 4.

---

## Phase 5 — Changes shipped

Tech-only embed mode. Construction modal untouched per Q3. Skill stack invoked at session start: `next-best-practices`, `vercel-react-best-practices`, `typescript-advanced-types`, `frontend-design`. `security-review` invoked after the diff was final.

### Setup

**[content/technical-projects.json](content/technical-projects.json)** — committed first as a separate setup commit (`a971b68`). Adds `embedUrl` to tech-2b, pointing at the live "Publish to web" URL for the Tonnelle Avenue Risk Dashboard. `embedFallbackImage` intentionally left empty to exercise the no-fallback failure path.

### New file

**[components/TechEmbed.tsx](components/TechEmbed.tsx)** — `'use client'`. Owns the Power BI iframe and its load/error/timeout state machine.

- State modeled as a discriminated union per `typescript-advanced-types`:
  ```ts
  type EmbedState =
    | { status: "loading" }
    | { status: "loaded" }
    | { status: "failed"; reason: "timeout" | "error" };
  ```
  Each branch narrows what's rendered. No three-booleans antipattern.
- 10s timeout in a `useRef`-stored `setTimeout` per `rerender-use-ref-transient-values` (transient value, not state — never read in render, only set/cleared). Both `onLoad` and `onError` clear the timer; the effect's cleanup clears it on unmount.
- `useEffect` keyed on `embedUrl`: resets to `{ status: "loading" }`, starts the timer, returns the cleanup. If the timer fires while still loading, transitions to `{ status: "failed", reason: "timeout" }` via a functional setState that short-circuits if the user navigated to a different state in the meantime (`rerender-functional-setstate`).
- iframe rendered with the README's verbatim attributes: `sandbox="allow-scripts allow-same-origin allow-popups"`, `loading="lazy"`, `referrerPolicy="no-referrer-when-downgrade"`, `title={project.embedLabel || project.title}`, `frameBorder="0"`, `allowFullScreen`, `style={{ width: "100%", height: "100%", display: "block", border: 0 }}`. No `allow-top-navigation`.
- Iframe is not rendered in the failed branch (so the failing iframe stops fetching). It IS rendered for both loading and loaded — the loading overlay sits on top until the `load` event fires, then the overlay disappears and the iframe is visible.
- `key={embedUrl}` on the iframe so switching between embed projects forces a remount (avoids carrying load state between projects).
- Strip overlays the top of the hero: label + optional caption on the left, `INTERACTIVE · POWER BI` badge + `Open ↗` link on the right.
- Failure CTA: `<a target="_blank" rel="noreferrer">Open dashboard in a new tab ↗</a>` — always present in the failed branch, with or without `embedFallbackImage`.

### [components/Modal.tsx](components/Modal.tsx)

Three-line change at the tech-hero branch:
- New `import TechEmbed from "@/components/TechEmbed";`
- New `embedUrl = tech ? project.embedUrl : undefined` extraction (alongside the existing `pdf` / `repo`).
- Hero children now go `tech && embedUrl ? <TechEmbed/> : hasImages ? <photo carousel/> : <thumb grid/>`. Hero container gets a `jh-modal__hero--embed` modifier class when in embed mode, and the bg falls back to `#0d0a07` (same as the photo carousel's dark bg) when `embedUrl` is set, so there's never a swatch flash before the iframe paints.

**Lifecycle:** `<Modal>` is rendered at `components/Portfolio.tsx:83` and returns `null` when `project` is `null`. When the user closes the modal, `Portfolio` sets `activeProject` to `null`, `Modal` returns `null`, and React unmounts the entire subtree — `TechEmbed` is destroyed along with its iframe. When the user opens a different tech project that has an `embedUrl`, the iframe's `key={embedUrl}` forces a remount so the load state machine resets cleanly. **No hidden iframes in the DOM at any time** — verified by inspection of the render tree.

### [next.config.mjs](next.config.mjs)

Added an async `headers()` block returning `Content-Security-Policy: frame-src 'self' https://app.powerbi.com https://*.powerbi.com;` on `source: "/:path*"`. Per Phase 0 finding — no middleware, no `vercel.json`, single source of truth.

`'self'` added defensively beyond the spec-literal directive so future intra-site iframes (e.g. an OG image preview) wouldn't break.

Because the site had no prior CSP, adding only `frame-src` does NOT enforce `default-src` — every other directive (script-src, style-src, img-src, connect-src, …) remains unrestricted. So nothing else broke: contact form `POST /api/contact`, Google Fonts `<link>`, inline JSON-LD `<script>`, AWS SES on the server side, sitemap, robots — all continue to work.

### [app/globals.css](app/globals.css)

Phase 5 block inserted after the `@media (max-width: 700px)` sidenav-collapse rules, before `.jh-modal__meta`. Every selector under the `.jh-embed*` prefix; nothing leaks into other components.

- `.jh-embed`, `.jh-embed__iframe`, `.jh-embed__frame` — absolute fill of the existing 16:9 `.jh-modal__hero--tech` container. The hero's `aspect-ratio: 16 / 9` stays in force; the iframe fills 100% per spec.
- `.jh-embed__strip` — absolute overlay at the top of the hero, `pointer-events: none` on the strip itself and `pointer-events: auto` on its children, so the Power BI report below the strip remains fully clickable while the strip's badge and link stay interactive. Gradient mask fades dark-brown to transparent so the strip never feels like a solid bar slammed on top of the report.
- `.jh-embed__badge` — soft-green (`#c8e8d8`) text on a translucent forest-green (`rgba(31, 78, 60, 0.55)`) pill, per Q4. Dot pulses on a 1.4s loop (`jh-embed-pulse` keyframes — under the 1.5s ceiling). Reduced-motion disables the pulse.
- `.jh-embed__overlay` — covers the iframe during loading and failure. Loading: centered spinner + "Loading interactive report…" caption, with an optional fallback image at 0.35 opacity behind it for warmth. Failure: prominent fallback image at 0.5 opacity + serif failure message + cream CTA pill linking to `embedUrl` in a new tab.
- `.jh-embed__spinner` — pure CSS borders + `@keyframes jh-embed-spin`. Reduced-motion stops the animation (still readable as a static circle).
- `@media (max-width: 600px)` — hides the caption + "Open ↗" link in the strip so it doesn't crowd narrow viewports; the badge remains as the "this is live" indicator.

### CSP verification

Dev server up. `curl -D -` against `/`, `/robots.txt`, `/sitemap.xml` all returned `200` with the header:

```
Content-Security-Policy: frame-src 'self' https://app.powerbi.com https://*.powerbi.com;
```

No other directive set, so nothing else is restricted.

### Security review

Ran the `security-review` skill on the full Phase 5 diff. Findings: **none at HIGH or MEDIUM confidence.** Notes captured in the security review reply for the record:

- Sandbox `allow-scripts allow-same-origin` is safe here because "same-origin" applies to the iframe's own (Power BI) origin, not the parent. The framed page can't escape into the parent.
- Iframe `src` is author-controlled JSON, not user input — no injection vector.
- Both `target="_blank"` links carry `rel="noreferrer"` (implies `noopener`).
- The CSP addition is purely defensive — it closes a potential attack surface (unrestricted outbound framing) without opening any new one.

### Deviations from README spec, recorded

| README literal | Substituted with | Reason |
|----------------|------------------|--------|
| Dark strip background: `#1d2536` (navy) | Existing hero bg `#0d0a07` (deep brown), with a gradient mask | Q4 — keep modal coherent with the site's existing dark-bg treatment. |
| Badge: soft-green on navy | Soft-green on deep-brown forest-green pill | Q4 — accent reuses `--jh-accent` family. |
| CSP literal: `frame-src https://app.powerbi.com https://*.powerbi.com` | `frame-src 'self' https://app.powerbi.com https://*.powerbi.com;` | Defensive `'self'` so future intra-site iframes don't break. Power BI domains preserved verbatim. |
| Strip placement: "above the embed" | Overlaid absolute at the top of the 16:9 hero | Spec also says "the iframe fills 100% width/height". Both can be true only if the strip is overlay. Chose the gradient-fade pattern so the report's chrome below is never obscured (visually, the strip dissolves into the report). |
| Loading state: "centered shimmer or embedFallbackImage if provided" | Centered spinner + "Loading interactive report…" caption; fallback image (if set) at 0.35 opacity behind the spinner | Site has no existing shimmer component; a spinner is the simplest honest indicator. |
| Failure CTA copy | "Open dashboard in a new tab ↗" per spec | Verbatim. |

### Tests vs PHASED_PLAN Phase 5 test list

| # | Test                                                                          | Status |
|---|-------------------------------------------------------------------------------|--------|
| 1 | QA project with valid embedUrl shows the Power BI iframe on modal open. | **Code-verified.** tech-2b's `embedUrl` is the live Tonnelle Avenue Risk Dashboard URL. Visual sign-off pending. |
| 2 | Network panel: Power BI requests fire only on modal open; no requests on a second modal without embedUrl. | **Code-verified by lifecycle inspection.** `TechEmbed` only mounts when `tech && embedUrl` is truthy; React unmounts on close. Browser-verified observation deferred to the user (requires DevTools Network panel). |
| 3 | Homepage Network panel: no Power BI requests fire; card shows static thumbnail. | **Code-verified.** `components/TechSection.tsx:34` only reads `images?.[0]` — never `embedUrl`. tech-2b has no `images`, so the card falls back to the swatch + `"DASHBOARD"` label badge (same as before). Browser-verified observation deferred. |
| 4 | Project with no embedUrl + multi-image array → carousel with arrows + dots. | **Code-verified.** The branch order is `tech && embedUrl ? <TechEmbed/> : hasImages ? <carousel/> : <thumb/>`. Without embedUrl, the carousel renders unchanged. |
| 5 | Project with no embedUrl + single image → carousel without arrows or dots. | **Code-verified.** `images.length > 1` already gates arrows + dots — unchanged from before. |
| 6 | Iframe has a meaningful `title` attribute. | **Code-verified.** `title={project.embedLabel || project.title}` — tech-2b's `embedLabel` is "Tonnelle Avenue Bridge Relocation — Risk Dashboard". |
| 7 | Revoked embedUrl → failure state within 10s, fallback image shows, button works. | **Code-verified for the timeout path.** Spec for "revoked" depends on whether Power BI returns an HTTP error to the iframe (which would fire `onError` immediately) or just serves a "report not available" page (which still fires `onLoad`). The 10s timeout covers the case where Power BI hangs without responding. Browser-verified observation deferred. tech-2b has no `embedFallbackImage`, so the button-only failure state will be exercised in any failure case. |
| 8 | Slow 3G: loading persists past 10s, then failure takes over. | **Code-verified.** The timer fires regardless of network speed; the only race is if `onLoad` fires within the 800ms before the timer is cleared on unmount — handled by the cleanup. Browser-verified deferred. |
| 9 | embedFallbackImage empty + failure → CTA still works. | **Code-verified.** The failure-state render conditions the fallback image on `fallback` truthiness and always renders the CTA. tech-2b has no `embedFallbackImage`, so this is the actual production path for tech-2b. |
| 10 | No CSP console errors on any page. | **Code-verified for CSP.** Only `frame-src` is set, no `default-src` means every other directive remains unrestricted. Curl-verified that the header is set on `/`, `/robots.txt`, `/sitemap.xml` — all 200. Browser-verified console-clean deferred. |

**Build**: `npm run build` clean. Page bundle 15.7 → 16.6 kB (~900 B from `TechEmbed.tsx` + the new Modal branch + the import). Total First Load JS 119 kB.

**Visual verification**: NOT performed by me — same constraint as Phase 4. Dev server SSR confirms HTTP 200, no compile errors, no runtime errors in the dev log, CSP header confirmed on three routes via curl. Manual verification recipe for the user:

1. Open tech-2b modal. Expect the dark strip with "Tonnelle Avenue Bridge Relocation — Risk Dashboard" label, "Live Power BI report — click, filter, and drill down directly." caption, green pulsing badge "● INTERACTIVE · POWER BI", and "Open ↗" link on the right.
2. Loading state: spinner + "Loading interactive report…" should appear briefly before the report finishes loading.
3. Once loaded: the Power BI report fills the 16:9 area. The strip's gradient fades from solid-ish brown at the very top to transparent ~30% down. The Power BI content below the gradient should be clickable.
4. Close the modal, open a different tech project that has photos but no embedUrl (e.g. tech-1, tech-2, tech-3, tech-4, tech-5, tech-6) — confirm the existing photo carousel renders unchanged.
5. DevTools → Network → reload homepage. Confirm zero requests to `app.powerbi.com` or `*.powerbi.com` from the homepage. Then open tech-2b modal and confirm Power BI requests fire. Close, open tech-2 (no embed) — confirm no more Power BI requests.
6. DevTools → Console: zero CSP errors on any page.
7. Failure path: temporarily edit `content/technical-projects.json` to set `tech-2b.embedUrl` to an invalid Power BI URL (e.g. `https://app.powerbi.com/view?r=invalid`). Reload, open tech-2b modal. Expect the failure state within ~10s with the "Open dashboard in a new tab ↗" CTA. Revert the JSON change.
8. Reduced motion: DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Open tech-2b. Expect no badge pulse, no spinner spin, no CTA hover lift.

### Post-ship Phase 5 iteration — unified topbar + liveUrl (Phase 5b)

User feedback on the initial Phase 5 ship:
- The semi-translucent gradient strip overlaid on the Power BI iframe interfered with the report's own indigo header band and was unreadable over filters / text.
- The × close button felt out of place stacked above the chip pills in the title row; it should sit on the dark band where the embed's Open link was.
- Same dark-band treatment should apply to non-embed tech modals (PDF / Repo / × should sit on a band above the carousel, not in the title row).
- Title row was being squeezed by the 5-column chip grid for projects with 6+ tags.
- Need a way to surface a deployed-live-site link for tech projects (e.g. tech-5 Weave, tech-6 Projectify).

Changes (uncommitted at time of writing, included in the Phase 5 commit):
- **New `.jh-modal__topbar`** — full-width dark band (`#14110D`) at the very top of every tech modal. Left side: embed label + caption + INTERACTIVE badge (embed mode only). Right side: PDF, Repo, View live, × pills in that order. Construction modal untouched per Q3.
- **New `liveUrl?: string`** field on `TechProject` ([lib/types.ts](lib/types.ts)). When set, the topbar shows a "View live ↗" pill linking to it. For embed projects, `liveUrl` defaults to `embedUrl` so the View live pill is present without extra config.
- **Label decision**: "View live" (user pick from 4 options: Live site / View live / Live demo / context-aware).
- **`.jh-pill--dark`** modifier — cream-on-dark default, filled cream on hover (mirror of the existing `.jh-pill` light-mode behavior).
- **Removed**: the `.jh-embed__strip` overlay inside TechEmbed and its supporting CSS (open link, gradient, badge inside the strip). TechEmbed is now just the iframe + loading/failure overlays. `.jh-modal__hero--embed` override and `.jh-embed__stage` wrapper also removed; the iframe fills the existing 16:9 `.jh-modal__hero--tech` directly.
- **Title row simplified for tech**: dropped the `.jh-modal__head-right` wrapper that stacked actions above chips. Chips now sit directly in the title row's right grid cell.
- **Chip grid narrowed**: `.jh-chips--grid5` (the 6+ tags case) wraps in rows of 4 instead of 5, giving the title block ~80px more room.

Trade-offs:
- The topbar adds ~44px of vertical chrome to every tech modal, regardless of whether the project has any action pills. Acceptable — the lone × on the right side of an otherwise-empty band is still cleaner than the prior in-title-row layout.
- For non-embed tech modals (e.g. tech-1, tech-3), the topbar's left side is empty. Visually it reads as a clean dark band with the close on the right.
- The chip grid is now 4-col when triggered; tech-5 (7 tags) is the only project that goes to 3 rows of chips. Minor; the title row stays compact.

Build: `npm run build` clean. Page bundle stayed at 16.6 kB (the new topbar JSX + dark-pill CSS netted against the removed embed-strip code).

Outstanding from Phase 5b user feedback:
- Power BI report should land on the Executive page by default. User opted to defer this; the fix is either Power BI Desktop reordering + republish, or appending `&pageName=ReportSection<id>` to the embedUrl in JSON.

### Notes for Phase 6

- The iframe sandbox + `referrerPolicy` are spec-literal; Phase 6 a11y review should confirm the iframe `title` is announced by screen readers (it should — it's a standard accessibility name).
- The failure-state CTA and the strip's "Open ↗" link both use `rel="noreferrer"`. Phase 6 may want to add `rel="noopener"` belt-and-suspenders even though `noreferrer` implies `noopener` — different older browsers handle this differently.
- The badge pulse + spinner are CSS-only; reduced-motion already disables them. The CTA hover lift (`transform: translateY(-1px)`) is also disabled under reduced motion.
- The strip's gradient is positioned via `pointer-events: none` on the gradient itself and `pointer-events: auto` on the children. If Phase 6 wants to test "can the user click on the report area immediately under the strip?", the answer is yes.
- Browser-specific iframe quirks Phase 6 should re-verify:
  - **Safari**: `sandbox` enforcement has historically lagged; check that Power BI's slicers work.
  - **Firefox**: `referrerPolicy` on iframes is honored differently; confirm Power BI receives a referrer.
  - **Chrome**: confirm `loading="lazy"` doesn't defer the iframe past the modal opening (it shouldn't — `lazy` evaluates viewport position at mount, and the modal is in-viewport).
- The `tech-2b` `embedFallbackImage` is still empty. If the user adds one later, the failure and loading overlays automatically pick it up (the CSS is already wired for `.jh-embed__fallback-img`).

---

## Phase 6 — Changes shipped (code) + user-verify checklist

Skill stack invoked at session start: `vercel-react-best-practices`, `frontend-design`. `verify` skill not formally invoked — this session has no browser driver (Windows CLI), so verification gaps are handed off to the user below.

### Code changes

**[components/Modal.tsx](components/Modal.tsx)** — added a keyboard handler on `.jh-modal__hero` for the photo carousel:

```tsx
onKeyDown={
  hasImages && images.length > 1
    ? (e) => {
        if (e.key === "ArrowLeft")  { e.preventDefault(); prev(); }
        else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      }
    : undefined
}
```

Rationale (per `vercel-react-best-practices` → `client-passive-event-listeners`): attach to the hero container, not the document. Events bubble from the carousel arrow / dot buttons (the only focusables inside the hero). `preventDefault()` is needed to suppress the document-level page scroll on arrow keys; that means it can't be `{ passive: true }`. React's synthetic-event system is fine here.

The handler is `undefined` (no listener attached) when there's no carousel or only one image — zero overhead for embed projects and single-image projects.

**[app/globals.css](app/globals.css)** — two additions to the existing `@media (prefers-reduced-motion: reduce)` block:
- `.jh-modal__hero-img` — kills the 0.35s opacity fade between carousel slides; transition is instant.
- `.jh-modal__hero-nav` + `.jh-modal__hero-dot` — kills their hover scale/transform.

Plus a new focus-ring contrast override:
```css
.jh-modal__hero-nav:focus-visible,
.jh-modal__hero-dot:focus-visible,
.jh-modal__topbar .jh-pill--dark:focus-visible {
  outline-color: #f3ece0;
}
```
The global `:focus-visible` rule uses `var(--jh-accent)` (deep forest green `#1F4E3C`); on the near-black carousel bg (`#0d0a07`) and dark topbar (`#14110D`), green-on-dark is too subtle. The cream override (`#f3ece0`) hits ≥4.5:1 contrast on both surfaces.

### Acceptance criteria — disposition

Walking the README checklist line by line. Code-verified items reference the file/line. Anything that requires a running browser is flagged for user verification.

| # | Acceptance criterion | Status |
|---|----------------------|--------|
| 1 | All four content fields render four sections in order. | **Code-verified.** [lib/sections.ts:46-67](lib/sections.ts#L46-L67). |
| 2 | Missing body fields cleanly omit sections AND their side-nav entries. | **Code-verified.** Section registry filter in same function. |
| 3 | Side-nav scroll spy updates active link as user scrolls. | **Code-verified** (Phase 4 implementation; zoom math at [components/TechModalBody.tsx:22-28](components/TechModalBody.tsx#L22-L28)). **User-verify:** browser test. |
| 4 | Clicking a side-nav link smooth-scrolls to that section. | **Code-verified** (Phase 4). **User-verify:** browser test. |
| 5 | Project cards always show the photo thumbnail (regardless of embedUrl). | **Code-verified.** [components/TechSection.tsx:34](components/TechSection.tsx#L34) reads only `images?.[0]`. |
| 6 | Embed projects show ONLY the iframe (no carousel arrows, no dots, no photo flip). | **Code-verified.** Modal branches `tech && embedUrl ? <TechEmbed/>` ([components/Modal.tsx:140](components/Modal.tsx#L140)); TechEmbed renders no arrow/dot chrome. |
| 7 | Non-embed projects show photo carousel with arrows + dots iff `images.length > 1`. | **Code-verified.** [components/Modal.tsx:155](components/Modal.tsx#L155). |
| 8 | Power BI iframe mounted only while modal is open. | **Code-verified.** Modal returns `null` when no project; TechEmbed unmounts with it. `key={embedUrl}` on TechEmbed ([components/Modal.tsx:141](components/Modal.tsx#L141)) forces fresh mount on project switch. |
| 9 | Iframe carries `sandbox`, `loading="lazy"`, meaningful `title`. | **Code-verified.** [components/TechEmbed.tsx:51-66](components/TechEmbed.tsx#L51-L66). |
| 10 | Embed mode shows `● INTERACTIVE · POWER BI` badge. | **Code-verified** (moved to topbar in Phase 5b — [components/Modal.tsx:128](components/Modal.tsx#L128)). |
| 11 | Loading state during iframe init; `embedFallbackImage` + "Open in new tab" CTA on failure or 10s timeout. | **Code-verified.** [components/TechEmbed.tsx:24-43, 67-110](components/TechEmbed.tsx#L24-L110). **User-verify:** browser test (10s timeout path requires deliberately broken URL). |
| 12 | CSP includes `frame-src https://app.powerbi.com https://*.powerbi.com`. | **Code-verified + curl-verified** at end of Phase 5 (header present on `/`, `/robots.txt`, `/sitemap.xml`). |
| 13 | Empty `description` / `objectives` / `challenges` / `futureFeatures` / `images` behave identically to absent. | **Code-verified.** Same registry filter. |
| 14 | Modal scales fluidly mobile → 1240px ceiling. | **Code-verified** (Phase 1). **User-verify:** browser at 375, 768, 1280, 1920px. |
| 15 | Carousel preserves aspect ratio at every viewport size. | **Code-verified.** `aspect-ratio: 16/9` on `.jh-modal__hero--tech`. |
| 16 | Title size + sidenav column width scale per spec. | **Code-verified** (Phase 1, Phase 4). |

### PHASED_PLAN Phase 6 deliverables — disposition

| Deliverable | Status |
|-------------|--------|
| Tab order verified through the whole modal: title row, pills, close, sidenav links, body content, carousel arrows (photo mode only). | **Code-verified** (focus trap at [components/Modal.tsx:40-67](components/Modal.tsx#L40-L67); DOM order: topbar → hero buttons → title row → sidenav → body links → ...). **User-verify:** real Tab cycle. |
| Esc closes from any focused element. | **Code-verified.** `document.addEventListener("keydown", ...)` catches Escape regardless of focused element. |
| ←/→ navigate the photo carousel when focus is inside it. | **Code-shipped this phase.** Handler on `.jh-modal__hero`, events bubble from arrow/dot buttons. |
| Carousel nav arrows have a visible focus ring. | **Code-verified.** Global `:focus-visible` rule applies; this phase added a cream-color override for the dark carousel surface. |
| `prefers-reduced-motion: reduce` honored for sidenav smooth-scroll AND photo carousel transitions. | **Code-verified.** Sidenav: Phase 4. Carousel opacity fade + arrow/dot hover scale: this phase. |
| Lighthouse run on a photo project modal page. Score in PROJECT_STATE.md. | **User-driven** — see below. |
| Lighthouse run on an embed project modal page. Score in PROJECT_STATE.md. | **User-driven** — see below. |
| Cross-browser smoke: Chrome, Safari, Firefox. Record any deltas. | **User-driven** — see below. |

### Build

`npm run build` clean. Page bundle 16.6 → 16.7 kB (~100 B from the inline carousel keyboard handler).

### User-verify checklist (do these in a real browser)

**1. Keyboard tab cycle through tech-2b modal (embed):**
- Open tech-2b. Press Tab. Expect order: × close → focus loops back (tech-2b has no PDF, Repo, or Live-site pill, and the iframe captures focus but isn't part of the tab cycle from outside).
- Open tech-2 (has PDF). Tab order: PDF → × → (sidenav links) → ...
- Esc from anywhere inside any modal closes it.

**2. Keyboard tab cycle through tech-3 modal (photo carousel, multiple images):**
- Tab: × → prev arrow → next arrow → dot 1 → dot 2 (whichever apply) → sidenav links → body content.
- With focus on a carousel arrow or dot, press ←/→. The image should change. Wrap at ends (last → first).

**3. Focus rings:**
- Tab through every modal. Every interactive element should show a visible outline.
- On the dark topbar pills and carousel arrows, the outline should be **cream** (`#f3ece0`), not the default green — confirms the dark-surface override fired.
- On cream-surface elements (sidenav links, body interactive bits), outline should be **green** (`var(--jh-accent)`).

**4. Reduced motion:**
- DevTools → Rendering → emulate `prefers-reduced-motion: reduce`.
- Open tech-3 (multi-image carousel). Press ← or →. Image should swap instantly (no opacity fade).
- Hover over carousel arrows. No scale animation.
- Open tech-2b. INTERACTIVE badge dot should not pulse. Spinner shouldn't spin.
- Sidenav: click a section link. Scroll should be instant, not smooth.

**5. Lighthouse — photo project (tech-1, tech-3, etc.):**
- DevTools → Lighthouse → Performance + Accessibility + Best Practices + SEO.
- Run against the homepage (`/`) in mobile + desktop modes.
- Paste the four scores back to me and I'll record them in this file.

**6. Lighthouse — embed project (tech-2b modal open):**
- Lighthouse cannot drive modal-open state easily. Either:
  - (a) Run Lighthouse against `/`, then separately note that embed-mode performance depends on Power BI's runtime weight (not the site's First Load JS).
  - (b) Use Lighthouse's interactive audit mode (if available in your Chrome version) and open the modal during the trace.
- Either path is fine; document what you did.

**7. Cross-browser smoke:**
- Chrome (latest): full pass through 1, 2, 3, 4 above.
- Firefox (latest): same.
- Safari (latest, macOS or iOS Simulator): same. Particular things to watch:
  - Power BI iframe sandbox behavior (Safari has historically been stricter).
  - `aspect-ratio` CSS support (modern Safari supports it; older WebKit may not).
  - `clamp()` font-size scaling.
  - Carousel arrow key events (some browsers preventDefault behavior differs).
- Record any deltas back to me (or just note "all three pass").

### Outstanding (deferred per user)

- Power BI report should land on Executive page by default. User to fix in Power BI Desktop by reordering tabs + republishing. No code change needed once Power BI's CDN serves the updated default.

### Modal redesign — complete (pending user-driven verification)

All six phases of the modal redesign are now landed. Outstanding work is verification-only:
- Visual sign-off on Phases 3, 4, 5, 5b.
- User-driven a11y / keyboard / Lighthouse / cross-browser verification (Phase 6 checklist above).
- Power BI Executive-page fix in Power BI Desktop.

If everything passes, the `In-progress work` section in [CLAUDE.md](CLAUDE.md) can be removed (or moved to a "Completed" history entry).

---

## Conventions for subsequent phases

- Every phase reads this file at start and writes to it at end (phase status, decisions made, new gotchas discovered).
- Reference [side projects/powerbiembed/PHASED_PLAN.md](side projects/powerbiembed/PHASED_PLAN.md), [side projects/powerbiembed/README.md](side projects/powerbiembed/README.md), [side projects/powerbiembed/modal.reference.jsx](side projects/powerbiembed/modal.reference.jsx) by path. Do not paste them into context.
- The `frontend-design` skill is a **guardrail against AI-generic styling**, not a license to redecorate. Preserve the bespoke cream + Newsreader + green treatment. Do not introduce Inter where Newsreader belongs, do not introduce shadcn defaults, do not invent a new font family.
- Phases 4 and 5 are large enough to warrant subagent delegation per PHASED_PLAN.
- A11y, keyboard, and reduced-motion are obligations of each phase, not deferred to Phase 6.
