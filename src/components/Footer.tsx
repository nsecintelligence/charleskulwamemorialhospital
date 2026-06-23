import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ContactInfo } from '../types';

export default function Footer() {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [siteName, setSiteName] = useState('City Hospital');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('contact_info').select('*').maybeSingle().then(({ data }) => {
      if (data) setContact(data);
    });
    supabase.from('homepage_content').select('site_name, site_logo_url').maybeSingle().then(({ data }) => {
      if (data?.site_name) setSiteName(data.site_name);
      if (data?.site_logo_url) setLogoUrl(data.site_logo_url);
    });
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-width py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-12 w-12 object-contain rounded-full bg-white p-0.5" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-hospital-red flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {siteName.charAt(0)}
                </div>
              )}
              <span className="text-xl font-bold leading-tight">{siteName}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Providing world-class healthcare with compassion and excellence since 1985.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link to="/services" className="block text-gray-400 hover:text-white transition-colors">Services</Link>
              <Link to="/departments" className="block text-gray-400 hover:text-white transition-colors">Departments</Link>
              <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">About Us</Link>
              <Link to="/news" className="block text-gray-400 hover:text-white transition-colors">News</Link>
              <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-hospital-red" />
                <span>{contact?.address || '123 Medical Center Drive, Healthcare City, HC 12345'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-hospital-red" />
                <span>{contact?.phone || '+1 (555) 123-4567'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-hospital-red" />
                <span>{contact?.email || 'info@cityhospital.com'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-hospital-red" />
                <span className="text-hospital-red font-semibold">Emergency: {contact?.emergency_phone || '+1 (555) 911-0000'}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-3">
              {contact?.social_facebook && (
                <a href={contact.social_facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-hospital-red transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {contact?.social_twitter && (
                <a href={contact.social_twitter} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-hospital-red transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {contact?.social_instagram && (
                <a href={contact.social_instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-hospital-red transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {contact?.social_linkedin && (
                <a href={contact.social_linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-hospital-red transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
