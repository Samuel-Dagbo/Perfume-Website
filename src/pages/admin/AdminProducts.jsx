import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/currency';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'perfume',
    stockQuantity: '',
    lowStockThreshold: '10',
    sku: '',
    brand: 'LUXE Parfums',
    size: '100ml',
    isFeatured: false,
    isActive: true,
    images: [],
    notes: { top: '', middle: '', base: '' },
    tags: ''
  });

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: 'active'
  });

  const [page, setPage] = useState(1);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 15);
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/admin/products?${params.toString()}`);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, page, showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploadFormData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      uploadFormData.append('images', files[i]);
    }

    try {
      const response = await api.post('/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newImages = [...formData.images, ...response.data.images];
      setFormData(prev => ({ ...prev, images: newImages }));
      showToast(`${response.data.images.length} image(s) uploaded`);
    } catch (error) {
      console.error('Failed to upload images:', error);
      showToast('Failed to upload images', 'error');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async (index) => {
    const image = formData.images[index];
    
    if (image.public_id) {
      try {
        await api.delete(`/upload/${image.public_id}`);
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }
    
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const openAddModal = () => {
    resetForm();
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category || 'perfume',
      stockQuantity: product.stockQuantity?.toString() || '',
      lowStockThreshold: product.lowStockThreshold?.toString() || '10',
      sku: product.sku || '',
      brand: product.brand || 'LUXE Parfums',
      size: product.size || '100ml',
      isFeatured: product.isFeatured || false,
      isActive: product.isActive !== false,
      images: product.images || [],
      notes: product.notes || { top: '', middle: '', base: '' },
      tags: (product.tags || []).join(', ')
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/products/${id}`);
      showToast('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      showToast('Failed to delete product', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const submitData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
      price: parseFloat(formData.price) || 0,
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
      images: formData.images.map(img => ({ url: img.url, public_id: img.public_id }))
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, submitData);
        showToast('Product updated successfully');
      } else {
        await api.post('/products', submitData);
        showToast('Product created successfully');
      }
      setTimeout(() => {
        setShowModal(false);
        setEditingProduct(null);
        fetchProducts();
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('Failed to save product:', error);
      showToast(error.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: 'perfume',
      stockQuantity: '',
      lowStockThreshold: '10',
      sku: '',
      brand: 'LUXE Parfums',
      size: '100ml',
      isFeatured: false,
      isActive: true,
      images: [],
      notes: { top: '', middle: '', base: '' },
      tags: ''
    });
  };

  const categories = [
    { value: 'perfume', label: 'Perfume' },
    { value: 'oil', label: 'Oil' },
    { value: 'gift set', label: 'Gift Set' },
    { value: 'accessories', label: 'Accessories' }
  ];

  const getStatusBadge = (product) => {
    if (!product.isActive) return { label: 'Inactive', class: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (product.stockQuantity === 0) return { label: 'Out of Stock', class: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (product.stockQuantity <= (product.lowStockThreshold || 10)) return { label: 'Low Stock', class: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    return { label: 'Active', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  };

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

      {/* Page Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-2 text-ivory-100">Products</h1>
            <p className="text-ivory-100/50 font-light mt-1">
              {pagination.totalProducts ? `${pagination.totalProducts} products` : 'Manage your product catalog'}
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold-300 text-charcoal-300 text-xs font-medium uppercase tracking-wider rounded-xl hover:bg-gold-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      <div className="px-6 pb-8">
        {/* Filters */}
        <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-5 mb-6 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
                className="w-full pl-12 pr-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
              />
            </div>

            <select
              value={filters.category}
              onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}
              className="px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 rounded-xl focus:outline-none focus:border-gold-300 min-w-[160px]"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
              className="px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 rounded-xl focus:outline-none focus:border-gold-300 min-w-[140px]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="">All</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-80 rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-12 text-center backdrop-blur-sm"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-charcoal-200/50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-serif text-ivory-100 mb-2">No Products Found</h3>
            <p className="text-ivory-100/50 font-light mb-6">Start by adding your first product</p>
            <button onClick={openAddModal} className="btn-primary rounded-xl">
              Add Your First Product
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((product, index) => {
                const status = getStatusBadge(product);
                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-ivory-100/20 transition-colors group"
                  >
                    {/* Image */}
                    <div className="aspect-[4/3] bg-charcoal-200/50 relative overflow-hidden">
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-4xl">✦</div>
                      )}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {product.isFeatured && (
                          <span className="px-2 py-1 bg-gold-300/90 text-charcoal-300 text-[10px] uppercase tracking-wider rounded-md font-medium">Featured</span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-ivory-100 font-medium line-clamp-1">{product.name}</h3>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-light border ${status.class}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <p className="text-ivory-100/50 text-sm capitalize mb-3">{product.category}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-xl font-serif text-gold-300">{formatCurrency(product.price)}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-ivory-100/40 line-through text-sm ml-2">{formatCurrency(product.originalPrice)}</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`text-sm ${product.stockQuantity === 0 ? 'text-red-400' : product.stockQuantity <= (product.lowStockThreshold || 10) ? 'text-orange-400' : 'text-ivory-100/70'}`}>
                            {product.stockQuantity} in stock
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-ivory-100/5">
                        <button
                          onClick={() => handleEdit(product)}
                          className="flex-1 py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-colors text-sm font-light flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 bg-charcoal-100/30 border border-ivory-100/10 text-ivory-100/70 rounded-lg hover:bg-charcoal-100/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="px-4 py-2 text-ivory-100/70 font-light">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === pagination.totalPages}
                  className="p-2 bg-charcoal-100/30 border border-ivory-100/10 text-ivory-100/70 rounded-lg hover:bg-charcoal-100/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-charcoal-300/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-charcoal-200/95 border border-ivory-100/10 rounded-2xl backdrop-blur-xl shadow-2xl"
            >
              <div className="sticky top-0 bg-charcoal-200/95 border-b border-ivory-100/10 p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-serif text-ivory-100">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                  <p className="text-ivory-100/50 text-sm font-light mt-1">{editingProduct ? 'Update product information' : 'Fill in the product details'}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-charcoal-300/50 flex items-center justify-center text-ivory-100/50 hover:text-ivory-100 hover:bg-charcoal-300 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Images */}
                <div>
                  <h3 className="text-sm text-ivory-100/70 uppercase tracking-wider mb-4">Product Images</h3>
                  <div className="grid grid-cols-5 gap-3 mb-3">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative aspect-square bg-charcoal-300/50 rounded-xl overflow-hidden group">
                        <img src={image.url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-gold-300/90 text-charcoal-300 text-[10px] uppercase tracking-wider rounded font-medium">Main</span>
                        )}
                      </div>
                    ))}
                    
                    <label className="aspect-square bg-charcoal-300/30 border-2 border-dashed border-ivory-100/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-gold-300/50 transition-colors">
                      {uploadingImages ? (
                        <div className="w-6 h-6 border-2 border-gold-300/30 border-t-gold-300 rounded-full animate-spin" />
                      ) : (
                        <>
                          <svg className="w-6 h-6 text-ivory-100/40 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-[10px] text-ivory-100/40">Add</span>
                        </>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploadingImages} />
                    </label>
                  </div>
                  <p className="text-xs text-ivory-100/40">First image will be the main product image. Max 5 images.</p>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-ivory-100/70 mb-2">Product Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl" placeholder="Enter product name" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-ivory-100/70 mb-2">Description *</label>
                    <textarea required rows="3" value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-3 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl resize-none" placeholder="Enter product description" />
                  </div>

                  <div>
                    <label className="block text-sm text-ivory-100/70 mb-2">Price ($) *</label>
                    <input type="number" required step="0.01" min="0" value={formData.price} onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))} className="w-full px-4 py-3 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl" placeholder="0.00" />
                  </div>

                  <div>
                    <label className="block text-sm text-ivory-100/70 mb-2">Original Price ($)</label>
                    <input type="number" step="0.01" min="0" value={formData.originalPrice} onChange={(e) => setFormData(p => ({ ...p, originalPrice: e.target.value }))} className="w-full px-4 py-3 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl" placeholder="For discount display" />
                  </div>

                  <div>
                    <label className="block text-sm text-ivory-100/70 mb-2">Category *</label>
                    <select value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full px-4 py-3 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl">
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-ivory-100/70 mb-2">Size</label>
                    <input type="text" value={formData.size} onChange={(e) => setFormData(p => ({ ...p, size: e.target.value }))} className="w-full px-4 py-3 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl" placeholder="e.g., 100ml" />
                  </div>

                  <div>
                    <label className="block text-sm text-ivory-100/70 mb-2">SKU</label>
                    <input type="text" value={formData.sku} onChange={(e) => setFormData(p => ({ ...p, sku: e.target.value }))} className="w-full px-4 py-3 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl" placeholder="Product SKU" />
                  </div>

                  <div>
                    <label className="block text-sm text-ivory-100/70 mb-2">Brand</label>
                    <input type="text" value={formData.brand} onChange={(e) => setFormData(p => ({ ...p, brand: e.target.value }))} className="w-full px-4 py-3 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl" />
                  </div>
                </div>

                {/* Inventory */}
                <div>
                  <h3 className="text-sm text-ivory-100/70 uppercase tracking-wider mb-4">Inventory</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-ivory-100/70 mb-2">Stock Quantity *</label>
                      <input type="number" required min="0" value={formData.stockQuantity} onChange={(e) => setFormData(p => ({ ...p, stockQuantity: e.target.value }))} className="w-full px-4 py-3 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm text-ivory-100/70 mb-2">Low Stock Alert</label>
                      <input type="number" min="0" value={formData.lowStockThreshold} onChange={(e) => setFormData(p => ({ ...p, lowStockThreshold: e.target.value }))} className="w-full px-4 py-3 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl" />
                    </div>
                  </div>
                </div>

                {/* Fragrance Notes */}
                <div>
                  <h3 className="text-sm text-ivory-100/70 uppercase tracking-wider mb-4">Fragrance Notes</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-ivory-100/70 mb-2">Top Notes</label>
                      <input type="text" value={formData.notes.top} onChange={(e) => setFormData(p => ({ ...p, notes: { ...p.notes, top: e.target.value } }))} className="w-full px-4 py-3 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl" placeholder="Bergamot, Lemon" />
                    </div>
                    <div>
                      <label className="block text-sm text-ivory-100/70 mb-2">Heart Notes</label>
                      <input type="text" value={formData.notes.middle} onChange={(e) => setFormData(p => ({ ...p, notes: { ...p.notes, middle: e.target.value } }))} className="w-full px-4 py-3 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl" placeholder="Rose, Jasmine" />
                    </div>
                    <div>
                      <label className="block text-sm text-ivory-100/70 mb-2">Base Notes</label>
                      <input type="text" value={formData.notes.base} onChange={(e) => setFormData(p => ({ ...p, notes: { ...p.notes, base: e.target.value } }))} className="w-full px-4 py-3 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl" placeholder="Musk, Vanilla" />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm text-ivory-100/70 mb-2">Tags (comma separated)</label>
                  <input type="text" value={formData.tags} onChange={(e) => setFormData(p => ({ ...p, tags: e.target.value }))} className="w-full px-4 py-3 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl" placeholder="summer, fresh, floral" />
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData(p => ({ ...p, isFeatured: e.target.checked }))} className="w-5 h-5 rounded border border-ivory-100/20 bg-charcoal-300/50 accent-gold-300" />
                    <span className="text-ivory-100 font-light">Featured Product</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))} className="w-5 h-5 rounded border border-ivory-100/20 bg-charcoal-300/50 accent-gold-300" />
                    <span className="text-ivory-100 font-light">Active (Visible on store)</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-ivory-100/10">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-ivory-100/20 text-ivory-100/70 rounded-xl hover:border-ivory-100/40 transition-colors font-light">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 bg-gold-300 text-charcoal-300 rounded-xl hover:bg-gold-200 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving...
                      </>
                    ) : editingProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
