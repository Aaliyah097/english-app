import { SectionTitle, Shell, TopBar } from '../../ui';
import { ApiKeyPanel } from './ApiKeyPanel';
import { DataPanel } from './DataPanel';
import { EditProfilePanel } from './EditProfilePanel';

export function SettingsScreen() {
  return (
    <Shell header={<TopBar title="Settings" />}>
      <SectionTitle>API key</SectionTitle>
      <ApiKeyPanel />

      <SectionTitle>Edit profile</SectionTitle>
      <EditProfilePanel />

      <SectionTitle>Your data</SectionTitle>
      <DataPanel />
    </Shell>
  );
}
