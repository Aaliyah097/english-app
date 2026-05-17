import { getCheckpoint } from '../../storage';
import { useStorageSnapshot } from '../../storage/useStorageSnapshot';
import { theme as T } from '../../theme';
import type { LearningCheckpoint, Mistake } from '../../types';
import { Btn, Chip, Icon, SectionTitle, Shell, TopBar } from '../../ui';
import { tagGrammarPath, type TaggedTopic } from './grammarPath';

type Props = {
  onGoToPractice?: () => void;
};

const MAX_RECENT_MISTAKES = 5;

// useSyncExternalStore requires a stable reference between renders unless
// the data actually changed. getCheckpoint() rehydrates from JSON on every
// call, so we memoise on the serialised form and only refresh the cached
// object when storage notifies a real change.
let cachedSerialized: string | null = null;
let cachedCheckpoint: LearningCheckpoint | null = null;
function checkpointSnapshot(): LearningCheckpoint | null {
  const next = getCheckpoint();
  const serialized = next == null ? null : JSON.stringify(next);
  if (serialized === cachedSerialized) return cachedCheckpoint;
  cachedSerialized = serialized;
  cachedCheckpoint = next;
  return cachedCheckpoint;
}

export function ProgressScreen({ onGoToPractice }: Props) {
  const checkpoint = useStorageSnapshot(checkpointSnapshot);

  return (
    <Shell
      header={
        <TopBar
          left={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.Chart s={20} />
              <span style={{ fontWeight: 500 }}>Progress</span>
            </div>
          }
        />
      }
    >
      {checkpoint ? (
        <FilledProgress checkpoint={checkpoint} />
      ) : onGoToPractice ? (
        <EmptyProgress onGoToPractice={onGoToPractice} />
      ) : (
        <EmptyProgress />
      )}
    </Shell>
  );
}

function FilledProgress({ checkpoint }: { checkpoint: LearningCheckpoint }) {
  const { currentLearningFocus, currentTopicProgress, recentMistakes, completedTopics } =
    checkpoint;
  const topics = tagGrammarPath(completedTopics, currentLearningFocus.grammarTopic);
  const mistakes = recentMistakes.slice(0, MAX_RECENT_MISTAKES);

  return (
    <>
      <CurrentFocusCard
        topic={currentLearningFocus.grammarTopic}
        difficulty={currentLearningFocus.difficulty}
        completedExercises={currentTopicProgress.completedExercises}
      />

      <SectionTitle>Grammar path</SectionTitle>
      <GrammarPathList topics={topics} />

      <SectionTitle>Where you stumble</SectionTitle>
      <RecentMistakesList mistakes={mistakes} />
    </>
  );
}

function CurrentFocusCard({
  topic,
  difficulty,
  completedExercises,
}: {
  topic: string;
  difficulty: number;
  completedExercises: number;
}) {
  return (
    <div style={{ padding: '0 18px' }}>
      <div
        style={{
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: 20,
          padding: '16px 18px',
        }}
      >
        <div
          style={{
            fontFamily: T.fontMono,
            fontSize: 10,
            color: T.muted,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}
        >
          Current focus
        </div>
        <div
          style={{
            fontFamily: T.fontDisplay,
            fontStyle: 'italic',
            fontSize: 24,
            letterSpacing: -0.4,
            color: T.ink,
            marginTop: 6,
            lineHeight: 1.1,
          }}
        >
          {topic}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 14,
          }}
        >
          <DifficultyPips value={difficulty} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.muted }}>
              Exercises completed
            </span>
            <Chip tone="ink" size="sm">
              {completedExercises}
            </Chip>
          </div>
        </div>
      </div>
    </div>
  );
}

function DifficultyPips({ value }: { value: number }) {
  const max = 5;
  const clamped = Math.max(1, Math.min(max, Math.round(value)));
  return (
    <div
      aria-label={`Difficulty ${clamped} of ${max}`}
      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
    >
      <span
        style={{
          fontFamily: T.fontMono,
          fontSize: 10,
          color: T.muted,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          marginRight: 4,
        }}
      >
        Difficulty
      </span>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: i < clamped ? T.accent : T.surface2,
            border: `0.5px solid ${i < clamped ? T.accent : T.border}`,
            display: 'inline-block',
          }}
        />
      ))}
    </div>
  );
}

function GrammarPathList({ topics }: { topics: TaggedTopic[] }) {
  return (
    <div style={{ padding: '0 18px' }}>
      <div
        style={{
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: 20,
          padding: '4px 0',
        }}
      >
        {topics.map((topic, i) => {
          const isLast = i === topics.length - 1;
          const isLocked = topic.state === 'locked';
          const isCurrent = topic.state === 'current';
          return (
            <div
              key={topic.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                position: 'relative',
                opacity: isLocked ? 0.55 : 1,
              }}
            >
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    left: 27,
                    top: 38,
                    bottom: -4,
                    width: 1,
                    background: T.border,
                  }}
                />
              )}
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  background: isCurrent
                    ? T.accent
                    : isLocked
                      ? T.surface2
                      : topic.state === 'completed'
                        ? T.goodSoft
                        : T.surface2,
                  color: isCurrent
                    ? '#fff'
                    : isLocked
                      ? T.muted
                      : topic.state === 'completed'
                        ? '#3f5a2f'
                        : T.ink2,
                  display: 'grid',
                  placeItems: 'center',
                  border: `0.5px solid ${isCurrent ? T.accent : T.border}`,
                  fontFamily: T.fontMono,
                  fontSize: 11,
                  fontWeight: 500,
                  position: 'relative',
                  zIndex: 2,
                }}
                aria-hidden
              >
                {isLocked ? (
                  <Icon.Lock s={12} />
                ) : topic.state === 'completed' ? (
                  <Icon.Check s={12} />
                ) : (
                  i + 1
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: T.ink }}>
                  {topic.name}
                </div>
              </div>
              <StatePill state={topic.state} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatePill({ state }: { state: TaggedTopic['state'] }) {
  if (state === 'current') {
    return (
      <Chip tone="accent" size="sm">
        Current
      </Chip>
    );
  }
  if (state === 'completed') {
    return (
      <Chip tone="good" size="sm">
        Done
      </Chip>
    );
  }
  if (state === 'locked') {
    return (
      <Chip tone="neutral" size="sm">
        Locked
      </Chip>
    );
  }
  return (
    <Chip tone="neutral" size="sm">
      Upcoming
    </Chip>
  );
}

function RecentMistakesList({ mistakes }: { mistakes: Mistake[] }) {
  if (mistakes.length === 0) {
    return (
      <div style={{ padding: '0 18px' }}>
        <div
          style={{
            background: T.surface,
            border: `0.5px solid ${T.border}`,
            borderRadius: 14,
            padding: '14px 16px',
            fontSize: 13,
            color: T.muted,
          }}
        >
          No mistakes recorded yet. Keep practising.
        </div>
      </div>
    );
  }
  return (
    <div
      style={{
        padding: '0 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {mistakes.map((m, i) => (
        <div
          key={`${m.type}-${i}`}
          style={{
            background: T.surface,
            border: `0.5px solid ${T.border}`,
            borderRadius: 14,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: T.accentBg,
              color: T.accentInk,
              display: 'grid',
              placeItems: 'center',
              fontFamily: T.fontMono,
              fontSize: 12,
              fontWeight: 500,
              flexShrink: 0,
            }}
            aria-hidden
          >
            <Icon.X s={14} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>{m.type}</div>
            <div
              style={{
                fontSize: 12,
                color: T.muted,
                fontFamily: T.fontMono,
                marginTop: 3,
                wordBreak: 'break-word',
              }}
            >
              {m.example}
              {m.correction ? ` → ${m.correction}` : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyProgress({ onGoToPractice }: { onGoToPractice?: () => void }) {
  return (
    <div style={{ padding: '0 18px' }}>
      <div
        style={{
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: 20,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 14,
        }}
      >
        <div
          style={{
            fontFamily: T.fontDisplay,
            fontStyle: 'italic',
            fontSize: 22,
            letterSpacing: -0.4,
            color: T.ink,
            lineHeight: 1.15,
          }}
        >
          Start practising to see your progress.
        </div>
        <div style={{ fontSize: 13.5, color: T.muted }}>
          Your current topic, recent mistakes, and grammar path will appear here
          once you complete your first exercise.
        </div>
        {onGoToPractice && (
          <Btn kind="accent" size="md" onClick={onGoToPractice}>
            Go to practice
          </Btn>
        )}
      </div>
    </div>
  );
}
