import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  // Profile Information State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);

  // Live avatar preview initial
  const previewInitial = useMemo(() => {
    const trimmed = fullName.trim();
    if (trimmed.length > 0) return trimmed[0].toUpperCase();
    if (user?.fullName?.trim()) return user.fullName.trim()[0].toUpperCase();
    if (user?.username?.trim()) return user.username.trim()[0].toUpperCase();
    return 'U';
  }, [fullName, user]);

  const hasNameChanged = fullName.trim() !== (user?.fullName || '').trim();

  // Joined date formatted
  const formattedJoinedDate = useMemo(() => {
    if (!user?.createdAt) return 'Recent Member';
    try {
      return new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Active Member';
    }
  }, [user]);

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setProfileStatus({ type: 'error', message: 'Full name cannot be empty.' });
      return;
    }

    setProfileSaving(true);
    setProfileStatus(null);

    try {
      const response = await api.patch('/users/me', { fullName: fullName.trim() });
      const updatedUserData = response.data?.user || response.data;
      updateUser(updatedUserData);
      setProfileStatus({ type: 'success', message: 'Profile updated successfully!' });
      toast.success('Your profile name has been updated!');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors && err.response.data.errors[0]?.msg) ||
        'Failed to update profile';
      setProfileStatus({ type: 'error', message: msg });
      toast.error(msg);
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword.length < 8) {
      setPasswordStatus({
        type: 'error',
        message: 'New password must be at least 8 characters long.',
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordStatus({
        type: 'error',
        message: 'New passwords do not match.',
      });
      return;
    }

    setPasswordSaving(true);

    try {
      const response = await api.patch('/users/me/password', {
        currentPassword,
        newPassword,
      });

      const successMsg = response.data?.message || 'Password changed successfully!';
      setPasswordStatus({
        type: 'success',
        message: successMsg,
      });
      toast.success('Your password has been changed securely.');

      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors && err.response.data.errors[0]?.msg) ||
        'Failed to change password.';
      setPasswordStatus({ type: 'error', message: msg });
      toast.error(msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  const isPasswordLengthValid = newPassword.length >= 8;
  const doPasswordsMatch = Boolean(newPassword && newPassword === confirmNewPassword);

  return (
    <div className="max-w-4xl mx-auto space-y-7 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Title */}
      <div>
        <h1 className="font-outfit font-bold text-3xl sm:text-4xl text-content-strong dark:text-white tracking-tight">
          My Profile
        </h1>
        <p className="text-content-muted dark:text-gray-400 text-base sm:text-lg mt-1 font-normal">
          Manage your personal details, avatar appearance, and account security.
        </p>
      </div>

      {/* Live Avatar Preview & User Header Banner */}
      <div className="bg-surface-light dark:bg-[#1A1D27] p-6 sm:p-8 rounded-card border border-border-light dark:border-border-dark shadow-card flex flex-col sm:flex-row items-center sm:items-start gap-6 transition-colors relative overflow-hidden">
        {/* Avatar Tile with Live Initial */}
        <div className="relative group">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-avatar-gradient flex items-center justify-center text-white font-outfit font-bold text-3xl sm:text-4xl shadow-md transition-transform duration-200 group-hover:scale-105">
            {previewInitial}
          </div>
          {hasNameChanged && (
            <span className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 border-2 border-white dark:border-[#1A1D27]">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Preview</span>
            </span>
          )}
        </div>

        {/* User Meta Information */}
        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h2 className="font-outfit font-bold text-2xl sm:text-3xl text-content-strong dark:text-white truncate">
              {fullName.trim() || user?.fullName || 'User'}
            </h2>
            <span className="inline-flex items-center gap-1 self-center sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Account</span>
            </span>
          </div>

          <p className="text-content-muted dark:text-gray-400 font-medium text-sm sm:text-base">
            @{user?.username}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-content-muted dark:text-gray-400 mt-3 pt-3 border-t border-border-light/60 dark:border-border-dark/60">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Joined {formattedJoinedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid for Personal Info & Change Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
        {/* Column 1: Personal Information */}
        <div className="bg-surface-light dark:bg-[#1A1D27] p-6 sm:p-7 rounded-card border border-border-light dark:border-border-dark shadow-card">
          <div className="flex items-center gap-2.5 mb-2">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-outfit font-bold text-xl text-content-strong dark:text-white">
              Personal Information
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-content-muted dark:text-gray-400 mb-6">
            Update your public name displayed on your dashboard and avatar.
          </p>

          {profileStatus && (
            <div
              className={`mb-5 p-3.5 rounded-xl flex items-center gap-2.5 text-sm ${
                profileStatus.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40'
                  : 'bg-red-50 dark:bg-red-950/20 text-primary border border-red-200 dark:border-red-900/40'
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

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-content-strong dark:text-gray-200">
                  Full Name
                </label>
                <span className="text-[11px] text-content-muted">
                  {fullName.length}/80
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={80}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Achira Sandaruwan"
                className="w-full h-12 px-4 bg-white dark:bg-[#13151F] border border-border-light dark:border-border-dark rounded-xl text-content-strong dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors"
              />
              <p className="text-[11px] text-content-muted dark:text-gray-400 mt-1">
                Avatar preview updates live above as you type.
              </p>
            </div>

            {/* Username (Read Only) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-content-strong dark:text-gray-200">
                  Username
                </label>
                <span className="text-[11px] font-medium text-content-muted bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                  Permanent
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={user?.username || ''}
                  className="w-full h-12 px-4 bg-gray-100/70 dark:bg-gray-800/40 border border-border-light dark:border-border-dark rounded-xl text-content-muted dark:text-gray-400 text-sm cursor-not-allowed"
                />
                <Lock className="w-4 h-4 text-content-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-content-muted dark:text-gray-400 mt-1">
                Usernames are permanent and unique to your account.
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={profileSaving || !hasNameChanged}
                className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-btn-red transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {profileSaving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{profileSaving ? 'Saving Changes...' : 'Save Profile Name'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Column 2: Change Password */}
        <div className="bg-surface-light dark:bg-[#1A1D27] p-6 sm:p-7 rounded-card border border-border-light dark:border-border-dark shadow-card">
          <div className="flex items-center gap-2.5 mb-2">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="font-outfit font-bold text-xl text-content-strong dark:text-white">
              Change Password
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-content-muted dark:text-gray-400 mb-6">
            Ensure your account is using a strong, unique password.
          </p>

          {passwordStatus && (
            <div
              className={`mb-5 p-3.5 rounded-xl flex items-center gap-2.5 text-sm ${
                passwordStatus.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40'
                  : 'bg-red-50 dark:bg-red-950/20 text-primary border border-red-200 dark:border-red-900/40'
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
            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-content-strong dark:text-gray-200 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full h-12 pl-4 pr-11 bg-white dark:bg-[#13151F] border border-border-light dark:border-border-dark rounded-xl text-content-strong dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-strong dark:hover:text-white"
                  aria-label="Toggle current password visibility"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-content-strong dark:text-gray-200 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full h-12 pl-4 pr-11 bg-white dark:bg-[#13151F] border border-border-light dark:border-border-dark rounded-xl text-content-strong dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-strong dark:hover:text-white"
                  aria-label="Toggle new password visibility"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-semibold text-content-strong dark:text-gray-200 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full h-12 pl-4 pr-11 bg-white dark:bg-[#13151F] border border-border-light dark:border-border-dark rounded-xl text-content-strong dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-strong dark:hover:text-white"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Helper status checks */}
            {newPassword.length > 0 && (
              <div className="space-y-1 pt-1 text-xs">
                <div
                  className={`flex items-center gap-1.5 ${
                    isPasswordLengthValid
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-content-muted dark:text-gray-400'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>At least 8 characters long</span>
                </div>
                {confirmNewPassword.length > 0 && (
                  <div
                    className={`flex items-center gap-1.5 ${
                      doPasswordsMatch
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-primary'
                    }`}
                  >
                    {doPasswordsMatch ? (
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                    <span>{doPasswordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Update Password Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  passwordSaving ||
                  !currentPassword ||
                  !isPasswordLengthValid ||
                  !doPasswordsMatch
                }
                className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-btn-red transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {passwordSaving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{passwordSaving ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
