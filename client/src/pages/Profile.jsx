import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);

  const userInitial = user?.fullName
    ? user.fullName.trim()[0].toUpperCase()
    : user?.username
    ? user.username.trim()[0].toUpperCase()
    : 'U';

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileStatus(null);

    try {
      const response = await api.patch('/users/me', { fullName: fullName.trim() });
      updateUser(response.data.user);
      setProfileStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setProfileStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordStatus({
        type: 'error',
        message: 'New password must be at least 8 characters long',
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordStatus({
        type: 'error',
        message: 'New passwords do not match',
      });
      return;
    }

    setPasswordSaving(true);
    setPasswordStatus(null);

    try {
      const response = await api.patch('/users/me/password', {
        currentPassword,
        newPassword,
      });
      setPasswordStatus({
        type: 'success',
        message: response.data.message || 'Password changed successfully!',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to change password',
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-outfit font-bold text-3xl sm:text-4xl text-content-strong dark:text-white">
          My Profile
        </h1>
        <p className="text-content-muted dark:text-gray-400 text-lg mt-1">
          Manage your personal account settings and security.
        </p>
      </div>

      {/* User Header Card */}
      <div className="bg-surface-light dark:bg-[#1A1D27] p-6 sm:p-8 rounded-card border border-border-light dark:border-border-dark shadow-card flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-avatar-gradient flex items-center justify-center text-white font-outfit font-bold text-3xl shadow-md">
          {userInitial}
        </div>
        <div>
          <h2 className="font-outfit font-bold text-2xl text-content-strong dark:text-white">
            {user?.fullName || 'User'}
          </h2>
          <p className="text-content-muted dark:text-gray-400 font-medium">
            @{user?.username}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Info */}
        <div className="bg-surface-light dark:bg-[#1A1D27] p-6 sm:p-8 rounded-card border border-border-light dark:border-border-dark shadow-card">
          <h3 className="font-outfit font-bold text-xl text-content-strong dark:text-white mb-6">
            Personal Information
          </h3>

          {profileStatus && (
            <div
              className={`mb-5 p-3.5 rounded-xl flex items-center gap-2.5 text-sm ${
                profileStatus.type === 'success'
                  ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200'
                  : 'bg-red-50 dark:bg-red-950/20 text-primary border border-red-200'
              }`}
            >
              {profileStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{profileStatus.message}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-content-strong dark:text-gray-200 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-12 px-4 bg-white dark:bg-[#13151F] border border-border-light dark:border-border-dark rounded-xl text-content-strong dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-content-strong dark:text-gray-200 mb-2">
                Username
              </label>
              <input
                type="text"
                disabled
                value={user?.username || ''}
                className="w-full h-12 px-4 bg-gray-100 dark:bg-gray-800/40 border border-border-light dark:border-border-dark rounded-xl text-content-muted dark:text-gray-400 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-content-muted mt-1.5">
                Username cannot be changed.
              </p>
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-btn-red transition-all disabled:opacity-50"
            >
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-surface-light dark:bg-[#1A1D27] p-6 sm:p-8 rounded-card border border-border-light dark:border-border-dark shadow-card">
          <h3 className="font-outfit font-bold text-xl text-content-strong dark:text-white mb-6">
            Change Password
          </h3>

          {passwordStatus && (
            <div
              className={`mb-5 p-3.5 rounded-xl flex items-center gap-2.5 text-sm ${
                passwordStatus.type === 'success'
                  ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200'
                  : 'bg-red-50 dark:bg-red-950/20 text-primary border border-red-200'
              }`}
            >
              {passwordStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{passwordStatus.message}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-content-strong dark:text-gray-200 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full h-12 px-4 bg-white dark:bg-[#13151F] border border-border-light dark:border-border-dark rounded-xl text-content-strong dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-content-strong dark:text-gray-200 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full h-12 px-4 bg-white dark:bg-[#13151F] border border-border-light dark:border-border-dark rounded-xl text-content-strong dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-content-strong dark:text-gray-200 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full h-12 px-4 bg-white dark:bg-[#13151F] border border-border-light dark:border-border-dark rounded-xl text-content-strong dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-btn-red transition-all disabled:opacity-50 mt-2"
            >
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
