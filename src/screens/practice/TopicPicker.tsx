// Inline expandable topic picker mounted from the TopicBar. All 13 canonical
// topics are pickable; the currently-selected one gets an accent background
// and a "Current" pill. No completion / locking — the audience is intermediate
// learners who can jump topics freely.

import { theme as T } from '../../theme';
import { t } from '../../i18n';
import { useLocale } from '../../i18n/useLocale';
import { GRAMMAR_PATH, topicLabelKeyFor } from './grammarPath';

type Props = {
  currentTopic: string;
  onPick: (topic: string) => void;
};

export function TopicPicker({ currentTopic, onPick }: Props) {
  const locale = useLocale();

  return (
    <div
      style={{
        marginTop: 10,
        background: T.surface2,
        border: `0.5px solid ${T.border}`,
        borderRadius: 14,
        padding: '8px 4px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxHeight: 320,
        overflow: 'auto',
      }}
    >
      {GRAMMAR_PATH.map((name) => {
        const isCurrent = name === currentTopic;
        const labelKey = topicLabelKeyFor(name);
        const display = labelKey ? t(locale, labelKey) : name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onPick(name)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              background: isCurrent ? T.accentBg : 'transparent',
              border: 0,
              borderRadius: 10,
              padding: '8px 12px',
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: T.fontBody,
              color: isCurrent ? T.accentInk : T.ink,
              fontSize: 13.5,
              fontWeight: isCurrent ? 500 : 400,
            }}
          >
            <span>{display}</span>
            {isCurrent && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: T.accentSoft,
                  color: T.accent,
                  border: `0.5px solid ${T.accentSoft}`,
                  borderRadius: 999,
                  padding: '2px 8px',
                  fontFamily: T.fontMono,
                  fontSize: 10,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  flexShrink: 0,
                }}
              >
                {t(locale, 'picker.state.current')}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
