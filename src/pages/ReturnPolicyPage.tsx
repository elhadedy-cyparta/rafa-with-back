import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertTriangle, Shield, CreditCard, Package } from 'lucide-react';

const ReturnPolicyPage = () => {
  const sections = [
    {
      icon: FileText,
      title: 'Return Process Requirements',
      content: [
        'Proof of purchase (order number, invoice, etc.).',
        'The reason for return must meet the return acceptance conditions.',
        'Contact customer service within 24 hours if a damaged or incomplete product was received.',
        'All items, including free gifts, must be returned. Partial returns will be rejected.'
      ]
    },
    {
      icon: CheckCircle,
      title: 'Product Inspection',
      content: [
        'The product will be inspected upon return.',
        'If no damage due to misuse is found, a refund will be processed.',
        'A response will be issued within 3–5 business days.'
      ]
    },
    {
      icon: Package,
      title: 'Product Return Conditions',
      content: [
        'The product must be returned in its original, unused condition.',
        'If this is not met, the return will be rejected.'
      ]
    },
    {
      icon: CreditCard,
      title: 'Refund Policy',
      content: [
        'If you\'re not completely satisfied, Rafal may refund the product\'s value within 30 days, in accordance with the Consumer Protection Law.',
        'For exchanges involving price differences or product returns, the customer bears delivery and return shipping costs.',
        'According to Article 40, Paragraphs 1 and 2 of the Consumer Protection Law, the amount will be refunded via the same payment method (card, InstaPay, Vodafone Cash). It may take up to 30 days to process.'
      ]
    },
    {
      icon: AlertTriangle,
      title: 'Wrong Product Received',
      content: [
        'We apologize for any mistakes. You may return the incorrect product within 30 days if it\'s defective or wrong.'
      ]
    },
    {
      icon: Shield,
      title: 'Warranty',
      content: [
        'Warranty does not apply to damage caused by misuse, unauthorized service, or third-party modifications.',
        'Removing the warranty seal voids the warranty.',
        'By accepting the invoice, the customer confirms all items are in good condition and agrees to the terms above.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-600">
          <Link to="/" className="hover:text-gray-800">Home</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-gray-800 font-semibold">Return & Refund Policy</span>
        </nav>

        {/* Header without Icon */}
        <div className="text-center mb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6 hover:shadow-xl transition-all duration-300">
            <h1 className="text-4xl font-bold text-gray-800">Return & Refund Policy</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We want you to be completely satisfied with your purchase. Please review our return and refund policy below.
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800">{section.title}</h2>
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            {/* Important Notice - Updated Color to match site palette */}
            <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Clock size={24} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Important Notice</h2>
                  <p className="text-white text-opacity-90 leading-relaxed mb-4">
                    All returns must be initiated within <strong>30 days</strong> of purchase. 
                    Please ensure products are in their original condition with all accessories and packaging.
                  </p>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <p className="text-sm">
                      <strong>Quick Tip:</strong> Contact our customer service team at 19265 or support@rafal.com 
                      before returning any product to ensure a smooth process.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-red-500">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Need Help with Returns?</h3>
              <p className="text-gray-600 mb-4">
                Our customer service team is here to help you with any return or refund questions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span>📞</span>
                  <div>
                    <p className="font-semibold text-gray-800">Phone Support</p>
                    <p className="text-gray-600">19265</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span>✉</span>
                  <div>
                    <p className="font-semibold text-gray-800">Email Support</p>
                    <p className="text-gray-600">support@rafal.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center mt-12 text-gray-500">
            <p>Last updated: January 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyPage;