import React, { useState, useEffect } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { api, AdminStatsResponse } from '../../services/api';
import {
  Order,
  PaymentProof,
  WebsitePackage,
  PortfolioItem,
  PaymentMethodConfig,
  CashbackPromoSettings,
  PromoDrawRecord,
  AuditLogEntry,
  AgencySettings,
  ContactInquiry,
  CustomProjectRequest,
} from '../../types';
import { CustomProjectsAdminTab } from './CustomProjectsAdminTab';
import {
  LayoutDashboard,
  CreditCard,
  PackageCheck,
  Briefcase,
  Gift,
  FileSpreadsheet,
  Settings,
  History,
  LogOut,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Eye,
  Download,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  Building2,
  Mail,
  User,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

type AdminTab =
  | 'overview'
  | 'custom_projects'
  | 'orders'
  | 'verification'
  | 'customers'
  | 'packages'
  | 'portfolio'
  | 'payment_settings'
  | 'cashback'
  | 'reports'
  | 'agency_settings'
  | 'audit';

export const AdminDashboard: React.FC = () => {
  const { adminUser, isAdminLoggedIn, setAdminLoggedInUser, adminLogout, showToast, refreshConfig } = useAgency();

  // Auth State
  const [loginEmail, setLoginEmail] = useState('admin@globalwebstudio.com');
  const [loginPassword, setLoginPassword] = useState('Admin@GlobalWeb2026!');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dashboard Data State
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [packages, setPackages] = useState<WebsitePackage[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [cashbackSettings, setCashbackSettings] = useState<CashbackPromoSettings | null>(null);
  const [promoDraws, setPromoDraws] = useState<PromoDrawRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [agencySettings, setAgencySettings] = useState<AgencySettings | null>(null);
  const [customRequests, setCustomRequests] = useState<CustomProjectRequest[]>([]);

  // Verification modal state
  const [selectedProofOrder, setSelectedProofOrder] = useState<Order | null>(null);
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [verifiedAmountInput, setVerifiedAmountInput] = useState<string>('');
  const [verificationNotes, setVerificationNotes] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isProcessingVerification, setIsProcessingVerification] = useState(false);

  // Status & Refund modal
  const [statusOrder, setStatusOrder] = useState<Order | null>(null);
  const [newStatusInput, setNewStatusInput] = useState<string>('in_progress');
  const [statusNote, setStatusNote] = useState<string>('');
  const [refundOrder, setRefundOrder] = useState<Order | null>(null);
  const [refundAmountInput, setRefundAmountInput] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('');

  // Draw Calculation State
  const [eligibleOrdersCount, setEligibleOrdersCount] = useState<number>(0);
  const [previewDrawResult, setPreviewDrawResult] = useState<any>(null);
  const [drawAuditNote, setDrawAuditNote] = useState<string>('');
  const [isCalculatingDraw, setIsCalculatingDraw] = useState(false);

  // Load all admin data
  const loadAdminData = async () => {
    try {
      const [statsData, ordersData, auditData, inqData, promoData, customReqData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminOrders(),
        api.getAuditLogs(),
        api.getContactInquiries(),
        api.getCashbackAdmin(),
        api.getAdminCustomRequests(),
      ]);

      setStats(statsData);
      setOrders(ordersData);
      setAuditLogs(auditData);
      setInquiries(inqData);
      setCashbackSettings(promoData.settings);
      setPromoDraws(promoData.draws);
      setCustomRequests(customReqData || []);

      const config = await api.getConfig();
      setPackages(config.packages);
      setPaymentMethods(config.paymentMethods);
      setAgencySettings(config.settings);

      const portData = await api.getPortfolio();
      setPortfolio(portData);
    } catch (err: any) {
      showToast(err.message || 'Error loading administrative records', 'error');
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadAdminData();
    }
  }, [isAdminLoggedIn]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);
    try {
      const res = await api.adminLogin(loginEmail, loginPassword);
      setAdminLoggedInUser(res.user);
      showToast('Welcome to GlobalWeb Studio Management Console', 'success');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Verification Actions
  const handleVerifyProof = async () => {
    if (!selectedProofOrder || !selectedProof) return;
    setIsProcessingVerification(true);
    try {
      const amt = verifiedAmountInput ? parseFloat(verifiedAmountInput) : selectedProof.amountTransferred;
      await api.verifyPaymentProof(selectedProofOrder.orderRef, selectedProof.id, amt, verificationNotes);
      showToast(`Proof for order ${selectedProofOrder.orderRef} verified successfully!`, 'success');
      setSelectedProofOrder(null);
      setSelectedProof(null);
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setIsProcessingVerification(false);
    }
  };

  const handleRejectProof = async (isCorrection: boolean) => {
    if (!selectedProofOrder || !selectedProof) return;
    if (!rejectionReason.trim()) {
      showToast('Please provide a reason for rejection or correction request.', 'error');
      return;
    }
    setIsProcessingVerification(true);
    try {
      await api.rejectPaymentProof(selectedProofOrder.orderRef, selectedProof.id, rejectionReason, isCorrection);
      showToast(isCorrection ? 'Correction requested from customer.' : 'Payment proof rejected.', 'info');
      setSelectedProofOrder(null);
      setSelectedProof(null);
      setRejectionReason('');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Rejection failed', 'error');
    } finally {
      setIsProcessingVerification(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusOrder) return;
    try {
      await api.updateProjectStatus(statusOrder.orderRef, newStatusInput, statusNote);
      showToast(`Status updated to ${newStatusInput}`, 'success');
      setStatusOrder(null);
      setStatusNote('');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleRecordRefund = async () => {
    if (!refundOrder) return;
    const amt = parseFloat(refundAmountInput);
    if (isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid refund amount.', 'error');
      return;
    }
    try {
      await api.recordRefund(refundOrder.orderRef, amt, refundReason);
      showToast(`Refund of $${amt} recorded.`, 'info');
      setRefundOrder(null);
      setRefundAmountInput('');
      setRefundReason('');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Refund record failed', 'error');
    }
  };

  // Promo actions
  const handleCheckEligible = async () => {
    try {
      const res = await api.getCashbackEligibleOrders();
      setEligibleOrdersCount(res.count);
      showToast(`${res.count} verified qualifying orders in current weekly period.`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Error checking eligible orders', 'error');
    }
  };

  const handleRunDraw = async () => {
    setIsCalculatingDraw(true);
    try {
      const res = await api.runCashbackDraw();
      setPreviewDrawResult(res.calculationResult);
      showToast('Draw calculated successfully. Review and lock when satisfied.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Draw execution failed', 'error');
    } finally {
      setIsCalculatingDraw(false);
    }
  };

  const handleLockDraw = async () => {
    if (!previewDrawResult) return;
    try {
      await api.lockCashbackDraw(previewDrawResult, drawAuditNote);
      showToast('Weekly cashback draw officially locked and recorded as studio liability!', 'success');
      setPreviewDrawResult(null);
      setDrawAuditNote('');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to lock draw', 'error');
    }
  };

  const handleVerifyPayout = async (drawId: string, winnerType: 'random' | 'highest') => {
    const details = prompt('Enter manual payout reference (e.g. Bank Wire / Remittance transfer reference):');
    if (!details) return;
    try {
      await api.verifyCashbackPayout(drawId, winnerType, details);
      showToast(`Payout verified for ${winnerType} winner.`, 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Error updating payout status', 'error');
    }
  };

  // Save Settings
  const handleSavePaymentMethods = async () => {
    try {
      await api.updatePaymentMethods(paymentMethods);
      showToast('Payment methods and bank transfer instructions saved.', 'success');
      refreshConfig();
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update payment settings', 'error');
    }
  };

  const handleSavePackages = async () => {
    try {
      await api.updatePackages(packages);
      showToast('Website packages and pricing updated successfully.', 'success');
      refreshConfig();
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update packages', 'error');
    }
  };

  const handleSaveAgencySettings = async () => {
    if (!agencySettings) return;
    try {
      await api.updateAgencySettings(agencySettings);
      showToast('Studio details, contacts, and operating hours updated.', 'success');
      refreshConfig();
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save agency settings', 'error');
    }
  };

  const handleSavePromoSettings = async () => {
    if (!cashbackSettings) return;
    try {
      await api.updateCashbackAdmin(cashbackSettings);
      showToast('Cashback promotion rules and boundaries updated.', 'success');
      refreshConfig();
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update promo settings', 'error');
    }
  };

  // -------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              GlobalWeb Studio Admin
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Authorized Finance & Development Operations Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Staff Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure Administrator Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400">
              Session tokens are cryptographically generated and enforced on all administrative endpoints.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ADMIN PANEL
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
            GW
          </div>
          <div>
            <span className="text-sm font-bold text-white block">GlobalWeb Studio Management</span>
            <span className="text-[10px] text-slate-400">Finance & Engineering Back-Office</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-white block">{adminUser?.name || 'Administrator'}</span>
            <span className="text-[10px] text-cyan-400 uppercase font-mono">{adminUser?.role || 'super_admin'}</span>
          </div>
          <button
            onClick={adminLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800 p-4 space-y-1 shrink-0 overflow-y-auto">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
            {
              id: 'custom_projects',
              label: 'Custom Projects & Deals',
              icon: Sparkles,
              badge: customRequests.length > 0 ? customRequests.length : undefined,
              badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
            },
            { id: 'orders', label: 'Orders Management', icon: PackageCheck, badge: orders.length },
            {
              id: 'verification',
              label: 'Payment Verification',
              icon: CreditCard,
              badge: stats?.proofsAwaitingReview,
              badgeColor: 'bg-amber-500 text-slate-950',
            },
            { id: 'customers', label: 'Customer Directory', icon: User },
            { id: 'packages', label: 'Packages & Pricing', icon: DollarSign },
            { id: 'portfolio', label: 'Portfolio Showcases', icon: Briefcase },
            { id: 'payment_settings', label: 'Bank & Transfer Settings', icon: Building2 },
            {
              id: 'cashback',
              label: 'Weekly Cashback Promo',
              icon: Gift,
              badge: cashbackSettings?.enabled ? 'Active' : undefined,
            },
            { id: 'reports', label: 'Sales Reports & Export', icon: FileSpreadsheet },
            { id: 'agency_settings', label: 'Studio Configuration', icon: Settings },
            { id: 'audit', label: 'Audit Trail Logs', icon: History },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id as AdminTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge !== 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Main Content View */}
        <main className="flex-1 p-6 lg:p-8 bg-slate-950 overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {currentTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Executive Studio Dashboard</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Accurate database metrics. Empty states and zeroes represent authentic absence of records.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Total Orders</span>
                  <span className="text-2xl font-bold text-white font-mono">{stats?.totalOrders || 0}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-amber-400 block mb-1">Awaiting Payment</span>
                  <span className="text-2xl font-bold text-amber-300 font-mono">{stats?.awaitingPayment || 0}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/30 bg-amber-950/20">
                  <span className="text-xs text-amber-300 font-semibold block mb-1">Proofs Awaiting Review</span>
                  <span className="text-2xl font-bold text-amber-400 font-mono">{stats?.proofsAwaitingReview || 0}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/30 bg-emerald-950/20">
                  <span className="text-xs text-emerald-300 font-semibold block mb-1">Verified Payments</span>
                  <span className="text-2xl font-bold text-emerald-400 font-mono">{stats?.verifiedPayments || 0}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-cyan-400 block mb-1">Projects In Progress</span>
                  <span className="text-2xl font-bold text-white font-mono">{stats?.inProgress || 0}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Completed & Handed Over</span>
                  <span className="text-2xl font-bold text-white font-mono">{stats?.completed || 0}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-rose-400 block mb-1">Refunds & Cancellations</span>
                  <span className="text-2xl font-bold text-rose-300 font-mono">{stats?.refunded || 0}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Cashback Liabilities</span>
                  <span className="text-2xl font-bold text-white font-mono">
                    ${stats?.cashbackLiabilities || 0} USD
                  </span>
                </div>
                <div
                  onClick={() => setCurrentTab('custom_projects')}
                  className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30 bg-cyan-950/20 cursor-pointer hover:border-cyan-400 transition"
                >
                  <span className="text-xs text-cyan-300 font-semibold block mb-1">Custom Project Requests</span>
                  <span className="text-2xl font-bold text-cyan-400 font-mono">
                    {customRequests.length}
                  </span>
                </div>
              </div>

              {/* Verified Revenue Summary */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Financial Summary</span>
                  <h3 className="text-xl font-bold text-white mt-1">Total Verified Revenue Settled</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sum of all bank transfers and wires verified by finance administration.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                    ${(stats?.totalRevenueVerified || 0).toLocaleString()} USD
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    Current weekly volume: ${(stats?.weeklySalesVolume || 0).toLocaleString()} USD ({stats?.weeklyVerifiedCount || 0} orders)
                  </p>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Latest Orders</h3>
                  <button
                    onClick={() => setCurrentTab('orders')}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    No orders have been placed yet. New client submissions will appear here in real time.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                          <th className="py-2.5 px-3">Order Ref</th>
                          <th className="py-2.5 px-3">Client</th>
                          <th className="py-2.5 px-3">Package</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {orders.slice(0, 5).map((o) => (
                          <tr key={o.id}>
                            <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{o.orderRef}</td>
                            <td className="py-2.5 px-3 text-white font-medium">{o.customerName}</td>
                            <td className="py-2.5 px-3">{o.packageName}</td>
                            <td className="py-2.5 px-3 font-mono">${o.packagePrice}</td>
                            <td className="py-2.5 px-3 uppercase text-[10px] font-bold">{o.status.replace('_', ' ')}</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  o.verificationStatus === 'verified'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : o.verificationStatus === 'pending_review'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {o.verificationStatus.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: CUSTOM PROJECTS & NEGOTIATED DEALS */}
          {currentTab === 'custom_projects' && (
            <CustomProjectsAdminTab
              customRequests={customRequests}
              orders={orders}
              onRefresh={loadAdminData}
              showToast={showToast}
            />
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {currentTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Orders Management</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage client orders, project requirements, delivery milestones, and refunds.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/api/admin/reports/csv"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </a>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-500">
                  No orders recorded in database yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-cyan-400">{o.orderRef}</span>
                            <span className="text-xs text-slate-400">
                              • Created on {new Date(o.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-base font-bold text-white mt-0.5">
                            {o.customerName} {o.businessName && <span className="text-xs text-slate-400 font-normal">({o.businessName})</span>}
                          </p>
                          <p className="text-xs text-slate-400">
                            {o.email} • {o.country}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-white block">
                              ${o.packagePrice} USD
                            </span>
                            <span className="text-[10px] text-slate-400">{o.packageName}</span>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                              o.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : o.status === 'in_progress'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : o.status === 'proof_submitted'
                                ? 'bg-amber-500/20 text-amber-400'
                                : o.status === 'refunded'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {o.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Requirements Brief */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                        <span className="font-bold text-slate-300 block text-[11px] uppercase tracking-wider">
                          Project Brief & Features:
                        </span>
                        <p className="text-slate-400 leading-relaxed">{o.projectRequirements}</p>
                        {o.requiredFeatures && o.requiredFeatures.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {o.requiredFeatures.map((f, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 text-[10px]">
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                        <div className="flex items-center gap-2">
                          {o.proofs && o.proofs.length > 0 ? (
                            <button
                              onClick={() => {
                                setSelectedProofOrder(o);
                                setSelectedProof(o.proofs[0]);
                                setCurrentTab('verification');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 font-medium"
                            >
                              Inspect Proof ({o.proofs.length})
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500">No proof uploaded yet</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setStatusOrder(o);
                              setNewStatusInput(o.status);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                          >
                            Update Project State
                          </button>
                          <button
                            onClick={() => {
                              setRefundOrder(o);
                              setRefundAmountInput(String(o.totalPaid || o.packagePrice));
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                          >
                            Record Refund
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PAYMENT VERIFICATION WORKFLOW */}
          {currentTab === 'verification' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Manual Payment Verification</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Cross-examine submitted bank slips, MTCNs, and transaction IDs directly against Askari Bank or wire statement records.
                </p>
              </div>

              {/* Proofs awaiting review list */}
              <div className="space-y-4">
                {orders
                  .filter((o) => o.proofs && o.proofs.length > 0)
                  .map((o) => {
                    return (
                      <div
                        key={o.id}
                        className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-cyan-400">{o.orderRef}</span>
                              <span className="text-xs text-slate-300 font-semibold">{o.customerName}</span>
                            </div>
                            <span className="text-xs text-slate-400">
                              Package: {o.packageName} • Expected: ${o.packagePrice} USD
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                                o.verificationStatus === 'verified'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : o.verificationStatus === 'pending_review'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {o.verificationStatus.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        {/* Each Proof */}
                        <div className="space-y-3">
                          {o.proofs.map((proof) => (
                            <div
                              key={proof.id}
                              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-mono font-bold text-white">
                                    Reported: {proof.currency} {proof.amountTransferred}
                                  </span>
                                  <span className="text-slate-500">•</span>
                                  <span className="text-cyan-400 font-mono">
                                    TxRef: {proof.transactionReference}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Date of Transfer: {proof.transferDate} • Uploaded:{' '}
                                  {new Date(proof.submittedAt).toLocaleString()}
                                </p>
                                {proof.customerNote && (
                                  <p className="text-[11px] text-slate-300 italic">
                                    Note: "{proof.customerNote}"
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <a
                                  href={`/api/orders/${o.orderRef}/proof-file/${proof.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 transition"
                                >
                                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>View Receipt File</span>
                                </a>

                                {proof.verificationStatus !== 'verified' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedProofOrder(o);
                                        setSelectedProof(proof);
                                        setVerifiedAmountInput(String(proof.amountTransferred));
                                      }}
                                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition"
                                    >
                                      Verify Payment
                                    </button>

                                    <button
                                      onClick={() => {
                                        setSelectedProofOrder(o);
                                        setSelectedProof(proof);
                                      }}
                                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition"
                                    >
                                      Reject / Request Correction
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMER DIRECTORY */}
          {currentTab === 'customers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Customer Directory</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Active client contracts, contacts, and cumulative orders.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                {orders.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No customer records in database.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                          <th className="py-2.5 px-3">Customer</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3">Country</th>
                          <th className="py-2.5 px-3">Business</th>
                          <th className="py-2.5 px-3">Active Order</th>
                          <th className="py-2.5 px-3">Settlement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {orders.map((o) => (
                          <tr key={o.id}>
                            <td className="py-3 px-3 font-semibold text-white">{o.customerName}</td>
                            <td className="py-3 px-3">{o.email}</td>
                            <td className="py-3 px-3">{o.country}</td>
                            <td className="py-3 px-3">{o.businessName || '—'}</td>
                            <td className="py-3 px-3 font-mono text-cyan-400">{o.orderRef}</td>
                            <td className="py-3 px-3 font-mono">
                              ${o.totalPaid || 0} USD
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PACKAGES & PRICING EDITOR */}
          {currentTab === 'packages' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Website Packages Editor</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Centralized package configuration. Changes are reflected across all customer cards and order forms.
                  </p>
                </div>
                <button
                  onClick={handleSavePackages}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition"
                >
                  Save Package Changes
                </button>
              </div>

              <div className="space-y-6">
                {packages.map((pkg, idx) => (
                  <div key={pkg.id} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Package Name</label>
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => {
                            const updated = [...packages];
                            updated[idx].name = e.target.value;
                            setPackages(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Price (USD)</label>
                        <input
                          type="number"
                          value={pkg.price}
                          onChange={(e) => {
                            const updated = [...packages];
                            updated[idx].price = parseFloat(e.target.value) || 0;
                            setPackages(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Delivery Time</label>
                        <input
                          type="text"
                          value={pkg.deliveryTime}
                          onChange={(e) => {
                            const updated = [...packages];
                            updated[idx].deliveryTime = e.target.value;
                            setPackages(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Pages Description</label>
                        <input
                          type="text"
                          value={pkg.pagesDescription}
                          onChange={(e) => {
                            const updated = [...packages];
                            updated[idx].pagesDescription = e.target.value;
                            setPackages(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Revision Limits</label>
                        <input
                          type="text"
                          value={pkg.revisions}
                          onChange={(e) => {
                            const updated = [...packages];
                            updated[idx].revisions = e.target.value;
                            setPackages(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tagline & Summary</label>
                      <input
                        type="text"
                        value={pkg.tagline}
                        onChange={(e) => {
                          const updated = [...packages];
                          updated[idx].tagline = e.target.value;
                          setPackages(updated);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PORTFOLIO SHOWCASES */}
          {currentTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Portfolio Showcases</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage demo projects and custom build showcases displayed on the public site.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await api.updatePortfolio(portfolio);
                    showToast('Portfolio changes saved.', 'success');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition"
                >
                  Save Portfolio
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolio.map((item, idx) => (
                  <div key={item.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-cyan-400">{item.category}</span>
                      <span className="text-[10px] text-slate-400">{item.isSample ? 'Demo Concept' : 'Client Build'}</span>
                    </div>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...portfolio];
                        updated[idx].title = e.target.value;
                        setPortfolio(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white"
                    />
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...portfolio];
                        updated[idx].description = e.target.value;
                        setPortfolio(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: BANK & TRANSFER SETTINGS */}
          {currentTab === 'payment_settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Bank & Manual Transfer Settings</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Configure official banking accounts, Askari Bank transfer details, IBANs, and instructions shown to clients.
                  </p>
                </div>
                <button
                  onClick={handleSavePaymentMethods}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition"
                >
                  Save Bank Settings
                </button>
              </div>

              <div className="space-y-6">
                {paymentMethods.map((method, idx) => (
                  <div key={method.id} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-cyan-400" />
                        <h4 className="text-sm font-bold text-white">{method.title}</h4>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={method.enabled}
                          onChange={(e) => {
                            const updated = [...paymentMethods];
                            updated[idx].enabled = e.target.checked;
                            setPaymentMethods(updated);
                          }}
                          className="rounded border-slate-700 text-cyan-400 focus:ring-0"
                        />
                        <span>Enabled for Clients</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Bank / Provider Name
                        </label>
                        <input
                          type="text"
                          value={method.bankOrProviderName}
                          onChange={(e) => {
                            const updated = [...paymentMethods];
                            updated[idx].bankOrProviderName = e.target.value;
                            setPaymentMethods(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Account Holder / Beneficiary Name
                        </label>
                        <input
                          type="text"
                          value={method.accountHolderName}
                          onChange={(e) => {
                            const updated = [...paymentMethods];
                            updated[idx].accountHolderName = e.target.value;
                            setPaymentMethods(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Account Number or IBAN
                        </label>
                        <input
                          type="text"
                          value={method.accountNumberOrIban}
                          onChange={(e) => {
                            const updated = [...paymentMethods];
                            updated[idx].accountNumberOrIban = e.target.value;
                            setPaymentMethods(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          SWIFT / BIC / Routing Code (Optional)
                        </label>
                        <input
                          type="text"
                          value={method.swiftBicOrRouting || ''}
                          onChange={(e) => {
                            const updated = [...paymentMethods];
                            updated[idx].swiftBicOrRouting = e.target.value;
                            setPaymentMethods(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Supported Currencies (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={method.supportedCurrencies.join(', ')}
                        onChange={(e) => {
                          const updated = [...paymentMethods];
                          updated[idx].supportedCurrencies = e.target.value.split(',').map((c) => c.trim().toUpperCase());
                          setPaymentMethods(updated);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: WEEKLY CASHBACK PROMOTION MODULE */}
          {currentTab === 'cashback' && cashbackSettings && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Weekly Cashback Promotion</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Verifiable random draw (Award A) & highest qualifying project (Award B) engine.
                  </p>
                </div>
                <button
                  onClick={handleSavePromoSettings}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition"
                >
                  Save Promotion Rules
                </button>
              </div>

              {/* Status Warning Banner */}
              <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                cashbackSettings.enabled
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
              }`}>
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">
                    {cashbackSettings.enabled ? 'Promotion Module is ACTIVE' : 'Promotion Module is Currently DISABLED'}
                  </p>
                  <p className="text-slate-300">
                    Per regulatory requirements, the promotion must remain disabled until business ownership verifies compliance with target market promotional contest rules.
                  </p>
                  <label className="flex items-center gap-2 pt-2 cursor-pointer font-semibold text-white">
                    <input
                      type="checkbox"
                      checked={cashbackSettings.enabled}
                      onChange={(e) => setCashbackSettings({ ...cashbackSettings, enabled: e.target.checked })}
                      className="rounded border-slate-700 text-cyan-400"
                    />
                    <span>Toggle Promotion Active</span>
                  </label>
                </div>
              </div>

              {/* Configuration Rules */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                  Weekly Boundary & Award Limits
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Cashback Percentage
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={cashbackSettings.cashbackPercentage}
                        onChange={(e) =>
                          setCashbackSettings({ ...cashbackSettings, cashbackPercentage: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                      />
                      <span className="text-slate-400 text-xs">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Max Award Per Winner (USD)
                    </label>
                    <input
                      type="number"
                      value={cashbackSettings.maxAwardPerWinner}
                      onChange={(e) =>
                        setCashbackSettings({ ...cashbackSettings, maxAwardPerWinner: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Total Weekly Studio Budget (USD)
                    </label>
                    <input
                      type="number"
                      value={cashbackSettings.totalWeeklyBudget}
                      onChange={(e) =>
                        setCashbackSettings({ ...cashbackSettings, totalWeeklyBudget: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Current Week Start Boundary (Inclusive)
                    </label>
                    <input
                      type="text"
                      value={cashbackSettings.currentWeekBoundaryStart}
                      onChange={(e) =>
                        setCashbackSettings({ ...cashbackSettings, currentWeekBoundaryStart: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Current Week End Boundary (Exclusive)
                    </label>
                    <input
                      type="text"
                      value={cashbackSettings.currentWeekBoundaryEnd}
                      onChange={(e) =>
                        setCashbackSettings({ ...cashbackSettings, currentWeekBoundaryEnd: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cashbackSettings.allowDualWinner}
                      onChange={(e) =>
                        setCashbackSettings({ ...cashbackSettings, allowDualWinner: e.target.checked })
                      }
                      className="rounded border-slate-700 text-cyan-400"
                    />
                    <span>Allow single client to win both Draw and Highest Purchase award</span>
                  </label>
                </div>
              </div>

              {/* Execution Actions */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                  Run Verifiable Weekly Draw
                </h3>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleCheckEligible}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    Check Qualifying Orders ({eligibleOrdersCount})
                  </button>

                  <button
                    onClick={handleRunDraw}
                    disabled={isCalculatingDraw || !cashbackSettings.enabled}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition disabled:opacity-40"
                  >
                    {isCalculatingDraw ? 'Executing Algorithm...' : 'Calculate Draw & Top Buyer'}
                  </button>
                </div>

                {previewDrawResult && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3 mt-4">
                    <h4 className="text-xs font-bold text-cyan-300 uppercase">
                      Draw Calculation Results (Preview Before Lock)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Award A: Verifiable Random Draw Winner
                        </span>
                        <p className="text-white font-semibold">{previewDrawResult.randomDrawWinner.customerName}</p>
                        <p className="font-mono text-cyan-400">{previewDrawResult.randomDrawWinner.orderRef}</p>
                        <p className="text-emerald-400 font-bold mt-1">
                          Cashback: ${previewDrawResult.randomDrawWinner.cashbackAwarded} USD
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Award B: Highest Qualifying Purchase
                        </span>
                        <p className="text-white font-semibold">{previewDrawResult.highestValueWinner.customerName}</p>
                        <p className="font-mono text-cyan-400">{previewDrawResult.highestValueWinner.orderRef}</p>
                        <p className="text-emerald-400 font-bold mt-1">
                          Cashback: ${previewDrawResult.highestValueWinner.cashbackAwarded} USD
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400">
                      Total Cashback Liability:{' '}
                      <strong className="text-white">${previewDrawResult.totalCashbackAwarded} USD</strong> (Budget:{' '}
                      ${cashbackSettings.totalWeeklyBudget} USD) • Seed: {previewDrawResult.drawSeed.substring(0, 16)}...
                    </p>

                    <div>
                      <input
                        type="text"
                        value={drawAuditNote}
                        onChange={(e) => setDrawAuditNote(e.target.value)}
                        placeholder="Audit justification note before locking..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                      />
                    </div>

                    <button
                      onClick={handleLockDraw}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition"
                    >
                      Confirm, Lock & Record Cashback Liabilities
                    </button>
                  </div>
                )}
              </div>

              {/* Past Locked Draws Table */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Historical Locked Promotion Draws ({promoDraws.length})
                </h3>

                {promoDraws.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No locked promotion records yet.</p>
                ) : (
                  <div className="space-y-3">
                    {promoDraws.map((d) => (
                      <div key={d.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-cyan-400">Draw ID: {d.id}</span>
                          <span className="text-slate-400">{new Date(d.drawDate).toLocaleDateString()}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase block">Random Winner:</span>
                            <span>{d.randomDrawWinner?.customerName} ({d.randomDrawWinner?.orderRef})</span>
                            <span className="text-emerald-400 font-bold block">
                              Award: ${d.randomDrawWinner?.cashbackAwarded} USD{' '}
                              {d.payoutStatus.randomWinnerPaid ? '(PAID)' : '(UNPAID)'}
                            </span>
                            {!d.payoutStatus.randomWinnerPaid && (
                              <button
                                onClick={() => handleVerifyPayout(d.id, 'random')}
                                className="mt-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-400 font-bold"
                              >
                                Record Manual Payout
                              </button>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-500 uppercase block">Top Buyer:</span>
                            <span>{d.highestValueWinner?.customerName} ({d.highestValueWinner?.orderRef})</span>
                            <span className="text-emerald-400 font-bold block">
                              Award: ${d.highestValueWinner?.cashbackAwarded} USD{' '}
                              {d.payoutStatus.highestWinnerPaid ? '(PAID)' : '(UNPAID)'}
                            </span>
                            {!d.payoutStatus.highestWinnerPaid && (
                              <button
                                onClick={() => handleVerifyPayout(d.id, 'highest')}
                                className="mt-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-400 font-bold"
                              >
                                Record Manual Payout
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: REPORTS & EXPORT */}
          {currentTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Sales & Activity Reports</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Export verified client records and financial ledgers to CSV for accounting reconciliation.
                  </p>
                </div>
                <a
                  href="/api/admin/reports/csv"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full CSV Ledger</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Verified Orders Settled</span>
                  <span className="text-2xl font-bold text-white font-mono">{stats?.verifiedPayments || 0}</span>
                </div>
                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Gross Revenue Verified</span>
                  <span className="text-2xl font-bold text-emerald-400 font-mono">
                    ${(stats?.totalRevenueVerified || 0).toLocaleString()} USD
                  </span>
                </div>
                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Unpaid Cashback Liabilities</span>
                  <span className="text-2xl font-bold text-amber-400 font-mono">
                    ${(stats?.cashbackLiabilities || 0).toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: STUDIO CONFIGURATION */}
          {currentTab === 'agency_settings' && agencySettings && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Studio Configuration</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage public business name, contact information, headquarters, and hours.
                  </p>
                </div>
                <button
                  onClick={handleSaveAgencySettings}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition"
                >
                  Save Studio Details
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Business / Studio Name
                    </label>
                    <input
                      type="text"
                      value={agencySettings.businessName}
                      onChange={(e) => setAgencySettings({ ...agencySettings, businessName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={agencySettings.contactEmail}
                      onChange={(e) => setAgencySettings({ ...agencySettings, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Operating Hours
                    </label>
                    <input
                      type="text"
                      value={agencySettings.workingHours}
                      onChange={(e) => setAgencySettings({ ...agencySettings, workingHours: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Headquarters Address / Notice
                    </label>
                    <input
                      type="text"
                      value={agencySettings.headquarters}
                      onChange={(e) => setAgencySettings({ ...agencySettings, headquarters: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: AUDIT TRAIL LOGS */}
          {currentTab === 'audit' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Immutable Audit Log</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Full chronological record of administrative verifications, orders, uploads, and changes.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No audit records logged yet.</p>
                ) : (
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-cyan-400">{log.action}</span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-300">{log.details}</p>
                        <div className="text-[10px] text-slate-400">
                          Actor: {log.actor} • Target: {log.targetType} ({log.targetId})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* VERIFY / REJECT PROOF MODAL */}
      {selectedProofOrder && selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Payment Proof Review</h3>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <p>Order: <strong className="text-cyan-400 font-mono">{selectedProofOrder.orderRef}</strong></p>
              <p>Client: {selectedProofOrder.customerName} ({selectedProofOrder.email})</p>
              <p>Reported: {selectedProof.currency} {selectedProof.amountTransferred} • TxRef: {selectedProof.transactionReference}</p>
              <a
                href={`/api/orders/${selectedProofOrder.orderRef}/proof-file/${selectedProof.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 underline inline-block pt-1"
              >
                Open Receipt File in New Window ↗
              </a>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Verified Amount (USD)
                </label>
                <input
                  type="number"
                  value={verifiedAmountInput}
                  onChange={(e) => setVerifiedAmountInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Verification Notes / Bank Statement Reference
                </label>
                <input
                  type="text"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="e.g. Matched Askari statement line item ref #49021"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rejection or Correction Reason (Only if rejecting)
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Transaction slip blurry / missing reference"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleVerifyProof}
                disabled={isProcessingVerification}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition"
              >
                Verify Payment & Start Project
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleRejectProof(true)}
                  disabled={isProcessingVerification}
                  className="py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition"
                >
                  Request Correction
                </button>
                <button
                  onClick={() => handleRejectProof(false)}
                  disabled={isProcessingVerification}
                  className="py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition"
                >
                  Reject Proof
                </button>
              </div>
              <button
                onClick={() => {
                  setSelectedProofOrder(null);
                  setSelectedProof(null);
                }}
                className="w-full py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE PROJECT STATE MODAL */}
      {statusOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Update Project State</h3>
            <p className="text-xs text-slate-400">Order: {statusOrder.orderRef} ({statusOrder.customerName})</p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Project Status</label>
              <select
                value={newStatusInput}
                onChange={(e) => setNewStatusInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="awaiting_payment">Awaiting Payment</option>
                <option value="in_progress">In Progress (Engineering)</option>
                <option value="review_ready">Review Ready (Client Staging Preview)</option>
                <option value="completed">Completed & Handed Over</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status Note</label>
              <input
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g. Staging link deployed to client for review"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setStatusOrder(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD REFUND MODAL */}
      {refundOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Record Manual Refund</h3>
            <p className="text-xs text-slate-400">Order: {refundOrder.orderRef} ({refundOrder.customerName})</p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Refund Amount (USD)</label>
              <input
                type="number"
                value={refundAmountInput}
                onChange={(e) => setRefundAmountInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reason for Refund</label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. Client requested contract scope cancellation"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setRefundOrder(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordRefund}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition"
              >
                Record Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
