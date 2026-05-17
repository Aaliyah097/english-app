import { useState } from 'react';
import { learningCheckpointSchema, userProfileSchema } from '../../schemas';
import { setCheckpoint, setUserProfile } from '../../storage';
import { theme as T } from '../../theme';
import type { LearningCheckpoint, Level, UserProfile } from '../../types';
import { Btn, Icon } from '../../ui';
import { StepGoal } from './StepGoal';
import { StepInterests } from './StepInterests';
import { StepLanguages } from './StepLanguages';
import { StepLevel } from './StepLevel';
import { StepWelcome } from './StepWelcome';

type Props = {
  onComplete?: () => void;
};

type Draft = {
  nativeLanguage: string;
  level: Level;
  interests: string[];
  goal: string;
};

const DEFAULT_DRAFT: Draft = {
  nativeLanguage: 'ru',
  level: 'intermediate',
  interests: ['Software dev', 'Architecture'],
  goal: 'Work communication',
};

const TOTAL_STEPS = 5;

export function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const advance = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }
    // Final step — persist profile and seeded checkpoint.
    const profile: UserProfile = userProfileSchema.parse({
      nativeLanguage: draft.nativeLanguage,
      targetLanguage: 'en',
      level: draft.level,
      interests: draft.interests,
      goal: draft.goal,
      preferredPracticeMode: 'translation',
    });

    const checkpoint: LearningCheckpoint = learningCheckpointSchema.parse({
      userProfile: profile,
      currentLearningFocus: { grammarTopic: 'Present Simple', difficulty: 2 },
      recentMistakes: [],
      completedTopics: [],
      currentTopicProgress: {
        topic: 'Present Simple',
        completedExercises: 0,
        knownWeaknesses: [],
      },
      lastCheckpointSummary: '',
      mistakesByCategory: {},
    });

    setUserProfile(profile);
    setCheckpoint(checkpoint);
    onComplete?.();
  };

  const toggleInterest = (interest: string) => {
    setDraft((d) => ({
      ...d,
      interests: d.interests.includes(interest)
        ? d.interests.filter((x) => x !== interest)
        : [...d.interests, interest],
    }));
  };

  const ctaLabel =
    step === 0 ? 'Begin' : step === TOTAL_STEPS - 1 ? 'Start practising' : 'Continue';

  return (
    <div
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
      {/* Top — back + step indicator */}
      <div
        style={{
          padding: '56px 22px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          style={{
            background: 'transparent',
            border: 0,
            color: T.muted,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: step === 0 ? 'default' : 'pointer',
            padding: '8px 4px',
            marginLeft: -4,
            opacity: step === 0 ? 0 : 1,
            visibility: step === 0 ? 'hidden' : 'visible',
          }}
        >
          <Icon.Left s={18} />
          <span style={{ fontSize: 14 }}>Back</span>
        </button>
        <div style={{ display: 'flex', gap: 5 }} aria-label="Step indicator">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 22 : 8,
                height: 4,
                borderRadius: 2,
                background: i <= step ? T.ink : T.border,
                transition: 'all .25s',
              }}
            />
          ))}
        </div>
        <div style={{ width: 50 }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 22px 24px' }}>
        {step === 0 && <StepWelcome />}
        {step === 1 && (
          <StepLanguages
            native={draft.nativeLanguage}
            onChange={(code) => setDraft((d) => ({ ...d, nativeLanguage: code }))}
          />
        )}
        {step === 2 && (
          <StepLevel
            level={draft.level}
            onChange={(level) => setDraft((d) => ({ ...d, level }))}
          />
        )}
        {step === 3 && (
          <StepInterests selected={draft.interests} onToggle={toggleInterest} />
        )}
        {step === 4 && (
          <StepGoal
            goal={draft.goal}
            onChange={(label) => setDraft((d) => ({ ...d, goal: label }))}
          />
        )}
      </div>

      <div style={{ padding: '12px 18px 36px' }}>
        <Btn
          kind={step === 0 ? 'primary' : 'accent'}
          size="lg"
          full
          onClick={advance}
          icon={step === TOTAL_STEPS - 1 ? null : <Icon.Arrow s={16} />}
        >
          {ctaLabel}
        </Btn>
      </div>
    </div>
  );
}
