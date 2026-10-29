import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTasks } from '../../context/TaskContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { openNewTaskModal } = useTasks();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const handleLogout = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
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
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-[#13151F] border-b border-[#EDE9DF] dark:border-[#2A2E3B] transition-colors">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Logo & Wordmark */}
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

        {/* Right: Actions (New Task, Theme Toggle, Avatar) */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* + New Task Button */}
          <button
            type="button"
            onClick={() => openNewTaskModal()}
            className="hidden sm:flex items-center gap-1.5 bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-semibold text-[15px] px-5 py-2.5 rounded-[12px] shadow-btn-red transition-all"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>New Task</span>
          </button>

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

            {/* Dropdown Menu */}
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
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle mobile menu"
            className="md:hidden w-10 h-10 rounded-[12px] flex items-center justify-center text-[#374151] hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/80 transition-colors focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border-light dark:border-border-dark bg-white dark:bg-[#13151F] px-4 pt-3 pb-5 space-y-2">
          {/* Mobile + New Task Button */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              openNewTaskModal();
            }}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold text-[15px] py-2.5 rounded-[12px] shadow-btn-red mb-3"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>New Task</span>
          </button>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-[15px] font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-soft text-primary font-semibold dark:bg-primary/20 dark:text-primary-soft'
                      : 'text-[#374151] hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/70'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
}
