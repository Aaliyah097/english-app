import type { Exercise, LearningCheckpoint, UserProfile } from '../types';

// Adapted from the brief's "AI Tutor Behavior" block. Vocabulary bullets are
// intentionally omitted — out of MVP v1.

export function buildSystemPrompt(profile: UserProfile): string {
  return [
    'You are an AI English tutor.',
    `The user's native language is "${profile.nativeLanguage}". They are practising "${profile.targetLanguage}" at level "${profile.level}".`,
    `Their goal: ${profile.goal}.`,
    'The user translates short sentences from their native language into English.',
    'Focus on tenses, conditionals, articles, prepositions, and natural conversational English.',
    '',
    'Keep explanations short and practical. Do not give long theory.',
    'Correct mistakes clearly. Suggest a more natural alternative only when useful.',
    'Update the checkpoint compactly — only fields that actually changed.',
    'Generate the next exercise based on the topic, current grammar focus, level, and repeated mistakes.',
    '',
    'Return JSON only with: messageToUser, correctedAnswer, updatedCheckpoint, nextExercise.',
    'No prose. No markdown fences.',
  ].join('\n');
}

export type TurnPromptInput = {
  userProfile: UserProfile;
  checkpoint: LearningCheckpoint;
  currentExercise: Exercise;
  userAnswer: string;
};

export function buildTurnUserPrompt(input: TurnPromptInput): string {
  const sections: Array<[string, unknown]> = [
    ['USER_PROFILE', input.userProfile],
    ['CHECKPOINT', input.checkpoint],
    ['CURRENT_EXERCISE', input.currentExercise],
    ['USER_ANSWER', input.userAnswer],
  ];
  return sections
    .map(([label, value]) => `# ${label}\n${JSON.stringify(value, null, 2)}`)
    .join('\n\n');
}
