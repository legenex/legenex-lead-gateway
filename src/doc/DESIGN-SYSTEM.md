# Legenex Design System

A dark, dense, operations-dashboard aesthetic. Red brand accent on a blue-grey dark surface. Built for Tailwind CSS + shadcn/ui. The companion file `design-system.css` contains every token and utility class referenced here.

---

## 1. Color System

All colors are stored as **HSL triplets** (no `hsl()` wrapper) in CSS variables, then mapped to Tailwind classes in `tailwind.config.js`. This lets you write opacity modifiers like `bg-primary/10`.

### Core palette

| Token              | HSL             | Hex approx | Tailwind class        | Purpose                          |
|--------------------|-----------------|------------|-----------------------|----------------------------------|
| `--background`     | `212 20% 17%`   | `#252E39`  | `bg-background`       | Page background                  |
| `--foreground`     | `0 0% 95%`      | `#F2F2F2`  | `text-foreground`     | Body text                        |
| `--card`           | `213 19% 20%`   | `#323B45`  | `bg-card`             | Cards / panels                   |
| `--popover`        | `213 19% 23%`   | `#3A434E`  | `bg-popover`          | Modals, dropdowns                |
| `--primary`        | `0 82% 63%`     | `#EE5656`  | `bg-primary`          | Brand red - buttons, active nav  |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF`  | `text-primary-foreground` | Text on primary              |
| `--secondary`      | `212 18% 25%`   | `#353D48`  | `bg-secondary`        | Secondary buttons                |
| `--muted`          | `212 18% 22%`   | `#2E353F`  | `bg-muted`            | Muted backgrounds, tab bars      |
| `--muted-foreground`| `212 10% 55%`  | `#8B94A0`  | `text-muted-foreground` | Hints, labels, meta text       |
| `--accent`         | `212 18% 26%`   | `#38414C`  | `bg-accent`           | Hover surfaces                   |
| `--destructive`    | `0 82% 63%`     | `#EE5656`  | `bg-destructive`      | Destructive actions (same red)   |
| `--border`         | `212 15% 28%`   | `#3D454F`  | `border-border`       | All borders                      |
| `--input`          | `212 15% 24%`   | `#343B45`  | `bg-input`            | Form inputs                      |
| `--ring`           | `0 82% 63%`     | `#EE5656`  | `ring-ring`           | Focus rings                      |

### Sidebar palette (darker than page)

| Token                    | HSL             | Hex approx | Tailwind class             |
|--------------------------|-----------------|------------|----------------------------|
| `--sidebar-background`   | `213 20% 14%`   | `#1C2229`  | `bg-sidebar`               |
| `--sidebar-foreground`   | `212 10% 65%`   | `#99A1AD`  | `text-sidebar-foreground`  |
| `--sidebar-primary`      | `0 82% 63%`     | `#EE5656`  | `text-sidebar-primary`     |
| `--sidebar-accent`       | `212 18% 22%`   | `#2E353F`  | `bg-sidebar-accent`        |
| `--sidebar-border`       | `212 15% 24%`   | `#343B45`  | `border-sidebar-border`    |

### Chart palette

| Token       | Hex       | Use                |
|-------------|-----------|--------------------|
| `--chart-1` | `#EE5656` | Primary series     |
| `--chart-2` | `#22C55E` | Success / sold     |
| `--chart-3` | `#F59E0B` | Warning / unsold   |
| `--chart-4` | `#EE5656` | Secondary red      |
| `--chart-5` | `#3B82F6` | Info / blue        |

### Status colors (lead lifecycle)

These are **plain CSS classes** (not Tailwind tokens) defined in `design-system.css`. Each has a text color class and a matching `bg-status-*` tint at 15% opacity.

| Class                  | Hex       | Lead state            |
|------------------------|-----------|-----------------------|
| `.status-sold`         | `#22C55E` | Sold                  |
| `.status-unsold`       | `#EAB308` | Unsold                |
| `.status-disqualified` | `#F97316` | Disqualified          |
| `.status-rejected`     | `#EC4899` | Rejected              |
| `.status-returned`     | `#FFB082` | Returned              |
| `.status-queued`       | `#A855F7` | Queued                |
| `.status-error`        | `#EF4444` | Error                 |
| `.status-duplicate`    | `#3B82F6` | Duplicate             |
| `.status-processing`   | `#3B82F6` | Processing            |
| `.status-qualified`    | `#62B6CB` | Qualified (custom)    |
| `.status-24m`          | `#82D1B8` | 24m Lead (custom)     |
| `.tag-neutral`         | `#A5AAB3` | Neutral meta tag      |

---

## 2. Typography

| Role      | Font stack                          | Tailwind class    |
|-----------|-------------------------------------|-------------------|
| Heading   | `Inter`                             | `font-heading`    |
| Body      | `Inter`                             | `font-body`       |
| Display   | `Inter`                             | `font-display`    |
| Mono      | `JetBrains Mono`                    | `font-mono`       |

Fonts loaded via Google Fonts `@import` at the top of the CSS file.

### Typographic scale (conventions used across the app)

| Purpose             | Classes                                  |
|---------------------|------------------------------------------|
| Page title          | `text-xl font-semibold text-foreground`  |
| Page subtitle       | `text-sm text-muted-foreground`          |
| Section header      | `text-[12px] font-semibold uppercase tracking-wider text-muted-foreground` |
| Table header        | `text-[11px] font-semibold uppercase tracking-wider text-muted-foreground` |
| Body / table cell   | `text-[13px] text-foreground`            |
| Meta / hint         | `text-[11px] text-muted-foreground`      |
| Mono data           | `font-mono text-[11px] text-muted-foreground` |

---

## 3. Radius & Spacing

- Base radius: `--radius: 0.625rem` (10px)
- Tailwind mapping: `rounded-lg` = 10px, `rounded-md` = 8px, `rounded-sm` = 6px
- Cards / panels: `rounded-[10px]`
- Badges / pills: `rounded-md`
- Buttons: `rounded-md`

---

## 4. App Layout

```
+----------------------------------------------------------+
| Sidebar (248px fixed)  |  Main content area              |
|                        |  max-width: 1400px              |
|                        |  padding: 24px (p-6) / 32px (lg:p-8) |
+----------------------------------------------------------+
```

**Structure:**
- `<AppLayout>` - full-height flex container (`h-screen bg-background overflow-hidden`)
- `<Sidebar>` - fixed left, `w-[248px]`, `bg-sidebar`, rounded right corners (`16px`)
- `<main>` - `ml-[248px] h-screen`, inner scroll container with `max-w-[1400px]`

---

## 5. Left Sidebar

### Container
- Fixed position, `w-[248px]`, `bg-sidebar`
- `border-r border-sidebar-border`
- Rounded top-right and bottom-right: `16px`
- Flex column: logo -> nav (scrollable) -> footer

### Logo
- `px-5 py-6`, image height `h-10`

### Navigation groups

The sidebar uses a `navGroups` array. Each group is either `type: 'single'` (direct link) or `type: 'dropdown'` (collapsible with children).

#### Groups & routes

| Group              | Icon             | Type     | Children / Route                              |
|--------------------|------------------|----------|-----------------------------------------------|
| **Overview**       | `LayoutDashboard`| single   | `/`                                           |
| **Leads**          | `FileText`       | dropdown | `/leads` (parent), then:                      |
|                    |                  |          | - Sold Leads `/leads/sold`                    |
|                    |                  |          | - Unsold Leads `/leads/unsold`                |
|                    |                  |          | - Disqualified Leads `/leads/disqualified`    |
|                    |                  |          | - Rejected Leads `/leads/rejected`            |
|                    |                  |          | - Queued Leads `/leads/queued`                |
| **Lead Distribution** | `Share2`      | dropdown | - Campaigns `/campaigns`                      |
|                    |                  |          | - Deliveries `/deliveries`                    |
|                    |                  |          | - Conversion Events `/conversion-events`      |
| **Tools**          | `Wrench`         | dropdown | - Notifications `/notifications`              |
|                    |                  |          | - Calculated Fields `/calculated-fields`      |
|                    |                  |          | - Verification `/verification`                |
|                    |                  |          | - Payload Tester `/payload-tester`            |
| **Settings**       | `Settings`       | dropdown | `/settings` (parent), then tab-based children |

### Nav item styling

**Single link (inactive):**
```
text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent
px-3 py-2.5 rounded-lg text-[13px] font-medium
```

**Single link (active):**
```
bg-primary/10 text-foreground
+ left accent bar: absolute left-0 w-[3px] h-5 bg-primary rounded-r-full
+ icon turns text-primary
```

**Dropdown group header:**
- Label button (flex-1) + chevron toggle button (separate)
- Chevron toggle: `bg-muted/60 border-sidebar-border` when closed, `bg-primary/15 text-primary border-primary/30` when open

**Dropdown children:**
- Indented: `ml-4 pl-3 border-l border-sidebar-border`
- `px-3 py-1.5 rounded-md text-[12px] font-medium`
- Active child: `bg-primary/10 text-primary`

### Expand / Collapse behavior
- Open groups persist in `localStorage` (key: `legenex_sidebar_open_groups`)
- Auto-expands groups containing the active route
- Footer has "Expand All" / "Collapse All" toggle button
- Footer shows version: `text-[11px] text-muted-foreground`

### Icons
All from `lucide-react`: `LayoutDashboard`, `FileText`, `Share2`, `Wrench`, `Settings`, `ChevronDown`, `ChevronRight`, `ChevronsDownUp`, `ChevronsUpDown`

---

## 6. Settings Page & Tabs

The Settings page lives at `/settings` and uses **URL query params** for tab state (`?tab=general`, `?tab=users`, etc.). Tabs are managed with shadcn `<Tabs>`.

### Settings tabs

| Tab value        | Label            | Component                 | Purpose                                              |
|------------------|------------------|---------------------------|------------------------------------------------------|
| `general`        | General          | `SettingsGeneral`         | Brand name, tagline, base URL, fail mode, TrustedForm, FB API version |
| `users`          | Users            | `SettingsUsers`           | User management, roles                               |
| `apikeys`        | API Keys         | `SettingsApiKeys`         | Supplier/master API keys, expose_revenue toggle      |
| `integrations`   | Integrations     | `SettingsIntegrations`    | HLR, email validation, WhatsApp, Gmail connectors    |
| `notifications`  | Notifications    | `SettingsNotifications`   | Notification rules, channels, recipients             |
| `fields`         | Custom Fields    | `SettingsCustomFields`    | Field definitions, mapping, required flags           |
| `errors`         | Error Logs       | `ErrorLogs` (embedded)    | Error log viewer with resolve/unresolve              |
| `adaptive`       | Adaptive Fields  | `SettingsIgnoreList`      | Auto-cataloging toggle + ignore list                 |

### Tab bar styling
- `TabsList`: `bg-muted mb-4 shrink-0 self-start`
- Each `TabsTrigger` uses default shadcn tab styling
- `TabsContent`: `flex-1 min-h-0 overflow-y-auto` (each tab scrolls independently)

### Page header
- `PageHeader` component: title `text-xl font-semibold`, subtitle `text-sm text-muted-foreground`

---

## 7. Common UI Patterns

### Cards / Panels
```
bg-card border border-border rounded-[10px] p-5
```

### Tables
```
Container: bg-card border border-border rounded-[10px] overflow-hidden
Header row: border-b border-border bg-muted/50
Header cell: text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground
Body: divide-y divide-border
Row: hover:bg-accent/40 transition-colors
Cell: px-4 py-3 text-[13px]
```

### Badges
```
Default:   bg-primary/20 text-primary text-[10px] border-0
Secondary: bg-accent text-muted-foreground text-[10px] border border-border
Outline:   variant="outline" + status color class (e.g. status-sold bg-status-sold)
```

### Buttons (shadcn variants)
- `default`: `bg-primary text-primary-foreground` - primary actions
- `ghost`: transparent, `hover:bg-accent` - table row actions, icon buttons
- `outline`: bordered, for secondary actions
- `destructive`: `bg-destructive` - delete actions

### Form inputs
- `bg-background border border-input rounded-md h-9 px-3 text-sm`
- Focus: `ring-1 ring-ring`
- Labels: `text-[12px] font-medium`
- Hints: `text-[11px] text-muted-foreground`

### Empty states
- `px-4 py-8 text-center text-muted-foreground`

---

## 8. Tailwind Config Mapping

The `tailwind.config.js` maps CSS variables to Tailwind classes:

```js
colors: {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
  popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
  primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
  secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
  muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
  accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
  destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  sidebar: { DEFAULT: 'hsl(var(--sidebar-background))', foreground: 'hsl(var(--sidebar-foreground))', ... },
  chart: { 1: 'hsl(var(--chart-1))', ... }
},
fontFamily: {
  heading: ['var(--font-heading)'],
  body: ['var(--font-body)'],
  display: ['var(--font-display)'],
  mono: ['var(--font-mono)']
},
borderRadius: {
  lg: 'var(--radius)',
  md: 'calc(var(--radius) - 2px)',
  sm: 'calc(var(--radius) - 4px)'
}
```

Plugins: `tailwindcss-animate`
Dark mode: `class` strategy (app is dark-only; `.dark` mirrors `:root`)

---

## 9. Usage in a New App

1. Copy `design-system.css` into your project's CSS entry point (or `src/index.css`).
2. Copy the `theme.extend` block from `tailwind.config.js` (colors, fontFamily, borderRadius).
3. Add `tailwindcss-animate` plugin and set `darkMode: ["class"]`.
4. Ensure shadcn/ui components are installed (Button, Input, Label, Switch, Dialog, Tabs, Badge, etc.).
5. Add `class="dark"` to `<html>` (or rely on the `.dark` block matching `:root`).
6. Use Tailwind token classes (`bg-primary`, `text-muted-foreground`, etc.) in JSX - never hardcode hex values.