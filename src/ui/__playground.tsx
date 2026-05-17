import { useState } from 'react';
import { theme as T } from '../theme';
import {
  Btn,
  Bubble,
  BottomNav,
  Chip,
  Icon,
  InputDock,
  SectionTitle,
  Shell,
  TopBar,
  TypingDot,
  type ScreenId,
} from './index';

// Dev-only visual sanity check. Mounted by App.tsx when import.meta.env.DEV.
// Renders every primitive at least once so we can spot drift from the mockup.

export function Playground() {
  const [tab, setTab] = useState<ScreenId>('practice');
  const [text, setText] = useState('');

  return (
    <Shell
      header={
        <TopBar
          title="Design playground"
          sub="Dev only — every primitive rendered once."
          left={<Icon.Left s={18} />}
          right={<Icon.Cog s={18} />}
        />
      }
      footer={<BottomNav active={tab} onChange={setTab} />}
    >
      <SectionTitle>Chips</SectionTitle>
      <div style={row}>
        <Chip>neutral</Chip>
        <Chip tone="accent">accent</Chip>
        <Chip tone="good">good</Chip>
        <Chip tone="warn">warn</Chip>
        <Chip tone="ink">ink</Chip>
        <Chip size="sm">sm</Chip>
      </div>

      <SectionTitle>Buttons</SectionTitle>
      <div style={row}>
        <Btn>primary</Btn>
        <Btn kind="accent">accent</Btn>
        <Btn kind="secondary">secondary</Btn>
        <Btn kind="ghost">ghost</Btn>
      </div>
      <div style={{ ...row, marginTop: 10 }}>
        <Btn size="sm">sm</Btn>
        <Btn size="md">md</Btn>
        <Btn size="lg" icon={<Icon.Arrow s={16} />}>
          lg w/ icon
        </Btn>
      </div>

      <SectionTitle>Bubbles</SectionTitle>
      <div
        style={{
          padding: '0 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <Bubble side="ai">A short AI message bubble.</Bubble>
        <Bubble side="user">A user reply bubble.</Bubble>
        <TypingDot />
      </div>

      <SectionTitle>Icons</SectionTitle>
      <div style={{ ...row, color: T.ink2 }}>
        {Object.entries(Icon).map(([name, I]) => (
          <div
            key={name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              minWidth: 60,
              fontFamily: T.fontMono,
              fontSize: 10,
              color: T.muted,
            }}
          >
            <I s={20} />
            {name}
          </div>
        ))}
      </div>

      <div style={{ height: 120 }} />

      <InputDock
        value={text}
        onChange={setText}
        onSubmit={() => setText('')}
        placeholder="Type something…"
        cta="Send"
      />
    </Shell>
  );
}

const row = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 10,
  padding: '0 22px',
  alignItems: 'center',
};
