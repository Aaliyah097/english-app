import { SectionTitle, Shell, TopBar } from '../../ui';
import { DataPanel } from './DataPanel';
import { EditProfilePanel } from './EditProfilePanel';

export function SettingsScreen() {
  return (
    <Shell header={<TopBar title="Settings" />}>
      <SectionTitle>Edit profile</SectionTitle>
      <EditProfilePanel />

      <SectionTitle>Your data</SectionTitle>
      <DataPanel />
    </Shell>
  );
}
