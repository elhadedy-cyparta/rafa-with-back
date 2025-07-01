import React, { useState, useEffect } from 'react';
import { X, RefreshCw, ExternalLink, ArrowLeft, CheckCircle, Maximize2, Minimize2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaymentIframeProps {
  redirectUrl: string;
  orderId: string;
  orderNumber?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentIframe: React.FC<PaymentIframeProps> = ({ 
  redirectUrl, 
  orderId, 
  orderNumber, 
  onClose,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Handle iframe error
  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load payment gateway. Please try again or open in a new window.');
  };

  // Listen for messages from the iframe (for payment completion)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check if the message is from our payment gateway
      if (event.data && typeof event.data === 'object') {
        // Look for payment success indicators
        if (
          event.data.status === 'success' || 
          event.data.payment_status === 'success' ||
          event.data.success === true
        ) {
          setPaymentCompleted(true);
          onSuccess();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess]);

  // Check for payment success by monitoring URL changes in the iframe
  useEffect(() => {
    const checkIframeUrl = () => {
      try {
        const iframe = document.getElementById('payment-iframe') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          const currentUrl = iframe.contentWindow.location.href;
          
          // Check if the URL contains success indicators
          if (
            currentUrl.includes('success=true') ||
            currentUrl.includes('status=success') ||
            currentUrl.includes('payment_status=success') ||
            currentUrl.includes('callback_success')
          ) {
            setPaymentCompleted(true);
            onSuccess();
          }
        }
      } catch (error) {
        // Cross-origin restrictions might prevent accessing the iframe URL
        console.log('Cannot access iframe URL due to cross-origin restrictions');
      }
    };

    // Check every 2 seconds
    const interval = setInterval(checkIframeUrl, 2000);
    return () => clearInterval(interval);
  }, [onSuccess]);

  // Open in new window
  const openInNewWindow = () => {
    window.open(redirectUrl, '_blank');
  };

  // Refresh iframe
  const refreshIframe = () => {
    setIsLoading(true);
    const iframe = document.getElementById('payment-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = redirectUrl;
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // If payment is completed
  if (paymentCompleted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-8">
              Your payment has been processed successfully. Your order is now confirmed.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-semibold text-gray-800">{orderNumber || orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="font-semibold text-green-600">Completed</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                to="/orders"
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors text-center"
              >
                View My Orders
              </Link>
              <Link
                to="/"
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 ${
      isFullscreen ? 'p-0' : ''
    }`}>
      <div className={`bg-white rounded-2xl overflow-hidden shadow-2xl ${
        isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl max-h-[90vh]'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowLeft size={20} className="cursor-pointer" onClick={onClose} />
            <h2 className="font-semibold">Secure Payment Gateway</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={refreshIframe}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button 
              onClick={openInNewWindow}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Open in New Window"
            >
              <ExternalLink size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        {/* Iframe Container */}
        <div className={`relative ${isFullscreen ? 'h-[calc(100vh-56px)]' : 'h-[70vh]'}`}>
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-700 font-medium">Loading Payment Gateway...</p>
              <p className="text-sm text-gray-500 mt-2">Please wait, do not close this window</p>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10 p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <X size={32} className="text-red-600" />
              </div>
              <p className="text-red-600 font-medium mb-2">Payment Gateway Error</p>
              <p className="text-gray-700 text-center mb-6">{error}</p>
              <div className="flex space-x-4">
                <button
                  onClick={refreshIframe}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={openInNewWindow}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Open in New Window
                </button>
              </div>
            </div>
          )}
          
          {/* Payment Iframe */}
          <iframe
            id="payment-iframe"
            src={redirectUrl}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups"
            allow="payment"
          ></iframe>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-100 p-3 text-center text-sm text-gray-600">
          <p>Secure payment powered by RAFAL Payment Gateway</p>
          <p className="text-xs mt-1">Order ID: {orderNumber || orderId}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentIframe;