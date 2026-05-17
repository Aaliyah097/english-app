// Inline expandable topic picker. Lives inside the rule bubble — the user
// taps the "Rule · Topic" header to open it, then taps a row to switch the
// current grammar focus. Replaces the Progress screen's topic-path view.

import { theme as T } from '../../theme';
import { Icon } from '../../ui';
import { GRAMMAR_PATH, tagGrammarPath, type GrammarPathState } from '../progress/grammarPath';

type Props = {
  currentTopic: string;
  completedTopics: string[];
  onPick: (topic: string) => void;
};

export function TopicPicker({ currentTopic, completedTopics, onPick }: Props) {
  const tagged = tagGrammarPath(completedTopics, currentTopic);

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
      {tagged.map(({ name, state }) => {
        const disabled = state === 'locked';
        const isCurrent = state === 'current';
        return (
          <button
            key={name}
            type="button"
            disabled={disabled}
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
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.45 : 1,
              fontFamily: T.fontBody,
              color: isCurrent ? T.accentInk : T.ink,
              fontSize: 13.5,
              fontWeight: isCurrent ? 500 : 400,
            }}
          >
            <span>{name}</span>
            <StatePill state={state} />
          </button>
        );
      })}
    </div>
  );
}

function StatePill({ state }: { state: GrammarPathState }) {
  if (state === 'current') {
    return <Tag color={T.accent} bg={T.accentSoft} label="Current" />;
  }
  if (state === 'completed') {
    return (
      <Tag color={T.good} bg={T.goodSoft} label="Done">
        <Icon.Check s={10} />
      </Tag>
    );
  }
  if (state === 'locked') {
    return <Tag color={T.muted} bg={T.surface} label="Locked" border={T.border} />;
  }
  return <Tag color={T.muted} bg={T.surface} label="Upcoming" border={T.border} />;
}

function Tag({
  color,
  bg,
  label,
  border,
  children,
}: {
  color: string;
  bg: string;
  label: string;
  border?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: bg,
        color,
        border: `0.5px solid ${border ?? bg}`,
        borderRadius: 999,
        padding: '2px 8px',
        fontFamily: T.fontMono,
        fontSize: 10,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        flexShrink: 0,
      }}
    >
      {children}
      {label}
    </span>
  );
}

// Re-export so consumers don't need a second import.
export { GRAMMAR_PATH };
