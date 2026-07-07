import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Stethoscope,
  Building2,
  Info,
  Image,
  Newspaper,
  HelpCircle,
  Phone,
  Home,
  LogOut,
  Menu,
  PanelTop,
  Sliders,
  DollarSign,
  FileText,
  Calendar,
  Shield,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const adminLinks = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/homepage', label: 'Homepage', icon: Home },
  { path: '/admin/hero-slides', label: 'Hero Slides', icon: Sliders },
  { path: '/admin/top-bar', label: 'Top Bar', icon: PanelTop },
  { path: '/admin/services', label: 'Services', icon: Stethoscope },
  { path: '/admin/departments', label: 'Departments', icon: Building2 },
  { path: '/admin/about', label: 'About Us', icon: Info },
  { path: '/admin/gallery', label: 'Gallery', icon: Image },
  { path: '/admin/news', label: 'News', icon: Newspaper },
  { path: '/admin/faq', label: 'FAQ', icon: HelpCircle },
  { path: '/admin/contact', label: 'Contact', icon: Phone },
  { path: '/admin/prices', label: 'Prices', icon: DollarSign },
  { path: '/admin/forms', label: 'Forms', icon: FileText },
  { path: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { path: '/admin/security', label: 'Security', icon: Shield },
];

export default function AdminLayout() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siteName, setSiteName] = useState('');

  useEffect(() => {
    supabase.from('homepage_content').select('site_name').maybeSingle().then(({ data }) => {
      if (data?.site_name) setSiteName(data.site_name);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-xs">
              {siteName.charAt(0)}
            </div>
            <span className="font-bold text-lg">{siteName}</span>
          </Link>
          <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>
        <nav className="p-3 space-y-1">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-green-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="text-xs text-gray-400 mb-3 truncate">{user?.email}</div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm h-14 flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-600"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            {adminLinks.find((l) => l.path === location.pathname)?.label || 'Dashboard'}
          </h1>
          <div className="w-8" />
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
