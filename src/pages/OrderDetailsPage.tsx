import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, CheckCircle, Truck, Clock } from 'lucide-react';

const OrderDetailsPage = () => {
  const { orderId } = useParams();

  // Mock order data
  const order = {
    id: orderId || 'ORD-001',
    status: 'Delivered',
    date: '2024-01-15',
    deliveryDate: '2024-01-17',
    total: 1600,
    deliveryFee: 0,
    paymentMethod: 'Cash on Delivery',
    address: {
      name: 'Ahmed Mohamed',
      phone: '+20 111 054 5951',
      street: '123 Main Street, Apt 4B',
      city: 'Cairo',
      region: 'Cairo Governorate'
    },
    items: [
      {
        id: '1',
        name: 'RAFAL Care Hair Dryer',
        price: 1600,
        quantity: 1,
        image: 'https://images.pexels.com/photos/7697820/pexels-photo-7697820.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ],
    timeline: [
      { status: 'Order Placed', date: '2024-01-15 10:30 AM', completed: true },
      { status: 'Order Confirmed', date: '2024-01-15 11:00 AM', completed: true },
      { status: 'Preparing for Shipment', date: '2024-01-16 09:00 AM', completed: true },
      { status: 'Out for Delivery', date: '2024-01-17 08:00 AM', completed: true },
      { status: 'Delivered', date: '2024-01-17 02:30 PM', completed: true }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'out for delivery':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'out for delivery':
        return <Truck size={20} className="text-blue-600" />;
      default:
        return <Clock size={20} className="text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-800">Home</Link>
        <span className="mx-2">{'>'}</span>
        <Link to="/orders" className="hover:text-gray-800">Orders</Link>
        <span className="mx-2">{'>'}</span>
        <span className="text-gray-800 font-semibold">Order Details</span>
      </nav>

      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link
          to="/orders"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order #{order.id}</h1>
          <p className="text-gray-600">Placed on {order.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Order Status</h2>
              <div className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span className={`px-3 py-1 text-sm rounded-full font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {order.timeline.map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`w-4 h-4 rounded-full mt-1 ${
                    item.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${
                        item.completed ? 'text-gray-800' : 'text-gray-500'
                      }`}>
                        {item.status}
                      </h3>
                      <span className="text-sm text-gray-500">{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Items</h2>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{item.price} EGP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <MapPin size={24} className="text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Delivery Address</h2>
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold text-gray-800">{order.address.name}</p>
              <p className="text-gray-600">{order.address.phone}</p>
              <p className="text-gray-600">{order.address.street}</p>
              <p className="text-gray-600">{order.address.city}, {order.address.region}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
            
            {/* Order Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <Package size={20} className="text-gray-600" />
                <div>
                  <p className="font-semibold text-gray-800">Order ID</p>
                  <p className="text-gray-600">{order.id}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar size={20} className="text-gray-600" />
                <div>
                  <p className="font-semibold text-gray-800">Order Date</p>
                  <p className="text-gray-600">{order.date}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Truck size={20} className="text-gray-600" />
                <div>
                  <p className="font-semibold text-gray-800">Delivery Date</p>
                  <p className="text-gray-600">{order.deliveryDate}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <CreditCard size={20} className="text-gray-600" />
                <div>
                  <p className="font-semibold text-gray-800">Payment Method</p>
                  <p className="text-gray-600">{order.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{order.total} EGP</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee:</span>
                <span>{order.deliveryFee === 0 ? 'Free' : `${order.deliveryFee} EGP`}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-800 pt-3 border-t border-gray-200">
                <span>Total:</span>
                <span>{order.total + order.deliveryFee} EGP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;