import { theme as T } from '../../theme';
import { Icon, SectionTitle, Shell, TopBar } from '../../ui';
import { DataPanel } from './DataPanel';
import { EditProfilePanel } from './EditProfilePanel';

type Props = {
  onBack?: (() => void) | undefined;
};

export function SettingsScreen({ onBack }: Props) {
  return (
    <Shell
      header={
        <TopBar
          title="Settings"
          left={
            onBack ? (
              <button
                type="button"
                aria-label="Back"
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
      <SectionTitle>Edit profile</SectionTitle>
      <EditProfilePanel />

      <SectionTitle>Your data</SectionTitle>
      <DataPanel />
    </Shell>
  );
}
