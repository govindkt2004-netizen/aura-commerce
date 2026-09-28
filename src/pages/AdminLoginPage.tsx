import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  Building2,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';

interface AdminLoginPageProps {
  onAdminLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onAdminLoginSuccess,
  onNavigateHome
}) => {
  const { adminLogin } = useAuth();

  const [email, setEmail] = useState('admin@aura.store');
  const [password, setPassword] = useState('Admin@Aura2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot password modal/state for admin recovery
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('admin@aura.store');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'reset'>('request');
  const [demoRecoveryCode, setDemoRecoveryCode] = useState<string | null>(null);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Administrative email and password are required.');
      return;
    }

    setLoading(true);
    try {
      await adminLogin(email.trim(), password);
      setSuccessMsg('Executive credentials verified. Launching operational suite...');
      setTimeout(() => {
        onAdminLoginSuccess();
      }, 600);
    } catch (err: any) {
      setErrorMsg(
        err.message || 'Access denied: Invalid administrative credentials or unauthorized privileges.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await api.forgotPassword(recoveryEmail.trim());
      setRecoveryStep('reset');
      if (res.demoCode) {
        setDemoRecoveryCode(res.demoCode);
        setRecoveryCode(res.demoCode);
      }
      setSuccessMsg(`Recovery token dispatched to ${recoveryEmail}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch recovery code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!recoveryCode.trim() || !newAdminPassword || newAdminPassword.length < 8) {
      setErrorMsg('Please enter the verification code and a new password with at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(recoveryEmail.trim(), recoveryCode.trim(), newAdminPassword);
      setSuccessMsg('Administrative password updated. Please sign in with your new credentials.');
      setShowRecovery(false);
      setPassword(newAdminPassword);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset administrative credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-amber-400 selection:text-zinc-950">
      {/* Top Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center font-bold text-sm shadow-md">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono text-xs uppercase font-bold tracking-widest text-zinc-400">
                AURA ATELIER
              </span>
              <h2 className="text-sm font-bold text-white tracking-tight">Executive Management Portal</h2>
            </div>
          </div>

          <button
            onClick={onNavigateHome}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </button>
        </div>
      </header>

      {/* Main Admin Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden relative">
          {/* Subtle Ambient Gold Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="p-8 pb-6 border-b border-zinc-800/80">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[11px] font-mono uppercase tracking-widest mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>RBAC Tier 1 · Strict Protocol</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">ADMIN PORTAL</h1>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Restricted management console for catalog curation, dispatch tracking, customer dossiers, and store operations.
            </p>
          </div>

          {/* Feedback */}
          {errorMsg && (
            <div className="mx-8 mt-6 p-3.5 bg-rose-950/80 border border-rose-800 rounded-xl flex items-start gap-2.5 text-xs text-rose-200 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mx-8 mt-6 p-3.5 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-start gap-2.5 text-xs text-emerald-200 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Form */}
          <div className="p-8">
            {!showRecovery ? (
              <form onSubmit={handleAdminSignIn} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                    Admin Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@aura.store"
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                      required
                      autoFocus
                    />
                    <Mail className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowRecovery(true)}
                      className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all pr-11 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Pre-filled credentials hint for testing */}
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Demo Admin credentials pre-loaded</span>
                  <span className="font-mono text-amber-400 font-bold">admin@aura.store</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg font-mono disabled:opacity-50"
                >
                  {loading ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Sign In to Admin Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Administrative Password Recovery */
              <form
                onSubmit={recoveryStep === 'request' ? handleSendRecoveryCode : handleResetAdminPassword}
                className="space-y-4"
              >
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-300">
                  <h4 className="font-bold text-amber-400 mb-1">Administrative Credential Recovery</h4>
                  <p className="text-zinc-400 text-[11px]">
                    Verify access to the root administrator inbox to reset security keys.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={e => setRecoveryEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>

                {recoveryStep === 'reset' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        6-Digit Security Token
                      </label>
                      <input
                        type="text"
                        value={recoveryCode}
                        onChange={e => setRecoveryCode(e.target.value)}
                        placeholder="Enter token"
                        className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                        required
                      />
                      {demoRecoveryCode && (
                        <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                          Simulator token: {demoRecoveryCode}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        New Admin Password
                      </label>
                      <input
                        type="password"
                        value={newAdminPassword}
                        onChange={e => setNewAdminPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                        required
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer font-mono shadow-md"
                >
                  {loading ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : recoveryStep === 'request' ? (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send Recovery Token</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Update Admin Password</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRecovery(false);
                    setRecoveryStep('request');
                    setErrorMsg(null);
                  }}
                  className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer pt-1"
                >
                  Cancel and return to Sign In
                </button>
              </form>
            )}
          </div>

          {/* Footer Security Notice */}
          <div className="bg-zinc-950/80 border-t border-zinc-800/80 px-8 py-4 text-center">
            <p className="text-[11px] text-zinc-500 font-mono">
              All management access attempts are cryptographically audited with timestamp & IP logging.
            </p>
          </div>
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-zinc-600 border-t border-zinc-900 font-mono">
        <p>AURA System Core v2.6.4 · Enterprise RBAC Enforced</p>
      </footer>
    </div>
  );
};
