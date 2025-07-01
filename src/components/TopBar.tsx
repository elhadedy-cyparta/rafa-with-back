import React from 'react';
import { Gift, Truck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TopBar = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-red-600 via-red-700 to-orange-600 text-white py-2 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm">
          <div className="flex items-center space-x-2 animate-pulse">
            <Gift size={16} className="text-yellow-300" />
            <span className="font-medium">{t('topbar.offers')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Truck size={16} className="text-green-300" />
            <span className="font-medium">{t('topbar.delivery')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;