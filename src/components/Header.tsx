import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Menu,
  X,
  GraduationCap,
  Radio
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME } from '../lib/constants';

export const Header: React.FC = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {APP_NAME}
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                    SSC
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block leading-none mt-0.5">
                  Learn without the noise.
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors ${
                isActive('/') && location.pathname === '/'
                  ? 'text-indigo-600 bg-indigo-50/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </Link>

            <Link
              to="/subjects"
              className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors ${
                isActive('/subjects') || isActive('/subject') || isActive('/chapter') || isActive('/playlist') || isActive('/class')
                  ? 'text-indigo-600 bg-indigo-50/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Subjects
            </Link>

            <Link
              to="/live-classes"
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors ${
                isActive('/live-classes')
                  ? 'text-red-700 bg-red-50/80 font-bold'
                  : 'text-slate-700 hover:text-red-600 hover:bg-red-50/50'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span>Live Classes</span>
            </Link>

            <Link
              to="/question-bank"
              className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors ${
                isActive('/question-bank')
                  ? 'text-indigo-600 bg-indigo-50/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Question Bank
            </Link>

            <Link
              to="/clear-buddy"
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-xl transition-colors ${
                isActive('/clear-buddy')
                  ? 'text-indigo-700 bg-indigo-100/70'
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Clear Buddy</span>
            </Link>

            {currentUser && (
              <>
                <Link
                  to="/saved"
                  className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors ${
                    isActive('/saved')
                      ? 'text-indigo-600 bg-indigo-50/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Saved
                </Link>

                <Link
                  to="/progress"
                  className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors ${
                    isActive('/progress')
                      ? 'text-indigo-600 bg-indigo-50/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Progress
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors ${
                  isActive('/admin')
                    ? 'text-amber-700 bg-amber-50 border border-amber-200/60'
                    : 'text-amber-700 hover:text-amber-800 hover:bg-amber-50/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Admin CMS
              </Link>
            )}
          </nav>

          {/* User Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 py-1.5 px-3 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Avatar'}
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {(currentUser.displayName || currentUser.email || 'S')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="text-left text-xs">
                    <p className="font-semibold text-slate-800 line-clamp-1 max-w-[120px]">
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isAdmin ? 'Admin' : 'Student'}
                    </p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login?mode=signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser && (
              <Link
                to="/profile"
                className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold"
              >
                {(currentUser.displayName || currentUser.email || 'S')[0].toUpperCase()}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-100"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Home
          </Link>
          <Link
            to="/subjects"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-100"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            All Subjects
          </Link>
          <Link
            to="/live-classes"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-red-700 hover:bg-red-50"
          >
            <Radio className="w-4 h-4 text-red-600 animate-pulse" />
            Live Classes
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-amber-800 bg-amber-50"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-600" />
              Admin Management
            </Link>
          )}

          {currentUser ? (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <UserIcon className="w-4 h-4 text-slate-500" />
                Profile & Progress
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-1.5 py-2 px-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/login?mode=signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
