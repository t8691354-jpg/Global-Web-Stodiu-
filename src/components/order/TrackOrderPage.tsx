import React, { useState } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { api } from '../../services/api';
import { Search, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const { setConfirmedOrder, showToast, setCurrentPage } = useAgency();

  const [orderRef, setOrderRef] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!orderRef.trim() || !email.trim()) {
      setErrorMessage('Please provide both the Order Reference and your contact email.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.getOrder(orderRef.trim(), undefined, email.trim().toLowerCase());
      setConfirmedOrder(data.order, data.order.clientAccessToken);
      showToast(`Order ${data.order.orderRef} loaded successfully`, 'success');
      setCurrentPage('payment-instructions');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not find an order matching that reference and email combination.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Track Your Order</h1>
          <p className="text-xs text-slate-400 mt-2">
            Enter your order reference (e.g. GWS-2026-XXXXX) and the email address used during checkout to view payment instructions or proof status.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
          <form onSubmit={handleLookup} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Order Reference Number <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                required
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value.toUpperCase())}
                placeholder="GWS-2026-X9K4B"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Client Email Address <span className="text-cyan-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Retrieve Order & Payment Status</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Private order details are protected by email ownership verification.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
