import { useEffect, useState } from 'react';
import { getUserProfile, setUserProfile, subscribe } from '../../storage';
import { theme as T } from '../../theme';
import type { Level, UserProfile } from '../../types';
import { Icon } from '../../ui';
import { ALL_INTERESTS, GOALS, LEVELS, TARGET_LANGUAGES } from '../onboarding/options';

// Re-read on every storage notification. Same pattern as PracticeScreen —
// simpler than wrangling useSyncExternalStore + a stable selector, and
// reliable in practice because the profile object is small.
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

  const setTargetLanguage = (code: string) => updateProfile({ targetLanguage: code });
  const setLevel = (level: Level) => updateProfile({ level });
  const setGoal = (goal: string) => updateProfile({ goal });

  return (
    <PanelCard>
      <div>
        <SubLabel>Learning language</SubLabel>
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
        <SubLabel>Interests</SubLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {ALL_INTERESTS.map((t) => {
            const on = profile.interests.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleInterest(t)}
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
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SubLabel>Level</SubLabel>
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
                  <div style={{ fontSize: 14.5, fontWeight: 500 }}>{l.name}</div>
                  {on && <Icon.Check s={14} />}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 3, lineHeight: 1.35 }}>
                  {l.blurb}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SubLabel>Goal</SubLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {GOALS.map((g) => {
            const on = profile.goal === g.name;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setGoal(g.name)}
                aria-pressed={on}
                style={{
                  background: on ? T.ink : T.surface,
                  color: on ? T.bg : T.ink,
                  border: `0.5px solid ${on ? T.ink : T.border}`,
                  borderRadius: 14,
                  padding: '10px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{g.name}</div>
                  <div style={{ fontSize: 11.5, opacity: 0.65, marginTop: 2 }}>{g.blurb}</div>
                </div>
                {on && <Icon.Check s={14} />}
              </button>
            );
          })}
        </div>
      </div>
    </PanelCard>
  );
}
