# Modernizing samhinshaw.com: Reptar → Astro

- **Status:** Draft plan (pre-implementation)
- **Date:** 2026-07-08
- **Author:** Sam Hinshaw (with Claude)
- **Scope:** Rebuild the blog on a modern SSG (Astro) styled with Vanilla Extract, drop Bulma, deploy to simple/free hosting. **No visual redesign now** — ship a barebones look; Sam will redesign later.

---

## 1. Goals & non-goals

**Goals**
- Replace the dormant **Reptar** SSG with **Astro**.
- Style with **Vanilla Extract (VE)**; **remove Bulma** and LESS/node-sass.
- **Barebones design for now** — a clean, minimal foundation that's easy to redesign on top of later.
- **Convert posts to clean Markdown/MDX** (strip the embedded Bulma HTML).
- **Simple, free hosting** with git-push deploys, custom domain, HTTPS, PR previews.
- Features: **tag pages** + **system-preference dark mode** (no toggle). Plus baseline **RSS, sitemap, SEO/OpenGraph meta, and syntax highlighting**.
- **Preserve existing post URLs** (inbound links / SEO).

**Non-goals (for now)**
- Faithfulness to the current visual design (explicitly not wanted).
- Comments and analytics (can be added later; both are static-friendly to bolt on).
- Migrating to a CMS — content stays as files in the repo.

---

## 2. Current state (migrating from)

- **SSG:** Reptar (`reptar.config.js`), now unmaintained. Builds to a local `../../serve/samhinshaw.com/html` path (self-hosted today).
- **Templating:** Nunjucks in `_templates/` (`base` → `common` → `post`/`page`/`landing_page`, plus `_loop`/`_pagination`/`tag`).
- **Styling:** Bulma 0.5.1 (via `css/bulma.sass`), LESS partials (`main.less`, `_variables.less`, `_elements.less`, `_layout.less` [unused]), a hand-picked `_highlight_atom-one-dark.css`, and `normalize.css`.
- **Content:** 13 Markdown posts (2016–2018) in `_posts/`; root pages in `_root/` (`about`, `projects`, `blog`); landing `index.md`; `_error/404.md`. **Bulma markup is embedded inside post Markdown** (cards, columns, FontAwesome icons) — one post (`designing-rudaux`) even opens by closing a `</div>` left open by the old template.
- **JS:** one `js/main.js` (browserify) — navbar burger, copyright modal, collapsible message — coupled to Bulma `is-active` classes and FontAwesome SVG swapping.
- **Assets:** Fira Code woff2 (ligatures), FontAwesome icon font, ~41 hero photos referenced via inline `background-image`, favicons/manifest.
- **URLs:** posts `/blog/:title/`, root pages `/:title/`, blog index `/blog/` with `/blog/:page/` pagination. Domain `www.samhinshaw.com`.

---

## 3. Target stack

| Layer | Today | Proposed (current as of June 2026 — pin & verify at build time) |
|---|---|---|
| SSG | Reptar | **Astro 7.0.x** (Content Layer API). Requires **Node 22.12+** |
| Content | Nunjucks + inline Bulma HTML | Markdown/**MDX** in a typed content collection (`@astrojs/mdx` 7.0.0) |
| Styling | Bulma 0.5.1 + LESS | **Vanilla Extract** (`@vanilla-extract/css` 1.21.0 + `@vanilla-extract/vite-plugin` 5.2.3) |
| Bulma replacement | — | **Roll your own in VE** (§4); Open Props optional for tokens |
| Code blocks | highlight.css theme | **Expressive Code** (`astro-expressive-code` 0.44.0) — Shiki-based, keeps Fira Code ligatures |
| Fonts | Fira Code woff2 | Fira Code via VE `globalFontFace` (reuse existing woff2) |
| Icons | FontAwesome font | **astro-icon** (inline SVG, themeable via `currentColor`) |
| Dark mode | none | **System-only** via `@media (prefers-color-scheme: dark)` — no toggle, no JS |
| Feeds/SEO | none | `@astrojs/rss` 4.0.18, `@astrojs/sitemap` 3.7.3 (requires `site`), OG/meta component |
| Images | inline `background-image` | Keep in `public/images` for now; `astro:assets`/sharp later |
| Hosting | self-hosted | **Vercel** (free) — Cloudflare Pages as the fallback (§5) |

> **Astro 7 note:** ships **Vite 8 + Rolldown** (new Rust bundler), a **new Rust `.astro` compiler** that is strict about invalid/unbalanced HTML (no auto-correction), and a **new default Markdown parser ("Sätteri")** replacing remark/rehype. To reuse specific remark/rehype plugins, reinstall `@astrojs/markdown-remark`.

---

## 4. Replacing Bulma — decision

**Key insight:** Vanilla Extract is not just a styling syntax — it's a full styling *system*: **theme contracts** (tokens), **Sprinkles** (atomic utilities), **Recipes** (component variants). So most "frameworks" *overlap* with VE rather than complement it.

| Option | Category | Fit with VE | Verdict |
|---|---|---|---|
| **Roll your own in VE** | native tokens + utilities + components | Native — one source of truth | ✅ **Chosen** |
| **Open Props** | design tokens (CSS vars) | Complementary — seed a VE theme contract | ✅ Optional add-on |
| Pico CSS | classless prose/base | Partial — but **maintainer inactive** (no release since Mar 2025) | ⚠️ Crib from, don't depend on |
| Tailwind v4 | utility *system* | Redundant with Sprinkles; 2nd token source | ❌ Use *instead of* VE, not alongside |
| UnoCSS | atomic engine | Redundant with Sprinkles | ❌ |
| Panda CSS | build-time CSS-in-JS | Most redundant — a direct VE competitor | ❌ |

**Decision:** roll our own in VE, kept deliberately minimal for the barebones phase:
- a small **theme contract** (~15 tokens: color, space, type scale);
- a ~30-line **global reset**;
- a small **`globalStyle` "prose" sheet** for the Markdown body (headings, lists, tables, blockquotes, inline code) — VE's one real gap on a content site;
- **defer Sprinkles/Recipes** until the redesign (trivial to add then; note Recipes is stable but pre-1.0).

**Open Props:** recommended as the *token seed* so we don't hand-invent a scale — but purely optional. Pin the stable **1.7.x** line (ignore the long-stalled v2 betas). See §10 to confirm.

> If VE were ever reconsidered, the only non-redundant replacements would be Tailwind v4 (simplest, instant `prose` plugin) or Panda CSS (closest like-for-like). Out of scope given the VE commitment.

---

## 5. Hosting — decision

Static Astro needs **no adapter** on any host (`astro build` emits static files; adapters are only for SSR/edge later).

**Decision: Vercel (Hobby / free).** Matches Sam's instinct, the most polished zero-config Astro deploy, best-in-class PR previews, free custom domain + HTTPS, cleanest future SSR on-ramp.

- **Caveat:** Vercel Hobby is **non-commercial/personal use only** (even donations count as commercial) and bandwidth is capped at 100 GB/mo (irrelevant at this traffic). The day the blog is monetized → Pro ($20/mo) or move hosts.
- **Fallback — Cloudflare Pages** if that clause or cap ever matters: unlimited bandwidth, no commercial restriction, equally zero-config; DX a notch less slick.
- Rejected: **Netlify** (2026 free tier tightened to a ~15 GB-equivalent credit model), **GitHub Pages** (no PR previews, static-forever).

---

## 6. Target architecture

```
src/
  content.config.ts          # blog collection: glob() loader + Zod schema (import z from 'astro/zod')
  content/blog/*.md(x)        # the 13 posts, cleaned
  layouts/                    # Base, Post, Page  (ports of base/common/post/page Nunjucks templates → <slot/>)
  pages/
    index.astro              # landing (/)
    about.astro
    projects.astro
    blog/[...slug].astro     # posts + paginated index emitted from ONE getStaticPaths (avoids collision)
    tags/[tag].astro         # tag pages
    rss.xml.js               # @astrojs/rss
    404.astro
  components/                 # Nav, Footer, SEO (OG/meta), Icon (astro-icon), Callout (MDX-friendly)
  styles/                     # theme.css.ts (tokens + system dark), reset.css.ts, prose.css.ts
public/images/*               # hero photos stay here for now (zero-effort, URL-stable)
astro.config.mjs              # site, trailingSlash:'always', integrations + VE vite plugin
```

**Content collection** — `src/content.config.ts`, `glob()` loader from `astro/loaders`, Zod schema (import `z` from `astro/zod`, **not** `astro:content`), `render()` from `astro:content`. Schema maps existing frontmatter 1:1: `title, date, excerpt, heroImage, heroColor, imageAuthor, imageLink, byline, subtitle, lastUpdated, draft, tags`.

**astro.config.mjs** essentials:
```js
export default defineConfig({
  site: 'https://www.samhinshaw.com',
  trailingSlash: 'always',              // preserves Reptar's /blog/slug/ trailing slash
  integrations: [
    expressiveCode({ /* ... */ }),      // MUST come before mdx()
    mdx(),
    sitemap(),
  ],
  vite: { plugins: [vanillaExtractPlugin()] },  // VE has no first-party Astro integration
});
```

**Styling / dark mode** — system-only dark mode is a real simplification: define light tokens on `:root`, override them inside `@media (prefers-color-scheme: dark)` in VE. **No toggle, no `localStorage`, no blocking head-script, no FOUC.**

**Code blocks** — Expressive Code registered *before* `mdx()`; set Fira Code via `styleOverrides.codeFontFamily`. Frames/titles/text-markers/copy-button are on by default; **line numbers are optional** (`@expressive-code/plugin-line-numbers`). Replaces the old `_highlight_*.css` themes. Coexists with VE (both only emit CSS).

**Fonts / icons** — declare the existing Fira Code woff2 via VE `globalFontFace` (lowest risk, keeps ligatures). Replace FontAwesome `<i class="fas …">` with `astro-icon` `<Icon>` / inline SVG.

**Interactivity** — old navbar burger / copyright modal / collapsible collapse to a tiny `<script>` or CSS `details` — no framework island needed.

---

## 7. URL preservation (critical)

Reptar builds each post URL from the **slugified frontmatter `title`**, *not* the filename. **11 of 13 filenames diverge from their title-slug**, so any "strip the date off the filename" migration would 404 those inbound links. Preserve exactly:

| Source file | URL to preserve |
|---|---|
| `2016-09-23-UpdateRstudio.md` | `/blog/automatically-update-rstudio/` |
| `2017-02-09-autokey.md` | `/blog/installing-autokey/` |
| `2017-02-09-encryption.md` | `/blog/encryption-commands-for-letsencrypt/` |
| `2017-02-09-FirefoxNightly.md` | `/blog/how-to-install-firefox-nightly/` |
| `2017-02-09-NodeJS.md` | `/blog/installing-node-js-on-linux/` ⚠️ |
| `2017-02-09-SSH_keys.md` | `/blog/how-to-setup-your-ssh-keys/` |
| `2017-02-10-zsh.md` | `/blog/installing-zsh/` |
| `2017-09-04_reptar.md` | `/blog/building-a-blog-with-reptar-and-bulma/` |
| `2017-09-13_ligatures.md` | `/blog/ligature-support-in-monospace-fonts/` |
| `2017-09-28_template-literals.md` | `/blog/wrapping-template-literals-in-vs-code/` |
| `2017-10-20_dynamic_package_loads.md` | `/blog/lazy-loading-r-packages-in-shiny/` |
| `2018-08-24-designing-rudaux.md` | `/blog/designing-rudaux/` |
| `2018-08-24-using-rudaux.md` | `/blog/using-rudaux/` |

**Approach**
1. Generate each slug from the slugified frontmatter **title**, and **pin a `slug:` in each post's frontmatter** as the safety net (Astro's Content Layer honors a frontmatter `slug`, and it may contain slashes).
2. **Diff every generated URL against the live site / its sitemap before cutover.** Slugify edge cases must be confirmed against ground truth — e.g. ⚠️ *Node.js* (does the live site emit `node-js` or `nodejs`?) and *LetsEncrypt*.
3. Any URL that can't be reproduced exactly gets a redirect.

**Route collision:** `/blog/` + `/blog/2/` pagination collides with `/blog/[...slug]` post routes. Fix by emitting both list and post pages from **one catch-all `getStaticPaths()`** (branch on a `type: 'list' | 'post'` prop), or move pagination to `/blog/page/N/` if changing those URLs is acceptable.

---

## 8. Migration plan (phased)

**Phase 0 — De-risk (do first).** Scaffold Astro 7, add the VE Vite plugin, import one `.css.ts`, run a real `astro build`. Confirms VE builds on **Vite 8 / Rolldown** before investing. Fallback: pin Astro 6 (Vite 7), which is battle-tested with VE.

**Phase 1 — Scaffold & config.** `astro.config.mjs` (`site`, `trailingSlash:'always'`, integrations `[expressiveCode(), mdx(), sitemap()]`, `vite.plugins:[vanillaExtractPlugin()]`); define the `blog` collection + schema.

**Phase 2 — Content migration (bulk of the work, ~13 posts).**
- Move `_posts/*` → `src/content/blog/`.
- Convert inline Bulma HTML → clean MD/MDX: strip `columns`/`hero`/`card`; **rebalance the orphaned `</div>` "close content tag" hacks** (the strict Rust compiler will not auto-fix them); turn the few rich bits (e.g. the Rudaux info-card) into a small reusable `<Callout>` MDX component.
- Convert FontAwesome `<i class="fas …">` → `astro-icon`.
- Map frontmatter into the schema; add pinned `slug:` values.

**Phase 3 — Layouts, routing & URL preservation.** Port `base/common/post/page` → Astro layouts with `<slot/>` and `<Content/>`; implement §7 (slug-from-title + pins + slug diff; single catch-all for posts+pagination); root pages (`about`, `projects`), landing, `404`, tag pages.

**Phase 4 — Styling (intentionally barebones).** VE theme contract + reset + prose `globalStyle`; system dark mode; Fira Code via `globalFontFace`; minimal Nav/Footer.

**Phase 5 — Features.** RSS endpoint, sitemap, SEO/OG meta component, tag pages.

**Phase 6 — Deploy.** Push to GitHub, connect Vercel, custom domain + HTTPS, **crawl old vs new URLs to confirm parity**, then cut over DNS.

---

## 9. Risks & mitigations

1. **Astro 7 = Vite 8 + Rolldown (new Rust bundler).** VE's plugin advertises Vite 8 support, but Rolldown caused real plugin friction this cycle (e.g. a reported `@tailwindcss/vite` build failure on Astro 6's rolldown-vite — issue #16542, reported but not maintainer-repro'd). **Mitigation: the Phase-0 smoke test.** If it fails, pin **Astro 6 / Vite 7**.
2. **Strict Rust compiler + new "Sätteri" Markdown parser.** Unbalanced HTML in posts now *errors* — handled by Phase-2 cleanup. Reinstall `@astrojs/markdown-remark` if a specific remark/rehype plugin is needed.
3. **URL parity.** The §7 table + a live-site slug diff + redirects for stragglers.
4. **VE Recipes is pre-1.0** (stable but slow-moving) — not used until the redesign, so no near-term impact.

---

## 10. Decisions (resolved — confirm or adjust)

| # | Decision | Choice | Notes |
|---|---|---|---|
| 1 | Bulma replacement | **Roll your own in VE** | Minimal now; Sprinkles/Recipes deferred to redesign |
| 1b | Token seed | **Open Props (optional, recommended)** | Pin 1.7.x; or hand-author ~15 tokens with zero deps |
| 2 | Hosting | **Vercel (free)** | Cloudflare Pages fallback if the non-commercial clause/cap bites |
| 3 | Hero images | **Keep in `public/images` for now** | Optimize via `astro:assets` during the later redesign |
| 4 | `projects` page | **Convert to clean MDX** (like posts) | Alternative: rebuild during the redesign |
| — | Dark mode | **System-only** (`prefers-color-scheme`) | No picker/toggle (per Sam) |
| — | Design fidelity | **Barebones now**, redesign later | No port of the Bulma-era look |
| — | Post content | **Clean MD/MDX** | Rich bits become small MDX components |

---

## 11. Open items to confirm against ground truth

- **Live-site slug diff** — crawl `www.samhinshaw.com` (or fetch its current sitemap) and confirm all 13 post URLs, especially the ⚠️ slugify edge cases (`Node.js`, `LetsEncrypt`).
- **`data/dictionary.json`** (3.2 MB) — determine whether anything still references it before dropping it.
- **Old redirect/analytics needs** — confirm there are no other live paths (e.g. `/pages/`, tag URLs) that need preserving.

---

## 12. References (verified June 2026)

- Astro 7 / Vite 8 / Rolldown / Sätteri: https://astro.build/blog/astro-7/ · Content collections: https://docs.astro.build/en/guides/content-collections/ · On-demand rendering (adapters): https://docs.astro.build/en/guides/on-demand-rendering/ · Syntax highlighting: https://docs.astro.build/en/guides/syntax-highlighting/ · Images: https://docs.astro.build/en/guides/images/
- Vanilla Extract + Astro: https://vanilla-extract.style/documentation/integrations/astro/ · Theming: https://vanilla-extract.style/documentation/theming/
- Expressive Code: https://expressive-code.com/
- Open Props: https://open-props.style/ · Pico maintenance thread: https://github.com/picocss/pico/issues/640
- Hosting: Vercel Hobby https://vercel.com/docs/plans/hobby · fair-use https://vercel.com/docs/limits/fair-use-guidelines · Netlify credit pricing https://www.netlify.com/changelog/2026-04-14-pricing-updates-april-2026/ · Cloudflare Pages limits https://developers.cloudflare.com/pages/platform/limits/ · GitHub Pages limits https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

## Appendix — version pins (verify at install)

`astro@7.0.3` · `@astrojs/mdx@7.0.0` · `@astrojs/rss@4.0.18` · `@astrojs/sitemap@3.7.3` · `@vanilla-extract/css@1.21.0` · `@vanilla-extract/vite-plugin@5.2.3` (peer `vite ^5||^6||^7||^8`) · `@vanilla-extract/sprinkles@1.7.0` · `@vanilla-extract/recipes@0.5.7` · `astro-expressive-code@0.44.0` · `sharp@0.35.2` · `open-props@1.7.23` · plus `astro-icon`. Requires **Node 22.12+**.
