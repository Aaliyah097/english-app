import { useEffect, useMemo, useState } from 'react';
import { theme as T } from '../../theme';
import { Btn, Bubble, Chip, Icon, InputDock, TypingDot } from '../../ui';
import {
  bumpMistakeCategories,
  getCheckpoint,
  getUserProfile,
  mergeCheckpoint,
  subscribe,
} from '../../storage';
import type { Exercise, LearningCheckpoint, Mistake, TutorResponse, UserProfile } from '../../types';
import { InlineDiff } from './InlineDiff';
import { TopicBar } from './TopicBar';
import { diffWords } from './diff';
import { useTutorTurn } from './useTutorTurn';

type Props = {
  onMenu?: (() => void) | undefined;
};

type Phase = 'input' | 'awaiting' | 'review' | 'error';

function seedExerciseFromCheckpoint(
  profile: UserProfile,
  checkpoint: LearningCheckpoint,
): Exercise {
  return {
    sourceLanguage: profile.nativeLanguage,
    targetLanguage: profile.targetLanguage,
    sentence: '',
    grammarTopic: checkpoint.currentLearningFocus.grammarTopic,
    difficulty: checkpoint.currentLearningFocus.difficulty,
  };
}

export function PracticeScreen({ onMenu }: Props) {
  // Read profile + checkpoint directly and re-read on every storage write.
  // We don't use useStorageSnapshot here because that requires a referentially
  // stable selector return; we want the full live objects, which deserialise
  // fresh on each call.
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((n) => n + 1)), []);
  // Reference `tick` so React knows this read participates in the re-render.
  void tick;
  const profile = getUserProfile();
  const checkpoint = getCheckpoint();

  if (!profile || !checkpoint) {
    return <PracticeMissingState />;
  }
  return (
    <PracticeScreenInner profile={profile} checkpoint={checkpoint} onMenu={onMenu} />
  );
}

function PracticeMissingState() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: T.bg,
        color: T.ink,
        fontFamily: T.fontBody,
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 22, marginBottom: 6 }}>
          Practice unavailable
        </div>
        <div style={{ color: T.muted, fontSize: 13 }}>
          Finish onboarding to start practising.
        </div>
      </div>
    </div>
  );
}

type InnerProps = {
  profile: UserProfile;
  checkpoint: LearningCheckpoint;
  onMenu?: (() => void) | undefined;
};

function PracticeScreenInner({ profile, checkpoint, onMenu }: InnerProps) {
  const seed = useMemo(
    () => seedExerciseFromCheckpoint(profile, checkpoint),
    // Only seed once per profile/topic — once the user submits, the AI drives
    // the next exercise. Re-seeding on every checkpoint write would discard
    // the AI-supplied prompt the user is currently looking at.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [currentExercise, setCurrentExercise] = useState<Exercise>(seed);
  const [userAnswer, setUserAnswer] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [lastResult, setLastResult] = useState<TutorResponse | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<
    'network-error' | 'invalid-response' | null
  >(null);

  const tutor = useTutorTurn();

  // Bootstrap the first real exercise just after onboarding: when the seed
  // has an empty sentence and we have no AI result yet, ask the tutor for one.
  useEffect(() => {
    if (currentExercise.sentence !== '' || lastResult || tutor.status !== 'idle') return;
    void runTurn('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runTurn(answer: string) {
    setPhase('awaiting');
    setLastError(null);
    setErrorKind(null);
    const result = await tutor.send({
      userProfile: profile,
      checkpoint,
      currentExercise,
      userAnswer: answer,
    });
    if (!result) return;
    if (result.kind === 'ok') {
      try {
        mergeCheckpoint(result.response.updatedCheckpoint as Partial<LearningCheckpoint>);
        // Bump lifetime per-category counters for THIS turn's mistakes. Each
        // category is counted at most once per turn (handled inside the helper).
        const cats = result.response.mistakes.map((m) => m.category);
        if (cats.length > 0) bumpMistakeCategories(cats);
      } catch {
        // Storage merge can throw if the checkpoint was cleared mid-flight.
        // Treat as a soft error — keep the response in memory.
      }
      setLastResult(result.response);
      // If we just bootstrapped (empty current sentence + empty answer), jump
      // straight into input mode with the AI-supplied first exercise.
      if (currentExercise.sentence === '' && answer === '') {
        setCurrentExercise(result.response.nextExercise);
        setLastResult(null);
        setPhase('input');
      } else {
        setPhase('review');
      }
      return;
    }
    setErrorKind(result.kind);
    setLastError(result.message);
    setPhase('error');
  }

  function handleSubmit() {
    if (phase === 'awaiting') return;
    if (userAnswer.trim() === '') return;
    void runTurn(userAnswer);
  }

  function handleNext() {
    if (lastResult) {
      setCurrentExercise(lastResult.nextExercise);
    }
    setLastResult(null);
    setUserAnswer('');
    setPhase('input');
  }

  function handleRetry() {
    void runTurn(userAnswer);
  }

  const placeholder = phase === 'awaiting' ? 'Checking…' : 'Type your translation…';

  const diffTokens = useMemo(() => {
    if (!lastResult?.correctedAnswer) return null;
    return diffWords(userAnswer, lastResult.correctedAnswer);
  }, [lastResult, userAnswer]);

  return (
    <div
      data-testid="practice-screen"
      style={{
        position: 'absolute',
        inset: 0,
        background: T.bg,
        fontFamily: T.fontBody,
        color: T.ink,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TopicBar checkpoint={checkpoint} onMenu={onMenu} />

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          // Bottom padding clears the InputDock (~64px) + BottomNav (~98px).
          padding: '18px 18px 180px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Rule bubble */}
        <Bubble side="ai" pad="rule">
          <div
            style={{
              fontFamily: T.fontMono,
              fontSize: 10,
              color: T.muted,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Rule · {checkpoint.currentLearningFocus.grammarTopic}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.5, color: T.ink2 }}>
            {checkpoint.lastCheckpointSummary ||
              `Practise ${checkpoint.currentLearningFocus.grammarTopic}.`}
          </div>
        </Bubble>

        {/* Source prompt */}
        {currentExercise.sentence !== '' && (
          <Bubble side="ai">
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 6 }}>
              Translate to {profile.targetLanguage.toUpperCase()}:
            </div>
            <div
              style={{
                fontFamily: T.fontDisplay,
                fontSize: 19,
                fontStyle: 'italic',
                lineHeight: 1.4,
                color: T.ink,
              }}
            >
              {currentExercise.sentence}
            </div>
          </Bubble>
        )}

        {/* User answer (shown once submitted) */}
        {(phase === 'review' || phase === 'awaiting' || phase === 'error') &&
          userAnswer.trim() !== '' && (
            <Bubble side="user">
              <div style={{ fontSize: 15, lineHeight: 1.5 }}>{userAnswer}</div>
            </Bubble>
          )}

        {/* Loading placeholder while waiting on the AI */}
        {phase === 'awaiting' && <TypingDot />}

        {/* Correction bubble */}
        {phase === 'review' && lastResult && (
          <Bubble side="ai">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Chip tone="good" size="sm">
                <Icon.Check s={11} />
                Reviewed
              </Chip>
            </div>
            {lastResult.correctedAnswer && diffTokens && (
              <>
                <div
                  style={{
                    fontFamily: T.fontMono,
                    fontSize: 10,
                    color: T.muted,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  Corrected
                </div>
                <div
                  style={{
                    padding: 12,
                    background: T.surface2,
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                >
                  <InlineDiff tokens={diffTokens} />
                </div>
              </>
            )}
            {lastResult.mistakes.length > 0 && (
              <MistakeList mistakes={lastResult.mistakes} />
            )}
            <div style={{ fontSize: 14, lineHeight: 1.5, color: T.ink2 }}>
              {lastResult.messageToUser}
            </div>
          </Bubble>
        )}

        {/* Error state — server returned non-2xx or upstream returned bad JSON. */}
        {phase === 'error' && errorKind != null && (
          <Bubble side="ai">
            <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 10, color: T.accentInk }}>
              {lastError ?? 'Something went wrong.'}
            </div>
            <Btn kind="primary" size="sm" onClick={handleRetry}>
              Retry
            </Btn>
          </Bubble>
        )}
      </div>

      {phase === 'review' ? (
        <NextDock onNext={handleNext} />
      ) : (
        <InputDock
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={handleSubmit}
          placeholder={placeholder}
          cta="Check"
          disabled={phase === 'awaiting'}
        />
      )}
    </div>
  );
}

// Replaces the InputDock in the review phase: a single full-width "Next
// exercise" CTA at the same vertical position. Avoids showing a dead input
// field when the AI has already corrected the user's answer.
function NextDock({ onNext }: { onNext: () => void }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 98,
        left: 0,
        right: 0,
        padding: '8px 14px 8px',
        background: `linear-gradient(to top, ${T.bg} 70%, transparent)`,
        zIndex: 25,
      }}
    >
      <Btn kind="accent" size="lg" full icon={<Icon.Arrow s={16} />} onClick={onNext}>
        Next exercise
      </Btn>
    </div>
  );
}

// Compact bulleted list, one entry per unique mistake `type`. Matches the
// chat-variant mockup: small accent dot, bolded type name, then the why.
// If the model emits two entries with the same `type` we keep the first and
// drop the rest (per the prompt's "one bullet per unique rule" instruction —
// this is a defence-in-depth dedupe in case the model slips).
function MistakeList({ mistakes }: { mistakes: ReadonlyArray<Mistake> }) {
  const unique = dedupeByType(mistakes);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        marginBottom: 12,
      }}
    >
      {unique.map((m, i) => (
        <div
          key={`${m.type}-${i}`}
          style={{
            fontSize: 12.5,
            color: T.ink2,
            lineHeight: 1.45,
            paddingLeft: 12,
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 0,
              top: 7,
              width: 4,
              height: 4,
              borderRadius: 4,
              background: T.accent,
            }}
          />
          <b style={{ color: T.ink }}>{m.type}.</b>{' '}
          {m.explanation ?? `${m.example} → ${m.correction}`}
        </div>
      ))}
    </div>
  );
}

function dedupeByType(mistakes: ReadonlyArray<Mistake>): Mistake[] {
  const seen = new Set<string>();
  const out: Mistake[] = [];
  for (const m of mistakes) {
    const key = m.type.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
  }
  return out;
}
