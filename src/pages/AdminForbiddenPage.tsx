import React from 'react';
import { ShieldAlert, ArrowLeft, KeyRound, Home } from 'lucide-react';

interface AdminForbiddenPageProps {
  onNavigateHome: () => void;
  onNavigateAdminLogin: () => void;
}

export const AdminForbiddenPage: React.FC<AdminForbiddenPageProps> = ({
  onNavigateHome,
  onNavigateAdminLogin
}) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-rose-400 uppercase bg-rose-950/60 px-2.5 py-1 rounded border border-rose-800">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-4">
            You are not authorized to access this area.
          </h1>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            The Executive Management Console is protected by backend role-based access control (RBAC). Your current session does not possess administrator privileges.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <button
            onClick={onNavigateAdminLogin}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md font-mono"
          >
            <KeyRound className="w-4 h-4" />
            <span>Sign In to Admin Portal</span>
          </button>

          <button
            onClick={onNavigateHome}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Storefront</span>
          </button>
        </div>

        <div className="border-t border-zinc-800 pt-4">
          <p className="text-[11px] font-mono text-zinc-600">
            Path attempted: /admin · Session Security Enforced
          </p>
        </div>
      </div>
    </div>
  );
};
