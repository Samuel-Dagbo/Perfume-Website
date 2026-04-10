import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ search: '', role: '' });
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 20);
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);

      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.users || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, page, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}`, { role });
      showToast('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      showToast('Failed to update user role', 'error');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/admin/users/${userId}`);
      showToast('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      showToast('Failed to delete user', 'error');
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    customers: users.filter(u => u.role === 'user').length
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
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
            <h1 className="heading-2 text-ivory-100">Users</h1>
            <p className="text-ivory-100/50 font-light mt-1">
              {pagination.totalUsers ? `${pagination.totalUsers} registered users` : 'Manage registered users'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: 'total', label: 'Total Users', value: stats.total || users.length, color: 'blue' },
            { key: 'customers', label: 'Customers', value: stats.customers, color: 'emerald' },
            { key: 'admins', label: 'Admins', value: stats.admins, color: 'purple' }
          ].map((stat, index) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-charcoal-100/30 border rounded-2xl p-5 backdrop-blur-sm ${
                stat.color === 'purple' ? 'border-purple-500/20' :
                stat.color === 'emerald' ? 'border-emerald-500/20' :
                'border-blue-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-ivory-100/50 text-xs uppercase tracking-wider">{stat.label}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  stat.color === 'purple' ? 'bg-purple-500/20' :
                  stat.color === 'emerald' ? 'bg-emerald-500/20' :
                  'bg-blue-500/20'
                }`}>
                  <svg className={`w-5 h-5 ${
                    stat.color === 'purple' ? 'text-purple-400' :
                    stat.color === 'emerald' ? 'text-emerald-400' :
                    'text-blue-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className={`text-3xl font-serif ${
                stat.color === 'purple' ? 'text-purple-400' :
                stat.color === 'emerald' ? 'text-emerald-400' :
                'text-ivory-100'
              }`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
                className="w-full pl-12 pr-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-gold-300 transition-colors rounded-xl"
              />
            </div>

            <select
              value={filters.role}
              onChange={(e) => { setFilters({ ...filters, role: e.target.value }); setPage(1); }}
              className="px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 rounded-xl focus:outline-none focus:border-gold-300 min-w-[140px]"
            >
              <option value="">All Roles</option>
              <option value="user">Customers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-12 text-center backdrop-blur-sm"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-charcoal-200/50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-serif text-ivory-100 mb-2">No Users Found</h3>
            <p className="text-ivory-100/50 font-light">Users will appear here when they register</p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-ivory-100/20 transition-colors"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-serif text-lg font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-400' 
                            : 'bg-gold-300/20 text-gold-300'
                        }`}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="text-ivory-100 font-medium">{user.name}</p>
                          <p className="text-ivory-100/50 text-sm font-light">{user.email}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-light border ${
                        user.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {user.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-ivory-100/50 mb-4">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>{user.orders?.length || 0} orders</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{user.wishlist?.length || 0} wishlist</span>
                      </div>
                    </div>

                    <p className="text-xs text-ivory-100/30">
                      Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-ivory-100/5">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="flex-1 py-2 bg-charcoal-200/50 border border-ivory-100/20 text-ivory-100/70 rounded-xl hover:bg-charcoal-200 hover:text-ivory-100 transition-colors text-sm font-light"
                      >
                        View
                      </button>
                      <select
                        value={user.role}
                        onChange={(e) => updateRole(user._id, e.target.value)}
                        className="px-3 py-2 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 rounded-xl focus:outline-none focus:border-gold-300 text-sm"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
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

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-charcoal-300/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-charcoal-200/95 border border-ivory-100/10 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-ivory-100/10 flex items-center justify-between">
                <h2 className="text-xl font-serif text-ivory-100">User Details</h2>
                <button onClick={() => setSelectedUser(null)} className="w-10 h-10 rounded-xl bg-charcoal-300/50 flex items-center justify-center text-ivory-100/50 hover:text-ivory-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Avatar & Name */}
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-serif text-2xl font-medium ${
                    selectedUser.role === 'admin' 
                      ? 'bg-purple-500/20 text-purple-400' 
                      : 'bg-gold-300/20 text-gold-300'
                  }`}>
                    {getInitials(selectedUser.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-ivory-100">{selectedUser.name}</h3>
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-light border mt-1 ${
                      selectedUser.role === 'admin' 
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <div className="p-4 bg-charcoal-300/30 rounded-xl border border-ivory-100/5">
                    <p className="text-ivory-100/50 text-sm mb-1">Email</p>
                    <p className="text-ivory-100 font-light">{selectedUser.email}</p>
                  </div>

                  <div className="p-4 bg-charcoal-300/30 rounded-xl border border-ivory-100/5">
                    <p className="text-ivory-100/50 text-sm mb-1">Phone</p>
                    <p className="text-ivory-100 font-light">{selectedUser.phone || 'Not provided'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-charcoal-300/30 rounded-xl border border-ivory-100/5">
                      <p className="text-ivory-100/50 text-sm mb-1">Orders</p>
                      <p className="text-2xl font-serif text-ivory-100">{selectedUser.orders?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-charcoal-300/30 rounded-xl border border-ivory-100/5">
                      <p className="text-ivory-100/50 text-sm mb-1">Wishlist</p>
                      <p className="text-2xl font-serif text-ivory-100">{selectedUser.wishlist?.length || 0}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-charcoal-300/30 rounded-xl border border-ivory-100/5">
                    <p className="text-ivory-100/50 text-sm mb-1">Member Since</p>
                    <p className="text-ivory-100 font-light">
                      {new Date(selectedUser.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-ivory-100/10">
                  <div className="flex-1">
                    <label className="block text-sm text-ivory-100/70 mb-2">Update Role</label>
                    <select
                      value={selectedUser.role}
                      onChange={(e) => updateRole(selectedUser._id, e.target.value)}
                      className="w-full px-4 py-3 bg-charcoal-300/50 border border-ivory-100/10 text-ivory-100 rounded-xl focus:outline-none focus:border-gold-300"
                    >
                      <option value="user">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => { deleteUser(selectedUser._id); setSelectedUser(null); }}
                  className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors text-sm font-light"
                >
                  Delete User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
