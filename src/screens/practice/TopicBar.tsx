import { theme as T } from '../../theme';
import { Icon } from '../../ui';
import type { LearningCheckpoint } from '../../types';

type Props = {
  checkpoint: LearningCheckpoint;
  onMenu?: (() => void) | undefined;
};

// Top bar showing the current grammar topic + a cog that opens Settings.
// No counters or progress bars — practice is intentionally endless and the
// user stops when they feel ready. Mistake categories are still tracked in
// the background (LearningCheckpoint.mistakesByCategory) so the AI can use
// them to weight future exercises toward the user's weak spots.
export function TopicBar({ checkpoint, onMenu }: Props) {
  const topic = checkpoint.currentLearningFocus.grammarTopic;

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
  );
}
