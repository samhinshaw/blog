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
globalStyle('main', {
  maxWidth: vars.size.content,
  margin: '0 auto',
  padding: `${vars.space.lg} ${vars.space.md}`,
});
globalStyle('a', { color: vars.color.link });
globalStyle('img', { maxWidth: '100%', height: 'auto' });
globalStyle('header.site nav', {
  display: 'flex',
  gap: vars.space.md,
  alignItems: 'baseline',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  maxWidth: vars.size.content,
  margin: '0 auto',
  padding: vars.space.md,
});
globalStyle('header.site nav ul', {
  display: 'flex',
  gap: vars.space.md,
  listStyle: 'none',
  margin: 0,
  padding: 0,
});
globalStyle('footer.site', {
  maxWidth: vars.size.content,
  margin: `${vars.space.xl} auto 0`,
  padding: vars.space.md,
  color: vars.color.muted,
  borderTop: `1px solid ${vars.color.border}`,
  display: 'flex',
  gap: vars.space.md,
  justifyContent: 'space-between',
  flexWrap: 'wrap',
});
