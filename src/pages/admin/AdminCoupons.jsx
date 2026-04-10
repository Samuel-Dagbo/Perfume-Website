import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/currency';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    validFrom: '',
    validUntil: '',
    isActive: true
  });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/coupons');
      setCoupons(response.data.coupons);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
      showToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue: coupon.discountValue.toString(),
        minOrderAmount: coupon.minOrderAmount?.toString() || '',
        maxDiscount: coupon.maxDiscount?.toString() || '',
        usageLimit: coupon.usageLimit?.toString() || '',
        validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
        validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
        isActive: coupon.isActive
      });
    } else {
      setEditingCoupon(null);
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: '',
        maxDiscount: '',
        usageLimit: '',
        validFrom: today,
        validUntil: nextMonth,
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil)
      };

      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, payload);
        showToast('Coupon updated successfully');
      } else {
        await api.post('/coupons', payload);
        showToast('Coupon created successfully');
      }

      handleCloseModal();
      fetchCoupons();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save coupon', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (couponId) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await api.delete(`/coupons/${couponId}`);
      showToast('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      showToast('Failed to delete coupon', 'error');
    }
  };

  const toggleStatus = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      showToast(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'}`);
      fetchCoupons();
    } catch (error) {
      showToast('Failed to update coupon', 'error');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif text-ivory-100">Coupons</h1>
          <p className="text-ivory-100/50 text-sm mt-1">Manage discount codes and promotions</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
          </svg>
          Create Coupon
        </button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl border ${
              toast.type === 'success'
                ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400'
                : 'bg-red-900/30 border-red-500/30 text-red-400'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupons Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-charcoal-100/50 border border-ivory-100/10 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-charcoal-200/50 rounded w-24 mb-4" />
              <div className="h-3 bg-charcoal-200/50 rounded w-full mb-2" />
              <div className="h-3 bg-charcoal-200/50 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-charcoal-100/50 border border-ivory-100/10 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-200/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h3 className="text-lg font-serif text-ivory-100 mb-2">No coupons yet</h3>
          <p className="text-ivory-100/50 text-sm mb-6">Create your first discount code to get started</p>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <motion.div
              key={coupon._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-charcoal-100/50 border rounded-2xl p-6 transition-all ${
                coupon.isActive
                  ? isExpired(coupon.validUntil)
                    ? 'border-amber-500/30'
                    : 'border-ivory-100/10'
                  : 'border-ivory-100/5 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block px-2 py-1 bg-gold-300/10 text-gold-300 text-xs font-mono rounded">
                    {coupon.code}
                  </span>
                  <p className="text-ivory-100/50 text-xs mt-2">{coupon.description || 'No description'}</p>
                </div>
                <button
                  onClick={() => toggleStatus(coupon)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    coupon.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-charcoal-200/50 text-ivory-100/30 hover:text-ivory-100/50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={coupon.isActive ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                  </svg>
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-ivory-100/50 text-sm">Discount</span>
                  <span className="text-ivory-100 font-medium">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}%`
                      : formatCurrency(coupon.discountValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ivory-100/50 text-sm">Min. Order</span>
                  <span className="text-ivory-100">{formatCurrency(coupon.minOrderAmount || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ivory-100/50 text-sm">Used</span>
                  <span className="text-ivory-100">
                    {coupon.usedCount} / {coupon.usageLimit || '∞'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className={`${isExpired(coupon.validUntil) ? 'text-amber-400' : 'text-ivory-100/40'}`}>
                  {isExpired(coupon.validUntil) ? 'Expired' : `Expires ${formatDate(coupon.validUntil)}`}
                </span>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-ivory-100/10">
                <button
                  onClick={() => handleOpenModal(coupon)}
                  className="flex-1 py-2 text-sm text-ivory-100/60 hover:text-ivory-100 hover:bg-ivory-100/5 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(coupon._id)}
                  className="flex-1 py-2 text-sm text-red-400/60 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-charcoal-300/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-charcoal-100 border border-ivory-100/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif text-ivory-100">
                    {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-ivory-100/50 hover:text-ivory-100 hover:bg-ivory-100/5 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-ivory-100/70 mb-2">Coupon Code</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="SAVE20"
                      className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-ivory-100/70 mb-2">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="20% off your order"
                      className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-ivory-100/70 mb-2">Discount Type</label>
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                        className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-ivory-100/70 mb-2">
                        Value ({formData.discountType === 'percentage' ? '%' : '$'})
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step={formData.discountType === 'percentage' ? '1' : '0.01'}
                        max={formData.discountType === 'percentage' ? '100' : undefined}
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-ivory-100/70 mb-2">Min. Order Amount</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.minOrderAmount}
                        onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-ivory-100/70 mb-2">Max. Discount</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                        placeholder="No limit"
                        className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-ivory-100/70 mb-2">Usage Limit</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                        placeholder="Unlimited"
                        className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-ivory-100/70 mb-2">Active</label>
                      <div className="flex items-center h-full">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-charcoal-200/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-ivory-100/30 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-300/20 peer-checked:after:bg-gold-300"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-ivory-100/70 mb-2">Valid From</label>
                      <input
                        type="date"
                        required
                        value={formData.validFrom}
                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                        className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-ivory-100/70 mb-2">Valid Until</label>
                      <input
                        type="date"
                        required
                        value={formData.validUntil}
                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                        className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 rounded-lg hover:bg-charcoal-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 btn-primary disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : editingCoupon ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCoupons;
