import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { TopBar } from '../types';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About Us' },
  { path: '/services', label: 'Services' },
  { path: '/departments', label: 'Departments' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/news', label: 'News' },
  { path: '/faq', label: 'FAQ' },
  { path: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [siteName, setSiteName] = useState('');
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [topBar, setTopBar] = useState<TopBar | null>(null);
  const location = useLocation();

  useEffect(() => {
    Promise.all([
      supabase.from('homepage_content').select('site_name, site_logo_url').maybeSingle(),
      supabase.from('top_bar').select('*').maybeSingle(),
    ]).then(([homeRes, topBarRes]) => {
      if (homeRes.data?.site_name) setSiteName(homeRes.data.site_name);
      if (homeRes.data?.site_logo_url) setSiteLogo(homeRes.data.site_logo_url);
      if (topBarRes.data) setTopBar(topBarRes.data);
      setLoading(false);
    });
  }, []);

  const announcements = topBar?.announcements?.filter(Boolean) || [];
  const hasAnnouncements = announcements.length > 0 && topBar?.is_active;
  const marqueeSpeed = topBar?.marquee_speed || 30;

  // Show skeleton while loading to prevent flash of default values
  if (loading) {
    return (
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="bg-red-700 text-white py-2 h-9" />
        <div className="container-width">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-1">
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-2 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-red-700 text-white py-2 overflow-hidden">
        <div className="container-width">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            {/* Left: Emergency */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Phone className="w-4 h-4" />
              <span className="font-medium">Emergency: {topBar?.emergency_phone || '+1 (555) 911-0000'}</span>
            </div>

            {/* Center: Marquee */}
            <div className="flex-1 overflow-hidden">
              {hasAnnouncements ? (
                <div className="relative overflow-hidden">
                  <div
                    className="whitespace-nowrap animate-marquee inline-block"
                    style={{ animationDuration: `${marqueeSpeed}s` }}
                  >
                    {announcements.map((text, i) => (
                      <span key={i} className="inline-flex items-center gap-2 mx-8">
                        <span className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
                        <span className="font-medium">{text}</span>
                      </span>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {announcements.map((text, i) => (
                      <span key={`dup-${i}`} className="inline-flex items-center gap-2 mx-8">
                        <span className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
                        <span className="font-medium">{text}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-white/80">
                  <span>Mon-Sun: 24/7</span>
                </div>
              )}
            </div>

            {/* Right: Working Hours */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Clock className="w-4 h-4" />
              <span>{topBar?.working_hours || 'Mon-Sun: 24/7'}</span>
            </div>
          </div>

          {/* Mobile Layout - scrolling marquee */}
          <div className="md:hidden overflow-hidden text-xs">
            {hasAnnouncements ? (
              <div className="relative overflow-hidden">
                <div
                  className="whitespace-nowrap animate-marquee inline-block"
                  style={{ animationDuration: `${marqueeSpeed}s` }}
                >
                  {announcements.map((text, i) => (
                    <span key={i} className="inline-flex items-center gap-2 mx-4">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span className="font-medium">{text}</span>
                    </span>
                  ))}
                  {announcements.map((text, i) => (
                    <span key={`dup-${i}`} className="inline-flex items-center gap-2 mx-4">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span className="font-medium">{text}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Emergency: {topBar?.emergency_phone || '+1 (555) 911-0000'}
                </span>
                <span className="text-white/60">|</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {topBar?.working_hours || '24/7'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="container-width">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="h-8 w-auto" loading="lazy" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-sm">
                {siteName.charAt(0)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-green-700 font-bold text-lg leading-tight">{siteName}</span>
              <span className="text-green-700 text-xs font-medium leading-tight">Patient Needs Come First</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-green-700 bg-red-50'
                    : 'text-gray-700 hover:text-green-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="container-width py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === link.path
                    ? 'text-green-700 bg-red-50'
                    : 'text-gray-700 hover:text-green-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
