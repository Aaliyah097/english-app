import type { KeyboardEvent } from 'react';
import { theme as T } from '../theme';
import { Icon } from './Icon';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  cta?: string;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
};

export function InputDock({
  value,
  onChange,
  onSubmit,
  placeholder,
  cta = 'Send',
  disabled = false,
  onFocus,
  onBlur,
}: Props) {
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled) onSubmit();
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        // Bottom dock with a small gap above the iOS home-indicator safe area.
        bottom: 30,
        left: 0,
        right: 0,
        padding: '8px 14px 8px',
        background: `linear-gradient(to top, ${T.bg} 70%, transparent)`,
        zIndex: 25,
      }}
    >
      <div
        style={{
          background: T.surface,
          border: `0.5px solid ${T.borderStrong}`,
          borderRadius: 22,
          padding: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 4px 14px rgba(40,30,20,0.04)',
        }}
      >
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Translation input"
          style={{
            flex: 1,
            border: 0,
            background: 'transparent',
            outline: 'none',
            fontFamily: T.fontBody,
            fontSize: 14,
            color: T.ink,
            padding: '8px 12px',
          }}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          style={{
            height: 36,
            padding: '0 14px',
            borderRadius: 18,
            background: T.ink,
            color: T.bg,
            border: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: T.fontBody,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {cta} <Icon.Send s={14} />
        </button>
      </div>
    </div>
  );
}
