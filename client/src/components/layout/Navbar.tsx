import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, CheckSquare, Trophy, LogOut, HomeIcon, User, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { es } from '@/i18n/es';
import { ProfileModal } from '@/components/layout/ProfileModal';
import { SettingsModal } from '@/components/layout/SettingsModal';

const navItems = [
  { to: '/', label: es.nav.home, icon: HomeIcon },
  { to: '/checklist', label: es.nav.checklist, icon: CheckSquare },
  { to: '/habits', label: es.nav.habits, icon: Trophy },
  { to: '/schedule', label: es.nav.schedule, icon: Calendar },
  { to: '/panel', label: es.nav.dashboard, icon: LayoutDashboard },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="flex h-14 items-center px-6">
          <Link to="/" className="text-lg font-bold tracking-tight">{es.app.name}</Link>

          <nav className="ml-8 flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/' || to === '/panel'}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                {initial}
              </div>
              <span className="text-sm font-medium text-[#1e293b]">{user?.name}</span>
            </button>

            {menuOpen && (
              <div className="dropdown-in absolute right-6 top-13 w-56 rounded-xl bg-white py-1.5 shadow-lg ring-1 ring-black/5">
                <button
                  onClick={() => { setMenuOpen(false); setProfileOpen(true); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#1e293b] transition-colors hover:bg-gray-50"
                >
                  <User className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  {es.nav.profile}
                </button>
                <button
                  onClick={() => { setMenuOpen(false); setSettingsOpen(true); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#1e293b] transition-colors hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  {es.nav.settings}
                </button>
                <div className="my-1.5 h-px bg-gray-100" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  {es.nav.logout}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
