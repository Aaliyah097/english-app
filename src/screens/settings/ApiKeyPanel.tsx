import { useState } from 'react';
import { getApiKey, setApiKey } from '../../storage';
import { useStorageSnapshot } from '../../storage/useStorageSnapshot';
import { theme as T } from '../../theme';
import { Btn } from '../../ui';

function maskKey(key: string): string {
  const last4 = key.slice(-4);
  return `••••••••··${last4}`;
}

export function ApiKeyPanel() {
  const storedKey = useStorageSnapshot(getApiKey);
  const [draft, setDraft] = useState('');

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed === '') return;
    setApiKey(trimmed);
    setDraft('');
  };

  const handleClear = () => {
    const ok = window.confirm(
      'Remove your API key from this device? You can paste it again any time.',
    );
    if (!ok) return;
    setApiKey(null);
  };

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
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, color: T.muted }}>Status</div>
        <div
          style={{
            fontFamily: T.fontMono,
            fontSize: 13,
            color: storedKey ? T.ink : T.muted,
          }}
          data-testid="api-key-status"
        >
          {storedKey ? maskKey(storedKey) : 'Not set'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="password"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Paste your API key"
          aria-label="API key"
          style={{
            flex: 1,
            height: 42,
            padding: '0 14px',
            borderRadius: 21,
            border: `0.5px solid ${T.border}`,
            background: T.bg,
            color: T.ink,
            fontFamily: T.fontMono,
            fontSize: 13,
            outline: 'none',
          }}
        />
        <Btn kind="primary" onClick={handleSave} disabled={draft.trim() === ''}>
          Save
        </Btn>
      </div>

      {storedKey && (
        <div>
          <Btn kind="secondary" size="sm" onClick={handleClear}>
            Clear key
          </Btn>
        </div>
      )}

      <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
        Your DeepSeek API key is stored only on this device. Calls go directly to
        api.deepseek.com from your browser. We never see it. Get a key at{' '}
        <a
          href="https://platform.deepseek.com"
          target="_blank"
          rel="noreferrer"
          style={{ color: T.accent, textDecoration: 'underline' }}
        >
          platform.deepseek.com
        </a>
        .
      </div>
    </div>
  );
}
