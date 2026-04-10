import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Collections', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          isScrolled
            ? 'bg-charcoal-300/95 backdrop-blur-xl shadow-soft-lg border-b border-ivory-100/5'
            : location.pathname === '/' 
              ? 'bg-transparent' 
              : 'bg-charcoal-300/95 backdrop-blur-xl'
        }`}
      >
        <div className="container mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo - Left */}
            <Link to="/" className="flex flex-col items-start">
              <span className="text-xl lg:text-2xl font-serif text-ivory-100 tracking-wide">LUXE</span>
              <span className="text-2xs uppercase tracking-ultra-wide text-gold-300 -mt-1">Parfums</span>
            </Link>

            {/* Desktop Nav - Center */}
            <nav className="hidden lg:flex items-center space-x-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-xs uppercase tracking-ultra-wide transition-colors duration-300 whitespace-nowrap ${
                    location.pathname === link.path 
                      ? 'text-gold-300' 
                      : 'text-ivory-100/70 hover:text-ivory-100'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3 sm:gap-6">
              {/* Search - Desktop */}
              <button className="hidden lg:block text-ivory-100/70 hover:text-ivory-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* User - Desktop */}
              <div className="hidden lg:block relative group">
                <button className="flex items-center text-ivory-100/70 hover:text-ivory-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                
                <div className="absolute right-0 mt-4 w-60 bg-charcoal-300/95 backdrop-blur-xl border border-ivory-100/10 shadow-soft-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-5 border-b border-ivory-100/10">
                    <p className="text-sm text-ivory-100 font-light">{user?.name || 'Guest'}</p>
                    <p className="text-xs text-ivory-100/50 mt-1">{user?.email || 'Sign in to your account'}</p>
                  </div>
                  <div className="py-2">
                    {isAuthenticated ? (
                      <>
                        <Link to="/dashboard" className="flex items-center px-5 py-3 text-xs text-ivory-100/70 hover:text-ivory-100 hover:bg-ivory-100/5 transition-colors uppercase tracking-wide">
                          Dashboard
                        </Link>
                        <Link to="/profile" className="flex items-center px-5 py-3 text-xs text-ivory-100/70 hover:text-ivory-100 hover:bg-ivory-100/5 transition-colors uppercase tracking-wide">
                          Profile
                        </Link>
                        <Link to="/orders" className="flex items-center px-5 py-3 text-xs text-ivory-100/70 hover:text-ivory-100 hover:bg-ivory-100/5 transition-colors uppercase tracking-wide">
                          Orders
                        </Link>
                        {user?.role === 'admin' && (
                          <Link to="/admin" className="flex items-center px-5 py-3 text-xs text-gold-300 hover:bg-ivory-100/5 transition-colors uppercase tracking-wide">
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-5 py-3 text-xs text-ivory-100/70 hover:text-ivory-100 hover:bg-ivory-100/5 transition-colors uppercase tracking-wide"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <Link to="/login" className="flex items-center px-5 py-3 text-xs text-ivory-100 hover:bg-ivory-100/5 transition-colors uppercase tracking-wide">
                        Sign In
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Cart */}
              <button
                onClick={() => document.dispatchEvent(new CustomEvent('toggle-cart'))}
                className="relative text-ivory-100/70 hover:text-ivory-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {getCartCount() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-gold-300 text-charcoal-300 text-[9px] font-medium rounded-full flex items-center justify-center"
                  >
                    {getCartCount()}
                  </motion.span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-ivory-100 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-charcoal-300/98 backdrop-blur-xl border-t border-ivory-100/10"
            >
              <div className="container mx-auto px-6 py-6 space-y-6">
                {/* Mobile Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full px-4 py-3 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 placeholder-charcoal-400 rounded-xl focus:outline-none focus:border-gold-300"
                  />
                  <svg className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-ivory-100/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Mobile Nav Links */}
                <nav className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`block py-3 text-sm border-b border-ivory-100/10 last:border-0 ${
                        location.pathname === link.path 
                          ? 'text-gold-300' 
                          : 'text-ivory-100/80'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>

                {/* Mobile User Section */}
                <div className="pt-4 border-t border-ivory-100/10">
                  {isAuthenticated ? (
                    <div className="space-y-1">
                      <p className="text-xs text-ivory-100/40 uppercase tracking-wide mb-3 px-1">Account</p>
                      <Link to="/dashboard" className="flex items-center py-3 text-sm text-ivory-100/80 border-b border-ivory-100/10">
                        Dashboard
                      </Link>
                      <Link to="/profile" className="flex items-center py-3 text-sm text-ivory-100/80 border-b border-ivory-100/10">
                        Profile
                      </Link>
                      <Link to="/orders" className="flex items-center py-3 text-sm text-ivory-100/80 border-b border-ivory-100/10">
                        Orders
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="flex items-center py-3 text-sm text-gold-300 border-b border-ivory-100/10">
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center py-3 text-sm text-ivory-100/80"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link 
                        to="/login" 
                        className="block w-full py-3 text-center text-sm bg-gold-300 text-charcoal-300 rounded-xl font-medium"
                      >
                        Sign In
                      </Link>
                      <Link 
                        to="/signup" 
                        className="block w-full py-3 text-center text-sm border border-ivory-100/20 text-ivory-100/80 rounded-xl"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;
