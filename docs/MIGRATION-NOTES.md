# Astro Modernization — Migration Notes

Summary of the Reptar → Astro 7 migration of samhinshaw.com: what to do next, what was done, and what was deliberately deferred.

**Status:** Fully implemented on branch `astro-modernization` (HEAD `8c082e6`). Working tree clean. `npm run verify` → `astro check` 0 errors / 0 warnings / 0 hints, build 25 pages, URL-parity check fully green (exit 0). **Not yet merged to `master` and not yet deployed** — those are intentionally left as manual go/no-go decisions.

Design docs: [`specs/2026-07-08-astro-modernization.md`](specs/2026-07-08-astro-modernization.md) (authoritative spec) and [`plans/2026-07-10-astro-modernization.md`](plans/2026-07-10-astro-modernization.md) (the 16-task implementation plan). Deploy runbook: [`DEPLOY.md`](DEPLOY.md).

---

## 1) What to do next

### A. Smoke-test locally

`npm run dev` (serves at `http://localhost:4321`), then:

- Click through: home → `/blog/` → a couple of posts → `/about/` → `/projects/` → `/tags/` → a tag page → then hit a bogus URL to confirm the 404.
- **Toggle your OS light/dark appearance** and confirm colors invert on any page. There is no in-page switcher — by design (system preference only).
- **Exercise the two complex posts:**
  - `/blog/designing-rudaux/` — the "LTI Terminology" **`<details>` accordion** expands/collapses; the top **blockquote's Documentation / Source Code links** work.
  - Cross-links both directions: `using-rudaux` → `designing-rudaux/#grading-server` should jump to the Grading Server heading; `designing-rudaux` → `using-rudaux` should resolve.
  - `/blog/lazy-loading-r-packages-in-shiny/` — confirm **code blocks are syntax-highlighted** (Shiki) and that the two _italic captions_ substituted for the old live demo-buttons read acceptably in context.
- Check a post at mobile width (responsive layout).
- Load `/rss.xml` (7 items) and `/sitemap-index.xml`.

### B. Content decisions (owner's call)

- **The 6 drafts** (Autokey, LetsEncrypt, Firefox Nightly, SSH Keys, ZSH, "Building a Blog with Reptar") are in the repo but unpublished. To publish one later: delete its `draft: true` line **and** add its URL back to `scripts/check-urls.mjs`.
- A few `<span class="hover-text" title="…">` **tooltip asides were flattened to plain text** (e.g. the Latin etymology of "ligature"). Restoring them would need a real footnote/tooltip mechanism.
- The Rudaux "Source Code" links use `http://github.com/...` (verbatim from the old source). GitHub auto-redirects to HTTPS; you may want to bump them to `https://`.

### C. Deploy (full runbook in `DEPLOY.md`)

1. Decide first: **merge `astro-modernization` → `master` and deploy from there, or deploy from the branch?** Set Cloudflare's production branch accordingly.
2. Push → Cloudflare Pages → Connect to Git → preset **Astro**, build `npm run build`, output `dist`, env `NODE_VERSION=22`.
3. Verify on the `*.pages.dev` preview, then attach `www.samhinshaw.com` and pick apex (`samhinshaw.com`) behavior.
4. **After go-live, watch for 404s** on old inbound URLs (Search Console / analytics). The 13 post URLs are preserved, but if the old site exposed anything else — pagination pages, a feed at a path other than `/rss.xml` — add a `public/_redirects` entry (format documented in `DEPLOY.md`).

---

## 2) Everything we did

Executed the 16-task plan via fresh subagents per task with review gates.

| Area             | What landed                                                                                                                                                                                                                                                                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Repo**         | Archived the Reptar/Bulma/LESS site to `legacy/`, moved kept assets to `public/`, rewrote `.gitignore`; removed `legacy/` entirely at the end.                                                                                                                                                                                                        |
| **Framework**    | Scaffolded **Astro 7.0.7**, Node 22 pin (`.nvmrc`), strict `tsconfig`.                                                                                                                                                                                                                                                                                |
| **Styling**      | **Vanilla Extract** via Vite plugin — _de-risked first_ and confirmed it builds on Astro 7's Vite 8 / Rolldown bundler (no Astro 6 fallback needed). Roll-your-own system: `theme.css.ts` (tokens + **system dark mode**), `reset.css.ts`, `prose.css.ts`. No Bulma.                                                                                  |
| **Integrations** | `@astrojs/sitemap`, `@astrojs/rss`, `@astrojs/check`; built-in **Shiki** highlighting.                                                                                                                                                                                                                                                                |
| **Content**      | Typed `blog` collection (Zod schema, glob loader). **Migrated 13 posts** — stripped Bulma/FontAwesome/template chrome, converted info-cards → blockquotes, the collapsible widget → native `<details>`, rewrote inter-post links to absolute `/blog/<slug>/`, preserved all code fences. Fixed a pre-existing malformed `</dt>` in the legacy source. |
| **Routes**       | Home, blog index + `[slug]` post pages (routed by `post.id`), about, **projects stub**, 404, tag index + per-tag pages, `rss.xml`.                                                                                                                                                                                                                    |
| **Guardrail**    | `scripts/check-urls.mjs` written _red-first_ (TDD-style), goes green as routes land — asserts every published URL is emitted to `dist/`.                                                                                                                                                                                                              |
| **Docs**         | `DEPLOY.md` runbook; rewrote `README`; amended the plan doc for the draft decision; this file.                                                                                                                                                                                                                                                        |
| **QA**           | Full `verify` gate + a rigorous final branch review (posts diffed against pre-archive source, build output checked for draft leakage) — clean, ready to deploy; fixed its one Minor finding (removed an unused `SITE_URL` const).                                                                                                                     |

**Key decisions made in-flight:**

- **Kept 6 posts as drafts** (owner's call) → only the **7 published** posts get public URLs; `check-urls.mjs` covers those 7 + 5 section pages = 12 URLs.
- Single blog list, **no pagination**.
- **No `public/_redirects`** shipped (documented as optional).

**Result:** URLs for all 7 published posts preserved exactly at their original title-slugs; `astro check` 0/0/0; build 25 pages; URL parity green.

---

## 3) Left for future follow-up

Intentionally deferred (spec §11) — the barebones-now, redesign-later scope:

- **Icons** (replaced FontAwesome with emoji/text).
- **Hero photos** — posts had hero images + accent colors; dropped for now (the images remain in `public/images/`).
- **Info-card components** — the Rudaux cards are now plain blockquotes.
- **Fira Code + ligatures** — currently a system-monospace stack.
- **Projects page rebuild** — currently a stub linking to GitHub.

Surfaced during execution, worth a later pass:

- Publishing/finishing any of the **6 drafts**.
- The About page's **avatar/portrait** (dropped with the Bulma columns) — re-add during the redesign.
- Restoring the **hover-text asides** if desired.
- `http` → `https` on the Rudaux source-code links.
- Image optimization (`astro:assets`), comments, analytics — all on the §11 deferral list.
- The **redesign itself** — the current visual design is deliberately minimal.
