import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import SettingsVerticals from '@/components/settings/SettingsVerticals';
import SettingsSuppliers from '@/components/settings/SettingsSuppliers';
import SettingsBrands from '@/components/settings/SettingsBrands';

export default function Campaigns() {
  return (
    <div>
      <PageHeader title="Campaigns" subtitle="Manage verticals, suppliers, and brands for lead distribution" />
      <Tabs defaultValue="verticals">
        <TabsList>
          <TabsTrigger value="verticals">Verticals</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
        </TabsList>
        <TabsContent value="verticals" className="mt-4"><SettingsVerticals /></TabsContent>
        <TabsContent value="suppliers" className="mt-4"><SettingsSuppliers /></TabsContent>
        <TabsContent value="brands" className="mt-4"><SettingsBrands /></TabsContent>
      </Tabs>
    </div>
  );
}