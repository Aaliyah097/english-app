import { Fragment } from 'react';
import { theme as T } from '../../theme';
import type { DiffToken } from './diff';

type Props = {
  tokens: DiffToken[];
};

// Renders the token-diff visual from the mockup (ai/design/project/src/practice.jsx).
// The AI returns a plain `correctedAnswer`; we compute the token shape client-side
// via `diffWords` and feed it here.
export function InlineDiff({ tokens }: Props) {
  return (
    <span
      style={{
        fontSize: 15,
        lineHeight: 1.55,
        color: T.ink,
        fontFamily: T.fontBody,
      }}
    >
      {tokens.map((tok, i) => {
        if (tok.s === 'ok') {
          return <Fragment key={i}>{tok.t} </Fragment>;
        }
        if (tok.s === 'wrong') {
          return (
            <Fragment key={i}>
              <s style={{ color: '#a13d27', textDecorationThickness: 1.5 }}>{tok.t}</s>{' '}
              <mark
                style={{
                  background: T.accentBg,
                  color: T.accentInk,
                  padding: '0 4px',
                  borderRadius: 4,
                  fontWeight: 500,
                  boxShadow: `0 -2px 0 ${T.accentSoft} inset`,
                }}
              >
                {tok.fix}
              </mark>{' '}
            </Fragment>
          );
        }
        if (tok.s === 'drop') {
          return (
            <Fragment key={i}>
              <s style={{ color: '#a13d27', opacity: 0.7 }}>{tok.t}</s>{' '}
            </Fragment>
          );
        }
        if (tok.s === 'add') {
          return (
            <Fragment key={i}>
              <mark
                style={{
                  background: '#dfe6d2',
                  color: '#3f5a2f',
                  padding: '0 4px',
                  borderRadius: 4,
                  fontWeight: 500,
                }}
              >
                +{tok.add}
              </mark>{' '}
            </Fragment>
          );
        }
        return null;
      })}
    </span>
  );
}
