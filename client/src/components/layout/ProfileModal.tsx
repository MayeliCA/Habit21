import { Mail, User, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { es } from '@/i18n/es';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user } = useAuth();

  if (!open || !user) return null;

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-lg fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
            {initial}
          </div>
          <h2 className="text-lg font-semibold text-[#1e293b]">{es.profile.title}</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border bg-gray-50/50 px-4 py-3">
            <User className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <p className="text-[10px] text-muted-foreground">{es.profile.name}</p>
              <p className="text-sm font-medium text-[#1e293b]">{user.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border bg-gray-50/50 px-4 py-3">
            <Mail className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <p className="text-[10px] text-muted-foreground">{es.profile.email}</p>
              <p className="text-sm font-medium text-[#1e293b]">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border bg-gray-50/50 px-4 py-3">
            <Calendar className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <p className="text-[10px] text-muted-foreground">{es.profile.memberSince}</p>
              <p className="text-sm font-medium text-[#1e293b]">2025</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {es.profile.close}
        </button>
      </div>
    </div>
  );
}
