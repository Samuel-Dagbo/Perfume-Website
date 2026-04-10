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
              
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-charcoal-100/50 border border-ivory-100/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-gold-300/20 transition-all"
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
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 lg:px-8 pb-6 lg:pb-8 border-t border-ivory-100/5 pt-6">
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {order.items?.slice(0, 5).map((item, i) => (
                        <div key={i} className="flex-shrink-0">
                          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-charcoal-100 rounded-xl overflow-hidden border border-ivory-100/5">
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

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal 
            order={selectedOrder} 
            details={orderDetails} 
            loading={detailsLoading}
            onClose={() => { setSelectedOrder(null); setOrderDetails(null); }}
            getTimelineSteps={getTimelineSteps}
            formatDate={formatDate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const OrderDetailsModal = ({ order, details, loading, onClose, getTimelineSteps, formatDate }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-emerald-400 bg-emerald-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      default: return 'text-ivory-100/70 bg-charcoal-200/50';
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-charcoal-100 border border-ivory-100/10 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl pointer-events-auto"
        >
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-2 border-gold-300/30 border-t-gold-300 rounded-full animate-spin mb-4" />
              <p className="text-ivory-100/50">Loading order details...</p>
            </div>
          ) : details && (
            <>
              <div className="bg-charcoal-200/50 border-b border-ivory-100/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-serif text-ivory-100">Order Details</h3>
                    <p className="text-sm text-ivory-100/50 mt-1">#{order._id.slice(-8).toUpperCase()} • {formatDate(order.createdAt)}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-ivory-100/50 hover:text-ivory-100 hover:bg-charcoal-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(85vh-180px)]">
                <div className="p-6 space-y-6">
                  {/* Status Timeline */}
                  <div>
                    <h4 className="text-xs text-ivory-100/50 uppercase tracking-wider mb-4">Order Status</h4>
                    <div className="flex items-center justify-between">
                      {getTimelineSteps(order.orderStatus).map((step, index, arr) => (
                        <React.Fragment key={step.key}>
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm mb-2 ${
                              step.cancelled
                                ? 'bg-red-500/20 text-red-400'
                                : step.completed
                                  ? 'bg-gold-300 text-charcoal-300'
                                  : 'bg-charcoal-200/50 text-ivory-100/30'
                            }`}>
                              {step.cancelled ? '✕' : step.completed ? '✓' : step.icon}
                            </div>
                            <span className="text-xs text-ivory-100/50">{step.label}</span>
                          </div>
                          {index < arr.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 ${step.completed && !step.cancelled ? 'bg-gold-300' : 'bg-ivory-100/10'}`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="text-xs text-ivory-100/50 uppercase tracking-wider mb-4">Items</h4>
                    <div className="space-y-3">
                      {details.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-charcoal-200/30 rounded-xl">
                          <div className="w-14 h-14 bg-charcoal-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-charcoal-400">✦</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-ivory-100 font-medium truncate">{item.name}</p>
                            <p className="text-sm text-ivory-100/50">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-gold-300 font-medium">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address & Payment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {details.shippingAddress && (
                      <div className="p-4 bg-charcoal-200/30 rounded-xl">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-xs text-ivory-100/50 uppercase tracking-wider">Delivery Address</h4>
                          {details.shippingAddress.navigationUrl && (
                            <a
                              href={details.shippingAddress.navigationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs font-medium flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                              </svg>
                              Navigate
                            </a>
                          )}
                        </div>
                        <p className="text-ivory-100 text-sm">{details.shippingAddress.fullName}</p>
                        {details.shippingAddress.placeName && (
                          <p className="text-gold-300 text-sm font-medium">{details.shippingAddress.placeName}</p>
                        )}
                        <p className="text-ivory-100/70 text-sm">{details.shippingAddress.street}</p>
                        <p className="text-ivory-100/70 text-sm">{details.shippingAddress.city}, {details.shippingAddress.state}</p>
                        <p className="text-ivory-100/70 text-sm">{details.shippingAddress.phone}</p>
                      </div>
                    )}
                    <div className="p-4 bg-charcoal-200/30 rounded-xl">
                      <h4 className="text-xs text-ivory-100/50 uppercase tracking-wider mb-2">Payment</h4>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(details.paymentStatus)}`}>
                        {details.paymentStatus?.toUpperCase() || 'PENDING'}
                      </span>
                      <p className="text-ivory-100/70 text-sm mt-2 capitalize">{details.paymentMethod}</p>
                      <p className="text-xl font-serif text-gold-300 mt-2">{formatCurrency(details.total)}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-charcoal-200/30 rounded-xl">
                    <h4 className="text-xs text-ivory-100/50 uppercase tracking-wider mb-3">Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-ivory-100/70">Subtotal</span>
                        <span className="text-ivory-100">{formatCurrency(details.subtotal || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ivory-100/70">Shipping</span>
                        <span className={details.shippingCost === 0 ? 'text-emerald-400' : 'text-ivory-100'}>
                          {details.shippingCost === 0 ? 'Free' : formatCurrency(details.shippingCost || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ivory-100/70">Tax</span>
                        <span className="text-ivory-100">{formatCurrency(details.tax || 0)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-ivory-100/10">
                        <span className="text-ivory-100 font-medium">Total</span>
                        <span className="text-gold-300 font-serif">{formatCurrency(details.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      to="/shop"
                      onClick={onClose}
                      className="flex-1 py-3 border border-ivory-100/20 text-ivory-100 rounded-xl hover:bg-charcoal-200/50 transition-colors text-center text-sm font-medium"
                    >
                      Continue Shopping
                    </Link>
                    <button className="flex-1 py-3 bg-gold-300 text-charcoal-300 rounded-xl hover:bg-gold-200 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Invoice
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default Orders;
