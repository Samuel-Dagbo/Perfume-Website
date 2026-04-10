import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-300/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-4xl bg-charcoal-100/95 border border-ivory-100/10 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-square md:aspect-auto">
                {product.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-charcoal-200 flex items-center justify-center">
                    <span className="text-6xl text-charcoal-400">✦</span>
                  </div>
                )}
                {product.stockQuantity === 0 && (
                  <div className="absolute inset-0 bg-charcoal-300/80 flex items-center justify-center">
                    <span className="badge bg-red-500/90 text-white text-sm">Sold Out</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-8 flex flex-col">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-ivory-100/50 hover:text-ivory-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <p className="section-label mb-2">{product.category}</p>
                <h2 className="heading-3 text-ivory-100 mb-4">{product.name}</h2>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex text-gold-300">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill={i < Math.round(product.ratings?.average || 0) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-ivory-100/50 text-sm">({product.ratings?.count || 0} reviews)</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-serif text-ivory-100">{formatCurrency(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-lg text-ivory-100/40 line-through">{formatCurrency(product.originalPrice)}</span>
                      <span className="badge bg-red-500/20 text-red-400 border border-red-500/30">
                        -{Math.round((1 - product.price/product.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Notes */}
                {product.notes && (product.notes.top || product.notes.middle || product.notes.base) && (
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {product.notes.top && (
                      <div className="bg-charcoal-200/50 p-3 rounded-lg">
                        <p className="text-2xs uppercase tracking-wide text-gold-300 mb-1">Top</p>
                        <p className="text-xs text-ivory-100/70">{product.notes.top}</p>
                      </div>
                    )}
                    {product.notes.middle && (
                      <div className="bg-charcoal-200/50 p-3 rounded-lg">
                        <p className="text-2xs uppercase tracking-wide text-gold-300 mb-1">Heart</p>
                        <p className="text-xs text-ivory-100/70">{product.notes.middle}</p>
                      </div>
                    )}
                    {product.notes.base && (
                      <div className="bg-charcoal-200/50 p-3 rounded-lg">
                        <p className="text-2xs uppercase tracking-wide text-gold-300 mb-1">Base</p>
                        <p className="text-xs text-ivory-100/70">{product.notes.base}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Stock */}
                <div className="mb-6">
                  {product.stockQuantity === 0 ? (
                    <span className="text-red-400 text-sm">Out of Stock</span>
                  ) : product.stockQuantity <= 5 ? (
                    <span className="text-orange-400 text-sm">Only {product.stockQuantity} left</span>
                  ) : (
                    <span className="text-emerald-400 text-sm">In Stock</span>
                  )}
                </div>

                <div className="mt-auto space-y-4">
                  {/* Quantity */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-ivory-100/50">Qty:</span>
                    <div className="flex items-center bg-charcoal-200/50 border border-ivory-100/10 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 text-ivory-100/60 hover:text-ivory-100 transition-colors"
                      >
                        −
                      </button>
                      <span className="px-4 py-2 text-ivory-100 font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                        className="px-4 py-2 text-ivory-100/60 hover:text-ivory-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stockQuantity === 0}
                      className="flex-1 btn-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Bag'}
                    </button>
                    <Link
                      to={`/product/${product._id}`}
                      onClick={onClose}
                      className="btn-secondary rounded-xl"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [showQuickView, setShowQuickView] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stockQuantity > 0) {
      addToCart(product);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to={`/product/${product._id}`} className="group block">
          <div className="relative aspect-[3/4] overflow-hidden bg-charcoal-100 rounded-2xl mb-6">
            {/* Image */}
            {product.images?.[0]?.url ? (
              <>
                <div className={`absolute inset-0 bg-charcoal-200 animate-pulse ${imageLoaded ? 'opacity-0' : 'opacity-100'}`} />
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${imageLoaded ? '' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-charcoal-200 to-charcoal-100">
                <span className="text-6xl text-charcoal-300">✦</span>
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-300 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isFeatured && (
                <span className="badge badge-gold">Featured</span>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="badge bg-red-500/90 text-white">
                  -{Math.round((1 - product.price/product.originalPrice) * 100)}%
                </span>
              )}
              {product.stockQuantity === 0 && (
                <span className="badge bg-red-500/90 text-white">Sold Out</span>
              )}
            </div>

            {/* Quick View Button */}
            <button 
              onClick={(e) => { e.preventDefault(); setShowQuickView(true); }}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-charcoal-300/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold-300 hover:text-charcoal-300 text-ivory-100 translate-x-2 group-hover:translate-x-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>

            {/* Wishlist */}
            <button 
              onClick={(e) => e.preventDefault()} 
              className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center bg-charcoal-300/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold-300 hover:text-charcoal-300 text-ivory-100 translate-y-2 group-hover:translate-y-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            {/* Hover Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className="w-full py-4 bg-ivory-100 text-charcoal-300 text-xs uppercase tracking-ultra-wide font-medium hover:bg-gold-300 transition-colors rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>
            </div>
          </div>
          
          {/* Product Info */}
          <div>
            <p className="section-label mb-2 text-stone-300 capitalize">{product.category}</p>
            <h3 className="text-lg font-serif text-ivory-100 mb-2 line-clamp-1 group-hover:text-gold-300 transition-colors">
              {product.name}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex text-gold-300">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3" fill={i < Math.round(product.ratings?.average || 0) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-ivory-100/40 text-xs">({product.ratings?.count || 0})</span>
            </div>
            
            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-xl font-serif text-ivory-100">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-ivory-100/40 line-through text-sm">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>

      <QuickViewModal 
        product={product} 
        isOpen={showQuickView} 
        onClose={() => setShowQuickView(false)} 
      />
    </>
  );
};

export default ProductCard;
