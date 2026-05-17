import { theme as T } from '../../theme';
import { Icon, SectionTitle, Shell, TopBar } from '../../ui';
import { t } from '../../i18n';
import { useLocale } from '../../i18n/useLocale';
import { EditProfilePanel } from './EditProfilePanel';

type Props = {
  onBack?: (() => void) | undefined;
};

export function SettingsScreen({ onBack }: Props) {
  const locale = useLocale();
  return (
    <Shell
      header={
        <TopBar
          title={t(locale, 'settings.title')}
          left={
            onBack ? (
              <button
                type="button"
                aria-label={t(locale, 'settings.back.aria')}
                onClick={onBack}
                style={{
                  background: T.surface,
                  border: `0.5px solid ${T.border}`,
                  borderRadius: 999,
                  width: 30,
                  height: 30,
                  display: 'grid',
                  placeItems: 'center',
                  color: T.ink2,
                  cursor: 'pointer',
                }}
              >
                <Icon.Left s={15} />
              </button>
            ) : undefined
          }
        />
      }
    >
      <SectionTitle>{t(locale, 'settings.section.editProfile')}</SectionTitle>
      <EditProfilePanel />
    </Shell>
  );
}
