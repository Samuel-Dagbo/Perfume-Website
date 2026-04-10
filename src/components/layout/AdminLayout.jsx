import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    {
      title: 'Overview',
      items: [
        {
          name: 'Dashboard',
          path: '/admin',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          ),
          exact: true
        }
      ]
    },
    {
      title: 'Management',
      items: [
        {
          name: 'Products',
          path: '/admin/products',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          )
        },
        {
          name: 'Orders',
          path: '/admin/orders',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          )
        },
        {
          name: 'Users',
          path: '/admin/users',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )
        },
        {
          name: 'Coupons',
          path: '/admin/coupons',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'Operations',
      items: [
        {
          name: 'Inventory',
          path: '/admin/inventory',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          )
        },
        {
          name: 'Point of Sale',
          path: '/admin/pos',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          )
        },
        {
          name: 'Analytics',
          path: '/admin/analytics',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        }
      ]
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-charcoal-300 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-charcoal-200/95 backdrop-blur-xl border-r border-ivory-100/10 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-ivory-100/10">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-300 to-gold-400 rounded-xl flex items-center justify-center">
              <span className="text-charcoal-300 font-serif text-lg font-bold">L</span>
            </div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="text-lg font-serif text-ivory-100">Admin</span>
              </motion.div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ivory-100/50 hover:text-ivory-100 hover:bg-ivory-100/5 transition-colors"
          >
            <svg className={`w-5 h-5 transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          {navItems.map((section, sectionIndex) => (
            <div key={section.title} className="mb-6">
              {sidebarOpen && (
                <p className="px-3 mb-2 text-[10px] uppercase tracking-ultra-wide text-ivory-100/30 font-medium">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                      isActive(item.path, item.exact)
                        ? 'bg-gold-300/10 text-gold-300 border border-gold-300/20'
                        : 'text-ivory-100/60 hover:text-ivory-100 hover:bg-ivory-100/5 border border-transparent'
                    } ${!sidebarOpen ? 'justify-center' : ''}`}
                  >
                    <span className={isActive(item.path, item.exact) ? 'text-gold-300' : 'text-ivory-100/40 group-hover:text-ivory-100'}>
                      {item.icon}
                    </span>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm font-light"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-ivory-100/10">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-ivory-100/50 hover:text-ivory-100 hover:bg-ivory-100/5 ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
            </svg>
            {sidebarOpen && <span className="text-sm font-light">Back to Store</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-charcoal-300/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-charcoal-200/95 backdrop-blur-xl border-r border-ivory-100/10 z-50 lg:hidden flex flex-col"
            >
              {/* Logo */}
              <div className="h-20 flex items-center justify-between px-6 border-b border-ivory-100/10">
                <Link to="/admin" className="flex items-center gap-3" onClick={() => setMobileSidebarOpen(false)}>
                  <div className="w-10 h-10 bg-gradient-to-br from-gold-300 to-gold-400 rounded-xl flex items-center justify-center">
                    <span className="text-charcoal-300 font-serif text-lg font-bold">L</span>
                  </div>
                  <span className="text-lg font-serif text-ivory-100">Admin</span>
                </Link>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-ivory-100/50 hover:text-ivory-100 hover:bg-ivory-100/5 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 py-6 px-3 overflow-y-auto">
                {navItems.map((section) => (
                  <div key={section.title} className="mb-6">
                    <p className="px-3 mb-2 text-[10px] uppercase tracking-ultra-wide text-ivory-100/30 font-medium">
                      {section.title}
                    </p>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                            isActive(item.path, item.exact)
                              ? 'bg-gold-300/10 text-gold-300 border border-gold-300/20'
                              : 'text-ivory-100/60 hover:text-ivory-100 hover:bg-ivory-100/5 border border-transparent'
                          }`}
                        >
                          <span className={isActive(item.path, item.exact) ? 'text-gold-300' : 'text-ivory-100/40'}>
                            {item.icon}
                          </span>
                          <span className="text-sm font-light">{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Bottom */}
              <div className="p-3 border-t border-ivory-100/10">
                <Link
                  to="/"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-ivory-100/50 hover:text-ivory-100 hover:bg-ivory-100/5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  <span className="text-sm font-light">Back to Store</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-charcoal-200/95 backdrop-blur-xl border-b border-ivory-100/10 flex items-center justify-between px-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-ivory-100/70 hover:text-ivory-100 hover:bg-ivory-100/5 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gold-300 to-gold-400 rounded-lg flex items-center justify-center">
              <span className="text-charcoal-300 font-serif text-sm font-bold">L</span>
            </div>
            <span className="text-sm font-serif text-ivory-100">Admin</span>
          </Link>
          <div className="w-10" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
