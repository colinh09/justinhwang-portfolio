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
| 5     | Embed mode (iframe + CSP + lifecycle)   | Not started           |
| 6     | A11y, keyboard, cross-browser           | Not started           |

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

## Conventions for subsequent phases

- Every phase reads this file at start and writes to it at end (phase status, decisions made, new gotchas discovered).
- Reference [side projects/powerbiembed/PHASED_PLAN.md](side projects/powerbiembed/PHASED_PLAN.md), [side projects/powerbiembed/README.md](side projects/powerbiembed/README.md), [side projects/powerbiembed/modal.reference.jsx](side projects/powerbiembed/modal.reference.jsx) by path. Do not paste them into context.
- The `frontend-design` skill is a **guardrail against AI-generic styling**, not a license to redecorate. Preserve the bespoke cream + Newsreader + green treatment. Do not introduce Inter where Newsreader belongs, do not introduce shadcn defaults, do not invent a new font family.
- Phases 4 and 5 are large enough to warrant subagent delegation per PHASED_PLAN.
- A11y, keyboard, and reduced-motion are obligations of each phase, not deferred to Phase 6.
