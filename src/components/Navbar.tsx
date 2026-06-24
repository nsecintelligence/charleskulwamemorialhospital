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
  const [siteName, setSiteName] = useState('City Hospital');
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [topBar, setTopBar] = useState<TopBar | null>(null);
  const location = useLocation();

  useEffect(() => {
    supabase.from('homepage_content').select('site_name, site_logo_url').maybeSingle().then(({ data }) => {
      if (data?.site_name) setSiteName(data.site_name);
      if (data?.site_logo_url) setSiteLogo(data.site_logo_url);
    });
    supabase.from('top_bar').select('*').maybeSingle().then(({ data }) => {
      if (data) setTopBar(data);
    });
  }, []);

  const announcements = topBar?.announcements?.filter(Boolean) || [];
  const hasAnnouncements = announcements.length > 0 && topBar?.is_active;
  const marqueeSpeed = topBar?.marquee_speed || 30;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-red-700 text-white py-2 overflow-hidden">
        <div className="container-width flex items-center gap-4 text-sm">
          {/* Left: Emergency */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Phone className="w-4 h-4" />
            <span className="font-medium">Emergency: {topBar?.emergency_phone || '+1 (555) 911-0000'}</span>
          </div>

          {/* Center: Marquee */}
          <div className="flex-1 overflow-hidden hidden md:block">
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
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <Clock className="w-4 h-4" />
            <span>{topBar?.working_hours || 'Mon-Sun: 24/7'}</span>
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
              <span className="text-green-700 text-xs font-medium leading-tight">Excellence in Care</span>
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
