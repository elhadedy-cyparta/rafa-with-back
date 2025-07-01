import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const AboutSection = () => {
  const { t, isRTL } = useLanguage();

  const scrollToProducts = () => {
    const productsSection = document.getElementById('featured-products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-8">{t('about.title')}</h2>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full opacity-50 transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-100 rounded-full opacity-50 transform -translate-x-12 translate-y-12"></div>
            
            <div className="relative z-10">
              <div className="text-lg md:text-xl text-gray-700 leading-relaxed space-y-6 mb-8">
                <p>
                  {t('about.description')}
                </p>
                
                <p>
                  {t('about.paragraph1')}
                </p>
                
                <p className="font-semibold text-gray-800">
                  {t('about.paragraph2')}
                </p>
              </div>

              <button
                onClick={scrollToProducts}
                className="group bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center space-x-2">
                  <span>{t('about.exploreButton')}</span>
                  <ArrowRight 
                    size={20} 
                    className={`group-hover:translate-x-1 transition-transform duration-300 ${isRTL ? 'rtl-flip' : ''}`} 
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;