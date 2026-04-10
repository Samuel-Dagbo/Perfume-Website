import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({ inStock: 0, lowStock: 0, outOfStock: 0, total: 0 });

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: '',
    sort: '-stockQuantity'
  });

  const [page, setPage] = useState(1);

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [editModal, setEditModal] = useState({ open: false, product: null });
  const [editForm, setEditForm] = useState({ quantity: '', reason: '', adjustmentType: 'set' });
  const [submitting, setSubmitting] = useState(false);

  const [historyModal, setHistoryModal] = useState({ open: false, product: null });
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 50);
      if (filters.search) params.append('search', filters.search);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      params.append('sort', filters.sort);

      const response = await api.get(`/admin/inventory?${params.toString()}`);
      setProducts(response.data.products);
      setPagination(response.data.pagination);

      const allStats = {
        inStock: response.data.products.filter(p => p.status === 'in_stock').length,
        lowStock: response.data.products.filter(p => p.status === 'low_stock').length,
        outOfStock: response.data.products.filter(p => p.status === 'out_of_stock').length,
        total: response.data.pagination.totalProducts
      };
      setStats(prev => ({ ...prev, ...allStats }));
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      showToast('Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, page, showToast]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    if (selectAll) {
      setSelectedProducts(products.map(p => p._id));
    } else {
      setSelectedProducts([]);
    }
  }, [selectAll, products]);

  const handleSelectProduct = (id) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const openEditModal = (product) => {
    setEditModal({ open: true, product });
    setEditForm({
      quantity: product.stockQuantity.toString(),
      reason: '',
      adjustmentType: 'set'
    });
  };

  const closeEditModal = () => {
    setEditModal({ open: false, product: null });
    setEditForm({ quantity: '', reason: '', adjustmentType: 'set' });
    setSubmitting(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModal.product) return;

    const quantity = parseInt(editForm.quantity);
    if (isNaN(quantity) || quantity < 0) {
      showToast('Please enter a valid quantity', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let newQuantity = quantity;
      let reason = editForm.reason || 'Manual adjustment';

      if (editForm.adjustmentType === 'add') {
        newQuantity = editModal.product.stockQuantity + quantity;
        reason = `Added ${quantity} units - ${editForm.reason || 'Restock'}`;
      } else if (editForm.adjustmentType === 'subtract') {
        newQuantity = Math.max(0, editModal.product.stockQuantity - quantity);
        reason = `Removed ${quantity} units - ${editForm.reason || 'Stock adjustment'}`;
      }

      await api.put(`/products/${editModal.product._id}/stock`, {
        quantity: newQuantity,
        reason
      });

      showToast(`Stock updated for ${editModal.product.name}`);
      closeEditModal();
      fetchInventory();
    } catch (error) {
      console.error('Failed to update stock:', error);
      showToast(error.response?.data?.message || 'Failed to update stock', 'error');
      setSubmitting(false);
    }
  };

  const bulkRestock = async (amount) => {
    if (selectedProducts.length === 0) return;
    try {
      const updates = selectedProducts.map(id => ({
        productId: id,
        change: amount
      }));
      await api.put('/admin/inventory/bulk', { updates });
      showToast(`Added ${amount} units to ${selectedProducts.length} products`);
      setSelectedProducts([]);
      setSelectAll(false);
      fetchInventory();
    } catch (error) {
      console.error('Failed to bulk update:', error);
      showToast('Failed to update products', 'error');
    }
  };

  const fetchHistory = async (product) => {
    setHistoryModal({ open: true, product });
    setHistoryLoading(true);
    try {
      const response = await api.get(`/admin/inventory/logs/${product._id}`);
      setHistoryLogs(response.data.logs);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      showToast('Failed to load history', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const categories = ['perfume', 'oil', 'gift set', 'accessories'];

  const getStatusConfig = (status) => {
    switch (status) {
      case 'out_of_stock':
        return { label: 'Out of Stock', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500' };
      case 'low_stock':
        return { label: 'Low Stock', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-500 animate-pulse' };
      default:
        return { label: 'In Stock', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500' };
    }
  };

  const getChangeTypeConfig = (type) => {
    switch (type) {
      case 'sale': return { label: 'Sale', class: 'text-red-400' };
      case 'restock': return { label: 'Restock', class: 'text-emerald-400' };
      case 'return': return { label: 'Return', class: 'text-blue-400' };
      case 'damaged': return { label: 'Damaged', class: 'text-orange-400' };
      default: return { label: 'Adjustment', class: 'text-ivory-100/70' };
    }
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
              toast.type === 'success'
                ? 'bg-emerald-500/95 border-emerald-400/30 text-emerald-100'
                : 'bg-red-500/95 border-red-400/30 text-red-100'
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="heading-2 text-ivory-100">Inventory Management</h1>
            <p className="text-ivory-100/50 font-light mt-1">Track, monitor, and manage your stock levels</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: 'total', label: 'Total Products', value: stats.total, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'blue' },
            { key: 'inStock', label: 'In Stock', value: stats.inStock, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'emerald' },
            { key: 'lowStock', label: 'Low Stock', value: stats.lowStock, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'orange' },
            { key: 'outOfStock', label: 'Out of Stock', value: stats.outOfStock, icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'red' }
          ].map((stat, index) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-charcoal-100/30 border rounded-2xl p-5 backdrop-blur-sm ${
                stat.color === 'emerald' ? 'border-emerald-500/20' :
                stat.color === 'orange' ? 'border-orange-500/20' :
                stat.color === 'red' ? 'border-red-500/20' :
                'border-ivory-100/10'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-ivory-100/50 text-xs uppercase tracking-wider font-light">{stat.label}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  stat.color === 'emerald' ? 'bg-emerald-500/20' :
                  stat.color === 'orange' ? 'bg-orange-500/20' :
                  stat.color === 'red' ? 'bg-red-500/20' :
                  'bg-blue-500/20'
                }`}>
                  <svg className={`w-5 h-5 ${
                    stat.color === 'emerald' ? 'text-emerald-400' :
                    stat.color === 'orange' ? 'text-orange-400 animate-pulse' :
                    stat.color === 'red' ? 'text-red-400' :
                    'text-blue-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={stat.icon} />
                  </svg>
                </div>
              </div>
              <p className={`text-3xl font-serif ${
                stat.color === 'emerald' ? 'text-emerald-400' :
                stat.color === 'orange' ? 'text-orange-400' :
                stat.color === 'red' ? 'text-red-400' :
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
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
                className="w-full pl-12 pr-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
              className="px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 rounded-xl focus:outline-none focus:border-gold-300 min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}
              className="px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 rounded-xl focus:outline-none focus:border-gold-300 min-w-[140px]"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filters.sort}
              onChange={(e) => { setFilters({ ...filters, sort: e.target.value }); setPage(1); }}
              className="px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 rounded-xl focus:outline-none focus:border-gold-300 min-w-[160px]"
            >
              <option value="-stockQuantity">Stock: High to Low</option>
              <option value="stockQuantity">Stock: Low to High</option>
              <option value="-name">Name: A-Z</option>
              <option value="name">Name: Z-A</option>
              <option value="-createdAt">Newest First</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-ivory-100/10 flex flex-wrap items-center gap-4"
            >
              <span className="text-sm text-gold-300 font-light">
                {selectedProducts.length} selected
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ivory-100/50 uppercase tracking-wider">Bulk Add:</span>
                {[5, 10, 25, 50].map(amount => (
                  <button
                    key={amount}
                    onClick={() => bulkRestock(amount)}
                    className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm font-light"
                  >
                    +{amount}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setSelectedProducts([]); setSelectAll(false); }}
                className="text-sm text-ivory-100/50 hover:text-ivory-100 transition-colors font-light"
              >
                Clear
              </button>
            </motion.div>
          )}
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="p-4 space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-12 text-center backdrop-blur-sm"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-charcoal-200/50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-serif text-ivory-100 mb-2">No Products Found</h3>
            <p className="text-ivory-100/50 font-light">Try adjusting your filters or add new products</p>
          </motion.div>
        ) : (
          <>
            <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-ivory-100/10 bg-charcoal-200/30">
                      <th className="px-4 py-4 text-left">
                        <label className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={(e) => setSelectAll(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 border-2 border-ivory-100/30 rounded peer-checked:bg-gold-300 peer-checked:border-gold-300 peer-checked:text-charcoal-300 transition-colors cursor-pointer flex items-center justify-center">
                            {selectAll && (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </label>
                      </th>
                      <th className="px-4 py-4 text-left text-xs uppercase tracking-ultra-wide text-ivory-100/50 font-light">Product</th>
                      <th className="px-4 py-4 text-left text-xs uppercase tracking-ultra-wide text-ivory-100/50 font-light hidden md:table-cell">SKU</th>
                      <th className="px-4 py-4 text-left text-xs uppercase tracking-ultra-wide text-ivory-100/50 font-light hidden lg:table-cell">Category</th>
                      <th className="px-4 py-4 text-left text-xs uppercase tracking-ultra-wide text-ivory-100/50 font-light">Current Stock</th>
                      <th className="px-4 py-4 text-left text-xs uppercase tracking-ultra-wide text-ivory-100/50 font-light hidden sm:table-cell">Status</th>
                      <th className="px-4 py-4 text-right text-xs uppercase tracking-ultra-wide text-ivory-100/50 font-light">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-100/5">
                    {products.map((product, index) => {
                      const statusConfig = getStatusConfig(product.status);
                      return (
                        <motion.tr
                          key={product._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className={`hover:bg-charcoal-200/20 transition-colors ${
                            selectedProducts.includes(product._id) ? 'bg-gold-300/5' : ''
                          }`}
                        >
                          <td className="px-4 py-4">
                            <label className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product._id)}
                                onChange={() => handleSelectProduct(product._id)}
                                className="sr-only peer"
                              />
                              <div className="w-5 h-5 border-2 border-ivory-100/30 rounded peer-checked:bg-gold-300 peer-checked:border-gold-300 peer-checked:text-charcoal-300 transition-colors cursor-pointer flex items-center justify-center">
                                {selectedProducts.includes(product._id) && (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </label>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-ivory-100 font-medium">{product.name}</p>
                          </td>
                          <td className="px-4 py-4 text-ivory-100/60 font-light hidden md:table-cell">
                            {product.sku || <span className="text-ivory-100/30">—</span>}
                          </td>
                          <td className="px-4 py-4 text-ivory-100/60 capitalize font-light hidden lg:table-cell">
                            {product.category}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`text-lg font-serif ${product.stockQuantity === 0 ? 'text-red-400' : product.status === 'low_stock' ? 'text-orange-400' : 'text-ivory-100'}`}>
                              {product.stockQuantity}
                            </span>
                            <span className="text-ivory-100/30 text-xs ml-1">units</span>
                          </td>
                          <td className="px-4 py-4 hidden sm:table-cell">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-light border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => fetchHistory(product)}
                                className="p-2 text-ivory-100/40 hover:text-ivory-100 hover:bg-charcoal-200/50 rounded-lg transition-colors"
                                title="View History"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openEditModal(product)}
                                className="px-4 py-2 bg-gold-300/10 border border-gold-300/30 text-gold-300 rounded-lg hover:bg-gold-300/20 transition-colors text-sm font-light flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

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
          </>
        )}
      </div>

      {/* Edit Stock Modal */}
      <AnimatePresence>
        {editModal.open && editModal.product && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEditModal}
              className="absolute inset-0 bg-charcoal-300/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-charcoal-200/95 border border-ivory-100/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl"
            >
              <div className="p-6 border-b border-ivory-100/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-serif text-ivory-100">Edit Stock</h3>
                    <p className="text-ivory-100/50 font-light text-sm mt-1">{editModal.product.name}</p>
                  </div>
                  <button
                    onClick={closeEditModal}
                    className="w-10 h-10 rounded-xl bg-charcoal-300/50 flex items-center justify-center text-ivory-100/50 hover:text-ivory-100 hover:bg-charcoal-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                {/* Current Stock */}
                <div className="p-4 bg-charcoal-300/50 rounded-xl border border-ivory-100/10">
                  <div className="flex items-center justify-between">
                    <span className="text-ivory-100/50 text-sm">Current Stock</span>
                    <span className="text-2xl font-serif text-ivory-100">{editModal.product.stockQuantity}</span>
                  </div>
                </div>

                {/* Adjustment Type */}
                <div className="space-y-2">
                  <label className="text-sm text-ivory-100/70">Adjustment Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'set', label: 'Set To', icon: 'M4 6h16M4 12h16M4 18h16' },
                      { value: 'add', label: 'Add', icon: 'M12 4v16m8-8H4' },
                      { value: 'subtract', label: 'Remove', icon: 'M20 12H4' }
                    ].map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setEditForm(f => ({ ...f, adjustmentType: type.value }))}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                          editForm.adjustmentType === type.value
                            ? 'bg-gold-300/10 border-gold-300/30 text-gold-300'
                            : 'bg-charcoal-300/50 border-ivory-100/10 text-ivory-100/60 hover:border-ivory-100/20'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={type.icon} />
                        </svg>
                        <span className="text-xs font-light">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Input */}
                <div className="space-y-2">
                  <label className="text-sm text-ivory-100/70">
                    {editForm.adjustmentType === 'set' ? 'New Quantity' : editForm.adjustmentType === 'add' ? 'Quantity to Add' : 'Quantity to Remove'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={editForm.quantity}
                      onChange={(e) => setEditForm(f => ({ ...f, quantity: e.target.value }))}
                      placeholder="0"
                      className="w-full px-6 py-4 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 text-2xl font-serif text-center placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                      autoFocus
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-ivory-100/30 text-sm">units</span>
                  </div>
                  {editForm.adjustmentType !== 'set' && editForm.quantity && (
                    <p className="text-sm text-ivory-100/50 font-light">
                      New stock will be: <span className="text-gold-300">{editModal.product.stockQuantity} {editForm.adjustmentType === 'add' ? '+' : '-'} {editForm.quantity} = {Math.max(0, editForm.adjustmentType === 'add' ? editModal.product.stockQuantity + parseInt(editForm.quantity || 0) : editModal.product.stockQuantity - parseInt(editForm.quantity || 0))}</span>
                    </p>
                  )}
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <label className="text-sm text-ivory-100/70">Reason (optional)</label>
                  <input
                    type="text"
                    value={editForm.reason}
                    onChange={(e) => setEditForm(f => ({ ...f, reason: e.target.value }))}
                    placeholder="e.g., New shipment received"
                    className="w-full px-4 py-3 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 py-3 border border-ivory-100/20 text-ivory-100/70 rounded-xl hover:border-ivory-100/40 hover:text-ivory-100 transition-colors font-light"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !editForm.quantity}
                    className="flex-1 py-3 bg-gold-300 text-charcoal-300 rounded-xl hover:bg-gold-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Updating...
                      </>
                    ) : (
                      'Update Stock'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {historyModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryModal({ open: false, product: null })}
              className="absolute inset-0 bg-charcoal-300/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[80vh] bg-charcoal-200/95 border border-ivory-100/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-ivory-100/10 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif text-ivory-100">Stock History</h3>
                  <p className="text-ivory-100/50 font-light text-sm mt-1">{historyModal.product?.name}</p>
                </div>
                <button
                  onClick={() => setHistoryModal({ open: false, product: null })}
                  className="w-10 h-10 rounded-xl bg-charcoal-300/50 flex items-center justify-center text-ivory-100/50 hover:text-ivory-100 hover:bg-charcoal-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {historyLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="skeleton h-20 rounded-xl" />
                    ))}
                  </div>
                ) : historyLogs.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-16 h-16 mx-auto mb-4 text-ivory-100/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-ivory-100/40">No history available for this product</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyLogs.map((log) => {
                      const typeConfig = getChangeTypeConfig(log.changeType);
                      return (
                        <div key={log._id} className="flex items-center gap-4 p-4 bg-charcoal-300/30 border border-ivory-100/5 rounded-xl">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            log.quantityChanged > 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
                          }`}>
                            <span className={`font-serif text-lg font-medium ${
                              log.quantityChanged > 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {log.quantityChanged > 0 ? '+' : ''}{log.quantityChanged}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-light ${typeConfig.class}`}>{typeConfig.label}</span>
                              <span className="text-ivory-100/30">•</span>
                              <span className="text-ivory-100/50 text-sm">{log.previousQuantity} → {log.newQuantity}</span>
                            </div>
                            {log.reason && (
                              <p className="text-xs text-ivory-100/40 mt-1 truncate">{log.reason}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-ivory-100/40">
                              {new Date(log.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-ivory-100/30">
                              {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {log.user && (
                              <p className="text-xs text-ivory-100/50 mt-1">{log.user.name}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminInventory;
