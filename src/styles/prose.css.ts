import { style, globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.css';

export const prose = style({});
export const postMeta = style({ color: vars.color.muted, fontSize: '0.9em' });

globalStyle(`${prose} :is(h1,h2,h3,h4)`, {
  lineHeight: 1.25,
  marginTop: vars.space.xl,
  marginBottom: vars.space.sm,
});
globalStyle(`${prose} :is(p,ul,ol,blockquote,pre,table)`, {
  marginTop: 0,
  marginBottom: vars.space.md,
});
globalStyle(`${prose} blockquote`, {
  margin: `${vars.space.md} 0`,
  paddingLeft: vars.space.md,
  borderLeft: `4px solid ${vars.color.border}`,
  color: vars.color.muted,
});
globalStyle(`${prose} :not(pre) > code`, {
  background: vars.color.code,
  padding: '0.15em 0.35em',
  borderRadius: vars.radius.md,
  fontFamily: vars.font.mono,
  fontSize: '0.9em',
});
globalStyle(`${prose} pre`, {
  padding: vars.space.md,
  borderRadius: vars.radius.md,
  overflowX: 'auto',
});
globalStyle(`${prose} table`, { width: '100%', borderCollapse: 'collapse' });
globalStyle(`${prose} :is(th,td)`, {
  border: `1px solid ${vars.color.border}`,
  padding: vars.space.sm,
  textAlign: 'left',
});
globalStyle(`${prose} hr`, {
  border: 'none',
  borderTop: `1px solid ${vars.color.border}`,
  margin: `${vars.space.xl} 0`,
});
