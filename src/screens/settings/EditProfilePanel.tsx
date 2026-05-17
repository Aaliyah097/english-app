import { getUserProfile, setUserProfile } from '../../storage';
import { useStorageSnapshot } from '../../storage/useStorageSnapshot';
import { theme as T } from '../../theme';
import type { Level, UserProfile } from '../../types';
import { Icon } from '../../ui';
import { ALL_INTERESTS, GOALS, LEVELS } from '../onboarding/options';

// useSyncExternalStore requires snapshot identity to be stable across reads
// unless the underlying data actually changed. getUserProfile() deserialises
// a fresh object each call, so we cache by serialised value and return the
// same reference until the data really differs.
let cachedProfileJson: string | null = null;
let cachedProfile: UserProfile | null = null;
const stableProfileSelector = (): UserProfile | null => {
  const next = getUserProfile();
  const nextJson = next === null ? null : JSON.stringify(next);
  if (nextJson === cachedProfileJson) return cachedProfile;
  cachedProfileJson = nextJson;
  cachedProfile = next;
  return cachedProfile;
};

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
  const profile = useStorageSnapshot(stableProfileSelector);
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

  const setLevel = (level: Level) => updateProfile({ level });
  const setGoal = (goal: string) => updateProfile({ goal });

  return (
    <PanelCard>
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
