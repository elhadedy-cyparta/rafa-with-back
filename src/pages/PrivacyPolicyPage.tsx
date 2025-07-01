import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Database, Users, Lock, Mail, Calendar, FileText } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: [
        {
          subtitle: 'Information You Provide:',
          text: 'Such as your name, email address, phone number, and contact details when creating an account or contacting us.'
        },
        {
          subtitle: 'Automatic Information:',
          text: 'Including IP address, browser type, and operating system when you visit our website.'
        },
        {
          subtitle: 'Cookies:',
          text: 'We use cookies to enhance your experience and understand how you interact with the site.'
        }
      ]
    },
    {
      icon: Eye,
      title: 'How We Use the Information',
      content: [
        { text: 'To operate and maintain our services.' },
        { text: 'To improve and personalize your user experience.' },
        { text: 'To communicate with you for customer support and marketing.' },
        { text: 'To analyze trends and site usage.' }
      ]
    },
    {
      icon: Users,
      title: 'Sharing Information with Third Parties',
      content: [
        {
          text: 'We do not share your personal information with third parties, except in the following cases:'
        },
        { text: 'With service providers who help us operate our website and services.' },
        { text: 'When required by law to disclose information.' }
      ]
    },
    {
      icon: FileText,
      title: 'Your Rights',
      content: [
        { text: 'Right to access your personal data.' },
        { text: 'Right to correct inaccurate information.' },
        { text: 'Right to request deletion of your data.' }
      ]
    },
    {
      icon: Lock,
      title: 'Data Protection',
      content: [
        {
          text: 'We implement reasonable security measures to protect your personal data from unauthorized access or loss.'
        }
      ]
    },
    {
      icon: Calendar,
      title: 'Changes to the Privacy Policy',
      content: [
        {
          text: 'We may update this policy from time to time. Significant changes will be communicated via email or posted on the website.'
        }
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
          <span className="text-gray-800 font-semibold">Privacy Policy</span>
        </nav>

        {/* Header without Icon */}
        <div className="text-center mb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6 hover:shadow-xl transition-all duration-300">
            <h1 className="text-4xl font-bold text-gray-800">Privacy Policy</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rafal is committed to protecting your privacy. This privacy policy outlines how we collect, 
            use, share, and safeguard your personal data during your interaction with our website.
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800">{section.title}</h2>
                  <div className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="text-gray-700 leading-relaxed">
                        {item.subtitle && (
                          <span className="font-semibold text-gray-800">{item.subtitle} </span>
                        )}
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Contact Section - Updated Color to match site palette */}
            <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Mail size={24} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                  <p className="text-white text-opacity-90 leading-relaxed mb-4">
                    If you have questions about this policy, feel free to contact our support team.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <span>📞</span>
                      <span>19265</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>✉</span>
                      <span>support@rafal.com</span>
                    </div>
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

export default PrivacyPolicyPage;