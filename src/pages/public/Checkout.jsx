import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import api from '../../utils/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'United States',
    phone: user?.phone || ''
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-charcoal-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-charcoal-100/50">
            <svg className="w-10 h-10 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-ivory-100 mb-4">
            Sign in to Checkout
          </h2>
          <p className="text-ivory-100/50 mb-8 font-light">
            Please log in or create an account to complete your purchase.
          </p>
          <Link to="/login" className="btn-primary inline-block">
            Login
          </Link>
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
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-charcoal-100/50">
            <svg className="w-10 h-10 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-ivory-100 mb-4">
            Your Bag is Empty
          </h2>
          <p className="text-ivory-100/50 mb-8 font-light">
            Looks like you haven't added anything to your bag yet.
          </p>
          <Link to="/shop" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal >= 100 ? 0 : 10;
  const discount = appliedCoupon?.discount || 0;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    setError('');
    
    try {
      const response = await api.post('/coupons/validate', {
        code: couponCode,
        subtotal
      });
      
      if (response.data.success) {
        setAppliedCoupon(response.data.coupon);
        setCouponCode('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };
  
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

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
        setSuccessMessage('Order placed successfully! Redirecting...');
        clearCart();
        setTimeout(() => {
          navigate('/dashboard/orders');
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to place order');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="pt-24 lg:pt-28 bg-charcoal-300 min-h-screen">
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-6 lg:px-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <p className="section-label mb-4 text-center">Complete Your Purchase</p>
            <h1 className="heading-2 text-ivory-100 mb-12 text-center">
              Checkout
            </h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Shipping Address */}
              <motion.div 
                variants={fadeInUp}
                className="lg:col-span-3"
              >
                <h2 className="heading-4 text-ivory-100 mb-6">
                  Shipping Address
                </h2>

                <div className="bg-charcoal-100/50 backdrop-blur-sm border border-ivory-100/10 rounded-2xl p-6 lg:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-ivory-100/70 mb-2 font-light">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                        className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-ivory-100/70 mb-2 font-light">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-ivory-100/70 mb-2 font-light">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm text-ivory-100/70 mb-2 font-light">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                        placeholder="Los Angeles"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-ivory-100/70 mb-2 font-light">
                        State
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                        placeholder="California"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-ivory-100/70 mb-2 font-light">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                        className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                        placeholder="90210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-ivory-100/70 mb-2 font-light">
                      Country
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                    />
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
                        Cash on Delivery
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Order Summary */}
              <motion.div 
                variants={fadeInUp}
                className="lg:col-span-2"
              >
                <h2 className="heading-4 text-ivory-100 mb-6">
                  Order Summary
                </h2>

                <div className="bg-charcoal-100/50 backdrop-blur-sm border border-ivory-100/10 rounded-2xl p-6 lg:p-8 sticky top-32">
                  <div className="space-y-4 mb-6 pb-6 border-b border-ivory-100/10">
                    {cart.map((item) => (
                      <div key={item.product._id} className="flex gap-4">
                        <div className="w-20 h-20 bg-charcoal-200/50 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.images?.[0]?.url ? (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-charcoal-400">
                              <span className="text-2xl">✦</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-ivory-100 line-clamp-1 text-sm">
                            {item.product.name}
                          </h3>
                          <p className="text-ivory-100/50 text-xs mt-1">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-gold-300 font-light mt-1">
                            {formatCurrency(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pb-6 border-b border-ivory-100/10">
                    <div className="flex justify-between text-ivory-100/70 font-light text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-light text-sm">
                        <span className="flex items-center gap-1">
                          <span>Discount</span>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="ml-1 text-ivory-100/40 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-ivory-100/70 font-light text-sm">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? <span className="text-gold-300">Free</span> : formatCurrency(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-ivory-100/70 font-light text-sm">
                      <span>Tax (8%)</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-serif text-ivory-100 pt-3 border-t border-ivory-100/10">
                      <span>Total</span>
                      <span className="text-gold-300">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {subtotal < 100 && (
                    <div className="mt-4 p-4 bg-charcoal-200/50 rounded-xl">
                      <p className="text-xs text-ivory-100/60 font-light text-center">
                        Add {formatCurrency(100 - subtotal)} more for <span className="text-gold-300">FREE shipping</span>
                      </p>
                    </div>
                  )}

                  {!appliedCoupon && (
                    <form onSubmit={handleApplyCoupon} className="mt-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Coupon code"
                          className="flex-1 px-3 py-2 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 text-sm focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                        />
                        <button
                          type="submit"
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2 bg-gold-300/20 border border-gold-300/30 text-gold-300 text-sm font-medium rounded-lg hover:bg-gold-300/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                    </form>
                  )}

                  {appliedCoupon && (
                    <div className="mt-4 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-400 text-sm font-medium">{appliedCoupon.code}</p>
                          <p className="text-ivory-100/50 text-xs">{appliedCoupon.description}</p>
                        </div>
                        <span className="text-emerald-400 font-medium">-{formatCurrency(appliedCoupon.discount)}</span>
                      </div>
                    </div>
                  )}

                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-emerald-900/30 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm text-center"
                    >
                      {successMessage}
                    </motion.div>
                  )}

                  {error && (
                    <div className="mt-4 p-4 bg-red-900/30 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || successMessage}
                    className="w-full btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : successMessage ? (
                      'Order Placed!'
                    ) : (
                      'Place Order'
                    )}
                  </button>

                  <p className="text-center text-ivory-100/40 text-xs mt-4 font-light">
                    Your order will be confirmed via email
                  </p>
                </div>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Checkout;
