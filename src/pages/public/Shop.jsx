import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/currency';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [activeFilter, setActiveFilter] = useState(null);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '-createdAt',
    inStock: searchParams.get('inStock') === 'true'
  });

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        handleFilterChange('search', searchInput);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.inStock) params.append('inStock', 'true');
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sort: '-createdAt',
      inStock: false
    });
    setSearchInput('');
    setSearchParams({});
  };

  const categories = [
    { name: 'perfume', label: 'Perfumes', icon: '✨', color: 'from-amber-500/20 to-orange-500/20' },
    { name: 'oil', label: 'Oils', icon: '💧', color: 'from-blue-500/20 to-cyan-500/20' },
    { name: 'gift set', label: 'Gift Sets', icon: '🎁', color: 'from-pink-500/20 to-rose-500/20' },
    { name: 'accessories', label: 'Accessories', icon: '💎', color: 'from-purple-500/20 to-violet-500/20' }
  ];

  const sortOptions = [
    { value: '-createdAt', label: 'Newest Arrivals' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-ratings.average', label: 'Best Rated' }
  ];

  const priceRanges = [
    { label: 'Under ₵200', min: '', max: '200' },
    { label: '₵200 - ₵500', min: '200', max: '500' },
    { label: '₵500 - ₵1000', min: '500', max: '1000' },
    { label: 'Over ₵1000', min: '1000', max: '' }
  ];

  const activeFiltersCount = [
    filters.category,
    filters.minPrice || filters.maxPrice,
    filters.inStock,
    filters.search
  ].filter(Boolean).length;

  return (
    <div className="pt-24 lg:pt-28 bg-charcoal-300 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-200/40 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-300/5 rounded-full blur-[120px]" />
        
        <div className="relative container mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-block px-4 py-1.5 bg-gold-300/10 border border-gold-300/20 rounded-full text-gold-300 text-xs uppercase tracking-widest mb-6"
            >
              Premium Collection
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl lg:text-6xl font-serif text-ivory-100 mb-6"
            >
              Discover Your <span className="text-gold-300">Signature</span> Scent
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-ivory-100/60 font-light max-w-xl mx-auto"
            >
              Curated fragrances crafted with the finest ingredients from around the world
            </motion.p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto mt-10"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-300/50 to-amber-500/50 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search for luxury fragrances..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full px-8 py-5 pl-14 bg-charcoal-100/90 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300/50 rounded-2xl text-base"
                />
                <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-ivory-100/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchInput && (
                  <button
                    onClick={() => { setSearchInput(''); handleFilterChange('search', ''); }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-ivory-100/40 hover:text-ivory-100 transition-colors p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-8 -mt-4">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => handleFilterChange('category', '')}
              className={`group relative px-6 py-3.5 rounded-full text-sm font-medium transition-all duration-300 ${
                filters.category === ''
                  ? 'bg-gold-300 text-charcoal-300 shadow-lg shadow-gold-300/25'
                  : 'bg-charcoal-100/50 border border-ivory-100/10 text-ivory-100/70 hover:border-gold-300/30 hover:text-ivory-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>All</span>
                <span className={`text-xs ${filters.category === '' ? 'text-charcoal-300/70' : 'text-ivory-100/40'}`}>
                  ({pagination.totalProducts || 0})
                </span>
              </span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleFilterChange('category', cat.name)}
                className={`group relative px-6 py-3.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  filters.category === cat.name
                    ? 'bg-gold-300 text-charcoal-300 shadow-lg shadow-gold-300/25'
                    : 'bg-charcoal-100/50 border border-ivory-100/10 text-ivory-100/70 hover:border-gold-300/30 hover:text-ivory-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{cat.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 lg:px-16 pb-24 lg:pb-32">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 py-4 border-b border-ivory-100/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 text-sm border border-ivory-100/20 text-ivory-100/70 hover:text-ivory-100 hover:border-gold-300/30 transition-colors rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-gold-300 text-charcoal-300 text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <p className="text-sm text-ivory-100/50">
              {loading ? (
                <span className="inline-block w-24 h-4 bg-charcoal-100/50 animate-pulse rounded" />
              ) : (
                <><span className="text-ivory-100 font-medium">{pagination.totalProducts || 0}</span> products</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="px-4 py-2.5 text-sm border border-ivory-100/20 focus:outline-none focus:border-gold-300/50 transition-colors bg-charcoal-100/50 text-ivory-100/70 rounded-lg cursor-pointer hover:border-gold-300/30"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-charcoal-100">{option.label}</option>
              ))}
            </select>

            <div className="hidden lg:flex items-center gap-1 bg-charcoal-100/30 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gold-300/20 text-gold-300' : 'text-ivory-100/40 hover:text-ivory-100'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gold-300/20 text-gold-300' : 'text-ivory-100/40 hover:text-ivory-100'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="lg:sticky lg:top-36">
              <div className="bg-charcoal-100/50 backdrop-blur-sm border border-ivory-100/10 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-serif text-ivory-100">Refine</h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-gold-300 hover:text-gold-200 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-sm text-ivory-100/70 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Price Range
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 text-sm placeholder-charcoal-400 focus:outline-none focus:border-gold-300/50 transition-colors rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 text-sm placeholder-charcoal-400 focus:outline-none focus:border-gold-300/50 transition-colors rounded-lg"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {priceRanges.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => {
                          handleFilterChange('minPrice', range.min);
                          handleFilterChange('maxPrice', range.max);
                        }}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                          filters.minPrice === range.min && filters.maxPrice === range.max
                            ? 'bg-gold-300/20 border-gold-300/50 text-gold-300'
                            : 'bg-charcoal-200/30 border-ivory-100/10 text-ivory-100/60 hover:border-gold-300/30'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Filter */}
                <div>
                  <h4 className="text-sm text-ivory-100/70 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
                    </svg>
                    Availability
                  </h4>
                  <label className="flex items-center cursor-pointer gap-3 group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 rounded-full transition-colors ${filters.inStock ? 'bg-gold-300' : 'bg-charcoal-200/50'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform mt-1 ${filters.inStock ? 'translate-x-5' : 'translate-x-1'}`} />
                      </div>
                    </div>
                    <span className="text-sm text-ivory-100/70 group-hover:text-ivory-100 transition-colors">In Stock Only</span>
                  </label>
                </div>
              </div>

              {/* Quick Promo */}
              <div className="mt-6 p-6 bg-gradient-to-br from-gold-300/10 to-amber-500/10 border border-gold-300/20 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gold-300/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-gold-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <span className="text-gold-300 font-medium">Gift Ready</span>
                </div>
                <p className="text-ivory-100/60 text-sm">Looking for the perfect gift? Browse our curated gift sets.</p>
                <Link to="/shop?category=gift+set" className="inline-block mt-3 text-gold-300 text-sm hover:text-gold-200 transition-colors">
                  View Gift Sets →
                </Link>
              </div>
            </div>
          </motion.aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className={`grid gap-6 lg:gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton h-[450px] rounded-2xl" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-charcoal-100/50 backdrop-blur-sm border border-ivory-100/10 rounded-2xl p-16 text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-charcoal-100/50">
                  <svg className="w-12 h-12 text-ivory-100/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif text-ivory-100 mb-2">No fragrances found</h3>
                <p className="text-ivory-100/40 mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearAllFilters} className="btn-primary rounded-xl">
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`grid gap-6 lg:gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
                >
                  <AnimatePresence mode="popLayout">
                    {products.map((product) => (
                      <ProductCardLarge key={product._id} product={product} viewMode={viewMode} />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-16">
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('page', Math.max(1, pagination.currentPage - 1));
                        setSearchParams(params);
                      }}
                      disabled={!pagination.hasPrevPage}
                      className="w-10 h-10 flex items-center justify-center border border-ivory-100/20 text-ivory-100/70 hover:border-gold-300/50 hover:text-gold-300 transition-colors rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {[...Array(pagination.totalPages)].map((_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.set('page', page);
                          setSearchParams(params);
                        }}
                        className={`w-10 h-10 flex items-center justify-center text-sm transition-colors rounded-lg ${
                          pagination.currentPage === page
                            ? 'bg-gold-300 text-charcoal-300'
                            : 'border border-ivory-100/20 text-ivory-100/70 hover:border-gold-300/50 hover:text-gold-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('page', pagination.currentPage + 1);
                        setSearchParams(params);
                      }}
                      disabled={!pagination.hasNextPage}
                      className="w-10 h-10 flex items-center justify-center border border-ivory-100/20 text-ivory-100/70 hover:border-gold-300/50 hover:text-gold-300 transition-colors rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCardLarge = ({ product, viewMode }) => {
  const { addToCart } = useCart();
  const [showQuickView, setShowQuickView] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stockQuantity > 0) {
      addToCart(product);
      document.dispatchEvent(new CustomEvent('toggle-cart'));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-charcoal-100/50 backdrop-blur-sm border border-ivory-100/10 rounded-2xl overflow-hidden hover:border-gold-300/30 transition-all group"
      >
        <Link to={`/product/${product._id}`} className="flex">
          <div className="w-48 h-48 bg-charcoal-100 overflow-hidden flex-shrink-0">
            {product.images?.[0]?.url ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${imageLoaded ? '' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-charcoal-200 to-charcoal-100">
                <span className="text-4xl text-charcoal-300">✦</span>
              </div>
            )}
          </div>
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex-1">
              <p className="text-xs text-gold-300 uppercase tracking-wider mb-2">{product.category}</p>
              <h3 className="text-lg font-serif text-ivory-100 mb-2 group-hover:text-gold-300 transition-colors">{product.name}</h3>
              <p className="text-sm text-ivory-100/50 line-clamp-2 mb-4">{product.description}</p>
              <div className="flex items-center gap-2 text-gold-300">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4" fill={i < Math.round(product.ratings?.average || 0) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-xs text-ivory-100/40">({product.ratings?.count || 0})</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div>
                <span className="text-2xl font-serif text-ivory-100">{formatCurrency(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-sm text-ivory-100/40 line-through ml-2">{formatCurrency(product.originalPrice)}</span>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className="px-6 py-3 bg-gold-300 text-charcoal-300 text-sm font-medium rounded-xl hover:bg-gold-200 transition-colors disabled:opacity-50"
              >
                {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/product/${product._id}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden bg-charcoal-100 rounded-2xl mb-6">
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
          
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-300 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isFeatured && (
              <span className="px-3 py-1 bg-gold-300/90 text-charcoal-300 text-xs uppercase tracking-wider rounded-full">Featured</span>
            )}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="px-3 py-1 bg-red-500/90 text-white text-xs uppercase tracking-wider rounded-full">
                -{Math.round((1 - product.price/product.originalPrice) * 100)}%
              </span>
            )}
          </div>

          <button 
            onClick={(e) => { e.preventDefault(); setShowQuickView(true); }}
            className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-charcoal-300/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold-300 hover:text-charcoal-300 text-ivory-100 translate-x-2 group-hover:translate-x-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className="w-full py-4 bg-ivory-100 text-charcoal-300 text-sm uppercase tracking-widest font-medium hover:bg-gold-300 transition-colors rounded-xl disabled:opacity-50"
            >
              {product.stockQuantity === 0 ? 'Sold Out' : 'Add to Bag'}
            </button>
          </div>

          {product.stockQuantity === 0 && (
            <div className="absolute inset-0 bg-charcoal-300/80 flex items-center justify-center">
              <span className="px-4 py-2 bg-red-500/90 text-white text-sm uppercase tracking-wider rounded-full">Sold Out</span>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-xs text-gold-300 uppercase tracking-wider mb-2">{product.category}</p>
          <h3 className="text-lg font-serif text-ivory-100 mb-2 line-clamp-1 group-hover:text-gold-300 transition-colors">
            {product.name}
          </h3>
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
          <div className="flex items-center gap-3">
            <span className="text-xl font-serif text-ivory-100">{formatCurrency(product.price)}</span>
            {product.originalPrice && (
              <span className="text-ivory-100/40 line-through text-sm">{formatCurrency(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

import { useCart } from '../../context/CartContext';

export default Shop;
