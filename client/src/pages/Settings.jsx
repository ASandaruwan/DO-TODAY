import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../api/axios';
import {
  Palette,
  Sun,
  Moon,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  ShieldAlert,
  Bell,
  Send,
  Clock,
  Calendar,
} from 'lucide-react';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const {
    settings: notifSettings,
    updateSettings: updateNotifSettings,
    browserPermission,
    requestBrowserPermission,
    sendTestNotification,
  } = useNotifications();
  const navigate = useNavigate();

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmUsername, setDeleteConfirmUsername] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Handle Theme Change with Toast feedback
  const handleThemeChange = (newTheme) => {
    if (newTheme === theme) return;
    setTheme(newTheme);
    toast.success(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
  };

  // Handle Account Deletion
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirmUsername.trim().toLowerCase() !== user?.username?.toLowerCase()) {
      setDeleteError('Confirmation username does not match your username.');
      return;
    }

    setDeleting(true);
    setDeleteError('');

    try {
      await api.delete('/users/me');
      toast.info('Your account and all associated data have been deleted.');
      setShowDeleteModal(false);
      logout();
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete account. Please try again.';
      setDeleteError(msg);
      toast.error(msg);
      setDeleting(false);
    }
  };

  const isDeleteUsernameMatch =
    deleteConfirmUsername.trim().toLowerCase() === user?.username?.toLowerCase();

  return (
    <div className="max-w-4xl mx-auto space-y-7 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="font-outfit font-bold text-3xl sm:text-4xl text-content-strong dark:text-white tracking-tight">
          Settings
        </h1>
        <p className="text-content-muted dark:text-gray-400 text-base sm:text-lg mt-1 font-normal">
          Customize your interface theme, configure deadline alerts, and manage account preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Appearance / Theme Switch */}
        <div className="bg-surface-light dark:bg-[#1A1D27] p-6 sm:p-8 rounded-card border border-border-light dark:border-border-dark shadow-card transition-colors">
          <div className="flex items-center gap-2.5 mb-2">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="font-outfit font-bold text-xl text-content-strong dark:text-white">
              Interface Theme
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-content-muted dark:text-gray-400 mb-6">
            Choose your preferred color theme. Your preference is persisted and synchronized with your account.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light Mode Card */}
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-44 ${
                theme === 'light'
                  ? 'border-primary ring-2 ring-primary/20 bg-white dark:bg-[#13151F] shadow-sm'
                  : 'border-border-light dark:border-border-dark hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#13151F]/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                {theme === 'light' && (
                  <span className="flex items-center gap-1 text-xs font-bold text-primary bg-primary-soft dark:bg-primary/20 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-outfit font-bold text-base text-content-strong dark:text-white">
                  Light Theme
                </h3>
                <p className="text-xs text-content-muted dark:text-gray-400 mt-1">
                  Warm cream background with crimson accents, ideal for day.
                </p>
              </div>

              {/* Theme color miniature indicator */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="w-4 h-4 rounded-full bg-[#FFF9EC] border border-[#EDE9DF]" title="Cream bg" />
                <span className="w-4 h-4 rounded-full bg-[#FFFFFF] border border-[#EDE9DF]" title="Card" />
                <span className="w-4 h-4 rounded-full bg-[#E23E52]" title="Primary Red" />
              </div>
            </button>

            {/* Dark Mode Card */}
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-44 ${
                theme === 'dark'
                  ? 'border-primary ring-2 ring-primary/20 bg-[#13151F] shadow-sm'
                  : 'border-border-light dark:border-border-dark hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#13151F]/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-400 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                {theme === 'dark' && (
                  <span className="flex items-center gap-1 text-xs font-bold text-primary bg-primary-soft dark:bg-primary/20 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-outfit font-bold text-base text-content-strong dark:text-white">
                  Dark Theme
                </h3>
                <p className="text-xs text-content-muted dark:text-gray-400 mt-1">
                  Deep slate background with high-contrast text, gentle on eyes.
                </p>
              </div>

              {/* Theme color miniature indicator */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="w-4 h-4 rounded-full bg-[#0F1117] border border-[#2A2E3B]" title="Dark bg" />
                <span className="w-4 h-4 rounded-full bg-[#1A1D27] border border-[#2A2E3B]" title="Dark card" />
                <span className="w-4 h-4 rounded-full bg-[#E23E52]" title="Primary Red" />
              </div>
            </button>
          </div>
        </div>

        {/* 2. Deadline Notifications & Reminders */}
        <div className="bg-surface-light dark:bg-[#1A1D27] p-6 sm:p-8 rounded-card border border-border-light dark:border-border-dark shadow-card transition-colors">
          <div className="flex items-center gap-2.5 mb-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-outfit font-bold text-xl text-content-strong dark:text-white">
              Deadline Notifications & Reminders
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-content-muted dark:text-gray-400 mb-6">
            Configure desktop browser notifications and alerts for tasks nearing their deadlines.
          </p>

          {/* Browser Push Permission & Test Banner */}
          <div className="bg-white dark:bg-[#13151F] p-5 rounded-2xl border border-border-light/80 dark:border-border-dark/80 mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-outfit font-bold text-sm text-content-strong dark:text-white">
                    Desktop Browser Push Notifications
                  </h4>
                  {browserPermission === 'granted' ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                      Enabled
                    </span>
                  ) : browserPermission === 'denied' ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40">
                      Blocked in Browser
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                      Permission Required
                    </span>
                  )}
                </div>
                <p className="text-xs text-content-muted dark:text-gray-400">
                  Receive native OS alerts when tasks are due or overdue, even when DO-TODAY is running in the background.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                {browserPermission !== 'granted' ? (
                  <button
                    type="button"
                    onClick={requestBrowserPermission}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-btn-red transition-all"
                  >
                    Enable Notifications
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={sendTestNotification}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-content-strong dark:text-white transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-primary" />
                    <span>Send Test Alert</span>
                  </button>
                )}
              </div>
            </div>

            {/* Toggle switch for browser push */}
            {browserPermission === 'granted' && (
              <div className="pt-3 border-t border-border-light/60 dark:border-border-dark/60 flex items-center justify-between">
                <span className="text-xs font-medium text-content-strong dark:text-gray-300">
                  Deliver native desktop alerts
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateNotifSettings({
                      browserNotificationsEnabled: !notifSettings.browserNotificationsEnabled,
                    })
                  }
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    notifSettings.browserNotificationsEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      notifSettings.browserNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Granular Reminder Rules */}
          <div className="space-y-3">
            <h4 className="font-outfit font-bold text-xs uppercase tracking-wider text-content-muted dark:text-gray-400">
              Notification Preferences
            </h4>

            {/* Overdue */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#13151F] cursor-pointer hover:border-primary/50 transition-colors">
              <input
                type="checkbox"
                checked={notifSettings.remindOverdue}
                onChange={(e) => updateNotifSettings({ remindOverdue: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-700"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-content-strong dark:text-white">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  <span>Overdue Tasks</span>
                </div>
                <p className="text-[11px] text-content-muted dark:text-gray-400 mt-0.5">
                  Alert when a task has passed its due date and is not completed.
                </p>
              </div>
            </label>

            {/* Due Today */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#13151F] cursor-pointer hover:border-primary/50 transition-colors">
              <input
                type="checkbox"
                checked={notifSettings.remindDueToday}
                onChange={(e) => updateNotifSettings({ remindDueToday: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-700"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-content-strong dark:text-white">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Due Today</span>
                </div>
                <p className="text-[11px] text-content-muted dark:text-gray-400 mt-0.5">
                  Highlight tasks due before the end of the current day.
                </p>
              </div>
            </label>

            {/* Due Soon (48h) */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#13151F] cursor-pointer hover:border-primary/50 transition-colors">
              <input
                type="checkbox"
                checked={notifSettings.remindDueSoon}
                onChange={(e) => updateNotifSettings({ remindDueSoon: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-700"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-content-strong dark:text-white">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Approaching Deadlines</span>
                </div>
                <p className="text-[11px] text-content-muted dark:text-gray-400 mt-0.5">
                  Show approaching reminders for tasks due within the next 48 hours.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* 3. Danger Zone / Delete Account */}
        <div className="bg-surface-light dark:bg-[#1A1D27] p-6 sm:p-8 rounded-card border border-red-200 dark:border-red-950/60 shadow-card transition-colors">
          <div className="flex items-center gap-2.5 mb-2 text-primary">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="font-outfit font-bold text-xl">
              Danger Zone
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-content-muted dark:text-gray-400 mb-6">
            Permanently delete your account, all created tasks, and uploaded files. Once confirmed, this action cannot be reversed.
          </p>

          <button
            type="button"
            onClick={() => {
              setDeleteConfirmUsername('');
              setDeleteError('');
              setShowDeleteModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-300 dark:border-red-800/60 text-primary hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold text-sm transition-colors active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1A1D27] w-full max-w-md rounded-2xl p-6 sm:p-7 shadow-2xl border border-border-light dark:border-border-dark animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-outfit font-bold text-lg text-content-strong dark:text-white">
                  Delete Account Permanently?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !deleting && setShowDeleteModal(false)}
                className="text-content-muted hover:text-content-strong dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-content-muted dark:text-gray-300 mb-5 leading-relaxed">
              This action is <strong className="text-red-600 dark:text-red-400">irreversible</strong>. All your tasks, subtasks, notes, and uploaded attachments will be erased immediately.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-strong dark:text-gray-200 mb-1.5">
                  Type your username <span className="font-mono text-primary font-bold">@{user?.username}</span> to confirm:
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmUsername}
                  onChange={(e) => setDeleteConfirmUsername(e.target.value)}
                  placeholder={user?.username}
                  className="w-full h-11 px-3.5 bg-white dark:bg-[#13151F] border border-border-light dark:border-border-dark rounded-xl text-sm text-content-strong dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              {deleteError && (
                <p className="text-xs text-primary font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{deleteError}</span>
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-light dark:border-border-dark">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-content-muted hover:text-content-strong dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting || !isDeleteUsernameMatch}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {deleting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{deleting ? 'Deleting Everything...' : 'Delete My Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
