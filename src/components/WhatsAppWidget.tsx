import React, { useState } from 'react';
import { MessageCircle, X, Phone, Headphones } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, isRTL } = useLanguage();

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  const handleSalesClick = () => {
    const phoneNumber = '+201234567890'; // Replace with actual sales number
    const message = isRTL 
      ? 'مرحباً! أنا مهتم بمنتجاتكم وأود معرفة المزيد عن المبيعات.'
      : 'Hello! I am interested in your products and would like to know more about sales.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const handleSupportClick = () => {
    const phoneNumber = '+201234567891'; // Replace with actual support number
    const message = isRTL
      ? 'مرحباً! أحتاج إلى مساعدة من دعم العملاء.'
      : 'Hello! I need customer support assistance.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Widget Container - Moved to Left Side */}
      <div className="fixed bottom-6 left-6 z-50">
        {/* Options Panel */}
        <div className={`mb-4 transition-all duration-300 transform ${
          isOpen 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden min-w-64">
            {/* Header */}
            <div className="bg-green-600 text-white p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{t('whatsapp.title')}</h3>
                  <p className="text-green-100 text-sm">{t('whatsapp.subtitle')}</p>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="p-2">
              {/* Sales Option */}
              <button
                onClick={handleSalesClick}
                className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors duration-200 rounded-xl group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Phone size={20} className="text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {t('whatsapp.sales.title')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t('whatsapp.sales.description')}
                  </p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </button>

              {/* Customer Support Option */}
              <button
                onClick={handleSupportClick}
                className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors duration-200 rounded-xl group"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Headphones size={20} className="text-orange-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                    {t('whatsapp.support.title')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t('whatsapp.support.description')}
                  </p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </button>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 text-center">
              <p className="text-xs text-gray-500">
                {t('whatsapp.replyTime')}
              </p>
            </div>
          </div>
        </div>

        {/* Main WhatsApp Button */}
        <button
          onClick={toggleWidget}
          className={`relative w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group ${
            isOpen ? 'rotate-45' : 'hover:rotate-12'
          }`}
          aria-label="WhatsApp Support"
        >
          {/* Pulse Animation */}
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-30"></div>
          
          {/* Icon */}
          {isOpen ? (
            <X size={24} className="relative z-10 transition-transform duration-300" />
          ) : (
            <MessageCircle size={24} className="relative z-10 transition-transform duration-300" />
          )}

          {/* Notification Badge */}
          {!isOpen && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce">
              2
            </div>
          )}
        </button>

        {/* Tooltip - Adjusted for Left Side */}
        {!isOpen && (
          <div className="absolute left-20 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {t('whatsapp.needHelp')}
            <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-r-4 border-r-gray-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        )}
      </div>
    </>
  );
};

export default WhatsAppWidget;