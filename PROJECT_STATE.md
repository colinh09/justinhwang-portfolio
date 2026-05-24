# PROJECT_STATE.md — Project Modal Redesign

Durable record between sessions for the Power BI–embed modal redesign described in [side projects/powerbiembed/PHASED_PLAN.md](side projects/powerbiembed/PHASED_PLAN.md), [side projects/powerbiembed/README.md](side projects/powerbiembed/README.md), and [side projects/powerbiembed/KICKOFF.md](side projects/powerbiembed/KICKOFF.md). Every phase reads this file at start and writes to it at end.

The `side projects/` folder is local-only (see [side projects/.gitignore](side projects/.gitignore)); reference it by path, do not paste it into context.

---

## Phase status

| Phase | Title                                  | Status                |
|-------|----------------------------------------|-----------------------|
| 0     | Reconnaissance                         | **DONE — awaiting Phase 1 go-ahead** |
| 1     | Responsive sizing fix on existing modal | **DONE — visually signed off after one tuning iteration** |
| 2     | Data schema + QA fixture                | Not started           |
| 3     | Header chrome (PDF / Repo / × pills)    | Not started           |
| 4     | Body restructure + sidenav              | Not started           |
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

## Conventions for subsequent phases

- Every phase reads this file at start and writes to it at end (phase status, decisions made, new gotchas discovered).
- Reference [side projects/powerbiembed/PHASED_PLAN.md](side projects/powerbiembed/PHASED_PLAN.md), [side projects/powerbiembed/README.md](side projects/powerbiembed/README.md), [side projects/powerbiembed/modal.reference.jsx](side projects/powerbiembed/modal.reference.jsx) by path. Do not paste them into context.
- The `frontend-design` skill is a **guardrail against AI-generic styling**, not a license to redecorate. Preserve the bespoke cream + Newsreader + green treatment. Do not introduce Inter where Newsreader belongs, do not introduce shadcn defaults, do not invent a new font family.
- Phases 4 and 5 are large enough to warrant subagent delegation per PHASED_PLAN.
- A11y, keyboard, and reduced-motion are obligations of each phase, not deferred to Phase 6.
