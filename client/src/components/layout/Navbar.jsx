import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  User,
  Settings,
  Info,
  Plus,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTasks } from '../../context/TaskContext';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { openNewTaskModal } = useTasks();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileDrawerOpen(false);
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    setIsMobileDrawerOpen(false);
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home, end: true },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'About', path: '/about', icon: Info },
  ];

  const userInitial = user?.fullName
    ? user.fullName.trim()[0].toUpperCase()
    : user?.username
    ? user.username.trim()[0].toUpperCase()
    : 'U';

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-[#13151F] border-b border-[#EDE9DF] dark:border-[#2A2E3B] transition-colors">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Brand Logo & Wordmark matching screenshots */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-11 h-11 rounded-[12px] bg-logo-gradient flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
              <span className="text-white font-outfit font-bold text-[18px] tracking-tight">DO</span>
            </div>
            <span className="font-outfit font-bold text-2xl tracking-tight text-[#111827] dark:text-white">
              DO-<span className="text-primary">TODAY</span>
            </span>
          </Link>

          {/* Center: Desktop Navigation Pills */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-[14px] text-[15px] font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-soft text-primary font-semibold dark:bg-primary/20 dark:text-primary-soft'
                        : 'text-[#374151] hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/70'
                    }`
                  }
                >
                  <Icon className="w-[18px] h-[18px]" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right: Actions (New Task, Theme Toggle, Avatar, Mobile Hamburger) */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* + New Task Button (Desktop) */}
            <button
              type="button"
              onClick={() => openNewTaskModal()}
              className="hidden sm:flex items-center gap-1.5 bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-semibold text-[15px] px-5 py-2.5 rounded-[12px] shadow-btn-red transition-all"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>New Task</span>
            </button>

            {/* Approaching Deadlines Notification Bell */}
            <NotificationDropdown />

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[#374151] hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/80 transition-colors focus:outline-none"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* User Avatar Circle & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-label="User menu"
                className="w-10 h-10 rounded-full bg-avatar-gradient flex items-center justify-center text-white font-outfit font-bold text-[16px] shadow-sm hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {userInitial}
              </button>

              {/* Desktop Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1A1D27] shadow-xl border border-border-light dark:border-border-dark py-2 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-4 py-2.5 border-b border-border-light dark:border-border-dark">
                    <p className="font-semibold text-content-strong dark:text-white text-sm truncate">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-xs text-content-muted dark:text-gray-400 truncate">
                      @{user?.username}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#374151] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                    >
                      <User className="w-4 h-4 text-content-muted" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#374151] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-content-muted" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-border-light dark:border-border-dark pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-primary hover:bg-red-50 dark:hover:bg-red-950/20 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="Open mobile navigation"
              className="md:hidden w-10 h-10 rounded-[12px] flex items-center justify-center text-[#374151] hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/80 transition-colors focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Responsive Mobile Drawer & Backdrop */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop blur overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Slide-over Drawer Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-[300px] sm:w-[340px] max-w-[85vw] bg-white dark:bg-[#13151F] shadow-2xl flex flex-col border-l border-border-light dark:border-border-dark z-50 animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="p-5 flex items-center justify-between border-b border-border-light dark:border-border-dark">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[10px] bg-logo-gradient flex items-center justify-center shadow-xs">
                  <span className="text-white font-outfit font-bold text-base">DO</span>
                </div>
                <span className="font-outfit font-bold text-xl text-[#111827] dark:text-white">
                  DO-<span className="text-primary">TODAY</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                aria-label="Close menu"
                className="p-1.5 rounded-xl text-content-muted hover:text-content-strong dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Mini Banner in Drawer */}
            <div className="p-5 border-b border-border-light dark:border-border-dark bg-[#FFFDF8] dark:bg-[#1A1D27]/60">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-avatar-gradient flex items-center justify-center text-white font-outfit font-bold text-xl shadow-sm flex-shrink-0">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-outfit font-bold text-base text-content-strong dark:text-white truncate">
                    {user?.fullName || 'User'}
                  </h4>
                  <p className="text-xs text-content-muted dark:text-gray-400 truncate">
                    @{user?.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action: New Task inside Drawer */}
            <div className="p-4 border-b border-border-light dark:border-border-dark">
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  openNewTaskModal();
                }}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold text-sm py-3 rounded-xl shadow-btn-red active:scale-[0.98] transition-all"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>+ New Task</span>
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.end}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-soft text-primary font-bold dark:bg-primary/20 dark:text-primary-soft'
                          : 'text-[#374151] hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/70'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </NavLink>
                );
              })}
            </div>

            {/* Drawer Footer Actions: Theme Toggle & Logout */}
            <div className="p-4 border-t border-border-light dark:border-border-dark space-y-3 bg-[#FFFDF8] dark:bg-[#1A1D27]/40">
              {/* Theme Toggle row */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark text-sm font-medium text-content-strong dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-content-muted" />
                  )}
                  <span>Theme: <strong className="capitalize">{theme}</strong></span>
                </div>
                <span className="text-xs text-primary font-semibold">Switch</span>
              </button>

              {/* Log Out button */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-primary hover:bg-red-50 dark:hover:bg-red-950/20 border border-primary/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>

              <p className="text-center text-[11px] text-content-muted dark:text-gray-500 pt-1">
                DO-TODAY &middot; v1.0.0
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) for Mobile Viewports (< 768px) */}
      <button
        type="button"
        onClick={() => openNewTaskModal()}
        aria-label="Create new task"
        className="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-xl shadow-red-500/35 transition-transform hover:scale-105 active:scale-95 focus:outline-none"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </>
  );
}
