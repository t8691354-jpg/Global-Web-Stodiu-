import React, { useState, useEffect } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { api } from '../../services/api';
import {
  CustomProjectRequest,
  ProjectQuotation,
  Order,
  PaymentMethodConfig,
  CustomProjectStatus,
} from '../../types';
import {
  Search,
  ShieldCheck,
  Clock,
  ArrowRight,
  Send,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CreditCard,
  MessageSquare,
  HelpCircle,
  Eye,
  RefreshCw,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

const STATUS_PROGRESS: { [key in CustomProjectStatus]?: { step: number; color: string; label: string } } = {
  Submitted: { step: 1, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', label: '1. Specification Submitted' },
  'Under Review': { step: 2, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', label: '2. Under Architectural Review' },
  'More Information Required': { step: 2, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', label: '2. Clarification Requested' },
  'Quote Prepared': { step: 3, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', label: '3. Formal Quote Prepared' },
  'Deal Offered': { step: 3, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', label: '3. Deal Offered to Client' },
  'Accepted by Client': { step: 4, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30', label: '4. Deal Formally Accepted' },
  'Awaiting Payment': { step: 4, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', label: '4. Awaiting Milestone 1 Payment' },
  'Payment Proof Submitted': { step: 5, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', label: '5. Payment Proof Under Review' },
  'Payment Verified': { step: 6, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', label: '6. Payment Verified' },
  'In Development': { step: 7, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', label: '7. In Active Engineering' },
  Delivered: { step: 8, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', label: '8. Deliverables Staged & Handed Over' },
  Completed: { step: 9, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', label: '9. Project Completed' },
  Declined: { step: 0, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', label: 'Negotiation Closed / Declined' },
  Cancelled: { step: 0, color: 'text-slate-400 bg-slate-500/10 border-slate-500/30', label: 'Cancelled' },
};

export const ClientPortalPage: React.FC = () => {
  const {
    activeRequestId,
    currentOrderToken,
    navigateToQuotation,
    setCurrentPage,
    setConfirmedOrder,
    showToast,
  } = useAgency();

  // Search / Auth State
  const [requestIdInput, setRequestIdInput] = useState(activeRequestId || '');
  const [tokenInput, setTokenInput] = useState(currentOrderToken || '');
  const [emailInput, setEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Active loaded data
  const [customRequest, setCustomRequest] = useState<CustomProjectRequest | null>(null);
  const [quotations, setQuotations] = useState<ProjectQuotation[]>([]);
  const [linkedOrder, setLinkedOrder] = useState<Order | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);

  // Messaging state
  const [clientMessageText, setClientMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Auto-fetch if context has credentials or from URL hash
  useEffect(() => {
    // Parse URL params if in hash (e.g. #client-portal?requestId=CPR-...&token=...)
    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');
    if (queryIndex !== -1) {
      const searchParams = new URLSearchParams(hash.substring(queryIndex + 1));
      const reqId = searchParams.get('requestId');
      const tok = searchParams.get('token');
      if (reqId) setRequestIdInput(reqId);
      if (tok) setTokenInput(tok);
      if (reqId) {
        handleLookup(reqId, tok || undefined);
        return;
      }
    }

    if (activeRequestId) {
      handleLookup(activeRequestId, currentOrderToken || undefined);
    }
  }, [activeRequestId]);

  const handleLookup = async (lookupReqId?: string, lookupTok?: string) => {
    const idToUse = (lookupReqId || requestIdInput).trim().toUpperCase();
    const tokenToUse = (lookupTok || tokenInput).trim();
    const emailToUse = emailInput.trim().toLowerCase();

    if (!idToUse) {
      setErrorMessage('Please enter your Custom Project Request ID (e.g. CPR-2026-X8N9K).');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await api.getCustomRequest(idToUse, tokenToUse || undefined, emailToUse || undefined);
      setCustomRequest(data.customRequest);
      setQuotations(data.quotations || []);
      setLinkedOrder(data.linkedOrder || null);
      setPaymentMethods(data.paymentMethods || []);
      setRequestIdInput(idToUse);
    } catch (err: any) {
      setCustomRequest(null);
      setErrorMessage(err.message || 'Could not locate project request with those credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRequest || !clientMessageText.trim()) return;

    setIsSendingMessage(true);
    try {
      const res = await api.postCustomRequestMessage(
        customRequest.requestId,
        clientMessageText.trim(),
        tokenInput || customRequest.clientAccessToken
      );

      // Append new message locally
      setCustomRequest((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, res.message],
        };
      });

      setClientMessageText('');
      showToast('Message sent to studio engineering team.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send message.', 'error');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const activeQuotation = quotations.find((q) => q.status === 'offered') || quotations[0];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5" />
            Client Private Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Customer Project & Quotation Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track architectural review, review formal negotiated quotations, interact with project leads, and settle milestone agreements.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('custom-request')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-cyan-400 hover:bg-cyan-300 transition shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Custom Request</span>
        </button>
      </div>

      {/* Lookup Bar if not loaded or to switch requests */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-8 backdrop-blur-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
        >
          <div className="sm:col-span-5">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Project Request ID <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={requestIdInput}
              onChange={(e) => setRequestIdInput(e.target.value)}
              placeholder="e.g. CPR-2026-X8N9K"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono uppercase focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Client Access Token or Email
            </label>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste Access Token (or enter your email)"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>{isLoading ? 'Loading...' : 'Access Project'}</span>
            </button>
          </div>
        </form>

        {errorMessage && (
          <p className="mt-3 text-xs text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errorMessage}
          </p>
        )}
      </div>

      {/* PORTAL CONTENT (When Request is Loaded) */}
      {customRequest ? (
        <div className="space-y-8">
          
          {/* Top Banner: Status & Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-md">
                    {customRequest.requestId}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-md border ${
                      STATUS_PROGRESS[customRequest.status]?.color || 'text-slate-300 bg-slate-800 border-slate-700'
                    }`}
                  >
                    {customRequest.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    Category: <strong className="text-slate-200">{customRequest.projectCategory}</strong>
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {customRequest.projectTitle}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Submitted on {new Date(customRequest.createdAt).toLocaleDateString()} by{' '}
                  <span className="text-slate-200 font-medium">{customRequest.customerName}</span>{' '}
                  {customRequest.businessName && `(${customRequest.businessName})`} — {customRequest.country}
                </p>
              </div>

              {/* Status Action CTA */}
              <div className="flex flex-wrap items-center gap-3">
                {activeQuotation && (
                  <button
                    onClick={() => navigateToQuotation(activeQuotation.quotationId, customRequest.clientAccessToken)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 text-slate-950 hover:from-cyan-300 hover:to-indigo-200 shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Formal Quotation ({activeQuotation.quotationId})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {linkedOrder && (
                  <button
                    onClick={() => setConfirmedOrder(linkedOrder, customRequest.clientAccessToken)}
                    className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Active Milestone Order ({linkedOrder.orderRef})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Status Progress Stepper */}
            <div className="pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Deal & Engineering Lifecycle Progress
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-center">
                {[
                  { name: '1. Submitted', active: true },
                  {
                    name: '2. Review & Scope',
                    active: !['Submitted'].includes(customRequest.status),
                  },
                  {
                    name: '3. Deal Offered',
                    active: [
                      'Quote Prepared',
                      'Deal Offered',
                      'Accepted by Client',
                      'Awaiting Payment',
                      'Payment Proof Submitted',
                      'Payment Verified',
                      'In Development',
                      'Delivered',
                      'Completed',
                    ].includes(customRequest.status),
                  },
                  {
                    name: '4. Deal Accepted',
                    active: [
                      'Accepted by Client',
                      'Awaiting Payment',
                      'Payment Proof Submitted',
                      'Payment Verified',
                      'In Development',
                      'Delivered',
                      'Completed',
                    ].includes(customRequest.status),
                  },
                  {
                    name: '5. Payment Verified',
                    active: ['Payment Verified', 'In Development', 'Delivered', 'Completed'].includes(customRequest.status),
                  },
                  {
                    name: '6. In Dev / Done',
                    active: ['In Development', 'Delivered', 'Completed'].includes(customRequest.status),
                  },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition ${
                      step.active
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    {step.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ATTENTION BANNER: If More Information Required */}
          {customRequest.status === 'More Information Required' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Engineering Clarification Requested
                </h4>
                <p className="text-xs text-amber-200/90 mt-1">
                  Our architecture team needs additional information before finalizing the formal project quotation. Please review the engineering message below and reply in the message thread.
                </p>
              </div>
            </div>
          )}

          {/* QUOTATION HIGHLIGHT CARD (If quotation offered) */}
          {activeQuotation && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Formal Negotiated Quotation Available ({activeQuotation.quotationId})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Version {activeQuotation.version} • Published {new Date(activeQuotation.createdAt).toLocaleDateString()} • Offer valid until {activeQuotation.expiryDate}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Total Agreed Price</p>
                  <p className="text-2xl font-black text-cyan-400">
                    ${activeQuotation.totalPriceUSD.toLocaleString()} <span className="text-xs text-slate-400 font-normal">USD</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Milestones</p>
                  <p className="font-semibold text-white">{activeQuotation.paymentSchedule.length} Structured Payment Milestones</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    First deposit: ${activeQuotation.paymentSchedule[0]?.amountUSD?.toLocaleString()} ({activeQuotation.paymentSchedule[0]?.percentage}%)
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Timeline & Roadmap</p>
                  <p className="font-semibold text-white">{activeQuotation.deliveryTimeline}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{activeQuotation.revisionPolicy}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Status</p>
                  <p className="font-semibold capitalize text-emerald-400">{activeQuotation.status}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {activeQuotation.status === 'accepted' ? 'Formally accepted by client' : 'Ready for client acceptance'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-400">
                  Review complete deliverables, milestone percentages, exclusions, and legally binding terms.
                </p>
                <button
                  onClick={() => navigateToQuotation(activeQuotation.quotationId, customRequest.clientAccessToken)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition flex items-center justify-center gap-1.5"
                >
                  <span>Open Full Quotation Document</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TWO COLUMN WORKSPACE: Project Specs & Live Discussion */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left 7 Columns: Complete Project Specs */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Detailed Scope & Problem */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Project Specification Brief
                </h3>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Project Description</p>
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    {customRequest.projectDescription}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Business Problem Being Solved</p>
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    {customRequest.businessProblem}
                  </p>
                </div>

                {/* Features Tag Grid */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Required Features & Modules ({customRequest.requiredFeatures.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {customRequest.requiredFeatures.map((f, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-cyan-300 text-xs"
                      >
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <p className="text-[10px] uppercase font-semibold text-slate-500">Preferred Tech</p>
                    <p className="text-slate-200 font-medium mt-0.5">{customRequest.preferredTech || 'Studio Recommended'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <p className="text-[10px] uppercase font-semibold text-slate-500">User Roles & Views</p>
                    <p className="text-slate-200 font-medium mt-0.5">{customRequest.userRolesAndDashboards || 'Standard'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <p className="text-[10px] uppercase font-semibold text-slate-500">Integrations</p>
                    <p className="text-slate-200 font-medium mt-0.5">{customRequest.thirdPartyIntegrations || 'Standard REST APIs'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <p className="text-[10px] uppercase font-semibold text-slate-500">Budget Range</p>
                    <p className="text-cyan-400 font-medium mt-0.5">{customRequest.budgetRangeUSD}</p>
                  </div>
                </div>

                {/* Attachments */}
                {customRequest.attachments && customRequest.attachments.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Secure Attachments ({customRequest.attachments.length})
                    </p>
                    <div className="space-y-2">
                      {customRequest.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={`${att.fileUrl}?token=${customRequest.clientAccessToken}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/60 border border-slate-800 text-xs text-slate-300 transition group"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Download className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition shrink-0" />
                            <span className="truncate">{att.originalName}</span>
                            <span className="text-[10px] text-slate-500 shrink-0">
                              ({(att.sizeBytes / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                          </div>
                          <span className="text-[11px] text-cyan-400 font-medium">Download</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Columns: Interactive Discussion & Support */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col h-[560px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Architecture Conversation
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {customRequest.messages?.length || 0} messages
                  </span>
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                  {customRequest.messages && customRequest.messages.length > 0 ? (
                    customRequest.messages.map((msg) => {
                      const isAdmin = msg.sender === 'admin';
                      return (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-2xl border ${
                            isAdmin
                              ? 'bg-slate-950 border-cyan-500/30 ml-4 text-slate-200'
                              : 'bg-slate-800/60 border-slate-700 mr-4 text-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`font-semibold text-[11px] ${isAdmin ? 'text-cyan-400' : 'text-slate-300'}`}>
                              {msg.senderName} {isAdmin && '• Studio Lead'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="whitespace-pre-line leading-relaxed">{msg.message}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-xs text-center">
                      No messages yet. Send a question below.
                    </div>
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={clientMessageText}
                      onChange={(e) => setClientMessageText(e.target.value)}
                      placeholder="Type message or reply to architect..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      disabled={isSendingMessage || !clientMessageText.trim()}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs bg-cyan-400 hover:bg-cyan-300 text-slate-950 disabled:opacity-50 transition flex items-center gap-1.5 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingMessage ? 'Sending...' : 'Send'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Security & Client Credentials Notice */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
                <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  Your Project Access Link
                </p>
                <p className="text-[11px] text-slate-500 break-all font-mono">
                  {window.location.origin}/#client-portal?requestId={customRequest.requestId}&token={customRequest.clientAccessToken}
                </p>
                <p className="text-[10px] text-slate-500">
                  Bookmark this link for instant access to your private quotation and project tracking.
                </p>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-slate-700">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Access Your Custom Project Portal</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
            Enter your Project Request ID (e.g. <span className="font-mono text-cyan-400">CPR-2026-X8N9K</span>) and your access token or email in the search bar above to view architectural review status, formal quotations, and messages.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setCurrentPage('custom-request')}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition"
            >
              Submit a New Project Brief
            </button>
            <button
              onClick={() => setCurrentPage('home')}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-white transition border border-slate-700"
            >
              Return Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
