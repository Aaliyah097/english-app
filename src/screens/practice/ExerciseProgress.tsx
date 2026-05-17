import { theme as T } from '../../theme';
import type { LearningCheckpoint } from '../../types';

type Props = {
  checkpoint: LearningCheckpoint;
  // Notional total — the AI drives progression, so we pin a visual length so
  // the bar fills up gradually rather than always reading 0%. Falls back to 8.
  total?: number;
};

// Slim progress bar shown under the TopicBar.
// Ported from `ExerciseProgress` in ai/design/project/src/practice.jsx.
export function ExerciseProgress({ checkpoint, total = 8 }: Props) {
  const completed = checkpoint.currentTopicProgress.completedExercises;
  const safeTotal = Math.max(total, completed + 1);
  const pct = Math.min(100, (completed / safeTotal) * 100);

  return (
    <div style={{ padding: '0 18px 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          flex: 1,
          height: 4,
          background: T.border,
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: T.ink,
            borderRadius: 999,
          }}
        />
      </div>
      <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.muted }}>
        {completed}/{safeTotal}
      </div>
    </div>
  );
}
