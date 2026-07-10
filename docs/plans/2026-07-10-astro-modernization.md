# Astro Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild samhinshaw.com from the dormant Reptar/Bulma stack into a barebones Astro 7 site styled with Vanilla Extract, deployed on Cloudflare Pages, preserving the existing post URLs.

**Architecture:** Static Astro site (no adapter). Posts are plain Markdown in a typed content collection, routed by filename-slug. Styling is a minimal Vanilla Extract system (tokens + reset + prose) with system-preference dark mode. Code highlighting is Astro's built-in Shiki. No MDX, hero images, custom fonts, or icons (all deferred — see spec §11).

**Tech Stack:** Astro 7 (Node 22.12+), `@vanilla-extract/css` + `@vanilla-extract/vite-plugin`, `@astrojs/rss`, `@astrojs/sitemap`, `@astrojs/check`. Cloudflare Pages hosting.

**Companion spec:** `docs/specs/2026-07-08-astro-modernization.md` (read §7 for the URL map, §11 for deferred features).

**Commit convention:** every commit message ends with a trailing `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` line (repo convention). Shown once below; apply to all commits.

---

## File structure (target end state)

```
astro.config.mjs · package.json · tsconfig.json · .nvmrc
src/
  consts.ts                     # site metadata
  content.config.ts             # blog collection + Zod schema
  content/blog/*.md             # 13 posts (named by URL slug)
  layouts/  BaseLayout PageLayout PostLayout        (.astro)
  components/  BaseHead Nav Footer                  (.astro)
  pages/  index about projects 404 (.astro) · blog/index blog/[slug] · tags/index tags/[tag] · rss.xml.js
  styles/  theme.css.ts reset.css.ts prose.css.ts
public/  images/* · favicon.ico · apple-touch-icon.png
scripts/check-urls.mjs
legacy/                         # archived Reptar site (deleted in the final task)
```

Each file has one job. `theme.css.ts` owns tokens + dark mode; `reset.css.ts` owns element defaults + nav/footer layout; `prose.css.ts` owns Markdown-body styling. Layouts compose; pages fetch + render.

> **Note on verification:** this is a static site, so the primary gates are `astro build` (the strict Rust compiler fails on bad HTML), `astro check` (schema + types), and `scripts/check-urls.mjs` (asserts every expected URL exists in `dist/`). The URL script is written *before* the routes (Task 8) so it starts red and goes green as pages land.

---

### Task 1: Archive the legacy site, stage assets

**Files:**
- Move (git mv): Reptar sources → `legacy/`; `images/` → `public/images/`; `favicon.ico`, `apple-touch-icon.png` → `public/`
- Modify: `.gitignore`

- [ ] **Step 1: Create target dirs and archive Reptar sources**

```bash
mkdir -p legacy public scripts
git mv reptar.config.js _templates css js _plugins _posts _root _error index.md data .eslintrc.js .snyk legacy/
git mv fonts legacy/fonts
```

- [ ] **Step 2: Move the assets we keep into `public/`, archive the rest of the old favicon/PWA set**

```bash
git mv images public/images
git mv favicon.ico public/favicon.ico
git mv apple-touch-icon.png public/apple-touch-icon.png
git mv favicon-16x16.png favicon-32x32.png android-chrome-192x192.png android-chrome-512x512.png mstile-150x150.png browserconfig.xml manifest.json safari-pinned-tab.svg legacy/
```

- [ ] **Step 3: Replace `.gitignore`**

```
node_modules/
dist/
.astro/
.DS_Store
*.log
```

- [ ] **Step 4: Remove the stale Reptar lockfile and any tracked `.DS_Store`**

```bash
git rm --cached --ignore-unmatch .DS_Store
rm -f package-lock.json
```

- [ ] **Step 5: Verify the tree is staged sanely**

Run: `git status --short && ls public`
Expected: old files shown as renamed into `legacy/`; `public/` contains `images`, `favicon.ico`, `apple-touch-icon.png`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Archive Reptar site to legacy/, stage public assets

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Scaffold Astro 7 and verify a baseline build

**Files:**
- Create: `package.json`, `tsconfig.json`, `.nvmrc`, `astro.config.mjs`, `src/pages/index.astro`

- [ ] **Step 1: Confirm Node ≥ 22.12**

Run: `node -v`
Expected: `v22.12.0` or higher. If lower: `nvm install 22 && nvm use 22`.

- [ ] **Step 2: Create `.nvmrc`**

```
22
```

- [ ] **Step 3: Create `package.json`**

```json
{
  "name": "samhinshaw-blog",
  "type": "module",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "check:urls": "node scripts/check-urls.mjs",
    "verify": "astro check && astro build && node scripts/check-urls.mjs"
  }
}
```

- [ ] **Step 4: Install Astro**

Run: `npm install astro@^7.0.3`
Expected: installs cleanly; `astro` appears in `dependencies`.

- [ ] **Step 5: Create `tsconfig.json`**

```json
{ "extends": "astro/tsconfigs/strict" }
```

- [ ] **Step 6: Create minimal `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.samhinshaw.com',
  trailingSlash: 'always',
});
```

- [ ] **Step 7: Create placeholder `src/pages/index.astro`**

```astro
<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>Sam Hinshaw</title></head>
  <body><h1>Hello, Astro</h1></body>
</html>
```

- [ ] **Step 8: Build**

Run: `npm run build`
Expected: build succeeds; `dist/index.html` exists.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Scaffold Astro 7 with a baseline build"
```

---

### Task 3: De-risk Vanilla Extract on Vite 8 / Rolldown (the critical gate)

**Files:**
- Modify: `astro.config.mjs`
- Create: `src/styles/_smoke.css.ts`, temp import in `src/pages/index.astro`

- [ ] **Step 1: Install the VE packages**

Run: `npm install @vanilla-extract/css@^1.21.0 && npm install -D @vanilla-extract/vite-plugin@^5.2.3`

- [ ] **Step 2: Register the plugin in `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
  site: 'https://www.samhinshaw.com',
  trailingSlash: 'always',
  vite: { plugins: [vanillaExtractPlugin()] },
});
```

- [ ] **Step 3: Create a smoke-test stylesheet `src/styles/_smoke.css.ts`**

```ts
import { style } from '@vanilla-extract/css';

export const smoke = style({ color: 'rebeccapurple' });
```

- [ ] **Step 4: Use it in `src/pages/index.astro`**

```astro
---
import { smoke } from '../styles/_smoke.css';
---
<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>Sam Hinshaw</title></head>
  <body><h1 class={smoke}>Hello, Astro + Vanilla Extract</h1></body>
</html>
```

- [ ] **Step 5: Build and confirm CSS was extracted**

Run: `npm run build && grep -rl "rebeccapurple" dist/`
Expected: build succeeds AND grep prints at least one `dist/**.css` file containing the color. **If the build fails on Rolldown**, stop and fall back: `npm install astro@^6` (Vite 7), re-run; note the pin in `astro.config.mjs`. Do not proceed until a `.css.ts` import builds.

- [ ] **Step 6: Remove the smoke test**

```bash
rm src/styles/_smoke.css.ts
```
Then revert `src/pages/index.astro` to the plain placeholder from Task 2 (remove the import and `class={smoke}`).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add Vanilla Extract via vite-plugin (verified on Astro 7)"
```

---

### Task 4: Add integrations and finalize config

**Files:**
- Modify: `astro.config.mjs`
- Install: `@astrojs/sitemap`, `@astrojs/rss`, dev `@astrojs/check`, `typescript`

- [ ] **Step 1: Install**

Run: `npm install @astrojs/sitemap@^3.7.3 @astrojs/rss@^4.0.18 && npm install -D @astrojs/check@^0.9.0 typescript@^5.6.0`

- [ ] **Step 2: Finalize `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
  site: 'https://www.samhinshaw.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
  vite: { plugins: [vanillaExtractPlugin()] },
});
```

(Shiki is the built-in default highlighter — no config needed.)

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: succeeds; `dist/sitemap-index.xml` is generated.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add sitemap + rss deps and finalize astro.config"
```

---

### Task 5: Site constants and content collection

**Files:**
- Create: `src/consts.ts`, `src/content.config.ts`

- [ ] **Step 1: Create `src/consts.ts`**

```ts
export const SITE_TITLE = 'Sam Hinshaw';
export const SITE_DESCRIPTION =
  'Sam Hinshaw: Bioinformatics & Web Development. I build tools to help scientists do bioinformatics.';
export const SITE_URL = 'https://www.samhinshaw.com';
export const SOCIAL = {
  github: 'https://github.com/samhinshaw',
  twitter: 'https://twitter.com/samhinshaw',
};
```

- [ ] **Step 2: Create `src/content.config.ts`**

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string().optional(),
    byline: z.string().optional(),
    subtitle: z.string().optional(),
    lastUpdated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
```

- [ ] **Step 3: Create the content dir so the glob has a base**

```bash
mkdir -p src/content/blog
```

- [ ] **Step 4: Type-check**

Run: `npm run check`
Expected: 0 errors (an empty collection is valid).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add site consts and blog content collection schema"
```

---

### Task 6: Vanilla Extract styling system

**Files:**
- Create: `src/styles/theme.css.ts`, `src/styles/reset.css.ts`, `src/styles/prose.css.ts`

- [ ] **Step 1: Create `src/styles/theme.css.ts` (tokens + system dark mode)**

```ts
import { createThemeContract, createGlobalTheme, globalStyle } from '@vanilla-extract/css';

export const vars = createThemeContract({
  color: { bg: null, surface: null, text: null, muted: null, link: null, border: null, code: null },
  font: { body: null, mono: null },
  space: { xs: null, sm: null, md: null, lg: null, xl: null },
  size: { content: null },
  radius: { md: null },
});

createGlobalTheme(':root', vars, {
  color: {
    bg: '#ffffff', surface: '#f6f6f7', text: '#1a1a1a', muted: '#5a5a5a',
    link: '#443acc', border: '#e3e3e3', code: '#f2f2f2',
  },
  font: {
    body: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
  space: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '40px' },
  size: { content: '700px' },
  radius: { md: '8px' },
});

globalStyle(':root', {
  '@media': {
    '(prefers-color-scheme: dark)': {
      vars: {
        [vars.color.bg]: '#111214',
        [vars.color.surface]: '#1a1c1f',
        [vars.color.text]: '#e6e6e6',
        [vars.color.muted]: '#a0a0a0',
        [vars.color.link]: '#8aa9ff',
        [vars.color.border]: '#2a2d31',
        [vars.color.code]: '#1e2024',
      },
    },
  },
});
```

- [ ] **Step 2: Create `src/styles/reset.css.ts` (element defaults + nav/footer layout)**

```ts
import { globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.css';

globalStyle('*, *::before, *::after', { boxSizing: 'border-box' });
globalStyle('body', {
  margin: 0,
  background: vars.color.bg,
  color: vars.color.text,
  fontFamily: vars.font.body,
  lineHeight: 1.6,
  fontSize: '18px',
  WebkitFontSmoothing: 'antialiased',
});
globalStyle('main', { maxWidth: vars.size.content, margin: '0 auto', padding: `${vars.space.lg} ${vars.space.md}` });
globalStyle('a', { color: vars.color.link });
globalStyle('img', { maxWidth: '100%', height: 'auto' });
globalStyle('header.site nav', {
  display: 'flex', gap: vars.space.md, alignItems: 'baseline', justifyContent: 'space-between',
  flexWrap: 'wrap', maxWidth: vars.size.content, margin: '0 auto', padding: vars.space.md,
});
globalStyle('header.site nav ul', { display: 'flex', gap: vars.space.md, listStyle: 'none', margin: 0, padding: 0 });
globalStyle('footer.site', {
  maxWidth: vars.size.content, margin: `${vars.space.xl} auto 0`, padding: vars.space.md,
  color: vars.color.muted, borderTop: `1px solid ${vars.color.border}`,
  display: 'flex', gap: vars.space.md, justifyContent: 'space-between', flexWrap: 'wrap',
});
```

- [ ] **Step 3: Create `src/styles/prose.css.ts` (Markdown body + post meta)**

```ts
import { style, globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.css';

export const prose = style({});
export const postMeta = style({ color: vars.color.muted, fontSize: '0.9em' });

globalStyle(`${prose} :is(h1,h2,h3,h4)`, { lineHeight: 1.25, marginTop: vars.space.xl, marginBottom: vars.space.sm });
globalStyle(`${prose} :is(p,ul,ol,blockquote,pre,table)`, { marginTop: 0, marginBottom: vars.space.md });
globalStyle(`${prose} blockquote`, {
  margin: `${vars.space.md} 0`, paddingLeft: vars.space.md,
  borderLeft: `4px solid ${vars.color.border}`, color: vars.color.muted,
});
globalStyle(`${prose} :not(pre) > code`, {
  background: vars.color.code, padding: '0.15em 0.35em', borderRadius: vars.radius.md,
  fontFamily: vars.font.mono, fontSize: '0.9em',
});
globalStyle(`${prose} pre`, { padding: vars.space.md, borderRadius: vars.radius.md, overflowX: 'auto' });
globalStyle(`${prose} table`, { width: '100%', borderCollapse: 'collapse' });
globalStyle(`${prose} :is(th,td)`, { border: `1px solid ${vars.color.border}`, padding: vars.space.sm, textAlign: 'left' });
globalStyle(`${prose} hr`, { border: 'none', borderTop: `1px solid ${vars.color.border}`, margin: `${vars.space.xl} 0` });
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add minimal Vanilla Extract theme, reset, and prose styles"
```

---

### Task 7: Components and layouts

**Files:**
- Create: `src/components/BaseHead.astro`, `Nav.astro`, `Footer.astro`; `src/layouts/BaseLayout.astro`, `PageLayout.astro`, `PostLayout.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: `src/components/BaseHead.astro`**

```astro
---
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
interface Props { title?: string; description?: string; }
const { title, description = SITE_DESCRIPTION } = Astro.props;
const pageTitle = title ? `${title} · ${SITE_TITLE}` : SITE_TITLE;
const canonical = new URL(Astro.url.pathname, Astro.site);
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="generator" content={Astro.generator} />
<title>{pageTitle}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="alternate" type="application/rss+xml" title={SITE_TITLE} href="/rss.xml" />
<meta property="og:type" content="website" />
<meta property="og:title" content={pageTitle} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta name="twitter:card" content="summary" />
```

- [ ] **Step 2: `src/components/Nav.astro`**

```astro
---
import { SITE_TITLE } from '../consts';
---
<header class="site">
  <nav>
    <a href="/" rel="home"><strong>{SITE_TITLE}</strong></a>
    <ul>
      <li><a href="/blog/">Blog</a></li>
      <li><a href="/projects/">Projects</a></li>
      <li><a href="/about/">About</a></li>
    </ul>
  </nav>
</header>
```

- [ ] **Step 3: `src/components/Footer.astro`**

```astro
---
import { SOCIAL } from '../consts';
const year = new Date().getFullYear();
---
<footer class="site">
  <span>© {year} Sam Hinshaw</span>
  <span><a href={SOCIAL.github}>GitHub</a> · <a href={SOCIAL.twitter}>Twitter</a></span>
</footer>
```

- [ ] **Step 4: `src/layouts/BaseLayout.astro`**

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import '../styles/theme.css';
import '../styles/reset.css';
interface Props { title?: string; description?: string; }
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head><BaseHead title={title} description={description} /></head>
  <body>
    <Nav />
    <main><slot /></main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 5: `src/layouts/PageLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';
import { prose } from '../styles/prose.css';
interface Props { title?: string; description?: string; }
const { title, description } = Astro.props;
---
<BaseLayout title={title} description={description}>
  <article class={prose}><slot /></article>
</BaseLayout>
```

- [ ] **Step 6: `src/layouts/PostLayout.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import BaseLayout from './BaseLayout.astro';
import { prose, postMeta } from '../styles/prose.css';
interface Props { post: CollectionEntry<'blog'>; }
const { post } = Astro.props;
const { title, date, byline, subtitle, lastUpdated, excerpt } = post.data;
const fmt = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
---
<BaseLayout title={title} description={excerpt}>
  <article class={prose}>
    <h1>{title}</h1>
    <p class={postMeta}>
      <time datetime={date.toISOString()}>{fmt(date)}</time>{byline && <> · {byline}</>}
    </p>
    {subtitle && <p><em>{subtitle}</em></p>}
    <slot />
    {lastUpdated && <p class={postMeta}><em>Updated {fmt(lastUpdated)}</em></p>}
  </article>
</BaseLayout>
```

- [ ] **Step 7: Rewrite `src/pages/index.astro` to use the layout**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { prose } from '../styles/prose.css';
---
<BaseLayout>
  <div class={prose}>
    <h1>Sam Hinshaw</h1>
    <p>Bioinformatics &amp; web development. I build tools to help scientists do bioinformatics.</p>
    <p><a href="/blog/">Read the blog →</a></p>
  </div>
</BaseLayout>
```

- [ ] **Step 8: Build**

Run: `npm run build`
Expected: succeeds; `dist/index.html` contains the nav, "Read the blog", and a linked stylesheet.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Add head/nav/footer components and base/page/post layouts"
```

---

### Task 8: URL-parity check script (write it red first)

**Files:**
- Create: `scripts/check-urls.mjs`

- [ ] **Step 1: Create `scripts/check-urls.mjs`**

```js
import { access } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist';
const expected = [
  '/', '/about/', '/projects/', '/blog/', '/tags/',
  '/blog/automatically-update-rstudio/',
  '/blog/installing-autokey/',
  '/blog/encryption-commands-for-letsencrypt/',
  '/blog/how-to-install-firefox-nightly/',
  '/blog/installing-node-js-on-linux/',
  '/blog/how-to-setup-your-ssh-keys/',
  '/blog/installing-zsh/',
  '/blog/building-a-blog-with-reptar-and-bulma/',
  '/blog/ligature-support-in-monospace-fonts/',
  '/blog/wrapping-template-literals-in-vs-code/',
  '/blog/lazy-loading-r-packages-in-shiny/',
  '/blog/designing-rudaux/',
  '/blog/using-rudaux/',
];

let ok = true;
for (const url of expected) {
  try { await access(join(DIST, url, 'index.html')); console.log(`OK   ${url}`); }
  catch { console.log(`MISS ${url}`); ok = false; }
}
if (!ok) { console.error('\nURL check FAILED'); process.exit(1); }
console.log('\nAll expected URLs present.');
```

- [ ] **Step 2: Run it (expected to fail now — content and routes don't exist yet)**

Run: `npm run build && npm run check:urls`
Expected: many `MISS` lines, exits non-zero. This is the red baseline it will turn green by Task 11.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add build-output URL parity check script"
```

---

### Task 9: Migrate the 13 posts to plain Markdown

**Files:**
- Create: `src/content/blog/<slug>.md` × 13 (source of truth: `legacy/_posts/`)

**Post map** (new filename = URL slug; carry the date from the legacy filename/frontmatter; suggested tags):

| New file `src/content/blog/…` | date | tags |
|---|---|---|
| `automatically-update-rstudio.md` | 2016-09-23 | `[r, rstudio]` |
| `installing-autokey.md` | 2017-02-09 | `[linux, tools]` |
| `encryption-commands-for-letsencrypt.md` | 2017-02-09 | `[security, tls]` |
| `how-to-install-firefox-nightly.md` | 2017-02-09 | `[firefox, linux]` |
| `installing-node-js-on-linux.md` | 2017-02-09 | `[node, linux]` |
| `how-to-setup-your-ssh-keys.md` | 2017-02-09 | `[ssh, security]` |
| `installing-zsh.md` | 2017-02-10 | `[zsh, shell]` |
| `building-a-blog-with-reptar-and-bulma.md` | 2017-09-04 | `[web, blogging]` |
| `ligature-support-in-monospace-fonts.md` | 2017-09-13 | `[fonts, editor]` |
| `wrapping-template-literals-in-vs-code.md` | 2017-09-28 | `[javascript, vscode]` |
| `lazy-loading-r-packages-in-shiny.md` | 2017-10-20 | `[r, shiny]` |
| `designing-rudaux.md` | 2018-08-24 | `[rudaux, jupyterhub, education]` |
| `using-rudaux.md` | 2018-08-24 | `[rudaux, jupyterhub, education]` |

**Per-post procedure** (repeat for each row; open the matching `legacy/_posts/<date>-*.md` as the source):

1. Create the new file with frontmatter:
```yaml
---
title: "<copy from legacy frontmatter>"
date: <date from table>
excerpt: "<copy if the legacy file had one, else omit>"
tags: [<from table>]
# byline / subtitle / lastUpdated: include ONLY if the legacy frontmatter had them
---
```
   Drop all Reptar-only keys: `layout`, `template`, `permalink`, `url`, `heroImage`, `heroColor`, `imageAuthor`, `imageLink`.
2. Paste the legacy Markdown body (everything after the legacy frontmatter).
3. Delete leftover template artifacts: any `<!-- close content tag -->` comment and any **orphan `</div>`** (opened by the old template, not by the file).
4. Replace Bulma component blocks (`<div class="card…">`, `columns`, `hero`, `<span class="icon">…`) with plain Markdown — a blockquote, list, or link. Remove FontAwesome `<i class="fas fa-…">` icons (use an emoji or plain text).
5. Rewrite relative inter-post links (`../using-rudaux`) to absolute trailing-slash URLs (`/blog/using-rudaux/`).
6. Leave fenced code blocks untouched (Shiki highlights them). In-body image paths (`/images/…`) still resolve from `public/images/`.

**Worked example — `designing-rudaux.md`.** The legacy body begins with the template-breakout hack + a Bulma card:
```html
<!-- close content tag -->
</div>
<div class="card post-info" id='post-info'>
  <div class="card-content"><div class="content">
    <blockquote>This post is focused on ... please read <a href="../using-rudaux"><em>Using Rudaux</em></a>.</blockquote>
  </div></div>
  <footer class="card-footer">
    <a href='https://ubc-dsci.github.io/rudaux-docs/' class='card-footer-item'>
      <span class="icon is-medium"><i class="fas fa-book fa-lg"></i></span>
      <span class='link-description'>Documentation</span>
    </a>
  </footer>
</div>
```
Becomes plain Markdown:
```markdown
> This post covers the motivation and design behind Rudaux. For how to use it, see [*Using Rudaux*](/blog/using-rudaux/).
>
> 📖 [Documentation](https://ubc-dsci.github.io/rudaux-docs/)
```
Its frontmatter carries the real `byline` (`Sam Hinshaw & Tiffany Timbers`) and `excerpt` from the legacy file.

- [ ] **Step 1:** Convert all 13 posts per the procedure above.

- [ ] **Step 2: Validate frontmatter against the schema**

Run: `npm run check`
Expected: 0 errors (every post satisfies the Zod schema). Fix any reported field/type issues.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Migrate 13 posts to plain Markdown (strip Bulma/FontAwesome)"
```

---

### Task 10: Blog routes (single list + post page)

**Files:**
- Create: `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`

- [ ] **Step 1: `src/pages/blog/index.astro` (lists all posts, newest first)**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { prose, postMeta } from '../../styles/prose.css';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
const fmt = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
---
<BaseLayout title="Blog">
  <div class={prose}>
    <h1>Blog</h1>
    <ul>
      {posts.map((post) => (
        <li>
          <a href={`/blog/${post.id}/`}>{post.data.title}</a>
          <div class={postMeta}><time datetime={post.data.date.toISOString()}>{fmt(post.data.date)}</time></div>
          {post.data.excerpt && <p>{post.data.excerpt}</p>}
        </li>
      ))}
    </ul>
  </div>
</BaseLayout>
```

- [ ] **Step 2: `src/pages/blog/[slug].astro` (one post)**

```astro
---
import { getCollection, render } from 'astro:content';
import PostLayout from '../../layouts/PostLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---
<PostLayout post={post}>
  <Content />
</PostLayout>
```

- [ ] **Step 3: Build and check post/blog URLs**

Run: `npm run build && npm run check:urls`
Expected: all `/blog/...` post URLs and `/blog/` now show `OK`; `/about/`, `/projects/`, `/tags/` still `MISS` (added next task).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add blog index and post routes"
```

---

### Task 11: Root pages (landing, about, projects stub, 404)

**Files:**
- Create: `src/pages/about.astro`, `src/pages/projects.astro`, `src/pages/404.astro` (index.astro already done in Task 7)

- [ ] **Step 1: `src/pages/about.astro`** (converted from `legacy/_root/about.md`, Bulma columns removed)

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
---
<PageLayout title="About" description="About Sam Hinshaw">
  <h1>About Me</h1>
  <p>I am a software developer that enjoys bringing new ideas to life. I like to solve complex problems with innovative solutions using cutting-edge tools. I like to ship clean, modular, testable code.</p>
  <p>I am also a graduate student in bioinformatics at The University of British Columbia where I build tools to make bioinformatics more accessible to all scientists. I welcome you to view a <a href="/projects/">detailed breakdown of all my projects</a>.</p>
  <p>I program mostly in Python and JavaScript, creating fully functional applications that make my research methodologies available to the public. There is also a special place in my heart for the first programming language I learned, R.</p>
  <p>I have always had a passion for technology, and in my spare time I like to hack things together. I also enjoy giving back to the community by contributing to open-source projects.</p>
  <p>Other interests of mine include:</p>
  <ul>
    <li>📸 <a href="https://instagram.com/holtonhinshaw">Photography</a></li>
    <li>🥖 Baking</li>
    <li>🌲 Hiking</li>
    <li>🏕 Camping</li>
    <li>🏃 Running</li>
    <li>🏊 Swimming</li>
    <li>☕️ Coffee</li>
    <li>🍺 Craft beer</li>
  </ul>
</PageLayout>
```

- [ ] **Step 2: `src/pages/projects.astro`** (stub — full rebuild deferred, see spec §11)

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
---
<PageLayout title="Projects" description="Projects by Sam Hinshaw">
  <h1>Projects</h1>
  <p>This page is being rebuilt. In the meantime, see my work on <a href="https://github.com/samhinshaw">GitHub</a>.</p>
</PageLayout>
```

- [ ] **Step 3: `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { prose } from '../styles/prose.css';
---
<BaseLayout title="Not Found">
  <div class={prose}>
    <h1>404 — Not Found</h1>
    <p><a href="/">Go home →</a></p>
  </div>
</BaseLayout>
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add about, projects stub, and 404 pages"
```

---

### Task 12: Tag pages

**Files:**
- Create: `src/pages/tags/index.astro`, `src/pages/tags/[tag].astro`

- [ ] **Step 1: `src/pages/tags/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { prose } from '../../styles/prose.css';

const posts = await getCollection('blog', ({ data }) => !data.draft);
const counts = new Map();
for (const p of posts) for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
const tags = [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
---
<BaseLayout title="Tags">
  <div class={prose}>
    <h1>Tags</h1>
    <ul>
      {tags.map(([tag, count]) => <li><a href={`/tags/${tag}/`}>{tag}</a> ({count})</li>)}
    </ul>
  </div>
</BaseLayout>
```

- [ ] **Step 2: `src/pages/tags/[tag].astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { prose } from '../../styles/prose.css';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const tags = [...new Set(posts.flatMap((p) => p.data.tags))];
  return tags.map((tag) => ({
    params: { tag },
    props: {
      tag,
      posts: posts
        .filter((p) => p.data.tags.includes(tag))
        .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
        .map((p) => ({ id: p.id, title: p.data.title })),
    },
  }));
}
const { tag, posts } = Astro.props;
---
<BaseLayout title={`Tag: ${tag}`}>
  <div class={prose}>
    <h1>Posts tagged “{tag}”</h1>
    <ul>{posts.map((p) => <li><a href={`/blog/${p.id}/`}>{p.title}</a></li>)}</ul>
  </div>
</BaseLayout>
```

- [ ] **Step 3: Build**

Run: `npm run build && npm run check:urls`
Expected: `/tags/` now `OK`; individual `/tags/<tag>/` pages exist for each tag used.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add tag index and per-tag pages"
```

---

### Task 13: RSS feed

**Files:**
- Create: `src/pages/rss.xml.js`

- [ ] **Step 1: `src/pages/rss.xml.js`**

```js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      link: `/blog/${post.id}/`,
    })),
  });
}
```

- [ ] **Step 2: Build and confirm feed + sitemap**

Run: `npm run build && ls dist/rss.xml dist/sitemap-index.xml`
Expected: both files exist.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add RSS feed endpoint"
```

---

### Task 14: Full verification

- [ ] **Step 1: Run the whole gate**

Run: `npm run verify`
Expected: `astro check` 0 errors → `astro build` succeeds → `check:urls` prints all `OK` and "All expected URLs present."

- [ ] **Step 2: Spot-check dark mode + a post locally**

Run: `npm run preview` then open `/blog/designing-rudaux/`. Toggle OS dark mode; confirm colors invert and code blocks render. Confirm the Rudaux info-card is a blockquote and its links work.

- [ ] **Step 3: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "Fix issues found in full verification"
```

---

### Task 15: Cloudflare Pages deploy

**Files:**
- Optional create: `public/_redirects`
- Create: `docs/DEPLOY.md`

- [ ] **Step 1: (Optional) preserve old pagination URLs — `public/_redirects`**

```
/blog/2/  /blog/  301
/blog/3/  /blog/  301
```

- [ ] **Step 2: Write `docs/DEPLOY.md` runbook**

```markdown
# Deploy (Cloudflare Pages)

1. Push the `astro-modernization` branch to GitHub.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → this repo.
3. Framework preset: Astro. Build command: `astro build`. Output dir: `dist`.
4. Environment variable: `NODE_VERSION = 22`.
5. First deploy runs on a *.pages.dev preview URL — verify pages + dark mode there.
6. Custom domain: add `www.samhinshaw.com` (DNS already in Cloudflare → one-click). HTTPS is automatic.
7. Verify the URLs in scripts/check-urls.mjs resolve on the live domain, then make it production.
```

- [ ] **Step 3: Build once more to confirm `_redirects` is emitted**

Run: `npm run build && test -f dist/_redirects && echo "redirects OK"`
Expected: `redirects OK` (only if you did Step 1; otherwise skip).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add Cloudflare Pages deploy runbook and redirects"
```

---

### Task 16: Remove the legacy archive

**Files:**
- Delete: `legacy/`
- Modify: `readme.md`

- [ ] **Step 1: Confirm nothing in `src/` or `public/` references `legacy/`**

Run: `grep -rn "legacy/" src public astro.config.mjs || echo "no references"`
Expected: `no references`.

- [ ] **Step 2: Remove the archive (history retains it)**

```bash
git rm -r legacy/
```

- [ ] **Step 3: Update `readme.md`**

```markdown
# samhinshaw.com

Personal blog built with [Astro](https://astro.build) and [Vanilla Extract](https://vanilla-extract.style), deployed on Cloudflare Pages.

## Develop
```bash
npm install
npm run dev      # local dev server
npm run verify   # check + build + URL parity
```

Posts live in `src/content/blog/*.md`. See `docs/specs/` and `docs/plans/` for the modernization design.
```

- [ ] **Step 4: Final verification + commit**

Run: `npm run verify`
Expected: all green.

```bash
git add -A
git commit -m "Remove legacy Reptar archive; update README"
```

---

## Self-Review

**Spec coverage (spec §-by-§):**
- §3 stack → Tasks 2–7, 13 (Astro, VE, Shiki default, system fonts, no icons, RSS/sitemap). ✅
- §4 roll-your-own VE → Task 6 (theme/reset/prose only; no Sprinkles/Recipes/framework). ✅
- §5 Cloudflare Pages → Task 15. ✅
- §6 architecture (collection, dark mode, built-in Shiki, no interactivity) → Tasks 5, 6, 10. ✅
- §7 URL handling (files named by slug, route by id, trailingSlash, no ceremony) → Tasks 9, 10, 8; redirects Task 15. ✅
- §8 phases → Tasks map 1:1 (Phase 0 = Task 3 de-risk). ✅
- §9 risks (Rolldown smoke test; strict-compiler content cleanup) → Task 3, Task 9. ✅
- §10 decisions (plain MD, no heroes/fonts/icons/EC, system dark, no pagination, favicons trimmed, dictionary dropped, projects stub) → Tasks 1, 6, 9, 11. ✅
- §11 deferred features → intentionally NOT built; projects stub (Task 11) links out. ✅

**Placeholder scan:** no TBD/TODO; every code step has complete content. The only per-item repetition (13 posts) is a bespoke content edit, given a full procedure + worked example rather than fabricated bodies. ✅

**Type/name consistency:** `prose`/`postMeta` exports (Task 6) are imported consistently (Tasks 7, 10, 11, 12); routing uses `post.id` everywhere (Tasks 10, 12, 13); `vars` contract keys (Task 6) match every `globalStyle` reference; schema fields (Task 5) match `PostLayout` destructuring (Task 7). ✅

---

## Execution Handoff

Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration (`superpowers:subagent-driven-development`).
2. **Inline Execution** — execute tasks in this session with checkpoints (`superpowers:executing-plans`).
