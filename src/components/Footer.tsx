import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="bg-white text-gray-800 pt-12 pb-6 border-t border-gray-200">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('footer.categories')}</h3>
            <ul className="space-y-2">
              <li><Link to="/category/kitchen" className="text-gray-600 hover:text-red-600 transition-colors">Kitchen Appliances</Link></li>
              <li><Link to="/category/home" className="text-gray-600 hover:text-red-600 transition-colors">Home Appliances</Link></li>
              <li><Link to="/category/mixers" className="text-gray-600 hover:text-red-600 transition-colors">Mixers & Blenders</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('footer.account')}</h3>
            <ul className="space-y-2">
              <li><Link to="/account" className="text-gray-600 hover:text-red-600 transition-colors">{t('account.title')}</Link></li>
              <li><Link to="/orders" className="text-gray-600 hover:text-red-600 transition-colors">{t('orders.title')}</Link></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('footer.contact')}</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-gray-600 hover:text-pink-500 transition-colors">
                <Instagram size={24} />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-400 transition-colors">
                <Twitter size={24} />
              </a>
              <a href="#" className="text-gray-600 hover:text-red-500 transition-colors">
                <Youtube size={24} />
              </a>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('footer.payment')}</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="w-8 h-6 bg-orange-500 rounded flex items-center justify-center text-xs font-bold text-white">F</div>
                <span>Fawry</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center text-xs font-bold text-white">MC</div>
                <span>Mastercard</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="w-8 h-6 bg-green-600 rounded flex items-center justify-center text-xs font-bold text-white">P</div>
                <span>Paymob</span>
              </div>
            </div>
          </div>
        </div>

        {/* App Downloads */}
        <div className="border-t border-gray-200 pt-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-900 rounded-lg p-2">
                <Smartphone className="text-white" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Download on the</div>
                <div className="font-semibold text-gray-900">App Store</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-gray-900 rounded-lg p-2">
                <div className="text-white font-bold text-xs">▶</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Get it on</div>
                <div className="font-semibold text-gray-900">Google Play</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-200 pt-6 text-center">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 text-gray-600">
            <div className="flex items-center space-x-2">
              <span>📞</span>
              <span>19265</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✉</span>
              <span>support@rafal.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🏢</span>
              <span>Cairo, Egypt</span>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            {t('footer.copyright')}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;