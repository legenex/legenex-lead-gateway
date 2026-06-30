import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import SettingsLeadByte from '@/components/settings/SettingsLeadByte';

export default function Deliveries() {
  return (
    <div>
      <PageHeader title="Deliveries" subtitle="Lead destination configuration and payload templates" />
      <div className="space-y-8">
        <SettingsLeadByte />
      </div>
    </div>
  );
}