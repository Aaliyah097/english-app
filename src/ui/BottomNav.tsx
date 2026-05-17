import { theme as T } from '../theme';
import { Icon, type IconFn } from './Icon';

// v1 ships three tabs only. The mockup's "Vocabulary" tab is scoped out of
// MVP v1 — see docs/PLAN.md §7 and docs/stories/01-design-system.md.
export type ScreenId = 'practice' | 'progress' | 'settings';

type Tab = { id: ScreenId; label: string; icon: IconFn };

const TABS: ReadonlyArray<Tab> = [
  { id: 'practice', label: 'Practice', icon: Icon.Chat },
  { id: 'progress', label: 'Progress', icon: Icon.Chart },
  { id: 'settings', label: 'Settings', icon: Icon.Cog },
];

type Props = {
  active: ScreenId;
  onChange: (id: ScreenId) => void;
};

export function BottomNav({ active, onChange }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 30,
        paddingTop: 8,
        background: `linear-gradient(to top, ${T.bg} 60%, transparent)`,
        zIndex: 30,
      }}
    >
      <div
        style={{
          margin: '0 14px',
          height: 60,
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: 24,
          display: 'flex',
          alignItems: 'stretch',
          boxShadow:
            '0 8px 24px rgba(40,30,20,0.06), 0 1px 0 rgba(255,255,255,0.6) inset',
        }}
      >
        {TABS.map((tab) => {
          const isOn = tab.id === active;
          const I = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              style={{
                flex: 1,
                border: 0,
                background: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                cursor: 'pointer',
                color: isOn ? T.accent : T.muted,
                fontFamily: T.fontBody,
                fontSize: 10.5,
                fontWeight: isOn ? 500 : 400,
                letterSpacing: 0.1,
                padding: 0,
              }}
            >
              <I s={20} />
              <div>{tab.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
