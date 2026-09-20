import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  variant?: 'light' | 'dark';
  iconOnly?: boolean;
}

export function LanguageToggle({ variant = 'light', iconOnly = false }: Props) {
  const { language, toggleLanguage } = useLanguage();

  if (iconOnly) {
    return (
      <button
        onClick={toggleLanguage}
        className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
          variant === 'light'
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
        aria-label="Switch language"
        title={language === 'en' ? 'Badilisha lugha' : 'Switch language'}
      >
        <Globe className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
        variant === 'light'
          ? 'bg-white/20 hover:bg-white/30 text-white'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
      }`}
      aria-label="Switch language"
      title={language === 'en' ? 'Badilisha lugha' : 'Switch language'}
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{language === 'en' ? 'EN | SW' : 'SW | EN'}</span>
    </button>
  );
}
