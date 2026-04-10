import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

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

  useEffect(() => {
    fetchProducts();
  }, [filters, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/admin/products?${params.toString()}`);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const formDataUpload = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formDataUpload.append('images', files[i]);
    }

    try {
      const response = await api.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newImages = [...formData.images, ...response.data.images];
      setFormData({ ...formData, images: newImages });
    } catch (error) {
      console.error('Failed to upload images:', error);
      alert('Failed to upload images');
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
        console.error('Failed to delete image from cloud:', error);
      }
    }
    
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      category: product.category || 'perfume',
      stockQuantity: product.stockQuantity || '',
      lowStockThreshold: product.lowStockThreshold || '10',
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
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    const submitData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      stockQuantity: parseInt(formData.stockQuantity),
      lowStockThreshold: parseInt(formData.lowStockThreshold),
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
      images: formData.images.map(img => ({ url: img.url, public_id: img.public_id }))
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, submitData);
        setSuccessMessage('Product updated successfully!');
      } else {
        await api.post('/products', submitData);
        setSuccessMessage('Product created successfully!');
      }
      setTimeout(() => {
        setShowModal(false);
        setEditingProduct(null);
        fetchProducts();
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('Failed to save product:', error);
      setErrorMessage(error.response?.data?.message || error.message || 'Failed to save product');
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

  return (
    <div className="min-h-screen bg-charcoal-300">
      <div className="bg-charcoal-200/50 border-b border-ivory-100/10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-3 text-ivory-100">Products</h1>
              <p className="text-ivory-100/50 font-light mt-1">Manage your product catalog</p>
            </div>
            <button
              onClick={() => { resetForm(); setEditingProduct(null); setShowModal(true); }}
              className="btn-primary rounded-xl"
            >
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-6 mb-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
                className="w-full px-5 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
              />
            </div>
            <select
              value={filters.category}
              onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}
              className="px-5 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 rounded-xl focus:outline-none focus:border-gold-300"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
              className="px-5 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 rounded-xl focus:outline-none focus:border-gold-300"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="">All</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-charcoal-200/50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-ivory-100/50 mb-4">No products found</p>
            <button
              onClick={() => { resetForm(); setEditingProduct(null); setShowModal(true); }}
              className="btn-primary rounded-xl"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl overflow-hidden backdrop-blur-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ivory-100/10">
                    <th className="px-6 py-5 text-left text-xs uppercase tracking-ultra-wide text-ivory-100/50 font-light">Product</th>
                    <th className="px-6 py-5 text-left text-xs uppercase tracking-ultra-wide text-ivory-100/50 font-light">Category</th>
                    <th className="px-6 py-5 text-left text-xs uppercase tracking-ultra-wide text-ivory-100/50 font-light">Price</th>
                    <th className="px-6 py-5 text-left text-xs uppercase tracking-ultra-wide text-ivory-100/50 font-light">Stock</th>
                    <th className="px-6 py-5 text-left text-xs uppercase tracking-ultra-wide text-ivory-100/50 font-light">Status</th>
                    <th className="px-6 py-5 text-left text-xs uppercase tracking-ultra-wide text-ivory-100/50 font-light">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-100/5">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-charcoal-200/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-charcoal-200/50 rounded-xl overflow-hidden flex-shrink-0">
                            {product.images?.[0]?.url ? (
                              <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-2xl">✦</div>
                            )}
                          </div>
                          <div>
                            <p className="text-ivory-100 font-medium">{product.name}</p>
                            <p className="text-sm text-ivory-100/40 font-light">{product.sku || 'No SKU'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-ivory-100/70 capitalize font-light">{product.category}</td>
                      <td className="px-6 py-5">
                        <div>
                          <span className="text-gold-300 font-medium">${product.price}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-ivory-100/40 line-through text-sm ml-2">${product.originalPrice}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`font-medium ${product.stockQuantity === 0 ? 'text-red-400' : product.stockQuantity <= product.lowStockThreshold ? 'text-orange-400' : 'text-ivory-100/70'}`}>
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {product.isFeatured && (
                            <span className="badge bg-gold-300/20 text-gold-300 border border-gold-300/30">Featured</span>
                          )}
                          <span className={`badge ${product.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-light"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-light"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-ivory-100/10">
                <p className="text-sm text-ivory-100/50 font-light">
                  Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalProducts)} of {pagination.totalProducts}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 border border-ivory-100/20 text-ivory-100/70 rounded-lg hover:border-ivory-100/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 border border-ivory-100/20 text-ivory-100/70 rounded-lg hover:border-ivory-100/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-300/90 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-charcoal-100/50 border border-ivory-100/10 rounded-2xl"
            >
              <div className="sticky top-0 bg-charcoal-200/90 backdrop-blur-sm border-b border-ivory-100/10 p-6 flex items-center justify-between z-10">
                <h2 className="heading-4 text-ivory-100">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-ivory-100/50 hover:text-ivory-100 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* Images */}
                <div>
                  <h3 className="section-label mb-4">Product Images</h3>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative aspect-square bg-charcoal-200/50 rounded-xl overflow-hidden group">
                        <img src={image.url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 badge bg-gold-300/90 text-charcoal-300 text-2xs">Main</span>
                        )}
                      </div>
                    ))}
                    
                    <label className="aspect-square bg-charcoal-200/30 border-2 border-dashed border-ivory-100/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-gold-300/50 transition-colors">
                      {uploadingImages ? (
                        <div className="w-6 h-6 border-2 border-gold-300/30 border-t-gold-300 rounded-full animate-spin" />
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-ivory-100/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-xs text-ivory-100/40">Add Image</span>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImages}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-ivory-100/40">First image will be the main product image. Max 5 images. (Optional - can add later)</p>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="section-label mb-3 block">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="section-label mb-3 block">Description *</label>
                    <textarea
                      required
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-5 py-4 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl resize-none"
                      placeholder="Enter product description"
                    />
                  </div>

                  <div>
                    <label className="section-label mb-3 block">Price ($) *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-5 py-4 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="section-label mb-3 block">Original Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full px-5 py-4 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                      placeholder="For showing discount"
                    />
                  </div>

                  <div>
                    <label className="section-label mb-3 block">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-5 py-4 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="section-label mb-3 block">Size</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-5 py-4 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                      placeholder="e.g., 100ml, 50ml, 3.4 oz"
                    />
                  </div>

                  <div>
                    <label className="section-label mb-3 block">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-5 py-4 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                      placeholder="Product SKU (optional)"
                    />
                  </div>

                  <div>
                    <label className="section-label mb-3 block">Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-5 py-4 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                    />
                  </div>
                </div>

                {/* Inventory */}
                <div>
                  <h3 className="section-label mb-4">Inventory</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="section-label mb-3 block">Stock Quantity *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                        className="w-full px-5 py-4 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="section-label mb-3 block">Low Stock Alert</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.lowStockThreshold}
                        onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                        className="w-full px-5 py-4 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Fragrance Notes */}
                <div>
                  <h3 className="section-label mb-4">Fragrance Notes</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="section-label mb-3 block">Top Notes</label>
                      <input
                        type="text"
                        value={formData.notes.top}
                        onChange={(e) => setFormData({ ...formData, notes: { ...formData.notes, top: e.target.value } })}
                        className="w-full px-5 py-4 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                        placeholder="e.g., Bergamot, Lemon"
                      />
                    </div>
                    <div>
                      <label className="section-label mb-3 block">Heart Notes</label>
                      <input
                        type="text"
                        value={formData.notes.middle}
                        onChange={(e) => setFormData({ ...formData, notes: { ...formData.notes, middle: e.target.value } })}
                        className="w-full px-5 py-4 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                        placeholder="e.g., Rose, Jasmine"
                      />
                    </div>
                    <div>
                      <label className="section-label mb-3 block">Base Notes</label>
                      <input
                        type="text"
                        value={formData.notes.base}
                        onChange={(e) => setFormData({ ...formData, notes: { ...formData.notes, base: e.target.value } })}
                        className="w-full px-5 py-4 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                        placeholder="e.g., Musk, Vanilla"
                      />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="section-label mb-3 block">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-5 py-4 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
                    placeholder="e.g., summer, fresh, floral"
                  />
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-5 h-5 rounded border border-ivory-100/20 text-gold-300 focus:ring-gold-300 focus:ring-offset-0 bg-charcoal-200/50"
                    />
                    <span className="text-ivory-100 font-light">Featured Product</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 rounded border border-ivory-100/20 text-gold-300 focus:ring-gold-300 focus:ring-offset-0 bg-charcoal-200/50"
                    />
                    <span className="text-ivory-100 font-light">Active (Visible on store)</span>
                  </label>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-center"
                  >
                    {successMessage}
                  </motion.div>
                )}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-center"
                  >
                    {errorMessage}
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-ivory-100/10">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary rounded-xl">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 btn-primary rounded-xl disabled:opacity-50">
                    {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add Product'}
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
