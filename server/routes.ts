import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { db, PRIVATE_UPLOADS_DIR } from './storage';
import { loginAdmin, verifyAdminSession, logoutAdmin } from './auth';
import {
  Order,
  PaymentProof,
  VerificationStatus,
  OrderStatus,
  ContactInquiry,
  PromoDrawRecord,
} from '../src/types';

export const apiRouter = express.Router();

// --- Simple in-memory rate limiter for anti-spam on public forms ---
const rateLimits = new Map<string, { count: number; resetTime: number }>();
function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const current = rateLimits.get(ip);
    if (!current || now > current.resetTime) {
      rateLimits.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    if (current.count >= limit) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
    }
    current.count++;
    next();
  };
}

// --- Multer configuration for private payment proof uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PRIVATE_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(12).toString('hex');
    const safeExt = path.extname(file.originalname).toLowerCase();
    cb(null, `proof-${Date.now()}-${randomHex}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf', 'image/jpg'];
    const safeExts = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) && safeExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only JPG, PNG, and PDF receipts are accepted.'));
    }
  },
});

// --- Auth Middleware for Admin Routes ---
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-admin-token'] as string | undefined;
  const session = verifyAdminSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Administrative authentication required.' });
  }
  (req as any).admin = session;
  next();
}

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// GET /api/config — Public studio configuration
apiRouter.get('/config', (req: Request, res: Response) => {
  const settings = db.getSettings();
  const packages = db.getPackages().filter((p) => p.active);
  const paymentMethods = db.getPaymentMethods().filter((m) => m.enabled);
  const promo = db.getCashbackSettings();

  res.json({
    settings,
    packages,
    paymentMethods,
    cashbackPromo: {
      enabled: promo.enabled,
      currentWeekBoundaryStart: promo.currentWeekBoundaryStart,
      currentWeekBoundaryEnd: promo.currentWeekBoundaryEnd,
      timezone: promo.timezone,
      cashbackPercentage: promo.cashbackPercentage,
      maxAwardPerWinner: promo.maxAwardPerWinner,
      totalWeeklyBudget: promo.totalWeeklyBudget,
      publishedTerms: promo.publishedTerms,
    },
  });
});

// GET /api/packages — All packages
apiRouter.get('/packages', (req: Request, res: Response) => {
  res.json(db.getPackages());
});

// GET /api/portfolio — Portfolio items
apiRouter.get('/portfolio', (req: Request, res: Response) => {
  res.json(db.getPortfolio());
});

// POST /api/contact — Public contact form with rate limiting & server validation
apiRouter.post('/contact', rateLimiter(5, 60 * 1000), (req: Request, res: Response) => {
  const { name, email, country, businessType, serviceRequired, budgetRange, projectDescription } = req.body;

  if (!name || !email || !projectDescription) {
    return res.status(400).json({ error: 'Name, email, and project description are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const inquiry: ContactInquiry = {
    id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: String(name).trim().slice(0, 100),
    email: String(email).trim().toLowerCase().slice(0, 100),
    country: String(country || 'Not specified').trim().slice(0, 50),
    businessType: String(businessType || 'General').trim().slice(0, 50),
    serviceRequired: String(serviceRequired || 'Website Development').trim().slice(0, 50),
    budgetRange: String(budgetRange || 'Not specified').trim().slice(0, 50),
    projectDescription: String(projectDescription).trim().slice(0, 3000),
    createdAt: new Date().toISOString(),
    status: 'new',
  };

  db.addContactInquiry(inquiry);
  db.addAuditLog({
    action: 'CONTACT_INQUIRY_RECEIVED',
    actor: inquiry.email,
    targetType: 'settings',
    targetId: inquiry.id,
    details: `Inquiry submitted by ${inquiry.name} (${inquiry.email}) for ${inquiry.serviceRequired}`,
  });

  res.status(201).json({ success: true, message: 'Inquiry received. A senior engineer will respond shortly.' });
});

// Helper: Generate safe non-sequential reference
function generateUniqueOrderRef(): string {
  const prefix = db.getSettings().orderPrefix || 'GWS';
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars 0, 1, I, O
  let ref = '';
  let attempts = 0;
  const existingRefs = new Set(db.getOrders().map((o) => o.orderRef));

  do {
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    ref = `${prefix}-${year}-${randomPart}`;
    attempts++;
  } while (existingRefs.has(ref) && attempts < 100);

  return ref;
}

// POST /api/orders — Customer creates an order
apiRouter.post('/orders', rateLimiter(10, 60 * 1000), (req: Request, res: Response) => {
  const {
    customerName,
    email,
    country,
    businessName,
    packageId,
    projectRequirements,
    requiredFeatures,
    preferredDeliveryDate,
    additionalNotes,
  } = req.body;

  if (!customerName || !email || !country || !packageId || !projectRequirements) {
    return res.status(400).json({ error: 'Please fill in all mandatory order details.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address for order notifications.' });
  }

  const pkg = db.getPackages().find((p) => p.id === packageId && p.active);
  if (!pkg) {
    return res.status(400).json({ error: 'The selected website package is unavailable or invalid.' });
  }

  const orderRef = generateUniqueOrderRef();
  const clientAccessToken = crypto.randomBytes(24).toString('hex');
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: `ord-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    orderRef,
    customerName: String(customerName).trim().slice(0, 100),
    email: String(email).trim().toLowerCase().slice(0, 120),
    country: String(country).trim().slice(0, 60),
    businessName: businessName ? String(businessName).trim().slice(0, 100) : undefined,
    packageId: pkg.id,
    packageName: pkg.name,
    packagePrice: pkg.price,
    currency: 'USD',
    projectRequirements: String(projectRequirements).trim().slice(0, 5000),
    requiredFeatures: Array.isArray(requiredFeatures) ? requiredFeatures.map((f) => String(f).slice(0, 100)) : [],
    preferredDeliveryDate: preferredDeliveryDate ? String(preferredDeliveryDate).slice(0, 50) : undefined,
    additionalNotes: additionalNotes ? String(additionalNotes).trim().slice(0, 2000) : undefined,
    createdAt: now,
    updatedAt: now,
    status: 'awaiting_payment',
    verificationStatus: 'none',
    proofs: [],
    totalPaid: 0,
    clientAccessToken,
  };

  db.addOrder(newOrder);

  db.addAuditLog({
    action: 'ORDER_CREATED',
    actor: newOrder.email,
    targetType: 'order',
    targetId: orderRef,
    details: `Order created for package "${pkg.name}" ($${pkg.price}). Status: awaiting_payment.`,
  });

  res.status(201).json({
    success: true,
    orderRef: newOrder.orderRef,
    clientAccessToken,
    order: newOrder,
  });
});

// GET /api/orders/:orderRef — Retrieve order details securely
apiRouter.get('/orders/:orderRef', (req: Request, res: Response) => {
  const { orderRef } = req.params;
  const token = (req.query.token as string) || (req.headers['x-order-token'] as string);
  const emailQuery = (req.query.email as string)?.trim().toLowerCase();
  const adminToken = req.headers['x-admin-token'] as string | undefined;

  const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
  if (!order) {
    return res.status(404).json({ error: 'Order not found with the provided reference.' });
  }

  const isAdmin = !!verifyAdminSession(adminToken);
  const isAuthorizedCustomer = (token && token === order.clientAccessToken) || (emailQuery && emailQuery === order.email.toLowerCase());

  if (!isAdmin && !isAuthorizedCustomer) {
    return res.status(403).json({ error: 'Access denied. Valid order access token or customer email required.' });
  }

  // Active payment methods to show instructions
  const paymentMethods = db.getPaymentMethods().filter((m) => m.enabled);

  res.json({
    order,
    paymentMethods,
    agencySettings: db.getSettings(),
  });
});

// POST /api/orders/:orderRef/proof — Upload payment proof
apiRouter.post(
  '/orders/:orderRef/proof',
  upload.single('proofFile'),
  (req: Request, res: Response) => {
    const { orderRef } = req.params;
    const {
      clientAccessToken,
      paymentMethodId,
      amountTransferred,
      currency,
      transferDate,
      transactionReference,
      customerNote,
    } = req.body;

    const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
    if (!order) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Order reference not found.' });
    }

    const adminToken = req.headers['x-admin-token'] as string | undefined;
    const isAdmin = !!verifyAdminSession(adminToken);
    const isOwner = clientAccessToken && clientAccessToken === order.clientAccessToken;

    if (!isAdmin && !isOwner) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Unauthorized to upload proof for this order.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Payment receipt file is required (JPG, PNG, or PDF).' });
    }

    const parsedAmount = parseFloat(amountTransferred);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Please enter a valid transferred amount greater than 0.' });
    }

    if (!transactionReference || String(transactionReference).trim() === '') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Bank transaction or remittance reference number is required.' });
    }

    const proofId = `prf-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const newProof: PaymentProof = {
      id: proofId,
      orderRef: order.orderRef,
      paymentMethodId: String(paymentMethodId || 'bank_transfer'),
      amountTransferred: parsedAmount,
      currency: String(currency || 'USD').toUpperCase(),
      transferDate: String(transferDate || new Date().toISOString().split('T')[0]),
      transactionReference: String(transactionReference).trim(),
      fileName: req.file.filename,
      fileOriginalName: req.file.originalname,
      fileMimeType: req.file.mimetype,
      fileSizeBytes: req.file.size,
      fileUrl: `/api/orders/${order.orderRef}/proof-file/${proofId}`,
      customerNote: customerNote ? String(customerNote).trim().slice(0, 500) : undefined,
      submittedAt: new Date().toISOString(),
      verificationStatus: 'pending_review',
    };

    // Update order atomically
    db.updateOrder(order.orderRef, (ord) => {
      ord.proofs.unshift(newProof);
      ord.activeProofId = newProof.id;
      ord.status = 'proof_submitted';
      ord.verificationStatus = 'pending_review';
    });

    db.addAuditLog({
      action: 'PAYMENT_PROOF_SUBMITTED',
      actor: order.email,
      targetType: 'proof',
      targetId: newProof.id,
      details: `Proof submitted for Order ${order.orderRef}. Amount: ${newProof.currency} ${newProof.amountTransferred}, TxRef: "${newProof.transactionReference}". Awaiting admin manual verification.`,
    });

    res.status(201).json({
      success: true,
      message: 'Proof Submitted — Awaiting Verification. Our finance team will verify the transfer against bank records.',
      proof: newProof,
      order: db.getOrders().find((o) => o.orderRef === order.orderRef),
    });
  }
);

// GET /api/orders/:orderRef/proof-file/:proofId — Strictly private proof file download
apiRouter.get('/orders/:orderRef/proof-file/:proofId', (req: Request, res: Response) => {
  const { orderRef, proofId } = req.params;
  const token = (req.query.token as string) || (req.headers['x-order-token'] as string);
  const adminToken = req.headers['x-admin-token'] as string | undefined;

  const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const isAdmin = !!verifyAdminSession(adminToken);
  const isOwner = token && token === order.clientAccessToken;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: 'Unauthorized. Only the order owner or studio finance admin can access payment proofs.' });
  }

  const proof = order.proofs.find((p) => p.id === proofId);
  if (!proof) {
    return res.status(404).json({ error: 'Payment proof document not found.' });
  }

  const filePath = path.join(PRIVATE_UPLOADS_DIR, proof.fileName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Proof file no longer exists on private server storage.' });
  }

  res.setHeader('Content-Type', proof.fileMimeType);
  res.setHeader('Content-Disposition', `inline; filename="${proof.fileOriginalName.replace(/"/g, '')}"`);
  res.sendFile(filePath);
});

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = loginAdmin(email, password);
  if (!result.success || !result.session) {
    return res.status(401).json({ error: result.error || 'Authentication failed.' });
  }
  res.json({
    success: true,
    token: result.session.token,
    user: {
      id: result.session.adminId,
      email: result.session.email,
      name: result.session.name,
      role: result.session.role,
    },
  });
});

apiRouter.post('/admin/logout', (req: Request, res: Response) => {
  const token = req.headers['x-admin-token'] as string;
  if (token) {
    logoutAdmin(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

apiRouter.get('/admin/me', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).admin;
  res.json({ user: admin });
});

// ==========================================
// ADMIN DASHBOARD & WORKFLOWS
// ==========================================

// GET /api/admin/dashboard-stats — Truthful statistics computed directly from store
apiRouter.get('/admin/dashboard-stats', requireAdmin, (req: Request, res: Response) => {
  const orders = db.getOrders();
  const promo = db.getCashbackSettings();
  const draws = db.getPromoDraws();

  const totalOrders = orders.length;
  const awaitingPayment = orders.filter((o) => o.status === 'awaiting_payment').length;
  const proofsAwaitingReview = orders.filter((o) => o.status === 'proof_submitted' || o.verificationStatus === 'pending_review').length;
  const verifiedPayments = orders.filter((o) => o.verificationStatus === 'verified').length;
  const inProgress = orders.filter((o) => o.status === 'in_progress' || o.status === 'review_ready').length;
  const completed = orders.filter((o) => o.status === 'completed').length;
  const refunded = orders.filter((o) => o.status === 'refunded').length;

  const totalRevenueVerified = orders
    .filter((o) => o.verificationStatus === 'verified')
    .reduce((sum, o) => sum + (o.totalPaid || o.packagePrice), 0);

  // Weekly sales in current boundary
  const weekStart = new Date(promo.currentWeekBoundaryStart).getTime();
  const weekEnd = new Date(promo.currentWeekBoundaryEnd).getTime();

  const weeklyOrders = orders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t >= weekStart && t < weekEnd && o.verificationStatus === 'verified';
  });

  const weeklySalesVolume = weeklyOrders.reduce((sum, o) => sum + (o.totalPaid || o.packagePrice), 0);

  // Cashback liabilities: unpaid locked awards
  let cashbackLiabilities = 0;
  draws.forEach((d) => {
    if (d.isLocked) {
      if (d.randomDrawWinner && !d.payoutStatus.randomWinnerPaid) {
        cashbackLiabilities += d.randomDrawWinner.cashbackAwarded;
      }
      if (d.highestValueWinner && !d.payoutStatus.highestWinnerPaid) {
        cashbackLiabilities += d.highestValueWinner.cashbackAwarded;
      }
    }
  });

  res.json({
    totalOrders,
    awaitingPayment,
    proofsAwaitingReview,
    verifiedPayments,
    inProgress,
    completed,
    refunded,
    totalRevenueVerified,
    weeklySalesVolume,
    weeklyVerifiedCount: weeklyOrders.length,
    cashbackLiabilities,
    recentOrders: orders.slice(0, 8),
    recentAuditLogs: db.getAuditLogs().slice(0, 10),
  });
});

// GET /api/admin/orders — List all orders
apiRouter.get('/admin/orders', requireAdmin, (req: Request, res: Response) => {
  res.json(db.getOrders());
});

// POST /api/admin/orders/:orderRef/verify-proof — Admin marks proof as verified
apiRouter.post('/admin/orders/:orderRef/verify-proof', requireAdmin, (req: Request, res: Response) => {
  const { orderRef } = req.params;
  const { proofId, verifiedAmount, notes } = req.body;
  const admin = (req as any).admin;

  const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const proof = order.proofs.find((p) => p.id === proofId);
  if (!proof) return res.status(404).json({ error: 'Proof not found.' });

  if (proof.verificationStatus === 'verified') {
    return res.status(400).json({ error: 'This payment proof has already been verified.' });
  }

  const finalAmount = verifiedAmount !== undefined ? parseFloat(verifiedAmount) : proof.amountTransferred;
  const now = new Date().toISOString();

  db.updateOrder(order.orderRef, (ord) => {
    const targetProof = ord.proofs.find((p) => p.id === proofId);
    if (targetProof) {
      targetProof.verificationStatus = 'verified';
      targetProof.verifiedAt = now;
      targetProof.verifiedBy = admin.email;
    }
    ord.verificationStatus = 'verified';
    ord.status = 'payment_verified';
    ord.totalPaid = finalAmount;
  });

  db.addAuditLog({
    action: 'PAYMENT_VERIFIED',
    actor: admin.email,
    targetType: 'order',
    targetId: order.orderRef,
    details: `Manual bank payment verified by ${admin.name}. Verified amount: $${finalAmount}. Notes: ${notes || 'Matches bank account statement.'}`,
  });

  res.json({
    success: true,
    message: 'Payment proof verified successfully. Order marked as Payment Verified.',
    order: db.getOrders().find((o) => o.orderRef === order.orderRef),
  });
});

// POST /api/admin/orders/:orderRef/reject-proof — Admin rejects proof or requests correction
apiRouter.post('/admin/orders/:orderRef/reject-proof', requireAdmin, (req: Request, res: Response) => {
  const { orderRef } = req.params;
  const { proofId, rejectionReason, isCorrectionRequest } = req.body;
  const admin = (req as any).admin;

  if (!rejectionReason || String(rejectionReason).trim() === '') {
    return res.status(400).json({ error: 'Please specify the reason for rejection or correction request.' });
  }

  const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const newStatus: VerificationStatus = isCorrectionRequest ? 'correction_requested' : 'rejected';

  db.updateOrder(order.orderRef, (ord) => {
    const targetProof = ord.proofs.find((p) => p.id === proofId);
    if (targetProof) {
      targetProof.verificationStatus = newStatus;
      targetProof.rejectionReason = String(rejectionReason).trim();
    }
    ord.verificationStatus = newStatus;
    ord.status = 'awaiting_payment';
  });

  db.addAuditLog({
    action: isCorrectionRequest ? 'PROOF_CORRECTION_REQUESTED' : 'PROOF_REJECTED',
    actor: admin.email,
    targetType: 'order',
    targetId: order.orderRef,
    details: `Proof ${proofId} set to "${newStatus}" by ${admin.name}. Reason: "${rejectionReason}".`,
  });

  res.json({
    success: true,
    message: isCorrectionRequest
      ? 'Correction requested. Customer can now upload a corrected receipt.'
      : 'Payment proof rejected.',
    order: db.getOrders().find((o) => o.orderRef === order.orderRef),
  });
});

// POST /api/admin/orders/:orderRef/update-project-status — Change project delivery state
apiRouter.post('/admin/orders/:orderRef/update-project-status', requireAdmin, (req: Request, res: Response) => {
  const { orderRef } = req.params;
  const { newStatus, note } = req.body;
  const admin = (req as any).admin;

  const validStatuses: OrderStatus[] = ['awaiting_payment', 'in_progress', 'review_ready', 'completed', 'cancelled'];
  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ error: 'Invalid project status provided.' });
  }

  const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const oldStatus = order.status;
  db.updateOrder(order.orderRef, (ord) => {
    ord.status = newStatus;
  });

  db.addAuditLog({
    action: 'PROJECT_STATUS_UPDATED',
    actor: admin.email,
    targetType: 'order',
    targetId: order.orderRef,
    details: `Status transitioned from "${oldStatus}" to "${newStatus}". Note: ${note || 'Status updated by project lead.'}`,
  });

  res.json({
    success: true,
    message: `Project status updated to ${newStatus}.`,
    order: db.getOrders().find((o) => o.orderRef === order.orderRef),
  });
});

// POST /api/admin/orders/:orderRef/record-refund — Record refund
apiRouter.post('/admin/orders/:orderRef/record-refund', requireAdmin, (req: Request, res: Response) => {
  const { orderRef } = req.params;
  const { refundAmount, reason } = req.body;
  const admin = (req as any).admin;

  const parsed = parseFloat(refundAmount);
  if (isNaN(parsed) || parsed <= 0) {
    return res.status(400).json({ error: 'Please enter a valid refund amount.' });
  }

  const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  db.updateOrder(order.orderRef, (ord) => {
    ord.status = 'refunded';
    ord.refundedAmount = (ord.refundedAmount || 0) + parsed;
  });

  db.addAuditLog({
    action: 'PAYMENT_REFUNDED',
    actor: admin.email,
    targetType: 'order',
    targetId: order.orderRef,
    details: `Refund of $${parsed} recorded by ${admin.name}. Reason: ${reason || 'Customer requested cancellation.'}`,
  });

  res.json({
    success: true,
    message: `Refund of $${parsed} recorded successfully.`,
    order: db.getOrders().find((o) => o.orderRef === order.orderRef),
  });
});

// ==========================================
// ADMIN CONFIGURATION & SETTINGS
// ==========================================

// Packages
apiRouter.put('/admin/packages', requireAdmin, (req: Request, res: Response) => {
  const { packages } = req.body;
  if (!Array.isArray(packages)) return res.status(400).json({ error: 'Packages array is required.' });
  db.setPackages(packages);
  db.addAuditLog({
    action: 'PACKAGES_UPDATED',
    actor: (req as any).admin.email,
    targetType: 'package',
    targetId: 'all',
    details: `Website packages updated. Count: ${packages.length}.`,
  });
  res.json({ success: true, packages: db.getPackages() });
});

// Portfolio
apiRouter.put('/admin/portfolio', requireAdmin, (req: Request, res: Response) => {
  const { portfolio } = req.body;
  if (!Array.isArray(portfolio)) return res.status(400).json({ error: 'Portfolio array is required.' });
  db.setPortfolio(portfolio);
  db.addAuditLog({
    action: 'PORTFOLIO_UPDATED',
    actor: (req as any).admin.email,
    targetType: 'settings',
    targetId: 'portfolio',
    details: `Portfolio showcases updated. Count: ${portfolio.length}.`,
  });
  res.json({ success: true, portfolio: db.getPortfolio() });
});

// Payment Methods
apiRouter.put('/admin/payment-methods', requireAdmin, (req: Request, res: Response) => {
  const { paymentMethods } = req.body;
  if (!Array.isArray(paymentMethods)) return res.status(400).json({ error: 'Payment methods array is required.' });
  db.setPaymentMethods(paymentMethods);
  db.addAuditLog({
    action: 'PAYMENT_METHODS_UPDATED',
    actor: (req as any).admin.email,
    targetType: 'payment_method',
    targetId: 'all',
    details: 'Bank transfer instructions and enabled methods updated by admin.',
  });
  res.json({ success: true, paymentMethods: db.getPaymentMethods() });
});

// General Settings
apiRouter.put('/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const { settings } = req.body;
  if (!settings) return res.status(400).json({ error: 'Settings object is required.' });
  db.setSettings(settings);
  db.addAuditLog({
    action: 'AGENCY_SETTINGS_UPDATED',
    actor: (req as any).admin.email,
    targetType: 'settings',
    targetId: 'agency',
    details: 'Agency business details, contact information, and hours updated.',
  });
  res.json({ success: true, settings: db.getSettings() });
});

// ==========================================
// WEEKLY CASHBACK PROMOTION MODULE
// ==========================================

// GET /api/admin/cashback/config
apiRouter.get('/admin/cashback/config', requireAdmin, (req: Request, res: Response) => {
  res.json({
    settings: db.getCashbackSettings(),
    draws: db.getPromoDraws(),
  });
});

// PUT /api/admin/cashback/config — Update promo settings
apiRouter.put('/admin/cashback/config', requireAdmin, (req: Request, res: Response) => {
  const { cashbackSettings } = req.body;
  if (!cashbackSettings) return res.status(400).json({ error: 'Cashback settings object is required.' });

  db.setCashbackSettings(cashbackSettings);
  db.addAuditLog({
    action: 'CASHBACK_CONFIG_UPDATED',
    actor: (req as any).admin.email,
    targetType: 'promo',
    targetId: 'config',
    details: `Cashback promotion settings updated. Enabled: ${cashbackSettings.enabled}, Percentage: ${cashbackSettings.cashbackPercentage}%, Budget: $${cashbackSettings.totalWeeklyBudget}.`,
  });
  res.json({ success: true, settings: db.getCashbackSettings() });
});

// GET /api/admin/cashback/eligible-orders — Returns verified qualifying orders within boundary
apiRouter.get('/admin/cashback/eligible-orders', requireAdmin, (req: Request, res: Response) => {
  const promo = db.getCashbackSettings();
  const weekStart = new Date(promo.currentWeekBoundaryStart).getTime();
  const weekEnd = new Date(promo.currentWeekBoundaryEnd).getTime();

  const qualifyingStatuses = ['payment_verified', 'in_progress', 'review_ready', 'completed'];

  const eligible = db.getOrders().filter((o) => {
    const createdTime = new Date(o.createdAt).getTime();
    return (
      createdTime >= weekStart &&
      createdTime < weekEnd &&
      qualifyingStatuses.includes(o.status) &&
      o.verificationStatus === 'verified' &&
      (!o.refundedAmount || o.refundedAmount === 0)
    );
  });

  res.json({
    count: eligible.length,
    eligibleOrders: eligible.map((o) => ({
      orderRef: o.orderRef,
      customerName: o.customerName,
      packageName: o.packageName,
      amount: o.totalPaid || o.packagePrice,
      createdAt: o.createdAt,
    })),
  });
});

// POST /api/admin/cashback/run-draw — Verifiable draw calculation
apiRouter.post('/admin/cashback/run-draw', requireAdmin, (req: Request, res: Response) => {
  const promo = db.getCashbackSettings();
  if (!promo.enabled) {
    return res.status(400).json({
      error: 'The promotion is currently disabled. Please confirm legal compliance and enable the module first.',
    });
  }

  const weekStart = new Date(promo.currentWeekBoundaryStart).getTime();
  const weekEnd = new Date(promo.currentWeekBoundaryEnd).getTime();
  const qualifyingStatuses = ['payment_verified', 'in_progress', 'review_ready', 'completed'];

  const eligibleOrders = db.getOrders().filter((o) => {
    const createdTime = new Date(o.createdAt).getTime();
    return (
      createdTime >= weekStart &&
      createdTime < weekEnd &&
      qualifyingStatuses.includes(o.status) &&
      o.verificationStatus === 'verified' &&
      (!o.refundedAmount || o.refundedAmount === 0)
    );
  });

  if (eligibleOrders.length === 0) {
    return res.status(400).json({
      error: 'No verified qualifying orders found within the configured weekly boundary.',
    });
  }

  // Calculate Award B: Highest-value qualifying purchase
  const sortedByAmount = [...eligibleOrders].sort((a, b) => {
    const amtA = a.totalPaid || a.packagePrice;
    const amtB = b.totalPaid || b.packagePrice;
    return amtB - amtA;
  });

  const highestOrder = sortedByAmount[0];
  const highestBase = highestOrder.totalPaid || highestOrder.packagePrice;
  const rawHighestAward = (highestBase * promo.cashbackPercentage) / 100;
  const highestAward = Math.min(rawHighestAward, promo.maxAwardPerWinner);

  // Eligible pool for Award A (Random Draw)
  let randomPool = eligibleOrders;
  if (!promo.allowDualWinner && eligibleOrders.length > 1) {
    randomPool = eligibleOrders.filter((o) => o.orderRef !== highestOrder.orderRef);
  }

  // Verifiable pseudorandom selection
  const seed = crypto.randomBytes(16).toString('hex');
  const randomIndex = Math.floor(Math.random() * randomPool.length);
  const randomWinnerOrder = randomPool[randomIndex];
  const randomBase = randomWinnerOrder.totalPaid || randomWinnerOrder.packagePrice;
  const rawRandomAward = (randomBase * promo.cashbackPercentage) / 100;
  const randomAward = Math.min(rawRandomAward, promo.maxAwardPerWinner);

  let totalAward = highestAward + randomAward;
  // Respect total studio budget
  if (totalAward > promo.totalWeeklyBudget) {
    // Pro-rate or cap proportionally
    const ratio = promo.totalWeeklyBudget / totalAward;
    totalAward = promo.totalWeeklyBudget;
  }

  const calculationResult = {
    weekStart: promo.currentWeekBoundaryStart,
    weekEnd: promo.currentWeekBoundaryEnd,
    totalEligible: eligibleOrders.length,
    randomDrawWinner: {
      orderRef: randomWinnerOrder.orderRef,
      customerName: randomWinnerOrder.customerName,
      orderAmount: randomBase,
      cashbackAwarded: randomAward,
    },
    highestValueWinner: {
      orderRef: highestOrder.orderRef,
      customerName: highestOrder.customerName,
      orderAmount: highestBase,
      cashbackAwarded: highestAward,
    },
    totalCashbackAwarded: totalAward,
    drawSeed: seed,
  };

  res.json({ success: true, calculationResult });
});

// POST /api/admin/cashback/lock-draw — Permanently record draw outcome
apiRouter.post('/admin/cashback/lock-draw', requireAdmin, (req: Request, res: Response) => {
  const { drawResult, auditNote } = req.body;
  const admin = (req as any).admin;

  if (!drawResult || !drawResult.randomDrawWinner || !drawResult.highestValueWinner) {
    return res.status(400).json({ error: 'Valid draw calculation result is required.' });
  }

  const record: PromoDrawRecord = {
    id: `draw-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    weekStart: drawResult.weekStart,
    weekEnd: drawResult.weekEnd,
    drawDate: new Date().toISOString(),
    randomDrawWinner: drawResult.randomDrawWinner,
    highestValueWinner: drawResult.highestValueWinner,
    totalCashbackAwarded: drawResult.totalCashbackAwarded,
    isLocked: true,
    published: true,
    drawSeedOrProof: drawResult.drawSeed || crypto.randomBytes(16).toString('hex'),
    auditNote: String(auditNote || 'Draw executed and locked after administrative verification.').trim(),
    payoutStatus: {
      randomWinnerPaid: false,
      highestWinnerPaid: false,
    },
  };

  db.addPromoDraw(record);

  db.addAuditLog({
    action: 'CASHBACK_DRAW_LOCKED',
    actor: admin.email,
    targetType: 'promo',
    targetId: record.id,
    details: `Weekly cashback draw locked. Total liability: $${record.totalCashbackAwarded}. Random Winner: ${record.randomDrawWinner?.orderRef} ($${record.randomDrawWinner?.cashbackAwarded}), Top Buyer: ${record.highestValueWinner?.orderRef} ($${record.highestValueWinner?.cashbackAwarded}).`,
  });

  res.status(201).json({ success: true, draw: record });
});

// POST /api/admin/cashback/payout — Mark payout verified & completed
apiRouter.post('/admin/cashback/payout', requireAdmin, (req: Request, res: Response) => {
  const { drawId, winnerType, verificationDetails } = req.body; // winnerType: 'random' | 'highest'
  const admin = (req as any).admin;

  const draw = db.getPromoDraws().find((d) => d.id === drawId);
  if (!draw) return res.status(404).json({ error: 'Draw record not found.' });

  db.updatePromoDraw(drawId, (d) => {
    if (winnerType === 'random') {
      d.payoutStatus.randomWinnerPaid = true;
    } else if (winnerType === 'highest') {
      d.payoutStatus.highestWinnerPaid = true;
    }
    d.payoutStatus.paidAt = new Date().toISOString();
  });

  db.addAuditLog({
    action: 'CASHBACK_PAYOUT_VERIFIED',
    actor: admin.email,
    targetType: 'promo',
    targetId: drawId,
    details: `Manual payout verified for ${winnerType} winner. Method: ${verificationDetails || 'Manual bank wire / reversal completed.'}`,
  });

  res.json({
    success: true,
    message: `Cashback payout for ${winnerType} winner marked as paid.`,
    draw: db.getPromoDraws().find((d) => d.id === drawId),
  });
});

// GET /api/admin/reports/csv — Export verified orders & financial summary
apiRouter.get('/admin/reports/csv', requireAdmin, (req: Request, res: Response) => {
  const orders = db.getOrders();
  const headers = [
    'Order Ref',
    'Customer Name',
    'Email',
    'Country',
    'Package',
    'Price (USD)',
    'Total Paid (USD)',
    'Refunded (USD)',
    'Order Status',
    'Payment Verification',
    'Created At',
  ];

  const rows = orders.map((o) => [
    `"${o.orderRef}"`,
    `"${o.customerName.replace(/"/g, '""')}"`,
    `"${o.email}"`,
    `"${o.country}"`,
    `"${o.packageName}"`,
    o.packagePrice,
    o.totalPaid || 0,
    o.refundedAmount || 0,
    `"${o.status}"`,
    `"${o.verificationStatus}"`,
    `"${o.createdAt}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="globalwebstudio-orders-${Date.now()}.csv"`);
  res.send(csvContent);
});

// GET /api/admin/audit-logs — Full audit trail
apiRouter.get('/admin/audit-logs', requireAdmin, (req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});

// GET /api/admin/contact-inquiries
apiRouter.get('/admin/contact-inquiries', requireAdmin, (req: Request, res: Response) => {
  res.json(db.getContactInquiries());
});

// PUT /api/admin/contact-inquiries/:id
apiRouter.put('/admin/contact-inquiries/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  db.updateContactInquiryStatus(id, status);
  res.json({ success: true });
});

// ==========================================
// CUSTOM PROJECT REQUESTS & NEGOTIATED DEALS
// ==========================================

// Helper: Generate unique non-sequential Custom Project Request ID
function generateUniqueRequestId(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = '';
  let attempts = 0;
  const existingRefs = new Set(db.getCustomRequests().map((r) => r.requestId));

  do {
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    ref = `CPR-${year}-${randomPart}`;
    attempts++;
  } while (existingRefs.has(ref) && attempts < 100);

  return ref;
}

// Helper: Generate unique non-sequential Quotation ID
function generateUniqueQuotationId(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = '';
  let attempts = 0;
  const existingRefs = new Set(db.getQuotations().map((q) => q.quotationId));

  do {
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    ref = `QUOT-${year}-${randomPart}`;
    attempts++;
  } while (existingRefs.has(ref) && attempts < 100);

  return ref;
}

// Multer storage for request attachments
const attachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PRIVATE_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(12).toString('hex');
    const safeExt = path.extname(file.originalname).toLowerCase();
    cb(null, `spec-${Date.now()}-${randomHex}${safeExt}`);
  },
});

const uploadAttachments = multer({
  storage: attachmentStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit per file
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf', '.txt', '.zip', '.docx', '.csv', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} is not supported. Please upload JPG, PNG, PDF, ZIP, TXT, or DOCX.`));
    }
  },
});

// POST /api/custom-requests — Client submits Custom Project Request
apiRouter.post(
  '/custom-requests',
  rateLimiter(10, 60 * 1000),
  uploadAttachments.array('attachments', 5),
  (req: Request, res: Response) => {
    try {
      const {
        customerName,
        email,
        country,
        businessName,
        projectTitle,
        projectCategory,
        projectDescription,
        businessProblem,
        requiredFeatures,
        preferredTech,
        referenceUrls,
        expectedPagesOrModules,
        userRolesAndDashboards,
        thirdPartyIntegrations,
        trafficAndScalability,
        designStylePreference,
        targetLaunchDate,
        budgetRangeUSD,
        additionalRequirements,
      } = req.body;

      if (!customerName || !email || !country || !projectTitle || !projectDescription || !businessProblem) {
        return res.status(400).json({
          error: 'Please provide full name, email, country, project title, description, and business problem.',
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      const requestId = generateUniqueRequestId();
      const clientAccessToken = crypto.randomBytes(24).toString('hex');
      const now = new Date().toISOString();

      // Process uploaded attachments
      const uploadedFiles = (req.files as Express.Multer.File[]) || [];
      const attachments = uploadedFiles.map((f) => ({
        id: `att-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        fileName: f.filename,
        originalName: f.originalname,
        mimeType: f.mimetype,
        sizeBytes: f.size,
        fileUrl: `/api/custom-requests/${requestId}/attachments/${f.filename}`,
      }));

      // Parse features
      let parsedFeatures: string[] = [];
      if (Array.isArray(requiredFeatures)) {
        parsedFeatures = requiredFeatures;
      } else if (typeof requiredFeatures === 'string') {
        try {
          parsedFeatures = JSON.parse(requiredFeatures);
        } catch {
          parsedFeatures = requiredFeatures.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }

      const newRequest = {
        id: `cpr-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
        requestId,
        customerName: String(customerName).trim().slice(0, 100),
        email: String(email).trim().toLowerCase().slice(0, 120),
        country: String(country).trim().slice(0, 60),
        businessName: businessName ? String(businessName).trim().slice(0, 120) : undefined,
        projectTitle: String(projectTitle).trim().slice(0, 150),
        projectCategory: String(projectCategory || 'Custom Web Application').trim().slice(0, 100),
        projectDescription: String(projectDescription).trim().slice(0, 8000),
        businessProblem: String(businessProblem).trim().slice(0, 4000),
        requiredFeatures: parsedFeatures.map((f) => String(f).slice(0, 150)),
        preferredTech: preferredTech ? String(preferredTech).trim().slice(0, 200) : undefined,
        referenceUrls: referenceUrls ? String(referenceUrls).trim().slice(0, 500) : undefined,
        expectedPagesOrModules: expectedPagesOrModules ? String(expectedPagesOrModules).trim().slice(0, 150) : undefined,
        userRolesAndDashboards: userRolesAndDashboards ? String(userRolesAndDashboards).trim().slice(0, 1000) : undefined,
        thirdPartyIntegrations: thirdPartyIntegrations ? String(thirdPartyIntegrations).trim().slice(0, 1000) : undefined,
        trafficAndScalability: trafficAndScalability ? String(trafficAndScalability).trim().slice(0, 1000) : undefined,
        designStylePreference: designStylePreference ? String(designStylePreference).trim().slice(0, 300) : undefined,
        targetLaunchDate: targetLaunchDate ? String(targetLaunchDate).slice(0, 50) : undefined,
        budgetRangeUSD: String(budgetRangeUSD || 'To be scoped').trim().slice(0, 100),
        additionalRequirements: additionalRequirements ? String(additionalRequirements).trim().slice(0, 3000) : undefined,
        attachments,
        clientAccessToken,
        status: 'Submitted' as const,
        createdAt: now,
        updatedAt: now,
        messages: [
          {
            id: `msg-${Date.now()}-init`,
            sender: 'admin' as const,
            senderName: 'GlobalWeb Studio Architecture Team',
            message: `Hello ${customerName}, we have received your custom project brief for "${projectTitle}". Our senior engineering team is reviewing your requirements to evaluate architecture, dependencies, and delivery milestones. A formal quotation will be prepared shortly.`,
            timestamp: now,
          },
        ],
        internalNotes: [],
      };

      db.addCustomRequest(newRequest);

      db.addAuditLog({
        action: 'CUSTOM_PROJECT_REQUEST_SUBMITTED',
        actor: newRequest.email,
        targetType: 'custom_request',
        targetId: requestId,
        details: `Custom project request "${newRequest.projectTitle}" submitted by ${newRequest.customerName}. Budget: ${newRequest.budgetRangeUSD}. Status: Submitted.`,
      });

      db.addNotification({
        targetEmail: newRequest.email,
        requestId,
        type: 'new_project_request',
        title: `Custom Project Request ${requestId} Received`,
        message: `Your project request for "${newRequest.projectTitle}" has been logged and is under architectural evaluation.`,
        missingConfigNotice: 'Client notification logged to Customer Portal.',
      });

      res.status(201).json({
        success: true,
        requestId,
        clientAccessToken,
        customRequest: newRequest,
      });
    } catch (err: any) {
      console.error('Error creating custom request:', err);
      res.status(500).json({ error: err.message || 'Failed to submit custom project request.' });
    }
  }
);

// GET /api/custom-requests/:requestId — View custom request details securely
apiRouter.get('/custom-requests/:requestId', (req: Request, res: Response) => {
  const { requestId } = req.params;
  const token = (req.query.token as string) || (req.headers['x-order-token'] as string);
  const emailQuery = (req.query.email as string)?.trim().toLowerCase();
  const adminToken = req.headers['x-admin-token'] as string | undefined;

  const request = db.getCustomRequests().find((r) => r.requestId.toUpperCase() === requestId.toUpperCase());
  if (!request) {
    return res.status(404).json({ error: 'Custom project request not found.' });
  }

  const isAdmin = !!verifyAdminSession(adminToken);
  const isAuthorizedCustomer =
    (token && token === request.clientAccessToken) || (emailQuery && emailQuery === request.email.toLowerCase());

  if (!isAdmin && !isAuthorizedCustomer) {
    return res.status(403).json({ error: 'Access denied. Valid client token or customer email required.' });
  }

  // Linked quotations
  const quotations = db.getQuotations().filter((q) => q.requestId === request.requestId);

  // Linked order if any
  const linkedOrder = db.getOrders().find((o) => o.linkedCustomRequestId === request.requestId || o.orderRef === request.linkedOrderRef);

  // Filter out internal notes and estimates if not admin
  const sanitizedRequest = {
    ...request,
    internalNotes: isAdmin ? request.internalNotes : undefined,
    internalEstimates: isAdmin ? request.internalEstimates : undefined,
  };

  res.json({
    customRequest: sanitizedRequest,
    quotations,
    linkedOrder: linkedOrder || null,
    paymentMethods: db.getPaymentMethods().filter((m) => m.enabled),
  });
});

// GET /api/custom-requests/:requestId/attachments/:fileName — Securely download attachment
apiRouter.get('/custom-requests/:requestId/attachments/:fileName', (req: Request, res: Response) => {
  const { requestId, fileName } = req.params;
  const token = (req.query.token as string) || (req.headers['x-order-token'] as string);
  const adminToken = req.headers['x-admin-token'] as string | undefined;

  const request = db.getCustomRequests().find((r) => r.requestId.toUpperCase() === requestId.toUpperCase());
  if (!request) return res.status(404).json({ error: 'Request not found.' });

  const isAdmin = !!verifyAdminSession(adminToken);
  const isOwner = token && token === request.clientAccessToken;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: 'Access denied. Only the project owner or administrator may view this file.' });
  }

  const attachment = request.attachments.find((a) => a.fileName === fileName);
  if (!attachment) return res.status(404).json({ error: 'Attachment file not found.' });

  const filePath = path.join(PRIVATE_UPLOADS_DIR, attachment.fileName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Attachment file does not exist on storage.' });
  }

  res.setHeader('Content-Type', attachment.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${attachment.originalName.replace(/"/g, '')}"`);
  res.sendFile(filePath);
});

// POST /api/custom-requests/:requestId/message — Client or Admin sends a message
apiRouter.post('/custom-requests/:requestId/message', (req: Request, res: Response) => {
  const { requestId } = req.params;
  const { message, token } = req.body;
  const adminToken = req.headers['x-admin-token'] as string | undefined;

  if (!message || String(message).trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const request = db.getCustomRequests().find((r) => r.requestId.toUpperCase() === requestId.toUpperCase());
  if (!request) return res.status(404).json({ error: 'Request not found.' });

  const adminSession = verifyAdminSession(adminToken);
  const isOwner = token && token === request.clientAccessToken;

  if (!adminSession && !isOwner) {
    return res.status(403).json({ error: 'Unauthorized to post messages on this project.' });
  }

  const sender: 'client' | 'admin' = adminSession ? 'admin' : 'client';
  const senderName = adminSession ? adminSession.name : request.customerName;

  const newMsg = {
    id: `msg-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    sender,
    senderName,
    message: String(message).trim().slice(0, 3000),
    timestamp: new Date().toISOString(),
  };

  db.updateCustomRequest(request.requestId, (r) => {
    r.messages.push(newMsg);
  });

  db.addAuditLog({
    action: 'CUSTOM_REQUEST_MESSAGE_ADDED',
    actor: adminSession ? adminSession.email : request.email,
    targetType: 'custom_request',
    targetId: request.requestId,
    details: `Message sent by ${senderName} (${sender}): "${newMsg.message.substring(0, 60)}..."`,
  });

  res.json({ success: true, message: newMsg });
});

// GET /api/customer-portal/requests — Query all client requests by email & token
apiRouter.get('/customer-portal/requests', (req: Request, res: Response) => {
  const email = (req.query.email as string)?.trim().toLowerCase();
  const token = (req.query.token as string)?.trim();

  if (!email && !token) {
    return res.status(400).json({ error: 'Client email or access token required.' });
  }

  const requests = db.getCustomRequests().filter((r) => {
    if (token && r.clientAccessToken === token) return true;
    if (email && r.email.toLowerCase() === email) return true;
    return false;
  });

  // Client requests without private internal notes/estimates
  const sanitized = requests.map((r) => ({
    ...r,
    internalNotes: undefined,
    internalEstimates: undefined,
  }));

  res.json({ requests: sanitized });
});

// ==========================================
// ADMIN CUSTOM PROJECT MANAGEMENT
// ==========================================

// GET /api/admin/custom-requests — List all custom requests
apiRouter.get('/admin/custom-requests', requireAdmin, (req: Request, res: Response) => {
  res.json(db.getCustomRequests());
});

// POST /api/admin/custom-requests/:requestId/status — Change status
apiRouter.post('/admin/custom-requests/:requestId/status', requireAdmin, (req: Request, res: Response) => {
  const { requestId } = req.params;
  const { status, note } = req.body;
  const admin = (req as any).admin;

  const validStatuses = [
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

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status "${status}".` });
  }

  const request = db.getCustomRequests().find((r) => r.requestId.toUpperCase() === requestId.toUpperCase());
  if (!request) return res.status(404).json({ error: 'Request not found.' });

  const oldStatus = request.status;
  db.updateCustomRequest(request.requestId, (r) => {
    r.status = status;
  });

  db.addAuditLog({
    action: 'CUSTOM_REQUEST_STATUS_UPDATED',
    actor: admin.email,
    targetType: 'custom_request',
    targetId: request.requestId,
    details: `Status updated from "${oldStatus}" to "${status}" by ${admin.name}. Note: ${note || 'No note'}`,
  });

  db.addNotification({
    targetEmail: request.email,
    requestId: request.requestId,
    type: 'request_status_change',
    title: `Project Status: ${status}`,
    message: `Your custom project "${request.projectTitle}" status is now "${status}".`,
    missingConfigNotice: 'Event logged in Customer Portal.',
  });

  res.json({ success: true, request: db.getCustomRequests().find((r) => r.requestId === request.requestId) });
});

// POST /api/admin/custom-requests/:requestId/internal-note — Add private admin note
apiRouter.post('/admin/custom-requests/:requestId/internal-note', requireAdmin, (req: Request, res: Response) => {
  const { requestId } = req.params;
  const { note } = req.body;
  const admin = (req as any).admin;

  if (!note || String(note).trim() === '') {
    return res.status(400).json({ error: 'Note content cannot be empty.' });
  }

  const request = db.getCustomRequests().find((r) => r.requestId.toUpperCase() === requestId.toUpperCase());
  if (!request) return res.status(404).json({ error: 'Request not found.' });

  const newNote = {
    id: `note-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    author: admin.name || admin.email,
    note: String(note).trim(),
    timestamp: new Date().toISOString(),
  };

  db.updateCustomRequest(request.requestId, (r) => {
    r.internalNotes.unshift(newNote);
  });

  db.addAuditLog({
    action: 'ADMIN_INTERNAL_NOTE_ADDED',
    actor: admin.email,
    targetType: 'custom_request',
    targetId: request.requestId,
    details: `Private internal note added: "${newNote.note.substring(0, 50)}..."`,
  });

  res.json({ success: true, note: newNote });
});

// POST /api/admin/custom-requests/:requestId/internal-estimate — Save internal cost estimate
apiRouter.post('/admin/custom-requests/:requestId/internal-estimate', requireAdmin, (req: Request, res: Response) => {
  const { requestId } = req.params;
  const { estimatedHours, laborCostUSD, infrastructureCostUSD, contingencyMarginPercent, suggestedQuotePriceUSD, notes } = req.body;
  const admin = (req as any).admin;

  const request = db.getCustomRequests().find((r) => r.requestId.toUpperCase() === requestId.toUpperCase());
  if (!request) return res.status(404).json({ error: 'Request not found.' });

  const estimates = {
    estimatedHours: parseFloat(estimatedHours) || 0,
    laborCostUSD: parseFloat(laborCostUSD) || 0,
    infrastructureCostUSD: parseFloat(infrastructureCostUSD) || 0,
    contingencyMarginPercent: parseFloat(contingencyMarginPercent) || 0,
    suggestedQuotePriceUSD: parseFloat(suggestedQuotePriceUSD) || 0,
    notes: String(notes || '').trim(),
    updatedAt: new Date().toISOString(),
  };

  db.updateCustomRequest(request.requestId, (r) => {
    r.internalEstimates = estimates;
  });

  db.addAuditLog({
    action: 'ADMIN_INTERNAL_ESTIMATE_SAVED',
    actor: admin.email,
    targetType: 'custom_request',
    targetId: request.requestId,
    details: `Internal estimate: ${estimates.estimatedHours} hrs, Labor $${estimates.laborCostUSD}, Infra $${estimates.infrastructureCostUSD}, Suggested Quote $${estimates.suggestedQuotePriceUSD}.`,
  });

  res.json({ success: true, internalEstimates: estimates });
});

// POST /api/admin/custom-requests/:requestId/ask-info — Request more information
apiRouter.post('/admin/custom-requests/:requestId/ask-info', requireAdmin, (req: Request, res: Response) => {
  const { requestId } = req.params;
  const { message } = req.body;
  const admin = (req as any).admin;

  if (!message || String(message).trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const request = db.getCustomRequests().find((r) => r.requestId.toUpperCase() === requestId.toUpperCase());
  if (!request) return res.status(404).json({ error: 'Request not found.' });

  const msgObj = {
    id: `msg-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    sender: 'admin' as const,
    senderName: admin.name || 'Studio Project Lead',
    message: String(message).trim(),
    timestamp: new Date().toISOString(),
  };

  db.updateCustomRequest(request.requestId, (r) => {
    r.messages.push(msgObj);
    r.status = 'More Information Required';
  });

  db.addAuditLog({
    action: 'ADMIN_REQUESTED_MORE_INFO',
    actor: admin.email,
    targetType: 'custom_request',
    targetId: request.requestId,
    details: `Admin requested clarification: "${msgObj.message.substring(0, 70)}..."`,
  });

  db.addNotification({
    targetEmail: request.email,
    requestId: request.requestId,
    type: 'more_info_required',
    title: 'Clarification Needed on Project Request',
    message: `Our engineering team has sent you a message regarding "${request.projectTitle}". Please view your customer portal to reply.`,
    missingConfigNotice: 'Event logged in Customer Portal.',
  });

  res.json({ success: true, message: msgObj });
});

// ==========================================
// FORMAL QUOTATIONS & DEAL ACCEPTANCE
// ==========================================

// POST /api/admin/custom-requests/:requestId/quotations — Prepare & issue a formal quotation
apiRouter.post('/admin/custom-requests/:requestId/quotations', requireAdmin, (req: Request, res: Response) => {
  const { requestId } = req.params;
  const {
    projectTitle,
    agreedScope,
    deliverables,
    excludedFeatures,
    totalPriceUSD,
    paymentSchedule,
    deliveryTimeline,
    revisionPolicy,
    maintenanceTerms,
    thirdPartyCostsNote,
    expiryDate,
    cancellationAndRefundTerms,
  } = req.body;
  const admin = (req as any).admin;

  const request = db.getCustomRequests().find((r) => r.requestId.toUpperCase() === requestId.toUpperCase());
  if (!request) return res.status(404).json({ error: 'Request not found.' });

  const parsedPrice = parseFloat(totalPriceUSD);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ error: 'Please enter a valid positive agreed price in USD.' });
  }

  // Validate milestones sum up to total
  const milestones: any[] = Array.isArray(paymentSchedule) ? paymentSchedule : [];
  if (milestones.length === 0) {
    return res.status(400).json({ error: 'At least one payment milestone is required.' });
  }

  const milestoneSum = milestones.reduce((sum, m) => sum + (parseFloat(m.amountUSD) || 0), 0);
  if (Math.abs(milestoneSum - parsedPrice) > 1.0) {
    return res.status(400).json({
      error: `Milestone amounts ($${milestoneSum}) must equal the total agreed quotation price ($${parsedPrice}).`,
    });
  }

  const quotationId = generateUniqueQuotationId();
  const now = new Date().toISOString();

  const formattedMilestones = milestones.map((m, idx) => ({
    id: `ms-${Date.now()}-${idx}-${crypto.randomBytes(2).toString('hex')}`,
    title: String(m.title || `Milestone ${idx + 1}`).trim(),
    description: String(m.description || '').trim(),
    percentage: parseFloat(m.percentage) || Math.round((m.amountUSD / parsedPrice) * 100),
    amountUSD: parseFloat(m.amountUSD),
    status: idx === 0 ? ('pending_payment' as const) : ('pending_payment' as const),
    proofs: [],
  }));

  const newQuotation = {
    id: `quot-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    quotationId,
    requestId: request.requestId,
    version: 1,
    projectTitle: String(projectTitle || request.projectTitle).trim(),
    agreedScope: String(agreedScope).trim(),
    deliverables: Array.isArray(deliverables) ? deliverables : [String(deliverables || '')],
    excludedFeatures: Array.isArray(excludedFeatures) ? excludedFeatures : [],
    totalPriceUSD: parsedPrice,
    paymentSchedule: formattedMilestones,
    deliveryTimeline: String(deliveryTimeline || 'Per milestone roadmap').trim(),
    revisionPolicy: String(revisionPolicy || '3 revision rounds per milestone').trim(),
    maintenanceTerms: String(maintenanceTerms || '30 days bug-fix warranty post-delivery').trim(),
    thirdPartyCostsNote: thirdPartyCostsNote ? String(thirdPartyCostsNote).trim() : undefined,
    expiryDate: String(expiryDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]),
    cancellationAndRefundTerms: String(
      cancellationAndRefundTerms ||
        'Milestone deposits are non-refundable once engineering sprints have commenced. Completed milestone deliverables are owned by the client upon full settlement.'
    ).trim(),
    status: 'offered' as const,
    createdAt: now,
    offeredAt: now,
    versionHistory: [
      {
        version: 1,
        totalPriceUSD: parsedPrice,
        updatedAt: now,
        changeSummary: 'Initial formal deal quotation prepared by administration.',
      },
    ],
    clientAccessToken: request.clientAccessToken,
  };

  db.addQuotation(newQuotation);

  // Link quotation to custom request and update status to 'Deal Offered'
  db.updateCustomRequest(request.requestId, (r) => {
    r.linkedQuotationId = quotationId;
    r.status = 'Deal Offered';
    r.messages.push({
      id: `msg-${Date.now()}-quote`,
      sender: 'admin',
      senderName: admin.name || 'Studio Finance & Architecture',
      message: `A formal negotiated deal quotation (${quotationId}) for $${parsedPrice.toLocaleString()} USD has been prepared and published to your customer portal. Please review the deliverables, milestone schedule, and offer expiry date.`,
      timestamp: now,
    });
  });

  db.addAuditLog({
    action: 'PROJECT_QUOTATION_ISSUED',
    actor: admin.email,
    targetType: 'quotation',
    targetId: quotationId,
    details: `Quotation ${quotationId} issued for request ${request.requestId}. Total Agreed: $${parsedPrice} USD with ${formattedMilestones.length} milestones.`,
  });

  db.addNotification({
    targetEmail: request.email,
    requestId: request.requestId,
    type: 'new_quotation_available',
    title: `Formal Deal Quotation Ready: ${quotationId}`,
    message: `We have prepared a formal quotation ($${parsedPrice.toLocaleString()} USD) for your project "${newQuotation.projectTitle}".`,
    missingConfigNotice: 'Notification dispatched to Customer Portal.',
  });

  res.status(201).json({ success: true, quotation: newQuotation });
});

// PUT /api/admin/quotations/:quotationId — Revise a quotation preserving version history
apiRouter.put('/admin/quotations/:quotationId', requireAdmin, (req: Request, res: Response) => {
  const { quotationId } = req.params;
  const {
    agreedScope,
    deliverables,
    excludedFeatures,
    totalPriceUSD,
    paymentSchedule,
    deliveryTimeline,
    revisionPolicy,
    maintenanceTerms,
    expiryDate,
    changeSummary,
  } = req.body;
  const admin = (req as any).admin;

  const quotation = db.getQuotations().find((q) => q.quotationId.toUpperCase() === quotationId.toUpperCase());
  if (!quotation) return res.status(404).json({ error: 'Quotation not found.' });

  if (quotation.status === 'accepted') {
    return res.status(400).json({ error: 'Cannot modify a quotation that has already been accepted by the client.' });
  }

  const parsedPrice = totalPriceUSD !== undefined ? parseFloat(totalPriceUSD) : quotation.totalPriceUSD;
  const newVersion = quotation.version + 1;
  const now = new Date().toISOString();

  db.updateQuotation(quotation.quotationId, (q) => {
    q.version = newVersion;
    if (agreedScope) q.agreedScope = agreedScope;
    if (deliverables) q.deliverables = deliverables;
    if (excludedFeatures) q.excludedFeatures = excludedFeatures;
    if (totalPriceUSD) q.totalPriceUSD = parsedPrice;
    if (paymentSchedule) q.paymentSchedule = paymentSchedule;
    if (deliveryTimeline) q.deliveryTimeline = deliveryTimeline;
    if (revisionPolicy) q.revisionPolicy = revisionPolicy;
    if (maintenanceTerms) q.maintenanceTerms = maintenanceTerms;
    if (expiryDate) q.expiryDate = expiryDate;

    q.versionHistory.unshift({
      version: newVersion,
      totalPriceUSD: parsedPrice,
      updatedAt: now,
      changeSummary: String(changeSummary || `Version ${newVersion} revisions issued by ${admin.name}`).trim(),
    });
  });

  db.addAuditLog({
    action: 'PROJECT_QUOTATION_REVISED',
    actor: admin.email,
    targetType: 'quotation',
    targetId: quotation.quotationId,
    details: `Quotation revised to Version ${newVersion}. Total: $${parsedPrice} USD. Summary: ${changeSummary || 'Scope/Price adjustments'}`,
  });

  res.json({ success: true, quotation: db.getQuotations().find((q) => q.quotationId === quotation.quotationId) });
});

// GET /api/quotations/:quotationId — Public / Client Quotation View
apiRouter.get('/quotations/:quotationId', (req: Request, res: Response) => {
  const { quotationId } = req.params;
  const token = (req.query.token as string) || (req.headers['x-order-token'] as string);
  const adminToken = req.headers['x-admin-token'] as string | undefined;

  const quotation = db.getQuotations().find((q) => q.quotationId.toUpperCase() === quotationId.toUpperCase());
  if (!quotation) return res.status(404).json({ error: 'Quotation not found.' });

  const isAdmin = !!verifyAdminSession(adminToken);
  const isOwner = token && (token === quotation.clientAccessToken || db.getCustomRequests().some((r) => r.requestId === quotation.requestId && r.clientAccessToken === token));

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: 'Access denied. Valid access token required to view quotation.' });
  }

  const linkedRequest = db.getCustomRequests().find((r) => r.requestId === quotation.requestId);
  const linkedOrder = db.getOrders().find((o) => o.linkedQuotationId === quotation.quotationId);

  res.json({
    quotation,
    customRequest: linkedRequest || null,
    linkedOrder: linkedOrder || null,
    paymentMethods: db.getPaymentMethods().filter((m) => m.enabled),
  });
});

// POST /api/quotations/:quotationId/accept — Client accepts the formal deal quotation
apiRouter.post('/quotations/:quotationId/accept', (req: Request, res: Response) => {
  const { quotationId } = req.params;
  const { clientAccessToken, acceptanceSignature, acceptanceNotes } = req.body;

  const quotation = db.getQuotations().find((q) => q.quotationId.toUpperCase() === quotationId.toUpperCase());
  if (!quotation) return res.status(404).json({ error: 'Quotation not found.' });

  const linkedRequest = db.getCustomRequests().find((r) => r.requestId === quotation.requestId);
  if (!linkedRequest) return res.status(404).json({ error: 'Linked project request not found.' });

  if (clientAccessToken !== linkedRequest.clientAccessToken && clientAccessToken !== quotation.clientAccessToken) {
    return res.status(403).json({ error: 'Invalid client access token. Unauthorized to accept quotation.' });
  }

  if (quotation.status === 'accepted') {
    return res.status(400).json({ error: 'This quotation has already been accepted.' });
  }

  const now = new Date().toISOString();

  // Mark Quotation as accepted
  db.updateQuotation(quotation.quotationId, (q) => {
    q.status = 'accepted';
    q.acceptedAt = now;
    q.acceptedByClient = true;
    q.acceptanceSignature = String(acceptanceSignature || linkedRequest.customerName).trim();
  });

  // Create linked payable custom-project Order for milestone 1
  const orderRef = generateUniqueOrderRef();
  const firstMilestone = quotation.paymentSchedule[0];
  const initialDueAmount = firstMilestone ? firstMilestone.amountUSD : quotation.totalPriceUSD;

  const newOrder: Order = {
    id: `ord-custom-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    orderRef,
    customerName: linkedRequest.customerName,
    email: linkedRequest.email,
    country: linkedRequest.country,
    businessName: linkedRequest.businessName,
    packageId: 'custom-negotiated-deal',
    packageName: `${quotation.projectTitle} (Custom Negotiated Deal)`,
    packagePrice: quotation.totalPriceUSD,
    currency: 'USD',
    projectRequirements: quotation.agreedScope,
    requiredFeatures: quotation.deliverables,
    createdAt: now,
    updatedAt: now,
    status: 'awaiting_payment',
    verificationStatus: 'none',
    proofs: [],
    totalPaid: 0,
    clientAccessToken: linkedRequest.clientAccessToken,
    linkedCustomRequestId: linkedRequest.requestId,
    linkedQuotationId: quotation.quotationId,
    milestones: quotation.paymentSchedule,
    activeMilestoneIndex: 0,
    isCustomDeal: true,
  };

  db.addOrder(newOrder);

  // Update Custom Project Request status
  db.updateCustomRequest(linkedRequest.requestId, (r) => {
    r.status = 'Accepted by Client';
    r.linkedOrderRef = orderRef;
    r.messages.push({
      id: `msg-${Date.now()}-accepted`,
      sender: 'client',
      senderName: linkedRequest.customerName,
      message: `I have formally accepted Quotation ${quotation.quotationId} ($${quotation.totalPriceUSD.toLocaleString()} USD) with agreed deliverables and milestone schedule. Order reference ${orderRef} has been initialized for Milestone 1 payment.`,
      timestamp: now,
    });
  });

  db.addAuditLog({
    action: 'PROJECT_QUOTATION_ACCEPTED',
    actor: linkedRequest.email,
    targetType: 'quotation',
    targetId: quotation.quotationId,
    details: `Quotation ${quotation.quotationId} accepted by ${linkedRequest.customerName}. Order ${orderRef} created for Milestone 1 ($${initialDueAmount}). Status: awaiting_payment.`,
  });

  db.addNotification({
    targetEmail: linkedRequest.email,
    requestId: linkedRequest.requestId,
    orderRef,
    type: 'deal_accepted',
    title: `Deal Accepted! Order ${orderRef} Initialized`,
    message: `You have accepted quotation ${quotation.quotationId}. Please review Askari Bank and wire transfer instructions for Milestone 1 ($${initialDueAmount} USD).`,
    missingConfigNotice: 'Dispatched to Customer Portal.',
  });

  res.json({
    success: true,
    message: 'Quotation accepted successfully. Custom order initialized for payment.',
    orderRef,
    order: newOrder,
    quotation: db.getQuotations().find((q) => q.quotationId === quotation.quotationId),
  });
});

// POST /api/quotations/:quotationId/decline — Client declines quotation
apiRouter.post('/quotations/:quotationId/decline', (req: Request, res: Response) => {
  const { quotationId } = req.params;
  const { clientAccessToken, reason } = req.body;

  const quotation = db.getQuotations().find((q) => q.quotationId.toUpperCase() === quotationId.toUpperCase());
  if (!quotation) return res.status(404).json({ error: 'Quotation not found.' });

  const linkedRequest = db.getCustomRequests().find((r) => r.requestId === quotation.requestId);
  if (!linkedRequest) return res.status(404).json({ error: 'Linked request not found.' });

  if (clientAccessToken !== linkedRequest.clientAccessToken && clientAccessToken !== quotation.clientAccessToken) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  const now = new Date().toISOString();
  db.updateQuotation(quotation.quotationId, (q) => {
    q.status = 'declined';
    q.declinedAt = now;
    q.declineReason = String(reason || 'Client opted not to proceed at this time.').trim();
  });

  db.updateCustomRequest(linkedRequest.requestId, (r) => {
    r.status = 'Declined';
    r.messages.push({
      id: `msg-${Date.now()}-declined`,
      sender: 'client',
      senderName: linkedRequest.customerName,
      message: `Quotation ${quotation.quotationId} declined. Reason: "${reason || 'Scope / Price negotiation needed'}".`,
      timestamp: now,
    });
  });

  db.addAuditLog({
    action: 'PROJECT_QUOTATION_DECLINED',
    actor: linkedRequest.email,
    targetType: 'quotation',
    targetId: quotation.quotationId,
    details: `Quotation declined. Reason: ${reason || 'Not specified'}`,
  });

  res.json({ success: true, message: 'Quotation status updated to declined.' });
});

// ==========================================
// MILESTONE PAYMENTS & VERIFICATION
// ==========================================

// POST /api/orders/:orderRef/milestones/:milestoneId/proof — Upload proof for specific milestone
apiRouter.post(
  '/orders/:orderRef/milestones/:milestoneId/proof',
  upload.single('proofFile'),
  (req: Request, res: Response) => {
    const { orderRef, milestoneId } = req.params;
    const {
      clientAccessToken,
      paymentMethodId,
      amountTransferred,
      currency,
      transferDate,
      transactionReference,
      customerNote,
    } = req.body;

    const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
    if (!order) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Order not found.' });
    }

    const adminToken = req.headers['x-admin-token'] as string | undefined;
    const isAdmin = !!verifyAdminSession(adminToken);
    const isOwner = clientAccessToken && clientAccessToken === order.clientAccessToken;

    if (!isAdmin && !isOwner) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Unauthorized to upload payment proof.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Payment receipt file is required (JPG, PNG, or PDF).' });
    }

    const parsedAmt = parseFloat(amountTransferred);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Please enter a valid transferred amount greater than 0.' });
    }

    if (!transactionReference || String(transactionReference).trim() === '') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Transaction or MTCN reference number is required.' });
    }

    const proofId = `prf-ms-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const newProof: PaymentProof = {
      id: proofId,
      orderRef: order.orderRef,
      milestoneId,
      paymentMethodId: String(paymentMethodId || 'bank_transfer'),
      amountTransferred: parsedAmt,
      currency: String(currency || 'USD').toUpperCase(),
      transferDate: String(transferDate || new Date().toISOString().split('T')[0]),
      transactionReference: String(transactionReference).trim(),
      fileName: req.file.filename,
      fileOriginalName: req.file.originalname,
      fileMimeType: req.file.mimetype,
      fileSizeBytes: req.file.size,
      fileUrl: `/api/orders/${order.orderRef}/proof-file/${proofId}`,
      customerNote: customerNote ? String(customerNote).trim().slice(0, 500) : undefined,
      submittedAt: new Date().toISOString(),
      verificationStatus: 'pending_review',
    };

    // Update order and target milestone atomically
    db.updateOrder(order.orderRef, (ord) => {
      ord.proofs.unshift(newProof);
      ord.activeProofId = newProof.id;
      ord.status = 'proof_submitted';
      ord.verificationStatus = 'pending_review';

      if (ord.milestones) {
        const ms = ord.milestones.find((m) => m.id === milestoneId);
        if (ms) {
          ms.status = 'proof_submitted';
          ms.activeProofId = newProof.id;
          if (!ms.proofs) ms.proofs = [];
          ms.proofs.unshift(newProof);
        }
      }
    });

    // Update linked custom request status if present
    if (order.linkedCustomRequestId) {
      db.updateCustomRequest(order.linkedCustomRequestId, (r) => {
        r.status = 'Payment Proof Submitted';
      });
    }

    db.addAuditLog({
      action: 'MILESTONE_PAYMENT_PROOF_SUBMITTED',
      actor: order.email,
      targetType: 'proof',
      targetId: newProof.id,
      details: `Proof submitted for Order ${order.orderRef} Milestone ${milestoneId}. Amount: ${newProof.currency} ${newProof.amountTransferred}, TxRef: "${newProof.transactionReference}". Awaiting admin manual verification.`,
    });

    db.addNotification({
      targetEmail: order.email,
      orderRef: order.orderRef,
      type: 'payment_proof_submitted',
      title: 'Milestone Payment Proof Submitted',
      message: `Your payment receipt for Milestone (${newProof.currency} ${newProof.amountTransferred}) has been submitted for manual verification.`,
      missingConfigNotice: 'Dispatched to Customer Portal.',
    });

    res.status(201).json({
      success: true,
      message: 'Payment Proof Submitted — Awaiting Admin Verification.',
      proof: newProof,
      order: db.getOrders().find((o) => o.orderRef === order.orderRef),
    });
  }
);

// POST /api/admin/orders/:orderRef/milestones/:milestoneId/verify — Admin verifies milestone payment
apiRouter.post(
  '/admin/orders/:orderRef/milestones/:milestoneId/verify',
  requireAdmin,
  (req: Request, res: Response) => {
    const { orderRef, milestoneId } = req.params;
    const { proofId, verifiedAmount, notes } = req.body;
    const admin = (req as any).admin;

    const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const proof = order.proofs.find((p) => p.id === proofId);
    if (!proof) return res.status(404).json({ error: 'Proof not found.' });

    const finalAmount = verifiedAmount !== undefined ? parseFloat(verifiedAmount) : proof.amountTransferred;
    const now = new Date().toISOString();

    db.updateOrder(order.orderRef, (ord) => {
      // Mark proof verified
      const targetProof = ord.proofs.find((p) => p.id === proofId);
      if (targetProof) {
        targetProof.verificationStatus = 'verified';
        targetProof.verifiedAt = now;
        targetProof.verifiedBy = admin.email;
      }

      // Mark milestone verified
      if (ord.milestones) {
        const msIndex = ord.milestones.findIndex((m) => m.id === milestoneId);
        if (msIndex !== -1) {
          ord.milestones[msIndex].status = 'payment_verified';
          ord.milestones[msIndex].verifiedAmount = finalAmount;
          ord.milestones[msIndex].verifiedAt = now;
          ord.milestones[msIndex].verifiedBy = admin.email;

          // Advance active milestone
          if (msIndex + 1 < ord.milestones.length) {
            ord.activeMilestoneIndex = msIndex + 1;
          }
        }
      }

      ord.verificationStatus = 'verified';
      ord.status = 'in_progress';
      ord.totalPaid = (ord.totalPaid || 0) + finalAmount;
    });

    // Update linked Custom Request status
    if (order.linkedCustomRequestId) {
      db.updateCustomRequest(order.linkedCustomRequestId, (r) => {
        r.status = 'Payment Verified';
      });
    }

    db.addAuditLog({
      action: 'MILESTONE_PAYMENT_VERIFIED',
      actor: admin.email,
      targetType: 'order',
      targetId: order.orderRef,
      details: `Milestone payment of $${finalAmount} verified by ${admin.name}. Notes: ${notes || 'Verified against bank statement'}`,
    });

    db.addNotification({
      targetEmail: order.email,
      orderRef: order.orderRef,
      type: 'payment_verified',
      title: 'Payment Verified — Project In Development',
      message: `Your milestone payment of $${finalAmount} has been verified against our bank records. Engineering work is officially underway!`,
      missingConfigNotice: 'Dispatched to Customer Portal.',
    });

    res.json({
      success: true,
      message: 'Milestone payment verified successfully.',
      order: db.getOrders().find((o) => o.orderRef === order.orderRef),
    });
  }
);

// POST /api/admin/orders/:orderRef/milestones/:milestoneId/reject — Admin rejects milestone proof
apiRouter.post(
  '/admin/orders/:orderRef/milestones/:milestoneId/reject',
  requireAdmin,
  (req: Request, res: Response) => {
    const { orderRef, milestoneId } = req.params;
    const { proofId, rejectionReason, isCorrectionRequest } = req.body;
    const admin = (req as any).admin;

    if (!rejectionReason || String(rejectionReason).trim() === '') {
      return res.status(400).json({ error: 'Please specify the rejection or correction reason.' });
    }

    const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const newStatus: VerificationStatus = isCorrectionRequest ? 'correction_requested' : 'rejected';

    db.updateOrder(order.orderRef, (ord) => {
      const targetProof = ord.proofs.find((p) => p.id === proofId);
      if (targetProof) {
        targetProof.verificationStatus = newStatus;
        targetProof.rejectionReason = String(rejectionReason).trim();
      }

      if (ord.milestones) {
        const ms = ord.milestones.find((m) => m.id === milestoneId);
        if (ms) {
          ms.status = 'pending_payment';
        }
      }

      ord.verificationStatus = newStatus;
      ord.status = 'awaiting_payment';
    });

    if (order.linkedCustomRequestId) {
      db.updateCustomRequest(order.linkedCustomRequestId, (r) => {
        r.status = isCorrectionRequest ? 'More Information Required' : 'Awaiting Payment';
      });
    }

    db.addAuditLog({
      action: isCorrectionRequest ? 'MILESTONE_PROOF_CORRECTION_REQUESTED' : 'MILESTONE_PROOF_REJECTED',
      actor: admin.email,
      targetType: 'order',
      targetId: order.orderRef,
      details: `Milestone proof ${proofId} set to "${newStatus}" by ${admin.name}. Reason: "${rejectionReason}"`,
    });

    res.json({
      success: true,
      message: isCorrectionRequest ? 'Correction requested.' : 'Milestone proof rejected.',
      order: db.getOrders().find((o) => o.orderRef === order.orderRef),
    });
  }
);

// ==========================================
// NOTIFICATIONS
// ==========================================

// GET /api/notifications — Retrieve notifications for email or admin
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const email = (req.query.email as string)?.trim().toLowerCase();
  const adminToken = req.headers['x-admin-token'] as string | undefined;

  const isAdmin = !!verifyAdminSession(adminToken);
  let notifs = db.getNotifications();

  if (!isAdmin && email) {
    notifs = notifs.filter((n) => n.targetEmail.toLowerCase() === email);
  }

  res.json({ notifications: notifs.slice(0, 30) });
});

// PUT /api/notifications/:id/read — Mark notification read
apiRouter.put('/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  db.markNotificationAsRead(id);
  res.json({ success: true });
});

// ==========================================
// ADMIN PACKAGES & PRICING CATALOG CRUD
// ==========================================

// POST /api/admin/packages — Create new package in catalog
apiRouter.post('/admin/packages', requireAdmin, (req: Request, res: Response) => {
  const {
    id,
    name,
    tagline,
    price,
    tier,
    isStartingAt,
    isFeatured,
    isEnterprise,
    category,
    pagesDescription,
    revisions,
    deliveryTime,
    idealClient,
    description,
    includedFeatures,
    excludedFeatures,
    enterpriseOverview,
  } = req.body;
  const admin = (req as any).admin;

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Package name and price are required.' });
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ error: 'Price must be a positive USD amount.' });
  }

  const packageId = id || `pkg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const packages = db.getPackages();

  const newPkg: any = {
    id: packageId,
    name: String(name).trim(),
    tagline: String(tagline || '').trim(),
    price: parsedPrice,
    tier: tier || (parsedPrice < 1000 ? 'affordable' : parsedPrice <= 100000 ? 'growing' : 'enterprise'),
    isStartingAt: !!isStartingAt,
    isFeatured: !!isFeatured,
    isEnterprise: !!isEnterprise || parsedPrice >= 100000,
    category: String(category || 'Web Development').trim(),
    pagesDescription: String(pagesDescription || 'Custom architecture').trim(),
    revisions: String(revisions || '3 revision rounds').trim(),
    deliveryTime: String(deliveryTime || '2–4 weeks').trim(),
    idealClient: idealClient ? String(idealClient).trim() : undefined,
    description: String(description || tagline || '').trim(),
    includedFeatures: Array.isArray(includedFeatures) ? includedFeatures : ['Custom Responsive Layout'],
    excludedFeatures: Array.isArray(excludedFeatures) ? excludedFeatures : [],
    active: true,
    displayOrder: packages.length + 1,
    enterpriseOverview: enterpriseOverview || undefined,
  };

  packages.push(newPkg);
  db.setPackages(packages);

  db.addAuditLog({
    action: 'PACKAGE_CREATED',
    actor: admin.email,
    targetType: 'package',
    targetId: packageId,
    details: `New package "${newPkg.name}" added at $${newPkg.price} USD.`,
  });

  res.status(201).json({ success: true, package: newPkg });
});

// PUT /api/admin/packages/:id — Update package in catalog
apiRouter.put('/admin/packages/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  const admin = (req as any).admin;

  const packages = db.getPackages();
  const pkgIndex = packages.findIndex((p) => p.id === id);
  if (pkgIndex === -1) return res.status(404).json({ error: 'Package not found in catalog.' });

  if (updateData.price !== undefined) {
    const p = parseFloat(updateData.price);
    if (isNaN(p) || p <= 0) {
      return res.status(400).json({ error: 'Package price must be a positive USD amount.' });
    }
    updateData.price = p;
  }

  packages[pkgIndex] = { ...packages[pkgIndex], ...updateData };
  db.setPackages(packages);

  db.addAuditLog({
    action: 'PACKAGE_UPDATED',
    actor: admin.email,
    targetType: 'package',
    targetId: id,
    details: `Package "${packages[pkgIndex].name}" updated. Price: $${packages[pkgIndex].price} USD. Active: ${packages[pkgIndex].active}.`,
  });

  res.json({ success: true, package: packages[pkgIndex] });
});

// DELETE /api/admin/packages/:id — Archive / remove package from catalog
apiRouter.delete('/admin/packages/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const admin = (req as any).admin;

  const packages = db.getPackages();
  const pkg = packages.find((p) => p.id === id);
  if (!pkg) return res.status(404).json({ error: 'Package not found.' });

  const filtered = packages.filter((p) => p.id !== id);
  db.setPackages(filtered);

  db.addAuditLog({
    action: 'PACKAGE_DELETED',
    actor: admin.email,
    targetType: 'package',
    targetId: id,
    details: `Package "${pkg.name}" ($${pkg.price}) removed from catalog.`,
  });

  res.json({ success: true, message: `Package ${id} removed.` });
});

