import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ShieldAlert,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'motion/react';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    loginWithOtp,
    adminLogin,
    register,
    googleLogin
  } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // OTP state
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');

  // UI state
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Onboarding step post registration
  const [onboardingUser, setOnboardingUser] = useState<boolean>(false);
  const [onboardingPhone, setOnboardingPhone] = useState('');
  const [onboardingCity, setOnboardingCity] = useState('');
  const [onboardingStreet, setOnboardingStreet] = useState('');

  // OTP countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  if (!showAuthModal) return null;

  // Password strength calculation
  const calculateStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'Empty', color: 'bg-zinc-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, text: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, text: 'Moderate', color: 'bg-amber-500' };
    return { score: 3, text: 'Strong (Atelier Grade)', color: 'bg-emerald-500' };
  };

  const strength = calculateStrength(password);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (email.toLowerCase().includes('admin')) {
        await adminLogin(email, password);
      } else {
        await login(email);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('Please accept the Terms of Service & Privacy Policy.');
      return;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email);
      // Trigger optional onboarding
      setOnboardingUser(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const id = otpIdentifier || phone || email;
    if (!id.trim()) {
      setError('Please enter a mobile number or email address.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.sendOtp(id);
      setOtpSent(true);
      setOtpTimer(60);
      setDemoOtpHint(res.demoCode || null);
      if (res.demoCode) {
        setOtpCode(res.demoCode); // Auto-fill for friction-free testing
      }
      setSuccessMsg(`Six-digit code dispatched to ${id}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please provide a complete 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await loginWithOtp(otpIdentifier || phone || email, otpCode, name || 'Atelier Patron');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (forgotStep === 'request') {
        const res = await api.forgotPassword(forgotEmail);
        setForgotStep('reset');
        if (res.demoCode) {
          setForgotCode(res.demoCode);
        }
        setSuccessMsg('Reset code dispatched. Enter the code and your new password.');
      } else {
        await api.resetPassword(forgotEmail, forgotCode, newPassword);
        setSuccessMsg('Password updated successfully! Please sign in.');
        setAuthModalTab('login');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const targetEmail = email.trim() || 'customer@aura.store';
      const targetName = targetEmail.split('@')[0].replace(/[._]/g, ' ');
      await googleLogin(targetName, targetEmail);
    } catch (err: any) {
      setError(err.message || 'Google authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (type: 'customer' | 'admin') => {
    setError('');
    setLoading(true);
    try {
      if (type === 'admin') {
        await adminLogin('admin@aura.store', 'admin123');
      } else {
        await login('customer@aura.store');
      }
    } catch (err: any) {
      setError(err.message || 'Demo access error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = () => {
    setOnboardingUser(false);
    setShowAuthModal(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowAuthModal(false)}
          className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-zinc-200/90 overflow-hidden z-10 grid grid-cols-1 md:grid-cols-12 min-h-[560px]"
        >
          {/* Close button */}
          <button
            onClick={() => setShowAuthModal(false)}
            aria-label="Close"
            className="absolute top-4 right-4 z-20 p-2 text-zinc-400 hover:text-zinc-900 bg-white/80 hover:bg-zinc-100 rounded-full transition-colors backdrop-blur-xs cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Atmospheric Brand Visual (Desktop) */}
          <div className="hidden md:flex md:col-span-5 relative bg-zinc-950 text-white flex-col justify-between p-8 overflow-hidden">
            {/* Background image with dark overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
                alt="Aura Studio Architecture"
                className="w-full h-full object-cover opacity-35 filter grayscale scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
            </div>

            {/* Top brand badge */}
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs uppercase tracking-[0.25em] font-mono text-zinc-300">
                  Exclusive Patron Gateway
                </span>
              </div>
              <h2 className="font-display font-bold text-2xl tracking-tight text-white mt-3">
                AURA ATELIER
              </h2>
            </div>

            {/* Bottom quote / perks */}
            <div className="relative z-10 space-y-4">
              <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-xs text-zinc-200">
                <p className="font-serif italic leading-relaxed">
                  "Objects of uncompromising precision, designed for mindful rituals and lasting acoustic purity."
                </p>
              </div>

              <div className="space-y-2 text-[11px] text-zinc-400 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Complimentary insured express transit pan-India</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Serialized certificates & 3-year atelier warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Private client pricing & seasonal archive preview</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Form Area */}
          <div className="col-span-1 md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            {onboardingUser ? (
              /* Post-Registration Onboarding Setup */
              <div className="space-y-6 my-auto">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-semibold text-amber-900 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Account Activated</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-zinc-950">
                    Welcome to the Archive
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Complete your delivery preferences for expedited checkout, or proceed to archive browsing.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Contact Phone (for delivery dispatch)
                    </label>
                    <input
                      type="tel"
                      value={onboardingPhone}
                      onChange={e => setOnboardingPhone(e.target.value)}
                      placeholder="+91 98201 XXXXX"
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Street / Apartment Address
                    </label>
                    <input
                      type="text"
                      value={onboardingStreet}
                      onChange={e => setOnboardingStreet(e.target.value)}
                      placeholder="e.g. Penthouse 4B, Nariman Point"
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      City & Pin Code
                    </label>
                    <input
                      type="text"
                      value={onboardingCity}
                      onChange={e => setOnboardingCity(e.target.value)}
                      placeholder="e.g. Mumbai, 400021"
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCompleteOnboarding}
                    className="flex-1 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                  >
                    Save & Enter Store
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteOnboarding}
                    className="px-4 py-3 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    Skip for Now
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Mode Selector Tabs */}
                <div className="flex border-b border-zinc-200 mb-6 gap-6 text-xs font-semibold">
                  <button
                    onClick={() => {
                      setAuthModalTab('login');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className={`pb-2.5 border-b-2 uppercase tracking-wider transition-colors cursor-pointer ${
                      authModalTab === 'login'
                        ? 'border-zinc-950 text-zinc-950'
                        : 'border-transparent text-zinc-400 hover:text-zinc-800'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalTab('otp');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className={`pb-2.5 border-b-2 uppercase tracking-wider transition-colors cursor-pointer ${
                      authModalTab === 'otp'
                        ? 'border-zinc-950 text-zinc-950'
                        : 'border-transparent text-zinc-400 hover:text-zinc-800'
                    }`}
                  >
                    Mobile OTP
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalTab('register');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className={`pb-2.5 border-b-2 uppercase tracking-wider transition-colors cursor-pointer ${
                      authModalTab === 'register'
                        ? 'border-zinc-950 text-zinc-950'
                        : 'border-transparent text-zinc-400 hover:text-zinc-800'
                    }`}
                  >
                    Register
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalTab('forgot');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className={`pb-2.5 border-b-2 uppercase tracking-wider transition-colors cursor-pointer ${
                      authModalTab === 'forgot'
                        ? 'border-zinc-950 text-zinc-950'
                        : 'border-transparent text-zinc-400 hover:text-zinc-800'
                    }`}
                  >
                    Recovery
                  </button>
                </div>

                {/* Notifications & Error alerts */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                {/* 1. PASSWORD SIGN IN */}
                {authModalTab === 'login' && (
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setAuthModalTab('forgot')}
                          className="text-[11px] text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>{loading ? 'Authenticating...' : 'Sign In to Atelier'}</span>
                    </button>
                  </form>
                )}

                {/* 2. MOBILE / EMAIL OTP SIGN IN */}
                {authModalTab === 'otp' && (
                  <div className="space-y-4">
                    {!otpSent ? (
                      <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                            Mobile Number or Email
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              value={otpIdentifier}
                              onChange={e => setOtpIdentifier(e.target.value)}
                              placeholder="+91 98201 39281 or your email"
                              className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
                            />
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            We will send a 6-digit one-time passcode for passwordless instant verification.
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                        >
                          {loading && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                          <span>{loading ? 'Generating Code...' : 'Request 6-Digit OTP'}</span>
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">
                              Enter 6-Digit Passcode
                            </label>
                            <span className="text-[11px] text-zinc-400">
                              {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Code expired'}
                            </span>
                          </div>

                          <div className="relative">
                            <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              maxLength={6}
                              required
                              value={otpCode}
                              onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="123456"
                              className="w-full pl-10 pr-3.5 py-2.5 text-lg tracking-[0.4em] font-mono text-center bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
                            />
                          </div>

                          {demoOtpHint && (
                            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1.5 rounded-lg mt-2 flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Simulation Code: <strong>{demoOtpHint}</strong> (prefilled)</span>
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={loading || otpCode.length !== 6}
                            className="flex-1 py-3 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                          >
                            {loading && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                            <span>{loading ? 'Verifying...' : 'Confirm & Authenticate'}</span>
                          </button>

                          {otpTimer === 0 && (
                            <button
                              type="button"
                              onClick={() => handleSendOtp()}
                              className="px-3 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold"
                            >
                              Resend
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* 3. NEW CLIENT REGISTRATION */}
                {authModalTab === 'register' && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Elena Vance"
                          className="w-full pl-10 pr-3.5 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="elena@example.com"
                          className="w-full pl-10 pr-3.5 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                          Password
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                          Confirm Password
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
                        />
                      </div>
                    </div>

                    {/* Password Strength Meter */}
                    {password && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-zinc-500">
                          <span>Password Strength</span>
                          <span className="font-semibold">{strength.text}</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden flex">
                          <div
                            className={`h-full transition-all duration-300 ${strength.color}`}
                            style={{ width: `${(strength.score / 3) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="terms-check"
                        checked={agreeTerms}
                        onChange={e => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                      />
                      <label htmlFor="terms-check" className="text-[11px] text-zinc-500 leading-snug">
                        I accept the AURA Atelier Terms of Service and acknowledge the digital privacy governance policy.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !agreeTerms}
                      className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>{loading ? 'Creating Account...' : 'Register Client Account'}</span>
                    </button>
                  </form>
                )}

                {/* 4. RECOVERY / FORGOT PASSWORD */}
                {authModalTab === 'forgot' && (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                        Registered Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
                        />
                      </div>
                    </div>

                    {forgotStep === 'reset' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                            Reset Verification Code
                          </label>
                          <input
                            type="text"
                            required
                            value={forgotCode}
                            onChange={e => setForgotCode(e.target.value)}
                            placeholder="6-digit code"
                            className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>
                        {loading
                          ? 'Processing...'
                          : forgotStep === 'request'
                          ? 'Send Reset Code'
                          : 'Update Password & Return to Login'}
                      </span>
                    </button>
                  </form>
                )}

                {/* Google Sign-in */}
                <div className="relative my-4 text-center text-xs text-zinc-400">
                  <span className="bg-white px-2 relative z-10">or continue with</span>
                  <div className="absolute inset-0 top-1/2 border-b border-zinc-200" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-zinc-50 border border-zinc-300 hover:border-zinc-400 rounded-xl text-xs font-semibold text-zinc-800 flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>

                {/* Instant Demo Accounts */}
                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold uppercase text-zinc-400 tracking-wider">
                    Instant Access:
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('customer')}
                      className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md font-medium text-[11px] transition-colors cursor-pointer"
                    >
                      Demo Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('admin')}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-md font-semibold text-[11px] transition-colors cursor-pointer"
                    >
                      Store Admin Demo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
