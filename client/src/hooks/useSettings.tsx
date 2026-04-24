import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'vintage';

export interface AppSettings {
  successThreshold: number;
  celebrationsEnabled: boolean;
  timeFormat: '12h' | '24h';
  theme: ThemeMode;
}

const DEFAULT_SETTINGS: AppSettings = {
  successThreshold: 80,
  celebrationsEnabled: true,
  timeFormat: '24h',
  theme: 'light',
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove('dark', 'vintage');
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'vintage') {
    root.classList.add('vintage');
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem('habit21_settings');
    if (stored) {
      try {
        const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        applyTheme(parsed.theme);
        return parsed;
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('habit21_settings', JSON.stringify(settings));
    applyTheme(settings.theme);
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
