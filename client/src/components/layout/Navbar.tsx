import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, CheckSquare, Trophy, LogOut, HomeIcon, User, Settings, Menu, X } from 'lucide-react';
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileNavOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    setMobileNavOpen(false);
    logout();
    navigate('/login');
  };

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-card">
        <div className="layout-max mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6">
          <Link to="/" className="text-lg font-bold tracking-tight">{es.app.name}</Link>

          <nav className="ml-8 hidden items-center gap-1 md:flex">
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

          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent md:hidden"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="ml-auto hidden items-center md:flex" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {initial}
              </div>
              <span className="text-sm font-medium">{user?.name}</span>
            </button>

            {menuOpen && (
              <div className="dropdown-in absolute right-2 sm:right-6 top-13 w-56 rounded-xl bg-card py-1.5 shadow-lg ring-1 ring-black/5">
                <button
                  onClick={() => { setMenuOpen(false); setProfileOpen(true); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-accent"
                >
                  <User className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  {es.nav.profile}
                </button>
                <button
                  onClick={() => { setMenuOpen(false); setSettingsOpen(true); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-accent"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  {es.nav.settings}
                </button>
                <div className="my-1.5 h-px bg-muted" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  {es.nav.logout}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setMobileNavOpen(false)} />
          <nav className="dropdown-in absolute left-0 right-0 top-14 flex flex-col gap-1 border-b bg-card px-4 py-3 shadow-lg">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/' || to === '/panel'}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
            <div className="my-1 h-px bg-muted" />
            <button
              onClick={() => { setMobileNavOpen(false); setProfileOpen(true); }}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
            >
              <User className="h-5 w-5" />
              {es.nav.profile}
            </button>
            <button
              onClick={() => { setMobileNavOpen(false); setSettingsOpen(true); }}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
            >
              <Settings className="h-5 w-5" />
              {es.nav.settings}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
            >
              <LogOut className="h-5 w-5" />
              {es.nav.logout}
            </button>
          </nav>
        </div>
      )}

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
