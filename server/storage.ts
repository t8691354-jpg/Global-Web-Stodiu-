import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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
  CustomProjectRequest,
  ProjectQuotation,
  NotificationEvent,
} from '../src/types';
import {
  initialAgencySettings,
  initialPackages,
  initialPortfolioItems,
  initialPaymentMethods,
  initialCashbackPromoSettings,
} from '../src/data/initialData';

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string; // SHA-256 with salt
  salt: string;
  role: 'super_admin' | 'finance_admin';
  name: string;
}

export interface DatabaseSchema {
  packages: WebsitePackage[];
  portfolio: PortfolioItem[];
  paymentMethods: PaymentMethodConfig[];
  settings: AgencySettings;
  cashbackSettings: CashbackPromoSettings;
  orders: Order[];
  auditLogs: AuditLogEntry[];
  promoDraws: PromoDrawRecord[];
  contactInquiries: ContactInquiry[];
  adminUsers: AdminUser[];
  customRequests: CustomProjectRequest[];
  quotations: ProjectQuotation[];
  notifications: NotificationEvent[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const PRIVATE_UPLOADS_DIR = path.resolve(process.cwd(), 'private_uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(PRIVATE_UPLOADS_DIR)) {
  fs.mkdirSync(PRIVATE_UPLOADS_DIR, { recursive: true });
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Default initial admin credentials
const defaultSalt = 'gws_secure_salt_2026';
const defaultAdminHash = hashPassword('Admin@GlobalWeb2026!', defaultSalt);

const defaultAdminUser: AdminUser = {
  id: 'admin-master-1',
  email: 'admin@globalwebstudio.com',
  name: 'Studio Finance Director',
  passwordHash: defaultAdminHash,
  salt: defaultSalt,
  role: 'super_admin',
};

function getInitialData(): DatabaseSchema {
  return {
    packages: initialPackages,
    portfolio: initialPortfolioItems,
    paymentMethods: initialPaymentMethods,
    settings: initialAgencySettings,
    cashbackSettings: initialCashbackPromoSettings,
    orders: [],
    auditLogs: [
      {
        id: `audit-${Date.now()}-init`,
        timestamp: new Date().toISOString(),
        action: 'SYSTEM_INITIALIZED',
        actor: 'system',
        targetType: 'settings',
        targetId: 'system',
        details: 'GlobalWeb Studio core database initialized with catalog ($80 - $2,000,000) and payment methods.',
      },
    ],
    promoDraws: [],
    contactInquiries: [],
    adminUsers: [defaultAdminUser],
    customRequests: [],
    quotations: [],
    notifications: [],
  };
}

class Store {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        // If existing store only has the original 4 packages, upgrade with the expanded catalog from $80 to $2M
        let loadedPackages = parsed.packages || initialPackages;
        if (!loadedPackages || loadedPackages.length < 10) {
          loadedPackages = initialPackages;
        }

        return {
          packages: loadedPackages,
          portfolio: parsed.portfolio || initialPortfolioItems,
          paymentMethods: parsed.paymentMethods || initialPaymentMethods,
          settings: { ...initialAgencySettings, ...(parsed.settings || {}) },
          cashbackSettings: parsed.cashbackSettings || initialCashbackPromoSettings,
          orders: parsed.orders || [],
          auditLogs: parsed.auditLogs || [],
          promoDraws: parsed.promoDraws || [],
          contactInquiries: parsed.contactInquiries || [],
          adminUsers: parsed.adminUsers && parsed.adminUsers.length > 0 ? parsed.adminUsers : [defaultAdminUser],
          customRequests: parsed.customRequests || [],
          quotations: parsed.quotations || [],
          notifications: parsed.notifications || [],
        };
      }
    } catch (err) {
      console.error('Failed to load store, initializing fresh data:', err);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save store to disk:', err);
    }
  }

  public save() {
    this.saveData(this.data);
  }

  // Getters
  public getPackages(): WebsitePackage[] {
    // Return packages in ascending price order
    return [...this.data.packages].sort((a, b) => a.price - b.price);
  }

  public getPortfolio(): PortfolioItem[] {
    return this.data.portfolio;
  }

  public getPaymentMethods(): PaymentMethodConfig[] {
    return this.data.paymentMethods;
  }

  public getSettings(): AgencySettings {
    return this.data.settings;
  }

  public getCashbackSettings(): CashbackPromoSettings {
    return this.data.cashbackSettings;
  }

  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getAuditLogs(): AuditLogEntry[] {
    return this.data.auditLogs;
  }

  public getPromoDraws(): PromoDrawRecord[] {
    return this.data.promoDraws;
  }

  public getContactInquiries(): ContactInquiry[] {
    return this.data.contactInquiries;
  }

  public getAdminUsers(): AdminUser[] {
    return this.data.adminUsers;
  }

  public getCustomRequests(): CustomProjectRequest[] {
    return this.data.customRequests;
  }

  public getQuotations(): ProjectQuotation[] {
    return this.data.quotations;
  }

  public getNotifications(): NotificationEvent[] {
    return this.data.notifications;
  }

  // Modifiers
  public setPackages(packages: WebsitePackage[]) {
    this.data.packages = packages;
    this.save();
  }

  public setPortfolio(portfolio: PortfolioItem[]) {
    this.data.portfolio = portfolio;
    this.save();
  }

  public setPaymentMethods(methods: PaymentMethodConfig[]) {
    this.data.paymentMethods = methods;
    this.save();
  }

  public setSettings(settings: AgencySettings) {
    this.data.settings = settings;
    this.save();
  }

  public setCashbackSettings(settings: CashbackPromoSettings) {
    this.data.cashbackSettings = settings;
    this.save();
  }

  public addOrder(order: Order) {
    this.data.orders.unshift(order);
    this.save();
  }

  public updateOrder(orderRef: string, updater: (order: Order) => void): Order | null {
    const order = this.data.orders.find((o) => o.orderRef === orderRef);
    if (!order) return null;
    updater(order);
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const log: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.data.auditLogs.unshift(log);
    this.save();
  }

  public addPromoDraw(draw: PromoDrawRecord) {
    this.data.promoDraws.unshift(draw);
    this.save();
  }

  public updatePromoDraw(id: string, updater: (draw: PromoDrawRecord) => void): PromoDrawRecord | null {
    const draw = this.data.promoDraws.find((d) => d.id === id);
    if (!draw) return null;
    updater(draw);
    this.save();
    return draw;
  }

  public addContactInquiry(inquiry: ContactInquiry) {
    this.data.contactInquiries.unshift(inquiry);
    this.save();
  }

  public updateContactInquiryStatus(id: string, status: 'new' | 'responded' | 'archived') {
    const inquiry = this.data.contactInquiries.find((i) => i.id === id);
    if (inquiry) {
      inquiry.status = status;
      this.save();
    }
  }

  // Custom Project Requests
  public addCustomRequest(request: CustomProjectRequest) {
    this.data.customRequests.unshift(request);
    this.save();
  }

  public updateCustomRequest(requestId: string, updater: (req: CustomProjectRequest) => void): CustomProjectRequest | null {
    const req = this.data.customRequests.find((r) => r.requestId === requestId);
    if (!req) return null;
    updater(req);
    req.updatedAt = new Date().toISOString();
    this.save();
    return req;
  }

  // Quotations
  public addQuotation(quotation: ProjectQuotation) {
    this.data.quotations.unshift(quotation);
    this.save();
  }

  public updateQuotation(quotationId: string, updater: (q: ProjectQuotation) => void): ProjectQuotation | null {
    const quot = this.data.quotations.find((q) => q.quotationId === quotationId);
    if (!quot) return null;
    updater(quot);
    this.save();
    return quot;
  }

  // Notifications
  public addNotification(notification: Omit<NotificationEvent, 'id' | 'timestamp' | 'read'>) {
    const notif: NotificationEvent = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };
    this.data.notifications.unshift(notif);
    this.save();
  }

  public markNotificationAsRead(id: string) {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
    }
  }

  public updateAdminPassword(email: string, newPasswordPlain: string): boolean {
    const user = this.data.adminUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return false;
    const newSalt = crypto.randomBytes(16).toString('hex');
    user.salt = newSalt;
    user.passwordHash = hashPassword(newPasswordPlain, newSalt);
    this.save();
    return true;
  }
}

export const db = new Store();
export { PRIVATE_UPLOADS_DIR };
