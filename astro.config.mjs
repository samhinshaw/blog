import { defineConfig } from 'astro/config';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
  site: 'https://www.samhinshaw.com',
  trailingSlash: 'always',
  vite: { plugins: [vanillaExtractPlugin()] },
});
