# Deploy — Cloudflare Pages

This site is a **static** Astro build (no adapter). Cloudflare Pages builds it from Git and serves `dist/` on its global CDN. HTTPS, caching, and previews are automatic.

## Prerequisites

- The repo is pushed to GitHub (or GitLab).
- The domain `samhinshaw.com` is already managed in this Cloudflare account (it is), so attaching the custom domain is a one-click, no-DNS-edit step.

## One-time setup

1. **Push the branch.** Push `astro-modernization` to GitHub (merge to `master` first if you'd rather deploy from the default branch — set the production branch accordingly in step 4).
2. **Create the project.** Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → pick this repo.
3. **Build settings:**
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: *(leave blank)*
4. **Environment variables** (Settings → Environment variables):
   - `NODE_VERSION` = `22`  ← required; the build needs Node ≥ 22.12 (matches `.nvmrc`).
5. **Save and Deploy.** The first build runs and publishes to a `https://<project>.pages.dev` preview URL.

## Verify the preview before going live

On the `*.pages.dev` URL, confirm:

- Home, `/about/`, `/projects/`, `/blog/`, `/tags/` all load.
- A post renders with code highlighting and the info-card blockquote, e.g. `/blog/designing-rudaux/`.
- Dark mode follows your OS setting (toggle your system appearance; colors invert — there is no in-page switcher by design).
- `/rss.xml` and `/sitemap-index.xml` load.

Optional CLI parity check against the live preview (every path in `scripts/check-urls.mjs` should return 200):

```bash
BASE=https://<project>.pages.dev
for u in / /about/ /projects/ /blog/ /tags/ \
  /blog/automatically-update-rstudio/ /blog/installing-node-js-on-linux/ \
  /blog/ligature-support-in-monospace-fonts/ /blog/wrapping-template-literals-in-vs-code/ \
  /blog/lazy-loading-r-packages-in-shiny/ /blog/designing-rudaux/ /blog/using-rudaux/; do
  printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$BASE$u")" "$u"
done
```

## Attach the custom domain

1. Project → **Custom domains** → **Set up a custom domain** → enter `www.samhinshaw.com`. Because DNS is already in Cloudflare, it provisions the CNAME and certificate automatically.
2. Decide apex behavior for `samhinshaw.com` (bare domain): add it as a second custom domain, or add a Cloudflare **Redirect Rule** `samhinshaw.com/* → https://www.samhinshaw.com/$1` (301). Pick one so both `www` and apex resolve.
3. Once the custom domain is active and verified, set the **production branch** (Settings → Builds & deployments) to the branch you push releases from. Every push to that branch redeploys; every other branch/PR gets its own preview URL.

## Build config reference

- `astro.config.mjs` sets `site: 'https://www.samhinshaw.com'` and `trailingSlash: 'always'` — canonical URLs, the sitemap, and RSS links all depend on `site`, so keep it in sync with the production domain.
- `trailingSlash: 'always'` means every page is emitted as `<path>/index.html`; Cloudflare serves `/blog/foo/` correctly. Don't switch this without re-checking the URL map.

## Optional: legacy redirects

The old site is not known to expose paginated URLs (`/blog/2/`, …) that need preserving, so no `public/_redirects` file is shipped. If analytics later surface old inbound URLs that 404, add `public/_redirects` (Cloudflare Pages format), e.g.:

```
/blog/page/2/   /blog/   301
```

It is copied verbatim into `dist/` at build time.
