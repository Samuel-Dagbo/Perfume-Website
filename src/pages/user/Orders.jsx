import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/currency';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    setDetailsLoading(true);
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrderDetails(response.data.order);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    fetchOrderDetails(order._id);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-400', label: 'Pending' },
      confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-400', label: 'Confirmed' },
      processing: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-400', label: 'Processing' },
      shipped: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30', dot: 'bg-indigo-400', label: 'Shipped' },
      delivered: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400', label: 'Delivered' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400', label: 'Cancelled' }
    };
    return configs[status] || configs.pending;
  };

  const getTimelineSteps = (status) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(status);
    
    return steps.map((step, index) => ({
      ...getStatusConfig(step),
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-charcoal-300">
      {/* Header */}
      <div className="bg-charcoal-200/50 border-b border-ivory-100/10">
        <div className="container mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="heading-3 text-ivory-100">My Orders</h1>
            <p className="text-ivory-100/50 font-light mt-1">Track and manage your orders</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-12 text-center backdrop-blur-sm"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-charcoal-200/50 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="heading-4 text-ivory-100 mb-2">No orders yet</h2>
            <p className="text-ivory-100/40 mb-6 font-light">Start shopping to see your orders here</p>
            <Link to="/shop" className="btn-primary inline-block rounded-xl">
              Shop Now
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const statusConfig = getStatusConfig(order.orderStatus);
              const timeline = getTimelineSteps(order.orderStatus);
              
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl overflow-hidden backdrop-blur-sm"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-ivory-100/5">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div>
                          <p className="text-ivory-100 font-medium flex items-center gap-2">
                            Order 
                            <span className="text-gold-300 font-serif">#{order._id.slice(-8).toUpperCase()}</span>
                          </p>
                          <p className="text-sm text-ivory-100/40 font-light mt-1">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-light ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                          <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-2xl font-serif text-gold-300">{formatCurrency(order.total)}</p>
                          <p className="text-sm text-ivory-100/40 font-light">{order.items?.length || 0} items</p>
                        </div>
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="px-6 py-2.5 bg-gold-300/10 border border-gold-300/20 text-gold-300 rounded-xl hover:bg-gold-300/20 transition-colors text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-6">
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {order.items?.slice(0, 4).map((item, i) => (
                        <div key={i} className="flex-shrink-0">
                          <div className="w-16 h-16 bg-charcoal-200/50 rounded-lg overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-charcoal-400">✦</div>
                            )}
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 4 && (
                        <div className="w-16 h-16 bg-charcoal-200/50 rounded-lg flex items-center justify-center text-ivory-100/40 text-sm flex-shrink-0">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-charcoal-300/90 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 z-50 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-charcoal-100 border border-ivory-100/10 rounded-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="p-6 border-b border-ivory-100/10 flex items-center justify-between sticky top-0 bg-charcoal-100 z-10">
                  <div>
                    <h3 className="text-lg font-serif text-ivory-100">Order Details</h3>
                    <p className="text-ivory-100/50 text-sm">#{selectedOrder._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-ivory-100/50 hover:text-ivory-100 hover:bg-ivory-100/5 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Order Timeline */}
                <div className="p-6 border-b border-ivory-100/10">
                  <p className="text-ivory-100/50 text-xs uppercase tracking-wide mb-4">Order Status</p>
                  <div className="flex items-center justify-between">
                    {getTimelineSteps(selectedOrder.orderStatus).map((step, index, arr) => (
                      <React.Fragment key={index}>
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            step.completed ? 'bg-gold-300 text-charcoal-300' : 'bg-charcoal-200/50 text-ivory-100/30'
                          }`}>
                            {step.completed ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : index + 1}
                          </div>
                          <span className={`text-xs mt-2 ${step.completed ? 'text-ivory-100' : 'text-ivory-100/30'}`}>
                            {step.label}
                          </span>
                        </div>
                        {index < arr.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-2 ${index < getTimelineSteps(selectedOrder.orderStatus).findIndex(s => s.current) ? 'bg-gold-300' : 'bg-ivory-100/10'}`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Order Content */}
                {detailsLoading ? (
                  <div className="p-12 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gold-300/30 border-t-gold-300 rounded-full animate-spin" />
                  </div>
                ) : orderDetails && (
                  <>
                    {/* Items */}
                    <div className="p-6 border-b border-ivory-100/10">
                      <p className="text-ivory-100/50 text-xs uppercase tracking-wide mb-4">Items Ordered</p>
                      <div className="space-y-4">
                        {orderDetails.items?.map((item, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-16 h-16 bg-charcoal-200/50 rounded-lg overflow-hidden flex-shrink-0">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-charcoal-400">✦</div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-ivory-100 font-medium">{item.name}</h4>
                              <p className="text-ivory-100/50 text-sm">Qty: {item.quantity}</p>
                            </div>
                            <span className="text-gold-300 font-medium">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {orderDetails.shippingAddress && (
                      <div className="p-6 border-b border-ivory-100/10">
                        <p className="text-ivory-100/50 text-xs uppercase tracking-wide mb-4">Shipping Address</p>
                        <p className="text-ivory-100">{orderDetails.shippingAddress.fullName}</p>
                        <p className="text-ivory-100/70 text-sm">{orderDetails.shippingAddress.street}</p>
                        <p className="text-ivory-100/70 text-sm">
                          {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}
                        </p>
                        <p className="text-ivory-100/70 text-sm">{orderDetails.shippingAddress.phone}</p>
                      </div>
                    )}

                    {/* Order Summary */}
                    <div className="p-6">
                      <p className="text-ivory-100/50 text-xs uppercase tracking-wide mb-4">Order Summary</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-ivory-100/70 font-light text-sm">
                          <span>Subtotal</span>
                          <span>{formatCurrency(orderDetails.subtotal || 0)}</span>
                        </div>
                        <div className="flex justify-between text-ivory-100/70 font-light text-sm">
                          <span>Shipping</span>
                          <span>{orderDetails.shippingCost === 0 ? <span className="text-emerald-400">Free</span> : formatCurrency(orderDetails.shippingCost || 0)}</span>
                        </div>
                        <div className="flex justify-between text-ivory-100/70 font-light text-sm">
                          <span>Tax</span>
                          <span>{formatCurrency(orderDetails.tax || 0)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-serif text-ivory-100 pt-2 border-t border-ivory-100/10">
                          <span>Total</span>
                          <span className="text-gold-300">{formatCurrency(orderDetails.total)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
