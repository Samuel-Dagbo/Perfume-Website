import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import api from '../../utils/api';
import useAnalytics from '../../hooks/useAnalytics';
import LocationPicker from '../../components/checkout/LocationPicker';

const TAX_RATE = 0.03;

const PAYMENT_METHODS = [
  { 
    id: 'cod', 
    name: 'Cash on Delivery', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ), 
    description: 'Pay when you receive your order',
    color: 'from-yellow-500/20 to-amber-500/20'
  },
  { 
    id: 'momo', 
    name: 'Mobile Money', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ), 
    description: 'MTN or Vodafone Mobile Money',
    color: 'from-blue-500/20 to-cyan-500/20'
  },
  { 
    id: 'card', 
    name: 'Card Payment', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ), 
    description: 'Visa, Mastercard, or Amex',
    color: 'from-purple-500/20 to-violet-500/20'
  },
  { 
    id: 'bank', 
    name: 'Bank Transfer', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ), 
    description: 'Direct bank account transfer',
    color: 'from-emerald-500/20 to-teal-500/20'
  }
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { trackCheckoutStarted, trackOrderCompleted } = useAnalytics();
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [couponError, setCouponError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'Ghana',
    phone: user?.phone || ''
  });

  const [formErrors, setFormErrors] = useState({});

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-charcoal-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-charcoal-100/50">
            <svg className="w-12 h-12 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-ivory-100 mb-4">Sign in to Checkout</h2>
          <p className="text-ivory-100/50 mb-8 font-light">
            Please log in or create an account to complete your purchase.
          </p>
          <Link to="/login" className="btn-primary inline-block">Login</Link>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-charcoal-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-charcoal-100/50">
            <svg className="w-12 h-12 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-ivory-100 mb-4">Your Bag is Empty</h2>
          <p className="text-ivory-100/50 mb-8 font-light">
            Looks like you haven't added anything to your bag yet.
          </p>
          <Link to="/shop" className="btn-primary inline-block">Continue Shopping</Link>
        </motion.div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const discount = appliedCoupon?.discount || 0;
  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + tax;

  const validateForm = () => {
    const errors = {};
    if (!shippingAddress.fullName.trim()) errors.fullName = 'Name is required';
    if (!shippingAddress.phone.trim()) errors.phone = 'Phone is required';
    else if (!/^[+]?[\d\s-]{9,}$/.test(shippingAddress.phone)) errors.phone = 'Invalid phone number';
    if (!shippingAddress.street.trim()) errors.street = 'Street address is required';
    if (!shippingAddress.city.trim()) errors.city = 'City is required';
    if (!shippingAddress.state.trim()) errors.state = 'Region is required';
    if (!shippingAddress.zipCode.trim()) errors.zipCode = 'Postal code is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    setCouponError('');
    
    try {
      const response = await api.post('/coupons/validate', {
        code: couponCode,
        subtotal
      });
      
      if (response.data.success) {
        setAppliedCoupon(response.data.coupon);
        setCouponCode('');
        setCouponError('');
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep === 1 && !validateForm()) {
      return;
    }
    
    if (currentStep === 1) {
      setCurrentStep(2);
      trackCheckoutStarted({ paymentMethod: selectedPayment, cartValue: getCartTotal() });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/orders', {
        items: cart.map(item => ({
          product: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images?.[0]?.url || ''
        })),
        shippingAddress,
        paymentMethod: selectedPayment,
        couponCode: appliedCoupon?.code
      });

      if (response.data.success) {
        trackOrderCompleted(response.data.order._id, { 
          total: response.data.order.total,
          items: cart.length,
          paymentMethod: selectedPayment
        });
        setOrderSuccess(response.data.order);
        clearCart();
      } else {
        setError(response.data.message || 'Failed to place order');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (fullAddress, placeName, googleMapsUrl) => {
    const parts = fullAddress.split(',').map(p => p.trim()).filter(Boolean);
    
    let street = '';
    let city = '';
    let state = '';

    if (parts.length >= 3) {
      street = parts.slice(0, 2).join(', ');
      city = parts[parts.length - 2] || '';
      state = parts[parts.length - 1] || '';
    } else if (parts.length === 2) {
      street = parts[0];
      city = parts[1];
    } else if (parts.length === 1) {
      street = parts[0];
    }

    setShippingAddress(prev => ({
      ...prev,
      street: street || prev.street,
      city: city || prev.city,
      state: state || prev.state,
      placeName: placeName || prev.placeName,
      navigationUrl: googleMapsUrl || prev.navigationUrl
    }));
  };

  const inputClass = (hasError) => `
    w-full px-4 py-3.5 bg-charcoal-200/50 border text-ivory-100 placeholder-charcoal-400 
    focus:outline-none transition-colors rounded-xl text-base
    ${hasError ? 'border-red-500/50 focus:border-red-500' : 'border-ivory-100/10 focus:border-gold-300/50'}
  `;

  return (
    <div className="pt-24 lg:pt-28 bg-charcoal-300 min-h-screen">
      {/* Success Modal */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-charcoal-500/95 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-charcoal-100 border border-ivory-100/10 rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-emerald-500/20 to-emerald-400/20 rounded-full flex items-center justify-center"
              >
                <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              
              <h2 className="text-3xl font-serif text-ivory-100 mb-3">Order Confirmed!</h2>
              <p className="text-ivory-100/60 mb-8 text-lg">
                Thank you for your purchase. {selectedPayment === 'cod' ? "You'll pay when you receive your order." : "You'll receive payment instructions shortly."}
              </p>
              
              <div className="bg-charcoal-200/50 rounded-2xl p-6 mb-8">
                <p className="text-ivory-100/50 text-sm mb-2">Order Number</p>
                <p className="text-gold-300 font-serif text-2xl mb-3">#{orderSuccess._id.slice(-8).toUpperCase()}</p>
                <p className="text-ivory-100/70">{formatCurrency(total)} via {PAYMENT_METHODS.find(p => p.id === selectedPayment)?.name}</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/dashboard/orders')}
                  className="flex-1 btn-primary rounded-xl py-4"
                >
                  View Orders
                </button>
                <button
                  onClick={() => navigate('/shop')}
                  className="flex-1 py-4 border border-ivory-100/20 text-ivory-100 rounded-xl hover:bg-charcoal-200/50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Picker */}
      <LocationPicker 
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={handleLocationSelect}
      />

      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-6 lg:px-16">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-4">
              <motion.div 
                className={`flex items-center gap-3 ${currentStep >= 1 ? 'text-gold-300' : 'text-ivory-100/40'}`}
                animate={currentStep >= 1 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  currentStep >= 1 ? 'bg-gold-300 text-charcoal-300 shadow-lg shadow-gold-300/30' : 'bg-ivory-100/10'
                }`}>
                  {currentStep > 1 ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : '1'}
                </div>
                <span className="text-sm font-medium hidden sm:block">Shipping</span>
              </motion.div>
              
              <div className={`w-20 h-0.5 rounded ${currentStep >= 2 ? 'bg-gold-300' : 'bg-ivory-100/20'}`} />
              
              <motion.div 
                className={`flex items-center gap-3 ${currentStep >= 2 ? 'text-gold-300' : 'text-ivory-100/40'}`}
                animate={currentStep >= 2 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  currentStep >= 2 ? 'bg-gold-300 text-charcoal-300 shadow-lg shadow-gold-300/30' : 'bg-ivory-100/10'
                }`}>2</div>
                <span className="text-sm font-medium hidden sm:block">Payment</span>
              </motion.div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-charcoal-100/50 backdrop-blur-sm border border-ivory-100/10 rounded-2xl p-6 lg:p-8"
                  >
                    <h2 className="text-xl font-serif text-ivory-100 mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 bg-gold-300/20 text-gold-300 rounded-full flex items-center justify-center text-sm">1</span>
                      Delivery Address
                    </h2>

                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm text-ivory-100/70 mb-2 font-light">Full Name</label>
                          <input
                            type="text"
                            value={shippingAddress.fullName}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                            className={inputClass(formErrors.fullName)}
                            placeholder="John Doe"
                          />
                          {formErrors.fullName && <p className="text-red-400 text-xs mt-1">{formErrors.fullName}</p>}
                        </div>
                        <div>
                          <label className="block text-sm text-ivory-100/70 mb-2 font-light">Phone Number</label>
                          <input
                            type="tel"
                            value={shippingAddress.phone}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                            className={inputClass(formErrors.phone)}
                            placeholder="+233 XX XXX XXXX"
                          />
                          {formErrors.phone && <p className="text-red-400 text-xs mt-1">{formErrors.phone}</p>}
                        </div>
                      </div>

                      {/* Location Search with Maps */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm text-ivory-100/70">Street Address</label>
                          <button
                            type="button"
                            onClick={() => setShowLocationPicker(true)}
                            className="text-xs text-gold-300 hover:text-gold-200 flex items-center gap-1 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Search on Maps
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={shippingAddress.street}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                            className={inputClass(formErrors.street)}
                            placeholder="123 Main Street, Airport Residential Area"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLocationPicker(true)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-ivory-100/40 hover:text-gold-300 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                          </button>
                        </div>
                        {formErrors.street && <p className="text-red-400 text-xs mt-1">{formErrors.street}</p>}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        <div className="col-span-2">
                          <label className="block text-sm text-ivory-100/70 mb-2 font-light">City / Town</label>
                          <input
                            type="text"
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                            className={inputClass(formErrors.city)}
                            placeholder="Accra"
                          />
                          {formErrors.city && <p className="text-red-400 text-xs mt-1">{formErrors.city}</p>}
                        </div>
                        <div>
                          <label className="block text-sm text-ivory-100/70 mb-2 font-light">Region</label>
                          <input
                            type="text"
                            value={shippingAddress.state}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                            className={inputClass(formErrors.state)}
                            placeholder="Greater Accra"
                          />
                          {formErrors.state && <p className="text-red-400 text-xs mt-1">{formErrors.state}</p>}
                        </div>
                        <div>
                          <label className="block text-sm text-ivory-100/70 mb-2 font-light">Postal Code</label>
                          <input
                            type="text"
                            value={shippingAddress.zipCode}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                            className={inputClass(formErrors.zipCode)}
                            placeholder="00233"
                          />
                          {formErrors.zipCode && <p className="text-red-400 text-xs mt-1">{formErrors.zipCode}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-ivory-100/70 mb-2 font-light">Country</label>
                        <select
                          value={shippingAddress.country}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                          className={inputClass(false)}
                        >
                          <option value="Ghana">Ghana</option>
                          <option value="Nigeria">Nigeria</option>
                          <option value="Togo">Togo</option>
                          <option value="Ivory Coast">Ivory Coast</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Shipping Summary */}
                    <div className="bg-charcoal-100/50 backdrop-blur-sm border border-ivory-100/10 rounded-2xl p-6 lg:p-8">
                      <h2 className="text-xl font-serif text-ivory-100 mb-6 flex items-center gap-3">
                        <span className="w-8 h-8 bg-gold-300/20 text-gold-300 rounded-full flex items-center justify-center text-sm">1</span>
                        Delivery Address
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="ml-auto text-gold-300 text-sm hover:text-gold-200 transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit
                        </button>
                      </h2>
                      <div className="bg-charcoal-200/30 rounded-xl p-4 space-y-1">
                        <p className="text-ivory-100 font-medium">{shippingAddress.fullName}</p>
                        <p className="text-ivory-100/70 text-sm">{shippingAddress.street}</p>
                        <p className="text-ivory-100/70 text-sm">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                        <p className="text-ivory-100/70 text-sm">{shippingAddress.phone}</p>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-charcoal-100/50 backdrop-blur-sm border border-ivory-100/10 rounded-2xl p-6 lg:p-8">
                      <h2 className="text-xl font-serif text-ivory-100 mb-6 flex items-center gap-3">
                        <span className="w-8 h-8 bg-gold-300/20 text-gold-300 rounded-full flex items-center justify-center text-sm">2</span>
                        Payment Method
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {PAYMENT_METHODS.map((method) => (
                          <motion.label
                            key={method.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all ${
                              selectedPayment === method.id
                                ? 'border-gold-300 bg-gradient-to-br ' + method.color
                                : 'border-ivory-100/10 hover:border-ivory-100/30 bg-charcoal-200/30'
                            }`}
                          >
                            <input
                              type="radio"
                              name="payment"
                              value={method.id}
                              checked={selectedPayment === method.id}
                              onChange={(e) => setSelectedPayment(e.target.value)}
                              className="sr-only"
                            />
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              selectedPayment === method.id
                                ? 'border-gold-300 bg-gold-300'
                                : 'border-ivory-100/30'
                            }`}>
                              {selectedPayment === method.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-charcoal-300" />
                              )}
                            </div>
                            <div className={`${selectedPayment === method.id ? 'text-ivory-100' : 'text-ivory-100/70'}`}>
                              <div className={`mb-2 ${selectedPayment === method.id ? 'text-gold-300' : ''}`}>
                                {method.icon}
                              </div>
                              <p className="font-medium">{method.name}</p>
                              <p className="text-sm mt-1 opacity-70">{method.description}</p>
                            </div>
                          </motion.label>
                        ))}
                      </div>

                      {/* Payment Instructions */}
                      <AnimatePresence mode="wait">
                        {selectedPayment === 'momo' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 p-5 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                          >
                            <p className="text-blue-400 font-medium mb-3">Mobile Money Payment</p>
                            <ol className="text-ivory-100/70 text-sm space-y-1.5 list-decimal list-inside">
                              <li>You'll receive an MoMo payment request on your phone</li>
                              <li>Enter your PIN to confirm</li>
                              <li>Payment will be deducted from your Mobile Money account</li>
                            </ol>
                          </motion.div>
                        )}

                        {selectedPayment === 'card' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 p-5 bg-purple-500/10 border border-purple-500/20 rounded-xl"
                          >
                            <p className="text-purple-400 font-medium mb-3">Card Payment</p>
                            <ol className="text-ivory-100/70 text-sm space-y-1.5 list-decimal list-inside">
                              <li>Click "Place Order" to proceed to secure payment</li>
                              <li>Enter your card details on the secure payment page</li>
                              <li>Payment is processed securely via Stripe</li>
                            </ol>
                          </motion.div>
                        )}

                        {selectedPayment === 'bank' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                          >
                            <p className="text-emerald-400 font-medium mb-3">Bank Transfer Details</p>
                            <div className="text-ivory-100/70 text-sm space-y-1">
                              <p><span className="text-ivory-100">Bank:</span> Ghana Commercial Bank</p>
                              <p><span className="text-ivory-100">Account Name:</span> Luxury Perfume</p>
                              <p><span className="text-ivory-100">Account Number:</span> 1234567890</p>
                              <p className="text-ivory-100/50 mt-2">Use your order number as payment reference</p>
                            </div>
                          </motion.div>
                        )}

                        {selectedPayment === 'cod' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
                          >
                            <p className="text-yellow-400 font-medium mb-3">Cash on Delivery</p>
                            <p className="text-ivory-100/70 text-sm">Pay in cash when your order is delivered to your doorstep. Have the exact amount ready for a smooth delivery experience.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-2">
                <div className="bg-charcoal-100/50 backdrop-blur-sm border border-ivory-100/10 rounded-2xl p-6 lg:p-8 sticky top-32">
                  <h2 className="text-lg font-serif text-ivory-100 mb-6">Order Summary</h2>

                  {/* Items Preview */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-ivory-100/10">
                    {cart.slice(0, 3).map((item) => (
                      <div key={item.product._id} className="flex gap-3">
                        <div className="w-14 h-14 bg-charcoal-200/50 rounded-lg overflow-hidden flex-shrink-0 border border-ivory-100/5">
                          {item.product.images?.[0]?.url && (
                            <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-ivory-100 text-sm truncate">{item.product.name}</p>
                          <p className="text-ivory-100/50 text-xs">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-ivory-100 text-sm font-medium">{formatCurrency(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                    {cart.length > 3 && (
                      <p className="text-ivory-100/50 text-xs pl-1">+{cart.length - 3} more items</p>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 pb-6 border-b border-ivory-100/10">
                    <div className="flex justify-between text-ivory-100/70 font-light">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-light">
                        <span>Discount</span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-ivory-100/70 font-light">
                      <span>Tax (3%)</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-serif text-ivory-100 pt-3 border-t border-ivory-100/10">
                      <span>Total</span>
                      <span className="text-gold-300">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {/* Coupon */}
                  <div className="mt-6">
                    {appliedCoupon ? (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-emerald-400 text-sm font-medium">{appliedCoupon.code}</p>
                            <p className="text-ivory-100/50 text-xs">-{formatCurrency(appliedCoupon.discount)}</p>
                          </div>
                          <button onClick={handleRemoveCoupon} className="text-ivory-100/40 hover:text-red-400 p-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Coupon code"
                          className="flex-1 px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 text-sm rounded-xl focus:outline-none focus:border-gold-300/50"
                        />
                        <button
                          type="submit"
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-5 py-3 bg-gold-300/20 border border-gold-300/30 text-gold-300 text-sm rounded-xl hover:bg-gold-300/30 transition-colors disabled:opacity-50 font-medium"
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </form>
                    )}
                    {couponError && <p className="text-red-400 text-xs mt-2">{couponError}</p>}
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary mt-6 disabled:opacity-50 py-4 text-base"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </span>
                    ) : currentStep === 1 ? (
                      'Continue to Payment'
                    ) : (
                      `Place Order - ${formatCurrency(total)}`
                    )}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-ivory-100/30 text-xs">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Secure checkout powered by Luxury Perfume</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Checkout;
