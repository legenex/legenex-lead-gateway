import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/shared/PageHeader';
import JsonViewer from '@/components/shared/JsonViewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Save, Mail, Phone } from 'lucide-react';
import { testHlr } from '@/functions/testHlr';
import { testEmail } from '@/functions/testEmail';
import { toast } from 'sonner';

const failModeDescriptions = {
  fail_open: 'Continue processing without HLR data. Lead proceeds to LeadByte with HLR fields absent.',
  fail_closed: 'Stop processing immediately. Lead is marked as Error and supplier receives error response.',
  forward_blank: 'Continue but send empty strings for all HLR passthrough fields to LeadByte.',
};

const phoneVerifiedSourceDescriptions = {
  lh_hlr_response: 'Sends the raw lh_hlr_response value (e.g. "Exact Match") as phone_verified.',
  summary_score: 'Sends the numeric summary_score (0–100) as phone_verified.',
  boolean: 'Sends "true" if Exact Match, "false" otherwise.',
};

const verdictStyles = {
  valid: 'bg-status-sold text-status-sold',
  invalid_format: 'bg-status-error text-status-error',
  disposable: 'bg-status-unsold text-status-unsold',
  no_dns_records: 'bg-status-error text-status-error',
  service_unavailable: 'bg-muted text-muted-foreground',
  unknown: 'bg-muted text-muted-foreground',
};

export default function Verification() {
  const qc = useQueryClient();
  const [testPhone, setTestPhone] = useState('');
  const [testFirstname, setTestFirstname] = useState('');
  const [testLastname, setTestLastname] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [testEmailInput, setTestEmailInput] = useState('');
  const [emailResult, setEmailResult] = useState(null);
  const [emailTesting, setEmailTesting] = useState(false);

  const { data: hlrArr = [] } = useQuery({
    queryKey: ['hlr-settings'],
    queryFn: () => base44.entities.HlrSettings.list(),
  });

  const settings = hlrArr[0] || {};
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (hlrArr.length > 0 && !form) {
      setForm({
        provider_name: settings.provider_name || '',
        endpoint_url: settings.endpoint_url || '',
        enabled: settings.enabled ?? true,
        timeout_ms: settings.timeout_ms || 8000,
        fail_mode: settings.fail_mode || 'fail_open',
        request_field_map: settings.request_field_map || '{"mobile":"phone","first_name":"firstname","last_name":"lastname"}',
        passthrough_fields: settings.passthrough_fields || '["lh_hlr_response","summary_score","first_name_match","last_name_match","country_code"]',
        min_summary_score: settings.min_summary_score || 0,
        phone_verified_source: settings.phone_verified_source || 'lh_hlr_response',
      });
    }
  }, [hlrArr]);

  const handleSave = async () => {
    setSaving(true);
    if (settings.id) {
      await base44.entities.HlrSettings.update(settings.id, form);
    } else {
      await base44.entities.HlrSettings.create(form);
    }
    toast.success('HLR settings saved');
    qc.invalidateQueries({ queryKey: ['hlr-settings'] });
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const resp = await testHlr({ phone: testPhone, firstname: testFirstname, lastname: testLastname });
    setTestResult(resp.data);
    setTesting(false);
  };

  const handleEmailTest = async () => {
    setEmailTesting(true);
    setEmailResult(null);
    try {
      const resp = await testEmail({ email: testEmailInput });
      setEmailResult(resp.data);
    } catch (e) {
      toast.error('Email validation failed');
    }
    setEmailTesting(false);
  };

  if (!form) return <div className="py-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div>
      <PageHeader title="Verification" subtitle="Phone and email verification services" />

      <Tabs defaultValue="phone" className="mt-2">
        <TabsList>
          <TabsTrigger value="phone" className="gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Verification</TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5"><Mail className="w-3.5 h-3.5" /> Email Verification</TabsTrigger>
        </TabsList>

        {/* PHONE VERIFICATION (HLR) */}
        <TabsContent value="phone">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="text-[14px]">Provider Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label className="text-[12px]">Provider Name</Label><Input value={form.provider_name} onChange={e => setForm(p => ({ ...p, provider_name: e.target.value }))} className="mt-1 bg-background" /></div>
                  <div><Label className="text-[12px]">Endpoint URL</Label><Input value={form.endpoint_url} onChange={e => setForm(p => ({ ...p, endpoint_url: e.target.value }))} className="mt-1 bg-background font-mono text-[12px]" /></div>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.enabled} onCheckedChange={v => setForm(p => ({ ...p, enabled: v }))} />
                    <Label className="text-[12px]">Enabled</Label>
                  </div>
                  <div><Label className="text-[12px]">Timeout (ms)</Label><Input type="number" value={form.timeout_ms} onChange={e => setForm(p => ({ ...p, timeout_ms: Number(e.target.value) }))} className="mt-1 bg-background" /></div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="text-[14px]">phone_verified Source</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <SearchableSelect
                    value={form.phone_verified_source}
                    onValueChange={v => setForm(p => ({ ...p, phone_verified_source: v }))}
                    className="bg-background"
                    options={[
                      { value: 'lh_hlr_response', label: 'lh_hlr_response (e.g. "Exact Match")' },
                      { value: 'summary_score', label: 'summary_score (numeric 0–100)' },
                      { value: 'boolean', label: 'boolean (true/false)' },
                    ]}
                  />
                  <p className="text-[12px] text-muted-foreground leading-relaxed">{phoneVerifiedSourceDescriptions[form.phone_verified_source]}</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="text-[14px]">Fail Mode</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <SearchableSelect
                    value={form.fail_mode}
                    onValueChange={v => setForm(p => ({ ...p, fail_mode: v }))}
                    className="bg-background"
                    options={[
                      { value: 'fail_open', label: 'Fail Open' },
                      { value: 'fail_closed', label: 'Fail Closed' },
                      { value: 'forward_blank', label: 'Forward Blank' },
                    ]}
                  />
                  <p className="text-[12px] text-muted-foreground leading-relaxed">{failModeDescriptions[form.fail_mode]}</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="text-[14px]">Field Mapping</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-[12px]">Request Field Map (JSON)</Label>
                    <p className="text-[11px] text-muted-foreground mb-1">Maps HLR request fields ← inbound payload fields. e.g. mobile from "phone"</p>
                    <Input value={form.request_field_map} onChange={e => setForm(p => ({ ...p, request_field_map: e.target.value }))} className="mt-1 bg-background font-mono text-[12px]" />
                  </div>
                  <div>
                    <Label className="text-[12px]">Passthrough Fields (JSON array)</Label>
                    <p className="text-[11px] text-muted-foreground mb-1">HLR response fields to make available as {'{{tokens}}'}</p>
                    <Input value={form.passthrough_fields} onChange={e => setForm(p => ({ ...p, passthrough_fields: e.target.value }))} className="mt-1 bg-background font-mono text-[12px]" />
                  </div>
                  <div><Label className="text-[12px]">Min Summary Score</Label><Input type="number" value={form.min_summary_score} onChange={e => setForm(p => ({ ...p, min_summary_score: Number(e.target.value) }))} className="mt-1 bg-background" /></div>
                </CardContent>
              </Card>

              <Button onClick={handleSave} disabled={saving} className="gap-1.5 w-full">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>

            <div>
              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="text-[14px]">Live Test Lookup (server-side)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label className="text-[12px]">Phone</Label><Input value={testPhone} onChange={e => setTestPhone(e.target.value)} placeholder="5402231670" className="mt-1 bg-background font-mono" /></div>
                  <div><Label className="text-[12px]">First Name (firstname)</Label><Input value={testFirstname} onChange={e => setTestFirstname(e.target.value)} placeholder="Abigale" className="mt-1 bg-background" /></div>
                  <div><Label className="text-[12px]">Last Name (lastname)</Label><Input value={testLastname} onChange={e => setTestLastname(e.target.value)} placeholder="Hart" className="mt-1 bg-background" /></div>
                  <Button onClick={handleTest} disabled={testing || !testPhone} className="gap-1.5 w-full">
                    {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {testing ? 'Running...' : 'Run Test Lookup'}
                  </Button>
                  {testResult && <div className="mt-4"><JsonViewer data={testResult} title="HLR Response" /></div>}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* EMAIL VERIFICATION */}
        <TabsContent value="email">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-[14px]">Email Validation Test</CardTitle>
                <p className="text-[12px] text-muted-foreground">Free validation service (Disify) — checks format, DNS/MX records, disposable domains and free providers. No API key required.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-[12px]">Email Address</Label>
                  <Input
                    value={testEmailInput}
                    onChange={e => setTestEmailInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (testEmailInput && !emailTesting) handleEmailTest(); } }}
                    placeholder="name@example.com"
                    className="mt-1 bg-background font-mono"
                  />
                </div>
                <Button onClick={handleEmailTest} disabled={emailTesting || !testEmailInput} className="gap-1.5 w-full">
                  {emailTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {emailTesting ? 'Validating...' : 'Validate Email'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-[14px]">Result</CardTitle></CardHeader>
              <CardContent>
                {!emailResult ? (
                  <div className="py-8 text-center text-muted-foreground text-[13px]">Run a validation to see the result.</div>
                ) : emailResult.error ? (
                  <div className="py-8 text-center text-status-error text-[13px]">{emailResult.error}</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] text-muted-foreground">Verdict</div>
                      <Badge className={`${verdictStyles[emailResult.verdict] || verdictStyles.unknown} text-[11px]`}>
                        {emailResult.verdict?.replace(/_/g, ' ') || 'unknown'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[13px]">
                      <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground font-mono">{emailResult.email}</span></div>
                      <div><span className="text-muted-foreground">Domain:</span> <span className="text-foreground font-mono">{emailResult.domain}</span></div>
                      <div><span className="text-muted-foreground">Format valid:</span> <span className="text-foreground">{String(emailResult.format)}</span></div>
                      <div><span className="text-muted-foreground">DNS valid:</span> <span className="text-foreground">{String(emailResult.dns)}</span></div>
                      <div><span className="text-muted-foreground">Disposable:</span> <span className="text-foreground">{String(emailResult.disposable)}</span></div>
                      <div><span className="text-muted-foreground">Free provider:</span> <span className="text-foreground">{String(emailResult.free)}</span></div>
                      <div><span className="text-muted-foreground">Role-based:</span> <span className="text-foreground">{String(emailResult.role)}</span></div>
                    </div>
                    {Array.isArray(emailResult.mx_records) && emailResult.mx_records.length > 0 && (
                      <div>
                        <div className="text-[12px] text-muted-foreground mb-1">MX Records</div>
                        <div className="space-y-1">
                          {emailResult.mx_records.map((mx, i) => (
                            <div key={i} className="font-mono text-[11px] text-foreground bg-muted rounded px-2 py-1">{mx}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}