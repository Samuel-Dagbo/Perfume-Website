import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/currency';
import { useCart } from '../../context/CartContext';

const CartSidebar = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const subtotal = getCartTotal();

  return (
    <AnimatePresence>
      {cart.length > 0 && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => document.dispatchEvent(new CustomEvent('toggle-cart'))}
            className="fixed inset-0 bg-charcoal-500/80 backdrop-blur-sm z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-charcoal-200/95 backdrop-blur-xl border-l border-ivory-100/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-ivory-100/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold-300/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-serif text-ivory-100">Your Bag</h2>
                  <p className="text-xs text-ivory-100/50 mt-0.5">
                    {cart.length} {cart.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => document.dispatchEvent(new CustomEvent('toggle-cart'))}
                className="w-10 h-10 flex items-center justify-center text-ivory-100/70 hover:text-ivory-100 hover:bg-charcoal-100/50 rounded-full transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map((item) => (
                <motion.div
                  key={item.product._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 p-4 bg-charcoal-100/30 rounded-2xl border border-ivory-100/5"
                >
                  <div className="w-20 h-20 bg-charcoal-100 overflow-hidden flex-shrink-0 rounded-xl">
                    {item.product.images?.[0]?.url ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-charcoal-400">
                        <span className="text-xl">✦</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col min-w-0">
                    <Link
                      to={`/product/${item.product._id}`}
                      onClick={() => document.dispatchEvent(new CustomEvent('toggle-cart'))}
                      className="text-sm font-serif text-ivory-100 mb-1 line-clamp-2 hover:text-gold-300 transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    {item.product.size && (
                      <p className="text-xs text-ivory-100/40 mb-auto">{item.product.size}</p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center bg-charcoal-100/50 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="px-3 py-1.5 text-ivory-100/60 hover:text-ivory-100 transition-colors"
                        >
                          −
                        </button>
                        <span className="px-3 py-1.5 text-ivory-100 text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="px-3 py-1.5 text-ivory-100/60 hover:text-ivory-100 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-ivory-100 font-medium">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product._id)}
                          className="text-ivory-100/40 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-ivory-100/10 p-6 space-y-4 bg-charcoal-200/50">
              <div className="flex justify-between items-center">
                <span className="text-ivory-100/60">Subtotal</span>
                <span className="text-xl font-serif text-ivory-100">{formatCurrency(subtotal)}</span>
              </div>

              <div className="pt-4 space-y-3">
                <Link
                  to="/checkout"
                  onClick={() => document.dispatchEvent(new CustomEvent('toggle-cart'))}
                  className="btn-primary w-full text-center rounded-xl block"
                >
                  Checkout — {formatCurrency(subtotal)}
                </Link>
                <button
                  onClick={clearCart}
                  className="w-full py-3 text-sm text-ivory-100/50 hover:text-red-400 transition-colors"
                >
                  Clear Bag
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2 text-xs text-ivory-100/30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure checkout</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
