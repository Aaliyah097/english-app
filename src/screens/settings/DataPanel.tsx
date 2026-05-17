import { useRef, useState } from 'react';
import { exportAll, importAll, resetAll } from '../../storage';
import { theme as T } from '../../theme';
import { Btn } from '../../ui';

type Notice =
  | { kind: 'idle' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

function todayStamp(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function DataPanel() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [notice, setNotice] = useState<Notice>({ kind: 'idle' });

  const handleExport = () => {
    const json = exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `englishly-export-${todayStamp()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const readFileText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error ?? new Error('File read failed'));
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') {
          reject(new Error('Unexpected file contents'));
          return;
        }
        resolve(result);
      };
      reader.readAsText(file);
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Clear the input so re-importing the same file still triggers change.
    e.target.value = '';
    if (!file) return;
    try {
      const text = await readFileText(file);
      importAll(text);
      setNotice({ kind: 'success', message: 'Import successful.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import failed.';
      setNotice({ kind: 'error', message });
    }
  };

  const handleReset = () => {
    const ok = window.confirm(
      'This will erase your profile, checkpoint, and API key on this device. Continue?',
    );
    if (!ok) return;
    resetAll();
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Btn kind="secondary" onClick={handleExport}>
          Export
        </Btn>
        <Btn kind="secondary" onClick={handleImportClick}>
          Import
        </Btn>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-label="Import file"
          data-testid="import-file-input"
        />
      </div>

      <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
        Export bundles your profile and progress as a JSON file. Import replaces
        them. Neither touches your API key.
      </div>

      {notice.kind === 'success' && (
        <div
          role="status"
          style={{
            fontSize: 12.5,
            color: T.good,
            background: T.goodSoft,
            border: `0.5px solid ${T.good}`,
            borderRadius: 10,
            padding: '8px 12px',
          }}
        >
          {notice.message}
        </div>
      )}

      {notice.kind === 'error' && (
        <div
          role="alert"
          style={{
            fontSize: 12.5,
            color: T.accentInk,
            background: T.accentBg,
            border: `0.5px solid ${T.accent}`,
            borderRadius: 10,
            padding: '8px 12px',
          }}
        >
          {notice.message}
        </div>
      )}

      <div
        style={{
          marginTop: 4,
          paddingTop: 12,
          borderTop: `0.5px dashed ${T.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
          Reset removes every trace of this app from this device — profile,
          progress, and API key.
        </div>
        <div>
          <Btn kind="secondary" onClick={handleReset} style={{ color: T.accentInk }}>
            Reset all data
          </Btn>
        </div>
      </div>
    </div>
  );
}
