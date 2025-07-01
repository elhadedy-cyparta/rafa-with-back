import React from 'react';
import { ShoppingCart, Wrench, Gem, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const WhyChooseSection = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: ShoppingCart,
      title: t('why.feature1.title'),
      description: t('why.feature1.description'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Wrench,
      title: t('why.feature2.title'),
      description: t('why.feature2.description'),
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Gem,
      title: t('why.feature3.title'),
      description: t('why.feature3.description'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Shield,
      title: t('why.feature4.title'),
      description: t('why.feature4.description'),
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('why.title')}</h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          {t('why.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-100"
          >
            <div className="flex items-start space-x-6">
              <div className={`${feature.bgColor} ${feature.color} p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                <feature.icon size={32} />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-red-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseSection;