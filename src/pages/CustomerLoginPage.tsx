import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Lock,
  Phone,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Building2,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerLoginPageProps {
  onLoginSuccess: (intendedDestination?: string | null) => void;
  onNavigateHome: () => void;
  onNavigateAdminLogin?: () => void;
  destinationOverride?: string | null;
}

type AuthMode = 'welcome' | 'email-password' | 'mobile-otp' | 'register' | 'register-verify' | 'forgot-request' | 'forgot-verify';

export const CustomerLoginPage: React.FC<CustomerLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
  onNavigateAdminLogin,
  destinationOverride
}) => {
  const { login, loginWithOtp, register, googleLogin, intendedDestination, setIntendedDestination } = useAuth();

  // Mode state
  const [authMode, setAuthMode] = useState<AuthMode>('welcome');

  // Input states
  const [identifier, setIdentifier] = useState(''); // email or mobile
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAgreeTerms, setRegAgreeTerms] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // 6-digit OTP states
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [otpTarget, setOtpTarget] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [smsConfigRequired, setSmsConfigRequired] = useState(false);
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>(null);

  // Forgot password states
  const [forgotTarget, setForgotTarget] = useState('');
  const [forgotOtpDigits, setForgotOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & loading states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Input refs for 6-digit OTP
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const forgotOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Calculate destination
  const effectiveDestination = destinationOverride || intendedDestination;

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpTimer > 0 && (authMode === 'mobile-otp' || authMode === 'register-verify' || authMode === 'forgot-verify')) {
      timer = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpTimer, authMode]);

  // Password strength calculator
  const calculateStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'Enter password', color: 'bg-zinc-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, text: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, text: 'Moderate', color: 'bg-amber-500' };
    return { score: 4, text: 'Strong (Marketplace Grade)', color: 'bg-emerald-500' };
  };

  const regStrength = calculateStrength(regPassword);
  const resetStrength = calculateStrength(newPassword);

  // Handle Initial Welcome "Continue"
  const handleWelcomeContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const clean = identifier.trim();
    if (!clean) {
      setErrorMsg('Please enter your email address or mobile number.');
      return;
    }

    // Check if admin email entered on customer login
    if (clean.toLowerCase() === 'admin@aura.store') {
      setErrorMsg('Administrative accounts must sign in via the dedicated Admin Portal at /admin/login.');
      return;
    }

    const isNumericPhone = /^[0-9+ ]{8,15}$/.test(clean);

    if (isNumericPhone) {
      // Mobile OTP flow
      setOtpTarget(clean);
      setLoading(true);
      setSmsConfigRequired(false);
      try {
        const res = await api.sendOtp(clean);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpTimer(res.resendAfterSeconds || 45);
        setCanResendOtp(false);
        setFormattedPhone(res.phone || clean);
        setAuthMode('mobile-otp');
        setSuccessMsg(res.message || `Verification code sent to ${res.phone || clean}`);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to dispatch verification code.');
        if (err.configRequired) {
          setSmsConfigRequired(true);
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Email Password flow
      setAuthMode('email-password');
      setPassword('');
    }
  };

  // Handle Email Password Login
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login(identifier.trim(), password);
      setSuccessMsg('Logged in successfully! Redirecting...');
      setTimeout(() => {
        onLoginSuccess(effectiveDestination);
        setIntendedDestination(null);
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect password or account not found.');
    } finally {
      setLoading(false);
    }
  };

  // Handle 6-Digit OTP Box Change
  const handleOtpDigitChange = (index: number, val: string, isForgot = false) => {
    const rawVal = val.replace(/[^0-9]/g, '');
    const currentDigits = isForgot ? [...forgotOtpDigits] : [...otpDigits];

    if (rawVal.length > 1) {
      // Paste event with multiple digits
      const pasted = rawVal.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        currentDigits[i] = pasted[i] || '';
      }
      if (isForgot) setForgotOtpDigits(currentDigits);
      else setOtpDigits(currentDigits);

      const nextFocusIdx = Math.min(pasted.length, 5);
      const targetRefs = isForgot ? forgotOtpRefs.current : otpInputRefs.current;
      targetRefs[nextFocusIdx]?.focus();
      return;
    }

    currentDigits[index] = rawVal.slice(-1);
    if (isForgot) setForgotOtpDigits(currentDigits);
    else setOtpDigits(currentDigits);

    // Auto move to next input if digit typed
    if (rawVal && index < 5) {
      const targetRefs = isForgot ? forgotOtpRefs.current : otpInputRefs.current;
      targetRefs[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, isForgot = false) => {
    const currentDigits = isForgot ? forgotOtpDigits : otpDigits;
    if (e.key === 'Backspace' && !currentDigits[index] && index > 0) {
      const targetRefs = isForgot ? forgotOtpRefs.current : otpInputRefs.current;
      targetRefs[index - 1]?.focus();
    }
  };

  // Verify Mobile OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    try {
      await loginWithOtp(otpTarget, code);
      setSuccessMsg('Mobile identity confirmed! Redirecting...');
      setTimeout(() => {
        onLoginSuccess(effectiveDestination);
        setIntendedDestination(null);
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    setErrorMsg(null);
    setLoading(true);
    try {
      const target = authMode === 'forgot-verify' ? forgotTarget : otpTarget;
      const res = await api.sendOtp(target);
      setOtpTimer(60);
      setCanResendOtp(false);
      if (res.demoCode) {
        setDemoCodeHint(res.demoCode);
        const digits = res.demoCode.split('').slice(0, 6);
        if (authMode === 'forgot-verify') setForgotOtpDigits(digits);
        else setOtpDigits(digits);
      }
      setSuccessMsg('A new 6-digit code has been dispatched.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (!regAgreeTerms) {
      setErrorMsg('Please accept the Terms & Privacy Policy to proceed.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    // Check duplicate or send verification OTP
    setLoading(true);
    try {
      const sendTarget = regPhone.trim() || regEmail.trim();
      const otpRes = await api.sendOtp(sendTarget);
      setOtpTarget(sendTarget);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(60);
      setCanResendOtp(false);
      if (otpRes.demoCode) {
        setDemoCodeHint(otpRes.demoCode);
        setOtpDigits(otpRes.demoCode.split('').slice(0, 6));
      }
      setAuthMode('register-verify');
      setSuccessMsg(`Verification code dispatched to ${sendTarget}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Account registration initiation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Finalize Registration after OTP
  const handleFinalizeRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      // First verify OTP
      await api.verifyOtp(otpTarget, code, regName.trim());
      // Then register user account with full credentials
      await register(regName.trim(), regEmail.trim(), regPhone.trim(), regPassword);
      setSuccessMsg('Your AURA Patron Account has been created! Redirecting...');
      setTimeout(() => {
        onLoginSuccess(effectiveDestination);
        setIntendedDestination(null);
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please check code.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Step 1: Request Code
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const target = forgotTarget.trim();
    if (!target) {
      setErrorMsg('Please enter your registered email or mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(target);
      setOtpTimer(60);
      setCanResendOtp(false);
      setForgotOtpDigits(['', '', '', '', '', '']);
      if (res.demoCode) {
        setDemoCodeHint(res.demoCode);
        setForgotOtpDigits(res.demoCode.split('').slice(0, 6));
      }
      setAuthMode('forgot-verify');
      setSuccessMsg(`Security code generated for ${target}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch password recovery code.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Step 2: Reset Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const code = forgotOtpDigits.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(forgotTarget.trim(), code, newPassword);
      setSuccessMsg('Password successfully updated! You can now log in.');
      setTimeout(() => {
        setAuthMode('welcome');
        setIdentifier(forgotTarget.trim());
        setPassword('');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await googleLogin();
      setSuccessMsg('Google authentication verified! Redirecting...');
      setTimeout(() => {
        onLoginSuccess(effectiveDestination);
        setIntendedDestination(null);
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In was unable to complete.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between selection:bg-zinc-950 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-8 h-8 bg-zinc-950 text-white flex items-center justify-center font-bold text-sm rounded-sm group-hover:bg-zinc-800 transition-colors shadow-sm">
              A
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-bold tracking-tight text-xl text-zinc-950 uppercase leading-none">
                AURA
              </span>
              <span className="text-[9px] tracking-[0.25em] text-zinc-500 uppercase font-semibold">
                Marketplace Atelier
              </span>
            </div>
          </button>

          <button
            onClick={onNavigateHome}
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200/80 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-zinc-950 text-white p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded">
                Patron Access
              </span>
              {effectiveDestination && (
                <span className="text-[10px] text-zinc-400 font-medium">
                  Return to {effectiveDestination}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-3">
              {authMode === 'register' || authMode === 'register-verify'
                ? 'Create Your Account'
                : authMode === 'forgot-request' || authMode === 'forgot-verify'
                ? 'Security Recovery'
                : 'Welcome Back'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {authMode === 'register' || authMode === 'register-verify'
                ? 'Join our community for curated collections, tracked dispatch & patronage'
                : authMode === 'forgot-request' || authMode === 'forgot-verify'
                ? 'Reset your credentials with 6-digit identity confirmation'
                : 'Login to continue your shopping experience'}
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mx-6 mt-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mx-6 mt-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Body Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* VIEW 1: Initial Simple Welcome Screen */}
              {authMode === 'welcome' && (
                <motion.form
                  key="welcome-form"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  onSubmit={handleWelcomeContinue}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Email or Mobile Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        placeholder="Enter email or 10-digit mobile"
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-all"
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1.5">
                      We'll auto-route to password authentication for email or instant OTP for mobile.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !identifier.trim()}
                    className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {loading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-200" />
                    </div>
                    <span className="relative bg-white px-3 text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                      OR
                    </span>
                  </div>

                  {/* Continue with Google */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-2.5 px-4 border border-zinc-300 hover:border-zinc-400 bg-white hover:bg-zinc-50 text-zinc-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {/* Navigation Links */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-zinc-600 hover:text-zinc-950 font-medium cursor-pointer"
                    >
                      New to AURA? <span className="font-bold underline">Create Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot-request');
                        setForgotTarget(identifier);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-zinc-500 hover:text-zinc-800 cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </motion.form>
              )}

              {/* VIEW 2: Email + Password Authentication */}
              {authMode === 'email-password' && (
                <motion.form
                  key="email-pass-form"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  onSubmit={handleEmailPasswordLogin}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Signing in as</span>
                      <p className="text-xs font-semibold text-zinc-900 truncate">{identifier}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAuthMode('welcome')}
                      className="text-xs text-amber-600 hover:underline font-medium cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot-request');
                          setForgotTarget(identifier);
                        }}
                        className="text-[11px] text-zinc-500 hover:text-zinc-900 cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white pr-10 transition-all"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !password}
                    className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {loading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setAuthMode('welcome')}
                      className="text-zinc-500 hover:text-zinc-800 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setErrorMsg(null);
                      }}
                      className="text-zinc-700 hover:text-zinc-950 font-semibold cursor-pointer"
                    >
                      Create Account
                    </button>
                  </div>
                </motion.form>
              )}

              {/* VIEW 3: Mobile OTP 6-Digit Screen */}
              {authMode === 'mobile-otp' && (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Code dispatched to</span>
                      <p className="text-xs font-semibold text-zinc-900">{otpTarget}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAuthMode('welcome')}
                      className="text-xs text-amber-600 hover:underline font-medium cursor-pointer"
                    >
                      Change Number
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
                      Enter 6-Digit Verification Code
                    </label>

                    {/* 6 Auto-Advancing Digit Boxes */}
                    <div className="flex items-center justify-between gap-2">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => {
                            otpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(idx, e)}
                          className="w-11 h-12 text-center text-lg font-bold bg-zinc-50 border-2 border-zinc-300 rounded-xl focus:border-zinc-950 focus:bg-white focus:outline-none transition-all shadow-xs"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>

                    {demoCodeHint && (
                      <div className="mt-2 text-right">
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">
                          Simulator code: {demoCodeHint}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>
                      {otpTimer > 0 ? (
                        <>Resend code in <strong className="text-zinc-900">{otpTimer}s</strong></>
                      ) : (
                        <span className="text-zinc-700">Didn't receive the SMS?</span>
                      )}
                    </span>
                    <button
                      type="button"
                      disabled={!canResendOtp || loading}
                      onClick={handleResendOtp}
                      className={`font-semibold cursor-pointer ${
                        canResendOtp ? 'text-zinc-950 hover:underline' : 'text-zinc-300 cursor-not-allowed'
                      }`}
                    >
                      Resend OTP
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpDigits.some(d => !d)}
                    className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {loading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify & Sign In</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {/* VIEW 4: New User Sign Up */}
              {authMode === 'register' && (
                <motion.form
                  key="register-form"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  onSubmit={handleRegisterSubmit}
                  className="space-y-3.5"
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="e.g. Maya Chen"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-all"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        placeholder="+91 98201 00000"
                        className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="client@domain.com"
                        className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Create a secure password"
                        className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white pr-9 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Real-time password strength meter */}
                    {regPassword && (
                      <div className="mt-1.5 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-400">Security strength</span>
                          <span className="font-bold text-zinc-700">{regStrength.text}</span>
                        </div>
                        <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${regStrength.color} transition-all duration-200`}
                            style={{ width: `${(regStrength.score / 4) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-all"
                      required
                    />
                  </div>

                  <label className="flex items-start gap-2 text-xs text-zinc-600 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={regAgreeTerms}
                      onChange={e => setRegAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                    />
                    <span>
                      I agree to the <span className="underline text-zinc-900">Terms of Service</span> and{' '}
                      <span className="underline text-zinc-900">Privacy Policy</span>.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading || !regAgreeTerms || !regName || !regEmail || !regPassword}
                    className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2"
                  >
                    {loading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Continue to Verification</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-xs text-zinc-500">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('welcome')}
                      className="text-zinc-950 font-bold hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                </motion.form>
              )}

              {/* VIEW 5: Register Verification OTP */}
              {authMode === 'register-verify' && (
                <motion.form
                  key="reg-verify-form"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  onSubmit={handleFinalizeRegistration}
                  className="space-y-4"
                >
                  <div className="text-center space-y-1">
                    <p className="text-xs text-zinc-500">
                      We dispatched a 6-digit confirmation code to verify your identity at:
                    </p>
                    <p className="text-xs font-bold text-zinc-900">{otpTarget}</p>
                  </div>

                  {/* 6 Digit inputs */}
                  <div className="flex items-center justify-between gap-2 py-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        className="w-11 h-12 text-center text-lg font-bold bg-zinc-50 border-2 border-zinc-300 rounded-xl focus:border-zinc-950 focus:bg-white focus:outline-none transition-all"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  {demoCodeHint && (
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">
                        Simulator code: {demoCodeHint}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>
                      {otpTimer > 0 ? (
                        <>Resend code in <strong>{otpTimer}s</strong></>
                      ) : (
                        'Code expired'
                      )}
                    </span>
                    <button
                      type="button"
                      disabled={!canResendOtp || loading}
                      onClick={handleResendOtp}
                      className={`font-semibold cursor-pointer ${
                        canResendOtp ? 'text-zinc-950 hover:underline' : 'text-zinc-300 cursor-not-allowed'
                      }`}
                    >
                      Resend OTP
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpDigits.some(d => !d)}
                    className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {loading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Complete Registration</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="w-full text-center text-xs text-zinc-500 hover:text-zinc-800 cursor-pointer"
                  >
                    Back to registration form
                  </button>
                </motion.form>
              )}

              {/* VIEW 6: Forgot Password Request */}
              {authMode === 'forgot-request' && (
                <motion.form
                  key="forgot-request-form"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  onSubmit={handleForgotRequest}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Registered Email or Mobile Number
                    </label>
                    <input
                      type="text"
                      value={forgotTarget}
                      onChange={e => setForgotTarget(e.target.value)}
                      placeholder="e.g. client@domain.com or +91 98201..."
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-all"
                      autoFocus
                      required
                    />
                    <p className="text-[11px] text-zinc-400 mt-1.5">
                      We will dispatch a secure 6-digit recovery code to reset your account password.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !forgotTarget.trim()}
                    className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {loading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Send Security Code</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMode('welcome')}
                    className="w-full text-center text-xs text-zinc-500 hover:text-zinc-800 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Login</span>
                  </button>
                </motion.form>
              )}

              {/* VIEW 7: Forgot Password Verify & New Password */}
              {authMode === 'forgot-verify' && (
                <motion.form
                  key="forgot-verify-form"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 1, y: 0 }}
                  onSubmit={handleResetPasswordSubmit}
                  className="space-y-3.5"
                >
                  <div className="text-center space-y-0.5 pb-1">
                    <p className="text-xs text-zinc-500">Security code dispatched to</p>
                    <p className="text-xs font-bold text-zinc-900">{forgotTarget}</p>
                  </div>

                  {/* 6 Digit Inputs */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                      6-Digit Security Code
                    </label>
                    <div className="flex items-center justify-between gap-2">
                      {forgotOtpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => {
                            forgotOtpRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpDigitChange(idx, e.target.value, true)}
                          onKeyDown={e => handleOtpKeyDown(idx, e, true)}
                          className="w-11 h-12 text-center text-lg font-bold bg-zinc-50 border-2 border-zinc-300 rounded-xl focus:border-zinc-950 focus:bg-white focus:outline-none transition-all"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>

                    {demoCodeHint && (
                      <div className="text-right mt-1.5">
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">
                          Simulator code: {demoCodeHint}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 6 characters)"
                        className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white pr-9 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {newPassword && (
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-400">Security strength</span>
                          <span className="font-bold text-zinc-700">{resetStrength.text}</span>
                        </div>
                        <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${resetStrength.color} transition-all duration-200`}
                            style={{ width: `${(resetStrength.score / 4) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-all"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || forgotOtpDigits.some(d => !d) || !newPassword}
                    className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2"
                  >
                    {loading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Update Password & Return to Login</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Clean footer note */}
          <div className="bg-zinc-50 border-t border-zinc-100 px-6 py-3.5 text-center">
            <p className="text-[11px] text-zinc-400">
              Encrypted SSL transaction · Compliant with Digital Personal Data Protection standards
            </p>
          </div>
        </div>
      </div>

      {/* Discrete bottom bar */}
      <footer className="py-4 text-center text-xs text-zinc-400 border-t border-zinc-200/60">
        <p>© 2026 AURA Atelier Marketplace Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};
