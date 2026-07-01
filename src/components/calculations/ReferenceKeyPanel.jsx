import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

function parseValues(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    const p = JSON.parse(v);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

export default function ReferenceKeyPanel() {
  const [search, setSearch] = useState('');

  const { data: keys = [] } = useQuery({
    queryKey: ['reference-keys'],
    queryFn: () => base44.entities.ReferenceKey.list('sort_order', 100),
  });

  const items = useMemo(
    () => keys.map(k => ({
      id: k.id,
      field_name: k.field_name,
      label: k.label || k.field_name,
      note: k.note || '',
      values: parseValues(k.values),
    })),
    [keys]
  );

  const q = search.trim().toLowerCase();
  const filtered = q
    ? items
        .map(it => ({
          ...it,
          values: it.values.filter(v => String(v).toLowerCase().includes(q)),
        }))
        .filter(it =>
          it.field_name.toLowerCase().includes(q) ||
          it.label.toLowerCase().includes(q) ||
          it.values.length
        )
    : items;

  const copy = (val) => {
    navigator.clipboard
      .writeText(val)
      .then(() => toast.success('Copied: ' + val))
      .catch(() => toast.error('Copy failed'));
  };

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search reference values..."
          className="pl-7 h-8 text-[12px] bg-background"
        />
      </div>

      {filtered.length === 0 && (
        <div className="text-[11px] text-muted-foreground py-2">No matching reference keys</div>
      )}

      <div className="space-y-0">
        {filtered.map(it => (
          <div
            key={it.id}
            className="flex gap-2.5 items-start py-1.5 border-b border-border/40 last:border-0"
          >
            <div className="w-[34%] shrink-0 pt-0.5">
              <div className="text-[12px] font-semibold text-foreground leading-tight">{it.label}</div>
              <code className="text-[10px] font-mono text-primary/80 break-all">{it.field_name}</code>
              {it.note && (
                <div className="text-[9px] text-muted-foreground leading-tight mt-0.5">{it.note}</div>
              )}
            </div>
            <div className="flex-1 flex flex-wrap gap-1 min-w-0">
              {it.values.map((v, i) => (
                <code
                  key={i}
                  className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded cursor-pointer hover:bg-primary/20"
                  onClick={() => copy(v)}
                  title="Click to copy"
                >
                  {v}
                </code>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}