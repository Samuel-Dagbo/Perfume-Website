import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/product/ProductCard';
import { usePageTracking } from '../../hooks/useAnalytics';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  usePageTracking();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    sort: searchParams.get('sort') || '-createdAt',
    inStock: false
  });

  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);

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

  const categories = [
    { name: 'perfume', label: 'Perfumes', icon: '✦' },
    { name: 'oil', label: 'Oils', icon: '✦' },
    { name: 'gift set', label: 'Gift Sets', icon: '✦' },
    { name: 'accessories', label: 'Accessories', icon: '✦' }
  ];

  const sortOptions = [
    { value: '-createdAt', label: 'Newest' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-ratings.average', label: 'Highest Rated' }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  return (
    <div className="pt-24 lg:pt-28 bg-charcoal-300 min-h-screen">
      {/* Hero Header */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-200/30 to-transparent" />
        
        <div className="relative container mx-auto px-6 lg:px-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-label mb-4 text-center"
          >
            Our Collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="heading-2 text-ivory-100 text-center mb-8"
          >
            Shop All
          </motion.h1>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for fragrances..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-6 py-4 pl-14 bg-charcoal-100/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-2xl"
              />
              <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-ivory-100/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(''); handleFilterChange('search', ''); }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-ivory-100/40 hover:text-ivory-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 lg:px-16 pb-24 lg:pb-32">
        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => handleFilterChange('category', '')}
            className={`px-6 py-3 rounded-full text-sm font-light transition-all ${
              filters.category === ''
                ? 'bg-gold-300 text-charcoal-300'
                : 'bg-charcoal-100/50 border border-ivory-100/10 text-ivory-100/70 hover:text-ivory-100 hover:border-ivory-100/30'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleFilterChange('category', cat.name)}
              className={`px-6 py-3 rounded-full text-sm font-light capitalize transition-all ${
                filters.category === cat.name
                  ? 'bg-gold-300 text-charcoal-300'
                  : 'bg-charcoal-100/50 border border-ivory-100/10 text-ivory-100/70 hover:text-ivory-100 hover:border-ivory-100/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar Filters */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="lg:sticky lg:top-32">
              <div className="bg-charcoal-100/50 backdrop-blur-sm border border-ivory-100/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="heading-4 text-ivory-100">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-ivory-100/50 hover:text-ivory-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Price Filter */}
                <div className="mb-6">
                  <h4 className="section-label mb-4">Price Range</h4>
                  <div className="flex gap-3 items-center">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 text-sm placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                    />
                    <span className="text-ivory-100/30">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 text-sm placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-lg"
                    />
                  </div>
                </div>

                {/* Stock Filter */}
                <div className="mb-6">
                  <label className="flex items-center cursor-pointer gap-3">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="w-4 h-4 rounded border border-ivory-100/30 text-gold-300 focus:ring-gold-300 focus:ring-offset-0 bg-charcoal-200/50"
                    />
                    <span className="text-sm text-ivory-100/70">In Stock Only</span>
                  </label>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => {
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
                  }}
                  className="w-full py-3 text-sm text-ivory-100/50 hover:text-gold-300 border border-ivory-100/10 hover:border-gold-300/30 transition-colors rounded-lg"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </motion.aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <p className="text-sm text-ivory-100/50 font-light">
                {loading ? (
                  <span className="inline-block w-24 h-4 bg-charcoal-100/50 animate-pulse rounded" />
                ) : (
                  <>{pagination.totalProducts || 0} Products</>
                )}
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 text-sm border border-ivory-100/20 text-ivory-100/70 hover:text-ivory-100 hover:border-ivory-100/40 transition-colors rounded-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>

                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="px-4 py-2.5 text-sm border border-ivory-100/20 focus:outline-none focus:border-gold-300 transition-colors bg-charcoal-100/50 text-ivory-100/70 rounded-lg"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-charcoal-100/50">
                  <svg className="w-10 h-10 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-ivory-100/50 mb-6">No products found matching your criteria</p>
                <button
                  onClick={() => {
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
                  }}
                  className="btn-secondary rounded-xl"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                >
                  <AnimatePresence>
                    {products.map((product) => (
                      <motion.div key={product._id} variants={fadeInUp}>
                        <ProductCard product={product} />
                      </motion.div>
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
                      className="w-10 h-10 flex items-center justify-center border border-ivory-100/20 text-ivory-100/70 hover:border-ivory-100/40 hover:text-ivory-100 transition-colors rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
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
                            : 'border border-ivory-100/20 text-ivory-100/70 hover:border-ivory-100/40 hover:text-ivory-100'
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
                      className="w-10 h-10 flex items-center justify-center border border-ivory-100/20 text-ivory-100/70 hover:border-ivory-100/40 hover:text-ivory-100 transition-colors rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
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

export default Shop;
