import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Key,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import api from '../api/axios';

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Current step in the 3-step flow: 1 | 2 | 3 | 4 (success)
  const [step, setStep] = useState(1);

  // Form states
  const [username, setUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Step 1: Submit username to fetch security question
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Please enter your username.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api.post('/auth/forgot/question', {
        username: username.trim().toLowerCase(),
      });
      setSecurityQuestion(response.data.securityQuestion);
      setStep(2);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Could not find account. Please verify the username.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit security answer to verify & receive resetToken
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!securityAnswer.trim()) {
      setErrorMessage('Please enter your answer.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api.post('/auth/forgot/verify', {
        username: username.trim().toLowerCase(),
        securityAnswer: securityAnswer.trim(),
      });
      setResetToken(response.data.resetToken);
      setStep(3);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Incorrect security answer. Please try again.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Submit new password using resetToken
  const handleStep3Submit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api.post('/auth/forgot/reset', {
        resetToken,
        newPassword,
      });
      setSuccessMessage(
        response.data.message || 'Password reset successfully!'
      );
      setStep(4);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Failed to reset password. The link or session may have expired.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#10101A] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden select-none">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 bg-radial-gradient pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 15%, #231229 0%, #151324 45%, #0F0E18 100%)',
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[540px] flex flex-col items-center">
        {/* DO Logo Tile */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-[22px] bg-primary/40 blur-xl transform scale-110" />
          <div className="relative w-20 h-20 rounded-[22px] bg-logo-gradient flex items-center justify-center shadow-logo-glow">
            <span className="text-white font-outfit font-bold text-[32px] tracking-tight">
              DO
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-white font-outfit font-bold text-[34px] sm:text-[36px] tracking-tight text-center mb-2">
          {step === 4 ? 'Password Reset!' : 'Account Recovery'}
        </h1>
        <p className="text-[#8E8EB0] font-inter text-[15px] sm:text-[16px] text-center mb-6">
          {step === 1 && 'Enter your username to begin recovery'}
          {step === 2 && 'Verify your identity by answering your security question'}
          {step === 3 && 'Create a new secure password for your account'}
          {step === 4 && 'Your password has been updated successfully'}
        </p>

        {/* Step Indicator (Only for steps 1-3) */}
        {step <= 3 && (
          <div className="flex items-center gap-3 mb-8">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-outfit font-bold text-sm transition-all ${
                    step === stepNumber
                      ? 'bg-primary text-white shadow-btn-red scale-105'
                      : step > stepNumber
                      ? 'bg-green-600 text-white'
                      : 'bg-[#2A2A48] text-[#8E8EB0]'
                  }`}
                >
                  {step > stepNumber ? '✓' : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-10 h-0.5 rounded transition-colors ${
                      step > stepNumber ? 'bg-green-600' : 'bg-[#2A2A48]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="w-full bg-[#1E1E38] rounded-[24px] p-8 sm:p-10 border border-[#2C2C4A]/50 shadow-2xl">
          {errorMessage && (
            <div className="mb-6 flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Enter Username */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div>
                <label
                  htmlFor="recovery-username"
                  className="block text-white font-semibold text-[15px] mb-2"
                >
                  Enter Username
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71719A] pointer-events-none">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="recovery-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full h-[56px] bg-[#17172B] border border-[#2C2C4A] rounded-xl pl-12 pr-4 text-white text-[15px] placeholder-[#64648C] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[56px] bg-primary hover:bg-[#D12C41] active:scale-[0.99] text-white font-bold text-[17px] rounded-xl shadow-btn-red flex items-center justify-center transition-all disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Security Question & Answer */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="p-4 rounded-xl bg-[#17172B] border border-[#2C2C4A]">
                <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-1">
                  Security Question
                </p>
                <p className="text-white text-[16px] font-medium">
                  {securityQuestion}
                </p>
              </div>

              <div>
                <label
                  htmlFor="recovery-answer"
                  className="block text-white font-semibold text-[15px] mb-2"
                >
                  Your Answer
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71719A] pointer-events-none">
                    <Key className="w-5 h-5" />
                  </div>
                  <input
                    id="recovery-answer"
                    type="text"
                    required
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="Enter your answer"
                    className="w-full h-[56px] bg-[#17172B] border border-[#2C2C4A] rounded-xl pl-12 pr-4 text-white text-[15px] placeholder-[#64648C] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 h-[56px] bg-[#17172B] hover:bg-[#202038] text-white font-semibold text-[15px] rounded-xl border border-[#2C2C4A] transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-[56px] bg-primary hover:bg-[#D12C41] active:scale-[0.99] text-white font-bold text-[17px] rounded-xl shadow-btn-red flex items-center justify-center transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    'Verify Answer'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Enter New Password */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-5">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-white font-semibold text-[15px] mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71719A] pointer-events-none">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full h-[56px] bg-[#17172B] border border-[#2C2C4A] rounded-xl pl-12 pr-12 text-white text-[15px] placeholder-[#64648C] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71719A] hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmNewPassword"
                  className="block text-white font-semibold text-[15px] mb-2"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71719A] pointer-events-none">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="confirmNewPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full h-[56px] bg-[#17172B] border border-[#2C2C4A] rounded-xl pl-12 pr-12 text-white text-[15px] placeholder-[#64648C] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71719A] hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[56px] bg-primary hover:bg-[#D12C41] active:scale-[0.99] text-white font-bold text-[17px] rounded-xl shadow-btn-red flex items-center justify-center transition-all disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Resetting Password...</span>
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          {/* STEP 4: Success State */}
          {step === 4 && (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mb-4 animate-in zoom-in">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-white font-outfit font-bold text-xl mb-2">
                Password Successfully Reset
              </h3>
              <p className="text-[#8E8EB0] text-[15px] mb-8">
                {successMessage || 'You can now sign in with your new password.'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full h-[56px] bg-primary hover:bg-[#D12C41] text-white font-bold text-[17px] rounded-xl shadow-btn-red transition-all"
              >
                Go to Sign In
              </button>
            </div>
          )}

          {/* Footer Back Link */}
          {step <= 3 && (
            <div className="mt-7 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-[#8E8EB0] hover:text-white text-[15px] font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
