import { useEffect, useMemo, useState } from 'react';
import { theme as T } from '../../theme';
import { Btn, Bubble, Chip, Icon, InputDock, TypingDot } from '../../ui';
import { getCheckpoint, getUserProfile, mergeCheckpoint, subscribe } from '../../storage';
import type { Exercise, LearningCheckpoint, Mistake, TutorResponse, UserProfile } from '../../types';
import { InlineDiff } from './InlineDiff';
import { TopicBar } from './TopicBar';
import { TopicPicker } from './TopicPicker';
import { diffWords } from './diff';
import { useTutorTurn } from './useTutorTurn';
import {
  defaultRuleKeyFor,
  explanationFor,
  topicLabelKeyFor,
} from '../progress/grammarPath';
import { t } from '../../i18n';
import { useLocale } from '../../i18n/useLocale';

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
  const locale = useLocale();
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
          {t(locale, 'practice.missing.title')}
        </div>
        <div style={{ color: T.muted, fontSize: 13 }}>
          {t(locale, 'practice.missing.body')}
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
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [errorKind, setErrorKind] = useState<
    'network-error' | 'invalid-response' | null
  >(null);

  const tutor = useTutorTurn();

  // Bootstrap a fresh exercise whenever the source/target language pair on
  // the current exercise no longer matches the user's profile (e.g. they
  // just switched their learning language in Settings). Resetting to a seed
  // with an empty sentence lets the bootstrap effect below pick it up.
  useEffect(() => {
    if (
      currentExercise.sourceLanguage === profile.nativeLanguage &&
      currentExercise.targetLanguage === profile.targetLanguage
    )
      return;
    setCurrentExercise(seedExerciseFromCheckpoint(profile, checkpoint));
    setLastResult(null);
    setUserAnswer('');
    setPhase('input');
    tutor.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.nativeLanguage, profile.targetLanguage]);

  // Bootstrap the first real exercise — runs both at mount and whenever the
  // language-change effect above resets sentence back to ''.
  useEffect(() => {
    if (currentExercise.sentence !== '' || lastResult || tutor.status !== 'idle') return;
    void runTurn('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExercise.sentence, lastResult, tutor.status]);

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
        mergeCheckpoint(result.response.updatedCheckpoint);
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

  const locale = useLocale();

  function handlePickTopic(topic: string) {
    setIsPickerOpen(false);
    if (topic === checkpoint.currentLearningFocus.grammarTopic) return;
    const ruleKey = defaultRuleKeyFor(topic);
    mergeCheckpoint({
      currentLearningFocus: {
        grammarTopic: topic,
        difficulty: 1,
        // Clear the rule — the AI will fill in a target-language rule on
        // the next turn. The defaults in i18n are the fallback while we wait.
        rule: ruleKey ? t(locale, ruleKey) : '',
      },
      currentTopicProgress: {
        topic,
        completedExercises: 0,
        knownWeaknesses: [],
      },
    });
    setLastResult(null);
    setUserAnswer('');
    setPhase('input');
    // Reset the tutor hook back to 'idle' so the bootstrap useEffect (gated
    // on tutor.status === 'idle') re-fires for the new topic. Without this,
    // the source-sentence bubble never appears after a topic switch.
    tutor.reset();
    setCurrentExercise({
      sourceLanguage: profile.nativeLanguage,
      targetLanguage: profile.targetLanguage,
      sentence: '',
      grammarTopic: topic,
      difficulty: 1,
    });
  }

  const placeholder =
    phase === 'awaiting'
      ? t(locale, 'practice.input.checking')
      : t(locale, 'practice.input.placeholder');

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
      <TopicBar
        checkpoint={checkpoint}
        onMenu={onMenu}
        onTopicClick={() => setIsPickerOpen((open) => !open)}
        isPickerOpen={isPickerOpen}
      />

      {/* Topic picker overlay — drops below the TopicBar when open. */}
      {isPickerOpen && (
        <div
          style={{
            position: 'absolute',
            top: 100,
            left: 18,
            right: 18,
            zIndex: 40,
            boxShadow: '0 18px 40px rgba(40,30,20,0.10), 0 6px 14px rgba(40,30,20,0.06)',
            borderRadius: 14,
            background: T.surface,
          }}
        >
          <TopicPicker
            currentTopic={checkpoint.currentLearningFocus.grammarTopic}
            completedTopics={checkpoint.completedTopics}
            onPick={handlePickTopic}
          />
        </div>
      )}

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          // Bottom padding clears the InputDock (~64px tall, sits at bottom: 30).
          padding: '18px 18px 110px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Rule bubble (read-only label + rule body + Explain button) */}
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
            {t(locale, 'practice.rule.label')} ·{' '}
            {(() => {
              const topicKey = topicLabelKeyFor(checkpoint.currentLearningFocus.grammarTopic);
              return topicKey
                ? t(locale, topicKey)
                : checkpoint.currentLearningFocus.grammarTopic;
            })()}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.5, color: T.ink2 }}>
            {checkpoint.currentLearningFocus.rule ||
              (() => {
                const ruleKey = defaultRuleKeyFor(checkpoint.currentLearningFocus.grammarTopic);
                if (ruleKey) return t(locale, ruleKey);
                const topicKey = topicLabelKeyFor(checkpoint.currentLearningFocus.grammarTopic);
                const topicLabel = topicKey
                  ? t(locale, topicKey)
                  : checkpoint.currentLearningFocus.grammarTopic;
                return t(locale, 'practice.rule.fallback', { topic: topicLabel });
              })()}
          </div>

          {(() => {
            const explanation = explanationFor(
              checkpoint.currentLearningFocus.grammarTopic,
            );
            if (!explanation) return null;
            return (
              <div style={{ marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsExplainOpen((open) => !open)}
                  aria-expanded={isExplainOpen}
                  style={{
                    background: isExplainOpen ? T.surface2 : 'transparent',
                    border: `0.5px solid ${T.border}`,
                    borderRadius: 999,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    color: T.ink2,
                    fontFamily: T.fontBody,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {isExplainOpen
                    ? t(locale, 'practice.rule.hide')
                    : t(locale, 'practice.rule.explain')}
                </button>
                {isExplainOpen && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: 12,
                      background: T.surface2,
                      borderRadius: 12,
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      color: T.ink,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {explanation}
                  </div>
                )}
              </div>
            );
          })()}
        </Bubble>

        {/* Source prompt — always in the user's native language (Russian). */}
        {currentExercise.sentence !== '' && (
          <Bubble side="ai">
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 6 }}>
              {profile.targetLanguage.toUpperCase()} →
            </div>
            <div
              // Same typography as the rule body — regular weight + ink (not
              // ink2) so it reads as the prompt without standing out as bold.
              style={{
                fontFamily: T.fontBody,
                fontSize: 14,
                lineHeight: 1.5,
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
                {t(locale, 'practice.review.reviewed')}
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
                  {t(locale, 'practice.review.corrected')}
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
              {lastError ?? t(locale, 'practice.error.fallback')}
            </div>
            <Btn kind="primary" size="sm" onClick={handleRetry}>
              {t(locale, 'practice.cta.retry')}
            </Btn>
          </Bubble>
        )}
      </div>

      {phase === 'review' ? (
        <NextDock onNext={handleNext} label={t(locale, 'practice.cta.next')} />
      ) : (
        <InputDock
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={handleSubmit}
          placeholder={placeholder}
          cta={t(locale, 'practice.cta.check')}
          disabled={phase === 'awaiting'}
        />
      )}
    </div>
  );
}

// Replaces the InputDock in the review phase: a single full-width "Next
// exercise" CTA at the same vertical position. Avoids showing a dead input
// field when the AI has already corrected the user's answer.
function NextDock({ onNext, label }: { onNext: () => void; label: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        padding: '8px 14px 8px',
        background: `linear-gradient(to top, ${T.bg} 70%, transparent)`,
        zIndex: 25,
      }}
    >
      <Btn kind="accent" size="lg" full icon={<Icon.Arrow s={16} />} onClick={onNext}>
        {label}
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
