import React, { useState, useEffect } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { api } from '../../services/api';
import {
  ProjectQuotation,
  CustomProjectRequest,
  Order,
  PaymentMethodConfig,
  Milestone,
} from '../../types';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  DollarSign,
  ArrowRight,
  Layers,
  Lock,
  Download,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CreditCard,
  Building2,
  Check,
  AlertCircle,
} from 'lucide-react';

export const QuotationViewPage: React.FC = () => {
  const {
    activeQuotationId,
    currentOrderToken,
    setConfirmedOrder,
    navigateToClientPortal,
    setCurrentPage,
    showToast,
  } = useAgency();

  const [quotationIdInput, setQuotationIdInput] = useState(activeQuotationId || '');
  const [tokenInput, setTokenInput] = useState(currentOrderToken || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Loaded data
  const [quotation, setQuotation] = useState<ProjectQuotation | null>(null);
  const [customRequest, setCustomRequest] = useState<CustomProjectRequest | null>(null);
  const [linkedOrder, setLinkedOrder] = useState<Order | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);

  // Acceptance modal / form
  const [signatureName, setSignatureName] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  useEffect(() => {
    // Parse URL hash query if present (e.g. #quotation-view?quotationId=QUOT-...&token=...)
    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');
    if (queryIndex !== -1) {
      const searchParams = new URLSearchParams(hash.substring(queryIndex + 1));
      const qId = searchParams.get('quotationId');
      const tok = searchParams.get('token');
      if (qId) setQuotationIdInput(qId);
      if (tok) setTokenInput(tok);
      if (qId) {
        loadQuotation(qId, tok || undefined);
        return;
      }
    }

    if (activeQuotationId) {
      loadQuotation(activeQuotationId, currentOrderToken || undefined);
    }
  }, [activeQuotationId]);

  const loadQuotation = async (qId?: string, tok?: string) => {
    const idToUse = (qId || quotationIdInput).trim().toUpperCase();
    const tokenToUse = (tok || tokenInput).trim();

    if (!idToUse) {
      setErrorMessage('Please enter a Quotation ID (e.g. QUOT-2026-X7Y2).');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await api.getQuotation(idToUse, tokenToUse || undefined);
      setQuotation(data.quotation);
      setCustomRequest(data.customRequest);
      setLinkedOrder(data.linkedOrder);
      setPaymentMethods(data.paymentMethods || []);
      setQuotationIdInput(idToUse);
      if (data.customRequest?.customerName && !signatureName) {
        setSignatureName(data.customRequest.customerName);
      }
    } catch (err: any) {
      setQuotation(null);
      setErrorMessage(err.message || 'Unable to load quotation. Please verify quotation reference & token.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotation) return;

    if (!termsAgreed) {
      showToast('You must acknowledge and accept the quotation terms to proceed.', 'error');
      return;
    }

    if (!signatureName.trim()) {
      showToast('Please type your full legal name as digital signature.', 'error');
      return;
    }

    const tokenToUse = tokenInput || quotation.clientAccessToken || customRequest?.clientAccessToken;
    if (!tokenToUse) {
      showToast('Client access token is required to verify authorization.', 'error');
      return;
    }

    setIsAccepting(true);
    try {
      const res = await api.acceptQuotation(
        quotation.quotationId,
        tokenToUse,
        signatureName.trim(),
        'Quotation accepted via client portal.'
      );

      setQuotation(res.quotation);
      if (res.order) {
        setLinkedOrder(res.order);
      }

      showToast('Quotation accepted! Milestone 1 payment order has been initialized.', 'success');

      // If order created, prompt direct payment navigation
      if (res.order) {
        setConfirmedOrder(res.order, res.order.clientAccessToken);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to accept quotation.', 'error');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotation) return;

    const tokenToUse = tokenInput || quotation.clientAccessToken || customRequest?.clientAccessToken;
    if (!tokenToUse) {
      showToast('Client access token is required.', 'error');
      return;
    }

    setIsDeclining(true);
    try {
      await api.declineQuotation(quotation.quotationId, tokenToUse, declineReason.trim());
      showToast('Quotation declined. You can message the architect in your client portal.', 'info');
      setShowDeclineModal(false);
      loadQuotation(quotation.quotationId, tokenToUse);
    } catch (err: any) {
      showToast(err.message || 'Failed to decline quotation.', 'error');
    } finally {
      setIsDeclining(false);
    }
  };

  const isExpired = quotation && new Date(quotation.expiryDate).getTime() < Date.now();
  const isAccepted = quotation?.status === 'accepted';
  const isDeclined = quotation?.status === 'declined';

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800">
        <div>
          <button
            onClick={() =>
              customRequest
                ? navigateToClientPortal(customRequest.requestId, quotation?.clientAccessToken)
                : setCurrentPage('client-portal')
            }
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mb-2 transition"
          >
            ← Back to Customer Workspace
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Official Project Deal Quotation
          </h1>
        </div>

        {/* Quick Quotation Lookup input if needed */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={quotationIdInput}
            onChange={(e) => setQuotationIdInput(e.target.value)}
            placeholder="QUOT-2026-..."
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => loadQuotation()}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
          >
            Load
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {quotation ? (
        <div className="space-y-8">
          
          {/* Main Official Document Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-md">
            
            {/* Acceptance Watermark / Status Badge */}
            {isAccepted && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Deal Formally Accepted & Locked</h3>
                    <p className="text-xs text-emerald-200/90 mt-0.5">
                      Signed by <strong className="text-white">{quotation.acceptanceSignature}</strong> on{' '}
                      {quotation.acceptedAt && new Date(quotation.acceptedAt).toLocaleString()}.
                    </p>
                  </div>
                </div>

                {linkedOrder && (
                  <button
                    onClick={() => setConfirmedOrder(linkedOrder, quotation.clientAccessToken || '')}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>Proceed to Milestone 1 Bank Transfer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {isDeclined && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-center gap-3">
                <XCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-white">Quotation Declined</h3>
                  <p className="text-xs text-rose-200/90 mt-0.5">
                    Reason: "{quotation.declineReason || 'Not specified'}". A revised quotation can be requested via your customer portal.
                  </p>
                </div>
              </div>
            )}

            {/* Document Header & Agency Letterhead */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-slate-800">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-1">
                  GlobalWeb Studio • Architectural Quotation
                </p>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  {quotation.projectTitle}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
                  <span>
                    Quotation ID: <strong className="font-mono text-cyan-300">{quotation.quotationId}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Linked Request: <strong className="font-mono text-slate-300">{quotation.requestId}</strong>
                  </span>
                  <span>•</span>
                  <span>Version: <strong className="text-white">v{quotation.version}.0</strong></span>
                </div>
              </div>

              {/* Price Callout */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-left sm:text-right shrink-0 w-full sm:w-auto">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Total Agreed Price
                </p>
                <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-200">
                  ${quotation.totalPriceUSD.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">United States Dollars (USD)</p>
              </div>
            </div>

            {/* Key Validity & Timeline Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-800 text-xs">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Offer Date</p>
                <p className="font-semibold text-slate-200 mt-0.5">
                  {new Date(quotation.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Offer Expiry Date</p>
                <p className={`font-semibold mt-0.5 ${isExpired ? 'text-rose-400' : 'text-amber-400'}`}>
                  {quotation.expiryDate} {isExpired && '(Expired)'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Estimated Roadmap</p>
                <p className="font-semibold text-slate-200 mt-0.5">{quotation.deliveryTimeline}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Revision Guarantee</p>
                <p className="font-semibold text-slate-200 mt-0.5">{quotation.revisionPolicy}</p>
              </div>
            </div>

            {/* Section 1: Scope of Work */}
            <div className="py-6 border-b border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Agreed Engineering Scope & Deliverables
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {quotation.agreedScope}
              </p>
            </div>

            {/* Section 2: Deliverables vs Excluded features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-800">
              
              {/* Deliverables */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Included Deliverables ({quotation.deliverables.length})
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {quotation.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclusions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-slate-500" />
                  Explicit Exclusions & Out-of-Scope Items
                </h4>
                {quotation.excludedFeatures && quotation.excludedFeatures.length > 0 ? (
                  <ul className="space-y-2 text-xs text-slate-400">
                    {quotation.excludedFeatures.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-950/30 border border-slate-800/50">
                        <XCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-950/30 rounded-xl">
                    No custom exclusions specified beyond standard terms.
                  </p>
                )}
              </div>
            </div>

            {/* Section 3: Payment Milestone Schedule */}
            <div className="py-6 border-b border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Structured Milestone Payment Schedule
                </h3>
                <span className="text-[11px] text-slate-400">
                  Manual bank transfer / SWIFT wire instructions provided per milestone
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Milestone</th>
                      <th className="py-3 px-4">Phase & Deliverables Description</th>
                      <th className="py-3 px-4 text-center">Share</th>
                      <th className="py-3 px-4 text-right">Amount (USD)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                    {quotation.paymentSchedule.map((milestone, idx) => (
                      <tr key={milestone.id || idx} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                          {milestone.title || `Milestone ${idx + 1}`}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {milestone.description || 'Sprint deliverables according to architecture plan.'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-cyan-300">
                          {milestone.percentage}%
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-white font-mono whitespace-nowrap">
                          ${milestone.amountUSD.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              milestone.status === 'payment_verified'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : milestone.status === 'proof_submitted'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {milestone.status === 'payment_verified'
                              ? 'Verified'
                              : milestone.status === 'proof_submitted'
                              ? 'In Review'
                              : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-950/90 font-bold border-t border-slate-800">
                      <td className="py-3.5 px-4 text-cyan-400" colSpan={2}>
                        Total Contract Valuation
                      </td>
                      <td className="py-3.5 px-4 text-center text-cyan-400 font-mono">100%</td>
                      <td className="py-3.5 px-4 text-right text-cyan-400 font-mono text-sm">
                        ${quotation.totalPriceUSD.toLocaleString()} USD
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: Maintenance, Warranty & Legal Terms */}
            <div className="py-6 border-b border-slate-800 space-y-4 text-xs text-slate-300">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Support, Maintenance & Cancellation Terms
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Warranty & Maintenance
                  </p>
                  <p className="text-slate-300 leading-relaxed">{quotation.maintenanceTerms}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Cancellation & Refund Policy
                  </p>
                  <p className="text-slate-300 leading-relaxed">{quotation.cancellationAndRefundTerms}</p>
                </div>
              </div>

              {quotation.thirdPartyCostsNote && (
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400">
                  <strong className="text-slate-300">Third-Party Hosting & API Costs:</strong>{' '}
                  {quotation.thirdPartyCostsNote}
                </div>
              )}
            </div>

            {/* Section 5: Acceptance & Digital Signature Module */}
            {!isAccepted && !isDeclined && (
              <div className="pt-8">
                <form
                  onSubmit={handleAcceptQuotation}
                  className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Formal Quotation & Deal Acceptance
                      </h3>
                      <p className="text-xs text-slate-400">
                        Accepting will lock in the agreed scope and initialize Order for Milestone 1 manual transfer ($
                        {quotation.paymentSchedule[0]?.amountUSD?.toLocaleString()} USD).
                      </p>
                    </div>
                  </div>

                  {/* Legal acceptance checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900"
                    />
                    <span className="leading-relaxed">
                      I have reviewed and agree to the scope of work, deliverables, milestone payment roadmap, revision
                      policy, and terms stated in Quotation <strong className="text-white">{quotation.quotationId}</strong>.
                      I confirm that payment for Milestone 1 will be conducted via official manual bank transfer upon acceptance.
                    </span>
                  </label>

                  {/* Digital Signature */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Full Legal Name (Digital Signature) <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        placeholder="Type your full legal name"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Signing Date & Time
                      </label>
                      <input
                        type="text"
                        disabled
                        value={new Date().toLocaleString()}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowDeclineModal(true)}
                      className="text-xs text-slate-400 hover:text-rose-400 transition"
                    >
                      Decline / Request Adjustments
                    </button>

                    <button
                      type="submit"
                      disabled={isAccepting || !termsAgreed}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 text-slate-950 hover:from-cyan-300 hover:to-indigo-200 shadow-xl shadow-cyan-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2"
                    >
                      {isAccepting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Accepting Quotation...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept Quotation & Proceed</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Decline Modal */}
          {showDeclineModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">Decline Project Quotation</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Please let our architecture team know why this quotation does not meet your requirements. You can negotiate further via your customer portal.
                </p>

                <form onSubmit={handleDeclineQuotation} className="space-y-4">
                  <textarea
                    rows={4}
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="e.g. Budget is too high, milestone schedule needs adjusting, or scope requires amendment..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
                  />

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDeclineModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isDeclining}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white disabled:opacity-50"
                    >
                      {isDeclining ? 'Declining...' : 'Confirm Decline'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty / Not Loaded State */
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 max-w-xl mx-auto">
          <FileText className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Quotation Reference Required</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            Enter your Quotation ID (e.g. <span className="font-mono text-cyan-400">QUOT-2026-X7Y2</span>) above or open the quotation link received from your customer portal.
          </p>
          <button
            onClick={() => setCurrentPage('client-portal')}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition"
          >
            Go to Customer Portal
          </button>
        </div>
      )}
    </div>
  );
};
