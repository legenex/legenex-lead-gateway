import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { integrationStatus as fetchIntegrationStatus } from '@/functions/integrationStatus';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  Mail, MessageCircle, HardDrive, FileSpreadsheet, Hash, Database, BarChart3, Facebook,
  CheckCircle2, Plug, Zap, ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

const INTEGRATIONS = [
  { type: 'gmail', name: 'Gmail', icon: Mail, desc: 'Send & receive email notifications', supported: true, channels: ['Email'] },
  { type: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, desc: 'Send WhatsApp message notifications', supported: false, comingSoon: true, channels: ['WhatsApp'] },
  { type: 'googledrive', name: 'Google Drive', icon: HardDrive, desc: 'File storage, exports & backups', supported: true, channels: [] },
  { type: 'googlesheets', name: 'Google Sheets', icon: FileSpreadsheet, desc: 'Read & write spreadsheet data', supported: true, channels: [] },
  { type: 'slack', name: 'Slack', icon: Hash, desc: 'Channel notifications & alerts', supported: true, channels: ['Slack'] },
  { type: 'googlebigquery', name: 'BigQuery', icon: Database, desc: 'Export & query lead data at scale', supported: true, channels: [] },
  { type: 'meta', name: 'Meta (Facebook)', icon: Facebook, desc: 'Page & Ad Account spend integration', supported: false, comingSoon: true, channels: [] },
  { type: 'google_analytics', name: 'Google Analytics', icon: BarChart3, desc: 'Traffic & conversion analytics', supported: true, channels: [] },
];

export default function SettingsIntegrations() {
  const qc = useQueryClient();
  const [pending, setPending] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['integration-status'],
    queryFn: () => fetchIntegrationStatus({}),
  });

  const statusMap = data?.data?.status || data?.status || {};

  const handleConnect = (integration) => {
    setPending(integration);
  };

  return (
    <div>
      <div className="text-[13px] text-muted-foreground mb-4 max-w-2xl">
        Connect external services used for notifications and data sync. Shared connections are authorised through the platform —
        request a connection and it will appear as <span className="text-foreground font-medium">Connected</span> here.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {INTEGRATIONS.map((it) => {
          const Icon = it.icon;
          const connected = !!statusMap[it.type];
          return (
            <div key={it.type} className="bg-card border border-border rounded-[12px] p-4 flex flex-col">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-[14px] font-semibold text-foreground">{it.name}</div>
                    {it.comingSoon && <Badge variant="outline" className="text-[10px] text-muted-foreground">Coming soon</Badge>}
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">{it.desc}</div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                {it.comingSoon ? (
                  <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Not available
                  </span>
                ) : isLoading ? (
                  <span className="text-[11px] text-muted-foreground">Checking…</span>
                ) : connected ? (
                  <span className="text-[11px] status-sold inline-flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Not connected
                  </span>
                )}
                {it.comingSoon ? (
                  <Button size="sm" variant="outline" disabled className="gap-1.5 opacity-60">
                    <Plug className="w-3.5 h-3.5" /> Connect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant={connected ? 'outline' : 'default'}
                    className="gap-1.5"
                    onClick={() => handleConnect(it)}
                  >
                    {connected ? 'Manage' : <><Plug className="w-3.5 h-3.5" /> Connect</>}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent className="bg-popover border-border max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Connect {pending?.name}</DialogTitle>
            <DialogDescription>
              {pending?.desc}
            </DialogDescription>
          </DialogHeader>
          <div className="text-[13px] text-muted-foreground leading-relaxed">
            Authorising <span className="text-foreground font-medium">{pending?.name}</span> connects the builder account through
            the platform so all app users share the connection. This is completed by the Base44 assistant — just ask in chat to
            connect {pending?.name} and the status here will update to <span className="status-sold font-medium">Connected</span>.
            {pending?.channels?.length > 0 && (
              <div className="mt-2">Enables notification channels: {pending.channels.join(', ')}.</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPending(null)}>Close</Button>
            <Button onClick={() => { setPending(null); refetch(); qc.invalidateQueries({ queryKey: ['integration-status'] }); toast.message('Request the connection in chat to authorise ' + (pending?.name || '')); }}>
              <Plug className="w-4 h-4" /> Refresh status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}