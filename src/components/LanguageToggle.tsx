import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function LanguageToggle({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { language, toggleLanguage } = useLanguage();

  const baseClasses = 'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors';
  const variantClasses = variant === 'light'
    ? 'bg-white/20 hover:bg-white/30 text-white'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-700';

  return (
    <button
      onClick={toggleLanguage}
      className={`${baseClasses} ${variantClasses}`}
      aria-label="Switch language"
      title={language === 'en' ? 'Badilisha lugha' : 'Switch language'}
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{language === 'en' ? 'EN | SW' : 'SW | EN'}</span>
    </button>
  );
}
