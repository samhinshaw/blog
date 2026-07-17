# samhinshaw.com

Personal blog built with [Astro](https://astro.build) and [Vanilla Extract](https://vanilla-extract.style), deployed on Cloudflare Pages. Dark mode follows the system theme; code is highlighted with Astro's built-in Shiki.

## Develop

```bash
npm install
npm run dev      # local dev server (http://localhost:4321)
npm run build    # static build to dist/
npm run verify   # astro check + build + URL-parity check
```

Requires Node ≥ 22.12 (see `.nvmrc`).

## Structure

- **Posts** — `src/content/blog/*.md`. Frontmatter is validated by the Zod schema in `src/content.config.ts`; set `draft: true` to keep a post unpublished (drafts are excluded from routes, the index, tags, and RSS).
- **Styling** — `src/styles/*.css.ts` (Vanilla Extract: `theme` tokens + system dark mode, `reset`, `prose`).
- **Layouts & components** — `src/layouts/`, `src/components/`.
- **URL parity** — `scripts/check-urls.mjs` asserts every published URL is emitted to `dist/`.

## Deploy & design docs

- Deploy runbook: `docs/DEPLOY.md`
- Modernization design: `docs/specs/` and `docs/plans/`
