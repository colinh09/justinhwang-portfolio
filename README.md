# Justin Hwang — Portfolio Site

A Next.js 15 portfolio for Justin Hwang, deployed to [jh-projectcontrols.com](https://jh-projectcontrols.com).

Stack: Next.js (App Router) · React 19 · TypeScript · Resend (contact form) · Vercel (hosting). Content lives in JSON files under `content/` so it can be edited without touching code.

---

## Editing content

Everything Justin would normally want to change — projects, bio, services, credentials, employer, contact info — lives in **`content/`** as JSON files. Edit a file, commit (via the GitHub web UI is fine), and Vercel auto-deploys within ~30 seconds.

```
content/
├── site.json                    # Bio, name, eyebrow, contact info, credentials, toolkit
├── services.json                # The four services in the Capabilities section
├── construction-projects.json   # All construction projects (modal cards in Section 02)
└── technical-projects.json      # Technical projects (modal cards in Section 01)
```

### Quick reference: what's in each file

| File | Edit this when… |
|---|---|
| `site.json` → `profile` | Switching jobs, moving cities, changing email or LinkedIn |
| `site.json` → `hero.eyebrow` | Bumping the year (e.g., "Portfolio · 2026" → "Portfolio · 2027") |
| `site.json` → `hero.bio` | Tweaking the four bio paragraphs in the Index section |
| `site.json` → `credentials` | Adding a new certification or credential |
| `site.json` → `toolkit` | Adding software you've started using |
| `services.json` | Editing the four service cards under Capabilities |
| `construction-projects.json` | Adding a new construction project, editing one, removing one |
| `technical-projects.json` | Adding a new technical/dashboard/model/tool project |

### Adding a construction project

1. Open `content/construction-projects.json` on GitHub: [edit on github.com](https://github.com/colinh09/justinhwang-portfolio/edit/main/content/construction-projects.json)
2. Paste a new entry **at the top of the array** (so newest shows first), copying the structure of the existing entries:

```json
{
  "id": "p11",
  "title": "Project Name",
  "sub": "Short description, square footage, key context",
  "location": "City, State",
  "sector": "Transit",
  "role": "Project Controls",
  "value": "$120M",
  "dates": "2025 — Present",
  "swatch": "#2d3a4a",
  "label": "SHORT NAME",
  "contributions": [
    "Bullet point describing your contribution",
    "Another bullet point",
    "A third bullet point"
  ],
  "description": "1–3 sentences setting context for the project — owner, scope, what made it interesting, schedule pressure, etc."
},
```

3. Don't forget the trailing comma after the closing `}` if there are more entries below it.

**Field guide:**

- `id`: any unique string. Convention: `p1`, `p2`, … (just bump the next number)
- `sector`: must be exactly one of `Transit`, `K-12`, `Higher Ed`, `Healthcare`, `Corporate Interiors`, `Residential` (the filter chips depend on these)
- `role`: must be exactly one of `Project Controls`, `Estimator`, `Change Manager`, `Project Manager`, `Project Engineer`, `Procurement Manager`, `Commercial Manager`
- `value`: the construction value or contract value as a string. Use `"—"` (em-dash) if not applicable; the value cell hides automatically.
- `swatch`: a dark hex color for the card thumbnail. Pick one that sort of suggests the project (steel-blue for transit, terracotta for residential, etc.)
- `label`: short uppercase label that floats over the card thumbnail. Keep it under 12 characters.

### Adding a technical project

Same pattern, but in `content/technical-projects.json`. Schema:

```json
{
  "id": "tech-5",
  "title": "Tool Name",
  "blurb": "One-sentence description shown on the card.",
  "tags": ["Power BI", "Python", "SQL"],
  "swatch": "#1c2a3a",
  "label": "DASHBOARD",
  "detail": "1–3 sentences with deeper detail, shown when someone clicks the card to open the modal.",
  "images": ["/tech-5-screen-1.png", "/tech-5-screen-2.png"]
}
```

`images` is **optional**. When provided, the modal shows a carousel (with prev/next arrows and dots) instead of the colored swatch. Drop the image files in `public/`, then reference them by path (e.g., `"/dashboard-screenshot.png"`). If you only want one image, pass an array with one entry — arrows and dots are hidden automatically. Omit the field entirely to keep the swatch.

### Editing the bio

Open `content/site.json`, find `hero.bio`, edit any paragraph. Each paragraph is a string in the array — keep them as separate strings (don't merge into one).

Watch out for special characters in JSON:
- Use `\"` for any double-quote inside a string
- Use `\\` for a backslash
- Apostrophes and em-dashes (`—`) are fine as-is

### Asking AI to format a new entry

If you don't want to think about JSON syntax, paste this prompt to ChatGPT or Claude with your project info:

> I have a portfolio site. Construction projects are stored as JSON. Here's the schema I follow:
>
> ```ts
> {
>   "id": "p11",
>   "title": "string",
>   "sub": "string",
>   "location": "string",
>   "sector": "Transit" | "K-12" | "Higher Ed" | "Healthcare" | "Corporate Interiors" | "Residential",
>   "role": "Project Controls" | "Estimator" | "Change Manager" | "Project Manager" | "Project Engineer" | "Procurement Manager" | "Commercial Manager",
>   "value": "string (e.g. $120M, or — if unknown)",
>   "dates": "string (e.g. 2025 — Present)",
>   "swatch": "hex color string (dark; e.g. #2d3a4a)",
>   "label": "uppercase short label, under 12 chars",
>   "contributions": ["array of bullet point strings"],
>   "description": "1–3 sentence project description"
> }
> ```
>
> Generate a JSON entry for the following project. Output ONLY the JSON object (no markdown, no commentary), ready to paste into an array:
>
> [paste your project info here]

You'll get back a valid JSON entry to paste into the file.

### Adding a project image (optional)

Project thumbnails default to a solid swatch color. To use a real image instead:

1. Upload the image to `public/images/projects/construction/` (for construction) or `public/images/projects/technical/` (for tech) via GitHub web UI
2. For a **construction project**, add a single `"image": "/images/projects/construction/your-file.jpg"` field. The image replaces the swatch on the card and fills the hero of the modal.
3. For a **technical project**, add an `"images": ["/images/projects/technical/a.jpg", "/images/projects/technical/b.jpg"]` array. The first image becomes the card thumbnail; the modal shows a carousel with prev/next arrows and dot indicators across all entries.
4. Omit the field entirely to keep the colored swatch.

Aspect ratios: cards crop to 4:3 (construction) or 16:10 (tech); the modal hero crops to 21:9. Make sure the focal point is centered so cropping looks intentional.

### Common mistakes to avoid

- **Trailing commas** are NOT allowed in JSON. The last item in an array or object should not have a comma after it.
- **Single quotes** are not valid JSON. Always use double quotes around strings and keys.
- **Missing comma between entries** — every project entry except the last must end with a `,` after the closing `}`.
- **Sector or role typo** — must match the allowed values exactly (case-sensitive). A typo will cause the project to never appear under filter chips.

If you commit a broken JSON file, **the live site stays up on the previous deploy**. Vercel will email you with a build failure and you can fix and re-commit. No downtime.

### Workflow summary

1. Edit a file in `content/` (use github.com web editor)
2. Commit the change with a short message like "Add Hunters Point T4"
3. Wait ~30 seconds — Vercel auto-deploys
4. Refresh the live site to verify

---

## Local development

```bash
npm install
npm run dev
```

Site runs on [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SITE_URL` — the canonical URL (used for sitemap, OG image, JSON-LD)
- `RESEND_API_KEY` — for the contact form. Sign up at [resend.com](https://resend.com); free tier covers 3000 emails/month.
- `RESEND_FROM_EMAIL` — optional override for the contact-form sender address. Defaults to `onboarding@resend.dev`.

### Project structure

```
app/                    # Next.js App Router (layout, pages, API routes, OG image)
components/             # React components (Sidebar, Hero, sections, Modal, Form)
content/                # JSON content files — what you edit to update the site
lib/
  content.ts            # Loads content/*.json and exports typed values
  types.ts              # Type definitions for projects, sectors, roles
public/                 # Static assets (resume PDF, images, favicon)
```

## Deployment

Pushes to `main` auto-deploy to Vercel. Preview deployments are created for any other branch / PR.
