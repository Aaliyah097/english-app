// Screen barrel. The real OnboardingScreen ships in S06; Practice (S07),
// Progress (S10), and Settings (S11) are still placeholders until their
// stories land and we flip each export over to the real implementation.

import { createElement } from 'react';
import { Placeholder } from './Placeholder';

type ScreenProps = { onComplete?: () => void };

function makePlaceholder(name: string) {
  const Stub = (_props: ScreenProps) => createElement(Placeholder, { name });
  Stub.displayName = `${name}Screen`;
  return Stub;
}

export { OnboardingScreen } from './onboarding/OnboardingScreen';
export const PracticeScreen = makePlaceholder('Practice');
export const ProgressScreen = makePlaceholder('Progress');
export { SettingsScreen } from './settings/SettingsScreen';
