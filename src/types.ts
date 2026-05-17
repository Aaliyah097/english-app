// Inferred TS types. The schemas in `./schemas.ts` are the contract;
// types here are just `z.infer` aliases — never hand-write a duplicate.

import type { z } from 'zod';
import type {
  exerciseSchema,
  learningCheckpointSchema,
  levelSchema,
  mistakeSchema,
  partialLearningCheckpointSchema,
  tutorResponseSchema,
  userProfileSchema,
} from './schemas';

export type Level = z.infer<typeof levelSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type Mistake = z.infer<typeof mistakeSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type LearningCheckpoint = z.infer<typeof learningCheckpointSchema>;
export type PartialLearningCheckpoint = z.infer<typeof partialLearningCheckpointSchema>;
export type TutorResponse = z.infer<typeof tutorResponseSchema>;
