// AI provider seam. The rest of the app does not know that DeepSeek is the
// provider — see docs/PLAN.md §1 (why BYOK from the browser) and §2 (why we
// reach DeepSeek through the OpenAI SDK by overriding baseURL).
//
// The `dangerouslyAllowBrowser: true` flag is intentional: the API key is the
// user's own, stored only on their device, and never seen by us.

import OpenAI from 'openai';
import { getApiKey } from '../storage';

export const DEFAULT_MODEL = 'deepseek-chat';
export const PROVIDER_BASE_URL = 'https://api.deepseek.com/v1';

let cached: { key: string; client: OpenAI } | null = null;

export function getAiClient(): OpenAI | null {
  const key = getApiKey();
  if (!key) {
    cached = null;
    return null;
  }
  if (cached?.key === key) return cached.client;
  const client = new OpenAI({
    apiKey: key,
    baseURL: PROVIDER_BASE_URL,
    dangerouslyAllowBrowser: true,
  });
  cached = { key, client };
  return client;
}

// Test-only escape hatch: reset the memoised client so tests can swap keys.
export function __resetAiClientCache(): void {
  cached = null;
}
