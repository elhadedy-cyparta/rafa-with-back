import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, AlertCircle, Scale, Building, Mail, CheckCircle } from 'lucide-react';

const TermsConditionsPage = () => {
  const sections = [
    {
      icon: Users,
      title: 'Permitted Use',
      content: [
        'You may use the website only for its intended purpose. Commercial use is prohibited without prior approval.',
        'The user agrees not to:',
        '• Systematically collect data from the website.',
        '• Use the website without authorization.',
        '• Use purchasing agents to buy products.',
        '• Advertise or sell products/services through the website.',
        '• Deceive or mislead users or the website.',
        '• Automate use of the site via bots or scripts.',
        '• Harass or threaten our employees or users.',
        '• Remove copyright or legal notices.',
        '• Upload viruses or malicious content.',
        '• Violate any applicable laws or regulations.'
      ]
    },
    {
      icon: AlertCircle,
      title: 'Age Requirement',
      content: [
        'Users must be 18 years or older. If under 18, use of the website is not allowed without parental permission.'
      ]
    },
    {
      icon: Shield,
      title: 'Intellectual Property',
      content: [
        'All content on this website is protected by copyright. Unauthorized use is prohibited.'
      ]
    },
    {
      icon: CheckCircle,
      title: 'Return Policy',
      content: [
        'Refunds are available within 30 days of purchase if you\'re not satisfied, in line with the Consumer Protection Law.'
      ]
    },
    {
      icon: Scale,
      title: 'Website Liability',
      content: [
        'Rafal is not responsible for external websites linked from our platform. You should review their terms and conditions independently.'
      ]
    },
    {
      icon: Users,
      title: 'Agreement to Terms',
      content: [
        'These terms form a legally binding agreement between you (the user) and Rafal.',
        'By using this website, you confirm that you\'ve read, understood, and agreed to these terms.',
        'If you do not agree, you must stop using the site immediately.',
        'We may update the terms at any time. Updates take effect once posted and will be indicated by a revised date.',
        'The website may also be updated to reflect product or service changes or user needs.'
      ]
    },
    {
      icon: Building,
      title: 'Company Information',
      content: [
        'Rafal is owned by New Way Electric Company.',
        'By using this website, you agree to abide by these terms and conditions.'
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
          <span className="text-gray-800 font-semibold">Terms & Conditions</span>
        </nav>

        {/* Header without Icon */}
        <div className="text-center mb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6 hover:shadow-xl transition-all duration-300">
            <h1 className="text-4xl font-bold text-gray-800">Terms & Conditions</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Please read these terms and conditions carefully before using our website. 
            By accessing or using our service, you agree to be bound by these terms.
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
                        {item.startsWith('•') ? (
                          <div className="flex items-start space-x-3 ml-4">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{item.substring(2)}</span>
                          </div>
                        ) : (
                          <p className={item.endsWith(':') ? 'font-semibold text-gray-800' : ''}>{item}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Legal Notice */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Scale size={24} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Legal Binding Agreement</h2>
                  <p className="text-white text-opacity-90 leading-relaxed mb-4">
                    These terms and conditions constitute a legally binding agreement between you and Rafal. 
                    Please ensure you understand all terms before using our services.
                  </p>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <p className="text-sm">
                      <strong>Important:</strong> If you do not agree with any part of these terms, 
                      you must discontinue use of our website immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Section - Updated Color to match site palette */}
            <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Mail size={24} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Contact</h2>
                  <p className="text-white text-opacity-90 leading-relaxed mb-4">
                    For any questions regarding these terms, please contact our support team.
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
                    <div className="flex items-center space-x-2">
                      <span>🏢</span>
                      <span>Cairo, Egypt</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>🏭</span>
                      <span>New Way Electric Company</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center mt-12 text-gray-500">
            <p>Last updated: January 2024</p>
            <p className="mt-2 text-sm">These terms are governed by the laws of Egypt</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditionsPage;