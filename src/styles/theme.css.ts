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
