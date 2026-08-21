import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  HeartPulse,
  FileText,
  Stethoscope,
  Calendar,
  BedDouble,
  Users,
  FlaskConical,
  Scan,
  Pill,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

type HmsRole = 'admin' | 'doctor' | 'nurse' | 'staff';

const navGroups = [
  {
    label: 'Clinical',
    items: [
      { path: '/hms/patients', label: 'Patients', icon: HeartPulse },
      { path: '/hms/ehr', label: 'Health Records', icon: FileText },
      { path: '/hms/cpoe', label: 'Order Entry (CPOE)', icon: Stethoscope },
    ],
  },
  {
    label: 'Administrative',
    items: [
      { path: '/hms/appointments', label: 'Appointments & Shifts', icon: Calendar },
      { path: '/hms/beds', label: 'Beds & Wards', icon: BedDouble },
      { path: '/hms/staff', label: 'Staff & HR', icon: Users },
    ],
  },
  {
    label: 'Diagnostics',
    items: [
      { path: '/hms/labs', label: 'Laboratory (LIS)', icon: FlaskConical },
      { path: '/hms/radiology', label: 'Radiology (RIS)', icon: Scan },
      { path: '/hms/pharmacy', label: 'Pharmacy', icon: Pill },
    ],
  },
];

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  doctor: 'bg-blue-100 text-blue-700',
  nurse: 'bg-emerald-100 text-emerald-700',
  staff: 'bg-amber-100 text-amber-700',
};

export default function HmsLayout() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [role, setRole] = useState<string>('staff');

  useEffect(() => {
    supabase.from('homepage_content').select('site_name').maybeSingle().then(({ data }) => {
      if (data?.site_name) setSiteName(data.site_name);
    });
    if (user) {
      supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle().then(({ data }) => {
        if (data?.role) setRole(data.role);
      });
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/hms/login');
  };

  const allNavItems = navGroups.flatMap((g) => g.items);
  const currentLabel = allNavItems.find((l) => location.pathname === l.path)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/hms" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              {siteName.charAt(0) || 'H'}
            </div>
            <div>
              <span className="font-bold text-sm block leading-tight">{siteName || 'Hospital'}</span>
              <span className="text-xs text-slate-400">HMS Portal</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dashboard link */}
        <div className="p-3 border-b border-slate-800">
          <Link
            to="/hms"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/hms' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to website
          </Link>
          <div className="text-xs text-slate-400 truncate">{user?.email}</div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800">{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[role] || roleColors.staff}`}>
              {role}
            </span>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Secure Session</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
