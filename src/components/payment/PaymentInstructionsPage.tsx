import React, { useState, useEffect } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { api } from '../../services/api';
import { Order, PaymentProof, PaymentMethodConfig } from '../../types';
import {
  CreditCard,
  Building2,
  Copy,
  CheckCircle2,
  UploadCloud,
  FileText,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Info,
  RotateCcw,
  Check,
} from 'lucide-react';

export const PaymentInstructionsPage: React.FC = () => {
  const { currentOrder, currentOrderToken, activeOrderLookupRef, showToast, setCurrentPage } = useAgency();

  const [order, setOrder] = useState<Order | null>(currentOrder);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('askari-bank');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Proof form state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [amountTransferred, setAmountTransferred] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [transactionReference, setTransactionReference] = useState<string>('');
  const [customerNote, setCustomerNote] = useState<string>('');

  const targetOrderRef = order?.orderRef || activeOrderLookupRef;

  const fetchOrderDetails = async (ref: string, token?: string) => {
    setIsLoading(true);
    try {
      const data = await api.getOrder(ref, token);
      setOrder(data.order);
      setPaymentMethods(data.paymentMethods);
      if (data.paymentMethods.length > 0 && !selectedMethodId) {
        setSelectedMethodId(data.paymentMethods[0].id);
      }
      setAmountTransferred(String(data.order.packagePrice));
    } catch (err: any) {
      showToast(err.message || 'Unable to retrieve order', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (targetOrderRef) {
      fetchOrderDetails(targetOrderRef, currentOrderToken || undefined);
    }
  }, [targetOrderRef, currentOrderToken]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccessMessage('');

    if (!order) return;

    if (!proofFile) {
      setUploadError('Please select a payment receipt or confirmation slip (JPG, PNG, or PDF).');
      return;
    }

    if (!transactionReference.trim()) {
      setUploadError('Please enter the transaction reference / wire confirmation number.');
      return;
    }

    const parsedAmt = parseFloat(amountTransferred);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      setUploadError('Please enter a valid amount transferred.');
      return;
    }

    const formData = new FormData();
    formData.append('proofFile', proofFile);
    formData.append('paymentMethodId', selectedMethodId);
    formData.append('amountTransferred', String(parsedAmt));
    formData.append('currency', currency);
    formData.append('transferDate', transferDate);
    formData.append('transactionReference', transactionReference.trim());
    if (customerNote) formData.append('customerNote', customerNote.trim());
    if (currentOrderToken) formData.append('clientAccessToken', currentOrderToken);

    setIsUploading(true);
    try {
      const res = await api.uploadPaymentProof(order.orderRef, formData, currentOrderToken || undefined);
      setUploadSuccessMessage(res.message);
      showToast('Payment proof submitted for manual verification!', 'success');
      // Update local order
      setOrder(res.order);
      setProofFile(null);
      setTransactionReference('');
      setCustomerNote('');
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload payment proof. Please try again.');
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // If no order is present
  if (!order && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-20 px-4">
        <div className="max-w-md mx-auto text-center space-y-5 p-8 rounded-2xl bg-slate-900 border border-slate-800">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">No Active Order Selected</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Payment instructions are displayed exclusively for established orders. Please configure your website package first, or enter your Order Reference to track your order.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => setCurrentPage('order')}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition"
            >
              Start New Website Order
            </button>
            <button
              onClick={() => setCurrentPage('track-order')}
              className="w-full py-2.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
            >
              Look Up Existing Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeMethod =
    paymentMethods.find((m) => m.id === selectedMethodId) ||
    paymentMethods[0] ||
    null;

  const activeProof = order?.proofs?.[0];
  const isCorrectionNeeded = activeProof?.verificationStatus === 'correction_requested';
  const isRejected = activeProof?.verificationStatus === 'rejected';
  const isVerified = order?.verificationStatus === 'verified';
  const isPending = order?.verificationStatus === 'pending_review';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Order Status Banner */}
        <div className="mb-10 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Official Order Reference
              </span>
              <button
                onClick={() => copyToClipboard(order?.orderRef || '', 'ref')}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-cyan-400 hover:bg-slate-700 transition"
              >
                <span>{order?.orderRef}</span>
                {copiedKey === 'ref' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {order?.packageName}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Client: <span className="text-slate-200">{order?.customerName}</span> ({order?.email}) • Country: {order?.country}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Total Due:</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                ${order?.packagePrice.toLocaleString()} USD
              </span>
            </div>

            {/* Dynamic Status Badge */}
            <div className="p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold">
              {isVerified ? (
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/40 border-emerald-500/30 p-2 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="block font-bold">Payment Verified</span>
                    <span className="text-[10px] text-emerald-300 font-normal">Project In Progress</span>
                  </div>
                </div>
              ) : isPending ? (
                <div className="flex items-center gap-2 text-amber-400 bg-amber-950/40 border-amber-500/30 p-2 rounded-lg">
                  <Clock className="w-5 h-5 shrink-0 animate-spin" />
                  <div>
                    <span className="block font-bold">Proof Submitted</span>
                    <span className="text-[10px] text-amber-300 font-normal">Awaiting Manual Verification</span>
                  </div>
                </div>
              ) : isCorrectionNeeded ? (
                <div className="flex items-center gap-2 text-rose-400 bg-rose-950/40 border-rose-500/30 p-2 rounded-lg">
                  <RotateCcw className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="block font-bold">Correction Requested</span>
                    <span className="text-[10px] text-rose-300 font-normal">Re-upload Required</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-cyan-400 bg-cyan-950/40 border-cyan-500/30 p-2 rounded-lg">
                  <CreditCard className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="block font-bold">Awaiting Payment</span>
                    <span className="text-[10px] text-cyan-300 font-normal">Pending Bank Transfer</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Correction or Rejection Alert Banner if applicable */}
        {(isCorrectionNeeded || isRejected) && (
          <div className="mb-8 p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs text-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-100">
                {isCorrectionNeeded ? 'Finance Administrator Requested a Corrected Receipt' : 'Previous Submission Rejected'}
              </p>
              <p className="text-slate-300">
                Reason: "{activeProof?.rejectionReason || 'Please ensure the receipt clearly displays the transaction reference and transferred sum.'}"
              </p>
              <p className="text-rose-300 text-[11px] pt-1">
                You can upload a replacement or updated document below without altering your order reference.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Manual Payment Methods & Account Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <span>Select Manual Payment Channel</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Transfer the exact amount using any of our verified institutional banking rails.
              </p>

              {/* Method Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
                {paymentMethods.map((method) => {
                  const isSelected = selectedMethodId === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethodId(method.id)}
                      className={`p-3 rounded-xl text-left border transition text-xs flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-800 border-cyan-400 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold leading-snug">{method.title}</span>
                      <span className="text-[10px] text-cyan-400 mt-2 block font-medium">
                        {method.supportedCurrencies.join(' / ')}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Method Details */}
              {activeMethod && (
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {activeMethod.bankOrProviderName}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Verified Rail
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Beneficiary / Account Name:</span>
                      <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="font-semibold text-white truncate">{activeMethod.accountHolderName}</span>
                        <button
                          onClick={() => copyToClipboard(activeMethod.accountHolderName, 'holder')}
                          className="text-slate-400 hover:text-cyan-400 p-1"
                        >
                          {copiedKey === 'holder' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Account Number / IBAN:</span>
                      <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="font-mono font-bold text-cyan-400 truncate">{activeMethod.accountNumberOrIban}</span>
                        <button
                          onClick={() => copyToClipboard(activeMethod.accountNumberOrIban, 'iban')}
                          className="text-slate-400 hover:text-cyan-400 p-1"
                        >
                          {copiedKey === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {activeMethod.swiftBicOrRouting && (
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-0.5">SWIFT / BIC / Routing Code:</span>
                        <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                          <span className="font-mono text-white">{activeMethod.swiftBicOrRouting}</span>
                          <button
                            onClick={() => copyToClipboard(activeMethod.swiftBicOrRouting || '', 'swift')}
                            className="text-slate-400 hover:text-cyan-400 p-1"
                          >
                            {copiedKey === 'swift' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {activeMethod.branchName && (
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-0.5">Branch / Desk:</span>
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                          <span>{activeMethod.branchName}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mandatory Reference Reminder */}
                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-100">Mandatory Bank Transfer Narration</p>
                      <p className="text-slate-300 mt-0.5">
                        Please insert your order reference <strong className="text-cyan-300 font-mono">{order?.orderRef}</strong> into the transfer description / remarks field so our finance desk can immediately match your funds.
                      </p>
                    </div>
                  </div>

                  {/* Step-by-step instructions */}
                  <div className="pt-2">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Transfer Instructions:
                    </p>
                    <ol className="space-y-1.5 text-xs text-slate-400 list-decimal pl-4">
                      {activeMethod.instructions.map((step, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Payment Proof Upload & Verification Tracking */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-cyan-400" />
                <span>Submit Private Payment Proof</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Upload your official bank receipt or transaction PDF. Documents are kept strictly confidential on private storage.
              </p>

              {uploadSuccessMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{uploadSuccessMessage}</span>
                </div>
              )}

              {uploadError && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <form onSubmit={handleProofSubmit} className="space-y-4">
                {/* File picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Receipt / Proof Document <span className="text-cyan-400">*</span>
                  </label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 text-center cursor-pointer bg-slate-950 transition">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setProofFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      id="proof-file-input"
                    />
                    <label htmlFor="proof-file-input" className="cursor-pointer block">
                      {proofFile ? (
                        <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-semibold">
                          <FileText className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">{proofFile.name}</span>
                          <span className="text-slate-400">({(proofFile.size / 1024).toFixed(0)} KB)</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <UploadCloud className="w-6 h-6 text-slate-500 mx-auto" />
                          <p className="text-xs font-medium text-slate-300">Click to upload transfer receipt</p>
                          <p className="text-[10px] text-slate-400">Supported: JPG, PNG, PDF (Max 10MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Transferred Amount <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={amountTransferred}
                      onChange={(e) => setAmountTransferred(e.target.value)}
                      placeholder="149"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Currency <span className="text-cyan-400">*</span>
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="PKR">PKR (₨)</option>
                      <option value="CAD">CAD ($)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Date of Transfer <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={transferDate}
                      onChange={(e) => setTransferDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Transaction / MTCN Ref <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionReference}
                      onChange={(e) => setTransactionReference(e.target.value)}
                      placeholder="e.g. TXN-8392019"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Customer Note / Branch <span className="text-slate-500">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Sent via Askari Mobile App / Wire Reference Details..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-3 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <span>Uploading Private Document...</span>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>{(order?.proofs?.length ?? 0) > 0 ? 'Submit Replacement Proof' : 'Submit Payment Proof'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Submitted Proofs History */}
              {(order?.proofs?.length ?? 0) > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Submitted Proof History ({order?.proofs?.length ?? 0})
                  </h4>
                  <div className="space-y-2">
                    {order?.proofs?.map((proof, idx) => (
                      <div
                        key={proof.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-cyan-400">
                              {proof.currency} {proof.amountTransferred}
                            </span>
                            <span className="text-slate-400">• Ref: {proof.transactionReference}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Uploaded: {new Date(proof.submittedAt).toLocaleDateString()} at {new Date(proof.submittedAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              proof.verificationStatus === 'verified'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : proof.verificationStatus === 'pending_review'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {proof.verificationStatus.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
