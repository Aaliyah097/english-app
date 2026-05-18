import { useEffect, useState } from 'react';
import {
  getCheckpoint,
  getUserProfile,
  mergeCheckpoint,
  setUserProfile,
  subscribe,
} from '../../storage';
import { theme as T } from '../../theme';
import type { Level, UserProfile } from '../../types';
import { Icon } from '../../ui';
import { t } from '../../i18n';
import { useLocale } from '../../i18n/useLocale';
import { ALL_INTERESTS, LEVELS, TARGET_LANGUAGES } from '../onboarding/options';

function useProfile(): UserProfile | null {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((n) => n + 1)), []);
  return getUserProfile();
}

function PanelCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        margin: '0 22px',
        background: T.surface,
        border: `0.5px solid ${T.border}`,
        borderRadius: T.r2,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {children}
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: T.fontMono,
        fontSize: 10.5,
        color: T.muted,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </div>
  );
}

export function EditProfilePanel() {
  const profile = useProfile();
  const locale = useLocale();
  if (!profile) return null;

  const updateProfile = (patch: Partial<UserProfile>) => {
    setUserProfile({ ...profile, ...patch });
  };

  const toggleInterest = (interest: string) => {
    const next = profile.interests.includes(interest)
      ? profile.interests.filter((x) => x !== interest)
      : [...profile.interests, interest];
    updateProfile({ interests: next });
  };

  const setTargetLanguage = (code: string) => {
    if (code === profile.targetLanguage) return;
    updateProfile({ targetLanguage: code });
    if (getCheckpoint()) {
      // Language-bound checkpoint fields are stale after the switch — let
      // the AI regenerate them in the new target language.
      mergeCheckpoint({
        currentLearningFocus: { rule: '' },
        lastCheckpointSummary: '',
      });
    }
  };
  const setLevel = (level: Level) => updateProfile({ level });

  return (
    <PanelCard>
      <div>
        <SubLabel>{t(locale, 'settings.label.learningLanguage')}</SubLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {TARGET_LANGUAGES.map((l) => {
            const on = profile.targetLanguage === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => setTargetLanguage(l.code)}
                aria-pressed={on}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: on ? T.ink : T.surface,
                  color: on ? T.bg : T.ink,
                  border: `0.5px solid ${on ? T.ink : T.border}`,
                  borderRadius: 16,
                  padding: '12px 16px',
                  fontFamily: T.fontBody,
                  fontSize: 14.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span>{l.name}</span>
                  <span style={{ fontSize: 12, opacity: 0.6, fontWeight: 400 }}>{l.en}</span>
                </span>
                {on && <Icon.Check s={16} />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SubLabel>{t(locale, 'settings.label.interests')}</SubLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {ALL_INTERESTS.map(({ id, labelKey }) => {
            const on = profile.interests.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleInterest(id)}
                aria-pressed={on}
                style={{
                  border: `0.5px solid ${on ? T.ink : T.border}`,
                  background: on ? T.ink : T.surface,
                  color: on ? T.bg : T.ink,
                  borderRadius: 999,
                  padding: '8px 14px',
                  fontFamily: T.fontBody,
                  fontSize: 13.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {on && <Icon.Check s={12} />}
                {t(locale, labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SubLabel>{t(locale, 'settings.label.level')}</SubLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {LEVELS.map((l) => {
            const on = profile.level === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => setLevel(l.id)}
                aria-pressed={on}
                style={{
                  background: on ? T.ink : T.surface,
                  color: on ? T.bg : T.ink,
                  border: `0.5px solid ${on ? T.ink : T.border}`,
                  borderRadius: 16,
                  padding: '12px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: T.fontBody,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: 14.5, fontWeight: 500 }}>{t(locale, l.nameKey)}</div>
                  {on && <Icon.Check s={14} />}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 3, lineHeight: 1.35 }}>
                  {t(locale, l.blurbKey)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </PanelCard>
  );
}
