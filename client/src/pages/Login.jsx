import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Fidelity note from spec §5.1: The reference screenshot literally reads "Forgort Password?".
// Stored in a single constant so it can be corrected with a one-line change if requested.
export const FORGOT_LABEL = 'Forgort Password?';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Destination after login (default to Home /)
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const result = await login(username, password);

    setSubmitting(false);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#10101A] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden select-none">
      {/* Ambient background glow matching screenshot */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" style={{
        background: 'radial-gradient(circle at 50% 20%, #231229 0%, #151324 45%, #0F0E18 100%)'
      }} />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[540px] flex flex-col items-center">
        {/* DO Logo Tile with subtle glow */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-[22px] bg-primary/40 blur-xl transform scale-110" />
          <div className="relative w-20 h-20 rounded-[22px] bg-logo-gradient flex items-center justify-center shadow-logo-glow">
            <span className="text-white font-outfit font-bold text-[32px] tracking-tight">DO</span>
          </div>
        </div>

        {/* Heading & Subtitle */}
        <h1 className="text-white font-outfit font-bold text-[36px] sm:text-[38px] tracking-tight text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-[#8E8EB0] font-inter text-[16px] sm:text-[17px] text-center mb-9">
          Sign in to your DO-TODAY account
        </p>

        {/* Login Card */}
        <div className="w-full bg-[#1E1E38] rounded-[24px] p-8 sm:p-10 border border-[#2C2C4A]/50 shadow-2xl">
          {errorMessage && (
            <div className="mb-6 flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-white font-semibold text-[15px] mb-2"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71719A] pointer-events-none">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full h-[56px] bg-[#17172B] border border-[#2C2C4A] rounded-xl pl-12 pr-4 text-white text-[15px] placeholder-[#64648C] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="text-white font-semibold text-[15px]"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-primary hover:text-primary-dark text-[15px] font-medium transition-colors"
                >
                  {FORGOT_LABEL}
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71719A] pointer-events-none">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-[56px] bg-[#17172B] border border-[#2C2C4A] rounded-xl pl-12 pr-12 text-white text-[15px] placeholder-[#64648C] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71719A] hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[56px] bg-primary hover:bg-[#D12C41] active:scale-[0.99] text-white font-bold text-[17px] rounded-xl shadow-btn-red flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-center text-[#8E8EB0] text-[15px] mt-7">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="text-primary hover:text-primary-dark font-semibold transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
