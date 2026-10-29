import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Download, Trash2, Sun, Moon, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  const [downloading, setDownloading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmUsername, setDeleteConfirmUsername] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const { user } = useAuth();

  const handleExportData = async () => {
    setDownloading(true);
    try {
      const response = await api.get('/users/me/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `do-today-backup-${today}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export data:', err);
      alert('Failed to export data. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirmUsername.trim().toLowerCase() !== user?.username?.toLowerCase()) {
      setDeleteError('Username does not match.');
      return;
    }

    setDeleting(true);
    setDeleteError('');

    try {
      await api.delete('/users/me');
      logout();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-outfit font-bold text-3xl sm:text-4xl text-content-strong dark:text-white">
          Settings
        </h1>
        <p className="text-content-muted dark:text-gray-400 text-lg mt-1">
          App preferences, backup, and data controls.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Section */}
        <div className="bg-surface-light dark:bg-[#1A1D27] p-6 sm:p-8 rounded-card border border-border-light dark:border-border-dark shadow-card">
          <h2 className="font-outfit font-bold text-xl text-content-strong dark:text-white mb-2">
            Appearance
          </h2>
          <p className="text-content-muted dark:text-gray-400 text-sm mb-6">
            Choose your preferred interface theme.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                theme === 'light'
                  ? 'border-primary bg-primary-soft/50 dark:bg-primary/20 text-primary font-semibold'
                  : 'border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/40 text-content-strong dark:text-gray-300'
              }`}
            >
              <Sun className="w-6 h-6" />
              <span>Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                theme === 'dark'
                  ? 'border-primary bg-primary-soft/50 dark:bg-primary/20 text-primary font-semibold'
                  : 'border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/40 text-content-strong dark:text-gray-300'
              }`}
            >
              <Moon className="w-6 h-6" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Export Data Section */}
        <div className="bg-surface-light dark:bg-[#1A1D27] p-6 sm:p-8 rounded-card border border-border-light dark:border-border-dark shadow-card">
          <h2 className="font-outfit font-bold text-xl text-content-strong dark:text-white mb-2">
            Export Data
          </h2>
          <p className="text-content-muted dark:text-gray-400 text-sm mb-6">
            Download a full JSON backup of your account profile and all tasks.
          </p>

          <button
            type="button"
            onClick={handleExportData}
            disabled={downloading}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm shadow-btn-red transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Preparing Export...' : 'Download JSON Backup'}</span>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-surface-light dark:bg-[#1A1D27] p-6 sm:p-8 rounded-card border border-red-200 dark:border-red-950/60 shadow-card">
          <h2 className="font-outfit font-bold text-xl text-primary mb-2">
            Danger Zone
          </h2>
          <p className="text-content-muted dark:text-gray-400 text-sm mb-6">
            Permanently delete your account and all associated tasks. This action cannot be undone.
          </p>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-300 dark:border-red-800/50 text-primary hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1A1D27] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-border-light dark:border-border-dark">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-outfit font-bold text-lg">Confirm Account Deletion</h3>
            </div>

            <p className="text-sm text-content-muted dark:text-gray-300 mb-4">
              Are you sure you want to delete your account? All your tasks and uploaded files will be permanently erased.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-strong dark:text-gray-300 mb-1">
                  Type <span className="font-mono text-primary font-bold">{user?.username}</span> to confirm:
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmUsername}
                  onChange={(e) => setDeleteConfirmUsername(e.target.value)}
                  placeholder={user?.username}
                  className="w-full h-11 px-3 bg-white dark:bg-[#13151F] border border-border-light dark:border-border-dark rounded-xl text-sm text-content-strong dark:text-white"
                />
              </div>

              {deleteError && (
                <p className="text-xs text-primary">{deleteError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-content-muted hover:text-content-strong dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-sm disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Everything'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
