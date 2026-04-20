import { useState } from 'react';
import { Settings, Target, Sparkles, Clock } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { es } from '@/i18n/es';
import type { AppSettings } from '@/hooks/useSettings';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useSettings();
  const [draft, setDraft] = useState<AppSettings>(settings);

  if (!open) return null;

  const handleSave = () => {
    updateSettings(draft);
    onClose();
  };

  const handleCancel = () => {
    setDraft(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={handleCancel}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-lg fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center gap-2.5">
          <Settings className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
          <h2 className="text-lg font-semibold text-[#1e293b]">{es.settings.title}</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm font-medium text-[#1e293b]">{es.settings.threshold}</span>
            </div>
            <p className="text-xs text-gray-400">{es.settings.thresholdDesc}</p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={50}
                max={100}
                step={5}
                value={draft.successThreshold}
                onChange={(e) => setDraft({ ...draft, successThreshold: Number(e.target.value) })}
                className="h-1.5 flex-1 appearance-none rounded-full bg-gray-200 accent-primary"
              />
              <span className="w-10 text-right text-sm font-semibold tabular-nums text-[#1e293b]">{draft.successThreshold}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm font-medium text-[#1e293b]">{es.settings.celebrations}</span>
            </div>
            <p className="text-xs text-gray-400">{es.settings.celebrationsDesc}</p>
            <button
              onClick={() => setDraft({ ...draft, celebrationsEnabled: !draft.celebrationsEnabled })}
              className={`relative h-6 w-11 rounded-full transition-colors ${draft.celebrationsEnabled ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${draft.celebrationsEnabled ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
            <span className="text-[10px] text-muted-foreground">{draft.celebrationsEnabled ? es.settings.on : es.settings.off}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm font-medium text-[#1e293b]">{es.settings.timeFormat}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDraft({ ...draft, timeFormat: '12h' })}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                  draft.timeFormat === '12h'
                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20'
                    : 'border-gray-200 text-muted-foreground hover:bg-gray-50'
                }`}
              >
                {es.settings.time12h}
              </button>
              <button
                onClick={() => setDraft({ ...draft, timeFormat: '24h' })}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                  draft.timeFormat === '24h'
                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20'
                    : 'border-gray-200 text-muted-foreground hover:bg-gray-50'
                }`}
              >
                {es.settings.time24h}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-gray-50"
          >
            {es.settings.cancel}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-[0_0_12px_rgba(30,41,59,0.15)] transition-colors hover:bg-primary/90"
          >
            {es.settings.save}
          </button>
        </div>
      </div>
    </div>
  );
}
