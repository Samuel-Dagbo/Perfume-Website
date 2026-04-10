import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-400', label: 'Pending', icon: '⏳' },
      confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-400', label: 'Confirmed', icon: '✓' },
      processing: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-400', label: 'Processing', icon: '⚙️' },
      shipped: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30', dot: 'bg-indigo-400', label: 'Shipped', icon: '🚚' },
      delivered: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400', label: 'Delivered', icon: '✨' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400', label: 'Cancelled', icon: '✕' }
    };
    return configs[status] || configs.pending;
  };

  const getTimelineSteps = (status) => {
    const steps = [
      { key: 'pending', label: 'Placed', icon: '📋' },
      { key: 'confirmed', label: 'Confirmed', icon: '✓' },
      { key: 'processing', label: 'Preparing', icon: '⚙️' },
      { key: 'shipped', label: 'Shipped', icon: '🚚' },
      { key: 'delivered', label: 'Delivered', icon: '✨' }
    ];
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex && status !== 'cancelled',
      current: index === currentIndex && status !== 'cancelled',
      cancelled: status === 'cancelled'
    }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-emerald-400 bg-emerald-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      default: return 'text-ivory-100/70 bg-charcoal-200/50';
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-300">
      <div className="bg-gradient-to-b from-charcoal-200/50 to-charcoal-300 border-b border-ivory-100/10">
        <div className="container mx-auto px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl lg:text-4xl font-serif text-ivory-100 mb-2">My Orders</h1>
            <p className="text-ivory-100/50">Track and manage your luxury purchases</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-56 rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-charcoal-100/50 border border-ivory-100/10 rounded-3xl p-16 text-center backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-charcoal-200/50 to-charcoal-100/50 rounded-full flex items-center justify-center"
            >
              <svg className="w-14 h-14 text-ivory-100/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-serif text-ivory-100 mb-3">No orders yet</h2>
            <p className="text-ivory-100/40 mb-8 font-light max-w-md mx-auto">
              Your luxury fragrance journey begins here. Explore our collection and find your signature scent.
            </p>
            <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-4 bg-gold-300 text-charcoal-300 rounded-xl font-medium hover:bg-gold-200 transition-all shadow-lg shadow-gold-300/20">
              <span>Explore Collection</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const statusConfig = getStatusConfig(order.orderStatus);
              const timeline = getTimelineSteps(order.orderStatus);
              const currentStep = timeline.findIndex(s => s.current);
              
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-charcoal-100/50 border border-ivory-100/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-gold-300/20 transition-all group"
                >
                  <div className="p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <div>
                            <p className="text-ivory-100 font-medium flex items-center gap-2">
                              Order 
                              <span className="text-gold-300 font-serif text-lg">#{order._id.slice(-8).toUpperCase()}</span>
                            </p>
                            <p className="text-sm text-ivory-100/40 font-light mt-1">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                            <span>{statusConfig.icon}</span>
                            {statusConfig.label}
                          </span>
                        </div>

                        {/* Mini Progress Bar */}
                        {order.orderStatus !== 'cancelled' && (
                          <div className="hidden lg:flex items-center gap-2">
                            {timeline.map((step, i) => (
                              <React.Fragment key={step.key}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                                  step.completed ? 'bg-gold-300 text-charcoal-300' : 'bg-charcoal-200/50 text-ivory-100/30'
                                }`}>
                                  {step.completed ? '✓' : i + 1}
                                </div>
                                {i < timeline.length - 1 && (
                                  <div className={`w-12 h-0.5 ${step.completed ? 'bg-gold-300' : 'bg-ivory-100/10'}`} />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-2xl font-serif text-gold-300">{formatCurrency(order.total)}</p>
                          <p className="text-sm text-ivory-100/40 font-light">{order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}</p>
                        </div>
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="px-6 py-3 bg-gold-300/10 border border-gold-300/30 text-gold-300 rounded-xl hover:bg-gold-300/20 transition-all font-medium text-sm flex items-center gap-2"
                        >
                          <span>Details</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="px-6 lg:px-8 pb-6 lg:pb-8 border-t border-ivory-100/5 pt-6">
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {order.items?.slice(0, 5).map((item, i) => (
                        <div key={i} className="flex-shrink-0 group/item">
                          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-charcoal-100 rounded-xl overflow-hidden border border-ivory-100/5 group-hover/item:border-gold-300/30 transition-colors">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-xl">✦</div>
                            )}
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 5 && (
                        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-charcoal-100/50 rounded-xl flex items-center justify-center text-ivory-100/40 text-sm flex-shrink-0 border border-ivory-100/5">
                          +{order.items.length - 5}
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

      {/* Enhanced Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-charcoal-500/95 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 z-[101] max-w-3xl w-full lg:max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-charcoal-100/95 border border-ivory-100/10 rounded-3xl overflow-hidden shadow-2xl">
                {detailsLoading ? (
                  <div className="p-20 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-3 border-gold-300/30 border-t-gold-300 rounded-full animate-spin mb-4" />
                    <p className="text-ivory-100/50">Loading order details...</p>
                  </div>
                ) : orderDetails && (
                  <>
                    {/* Modal Header */}
                    <div className="sticky top-0 z-10 bg-charcoal-100/95 backdrop-blur-sm border-b border-ivory-100/10 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-serif text-ivory-100">Order Details</h3>
                            <span className="px-3 py-1 bg-charcoal-200/50 rounded-full text-ivory-100/70 text-sm">
                              #{selectedOrder._id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-ivory-100/40 mt-1">{formatDate(selectedOrder.createdAt)}</p>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(null)}
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-ivory-100/50 hover:text-ivory-100 hover:bg-charcoal-200/50 transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="p-6 border-b border-ivory-100/10 bg-gradient-to-r from-charcoal-100/50 to-transparent">
                      <div className="flex items-center justify-between">
                        {getTimelineSteps(selectedOrder.orderStatus).map((step, index, arr) => (
                          <React.Fragment key={step.key}>
                            <div className="flex flex-col items-center">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg mb-2 transition-all ${
                                step.cancelled
                                  ? 'bg-red-500/20 text-red-400'
                                  : step.completed
                                    ? 'bg-gold-300 text-charcoal-300 shadow-lg shadow-gold-300/30'
                                    : step.current
                                      ? 'bg-gold-300/20 text-gold-300 border-2 border-gold-300'
                                      : 'bg-charcoal-200/50 text-ivory-100/30'
                              }`}>
                                {step.cancelled ? '✕' : step.completed ? '✓' : step.icon}
                              </div>
                              <span className={`text-xs font-medium ${
                                step.cancelled
                                  ? 'text-red-400'
                                  : step.completed || step.current
                                    ? 'text-ivory-100'
                                    : 'text-ivory-100/30'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                            {index < arr.length - 1 && (
                              <div className={`flex-1 h-1 mx-2 rounded ${
                                step.completed && !step.cancelled ? 'bg-gold-300' : 'bg-ivory-100/10'
                              }`} />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Order Items */}
                      <div>
                        <h4 className="text-sm text-ivory-100/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          Items Ordered
                        </h4>
                        <div className="space-y-4">
                          {orderDetails.items?.map((item, i) => (
                            <div key={i} className="flex gap-4 p-4 bg-charcoal-200/30 rounded-xl">
                              <div className="w-20 h-20 bg-charcoal-100 rounded-lg overflow-hidden flex-shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-charcoal-400">✦</div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h5 className="text-ivory-100 font-medium">{item.name}</h5>
                                <p className="text-sm text-ivory-100/50 mt-1">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-gold-300 font-medium">{formatCurrency(item.price * item.quantity)}</p>
                                <p className="text-sm text-ivory-100/40 mt-1">{formatCurrency(item.price)} each</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Two Column Layout */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Shipping Address */}
                        {orderDetails.shippingAddress && (
                          <div className="p-5 bg-charcoal-200/30 rounded-xl">
                            <h4 className="text-sm text-ivory-100/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Delivery Address
                            </h4>
                            <p className="text-ivory-100 font-medium">{orderDetails.shippingAddress.fullName}</p>
                            <p className="text-ivory-100/70 text-sm mt-1">{orderDetails.shippingAddress.street}</p>
                            <p className="text-ivory-100/70 text-sm">
                              {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}
                            </p>
                            <p className="text-ivory-100/70 text-sm mt-2">{orderDetails.shippingAddress.phone}</p>
                          </div>
                        )}

                        {/* Payment Info */}
                        <div className="p-5 bg-charcoal-200/30 rounded-xl">
                          <h4 className="text-sm text-ivory-100/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Payment Details
                          </h4>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(orderDetails.paymentStatus)}`}>
                              {orderDetails.paymentStatus?.toUpperCase() || 'PENDING'}
                            </span>
                            <span className="text-ivory-100/50 text-sm capitalize">
                              via {orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                                  orderDetails.paymentMethod === 'momo' ? 'Mobile Money' :
                                  orderDetails.paymentMethod === 'card' ? 'Card' : 'Bank Transfer'}
                            </span>
                          </div>
                          <p className="text-2xl font-serif text-gold-300">{formatCurrency(orderDetails.total)}</p>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="p-5 bg-charcoal-200/30 rounded-xl">
                        <h4 className="text-sm text-ivory-100/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Order Summary
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-ivory-100/70">
                            <span>Subtotal</span>
                            <span>{formatCurrency(orderDetails.subtotal || 0)}</span>
                          </div>
                          <div className="flex justify-between text-ivory-100/70">
                            <span>Shipping</span>
                            <span className={orderDetails.shippingCost === 0 ? 'text-emerald-400' : ''}>
                              {orderDetails.shippingCost === 0 ? 'Free' : formatCurrency(orderDetails.shippingCost || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between text-ivory-100/70">
                            <span>Tax (3%)</span>
                            <span>{formatCurrency(orderDetails.tax || 0)}</span>
                          </div>
                          {orderDetails.discount > 0 && (
                            <div className="flex justify-between text-emerald-400">
                              <span>Discount</span>
                              <span>-{formatCurrency(orderDetails.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-3 border-t border-ivory-100/10">
                            <span className="text-ivory-100 font-medium text-lg">Total</span>
                            <span className="text-gold-300 font-serif text-xl">{formatCurrency(orderDetails.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-4 pt-4">
                        <Link
                          to="/shop"
                          className="flex-1 py-4 border border-ivory-100/20 text-ivory-100 rounded-xl hover:bg-charcoal-200/50 transition-colors text-center font-medium"
                        >
                          Continue Shopping
                        </Link>
                        <button className="flex-1 py-4 bg-gold-300 text-charcoal-300 rounded-xl hover:bg-gold-200 transition-colors font-medium flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Invoice
                        </button>
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
