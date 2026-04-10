import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
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
      params.append('limit', 20);
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/orders/all?${params.toString()}`);
      setOrders(response.data.orders || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, page, showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: status });
      showToast(`Order status updated to ${status}`);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
      showToast('Failed to update order', 'error');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: 'Pending', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-500' },
      processing: { label: 'Processing', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-500' },
      shipped: { label: 'Shipped', bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-500' },
      delivered: { label: 'Delivered', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500' },
      cancelled: { label: 'Cancelled', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500' }
    };
    return configs[status] || configs.pending;
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.orderStatus === 'pending').length,
    processing: orders.filter(o => o.orderStatus === 'processing').length,
    shipped: orders.filter(o => o.orderStatus === 'shipped').length,
    delivered: orders.filter(o => o.orderStatus === 'delivered').length
  };

  return (
    <div className="min-h-screen bg-charcoal-300">
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-4 left-1/2 z-50 px-6 py-4 rounded-2xl backdrop-blur-xl border shadow-2xl ${
              toast.type === 'success' ? 'bg-emerald-500/95 border-emerald-400/30 text-emerald-100' : 'bg-red-500/95 border-red-400/30 text-red-100'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              <span className="font-light">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-2 text-ivory-100">Orders</h1>
            <p className="text-ivory-100/50 font-light mt-1">
              {pagination.totalOrders ? `${pagination.totalOrders} total orders` : 'Manage and track all orders'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'total', label: 'Total', value: stats.total || orders.length, color: 'blue' },
            { key: 'pending', label: 'Pending', value: stats.pending, color: 'yellow' },
            { key: 'processing', label: 'Processing', value: stats.processing, color: 'blue' },
            { key: 'delivered', label: 'Delivered', value: stats.delivered, color: 'emerald' }
          ].map((stat, index) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-charcoal-100/30 border rounded-2xl p-4 backdrop-blur-sm ${
                stat.color === 'emerald' ? 'border-emerald-500/20' :
                stat.color === 'yellow' ? 'border-yellow-500/20' :
                stat.color === 'blue' ? 'border-blue-500/20' :
                'border-ivory-100/10'
              }`}
            >
              <p className="text-ivory-100/50 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-2xl font-serif ${
                stat.color === 'emerald' ? 'text-emerald-400' :
                stat.color === 'yellow' ? 'text-yellow-400' :
                stat.color === 'blue' ? 'text-blue-400' :
                'text-ivory-100'
              }`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by order ID or customer name..."
                value={filters.search}
                onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
                className="w-full pl-12 pr-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
              className="px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 rounded-xl focus:outline-none focus:border-gold-300 min-w-[160px]"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-12 text-center backdrop-blur-sm"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-charcoal-200/50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-serif text-ivory-100 mb-2">No Orders Found</h3>
            <p className="text-ivory-100/50 font-light">Orders will appear here when customers make purchases</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const statusConfig = getStatusConfig(order.orderStatus);
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-ivory-100/20 transition-colors"
                >
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div>
                            <p className="text-ivory-100 font-medium">#{order._id.slice(-8).toUpperCase()}</p>
                            <p className="text-xs text-ivory-100/40 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-light border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                            {statusConfig.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                          <div>
                            <span className="text-ivory-100/40">Customer:</span>
                            <span className="text-ivory-100 ml-2">{order.user?.name || 'Guest'}</span>
                          </div>
                          <div>
                            <span className="text-ivory-100/40">Items:</span>
                            <span className="text-ivory-100 ml-2">{order.items?.length || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Total & Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-serif text-gold-300">${order.total?.toFixed(2)}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-4 py-2 bg-charcoal-200/50 border border-ivory-100/20 text-ivory-100/70 rounded-xl hover:bg-charcoal-200 hover:text-ivory-100 transition-colors text-sm font-light"
                          >
                            View
                          </button>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => updateStatus(order._id, e.target.value)}
                            className="px-4 py-2 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 rounded-xl focus:outline-none focus:border-gold-300 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-charcoal-100/30 border border-ivory-100/10 text-ivory-100/70 rounded-lg hover:bg-charcoal-100/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="px-4 py-2 text-ivory-100/70 font-light">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === pagination.totalPages}
              className="p-2 bg-charcoal-100/30 border border-ivory-100/10 text-ivory-100/70 rounded-lg hover:bg-charcoal-100/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-charcoal-300/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-charcoal-200/95 border border-ivory-100/10 rounded-2xl backdrop-blur-xl shadow-2xl"
            >
              <div className="sticky top-0 bg-charcoal-200/95 border-b border-ivory-100/10 p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-serif text-ivory-100">Order Details</h2>
                  <p className="text-ivory-100/50 text-sm font-light mt-1">#{selectedOrder._id.slice(-8).toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 rounded-xl bg-charcoal-300/50 flex items-center justify-center text-ivory-100/50 hover:text-ivory-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status & Date */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-ivory-100/50 text-sm">Order Date</p>
                    <p className="text-ivory-100 font-light mt-1">
                      {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-ivory-100/50 text-sm">Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-light border mt-1 ${getStatusConfig(selectedOrder.orderStatus).bg} ${getStatusConfig(selectedOrder.orderStatus).text} ${getStatusConfig(selectedOrder.orderStatus).border}`}>
                      <span className={`w-2 h-2 rounded-full ${getStatusConfig(selectedOrder.orderStatus).dot}`} />
                      {getStatusConfig(selectedOrder.orderStatus).label}
                    </span>
                  </div>
                </div>

                {/* Customer */}
                <div className="p-4 bg-charcoal-300/30 rounded-xl border border-ivory-100/5">
                  <p className="text-ivory-100/50 text-sm mb-2">Customer</p>
                  <p className="text-ivory-100 font-medium">{selectedOrder.user?.name || 'Guest'}</p>
                  <p className="text-ivory-100/60 text-sm font-light mt-1">{selectedOrder.user?.email || selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                </div>

                {/* Items */}
                <div>
                  <p className="text-ivory-100/50 text-sm mb-3">Items</p>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-charcoal-300/30 rounded-xl border border-ivory-100/5">
                        <div className="w-14 h-14 bg-charcoal-200/50 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-xl">✦</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-ivory-100 font-medium truncate">{item.name}</p>
                          <p className="text-ivory-100/50 text-sm font-light">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-gold-300 font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div className="p-4 bg-charcoal-300/30 rounded-xl border border-ivory-100/5">
                    <p className="text-ivory-100/50 text-sm mb-2">Shipping Address</p>
                    <p className="text-ivory-100 font-light">
                      {selectedOrder.shippingAddress.fullName}<br />
                      {selectedOrder.shippingAddress.street}<br />
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br />
                      {selectedOrder.shippingAddress.country}
                    </p>
                  </div>
                )}

                {/* Totals */}
                <div className="border-t border-ivory-100/10 pt-4 space-y-2">
                  <div className="flex justify-between text-ivory-100/70 font-light">
                    <span>Subtotal</span>
                    <span>${(selectedOrder.total - (selectedOrder.shippingCost || 0) - (selectedOrder.tax || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-ivory-100/70 font-light">
                    <span>Shipping</span>
                    <span>${(selectedOrder.shippingCost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-ivory-100/70 font-light">
                    <span>Tax</span>
                    <span>${(selectedOrder.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-serif text-ivory-100 pt-2 border-t border-ivory-100/10">
                    <span>Total</span>
                    <span className="text-gold-300">${selectedOrder.total?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Update Status */}
                <div className="border-t border-ivory-100/10 pt-4">
                  <label className="block text-sm text-ivory-100/70 mb-2">Update Status</label>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => updateStatus(selectedOrder._id, e.target.value)}
                    className="w-full px-4 py-3 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 rounded-xl focus:outline-none focus:border-gold-300"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
