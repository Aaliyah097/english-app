// Screen barrel. Sibling stories (S06 onboarding, S07 practice, S10 progress,
// S11 settings) will land their real implementations as separate modules and
// flip these exports over. Until then, every screen is aliased to the
// Placeholder stand-in so the App shell's routing is fully testable.

import { createElement } from 'react';
import { Placeholder } from './Placeholder';

type ScreenProps = { onComplete?: () => void };

function makePlaceholder(name: string) {
  const Stub = (_props: ScreenProps) => createElement(Placeholder, { name });
  Stub.displayName = `${name}Screen`;
  return Stub;
}

export const OnboardingScreen = makePlaceholder('Onboarding');
export const PracticeScreen = makePlaceholder('Practice');
export const ProgressScreen = makePlaceholder('Progress');
export const SettingsScreen = makePlaceholder('Settings');
