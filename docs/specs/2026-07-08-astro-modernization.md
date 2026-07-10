# Modernizing samhinshaw.com: Reptar → Astro

- **Status:** Approved plan (pre-implementation)
- **Date:** 2026-07-08 · **Revised:** 2026-07-10 (simplified scope — cut compatibility/fidelity tax)
- **Author:** Sam Hinshaw (with Claude)
- **Scope:** Rebuild the blog on Astro, styled with Vanilla Extract, drop Bulma, deploy free on Cloudflare Pages. **Deliberately barebones** — this is NOT a 1:1 migration. Several old features are intentionally deferred (see §11).

---

## 1. Goals & non-goals

**Goals**
- Replace the dormant **Reptar** SSG with **Astro**; remove **Bulma** + LESS/node-sass.
- Style with **Vanilla Extract (VE)**, kept minimal.
- **Barebones** — a clean foundation Sam will redesign later. Prefer the simplest thing that works.
- **Plain Markdown** posts (strip the embedded Bulma HTML; no MDX).
- **Cloudflare Pages** (free), git-push deploys, custom domain, HTTPS.
- Features: **tag pages**, **system-preference dark mode** (no toggle), **RSS**, **sitemap**, basic **SEO/OpenGraph meta**, and **syntax highlighting** (Astro's built-in Shiki).
- Keep the **old post URLs** working — cheap, since we just name files by the old slug.

**Non-goals (deliberately cut — see §11 for the deferral list)**
- Fidelity to the old visual design; **hero photos**; self-hosted **Fira Code**; **icon** system.
- **MDX** and rich in-post components (info-cards).
- **Expressive Code** frames/copy-buttons (built-in Shiki is enough).
- URL-preservation ceremony (live-site diff, redirects, strict URL audit).
- Comments, analytics, PWA/manifest, image optimization — later, if ever.

---

## 2. Current state (migrating from)

- **SSG:** Reptar (`reptar.config.js`), unmaintained; builds to a local `serve/` path (self-hosted today).
- **Templating:** Nunjucks in `_templates/` (`base` → `common` → `post`/`page`/`landing_page`, plus `_loop`/`_pagination`/`tag`).
- **Styling:** Bulma 0.5.1 + LESS partials + a hand-picked `_highlight_atom-one-dark.css` + `normalize.css`.
- **Content:** 13 Markdown posts (2016–2018) in `_posts/`; root pages in `_root/` (`about`, `projects`, `blog`); landing `index.md`; `_error/404.md`. **Bulma markup is embedded inside post Markdown** (cards, columns, FontAwesome icons); one post (`designing-rudaux`) opens by closing a `</div>` left open by the old template.
- **JS:** one `js/main.js` (navbar burger, copyright modal, collapsible) tied to Bulma classes + FontAwesome.
- **Assets:** Fira Code woff2, FontAwesome font, ~41 hero photos (inline `background-image`), full favicon/PWA set, `data/dictionary.json` (3.2 MB, apparently dead).
- **URLs:** posts `/blog/:title/` (from the slugified **title**, not the filename), root pages `/:title/`, blog index `/blog/`. Domain `www.samhinshaw.com`.

---

## 3. Target stack

| Layer | Today | Proposed (current as of June 2026 — pin & verify at build) |
|---|---|---|
| SSG | Reptar | **Astro 7.0.x**, Node 22.12+ |
| Content | Nunjucks + inline Bulma HTML | **Plain Markdown** in a typed content collection (no MDX) |
| Styling | Bulma + LESS | **Vanilla Extract** (`@vanilla-extract/css` + `vite-plugin`), minimal |
| Bulma replacement | — | **Roll-your-own VE** (tokens + reset + prose); no framework (§4) |
| Code highlighting | highlight.css theme | **Built-in Shiki** (default; zero deps/config) |
| Fonts | self-hosted Fira Code | **System font stack** (no self-hosted fonts) |
| Icons | FontAwesome font | **None** — plain text/emoji links |
| Dark mode | none | **System-only** via `@media (prefers-color-scheme: dark)` |
| Feeds/SEO | none | `@astrojs/rss`, `@astrojs/sitemap` (needs `site`), small OG/meta component |
| Post headers | hero photo + gradient + credit | **Title + date (+ optional byline) + prose** |
| Images | inline `background-image` | Files retained in `public/images/`; not rendered as heroes for now |
| Hosting | self-hosted | **Cloudflare Pages** (free) |

> **Dependency count drops to ~4:** `astro`, `@astrojs/rss`, `@astrojs/sitemap`, `@vanilla-extract/css` (+ its dev-only `vite-plugin`). Shiki is built into Astro.

> **Astro 7 note:** ships **Vite 8 + Rolldown** (new Rust bundler) and a strict **Rust `.astro` compiler** (errors on unbalanced HTML — relevant to the post cleanup). Validate the VE build on this toolchain first (§9).

---

## 4. Replacing Bulma — decision

Vanilla Extract is itself a full styling *system* (theme contracts = tokens, Sprinkles = utilities, Recipes = component variants), so most "frameworks" (Tailwind, UnoCSS, Panda) are **redundant** with it, and the token/prose helpers (Open Props, Pico) are only *complementary*.

**Decision: roll our own in VE, minimal.** For the barebones phase that means only:
- a small **theme contract** (~15 tokens: color, space, type scale) with system light/dark;
- a ~30-line **global reset** (also covers nav/footer layout);
- a small **`globalStyle` "prose" sheet** for the Markdown body.

**Defer** Sprinkles/Recipes, and any token library (Open Props), until the redesign. No Tailwind/UnoCSS/Panda.

---

## 5. Hosting — decision

Static Astro needs **no adapter** (`astro build` emits static files).

**Decision: Cloudflare Pages (free).** The domain's DNS is already in Cloudflare, so custom-domain + automatic HTTPS wiring is seamless. Plus **unlimited bandwidth**, **no non-commercial restriction**, free per-branch previews, and free privacy-first Web Analytics. Zero-config for static Astro (build `astro build`, output `dist/`). Future SSR (if ever) runs on Cloudflare Workers via `@astrojs/cloudflare`.

Alternative: **Vercel** (best DX/previews) — but non-commercial-only free tier, 100 GB cap, and the domain lives elsewhere. Rejected: Netlify (tightened 2026 free tier), GitHub Pages (no previews, static-only).

---

## 6. Target architecture

```
src/
  consts.ts                    # site title/description/social/URL
  content.config.ts            # blog collection: glob() loader + Zod schema (z from 'astro/zod')
  content/blog/*.md            # the 13 posts, cleaned to plain Markdown
  layouts/                     # BaseLayout, PageLayout, PostLayout (.astro)
  components/                  # BaseHead (SEO/OG), Nav, Footer (.astro)
  pages/
    index.astro                # landing (/)
    about.astro                # /about/
    projects.astro             # /projects/  (simple stub for now — see §11)
    404.astro
    blog/index.astro           # /blog/  — lists ALL posts (no pagination)
    blog/[slug].astro          # /blog/<slug>/  — a post
    tags/index.astro           # /tags/  — all tags
    tags/[tag].astro           # /tags/<tag>/
    rss.xml.js                 # @astrojs/rss
  styles/                      # theme.css.ts (tokens + system dark), reset.css.ts, prose.css.ts
public/
  images/*                     # retained (in-body images; heroes unused for now)
  favicon.ico, apple-touch-icon.png
scripts/check-urls.mjs         # build-output URL sanity check
astro.config.mjs               # site, trailingSlash:'always', sitemap(), VE vite plugin
```

- **Content collection:** `src/content.config.ts`, `glob()` from `astro/loaders`, Zod from `astro/zod`. Each post file is **named by its URL slug**; route by the file's `id`. Schema: `title, date, excerpt?, byline?, subtitle?, lastUpdated?, draft (default false), tags (default [])`.
- **Styling / dark mode:** light tokens on `:root`, overridden in `@media (prefers-color-scheme: dark)` — no toggle, no JS, no flash.
- **Code blocks:** Astro's built-in Shiki (default theme). No extra integration.
- **Interactivity:** none needed — plain semantic nav, no burger/modal/island.

---

## 7. URL handling

Reptar built post URLs from the slugified **title** (not the filename), so 11 of 13 filenames diverge from their URL. We preserve the URLs the cheap way: **name each new content file with its slug** (map below) and route by the file `id`; set `trailingSlash: 'always'` to keep the `/blog/foo/` shape. No live-site diff, no redirect audit.

| Legacy file | New file `src/content/blog/…` | URL |
|---|---|---|
| `2016-09-23-UpdateRstudio.md` | `automatically-update-rstudio.md` | `/blog/automatically-update-rstudio/` |
| `2017-02-09-autokey.md` | `installing-autokey.md` | `/blog/installing-autokey/` |
| `2017-02-09-encryption.md` | `encryption-commands-for-letsencrypt.md` | `/blog/encryption-commands-for-letsencrypt/` |
| `2017-02-09-FirefoxNightly.md` | `how-to-install-firefox-nightly.md` | `/blog/how-to-install-firefox-nightly/` |
| `2017-02-09-NodeJS.md` | `installing-node-js-on-linux.md` | `/blog/installing-node-js-on-linux/` |
| `2017-02-09-SSH_keys.md` | `how-to-setup-your-ssh-keys.md` | `/blog/how-to-setup-your-ssh-keys/` |
| `2017-02-10-zsh.md` | `installing-zsh.md` | `/blog/installing-zsh/` |
| `2017-09-04_reptar.md` | `building-a-blog-with-reptar-and-bulma.md` | `/blog/building-a-blog-with-reptar-and-bulma/` |
| `2017-09-13_ligatures.md` | `ligature-support-in-monospace-fonts.md` | `/blog/ligature-support-in-monospace-fonts/` |
| `2017-09-28_template-literals.md` | `wrapping-template-literals-in-vs-code.md` | `/blog/wrapping-template-literals-in-vs-code/` |
| `2017-10-20_dynamic_package_loads.md` | `lazy-loading-r-packages-in-shiny.md` | `/blog/lazy-loading-r-packages-in-shiny/` |
| `2018-08-24-designing-rudaux.md` | `designing-rudaux.md` | `/blog/designing-rudaux/` |
| `2018-08-24-using-rudaux.md` | `using-rudaux.md` | `/blog/using-rudaux/` |

Old paginated index pages (`/blog/2/`, `/blog/3/`) go away with the single-list blog. Optionally add two lines to `public/_redirects` (`/blog/2/ /blog/ 301`) — otherwise they simply 404 (negligible risk).

---

## 8. Migration plan (phased)

**Phase 0 — De-risk (do first).** Scaffold Astro 7, add the VE Vite plugin, import one `.css.ts`, run a real `astro build`. Proves VE builds on Vite 8 / Rolldown before investing. Fallback: pin Astro 6 (Vite 7).

**Phase 1 — Scaffold & config.** `astro.config.mjs` (`site`, `trailingSlash:'always'`, `integrations:[sitemap()]`, `vite.plugins:[vanillaExtractPlugin()]`); `consts.ts`; content collection + schema.

**Phase 2 — Content (13 posts).** Move each to `src/content/blog/<slug>.md`, strip Bulma markup, remove the orphan `</div>` hacks, convert info-cards to blockquotes, drop FontAwesome icons (text/emoji), rewrite relative inter-post links to absolute (`/blog/<slug>/`), add `tags`.

**Phase 3 — Styling.** VE theme (tokens + system dark) + reset + prose. Barebones on purpose.

**Phase 4 — Layouts & routes.** Base/Page/Post layouts; `blog/index.astro` (all posts), `blog/[slug].astro`, `tags/*`, `about`, `projects` (stub), `index`, `404`.

**Phase 5 — Feeds/SEO.** RSS endpoint, sitemap integration, OG/meta component.

**Phase 6 — Deploy.** Push to GitHub, connect Cloudflare Pages (build `astro build`, output `dist/`), attach the custom domain (DNS already in Cloudflare), verify the URL list, cut over.

---

## 9. Risks & mitigations

1. **Astro 7 = Vite 8 + Rolldown.** VE advertises Vite 8 support, but Rolldown caused plugin friction this cycle. **Mitigation: the Phase-0 smoke test.** Fallback: pin Astro 6 / Vite 7.
2. **Strict Rust compiler.** Unbalanced HTML in posts now *errors* — handled by the Phase-2 cleanup (removing the `</div>` hacks and Bulma markup).
3. That's essentially it now — dropping MDX/heroes/fonts/icons/EC removed most of the moving parts.

---

## 10. Decisions

| Decision | Choice |
|---|---|
| SSG / styling / hosting | Astro 7 · roll-your-own Vanilla Extract (minimal) · Cloudflare Pages (free) |
| Design fidelity | **Barebones**, redesign later — not a 1:1 migration |
| Posts | **Plain Markdown**, no MDX; Bulma/HTML stripped |
| Post headers | **No heroes** — title + date (+ optional byline) |
| Code blocks | **Built-in Shiki** (no Expressive Code) |
| Fonts | **System stack** (no self-hosted Fira Code) |
| Icons | **None** (text/emoji) |
| Dark mode | **System-only** (`prefers-color-scheme`), no toggle |
| Pagination | **None** — `/blog/` lists all posts |
| Old URLs | Keep slugs by naming files; **no** diff/redirect ceremony |
| Favicons | `favicon.ico` + `apple-touch-icon.png` only |
| `data/dictionary.json` | **Drop** |
| `projects` page | **Stub now**, rebuild later |
| Kept features | tag pages · RSS · sitemap · basic SEO/OG · syntax highlighting |

---

## 11. Future considerations (deferred, not lost)

These were intentionally cut to stay barebones — revisit during/after the redesign. Legacy assets remain in git history (and files under `public/`/`legacy/`) so nothing is lost.

- **Icons** — reintroduce via `astro-icon` (inline SVG, themeable) or hand-inlined SVGs when the UI needs iconography.
- **Hero photos** — bring back the photo-forward headers in the redesign (image files retained under `public/images/`; mind the `LICENSE_PHOTOS` attribution if the photos are re-displayed).
- **Info-card components** — if posts want rich callouts again, add `@astrojs/mdx` and a small `<Callout>` component (the Rudaux cross-links are the motivating case).
- **Fira Code with ligatures** — self-host the existing woff2 via VE `globalFontFace` (or Astro's Fonts API) to restore the monospace ligatures for code.
- **Rebuild the `projects` page** — convert the dense legacy Bulma `projects` page into proper content/components (stubbed for launch).
- **(Also worth it later)** richer code blocks via **Expressive Code** (frames, copy button); **image optimization** via `astro:assets`; **comments** (Giscus); **analytics** (Cloudflare Web Analytics).

---

## 12. Open items

- Confirm the whole `public/images/` folder is worth retaining wholesale (cheap; keeps any in-body image references working). Prune unused hero-only images later.
- `projects` stub content (a sentence + link) until the rebuild.

## 13. References (verified June 2026)

- Astro 7 / Vite 8 / Rolldown: https://astro.build/blog/astro-7/ · Content collections: https://docs.astro.build/en/guides/content-collections/ · Syntax highlighting (Shiki): https://docs.astro.build/en/guides/syntax-highlighting/
- Vanilla Extract + Astro: https://vanilla-extract.style/documentation/integrations/astro/
- Cloudflare Pages: https://developers.cloudflare.com/pages/ · limits https://developers.cloudflare.com/pages/platform/limits/

## Appendix — version pins (verify at install)

`astro@^7.0.3` · `@astrojs/rss@^4.0.18` · `@astrojs/sitemap@^3.7.3` · `@vanilla-extract/css@^1.21.0` · `@vanilla-extract/vite-plugin@^5.2.3` (dev; peer `vite ^5||^6||^7||^8`). Node **22.12+**. Shiki ships with Astro (no separate dep).
