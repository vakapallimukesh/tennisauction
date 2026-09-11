import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { Lock, User, ShieldAlert, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess }) {
  const { login } = useAuction();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('tennis2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setUsername('admin');
    setPassword('tennis2026');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#050914] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-8 shadow-2xl relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 relative flex items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <img 
              src="/images/tennis-ball-glow.svg" 
              alt="Tennis Ball" 
              className="w-10 h-10 animate-tennis-spin"
            />
          </div>
          <h1 className="text-2xl font-black font-display tracking-tight text-white uppercase">
            AUCTION CONTROL PANEL
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Restricted Access for Official Auction Staff & Auctioneers
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-950/50 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Security Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Quick Demo Autofill helper */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500">Local Testing:</span>
            <button
              type="button"
              onClick={fillDemo}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2"
            >
              Fill Default (admin / tennis2026)
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>AUTHENTICATING...</span>
            ) : (
              <>
                <span>ENTER CONTROL PANEL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Socket.IO Auction Master Connection</span>
          </p>
        </div>
      </div>
    </div>
  );
}
