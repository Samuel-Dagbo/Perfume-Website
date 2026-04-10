import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import api from '../../utils/api';

const TAX_RATE = 0.03;

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [couponError, setCouponError] = useState('');

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
  const shipping = 0;
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
        paymentMethod: 'cod',
        couponCode: appliedCoupon?.code
      });

      if (response.data.success) {
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

  const inputClass = (hasError) => `
    w-full px-4 py-3 bg-charcoal-200/50 border text-ivory-100 placeholder-charcoal-400 
    focus:outline-none transition-colors rounded-lg
    ${hasError ? 'border-red-500/50 focus:border-red-500' : 'border-ivory-100/10 focus:border-gold-300'}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-300/95 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-charcoal-100 border border-ivory-100/10 rounded-3xl p-8 max-w-md w-full text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center"
              >
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              
              <h2 className="text-2xl font-serif text-ivory-100 mb-2">Order Confirmed!</h2>
              <p className="text-ivory-100/60 mb-6">
                Thank you for your order. We'll send you a confirmation email shortly.
              </p>
              
              <div className="bg-charcoal-200/50 rounded-xl p-4 mb-6">
                <p className="text-ivory-100/50 text-sm mb-1">Order Number</p>
                <p className="text-gold-300 font-serif text-lg">#{orderSuccess._id.slice(-8).toUpperCase()}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/dashboard/orders')}
                  className="flex-1 btn-primary rounded-xl py-4"
                >
                  View Orders
                </button>
                <button
                  onClick={() => navigate('/shop')}
                  className="flex-1 py-4 border border-ivory-100/20 text-ivory-100 rounded-xl hover:bg-ivory-100/5 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-6 lg:px-16">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-gold-300' : 'text-ivory-100/40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'bg-gold-300 text-charcoal-300' : 'bg-ivory-100/10'
                }`}>
                  {currentStep > 1 ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : '1'}
                </div>
                <span className="text-sm font-light hidden sm:block">Shipping</span>
              </div>
              <div className={`w-16 h-px ${currentStep >= 2 ? 'bg-gold-300' : 'bg-ivory-100/20'}`} />
              <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-gold-300' : 'text-ivory-100/40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? 'bg-gold-300 text-charcoal-300' : 'bg-ivory-100/10'
                }`}>2</div>
                <span className="text-sm font-light hidden sm:block">Review</span>
              </div>
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
                      Shipping Address
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

                      <div>
                        <label className="block text-sm text-ivory-100/70 mb-2 font-light">Street Address</label>
                        <input
                          type="text"
                          value={shippingAddress.street}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                          className={inputClass(formErrors.street)}
                          placeholder="123 Main Street, Apt 4B"
                        />
                        {formErrors.street && <p className="text-red-400 text-xs mt-1">{formErrors.street}</p>}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        <div className="col-span-2">
                          <label className="block text-sm text-ivory-100/70 mb-2 font-light">City</label>
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
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                        </select>
                      </div>

                      <div className="pt-4 border-t border-ivory-100/10">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="cod"
                            checked
                            readOnly
                            className="w-4 h-4 rounded border border-ivory-100/30 bg-charcoal-200/50 accent-gold-300"
                          />
                          <label htmlFor="cod" className="text-ivory-100/70 text-sm font-light">
                            Cash on Delivery (COD)
                          </label>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-charcoal-100/50 backdrop-blur-sm border border-ivory-100/10 rounded-2xl p-6 lg:p-8"
                  >
                    <h2 className="text-xl font-serif text-ivory-100 mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 bg-gold-300/20 text-gold-300 rounded-full flex items-center justify-center text-sm">2</span>
                      Review Your Order
                    </h2>

                    {/* Shipping Summary */}
                    <div className="bg-charcoal-200/30 rounded-xl p-4 mb-6">
                      <p className="text-ivory-100/50 text-xs uppercase tracking-wide mb-2">Shipping to</p>
                      <p className="text-ivory-100 font-medium">{shippingAddress.fullName}</p>
                      <p className="text-ivory-100/70 text-sm">{shippingAddress.street}</p>
                      <p className="text-ivory-100/70 text-sm">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                      <p className="text-ivory-100/70 text-sm">{shippingAddress.phone}</p>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-gold-300 text-sm mt-2 hover:text-gold-200 transition-colors"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.product._id} className="flex gap-4 p-4 bg-charcoal-200/30 rounded-xl">
                          <div className="w-20 h-20 bg-charcoal-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.product.images?.[0]?.url ? (
                              <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-charcoal-400">✦</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-serif text-ivory-100 text-sm">{item.product.name}</h3>
                            <p className="text-ivory-100/50 text-xs mt-1">Qty: {item.quantity}</p>
                            <p className="text-gold-300 font-medium mt-1">{formatCurrency(item.product.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
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
                        <div className="w-12 h-12 bg-charcoal-200/50 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.images?.[0]?.url && (
                            <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-ivory-100 text-sm truncate">{item.product.name}</p>
                          <p className="text-ivory-100/50 text-xs">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-ivory-100 text-sm">{formatCurrency(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                    {cart.length > 3 && (
                      <p className="text-ivory-100/50 text-xs">+{cart.length - 3} more items</p>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 pb-6 border-b border-ivory-100/10">
                    <div className="flex justify-between text-ivory-100/70 font-light text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-light text-sm">
                        <span>Discount</span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-ivory-100/70 font-light text-sm">
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
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-emerald-400 text-sm font-medium">{appliedCoupon.code}</p>
                            <p className="text-ivory-100/50 text-xs">-{formatCurrency(appliedCoupon.discount)}</p>
                          </div>
                          <button onClick={handleRemoveCoupon} className="text-ivory-100/40 hover:text-red-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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
                          className="flex-1 px-3 py-2 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 text-sm rounded-lg focus:outline-none focus:border-gold-300"
                        />
                        <button
                          type="submit"
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2 bg-gold-300/20 border border-gold-300/30 text-gold-300 text-sm rounded-lg hover:bg-gold-300/30 transition-colors disabled:opacity-50"
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
                    className="w-full btn-primary mt-6 disabled:opacity-50"
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
                      'Continue to Review'
                    ) : (
                      `Place Order - ${formatCurrency(total)}`
                    )}
                  </button>

                  <p className="text-center text-ivory-100/40 text-xs mt-4">
                    {currentStep === 1 ? 'You can review your order on the next step' : 'Your order will be confirmed via email'}
                  </p>
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
