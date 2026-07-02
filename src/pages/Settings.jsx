import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import SettingsUsers from '@/components/settings/SettingsUsers';
import SettingsApiKeys from '@/components/settings/SettingsApiKeys';
import SettingsCustomFields from '@/components/settings/SettingsCustomFields';
import SettingsGeneral from '@/components/settings/SettingsGeneral';
import SettingsIgnoreList from '@/components/settings/SettingsIgnoreList';
import SettingsIntegrations from '@/components/settings/SettingsIntegrations';
import SettingsNotifications from '@/components/settings/SettingsNotifications';
import ErrorLogs from '@/pages/ErrorLogs';

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'general';

  const setTab = (v) => {
    setSearchParams({ tab: v }, { replace: true });
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="shrink-0">
        <PageHeader title="Settings" subtitle="General settings, users, API keys, custom fields, error logs, and adaptive fields" />
      </div>
      <Tabs value={tab} onValueChange={setTab} className="flex-1 min-h-0 flex flex-col">
        <TabsList className="bg-muted mb-4 shrink-0">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="apikeys">API Keys</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
          <TabsTrigger value="adaptive">Adaptive Fields</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="flex-1 min-h-0 overflow-y-auto"><SettingsGeneral /></TabsContent>
        <TabsContent value="users" className="flex-1 min-h-0 overflow-y-auto"><SettingsUsers /></TabsContent>
        <TabsContent value="apikeys" className="flex-1 min-h-0 overflow-y-auto"><SettingsApiKeys /></TabsContent>
        <TabsContent value="integrations" className="flex-1 min-h-0 overflow-y-auto"><SettingsIntegrations /></TabsContent>
        <TabsContent value="notifications" className="flex-1 min-h-0 overflow-y-auto"><SettingsNotifications /></TabsContent>
        <TabsContent value="fields" className="flex-1 min-h-0 overflow-y-auto"><SettingsCustomFields /></TabsContent>
        <TabsContent value="errors" className="flex-1 min-h-0 overflow-y-auto"><ErrorLogs embedded /></TabsContent>
        <TabsContent value="adaptive" className="flex-1 min-h-0 overflow-y-auto"><SettingsIgnoreList /></TabsContent>
      </Tabs>
    </div>
  );
}