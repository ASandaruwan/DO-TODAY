import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  HelpCircle,
  Key,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SECURITY_QUESTIONS = [
  'What was the name of your first pet?',
  'What city were you born in?',
  "What is your mother's maiden name?",
  'What was the name of your elementary school?',
  'What was your dream job as a child?',
  'What is the model of your first car?',
];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!formData.securityAnswer.trim()) {
      setErrorMessage('Please provide an answer to your security question.');
      return;
    }

    setSubmitting(true);

    const payload = {
      fullName: formData.fullName.trim(),
      username: formData.username.trim().toLowerCase(),
      password: formData.password,
      securityQuestion: formData.securityQuestion,
      securityAnswer: formData.securityAnswer.trim(),
    };

    const result = await signup(payload);

    setSubmitting(false);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setErrorMessage(result.error);
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
      <div className="relative z-10 w-full max-w-[560px] flex flex-col items-center">
        {/* DO Logo Tile */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-[22px] bg-primary/40 blur-xl transform scale-110" />
          <div className="relative w-20 h-20 rounded-[22px] bg-logo-gradient flex items-center justify-center shadow-logo-glow">
            <span className="text-white font-outfit font-bold text-[32px] tracking-tight">
              DO
            </span>
          </div>
        </div>

        {/* Heading & Subtitle */}
        <h1 className="text-white font-outfit font-bold text-[34px] sm:text-[36px] tracking-tight text-center mb-2">
          Create Account
        </h1>
        <p className="text-[#8E8EB0] font-inter text-[15px] sm:text-[16px] text-center mb-8">
          Start organizing your daily tasks with DO-TODAY
        </p>

        {/* Signup Card */}
        <div className="w-full bg-[#1E1E38] rounded-[24px] p-8 sm:p-10 border border-[#2C2C4A]/50 shadow-2xl">
          {errorMessage && (
            <div className="mb-6 flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-white font-semibold text-[15px] mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71719A] pointer-events-none">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Achira Sandaruwan"
                  className="w-full h-[54px] bg-[#17172B] border border-[#2C2C4A] rounded-xl pl-12 pr-4 text-white text-[15px] placeholder-[#64648C] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-white font-semibold text-[15px] mb-2"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71719A] pointer-events-none">
                  <AtSign className="w-5 h-5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className="w-full h-[54px] bg-[#17172B] border border-[#2C2C4A] rounded-xl pl-12 pr-4 text-white text-[15px] placeholder-[#64648C] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            {/* Password & Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-white font-semibold text-[15px] mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71719A] pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 chars"
                    className="w-full h-[54px] bg-[#17172B] border border-[#2C2C4A] rounded-xl pl-10 pr-10 text-white text-[14px] placeholder-[#64648C] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71719A] hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-white font-semibold text-[15px] mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71719A] pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="w-full h-[54px] bg-[#17172B] border border-[#2C2C4A] rounded-xl pl-10 pr-10 text-white text-[14px] placeholder-[#64648C] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71719A] hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Security Question */}
            <div>
              <label
                htmlFor="securityQuestion"
                className="block text-white font-semibold text-[15px] mb-2"
              >
                Security Question (for Password Recovery)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71719A] pointer-events-none">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <select
                  id="securityQuestion"
                  name="securityQuestion"
                  value={formData.securityQuestion}
                  onChange={handleChange}
                  className="w-full h-[54px] bg-[#17172B] border border-[#2C2C4A] rounded-xl pl-12 pr-8 text-white text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer"
                >
                  {SECURITY_QUESTIONS.map((q) => (
                    <option key={q} value={q} className="bg-[#17172B] text-white">
                      {q}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Security Answer */}
            <div>
              <label
                htmlFor="securityAnswer"
                className="block text-white font-semibold text-[15px] mb-2"
              >
                Security Answer
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71719A] pointer-events-none">
                  <Key className="w-5 h-5" />
                </div>
                <input
                  id="securityAnswer"
                  name="securityAnswer"
                  type="text"
                  required
                  value={formData.securityAnswer}
                  onChange={handleChange}
                  placeholder="Your answer (case-insensitive)"
                  className="w-full h-[54px] bg-[#17172B] border border-[#2C2C4A] rounded-xl pl-12 pr-4 text-white text-[15px] placeholder-[#64648C] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[56px] bg-primary hover:bg-[#D12C41] active:scale-[0.99] text-white font-bold text-[17px] rounded-xl shadow-btn-red flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-center text-[#8E8EB0] text-[15px] mt-7">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary hover:text-primary-dark font-semibold transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
