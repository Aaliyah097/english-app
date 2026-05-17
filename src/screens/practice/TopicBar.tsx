import { theme as T } from '../../theme';
import { Chip, Icon } from '../../ui';
import type { LearningCheckpoint } from '../../types';

type Props = {
  checkpoint: LearningCheckpoint;
  onMenu?: (() => void) | undefined;
};

// Top bar showing the current grammar topic + a cog that opens Settings.
// Ported from `TopicBar` in ai/design/project/src/practice.jsx; sources its
// data from the LearningCheckpoint rather than mockup window globals.
export function TopicBar({ checkpoint, onMenu }: Props) {
  const topic = checkpoint.currentLearningFocus.grammarTopic;
  const completed = checkpoint.currentTopicProgress.completedExercises;
  // Display the next exercise index (1-based) — completed + 1.
  const exerciseIndex = completed + 1;

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
      <button
        type="button"
        style={{
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: 999,
          padding: '6px 10px 6px 8px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          color: T.ink,
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 7,
            background: T.accentBg,
            color: T.accentInk,
            display: 'grid',
            placeItems: 'center',
            fontFamily: T.fontMono,
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          {exerciseIndex}
        </div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{topic}</div>
        <Icon.Down s={14} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.ink2 }}>
        <Chip tone="neutral" size="sm">
          <Icon.Flame s={12} />
          <span>{completed}</span>
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
