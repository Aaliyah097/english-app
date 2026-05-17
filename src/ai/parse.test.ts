import { describe, expect, it } from 'vitest';
import { parseTutorResponse } from './parse';

const validJson = JSON.stringify({
  messageToUser: 'Almost — verb agreement.',
  correctedAnswer: 'This service reads messages from Kafka.',
  updatedCheckpoint: {},
  nextExercise: {
    sourceLanguage: 'ru',
    targetLanguage: 'en',
    sentence: 'Я работаю удалённо.',
    grammarTopic: 'Present Simple',
    difficulty: 1,
  },
});

describe('parseTutorResponse', () => {
  it('parses bare JSON', () => {
    const result = parseTutorResponse(validJson);
    expect(result.ok).toBe(true);
  });

  it('parses JSON wrapped in a ```json fence', () => {
    const result = parseTutorResponse('```json\n' + validJson + '\n```');
    expect(result.ok).toBe(true);
  });

  it('parses JSON wrapped in stray prose', () => {
    const result = parseTutorResponse(
      'Sure! Here is the response:\n' + validJson + '\nThanks!',
    );
    expect(result.ok).toBe(true);
  });

  it('rejects unparseable input', () => {
    const result = parseTutorResponse('not a JSON object at all');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/JSON/);
  });

  it('rejects valid JSON that does not match the schema', () => {
    const result = parseTutorResponse(
      JSON.stringify({ messageToUser: 'hi', updatedCheckpoint: {} }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/schema/);
  });
});
