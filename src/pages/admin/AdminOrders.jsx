import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/currency';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/orders/all?${params.toString()}`);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: status });
      showToast(`Order status updated to ${status}`);
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: status });
      }
    } catch (error) {
      showToast('Failed to update status', 'error');
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

  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    await fetchOrderDetails(order._id);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
      confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-400' },
      processing: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-400' },
      shipped: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30', dot: 'bg-indigo-400' },
      delivered: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' }
    };
    return configs[status] || configs.pending;
  };

  const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif text-ivory-100">Orders</h1>
          <p className="text-ivory-100/50 text-sm mt-1">
            {pagination.totalOrders ? `${pagination.totalOrders} total orders` : 'Manage and track all orders'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ivory-100/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, phone, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-charcoal-100/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 rounded-xl focus:outline-none focus:border-gold-300 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-charcoal-100/50 border border-ivory-100/10 text-ivory-100 rounded-xl focus:outline-none focus:border-gold-300 transition-colors min-w-[160px]"
        >
          <option value="">All Status</option>
          {statusOptions.map(status => (
            <option key={status} value={status} className="capitalize">{status.charAt(0).toUpperCase() + status.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl border ${
              toast.type === 'success' ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400' : 'bg-red-900/30 border-red-500/30 text-red-400'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-charcoal-200/50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-serif text-ivory-100 mb-2">No orders found</h3>
          <p className="text-ivory-100/50 text-sm">Orders will appear here when customers make purchases</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.orderStatus);
              
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-6 backdrop-blur-sm hover:border-ivory-100/20 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-light border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                        <span className="text-ivory-100/40 text-xs">{formatDate(order.createdAt)}</span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div>
                          <p className="text-ivory-100 font-medium">#{order._id.slice(-8).toUpperCase()}</p>
                          <p className="text-ivory-100/50 text-sm">
                            {order.shippingAddress?.fullName || 'Guest'} • {order.shippingAddress?.phone || 'N/A'}
                          </p>
                        </div>
                        
                        {/* Items Preview */}
                        <div className="flex items-center gap-2">
                          {order.items?.slice(0, 3).map((item, i) => (
                            <div key={i} className="w-10 h-10 bg-charcoal-200/50 rounded-lg overflow-hidden">
                              {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                            </div>
                          ))}
                          {order.items?.length > 3 && (
                            <span className="w-10 h-10 bg-charcoal-200/50 rounded-lg flex items-center justify-center text-ivory-100/40 text-xs">
                              +{order.items.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-serif text-gold-300">{formatCurrency(order.total)}</p>
                        <p className="text-ivory-100/40 text-sm">{order.items?.length || 0} items</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          className="px-3 py-2 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 text-sm rounded-lg focus:outline-none focus:border-gold-300 transition-colors"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status} className="capitalize">{status}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="px-4 py-2 bg-gold-300/10 border border-gold-300/20 text-gold-300 rounded-lg hover:bg-gold-300/20 transition-colors text-sm"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-charcoal-100/50 border border-ivory-100/10 text-ivory-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-charcoal-100/70 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-ivory-100/70">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 bg-charcoal-100/50 border border-ivory-100/10 text-ivory-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-charcoal-100/70 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

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
              className="fixed inset-4 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 z-50 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-charcoal-100 border border-ivory-100/10 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-ivory-100/10 flex items-center justify-between sticky top-0 bg-charcoal-100 z-10">
                  <div>
                    <h3 className="text-lg font-serif text-ivory-100">Order Details</h3>
                    <p className="text-ivory-100/50 text-sm">#{selectedOrder._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedOrder.orderStatus}
                      onChange={(e) => updateStatus(selectedOrder._id, e.target.value)}
                      className="px-3 py-2 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 text-sm rounded-lg focus:outline-none focus:border-gold-300"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status} className="capitalize">{status}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-ivory-100/50 hover:text-ivory-100 hover:bg-ivory-100/5 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {detailsLoading ? (
                  <div className="p-12 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gold-300/30 border-t-gold-300 rounded-full animate-spin" />
                  </div>
                ) : orderDetails && (
                  <div className="p-6 space-y-6">
                    {/* Customer Info */}
                    {orderDetails.user && (
                      <div className="bg-charcoal-200/30 rounded-xl p-4">
                        <p className="text-ivory-100/50 text-xs uppercase tracking-wide mb-2">Customer</p>
                        <p className="text-ivory-100 font-medium">{orderDetails.user.name}</p>
                        <p className="text-ivory-100/70 text-sm">{orderDetails.user.email}</p>
                      </div>
                    )}

                    {/* Items */}
                    <div>
                      <p className="text-ivory-100/50 text-xs uppercase tracking-wide mb-4">Items ({orderDetails.items?.length || 0})</p>
                      <div className="space-y-3">
                        {orderDetails.items?.map((item, i) => (
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
                              <p className="text-ivory-100/50 text-sm">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-gold-300 font-medium">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {orderDetails.shippingAddress && (
                      <div className="bg-charcoal-200/30 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <p className="text-ivory-100/50 text-xs uppercase tracking-wide">Shipping Address</p>
                          {orderDetails.shippingAddress.navigationUrl && (
                            <a
                              href={orderDetails.shippingAddress.navigationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs font-medium flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                              </svg>
                              Navigate
                            </a>
                          )}
                        </div>
                        <p className="text-ivory-100 font-medium">{orderDetails.shippingAddress.fullName}</p>
                        {orderDetails.shippingAddress.placeName && (
                          <p className="text-gold-300 text-sm font-medium mt-1">{orderDetails.shippingAddress.placeName}</p>
                        )}
                        <p className="text-ivory-100/70 text-sm">{orderDetails.shippingAddress.street}</p>
                        <p className="text-ivory-100/70 text-sm">
                          {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}
                        </p>
                        <p className="text-ivory-100/70 text-sm">{orderDetails.shippingAddress.country}</p>
                        <p className="text-ivory-100/70 text-sm mt-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {orderDetails.shippingAddress.phone}
                        </p>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="bg-charcoal-200/30 rounded-xl p-4">
                      <p className="text-ivory-100/50 text-xs uppercase tracking-wide mb-3">Order Summary</p>
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

                    {/* Order Date */}
                    <div className="text-center text-ivory-100/40 text-sm">
                      Placed on {formatDate(orderDetails.createdAt)}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
