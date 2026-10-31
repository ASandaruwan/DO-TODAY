import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import {
  Palette,
  Sun,
  Moon,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  FileJson,
  Database,
  X,
  ShieldAlert,
} from 'lucide-react';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { tasks } = useTasks();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Export State
  const [downloading, setDownloading] = useState(false);

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

  // Handle JSON Data Export Download
  const handleExportData = async () => {
    setDownloading(true);
    try {
      const response = await api.get('/users/me/export', {
        responseType: 'blob',
      });

      // Create download blob link
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const today = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `do-today-backup-${today}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Your JSON backup has been downloaded successfully!');
    } catch (err) {
      console.error('Failed to export data:', err);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setDownloading(false);
    }
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
          Customize your interface theme, backup your personal tasks, and manage data privacy.
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

        {/* 2. Data Backup & Export Section */}
        <div className="bg-surface-light dark:bg-[#1A1D27] p-6 sm:p-8 rounded-card border border-border-light dark:border-border-dark shadow-card transition-colors">
          <div className="flex items-center gap-2.5 mb-2">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="font-outfit font-bold text-xl text-content-strong dark:text-white">
              Data Backup & Export
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-content-muted dark:text-gray-400 mb-6">
            Export a complete JSON archive of your personal account profile, tasks, statuses, priorities, and attachment links.
          </p>

          <div className="bg-white dark:bg-[#13151F] p-4 sm:p-5 rounded-2xl border border-border-light/80 dark:border-border-dark/80 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary-soft dark:bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-outfit font-bold text-sm text-content-strong dark:text-white">
                  DO-TODAY Portable Backup
                </h4>
                <p className="text-xs text-content-muted dark:text-gray-400">
                  {tasks?.length || 0} tasks ready for export &middot; JSON format &middot; Includes attachment links
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportData}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm shadow-btn-red transition-all disabled:opacity-50 active:scale-95 flex-shrink-0"
            >
              {downloading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{downloading ? 'Preparing Backup...' : 'Export My Data (JSON)'}</span>
            </button>
          </div>

          <div className="text-xs text-content-muted dark:text-gray-400 space-y-1">
            <p className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Full data ownership: no lock-in, portable JSON file.</span>
            </p>
            <p className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sensitive credentials like password hashes are never included in the export.</span>
            </p>
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
