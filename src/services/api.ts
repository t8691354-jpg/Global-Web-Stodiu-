import {
  WebsitePackage,
  PortfolioItem,
  PaymentMethodConfig,
  AgencySettings,
  CashbackPromoSettings,
  Order,
  AuditLogEntry,
  PromoDrawRecord,
  ContactInquiry,
} from '../types';

export interface PublicConfigResponse {
  settings: AgencySettings;
  packages: WebsitePackage[];
  paymentMethods: PaymentMethodConfig[];
  cashbackPromo: {
    enabled: boolean;
    currentWeekBoundaryStart: string;
    currentWeekBoundaryEnd: string;
    timezone: string;
    cashbackPercentage: number;
    maxAwardPerWinner: number;
    totalWeeklyBudget: number;
    publishedTerms: string;
  };
}

export interface AdminStatsResponse {
  totalOrders: number;
  awaitingPayment: number;
  proofsAwaitingReview: number;
  verifiedPayments: number;
  inProgress: number;
  completed: number;
  refunded: number;
  totalRevenueVerified: number;
  weeklySalesVolume: number;
  weeklyVerifiedCount: number;
  cashbackLiabilities: number;
  recentOrders: Order[];
  recentAuditLogs: AuditLogEntry[];
}

function getAdminToken(): string | null {
  return localStorage.getItem('gws_admin_token');
}

export const api = {
  // Public
  async getConfig(): Promise<PublicConfigResponse> {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('Failed to load studio configuration');
    return res.json();
  },

  async getPackages(): Promise<WebsitePackage[]> {
    const res = await fetch('/api/packages');
    if (!res.ok) throw new Error('Failed to load packages');
    return res.json();
  },

  async getPortfolio(): Promise<PortfolioItem[]> {
    const res = await fetch('/api/portfolio');
    if (!res.ok) throw new Error('Failed to load portfolio items');
    return res.json();
  },

  async submitContact(inquiry: {
    name: string;
    email: string;
    country: string;
    businessType: string;
    serviceRequired: string;
    budgetRange: string;
    projectDescription: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiry),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit inquiry');
    return data;
  },

  // Orders
  async createOrder(orderPayload: {
    customerName: string;
    email: string;
    country: string;
    businessName?: string;
    packageId: string;
    projectRequirements: string;
    requiredFeatures: string[];
    preferredDeliveryDate?: string;
    additionalNotes?: string;
  }): Promise<{ success: boolean; orderRef: string; clientAccessToken: string; order: Order }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create order');
    return data;
  },

  async getOrder(orderRef: string, token?: string, email?: string): Promise<{
    order: Order;
    paymentMethods: PaymentMethodConfig[];
    agencySettings: AgencySettings;
  }> {
    const params = new URLSearchParams();
    if (token) params.set('token', token);
    if (email) params.set('email', email);

    const headers: Record<string, string> = {};
    const adminToken = getAdminToken();
    if (adminToken) headers['x-admin-token'] = adminToken;
    if (token) headers['x-order-token'] = token;

    const res = await fetch(`/api/orders/${encodeURIComponent(orderRef)}?${params.toString()}`, {
      headers,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch order details');
    return data;
  },

  async uploadPaymentProof(
    orderRef: string,
    formData: FormData,
    clientAccessToken?: string
  ): Promise<{ success: boolean; message: string; order: Order }> {
    const headers: Record<string, string> = {};
    const adminToken = getAdminToken();
    if (adminToken) headers['x-admin-token'] = adminToken;
    if (clientAccessToken) headers['x-order-token'] = clientAccessToken;

    const res = await fetch(`/api/orders/${encodeURIComponent(orderRef)}/proof`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload payment proof');
    return data;
  },

  // Admin Auth
  async adminLogin(email: string, password: string): Promise<{ token: string; user: any }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('gws_admin_token', data.token);
    return data;
  },

  async adminLogout(): Promise<void> {
    const token = getAdminToken();
    if (token) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'x-admin-token': token },
      }).catch(() => {});
      localStorage.removeItem('gws_admin_token');
    }
  },

  async checkAdminAuth(): Promise<any> {
    const token = getAdminToken();
    if (!token) return null;
    try {
      const res = await fetch('/api/admin/me', {
        headers: { 'x-admin-token': token },
      });
      if (!res.ok) {
        localStorage.removeItem('gws_admin_token');
        return null;
      }
      return (await res.json()).user;
    } catch {
      return null;
    }
  },

  // Admin Actions
  async getAdminStats(): Promise<AdminStatsResponse> {
    const token = getAdminToken();
    const res = await fetch('/api/admin/dashboard-stats', {
      headers: { 'x-admin-token': token || '' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load admin stats');
    return data;
  },

  async getAdminOrders(): Promise<Order[]> {
    const token = getAdminToken();
    const res = await fetch('/api/admin/orders', {
      headers: { 'x-admin-token': token || '' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load orders');
    return data;
  },

  async verifyPaymentProof(orderRef: string, proofId: string, verifiedAmount?: number, notes?: string): Promise<any> {
    const token = getAdminToken();
    const res = await fetch(`/api/admin/orders/${orderRef}/verify-proof`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify({ proofId, verifiedAmount, notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    return data;
  },

  async rejectPaymentProof(
    orderRef: string,
    proofId: string,
    rejectionReason: string,
    isCorrectionRequest?: boolean
  ): Promise<any> {
    const token = getAdminToken();
    const res = await fetch(`/api/admin/orders/${orderRef}/reject-proof`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify({ proofId, rejectionReason, isCorrectionRequest }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Rejection failed');
    return data;
  },

  async updateProjectStatus(orderRef: string, newStatus: string, note?: string): Promise<any> {
    const token = getAdminToken();
    const res = await fetch(`/api/admin/orders/${orderRef}/update-project-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify({ newStatus, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update status failed');
    return data;
  },

  async recordRefund(orderRef: string, refundAmount: number, reason: string): Promise<any> {
    const token = getAdminToken();
    const res = await fetch(`/api/admin/orders/${orderRef}/record-refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify({ refundAmount, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Refund failed');
    return data;
  },

  async updatePackages(packages: WebsitePackage[]): Promise<any> {
    const token = getAdminToken();
    const res = await fetch('/api/admin/packages', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify({ packages }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update packages');
    return data;
  },

  async updatePortfolio(portfolio: PortfolioItem[]): Promise<any> {
    const token = getAdminToken();
    const res = await fetch('/api/admin/portfolio', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify({ portfolio }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update portfolio');
    return data;
  },

  async updatePaymentMethods(paymentMethods: PaymentMethodConfig[]): Promise<any> {
    const token = getAdminToken();
    const res = await fetch('/api/admin/payment-methods', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify({ paymentMethods }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update payment methods');
    return data;
  },

  async updateAgencySettings(settings: AgencySettings): Promise<any> {
    const token = getAdminToken();
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify({ settings }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update agency settings');
    return data;
  },

  // Cashback promotion
  async getCashbackAdmin(): Promise<{ settings: CashbackPromoSettings; draws: PromoDrawRecord[] }> {
    const token = getAdminToken();
    const res = await fetch('/api/admin/cashback/config', {
      headers: { 'x-admin-token': token || '' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load cashback config');
    return data;
  },

  async updateCashbackAdmin(cashbackSettings: CashbackPromoSettings): Promise<any> {
    const token = getAdminToken();
    const res = await fetch('/api/admin/cashback/config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify({ cashbackSettings }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update cashback settings');
    return data;
  },

  async getCashbackEligibleOrders(): Promise<{ count: number; eligibleOrders: any[] }> {
    const token = getAdminToken();
    const res = await fetch('/api/admin/cashback/eligible-orders', {
      headers: { 'x-admin-token': token || '' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch eligible orders');
    return data;
  },

  async runCashbackDraw(): Promise<any> {
    const token = getAdminToken();
    const res = await fetch('/api/admin/cashback/run-draw', {
      method: 'POST',
      headers: { 'x-admin-token': token || '' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to execute draw');
    return data;
  },

  async lockCashbackDraw(drawResult: any, auditNote: string): Promise<any> {
    const token = getAdminToken();
    const res = await fetch('/api/admin/cashback/lock-draw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify({ drawResult, auditNote }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to lock draw');
    return data;
  },

  async verifyCashbackPayout(drawId: string, winnerType: 'random' | 'highest', verificationDetails: string): Promise<any> {
    const token = getAdminToken();
    const res = await fetch('/api/admin/cashback/payout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify({ drawId, winnerType, verificationDetails }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to record payout');
    return data;
  },

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const token = getAdminToken();
    const res = await fetch('/api/admin/audit-logs', {
      headers: { 'x-admin-token': token || '' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load audit logs');
    return data;
  },

  async getContactInquiries(): Promise<ContactInquiry[]> {
    const token = getAdminToken();
    const res = await fetch('/api/admin/contact-inquiries', {
      headers: { 'x-admin-token': token || '' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load inquiries');
    return data;
  },

  async updateInquiryStatus(id: string, status: 'new' | 'responded' | 'archived'): Promise<any> {
    const token = getAdminToken();
    const res = await fetch(`/api/admin/contact-inquiries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // ==========================================
  // CUSTOM PROJECT REQUESTS & DEALS
  // ==========================================
  async submitCustomRequest(formData: FormData): Promise<{
    success: boolean;
    requestId: string;
    clientAccessToken: string;
    customRequest: any;
  }> {
    const res = await fetch('/api/custom-requests', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit custom project request');
    return data;
  },

  async getCustomRequest(requestId: string, token?: string, email?: string): Promise<{
    customRequest: any;
    quotations: any[];
    linkedOrder: any;
    paymentMethods: PaymentMethodConfig[];
  }> {
    const params = new URLSearchParams();
    if (token) params.set('token', token);
    if (email) params.set('email', email);

    const headers: Record<string, string> = {};
    const adminToken = getAdminToken();
    if (adminToken) headers['x-admin-token'] = adminToken;
    if (token) headers['x-order-token'] = token;

    const res = await fetch(`/api/custom-requests/${encodeURIComponent(requestId)}?${params.toString()}`, {
      headers,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load custom project request');
    return data;
  },

  async postCustomRequestMessage(requestId: string, message: string, token?: string): Promise<any> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const adminToken = getAdminToken();
    if (adminToken) headers['x-admin-token'] = adminToken;
    if (token) headers['x-order-token'] = token;

    const res = await fetch(`/api/custom-requests/${encodeURIComponent(requestId)}/message`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, token }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');
    return data;
  },

  async getCustomerPortalRequests(email?: string, token?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (email) params.set('email', email);
    if (token) params.set('token', token);

    const res = await fetch(`/api/customer-portal/requests?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load customer requests');
    return data.requests || [];
  },

  // Quotations
  async getQuotation(quotationId: string, token?: string): Promise<{
    quotation: any;
    customRequest: any;
    linkedOrder: any;
    paymentMethods: PaymentMethodConfig[];
  }> {
    const params = new URLSearchParams();
    if (token) params.set('token', token);

    const headers: Record<string, string> = {};
    const adminToken = getAdminToken();
    if (adminToken) headers['x-admin-token'] = adminToken;
    if (token) headers['x-order-token'] = token;

    const res = await fetch(`/api/quotations/${encodeURIComponent(quotationId)}?${params.toString()}`, {
      headers,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load quotation');
    return data;
  },

  async acceptQuotation(quotationId: string, clientAccessToken: string, signature?: string, notes?: string): Promise<any> {
    const res = await fetch(`/api/quotations/${encodeURIComponent(quotationId)}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientAccessToken, acceptanceSignature: signature, acceptanceNotes: notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to accept quotation');
    return data;
  },

  async declineQuotation(quotationId: string, clientAccessToken: string, reason?: string): Promise<any> {
    const res = await fetch(`/api/quotations/${encodeURIComponent(quotationId)}/decline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientAccessToken, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to decline quotation');
    return data;
  },

  // Milestone payment proof
  async uploadMilestoneProof(orderRef: string, milestoneId: string, formData: FormData, token?: string): Promise<any> {
    const headers: Record<string, string> = {};
    const adminToken = getAdminToken();
    if (adminToken) headers['x-admin-token'] = adminToken;
    if (token) headers['x-order-token'] = token;

    const res = await fetch(`/api/orders/${encodeURIComponent(orderRef)}/milestones/${encodeURIComponent(milestoneId)}/proof`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload milestone payment proof');
    return data;
  },

  // Admin Custom Project Endpoints
  async getAdminCustomRequests(): Promise<any[]> {
    const token = getAdminToken();
    const res = await fetch('/api/admin/custom-requests', {
      headers: { 'x-admin-token': token || '' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load custom requests');
    return data;
  },

  async updateCustomRequestStatus(requestId: string, status: string, note?: string): Promise<any> {
    const token = getAdminToken();
    const res = await fetch(`/api/admin/custom-requests/${encodeURIComponent(requestId)}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify({ status, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update request status');
    return data;
  },

  async addAdminInternalNote(requestId: string, note: string): Promise<any> {
    const token = getAdminToken();
    const res = await fetch(`/api/admin/custom-requests/${encodeURIComponent(requestId)}/internal-note`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify({ note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add internal note');
    return data;
  },

  async saveAdminInternalEstimate(requestId: string, estimates: any): Promise<any> {
    const token = getAdminToken();
    const res = await fetch(`/api/admin/custom-requests/${encodeURIComponent(requestId)}/internal-estimate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify(estimates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save estimate');
    return data;
  },

  async askClientMoreInfo(requestId: string, message: string): Promise<any> {
    const token = getAdminToken();
    const res = await fetch(`/api/admin/custom-requests/${encodeURIComponent(requestId)}/ask-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send inquiry to client');
    return data;
  },

  async createQuotation(requestId: string, quotationData: any): Promise<any> {
    const token = getAdminToken();
    const res = await fetch(`/api/admin/custom-requests/${encodeURIComponent(requestId)}/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify(quotationData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to issue quotation');
    return data;
  },

  async reviseQuotation(quotationId: string, revisionData: any): Promise<any> {
    const token = getAdminToken();
    const res = await fetch(`/api/admin/quotations/${encodeURIComponent(quotationId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify(revisionData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to revise quotation');
    return data;
  },

  async verifyMilestoneProof(orderRef: string, milestoneId: string, proofId: string, verifiedAmount?: number, notes?: string): Promise<any> {
    const token = getAdminToken();
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderRef)}/milestones/${encodeURIComponent(milestoneId)}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify({ proofId, verifiedAmount, notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Milestone verification failed');
    return data;
  },

  async rejectMilestoneProof(orderRef: string, milestoneId: string, proofId: string, rejectionReason: string, isCorrectionRequest?: boolean): Promise<any> {
    const token = getAdminToken();
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderRef)}/milestones/${encodeURIComponent(milestoneId)}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify({ proofId, rejectionReason, isCorrectionRequest }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Milestone rejection failed');
    return data;
  },

  // Package Catalog Management
  async createCatalogPackage(packageData: any): Promise<any> {
    const token = getAdminToken();
    const res = await fetch('/api/admin/packages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify(packageData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create package');
    return data;
  },

  async updateCatalogPackage(id: string, updateData: any): Promise<any> {
    const token = getAdminToken();
    const res = await fetch(`/api/admin/packages/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || '',
      },
      body: JSON.stringify(updateData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update package');
    return data;
  },

  async deleteCatalogPackage(id: string): Promise<any> {
    const token = getAdminToken();
    const res = await fetch(`/api/admin/packages/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': token || '' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete package');
    return data;
  },

  // Notifications
  async getNotifications(email?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (email) params.set('email', email);
    const headers: Record<string, string> = {};
    const adminToken = getAdminToken();
    if (adminToken) headers['x-admin-token'] = adminToken;

    const res = await fetch(`/api/notifications?${params.toString()}`, { headers });
    const data = await res.json();
    return data.notifications || [];
  },

  async markNotificationRead(id: string): Promise<any> {
    const res = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'PUT' });
    return res.json();
  },
};

