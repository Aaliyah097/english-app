import { useState } from 'react';
import { OnboardingScreen, PracticeScreen, SettingsScreen } from './screens';
import { getUserProfile } from './storage';
import { useStorageSnapshot } from './storage/useStorageSnapshot';

// useStorageSnapshot is backed by useSyncExternalStore, which requires the
// selector to return a stable reference between renders unless the data has
// actually changed. `getUserProfile` deserialises fresh on each call, so we
// project it down to a primitive (presence) — that's all the App shell needs
// to gate onboarding vs. the main app.
const hasProfileSelector = () => getUserProfile() != null;

export function App() {
  const hasProfile = useStorageSnapshot(hasProfileSelector);
  const [showSettings, setShowSettings] = useState(false);

  if (!hasProfile) {
    return <OnboardingScreen onComplete={() => {}} />;
  }
  if (showSettings) {
    return <SettingsScreen onBack={() => setShowSettings(false)} />;
  }
  return <PracticeScreen onMenu={() => setShowSettings(true)} />;
}
