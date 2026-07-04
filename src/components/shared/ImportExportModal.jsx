import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Download, Upload, FileJson, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const SYSTEM_FIELDS = ['id', 'created_date', 'updated_date', 'created_by_id'];

export default function ImportExportModal({ open, onOpenChange, entityName, queryKey, items, getItemLabel }) {
  const qc = useQueryClient();
  const [mode, setMode] = useState('choose'); // choose | export | import
  const [selected, setSelected] = useState(new Set());
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const fileRef = useRef(null);

  const reset = () => {
    setMode('choose');
    setSelected(new Set());
    setImportPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const close = () => {
    reset();
    onOpenChange(false);
  };

  const toggleItem = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === items.length && items.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map(i => i.id)));
    }
  };

  const handleExport = () => {
    const toExport = items.filter(i => selected.has(i.id));
    const cleanData = toExport.map(item => {
      const clone = { ...item };
      SYSTEM_FIELDS.forEach(f => delete clone[f]);
      return clone;
    });
    const blob = new Blob([JSON.stringify(cleanData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityName.toLowerCase()}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${cleanData.length} ${entityName.toLowerCase()}`);
    close();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        setImportPreview(arr);
      } catch {
        toast.error('Invalid JSON file');
        setImportPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importPreview || importPreview.length === 0) return;
    setImporting(true);
    try {
      const cleanData = importPreview.map(item => {
        const clone = { ...item };
        SYSTEM_FIELDS.forEach(f => delete clone[f]);
        return clone;
      });
      await base44.entities[entityName].bulkCreate(cleanData);
      toast.success(`Imported ${cleanData.length} ${entityName.toLowerCase()}`);
      qc.invalidateQueries({ queryKey });
      close();
    } catch (err) {
      toast.error('Import failed: ' + (err.message || 'unknown error'));
    }
    setImporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); else onOpenChange(v); }}>
      <DialogContent className="bg-popover border-border max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode !== 'choose' && (
              <button onClick={() => { setMode('choose'); setImportPreview(null); if (fileRef.current) fileRef.current.value = ''; }} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {mode === 'choose' && `Import / Export ${entityName}`}
            {mode === 'export' && `Export ${entityName}`}
            {mode === 'import' && `Import ${entityName}`}
          </DialogTitle>
        </DialogHeader>

        {mode === 'choose' && (
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => { setMode('export'); setSelected(new Set(items.map(i => i.id))); }}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-accent/30 transition-colors"
            >
              <Download className="w-8 h-8 text-primary" />
              <span className="text-[14px] font-medium text-foreground">Export</span>
              <span className="text-[11px] text-muted-foreground text-center">Select items and download as JSON</span>
            </button>
            <button
              onClick={() => setMode('import')}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-accent/30 transition-colors"
            >
              <Upload className="w-8 h-8 text-primary" />
              <span className="text-[14px] font-medium text-foreground">Import</span>
              <span className="text-[11px] text-muted-foreground text-center">Upload a JSON file to create records</span>
            </button>
          </div>
        )}

        {mode === 'export' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-muted-foreground">{selected.size} of {items.length} selected</span>
              <Button size="sm" variant="ghost" onClick={toggleAll} className="text-[11px] h-7">
                {selected.size === items.length && items.length > 0 ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="max-h-[320px] overflow-y-auto space-y-1 rounded-md border border-border p-2">
              {items.length === 0 && <div className="text-center py-6 text-muted-foreground text-[13px]">No items available</div>}
              {items.map(item => (
                <label key={item.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-accent/30 cursor-pointer">
                  <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggleItem(item.id)} />
                  <span className="text-[13px] text-foreground truncate">{getItemLabel(item)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {mode === 'import' && (
          <div className="space-y-4 py-2">
            <div
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-2 p-8 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/20 cursor-pointer transition-colors"
            >
              <FileJson className="w-8 h-8 text-muted-foreground" />
              <span className="text-[13px] text-foreground font-medium">Click to select a JSON file</span>
              <span className="text-[11px] text-muted-foreground">Exported {entityName} JSON file</span>
              <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileSelect} />
            </div>
            {importPreview !== null && (
              <div className="rounded-md border border-border bg-muted/30 p-3">
                <span className="text-[12px] text-foreground font-medium">{importPreview.length} record{importPreview.length !== 1 ? 's' : ''} ready to import</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={close}>Cancel</Button>
          {mode === 'export' && (
            <Button onClick={handleExport} disabled={selected.size === 0} className="gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export {selected.size > 0 ? `(${selected.size})` : ''}
            </Button>
          )}
          {mode === 'import' && (
            <Button onClick={handleImport} disabled={importing || !importPreview || importPreview.length === 0} className="gap-1.5">
              {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {importing ? 'Importing...' : 'Import'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}