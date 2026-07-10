import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
  site: 'https://www.samhinshaw.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
  vite: { plugins: [vanillaExtractPlugin()] },
});
