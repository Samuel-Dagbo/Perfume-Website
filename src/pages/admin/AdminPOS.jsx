import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/currency';

const AdminPOS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '100');
      if (category) params.append('category', category);
      
      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [category, showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addToCart = (product) => {
    if (product.stockQuantity === 0) {
      showToast('This product is out of stock', 'error');
      return;
    }
    
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      if (existing.quantity >= product.stockQuantity) {
        showToast('Maximum stock reached', 'error');
        return;
      }
      setCart(cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    const product = products.find(p => p._id === productId);
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    if (quantity > (product?.stockQuantity || 0)) {
      showToast('Cannot exceed available stock', 'error');
      return;
    }
    setCart(cart.map(item =>
      item._id === productId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.08;
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      showToast('Cart is empty', 'error');
      return;
    }

    setProcessing(true);
    try {
      await api.post('/sales/in-person', {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity
        })),
        customerInfo,
        paymentMethod: 'cash'
      });

      setShowSuccess(true);
      setCart([]);
      setCustomerInfo({ name: '', phone: '' });
      
      setTimeout(() => {
        setShowSuccess(false);
        fetchProducts();
      }, 2000);
    } catch (error) {
      console.error('Failed to complete sale:', error);
      showToast(error.response?.data?.message || 'Failed to complete sale', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ['perfume', 'oil', 'gift set', 'accessories'];

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

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-emerald-500/95 border border-emerald-400/30 rounded-2xl p-8 text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-4 bg-emerald-400/20 rounded-full flex items-center justify-center"
              >
                <svg className="w-10 h-10 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-serif text-emerald-100 mb-2">Sale Complete!</h3>
              <p className="text-emerald-200/80 font-light">Transaction processed successfully</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-2 text-ivory-100">Point of Sale</h1>
            <p className="text-ivory-100/50 font-light mt-1">Process in-person sales and transactions</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Products Panel */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search & Filters */}
            <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                  />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 rounded-xl focus:outline-none focus:border-gold-300 min-w-[140px]"
                >
                  <option value="">All</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-4 backdrop-blur-sm">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton h-36 rounded-xl" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 mx-auto mb-4 text-ivory-100/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-ivory-100/40">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                  {filteredProducts.map((product) => {
                    const inCart = cart.find(c => c._id === product._id);
                    return (
                      <button
                        key={product._id}
                        onClick={() => addToCart(product)}
                        disabled={product.stockQuantity === 0}
                        className={`p-3 rounded-xl border transition-all text-left ${
                          product.stockQuantity === 0
                            ? 'bg-charcoal-200/30 border-ivory-100/5 opacity-50 cursor-not-allowed'
                            : inCart
                              ? 'bg-gold-300/10 border-gold-300/30 hover:bg-gold-300/20'
                              : 'bg-charcoal-200/50 border-ivory-100/10 hover:border-gold-300/30 hover:bg-charcoal-200/70'
                        }`}
                      >
                        <div className="aspect-square bg-charcoal-300/50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl text-charcoal-400">✦</span>
                          )}
                        </div>
                        <p className="text-ivory-100 font-medium text-sm line-clamp-1">{product.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-gold-300 font-medium">{formatCurrency(product.price)}</span>
                          {inCart && (
                            <span className="px-2 py-0.5 bg-gold-300/20 text-gold-300 text-xs rounded-full">
                              {inCart.quantity} in cart
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${product.stockQuantity === 0 ? 'text-red-400' : 'text-ivory-100/40'}`}>
                          {product.stockQuantity === 0 ? 'Out of stock' : `${product.stockQuantity} available`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cart Panel */}
          <div className="lg:col-span-2">
            <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl backdrop-blur-sm sticky top-8">
              <div className="p-5 border-b border-ivory-100/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-serif text-ivory-100">Current Sale</h2>
                  <span className="px-3 py-1 bg-gold-300/20 text-gold-300 text-sm rounded-full font-light">
                    {getTotalItems()} items
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-4 border-b border-ivory-100/10 space-y-3">
                <input
                  type="text"
                  placeholder="Customer Name (optional)"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 text-sm focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 text-sm focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                />
              </div>

              {/* Cart Items */}
              <div className="p-4 max-h-[300px] overflow-y-auto scrollbar-thin">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-charcoal-200/50 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <p className="text-ivory-100/40 text-sm">Cart is empty</p>
                    <p className="text-ivory-100/30 text-xs mt-1">Click products to add</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item._id} className="flex items-center gap-3 p-3 bg-charcoal-200/50 border border-ivory-100/5 rounded-xl">
                        <div className="w-12 h-12 bg-charcoal-300/50 rounded-lg overflow-hidden flex-shrink-0">
                          {item.images?.[0]?.url ? (
                            <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-lg">✦</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-ivory-100 font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-ivory-100/40">{formatCurrency(item.price)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-8 h-8 bg-charcoal-300/50 rounded-lg flex items-center justify-center text-ivory-100/60 hover:text-ivory-100 hover:bg-charcoal-300 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center text-ivory-100 font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            disabled={item.quantity >= item.stockQuantity}
                            className="w-8 h-8 bg-charcoal-300/50 rounded-lg flex items-center justify-center text-ivory-100/60 hover:text-ivory-100 hover:bg-charcoal-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-400/60 hover:text-red-400 transition-colors p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="p-5 border-t border-ivory-100/10 space-y-3">
                <div className="flex justify-between text-ivory-100/70 font-light text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(getSubtotal())}</span>
                </div>
                <div className="flex justify-between text-ivory-100/70 font-light text-sm">
                  <span>Tax (8%)</span>
                  <span>{formatCurrency(getTax())}</span>
                </div>
                <div className="flex justify-between text-xl font-serif text-ivory-100 pt-3 border-t border-ivory-100/10">
                  <span>Total</span>
                  <span className="text-gold-300">{formatCurrency(getTotal())}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 pt-0 space-y-3">
                <button
                  onClick={completeSale}
                  disabled={cart.length === 0 || processing}
                  className="w-full py-4 bg-gold-300 text-charcoal-300 rounded-xl font-medium uppercase tracking-ultra-wide hover:bg-gold-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Complete Sale
                    </>
                  )}
                </button>
                <button
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="w-full py-3 border border-ivory-100/20 text-ivory-100/70 rounded-xl hover:border-ivory-100/40 hover:text-ivory-100 transition-colors text-sm font-light disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPOS;
