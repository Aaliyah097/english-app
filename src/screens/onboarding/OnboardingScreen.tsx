import { useState } from 'react';
import { learningCheckpointSchema, userProfileSchema } from '../../schemas';
import { setCheckpoint } from '../../storage';
import { theme as T } from '../../theme';
import type { LearningCheckpoint, Level, UserProfile } from '../../types';
import { Btn, Icon } from '../../ui';
import { t } from '../../i18n';
import { useLocale } from '../../i18n/useLocale';
import { StepInterests } from './StepInterests';
import { StepLanguages } from './StepLanguages';
import { StepLevel } from './StepLevel';
import { StepWelcome } from './StepWelcome';
import { NATIVE_LANGUAGE_CODE } from './options';

type Props = {
  onComplete?: () => void;
};

type Draft = {
  targetLanguage: string;
  level: Level;
  interests: string[];
};

const DEFAULT_DRAFT: Draft = {
  targetLanguage: 'en',
  level: 'intermediate',
  interests: ['Software dev', 'Architecture'],
};

const TOTAL_STEPS = 4;

export function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);
  const locale = useLocale();

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const advance = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }
    // Final step — persist profile and seeded checkpoint.
    const profile: UserProfile = userProfileSchema.parse({
      nativeLanguage: NATIVE_LANGUAGE_CODE,
      targetLanguage: draft.targetLanguage,
      level: draft.level,
      interests: draft.interests,
      preferredPracticeMode: 'translation',
    });

    const checkpoint: LearningCheckpoint = learningCheckpointSchema.parse({
      userProfile: profile,
      currentLearningFocus: {
        grammarTopic: 'Present Simple',
        difficulty: 2,
        // Leave the rule empty — the AI fills it on the first turn in the
        // user's target language. The default rule (per i18n) is the fallback
        // until then.
        rule: '',
      },
      completedTopics: [],
      lastCheckpointSummary: '',
    });

    // Single write — the checkpoint carries the profile as a nested field.
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
    step === 0
      ? t(locale, 'onboarding.button.begin')
      : step === TOTAL_STEPS - 1
        ? t(locale, 'onboarding.button.startPractising')
        : t(locale, 'onboarding.button.continue');

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
          aria-label={t(locale, 'onboarding.button.back')}
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
          <span style={{ fontSize: 14 }}>{t(locale, 'onboarding.button.back')}</span>
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
            target={draft.targetLanguage}
            onChangeTarget={(code) => setDraft((d) => ({ ...d, targetLanguage: code }))}
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
