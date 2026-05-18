import { theme as T } from '../../theme';
import { Icon } from '../../ui';
import { t } from '../../i18n';
import { useLocale } from '../../i18n/useLocale';
import type { LearningCheckpoint } from '../../types';
import { topicLabelKeyFor } from './grammarPath';

type Props = {
  checkpoint: LearningCheckpoint;
  onMenu?: (() => void) | undefined;
  onTopicClick?: (() => void) | undefined;
  isPickerOpen?: boolean;
};

// Top bar showing the current grammar topic (as a clickable button that
// opens the TopicPicker overlay) + a cog that opens Settings.
export function TopicBar({ checkpoint, onMenu, onTopicClick, isPickerOpen }: Props) {
  const locale = useLocale();
  const topic = checkpoint.currentLearningFocus.grammarTopic;
  const topicKey = topicLabelKeyFor(topic);
  const topicLabel = topicKey ? t(locale, topicKey) : topic;

  return (
    <div
      style={{
        padding: '56px 18px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}
    >
      <button
        type="button"
        onClick={onTopicClick}
        aria-expanded={isPickerOpen ?? false}
        aria-label={t(locale, 'practice.topicSwitch.aria')}
        style={{
          background: isPickerOpen ? T.surface2 : T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: 999,
          padding: '6px 12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          color: T.ink,
          cursor: 'pointer',
          fontFamily: T.fontBody,
        }}
      >
        <Icon.Sparkle s={14} />
        <div style={{ fontSize: 13, fontWeight: 500 }}>{topicLabel}</div>
        <Icon.Down s={14} />
      </button>

      <button
        type="button"
        aria-label={t(locale, 'practice.settings.aria')}
        onClick={onMenu}
        style={{
          width: 30,
          height: 30,
          borderRadius: 999,
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          color: T.ink2,
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Icon.Cog s={15} />
      </button>
    </div>
  );
}
