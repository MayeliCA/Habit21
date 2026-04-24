# Plan: Modo Vintage

## Resumen
Agregar un tercer modo de apariencia "Vintage" a la aplicacion, usando la paleta `#213448`, `#547792`, `#94B4C1`, `#EAE0CF` como tema claro calido. Incluye semanticizar los colores de categorias en todos los componentes.

---

## Paso 1: CSS Variables (`client/src/index.css`)

### 1a. Agregar tokens de categoria al `@theme` (despues de `--color-ring`)

```css
  --color-academic: #3b82f6;
  --color-academic-light: #dbeafe;
  --color-academic-dark: #1e40af;
  --color-vital: #22c55e;
  --color-vital-light: #dcfce7;
  --color-vital-dark: #166534;
  --color-personal: #a855f7;
  --color-personal-light: #f3e8ff;
  --color-personal-dark: #6b21a8;
  --color-escape: #f59e0b;
  --color-escape-light: #fef3c7;
  --color-escape-dark: #92400e;
```

### 1b. Agregar bloque `.vintage` (despues del bloque `.dark`)

```css
.vintage {
  --color-background: #EAE0CF;
  --color-foreground: #213448;
  --color-card: #f2ebe0;
  --color-card-foreground: #213448;
  --color-popover: #f2ebe0;
  --color-popover-foreground: #213448;
  --color-primary: #547792;
  --color-primary-foreground: #EAE0CF;
  --color-secondary: #94B4C1;
  --color-secondary-foreground: #213448;
  --color-muted: #ddd3c2;
  --color-muted-foreground: #547792;
  --color-accent: #94B4C1;
  --color-accent-foreground: #213448;
  --color-destructive: #c0392b;
  --color-destructive-foreground: #EAE0CF;
  --color-border: #bfb3a0;
  --color-input: #bfb3a0;
  --color-ring: #547792;
  --color-academic: #547792;
  --color-academic-light: #dfe9f0;
  --color-academic-dark: #3b5670;
  --color-vital: #5a8f7a;
  --color-vital-light: #dff0ea;
  --color-vital-dark: #3a6455;
  --color-personal: #94B4C1;
  --color-personal-light: #e4eff4;
  --color-personal-dark: #5d8596;
  --color-escape: #b89b7a;
  --color-escape-light: #f0e6d6;
  --color-escape-dark: #7a6548;
}
```

---

## Paso 2: Tipo ThemeMode (`client/src/hooks/useSettings.tsx`)

- Cambiar `ThemeMode = 'light' | 'dark'` a `ThemeMode = 'light' | 'dark' | 'vintage'`
- Actualizar `applyTheme()` para manejar `.vintage`:

```typescript
function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove('dark', 'vintage');
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'vintage') {
    root.classList.add('vintage');
  }
}
```

---

## Paso 3: Traduccion (`client/src/i18n/es.ts`)

Agregar despues de `themeDark`:
```
themeVintage: 'Vintage',
```

---

## Paso 4: Settings Modal (`client/src/components/layout/SettingsModal.tsx`)

- Importar icono `Palette` de lucide-react
- Reemplazar los 2 botones (Claro/Oscuro) por 3 botones (Claro/Oscuro/Vintage)
- Agregar tercer boton:
```tsx
<button
  onClick={() => setDraft({ ...draft, theme: 'vintage' })}
  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
    draft.theme === 'vintage'
      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20'
      : 'border-border text-muted-foreground hover:bg-accent'
  }`}
>
  <Palette className="h-4 w-4" strokeWidth={1.5} />
  {es.settings.themeVintage}
</button>
```
- Actualizar el icono del encabezado (Sun/Moon/Palette segun tema)

---

## Paso 5: Actualizar componentes con colores de categoria

### 5a. `client/src/components/schedule/AddActivityForm.tsx` (linea 8-13)
```
vital:    { color: 'text-vital-dark',    bg: 'bg-vital-light',    dot: 'bg-vital' }
academic: { color: 'text-academic-dark', bg: 'bg-academic-light', dot: 'bg-academic' }
personal: { color: 'text-personal-dark', bg: 'bg-personal-light', dot: 'bg-personal' }
escape:   { color: 'text-escape-dark',   bg: 'bg-escape-light',   dot: 'bg-escape' }
```

### 5b. `client/src/pages/Habits.tsx` (linea 23-28)
Mismo cambio que 5a.

### 5c. `client/src/components/dashboard/CategoryProgressBars.tsx` (linea 11-15)
```
academic: { color: 'bg-academic',   bgTrack: 'bg-academic-light',   icon: BookOpen }
vital:    { color: 'bg-vital',      bgTrack: 'bg-vital-light',      icon: Heart }
personal: { color: 'bg-personal',   bgTrack: 'bg-personal-light',   icon: Coffee }
escape:   { color: 'bg-escape',     bgTrack: 'bg-escape-light',     icon: Gamepad2 }
```

### 5d. `client/src/pages/Home.tsx` (linea 17-22)
```
academic: 'bg-academic-light text-academic-dark'
vital:    'bg-vital-light text-vital-dark'
personal: 'bg-personal-light text-personal-dark'
escape:   'bg-escape-light text-escape-dark'
```

### 5e. `client/src/components/schedule/TimelineBar.tsx` (linea 12-17)
```
academic: { bg: 'bg-academic',  hover: 'hover:bg-academic/80' }
vital:    { bg: 'bg-vital',     hover: 'hover:bg-vital/80' }
personal: { bg: 'bg-personal',  hover: 'hover:bg-personal/80' }
escape:   { bg: 'bg-escape',    hover: 'hover:bg-escape/80' }
```

### 5f. `client/src/pages/DailyChecklist.tsx` (lineas 21-33)
```
CATEGORY_ICON_COLOR:
  academic: 'text-academic'
  vital: 'text-vital'
  personal: 'text-personal'
  escape: 'text-escape'

CATEGORY_DOT:
  academic: 'bg-academic'
  vital: 'bg-vital'
  personal: 'bg-personal'
  escape: 'bg-escape'
```

Colores confetti (linea 92): usar colors vintage:
```typescript
colors: settings.theme === 'vintage'
  ? ['#547792', '#94B4C1', '#b89b7a', '#5a8f7a', '#EAE0CF']
  : ['#22c55e', '#16a34a', '#fbbf24', '#3b82f6', '#a855f7'],
```

### 5g. `client/src/components/schedule/ActivityRow.tsx` (linea 19-24)
```
academic: { border: 'border-l-academic', icon: 'text-academic', dot: 'bg-academic' }
vital:    { border: 'border-l-vital',    icon: 'text-vital',    dot: 'bg-vital' }
personal: { border: 'border-l-personal', icon: 'text-personal', dot: 'bg-personal' }
escape:   { border: 'border-l-escape',   icon: 'text-escape',   dot: 'bg-escape' }
```

### 5h. `client/src/components/dashboard/DayDetail.tsx` (linea 7-12)
```
academic: 'bg-academic'
vital: 'bg-vital'
personal: 'bg-personal'
escape: 'bg-escape'
```

---

## Paso 6: Actualizar graficos

### 6a. `client/src/components/streaks/StreakWidget.tsx` (linea 22)
Importar useSettings si no esta, y usar:
```typescript
const confettiColors = settings.theme === 'vintage'
  ? ['#547792', '#94B4C1', '#b89b7a', '#5a8f7a', '#EAE0CF']
  : ['#fbbf24', '#f59e0b', '#ef4444', '#3b82f6', '#22c55e'];
```

### 6b. `client/src/components/streaks/StreakProgressChart.tsx` (lineas 37, 39)
Importar useSettings y usar:
```typescript
const { settings } = useSettings();
const chartColor = settings.theme === 'vintage' ? '#547792' : '#3b82f6';
// stroke={chartColor}
// dot={{ r: 3.5, fill: chartColor }}
```

---

## Paso 7: Verificar

- Ejecutar `npm run lint` y `npm run typecheck` en client/
- Probar visualmente los 3 modos (Claro, Oscuro, Vintage)

---

## Total de archivos: 13

| # | Archivo | Tipo de cambio |
|---|---------|---------------|
| 1 | `client/src/index.css` | Agregar tokens + bloque .vintage |
| 2 | `client/src/hooks/useSettings.tsx` | ThemeMode + applyTheme |
| 3 | `client/src/i18n/es.ts` | themeVintage |
| 4 | `client/src/components/layout/SettingsModal.tsx` | Boton vintage + icono |
| 5 | `client/src/components/schedule/AddActivityForm.tsx` | Colores semanticos |
| 6 | `client/src/pages/Habits.tsx` | Colores semanticos |
| 7 | `client/src/components/dashboard/CategoryProgressBars.tsx` | Colores semanticos |
| 8 | `client/src/pages/Home.tsx` | Colores semanticos |
| 9 | `client/src/components/schedule/TimelineBar.tsx` | Colores semanticos |
| 10 | `client/src/pages/DailyChecklist.tsx` | Colores semanticos + confetti |
| 11 | `client/src/components/schedule/ActivityRow.tsx` | Colores semanticos |
| 12 | `client/src/components/dashboard/DayDetail.tsx` | Colores semanticos |
| 13 | `client/src/components/streaks/StreakWidget.tsx` | Confetti vintage |
| 14 | `client/src/components/streaks/StreakProgressChart.tsx` | Chart color vintage |
