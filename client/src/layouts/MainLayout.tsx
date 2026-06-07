import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Search, User, LogOut, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useTheme } from '../store/themeContext';
import { useAuth } from '../store/authContext';
import { AnimatePresence, motion } from 'framer-motion';

export const MainLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Disposable Vapes', path: '/category/disposable-vapes' },
    { label: 'Pod Systems', path: '/category/pod-systems' },
    { label: 'E-Liquids', path: '/category/e-liquids' },
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-background text-foreground">
      
      {/* 21+ Age Disclaimer Banner */}
      <div className="bg-zinc-900 text-zinc-300 text-xs py-2 px-4 text-center font-medium uppercase tracking-wider border-b border-zinc-800">
        ⚠️ Warning: This product contains nicotine. Nicotine is an addictive chemical. Only for 21+.
      </div>

      {/* Glassmorphic Navbar */}
      <header className="sticky top-0 z-40 w-full glass-nav backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
              VAPE<span className="text-foreground">CO</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.path ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Search Button */}
            <Link
              to="/search"
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
              title="Search Catalog"
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Admin Dashboard / Authentication */}
            {user ? (
              <div className="flex items-center space-x-2 border-l pl-4 border-muted">
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors flex items-center gap-1 text-sm font-medium"
                    title="Admin Panel"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
                title="Admin Login"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Actions */}
          <div className="flex md:hidden items-center space-x-2">
            <Link to="/search" className="p-2 text-muted-foreground hover:text-foreground rounded-full">
              <Search className="h-5 w-5" />
            </Link>
            <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground rounded-full">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-card border-l p-6 flex flex-col md:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold tracking-tight text-gradient">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-full"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary text-sm font-medium transition-colors"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>

              <div className="pt-6 border-t space-y-4">
                {user ? (
                  <>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-3 rounded-xl bg-primary/10 text-primary text-sm font-semibold"
                      >
                        <span className="flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Panel
                        </span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-colors shadow-md shadow-primary/25"
                  >
                    <User className="h-4 w-4" />
                    Admin Login
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-muted transition-colors py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Logo & Info */}
          <div className="space-y-4">
            <span className="text-xl font-extrabold tracking-tight text-gradient">
              VAPECO
            </span>
            <p className="text-sm text-muted-foreground">
              Premium quality vaping platforms with curated product lineups, high puff counts, and unparalleled satisfaction.
            </p>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/category/disposable-vapes" className="hover:text-foreground transition-colors">Disposable Vapes</Link></li>
              <li><Link to="/category/pod-systems" className="hover:text-foreground transition-colors">Pod Systems</Link></li>
              <li><Link to="/category/e-liquids" className="hover:text-foreground transition-colors">E-Liquids</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Support & Info</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="text-xs">Location: 21+ Licensed Retailer Only</span></li>
              <li><Link to="/search" className="hover:text-foreground transition-colors">Product Search</Link></li>
              <li><Link to="/login" className="hover:text-foreground transition-colors">Staff Login</Link></li>
            </ul>
          </div>

          {/* Col 4: FDA Health Warning */}
          <div className="p-4 bg-zinc-100 dark:bg-zinc-900/60 rounded-2xl border border-muted">
            <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
              FDA Compliance Warning
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              These products contain nicotine. Nicotine is an addictive chemical. Keep away from children and pets. This site is strictly informational for verified adults of age 21+.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-muted text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} VapeCo Catalog Inc. All rights reserved. Built with PERN Stack.
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
