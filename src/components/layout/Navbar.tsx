import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Bell,
  Sun,
  Moon,
  User,
  Shield,
  LogOut,
  ShoppingBag,
  FileText,
  ChevronDown,
  Menu,
  X,
  BookOpen,
} from 'lucide-react';
import { api } from '../../services/api';
import { Announcement } from '../../types';

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    api.getAnnouncements().then((data) => setAnnouncements(data)).catch(() => {});
  }, [location.pathname]);

  const unreadCount = announcements.filter((a) => !a.readByCurrentUser).length;

  const handleLogout = async () => {
    setShowUserDropdown(false);
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          className="text-xl font-bold tracking-tight text-white flex items-center gap-2 whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-base shadow-sm group-hover:scale-105 transition-transform">
            V
          </div>
          <span>
            Vidhya <span className="text-indigo-400">X</span>
          </span>
        </Link>

        {/* Zone 2: 4-5 Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <Link
            to="/class/11"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              isActive('/class/11') ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Grade 11
          </Link>
          <Link
            to="/class/12"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              isActive('/class/12') ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Grade 12
          </Link>
          <Link
            to="/study"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              isActive('/study') ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Study Hub
          </Link>
          <Link
            to="/ebooks"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              isActive('/ebooks') ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            E-Books
          </Link>
          <Link
            to="/tests"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              isActive('/tests') ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Online Tests
          </Link>
        </nav>

        {/* Zone 3: 1 Primary Action & Utilities */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Announcement bell if logged in */}
          {user && (
            <Link
              to="/announcements"
              className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
              aria-label="View announcements"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm font-medium text-slate-200 transition-colors whitespace-nowrap shrink-0"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-xs flex items-center justify-center">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate hidden sm:inline">{user.fullName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 text-sm z-50">
                  <div className="px-4 py-2 border-b border-slate-800 text-xs text-slate-400">
                    <p className="font-semibold text-white truncate">{user.fullName}</p>
                    <p className="truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Student Dashboard</span>
                  </Link>

                  <Link
                    to="/purchases"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>My Purchases</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>Profile Settings</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/50 hover:text-indigo-200 font-medium transition-colors"
                    >
                      <Shield className="w-4 h-4 text-indigo-400" />
                      <span>Admin Portal</span>
                    </Link>
                  )}

                  <div className="border-t border-slate-800 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-rose-400 hover:bg-rose-950/30 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Open mobile menu"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/class/11"
            onClick={() => setShowMobileMenu(false)}
            className="block py-2 text-sm font-medium text-slate-300 hover:text-white"
          >
            Grade 11 Science
          </Link>
          <Link
            to="/class/12"
            onClick={() => setShowMobileMenu(false)}
            className="block py-2 text-sm font-medium text-slate-300 hover:text-white"
          >
            Grade 12 Science
          </Link>
          <Link
            to="/study"
            onClick={() => setShowMobileMenu(false)}
            className="block py-2 text-sm font-medium text-slate-300 hover:text-white"
          >
            Study Hub &amp; Syllabus
          </Link>
          <Link
            to="/ebooks"
            onClick={() => setShowMobileMenu(false)}
            className="block py-2 text-sm font-medium text-slate-300 hover:text-white"
          >
            E-Books Library
          </Link>
          <Link
            to="/tests"
            onClick={() => setShowMobileMenu(false)}
            className="block py-2 text-sm font-medium text-slate-300 hover:text-white"
          >
            Online Mock Tests
          </Link>
          <Link
            to="/about"
            onClick={() => setShowMobileMenu(false)}
            className="block py-2 text-sm font-medium text-slate-300 hover:text-white"
          >
            About Vidhya X
          </Link>
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setShowMobileMenu(false)}
              className="block py-2 text-sm font-medium text-indigo-400"
            >
              Go to Student Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
