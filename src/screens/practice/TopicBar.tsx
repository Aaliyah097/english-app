import { theme as T } from '../../theme';
import { Chip, Icon } from '../../ui';
import type { LearningCheckpoint } from '../../types';

type Props = {
  checkpoint: LearningCheckpoint;
  onMenu?: (() => void) | undefined;
};

// Top bar showing the current grammar topic + a lifetime "patterns flagged"
// chip + a cog that opens Settings. The mockup's exercise-index pill and the
// X/Y progress bar were removed because the practice loop is intentionally
// endless — see BACKLOG. The counter is the user's honest progress signal:
// the slope flattens as they improve.
export function TopicBar({ checkpoint, onMenu }: Props) {
  const topic = checkpoint.currentLearningFocus.grammarTopic;
  const flagged = sumCounts(checkpoint.mistakesByCategory);

  return (
    <div
      style={{
        padding: '56px 18px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}
    >
      <div
        style={{
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: 999,
          padding: '6px 12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          color: T.ink,
        }}
      >
        <Icon.Sparkle s={14} />
        <div style={{ fontSize: 13, fontWeight: 500 }}>{topic}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.ink2 }}>
        <Chip tone="neutral" size="sm">
          <Icon.Flame s={12} />
          <span>
            {flagged} {flagged === 1 ? 'flag' : 'flags'}
          </span>
        </Chip>
        <button
          type="button"
          aria-label="Settings"
          onClick={onMenu}
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            background: T.surface,
            border: `0.5px solid ${T.border}`,
            color: T.ink2,
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Icon.Cog s={15} />
        </button>
      </div>
    </div>
  );
}

function sumCounts(record: Record<string, number>): number {
  let n = 0;
  for (const v of Object.values(record)) n += v;
  return n;
}
