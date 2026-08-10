import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ContactInfo } from '../types';
import { useLanguage } from '../context/LanguageContext';

export default function EmergencyCallButton() {
  const { t } = useLanguage();
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('contact_info').select('emergency_phone').maybeSingle().then(({ data }) => {
      if (data) setPhone((data as ContactInfo).emergency_phone || null);
    });
  }, []);

  if (!phone) return null;

  return (
    <a
      href={`tel:${phone}`}
      className="md:hidden fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-red-700 text-white shadow-lg flex items-center justify-center hover:bg-red-800 transition-all animate-pulse"
      aria-label={t('common.callEmergency')}
      title={t('common.callEmergency')}
    >
      <Phone className="w-6 h-6" />
    </a>
  );
}
