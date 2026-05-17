import { useState } from 'react';
import { BottomNav, type ScreenId } from './ui';
import {
  OnboardingScreen,
  PracticeScreen,
  ProgressScreen,
  SettingsScreen,
} from './screens';
import { getUserProfile } from './storage';
import { useStorageSnapshot } from './storage/useStorageSnapshot';

// useStorageSnapshot is backed by useSyncExternalStore, which requires the
// selector to return a stable reference between renders unless the data has
// actually changed. `getUserProfile` deserialises fresh on each call, so we
// project it down to a primitive (presence) — that's all the App shell needs
// to gate onboarding vs. the main app.
const hasProfileSelector = () => getUserProfile() != null;

export function App() {
  // Re-renders on every storage notification (profile, checkpoint, api key, etc.).
  const hasProfile = useStorageSnapshot(hasProfileSelector);
  const [active, setActive] = useState<ScreenId>('practice');

  if (!hasProfile) {
    // S06 owns the real onboarding flow and calls setUserProfile itself, which
    // notifies subscribers and re-renders us into the main app.
    return <OnboardingScreen onComplete={() => {}} />;
  }

  return (
    <>
      {active === 'practice' && (
        <PracticeScreen onMenu={() => setActive('settings')} />
      )}
      {active === 'progress' && (
        <ProgressScreen onGoToPractice={() => setActive('practice')} />
      )}
      {active === 'settings' && <SettingsScreen />}
      <BottomNav active={active} onChange={setActive} />
    </>
  );
}
