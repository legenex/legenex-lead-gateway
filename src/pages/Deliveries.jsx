import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import SettingsLeadByte from '@/components/settings/SettingsLeadByte';

export default function Deliveries() {
  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="shrink-0">
        <PageHeader title="Deliveries" subtitle="Lead destination configuration and payload templates" />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto space-y-8">
        <SettingsLeadByte />
      </div>
    </div>
  );
}