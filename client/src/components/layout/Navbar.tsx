import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, CheckSquare, Trophy, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { es } from '@/i18n/es';

const navItems = [
  { to: '/', label: es.nav.dashboard, icon: LayoutDashboard },
  { to: '/schedule', label: es.nav.schedule, icon: Calendar },
  { to: '/checklist', label: es.nav.checklist, icon: CheckSquare },
  { to: '/habits', label: es.nav.habits, icon: Trophy },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-14 items-center px-6">
        <span className="text-lg font-bold tracking-tight">{es.app.name}</span>

        <nav className="ml-8 flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
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

        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            {es.nav.logout}
          </button>
        </div>
      </div>
    </header>
  );
}
