import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated, token } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
        
        const relatedResponse = await api.get(`/products/${id}/related`);
        setRelatedProducts(relatedResponse.data.products);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product && product.stockQuantity > 0) {
      addToCart(product, quantity);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const comment = formData.get('comment');

    try {
      await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment });
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.product);
      e.target.reset();
      setReviewRating(0);
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-charcoal-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold-300/30 border-t-gold-300 rounded-full animate-spin" />
          <p className="text-ivory-100/50 text-sm tracking-wide">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-charcoal-300">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-charcoal-100/50">
            <svg className="w-10 h-10 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-ivory-100 mb-4">Product not found</h2>
          <Link to="/shop" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 lg:pt-28 bg-charcoal-300 min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 lg:px-16 py-6">
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/" className="text-ivory-100/50 hover:text-gold-300 transition-colors">Home</Link>
          <span className="text-ivory-100/30">/</span>
          <Link to="/shop" className="text-ivory-100/50 hover:text-gold-300 transition-colors">Shop</Link>
          <span className="text-ivory-100/30">/</span>
          <span className="text-ivory-100/70 capitalize">{product.category}</span>
        </nav>
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-6 lg:px-16 pb-24 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Main Image */}
            <div className="relative aspect-square lg:aspect-[4/5] overflow-hidden bg-charcoal-100 rounded-2xl mb-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={product.images?.[selectedImage]?.url || 'https://via.placeholder.com/800'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {product.isFeatured && <span className="badge badge-gold">Featured</span>}
                {product.stockQuantity === 0 && <span className="badge bg-red-500/90 text-white">Sold Out</span>}
              </div>
            </div>
            
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden rounded-lg transition-all duration-300 ${
                      selectedImage === index
                        ? 'ring-2 ring-gold-300 ring-offset-2 ring-offset-charcoal-300'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:py-8"
          >
            <div className="mb-6">
              <p className="section-label mb-3 capitalize">{product.category}</p>
              <h1 className="heading-2 text-ivory-100 mb-6">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex text-gold-300">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5"
                      fill={i < Math.round(product.ratings?.average || 0) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-ivory-100/60">
                  {product.ratings?.average?.toFixed(1) || 0} ({product.ratings?.count || 0} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-4xl font-serif text-ivory-100">{formatCurrency(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-ivory-100/40 line-through">{formatCurrency(product.originalPrice)}</span>
                  <span className="badge bg-red-500/90 text-white">
                    Save {formatCurrency(product.originalPrice - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-3 mb-8">
              {product.stockQuantity === 0 ? (
                <div className="flex items-center gap-2 text-red-400">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-sm font-medium">Out of Stock</span>
                </div>
              ) : product.isLowStock ? (
                <div className="flex items-center gap-2 text-orange-400">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Only {product.stockQuantity} left</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-sm font-medium">In Stock</span>
                </div>
              )}
            </div>

            {/* Size */}
            {product.size && (
              <div className="mb-8">
                <p className="section-label mb-3">Size</p>
                <span className="inline-block px-6 py-3 bg-charcoal-100/50 border border-ivory-100/10 rounded-xl text-ivory-100/80">
                  {product.size}
                </span>
              </div>
            )}

            {/* Notes */}
            {product.notes && (
              <div className="mb-10">
                <p className="section-label mb-4">Fragrance Notes</p>
                <div className="grid grid-cols-3 gap-4">
                  {product.notes.top && (
                    <div className="p-4 bg-charcoal-100/30 border border-ivory-100/10 rounded-xl">
                      <p className="text-2xs uppercase tracking-ultra-wide text-gold-300 mb-2">Top</p>
                      <p className="text-sm text-ivory-100/80 font-light">{product.notes.top}</p>
                    </div>
                  )}
                  {product.notes.middle && (
                    <div className="p-4 bg-charcoal-100/30 border border-ivory-100/10 rounded-xl">
                      <p className="text-2xs uppercase tracking-ultra-wide text-gold-300 mb-2">Heart</p>
                      <p className="text-sm text-ivory-100/80 font-light">{product.notes.middle}</p>
                    </div>
                  )}
                  {product.notes.base && (
                    <div className="p-4 bg-charcoal-100/30 border border-ivory-100/10 rounded-xl">
                      <p className="text-2xs uppercase tracking-ultra-wide text-gold-300 mb-2">Base</p>
                      <p className="text-sm text-ivory-100/80 font-light">{product.notes.base}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex items-center bg-charcoal-100/30 border border-ivory-100/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-5 py-4 text-ivory-100/60 hover:text-ivory-100 hover:bg-charcoal-100/30 transition-colors"
                >
                  −
                </button>
                <span className="px-6 py-4 text-ivory-100 font-medium border-x border-ivory-100/10">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-5 py-4 text-ivory-100/60 hover:text-ivory-100 hover:bg-charcoal-100/30 transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className="flex-1 btn-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>
            </div>

            {/* Wishlist */}
            <button className="w-full py-4 border border-ivory-100/20 text-ivory-100/70 rounded-xl hover:border-gold-300 hover:text-gold-300 transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Add to Wishlist
            </button>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl">
          <div className="border-b border-ivory-100/10 mb-0">
            <div className="flex gap-10">
              {['description', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-5 text-sm uppercase tracking-ultra-wide transition-colors relative ${
                    activeTab === tab
                      ? 'text-gold-300'
                      : 'text-ivory-100/50 hover:text-ivory-100'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-300"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="py-10">
            {activeTab === 'description' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-invert max-w-none"
              >
                <p className="text-ivory-100/70 leading-relaxed whitespace-pre-line text-lg font-light">
                  {product.description}
                </p>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {/* Add Review Form */}
                {isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-8">
                    <h3 className="heading-4 text-ivory-100 mb-6">Write a Review</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="section-label mb-3 block">Your Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              onMouseEnter={() => setReviewHover(star)}
                              onMouseLeave={() => setReviewHover(0)}
                              className="transition-transform hover:scale-110"
                            >
                              <svg 
                                className={`w-8 h-8 transition-colors ${
                                  star <= (reviewHover || reviewRating) ? 'text-gold-300 fill-current' : 'text-ivory-100/30'
                                }`} 
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="section-label mb-3 block">Your Review</label>
                        <textarea
                          name="comment"
                          rows="4"
                          className="w-full px-6 py-4 bg-charcoal-100/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-xl resize-none"
                          placeholder="Share your experience with this fragrance..."
                        ></textarea>
                      </div>
                      <button type="submit" className="btn-primary rounded-xl">
                        Submit Review
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-8 text-center">
                    <p className="text-ivory-100/60 mb-4">Please sign in to write a review</p>
                    <Link to="/login" className="btn-secondary">Sign In</Link>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {product.reviews?.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-ivory-100/40">No reviews yet. Be the first to share your experience!</p>
                    </div>
                  ) : (
                    product.reviews?.map((review) => (
                      <div key={review._id} className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-gold-300/20 rounded-full flex items-center justify-center text-gold-300 font-serif text-lg">
                            {review.user?.name?.[0]?.toUpperCase() || 'A'}
                          </div>
                          <div className="flex-1">
                            <p className="text-ivory-100 font-medium">{review.user?.name || 'Anonymous'}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex text-gold-300">
                                {[...Array(review.rating)].map((_, i) => (
                                  <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs text-ivory-100/40">
                                {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-ivory-100/60 font-light leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <p className="section-label mb-4">Explore More</p>
              <h2 className="heading-2 text-ivory-100">You May Also Like</h2>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <Link key={product._id} to={`/product/${product._id}`} className="group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-charcoal-100 rounded-2xl mb-4">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-4xl">✦</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-300/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <p className="section-label mb-1 capitalize text-stone-300">{product.category}</p>
                  <h3 className="text-lg font-serif text-ivory-100 group-hover:text-gold-300 transition-colors">{product.name}</h3>
                  <p className="text-ivory-100/60 font-light">${product.price}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
