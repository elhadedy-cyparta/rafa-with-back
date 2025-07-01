import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { language, setLanguage, isRTL } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-all duration-300 transform hover:scale-105 group ${className}`}
      title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
    >
      <Globe 
        size={20} 
        className={`group-hover:rotate-180 transition-transform duration-500 ${isRTL ? 'rtl-flip' : ''}`} 
      />
      <span className="font-semibold transition-all duration-300">
        {language === 'en' ? 'العربية' : 'English'}
      </span>
    </button>
  );
};

export default LanguageToggle;