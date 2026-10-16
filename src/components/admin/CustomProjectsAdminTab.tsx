import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  CustomProjectRequest,
  ProjectQuotation,
  Order,
  Milestone,
  PaymentProof,
  CustomProjectStatus,
} from '../../types';
import {
  Sparkles,
  Layers,
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  Edit2,
  Download,
  Send,
  Lock,
  Calculator,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Building2,
  Calendar,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface CustomProjectsAdminTabProps {
  customRequests: CustomProjectRequest[];
  orders: Order[];
  onRefresh: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const ALL_STATUSES: CustomProjectStatus[] = [
  'Submitted',
  'Under Review',
  'More Information Required',
  'Quote Prepared',
  'Deal Offered',
  'Accepted by Client',
  'Awaiting Payment',
  'Payment Proof Submitted',
  'Payment Verified',
  'In Development',
  'Delivered',
  'Completed',
  'Declined',
  'Cancelled',
];

export const CustomProjectsAdminTab: React.FC<CustomProjectsAdminTabProps> = ({
  customRequests,
  orders,
  onRefresh,
  showToast,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected request for deep inspection & operations
  const [selectedRequest, setSelectedRequest] = useState<CustomProjectRequest | null>(null);
  const [activeQuotation, setActiveQuotation] = useState<ProjectQuotation | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Status Change State
  const [statusInput, setStatusInput] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Private Internal Note State
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Ask More Info State
  const [showAskInfoModal, setShowAskInfoModal] = useState(false);
  const [askInfoMessage, setAskInfoMessage] = useState('');
  const [isSendingInfoRequest, setIsSendingInfoRequest] = useState(false);

  // Internal Cost Estimate State
  const [estimatedHours, setEstimatedHours] = useState<string>('80');
  const [laborCostUSD, setLaborCostUSD] = useState<string>('4000');
  const [infraCostUSD, setInfraCostUSD] = useState<string>('500');
  const [contingencyPercent, setContingencyPercent] = useState<string>('20');
  const [estimateNotes, setEstimateNotes] = useState('');
  const [isSavingEstimate, setIsSavingEstimate] = useState(false);

  // Formal Quotation Builder Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [isRevisingQuote, setIsRevisingQuote] = useState(false);
  const [quoteTitle, setQuoteTitle] = useState('');
  const [quoteScope, setQuoteScope] = useState('');
  const [quoteDeliverables, setQuoteDeliverables] = useState<string[]>([]);
  const [newDeliverableInput, setNewDeliverableInput] = useState('');
  const [quoteExclusions, setQuoteExclusions] = useState<string[]>([]);
  const [newExclusionInput, setNewExclusionInput] = useState('');
  const [quoteTotalPriceUSD, setQuoteTotalPriceUSD] = useState<string>('7500');
  const [quoteMilestones, setQuoteMilestones] = useState<
    Array<{ title: string; description: string; percentage: number; amountUSD: number }>
  >([
    { title: 'Milestone 1: Architectural Blueprint & UX', description: 'System specs, database schema, and high-fidelity clickable UI prototypes.', percentage: 40, amountUSD: 3000 },
    { title: 'Milestone 2: Core Engineering & Integrations', description: 'Backend APIs, database models, business logic workflows, and staging deployment.', percentage: 40, amountUSD: 3000 },
    { title: 'Milestone 3: QA, Security Audit & Production Release', description: 'Penetration tests, load tests, domain provisioning, and client hand-off.', percentage: 20, amountUSD: 1500 },
  ]);
  const [quoteTimeline, setQuoteTimeline] = useState('4–6 Weeks Milestone Delivery');
  const [quoteRevisions, setQuoteRevisions] = useState('3 Revision Rounds per Milestone');
  const [quoteMaintenance, setQuoteMaintenance] = useState('60 Days Critical Bug-Fix Warranty Post-Deployment');
  const [quoteThirdPartyCosts, setQuoteThirdPartyCosts] = useState('Client supplies domain & cloud credentials; database managed by studio.');
  const [quoteExpiryDate, setQuoteExpiryDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [quoteCancellationTerms, setQuoteCancellationTerms] = useState(
    'Milestone deposits become non-refundable once engineering sprints commence. Deliverables of settled milestones belong exclusively to the client.'
  );
  const [revisionSummary, setRevisionSummary] = useState('');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  // Milestone Payment Verification State
  const [verifyingOrderRef, setVerifyingOrderRef] = useState<string>('');
  const [verifyingMilestoneId, setVerifyingMilestoneId] = useState<string>('');
  const [verifyingProof, setVerifyingProof] = useState<PaymentProof | null>(null);
  const [milestoneVerifiedAmount, setMilestoneVerifiedAmount] = useState<string>('');
  const [milestoneVerificationNotes, setMilestoneVerificationNotes] = useState('');
  const [milestoneRejectionReason, setMilestoneRejectionReason] = useState('');
  const [isProcessingMilestone, setIsProcessingMilestone] = useState(false);

  // Sync selected request when customRequests updates
  useEffect(() => {
    if (selectedRequest) {
      const refreshed = customRequests.find((r) => r.requestId === selectedRequest.requestId);
      if (refreshed) {
        setSelectedRequest(refreshed);
      }
    }
  }, [customRequests]);

  // Load detailed request & quotations
  const handleSelectRequest = async (req: CustomProjectRequest) => {
    setIsLoadingDetails(true);
    try {
      const data = await api.getCustomRequest(req.requestId);
      setSelectedRequest(data.customRequest);
      setStatusInput(data.customRequest.status);

      if (data.quotations && data.quotations.length > 0) {
        setActiveQuotation(data.quotations[0]);
      } else {
        setActiveQuotation(null);
      }

      // Initialize estimates if present
      if (data.customRequest.internalEstimates) {
        setEstimatedHours(String(data.customRequest.internalEstimates.estimatedHours || 80));
        setLaborCostUSD(String(data.customRequest.internalEstimates.laborCostUSD || 4000));
        setInfraCostUSD(String(data.customRequest.internalEstimates.infrastructureCostUSD || 500));
        setContingencyPercent(String(data.customRequest.internalEstimates.contingencyMarginPercent || 20));
        setEstimateNotes(data.customRequest.internalEstimates.notes || '');
      } else {
        setEstimatedHours('80');
        setLaborCostUSD('4000');
        setInfraCostUSD('500');
        setContingencyPercent('20');
        setEstimateNotes('');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load request details', 'error');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Filter requests
  const filteredRequests = customRequests.filter((req) => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      req.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate suggested quote from estimate inputs
  const calculatedLabor = parseFloat(laborCostUSD) || 0;
  const calculatedInfra = parseFloat(infraCostUSD) || 0;
  const calculatedMargin = parseFloat(contingencyPercent) || 0;
  const baseTotal = calculatedLabor + calculatedInfra;
  const suggestedTotal = Math.round(baseTotal * (1 + calculatedMargin / 100));

  // Save Internal Estimate
  const handleSaveInternalEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsSavingEstimate(true);
    try {
      await api.saveAdminInternalEstimate(selectedRequest.requestId, {
        estimatedHours: parseFloat(estimatedHours) || 0,
        laborCostUSD: calculatedLabor,
        infrastructureCostUSD: calculatedInfra,
        contingencyMarginPercent: calculatedMargin,
        suggestedQuotePriceUSD: suggestedTotal,
        notes: estimateNotes,
      });

      showToast('Internal cost estimates saved. (Private to staff)', 'success');
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save estimate', 'error');
    } finally {
      setIsSavingEstimate(false);
    }
  };

  // Add Internal Staff Note
  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !internalNoteInput.trim()) return;

    setIsSavingNote(true);
    try {
      const res = await api.addAdminInternalNote(selectedRequest.requestId, internalNoteInput.trim());
      setSelectedRequest((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          internalNotes: [res.note, ...(prev.internalNotes || [])],
        };
      });
      setInternalNoteInput('');
      showToast('Internal note recorded.', 'success');
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save note', 'error');
    } finally {
      setIsSavingNote(false);
    }
  };

  // Send Inquiry to Client (More Information Required)
  const handleSendAskInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !askInfoMessage.trim()) return;

    setIsSendingInfoRequest(true);
    try {
      await api.askClientMoreInfo(selectedRequest.requestId, askInfoMessage.trim());
      showToast('Inquiry sent to client. Request status updated to "More Information Required".', 'success');
      setShowAskInfoModal(false);
      setAskInfoMessage('');
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to send inquiry', 'error');
    } finally {
      setIsSendingInfoRequest(false);
    }
  };

  // Update Status
  const handleUpdateStatus = async () => {
    if (!selectedRequest || !statusInput) return;

    setIsUpdatingStatus(true);
    try {
      await api.updateCustomRequestStatus(selectedRequest.requestId, statusInput, statusNote);
      showToast(`Request status updated to "${statusInput}".`, 'success');
      setStatusNote('');
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Open Quotation Builder
  const handleOpenQuotationBuilder = (revise: boolean = false) => {
    if (!selectedRequest) return;
    setIsRevisingQuote(revise);

    if (revise && activeQuotation) {
      setQuoteTitle(activeQuotation.projectTitle);
      setQuoteScope(activeQuotation.agreedScope);
      setQuoteDeliverables([...activeQuotation.deliverables]);
      setQuoteExclusions([...activeQuotation.excludedFeatures]);
      setQuoteTotalPriceUSD(String(activeQuotation.totalPriceUSD));
      setQuoteMilestones(
        activeQuotation.paymentSchedule.map((m) => ({
          title: m.title,
          description: m.description,
          percentage: m.percentage,
          amountUSD: m.amountUSD,
        }))
      );
      setQuoteTimeline(activeQuotation.deliveryTimeline);
      setQuoteRevisions(activeQuotation.revisionPolicy);
      setQuoteMaintenance(activeQuotation.maintenanceTerms);
      setQuoteThirdPartyCosts(activeQuotation.thirdPartyCostsNote || '');
      setQuoteExpiryDate(activeQuotation.expiryDate);
      setQuoteCancellationTerms(activeQuotation.cancellationAndRefundTerms);
      setRevisionSummary(`Version ${activeQuotation.version + 1} revisions to milestone schedule.`);
    } else {
      setQuoteTitle(selectedRequest.projectTitle);
      setQuoteScope(
        `Development of ${selectedRequest.projectTitle} for ${selectedRequest.customerName}.\n` +
          `Key deliverables include: ${selectedRequest.requiredFeatures.join(', ')}.\n` +
          `Target platform will solve: ${selectedRequest.businessProblem}.`
      );
      setQuoteDeliverables(
        selectedRequest.requiredFeatures.length > 0
          ? [...selectedRequest.requiredFeatures]
          : ['Custom Responsive Frontend (React/TS)', 'Secure REST/GraphQL API Backend', 'Relational PostgreSQL Database']
      );
      setQuoteExclusions([
        'Third-party cloud infrastructure subscription fees (AWS/GCP/Domain)',
        'Ongoing manual content entry beyond initial launch migration',
      ]);
      setQuoteTotalPriceUSD(String(suggestedTotal > 1500 ? suggestedTotal : 7500));
      const parsedTotal = suggestedTotal > 1500 ? suggestedTotal : 7500;
      setQuoteMilestones([
        {
          title: 'Milestone 1: Architectural Blueprint & Clickable Prototypes',
          description: 'Database schema, API specifications, and high-fidelity interactive wireframes.',
          percentage: 40,
          amountUSD: Math.round(parsedTotal * 0.4),
        },
        {
          title: 'Milestone 2: Core Engineering & Service Integrations',
          description: 'Full backend development, user role dashboards, and staging environment test release.',
          percentage: 40,
          amountUSD: Math.round(parsedTotal * 0.4),
        },
        {
          title: 'Milestone 3: Security Hardening & Production Handover',
          description: 'Penetration testing, load verification, production deployment, and client handover.',
          percentage: 20,
          amountUSD: Math.round(parsedTotal * 0.2),
        },
      ]);
      setQuoteTimeline('4–6 Weeks Milestone Delivery');
      setQuoteRevisions('3 Revision Rounds per Milestone');
      setQuoteMaintenance('60 Days Critical Bug-Fix Warranty Post-Deployment');
      setQuoteThirdPartyCosts('Client provides domain & cloud billing credentials.');
      setQuoteExpiryDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
      setQuoteCancellationTerms(
        'Milestone deposits become non-refundable once engineering sprints commence. Deliverables of settled milestones belong exclusively to the client.'
      );
      setRevisionSummary('');
    }

    setShowQuoteModal(true);
  };

  // Submit Quotation (New or Revision)
  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const parsedPrice = parseFloat(quoteTotalPriceUSD);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showToast('Please enter a valid positive agreed price.', 'error');
      return;
    }

    const milestoneSum = quoteMilestones.reduce((sum, m) => sum + (parseFloat(String(m.amountUSD)) || 0), 0);
    if (Math.abs(milestoneSum - parsedPrice) > 1.0) {
      showToast(
        `Milestone total ($${milestoneSum.toLocaleString()}) must match the total agreed price ($${parsedPrice.toLocaleString()}).`,
        'error'
      );
      return;
    }

    setIsSubmittingQuote(true);
    try {
      if (isRevisingQuote && activeQuotation) {
        const res = await api.reviseQuotation(activeQuotation.quotationId, {
          projectTitle: quoteTitle.trim(),
          agreedScope: quoteScope.trim(),
          deliverables: quoteDeliverables,
          excludedFeatures: quoteExclusions,
          totalPriceUSD: parsedPrice,
          paymentSchedule: quoteMilestones,
          deliveryTimeline: quoteTimeline.trim(),
          revisionPolicy: quoteRevisions.trim(),
          maintenanceTerms: quoteMaintenance.trim(),
          thirdPartyCostsNote: quoteThirdPartyCosts.trim(),
          expiryDate: quoteExpiryDate,
          cancellationAndRefundTerms: quoteCancellationTerms.trim(),
          changeSummary: revisionSummary.trim() || `Version ${activeQuotation.version + 1} revisions.`,
        });

        setActiveQuotation(res.quotation);
        showToast(`Quotation revised to Version ${res.quotation.version}.`, 'success');
      } else {
        const res = await api.createQuotation(selectedRequest.requestId, {
          projectTitle: quoteTitle.trim(),
          agreedScope: quoteScope.trim(),
          deliverables: quoteDeliverables,
          excludedFeatures: quoteExclusions,
          totalPriceUSD: parsedPrice,
          paymentSchedule: quoteMilestones,
          deliveryTimeline: quoteTimeline.trim(),
          revisionPolicy: quoteRevisions.trim(),
          maintenanceTerms: quoteMaintenance.trim(),
          thirdPartyCostsNote: quoteThirdPartyCosts.trim(),
          expiryDate: quoteExpiryDate,
          cancellationAndRefundTerms: quoteCancellationTerms.trim(),
        });

        setActiveQuotation(res.quotation);
        showToast(`Formal Quotation ${res.quotation.quotationId} published to client!`, 'success');
      }

      setShowQuoteModal(false);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit quotation', 'error');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  // Milestone Payment Verification Handlers
  const handleVerifyMilestoneProof = async () => {
    if (!verifyingOrderRef || !verifyingMilestoneId || !verifyingProof) return;

    setIsProcessingMilestone(true);
    try {
      await api.verifyMilestoneProof(
        verifyingOrderRef,
        verifyingMilestoneId,
        verifyingProof.id,
        milestoneVerifiedAmount ? parseFloat(milestoneVerifiedAmount) : undefined,
        milestoneVerificationNotes
      );

      showToast('Milestone payment successfully verified! Project advanced.', 'success');
      setVerifyingProof(null);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Milestone verification failed', 'error');
    } finally {
      setIsProcessingMilestone(false);
    }
  };

  const handleRejectMilestoneProof = async (isCorrection: boolean) => {
    if (!verifyingOrderRef || !verifyingMilestoneId || !verifyingProof) return;
    if (!milestoneRejectionReason.trim()) {
      showToast('Please state a reason for rejection or correction request.', 'error');
      return;
    }

    setIsProcessingMilestone(true);
    try {
      await api.rejectMilestoneProof(
        verifyingOrderRef,
        verifyingMilestoneId,
        verifyingProof.id,
        milestoneRejectionReason.trim(),
        isCorrection
      );

      showToast(isCorrection ? 'Correction requested from client.' : 'Milestone proof rejected.', 'info');
      setVerifyingProof(null);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Milestone action failed', 'error');
    } finally {
      setIsProcessingMilestone(false);
    }
  };

  // Find linked order for selected request
  const linkedOrder = orders.find(
    (o) => o.linkedCustomRequestId === selectedRequest?.requestId || o.orderRef === selectedRequest?.linkedOrderRef
  );

  return (
    <div className="space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Custom Projects & Negotiated Deals Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review bespoke enterprise requests, calculate development costs, issue formal binding quotations, and verify milestone bank transfers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            Total Requests: <strong className="text-cyan-400">{customRequests.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs text-slate-400 whitespace-nowrap">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Statuses ({customRequests.length})</option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st} ({customRequests.filter((r) => r.status === st).length})
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Request ID, title, or client..."
            className="w-full px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Main Request Grid / List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Requests List (4 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
              No custom project requests found matching criteria.
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isSelected = selectedRequest?.requestId === req.requestId;
              return (
                <div
                  key={req.requestId}
                  onClick={() => handleSelectRequest(req)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                      {req.requestId}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase border ${
                        req.status === 'Payment Verified'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : req.status === 'Deal Offered'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          : req.status === 'More Information Required'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                    {req.projectTitle}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {req.customerName} • {req.country}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800/80">
                    <span>Budget: <strong className="text-slate-300">{req.budgetRangeUSD}</strong></span>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Management Inspector (7 cols) */}
        <div className="lg:col-span-7">
          {selectedRequest ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded">
                      {selectedRequest.requestId}
                    </span>
                    <span className="text-xs text-slate-400">
                      {selectedRequest.projectCategory}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{selectedRequest.projectTitle}</h3>
                  <p className="text-xs text-slate-400">
                    Client: <strong className="text-slate-200">{selectedRequest.customerName}</strong> ({selectedRequest.email}) — {selectedRequest.country}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenQuotationBuilder(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{activeQuotation ? 'View / Edit Quote' : 'Prepare Formal Quote'}</span>
                  </button>
                </div>
              </div>

              {/* Status Update Strip */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-slate-400 font-medium">Status:</span>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Audit reason / note..."
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500"
                  />
                  <button
                    onClick={handleUpdateStatus}
                    disabled={isUpdatingStatus || statusInput === selectedRequest.status}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 transition"
                  >
                    Update
                  </button>
                </div>
              </div>

              {/* Full Project Specifications Accordion / Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Client Project Specifications
                </h4>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                  <p className="font-semibold text-slate-300">Detailed Description:</p>
                  <p className="text-slate-400 whitespace-pre-line">{selectedRequest.projectDescription}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                  <p className="font-semibold text-slate-300">Business Problem to Solve:</p>
                  <p className="text-slate-400 whitespace-pre-line">{selectedRequest.businessProblem}</p>
                </div>

                {/* Features & Modules */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                  <p className="font-semibold text-slate-300">Requested Features ({selectedRequest.requiredFeatures.length}):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRequest.requiredFeatures.map((f, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 text-[11px]">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Architectural Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Preferred Tech</span>
                    <span className="font-medium text-slate-200">{selectedRequest.preferredTech || 'Studio Choice'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">User Roles</span>
                    <span className="font-medium text-slate-200">{selectedRequest.userRolesAndDashboards || 'Standard'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Client Budget</span>
                    <span className="font-bold text-cyan-400">{selectedRequest.budgetRangeUSD}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Target Launch</span>
                    <span className="font-medium text-slate-200">{selectedRequest.targetLaunchDate || 'Flexible'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Scalability</span>
                    <span className="font-medium text-slate-200">{selectedRequest.trafficAndScalability || 'Standard'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Design Style</span>
                    <span className="font-medium text-slate-200 truncate block">{selectedRequest.designStylePreference || 'Modern'}</span>
                  </div>
                </div>

                {/* Attachments */}
                {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                    <p className="font-semibold text-slate-300">Client Attachments ({selectedRequest.attachments.length}):</p>
                    <div className="space-y-1.5">
                      {selectedRequest.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={`${att.fileUrl}?token=${selectedRequest.clientAccessToken}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800"
                        >
                          <span className="truncate">{att.originalName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {(att.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* INTERNAL COST ESTIMATE CALCULATOR (Staff Only) */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                      Internal Cost & Engineering Estimator
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                    Staff Only — Hidden From Client
                  </span>
                </div>

                <form onSubmit={handleSaveInternalEstimate} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Estimated Hours</label>
                      <input
                        type="number"
                        value={estimatedHours}
                        onChange={(e) => setEstimatedHours(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Labor Cost (USD)</label>
                      <input
                        type="number"
                        value={laborCostUSD}
                        onChange={(e) => setLaborCostUSD(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Infra / Tooling ($)</label>
                      <input
                        type="number"
                        value={infraCostUSD}
                        onChange={(e) => setInfraCostUSD(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Margin (%)</label>
                      <input
                        type="number"
                        value={contingencyPercent}
                        onChange={(e) => setContingencyPercent(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Internal Architecture Notes</label>
                    <input
                      type="text"
                      value={estimateNotes}
                      onChange={(e) => setEstimateNotes(e.target.value)}
                      placeholder="e.g. Requires 2 senior engineers for 3 sprints..."
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-[11px] text-slate-400">Suggested Quote: </span>
                      <strong className="text-cyan-400 font-mono text-sm">
                        ${suggestedTotal.toLocaleString()} USD
                      </strong>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingEstimate}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-400 text-white transition disabled:opacity-50"
                    >
                      {isSavingEstimate ? 'Saving...' : 'Save Internal Estimate'}
                    </button>
                  </div>
                </form>
              </div>

              {/* ACTIVE QUOTATION SECTION */}
              {activeQuotation && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                        Formal Quotation: {activeQuotation.quotationId} (v{activeQuotation.version}.0)
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase border ${
                          activeQuotation.status === 'accepted'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-cyan-300 border-slate-700'
                        }`}
                      >
                        {activeQuotation.status}
                      </span>
                      {activeQuotation.status !== 'accepted' && (
                        <button
                          onClick={() => handleOpenQuotationBuilder(true)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                        >
                          Revise (v{activeQuotation.version + 1})
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Agreed Price</span>
                      <strong className="text-white font-mono text-sm">${activeQuotation.totalPriceUSD.toLocaleString()} USD</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Milestones</span>
                      <strong className="text-slate-200">{activeQuotation.paymentSchedule.length} Phases</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Offer Expiry</span>
                      <strong className="text-amber-400">{activeQuotation.expiryDate}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Accepted</span>
                      <strong className={activeQuotation.acceptedByClient ? 'text-emerald-400' : 'text-slate-500'}>
                        {activeQuotation.acceptedByClient ? 'Yes (Digitally Signed)' : 'Pending'}
                      </strong>
                    </div>
                  </div>

                  {/* Version History */}
                  {activeQuotation.versionHistory && activeQuotation.versionHistory.length > 1 && (
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 space-y-1">
                      <p className="font-semibold text-slate-300">Quotation Revision History:</p>
                      {activeQuotation.versionHistory.map((vh, i) => (
                        <div key={i} className="flex justify-between font-mono text-[10px] text-slate-400">
                          <span>Version {vh.version}: ${vh.totalPriceUSD.toLocaleString()} USD — {vh.changeSummary}</span>
                          <span>{new Date(vh.updatedAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* MILESTONE PAYMENTS & ORDER VERIFICATION */}
              {linkedOrder && linkedOrder.milestones && linkedOrder.milestones.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Milestone Payments for Order: {linkedOrder.orderRef}
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">
                      Total Paid: ${linkedOrder.totalPaid || 0} / ${linkedOrder.packagePrice} USD
                    </span>
                  </div>

                  <div className="space-y-3">
                    {linkedOrder.milestones.map((ms, idx) => {
                      const proof = linkedOrder.proofs?.find((p) => p.milestoneId === ms.id) || linkedOrder.proofs?.[0];
                      const hasProof = !!proof;
                      return (
                        <div
                          key={ms.id || idx}
                          className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{ms.title}</span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                                  ms.status === 'payment_verified'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : ms.status === 'proof_submitted'
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {ms.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {ms.description} • Amount: <strong className="text-cyan-400 font-mono">${ms.amountUSD.toLocaleString()} USD</strong> ({ms.percentage}%)
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {hasProof && ms.status !== 'payment_verified' && (
                              <button
                                onClick={() => {
                                  setVerifyingOrderRef(linkedOrder.orderRef);
                                  setVerifyingMilestoneId(ms.id);
                                  setVerifyingProof(proof);
                                  setMilestoneVerifiedAmount(String(ms.amountUSD));
                                  setMilestoneVerificationNotes('');
                                  setMilestoneRejectionReason('');
                                }}
                                className="px-3 py-1.5 rounded-lg font-bold text-xs bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition"
                              >
                                Review Milestone Receipt
                              </button>
                            )}

                            {ms.status === 'payment_verified' && (
                              <span className="text-xs text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PRIVATE STAFF NOTES SECTION */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Private Internal Staff Notes
                  </h4>
                  <span className="text-[10px] text-slate-500">Not visible to client</span>
                </div>

                <form onSubmit={handleAddInternalNote} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={internalNoteInput}
                    onChange={(e) => setInternalNoteInput(e.target.value)}
                    placeholder="Add internal confidential observation..."
                    className="flex-1 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={isSavingNote || !internalNoteInput.trim()}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                  >
                    {isSavingNote ? 'Saving...' : 'Add Note'}
                  </button>
                </form>

                <div className="space-y-2 max-h-40 overflow-y-auto text-xs">
                  {selectedRequest.internalNotes && selectedRequest.internalNotes.length > 0 ? (
                    selectedRequest.internalNotes.map((note) => (
                      <div key={note.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                          <span className="font-semibold text-slate-300">{note.author}</span>
                          <span>{new Date(note.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-300">{note.note}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No internal notes yet.</p>
                  )}
                </div>
              </div>

              {/* ACTIONS STRIP */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setShowAskInfoModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask Client for More Information</span>
                </button>

                <div className="text-xs text-slate-500">
                  Client Access Token: <strong className="font-mono text-slate-400">{selectedRequest.clientAccessToken.substring(0, 10)}...</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 bg-slate-900/30 border border-slate-800 rounded-3xl text-center text-xs text-slate-500">
              Select a custom project request from the left list to review specifications, calculate estimates, prepare formal quotations, or verify milestone payments.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: FORMAL QUOTATION BUILDER & REVISION MODAL */}
      {showQuoteModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  {isRevisingQuote ? 'Revise Project Quotation' : 'Prepare Formal Project Quotation'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Request: {selectedRequest.requestId} • Client: {selectedRequest.customerName} ({selectedRequest.country})
                </p>
              </div>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitQuotation} className="space-y-5 text-xs">
              
              {isRevisingQuote && (
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                  <label className="block text-xs font-semibold text-indigo-300 mb-1">
                    Summary of Changes for Version History <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={revisionSummary}
                    onChange={(e) => setRevisionSummary(e.target.value)}
                    placeholder="e.g. Revised Milestone 2 delivery timeline and added API documentation sprint..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Project Deal Title</label>
                  <input
                    type="text"
                    required
                    value={quoteTitle}
                    onChange={(e) => setQuoteTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Total Agreed Price (USD) <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={quoteTotalPriceUSD}
                    onChange={(e) => setQuoteTotalPriceUSD(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm font-bold text-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Agreed Engineering Scope & Architecture</label>
                <textarea
                  rows={3}
                  required
                  value={quoteScope}
                  onChange={(e) => setQuoteScope(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs leading-relaxed"
                />
              </div>

              {/* Deliverables List Builder */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contract Deliverables</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newDeliverableInput}
                    onChange={(e) => setNewDeliverableInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newDeliverableInput.trim()) {
                          setQuoteDeliverables((prev) => [...prev, newDeliverableInput.trim()]);
                          setNewDeliverableInput('');
                        }
                      }
                    }}
                    placeholder="Add deliverable (e.g. Complete source code repository with Docker setup)..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newDeliverableInput.trim()) {
                        setQuoteDeliverables((prev) => [...prev, newDeliverableInput.trim()]);
                        setNewDeliverableInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quoteDeliverables.map((item, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-300 text-[11px]">
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => setQuoteDeliverables((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-slate-500 hover:text-red-400 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Milestones Payment Schedule Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Milestone Payment Roadmap (Must sum to ${parseFloat(quoteTotalPriceUSD) || 0} USD)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setQuoteMilestones((prev) => [
                        ...prev,
                        {
                          title: `Milestone ${prev.length + 1}`,
                          description: 'Sprint deliverables and testing acceptance.',
                          percentage: 20,
                          amountUSD: 1000,
                        },
                      ]);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
                  >
                    + Add Milestone Phase
                  </button>
                </div>

                <div className="space-y-2">
                  {quoteMilestones.map((ms, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={ms.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuoteMilestones((prev) =>
                              prev.map((m, i) => (i === idx ? { ...m, title: val } : m))
                            );
                          }}
                          placeholder="Milestone Title"
                          className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={ms.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuoteMilestones((prev) =>
                              prev.map((m, i) => (i === idx ? { ...m, description: val } : m))
                            );
                          }}
                          placeholder="Phase Deliverables"
                          className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={ms.amountUSD}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const totalPrice = parseFloat(quoteTotalPriceUSD) || 1;
                            setQuoteMilestones((prev) =>
                              prev.map((m, i) =>
                                i === idx
                                  ? { ...m, amountUSD: val, percentage: Math.round((val / totalPrice) * 100) }
                                  : m
                              )
                            );
                          }}
                          placeholder="Amount ($)"
                          className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 font-bold"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {quoteMilestones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setQuoteMilestones((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-red-400"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline & Legal Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Delivery Timeline</label>
                  <input
                    type="text"
                    value={quoteTimeline}
                    onChange={(e) => setQuoteTimeline(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Revision Guarantee</label>
                  <input
                    type="text"
                    value={quoteRevisions}
                    onChange={(e) => setQuoteRevisions(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Offer Expiry Date</label>
                  <input
                    type="date"
                    value={quoteExpiryDate}
                    onChange={(e) => setQuoteExpiryDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition disabled:opacity-50"
                >
                  {isSubmittingQuote
                    ? 'Publishing Quotation...'
                    : isRevisingQuote
                    ? 'Save & Publish Revision'
                    : 'Publish Quotation to Client Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASK CLIENT FOR MORE INFO */}
      {showAskInfoModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              Request Clarification from Client
            </h3>
            <p className="text-xs text-slate-400">
              This message will be dispatched directly to {selectedRequest.customerName}'s customer portal thread and set the project status to "More Information Required".
            </p>

            <form onSubmit={handleSendAskInfo} className="space-y-4">
              <textarea
                rows={4}
                required
                value={askInfoMessage}
                onChange={(e) => setAskInfoMessage(e.target.value)}
                placeholder="e.g. Could you clarify whether your multi-vendor marketplace requires split payments or single unified checkout? Also, please share any preferred payment gateways for your region."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs leading-relaxed focus:outline-none focus:border-cyan-400"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAskInfoModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingInfoRequest}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 disabled:opacity-50"
                >
                  {isSendingInfoRequest ? 'Sending...' : 'Send to Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MILESTONE PAYMENT VERIFICATION */}
      {verifyingProof && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Verify Milestone Payment Proof
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <p>Order: <strong className="text-cyan-400 font-mono">{verifyingOrderRef}</strong></p>
              <p>Milestone ID: <span className="font-mono text-slate-300">{verifyingMilestoneId}</span></p>
              <p>Reported: {verifyingProof.currency} {verifyingProof.amountTransferred} • TxRef: {verifyingProof.transactionReference}</p>
              <a
                href={verifyingProof.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 underline inline-block pt-1"
              >
                Open Receipt File in New Window ↗
              </a>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Verified Amount Settled (USD)
                </label>
                <input
                  type="number"
                  value={milestoneVerifiedAmount}
                  onChange={(e) => setMilestoneVerifiedAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bank Reference / Verification Statement Notes
                </label>
                <input
                  type="text"
                  value={milestoneVerificationNotes}
                  onChange={(e) => setMilestoneVerificationNotes(e.target.value)}
                  placeholder="e.g. Verified against Askari statement credit line ref #49021"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rejection or Correction Reason (Only if rejecting)
                </label>
                <input
                  type="text"
                  value={milestoneRejectionReason}
                  onChange={(e) => setMilestoneRejectionReason(e.target.value)}
                  placeholder="e.g. Transaction slip incomplete / amount discrepancy"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleVerifyMilestoneProof}
                disabled={isProcessingMilestone}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition"
              >
                Verify Milestone Payment & Start Phase
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleRejectMilestoneProof(true)}
                  disabled={isProcessingMilestone}
                  className="py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20"
                >
                  Request Correction
                </button>
                <button
                  onClick={() => handleRejectMilestoneProof(false)}
                  disabled={isProcessingMilestone}
                  className="py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20"
                >
                  Reject Proof
                </button>
              </div>
              <button
                onClick={() => setVerifyingProof(null)}
                className="w-full py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
