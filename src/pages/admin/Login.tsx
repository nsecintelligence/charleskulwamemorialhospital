import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AlertCircle, Eye, EyeOff, CheckCircle, Stethoscope, Building2, Shield, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('homepage_content').select('site_name, site_logo_url').maybeSingle().then(({ data }) => {
      if (data?.site_name) setSiteName(data.site_name);
      if (data?.site_logo_url) setSiteLogo(data.site_logo_url);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        setIsSignUp(false);
        setSuccess('Account created successfully! Please sign in.');
      } else {
        await signIn(email, password);
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hospital Branding (60%) - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=1920')`,
          }}
        />
        {/* Dark Emerald Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/95 via-emerald-800/90 to-emerald-900/95" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full p-8 xl:p-12 text-white">
          {/* Top - Logo & Name */}
          <div className="flex items-center gap-3">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="h-14 w-14 object-contain rounded-full bg-white/10 p-1" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl border border-white/20">
                CK
              </div>
            )}
            <div>
              <h1 className="text-xl xl:text-2xl font-bold leading-tight">Charles Kulwa Memorial</h1>
              <h1 className="text-xl xl:text-2xl font-bold leading-tight">Hospital</h1>
            </div>
          </div>

          {/* Middle - Welcome Content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            {/* Motto */}
            <div className="mb-6">
              <p className="text-emerald-200 text-lg font-medium italic mb-1">"Mahitaji ya Mgonjwa Kwanza"</p>
              <p className="text-emerald-300 text-sm">Patient Needs Come First</p>
            </div>

            {/* Welcome Heading */}
            <h2 className="text-3xl xl:text-4xl font-bold mb-4 leading-tight">
              Welcome to Charles Kulwa Memorial Hospital
            </h2>

            {/* Description */}
            <p className="text-emerald-100 text-base xl:text-lg leading-relaxed mb-8">
              Providing compassionate, high-quality healthcare through experienced professionals, modern medical technology, and patient-centered care.
            </p>

            {/* Feature Cards */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-5 h-5 text-emerald-200" />
                </div>
                <span className="text-sm xl:text-base font-medium">Qualified Medical Specialists</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-emerald-200" />
                </div>
                <span className="text-sm xl:text-base font-medium">Modern Healthcare Facilities</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-emerald-200" />
                </div>
                <span className="text-sm xl:text-base font-medium">Secure Digital Hospital Management</span>
              </div>
            </div>
          </div>

          {/* Bottom - Copyright */}
          <div className="text-emerald-300 text-sm">
            &copy; 2026 Charles Kulwa Memorial Hospital. All Rights Reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Authentication (40%) */}
      <div className="w-full lg:w-[40%] flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo - Only visible on mobile */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="h-12 w-12 object-contain rounded-full bg-white shadow-sm p-1" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                CK
              </div>
            )}
            <div className="text-left">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Charles Kulwa Memorial</h1>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Hospital</h1>
            </div>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-500 text-sm">
                {isSignUp
                  ? 'Create your account to access the Hospital Management System.'
                  : 'Sign in to continue to the Hospital Management System.'}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                  Forgot Password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 px-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isSignUp ? 'Creating account...' : 'Signing in...'}</span>
                  </>
                ) : (
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Toggle Sign Up/Sign In */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                }}
                className="w-full py-3 px-4 rounded-xl font-semibold text-emerald-600 border-2 border-emerald-600 hover:bg-emerald-50 transition-all"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
            <button className="hover:text-emerald-600 transition-colors">Privacy Policy</button>
            <span className="text-gray-300">|</span>
            <button className="hover:text-emerald-600 transition-colors">Terms of Service</button>
            <span className="text-gray-300">|</span>
            <button className="hover:text-emerald-600 transition-colors">Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );
}
