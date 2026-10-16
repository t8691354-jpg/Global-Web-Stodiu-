export type PackageId = string;

export interface PackageFeature {
  text: string;
  included: boolean;
}

export type PricingTier = 'affordable' | 'growing' | 'enterprise';

export interface EnterpriseOverview {
  modules?: string[];
  securityAndScalability?: string;
  infrastructurePlan?: string;
  implementationPhases?: string[];
  supportAndSLA?: string;
}

export interface WebsitePackage {
  id: PackageId;
  name: string;
  tagline: string;
  price: number; // in USD
  isStartingAt?: boolean;
  popular?: boolean;
  isFeatured?: boolean;
  isEnterprise?: boolean;
  tier?: PricingTier;
  minBudget?: number;
  maxBudget?: number;
  idealClient?: string;
  pagesDescription: string;
  revisions: string;
  deliveryTime: string;
  includedFeatures: string[];
  excludedFeatures: string[];
  category: string;
  description: string;
  active: boolean;
  displayOrder?: number;
  enterpriseOverview?: EnterpriseOverview;
}

export interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  deliverables: string[];
  suggestedPackage: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: 'business' | 'ecommerce' | 'real_estate' | 'restaurants' | 'services' | 'custom';
  description: string;
  keyFeatures: string[];
  demoType: 'live_demo' | 'case_study' | 'mockup';
  demoUrl?: string;
  imageUrl: string;
  tags: string[];
  isSample: boolean; // clearly indicates showcase sample
}

export type OrderStatus =
  | 'awaiting_payment'
  | 'proof_submitted'
  | 'payment_verified'
  | 'in_progress'
  | 'review_ready'
  | 'completed'
  | 'refunded'
  | 'cancelled';

export type VerificationStatus =
  | 'none'
  | 'pending_review'
  | 'verified'
  | 'rejected'
  | 'correction_requested';

export interface PaymentProof {
  id: string;
  orderRef: string;
  milestoneId?: string;
  paymentMethodId: string;
  amountTransferred: number;
  currency: string;
  transferDate: string;
  transactionReference: string;
  fileName: string;
  fileOriginalName: string;
  fileMimeType: string;
  fileSizeBytes: number;
  fileUrl: string; // Private endpoint URL
  customerNote?: string;
  submittedAt: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  percentage: number; // e.g. 40
  amountUSD: number;
  status: 'pending_payment' | 'proof_submitted' | 'payment_verified' | 'in_progress' | 'completed';
  proofs?: PaymentProof[];
  activeProofId?: string;
  verifiedAmount?: number;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Order {
  id: string;
  orderRef: string; // e.g., GWS-2026-X9K4B
  customerName: string;
  email: string;
  country: string;
  businessName?: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  currency: string;
  projectRequirements: string;
  requiredFeatures: string[];
  preferredDeliveryDate?: string;
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  verificationStatus: VerificationStatus;
  proofs: PaymentProof[];
  activeProofId?: string;
  totalPaid: number;
  refundedAmount?: number;
  clientAccessToken: string; // Secure token to access order private page

  // Custom project linkage & milestones
  linkedCustomRequestId?: string;
  linkedQuotationId?: string;
  milestones?: Milestone[];
  activeMilestoneIndex?: number;
  isCustomDeal?: boolean;
}

export type CustomProjectStatus =
  | 'Submitted'
  | 'Under Review'
  | 'More Information Required'
  | 'Quote Prepared'
  | 'Deal Offered'
  | 'Accepted by Client'
  | 'Awaiting Payment'
  | 'Payment Proof Submitted'
  | 'Payment Verified'
  | 'In Development'
  | 'Delivered'
  | 'Completed'
  | 'Declined'
  | 'Cancelled';

export interface RequestAttachment {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  fileUrl: string;
}

export interface ClientMessage {
  id: string;
  sender: 'client' | 'admin';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface InternalAdminNote {
  id: string;
  author: string;
  note: string;
  timestamp: string;
}

export interface InternalEstimate {
  estimatedHours: number;
  laborCostUSD: number;
  infrastructureCostUSD: number;
  contingencyMarginPercent: number;
  suggestedQuotePriceUSD: number;
  notes: string;
  updatedAt: string;
}

export interface CustomProjectRequest {
  id: string;
  requestId: string; // e.g. CPR-2026-X8N9K
  customerName: string;
  email: string;
  country: string;
  businessName?: string;
  projectTitle: string;
  projectCategory: string;
  projectDescription: string;
  businessProblem: string;
  requiredFeatures: string[];
  preferredTech?: string;
  referenceUrls?: string;
  expectedPagesOrModules?: string;
  userRolesAndDashboards?: string;
  thirdPartyIntegrations?: string;
  trafficAndScalability?: string;
  designStylePreference?: string;
  targetLaunchDate?: string;
  budgetRangeUSD: string;
  additionalRequirements?: string;
  attachments: RequestAttachment[];
  clientAccessToken: string;
  status: CustomProjectStatus;
  createdAt: string;
  updatedAt: string;

  // Conversations & Notes
  messages: ClientMessage[];
  internalNotes: InternalAdminNote[];
  internalEstimates?: InternalEstimate;

  // Linked entities
  linkedQuotationId?: string;
  linkedOrderRef?: string;
}

export interface QuotationVersionRecord {
  version: number;
  totalPriceUSD: number;
  updatedAt: string;
  changeSummary: string;
}

export interface ProjectQuotation {
  id: string;
  quotationId: string; // e.g. QUOT-2026-7Y2M
  requestId: string; // linked CustomProjectRequest.requestId
  version: number;
  projectTitle: string;
  agreedScope: string;
  deliverables: string[];
  excludedFeatures: string[];
  totalPriceUSD: number;
  paymentSchedule: Milestone[];
  deliveryTimeline: string;
  revisionPolicy: string;
  maintenanceTerms: string;
  thirdPartyCostsNote?: string;
  expiryDate: string;
  cancellationAndRefundTerms: string;
  status: 'draft' | 'offered' | 'accepted' | 'declined' | 'superseded';
  createdAt: string;
  offeredAt?: string;
  acceptedAt?: string;
  acceptedByClient?: boolean;
  acceptanceSignature?: string;
  declinedAt?: string;
  declineReason?: string;
  versionHistory: QuotationVersionRecord[];
  clientAccessToken?: string;
}

export interface NotificationEvent {
  id: string;
  targetEmail: string;
  requestId?: string;
  orderRef?: string;
  type:
    | 'new_project_request'
    | 'request_status_change'
    | 'more_info_required'
    | 'new_quotation_available'
    | 'deal_accepted'
    | 'payment_proof_submitted'
    | 'payment_verified'
    | 'milestone_update'
    | 'final_delivery';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  missingConfigNotice?: string;
}

export interface PaymentMethodConfig {
  id: string;
  title: string;
  type: 'bank_transfer' | 'other_bank' | 'international_transfer' | 'custom';
  bankOrProviderName: string;
  accountHolderName: string;
  accountNumberOrIban: string;
  swiftBicOrRouting?: string;
  branchName?: string;
  supportedCurrencies: string[];
  instructions: string[];
  referenceNote: string;
  enabled: boolean;
  displayOrder: number;
}

export interface CashbackPromoSettings {
  enabled: boolean;
  legalTermsAcknowledged: boolean;
  currentWeekBoundaryStart: string;
  currentWeekBoundaryEnd: string;
  timezone: string;
  cashbackPercentage: number;
  maxAwardPerWinner: number;
  totalWeeklyBudget: number;
  allowDualWinner: boolean;
  publishedTerms: string;
}

export interface PromoDrawRecord {
  id: string;
  weekStart: string;
  weekEnd: string;
  drawDate: string;
  randomDrawWinner?: {
    orderRef: string;
    customerName: string;
    orderAmount: number;
    cashbackAwarded: number;
  };
  highestValueWinner?: {
    orderRef: string;
    customerName: string;
    orderAmount: number;
    cashbackAwarded: number;
  };
  totalCashbackAwarded: number;
  isLocked: boolean;
  published: boolean;
  drawSeedOrProof: string;
  auditNote: string;
  payoutStatus: {
    randomWinnerPaid: boolean;
    highestWinnerPaid: boolean;
    paidAt?: string;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  targetType: 'order' | 'proof' | 'payment_method' | 'promo' | 'package' | 'settings' | 'custom_request' | 'quotation';
  targetId: string;
  details: string;
}

export interface AgencySettings {
  businessName: string;
  tagline: string;
  contactEmail: string;
  supportEmail: string;
  phone?: string;
  headquarters: string;
  workingHours: string;
  currency: string;
  currencySymbol: string;
  orderPrefix: string;
  allowHighValueDealsUpTo2M?: boolean;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  country: string;
  businessType: string;
  serviceRequired: string;
  budgetRange: string;
  projectDescription: string;
  createdAt: string;
  status: 'new' | 'responded' | 'archived';
}
