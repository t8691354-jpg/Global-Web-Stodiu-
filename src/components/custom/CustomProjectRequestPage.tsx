import React, { useState } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { api } from '../../services/api';
import {
  Sparkles,
  Layers,
  ShieldCheck,
  Upload,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  DollarSign,
  Cpu,
  Globe2,
  Copy,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  Lock,
} from 'lucide-react';

const PROJECT_CATEGORIES = [
  'Custom Web Application',
  'SaaS Platform (Software as a Service)',
  'Multi-Vendor Marketplace',
  'AI-Powered Application / Tool',
  'Booking & Reservation System',
  'Enterprise CRM / ERP System',
  'FinTech & Financial Dashboard',
  'Real Estate & Property Platform',
  'Healthcare & Patient Management',
  'E-Learning & Membership Platform',
  'API & Headless Microservices',
  'Other Custom Software',
];

const BUDGET_RANGES = [
  '$1,500 – $5,000 (Small Custom System / MVP)',
  '$5,000 – $15,000 (Full-Featured Web Platform)',
  '$15,000 – $50,000 (Comprehensive SaaS / Marketplace)',
  '$50,000 – $150,000 (Enterprise Multi-Module Software)',
  '$150,000 – $500,000 (High-Concurrency Scaled Infrastructure)',
  '$500,000 – $2,000,000+ (Mission-Critical Global Platform)',
];

const DESIGN_STYLES = [
  'Ultra-Modern Minimalist (High whitespace, clean lines)',
  'Dark Theme & Cyber Aesthetic (Deep slate, luminous accents)',
  'Corporate Executive (Authoritative, structured typography)',
  'FinTech & Data-Dense (High information density, interactive charts)',
  'Creative & Expressive (Vibrant gradients, micro-interactions)',
  'Custom Agency Brand Guide (Match client brand book exactly)',
];

const SUGGESTED_FEATURES = [
  'Multi-Role RBAC (Admin, Staff, Customer)',
  'Real-Time WebSockets & Live Sync',
  'Manual Bank Transfer & Wire Tracking',
  'Stripe / International Gateway Architecture',
  'Interactive Data Analytics & Charts',
  'Automated PDF / Invoice Generation',
  'Audit Trail & Security Activity Logging',
  'REST & GraphQL API Endpoints',
  'Full-Text Search & Faceted Filtering',
  'Multi-Language & Multi-Currency',
  'High-Concurrency Database Optimization',
  'Two-Factor Authentication (2FA)',
];

const SUGGESTED_TECH = [
  'React / TypeScript',
  'Next.js Full-Stack',
  'Node.js / Express',
  'PostgreSQL Relational DB',
  'Redis Caching & Queues',
  'Tailwind CSS Modern Styling',
  'Docker & Containerized Microservices',
  'Cloud Run / AWS Serverless',
  'Python Data / AI Pipeline',
];

export const CustomProjectRequestPage: React.FC = () => {
  const { prefilledCustomProject, navigateToClientPortal, setCurrentPage, showToast } = useAgency();

  // Form State
  const [customerName, setCustomerName] = useState(prefilledCustomProject?.customerName || '');
  const [email, setEmail] = useState(prefilledCustomProject?.email || '');
  const [country, setCountry] = useState(prefilledCustomProject?.country || '');
  const [businessName, setBusinessName] = useState(prefilledCustomProject?.businessName || '');

  const [projectTitle, setProjectTitle] = useState(prefilledCustomProject?.projectTitle || '');
  const [projectCategory, setProjectCategory] = useState(prefilledCustomProject?.category || PROJECT_CATEGORIES[0]);
  const [projectDescription, setProjectDescription] = useState(prefilledCustomProject?.description || '');
  const [businessProblem, setBusinessProblem] = useState('');

  const [requiredFeatures, setRequiredFeatures] = useState<string[]>([
    'Multi-Role RBAC (Admin, Staff, Customer)',
    'Audit Trail & Security Activity Logging',
  ]);
  const [customFeatureInput, setCustomFeatureInput] = useState('');

  const [preferredTech, setPreferredTech] = useState<string>('React, TypeScript, Node.js, PostgreSQL');
  const [referenceUrls, setReferenceUrls] = useState('');
  const [expectedPagesOrModules, setExpectedPagesOrModules] = useState('5–10 Core Modules');
  const [userRolesAndDashboards, setUserRolesAndDashboards] = useState('Administrator, Standard User, Manager');
  const [thirdPartyIntegrations, setThirdPartyIntegrations] = useState('');
  const [trafficAndScalability, setTrafficAndScalability] = useState('Up to 50,000 monthly active users');
  const [designStylePreference, setDesignStylePreference] = useState(DESIGN_STYLES[0]);
  const [targetLaunchDate, setTargetLaunchDate] = useState('');
  const [budgetRangeUSD, setBudgetRangeUSD] = useState(BUDGET_RANGES[1]);
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  // File uploads
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    requestId: string;
    clientAccessToken: string;
    request: any;
  } | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Toggle suggested feature
  const toggleFeature = (feat: string) => {
    setRequiredFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const addCustomFeature = () => {
    if (!customFeatureInput.trim()) return;
    if (!requiredFeatures.includes(customFeatureInput.trim())) {
      setRequiredFeatures((prev) => [...prev, customFeatureInput.trim()]);
    }
    setCustomFeatureInput('');
  };

  const removeFeature = (feat: string) => {
    setRequiredFeatures((prev) => prev.filter((f) => f !== feat));
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files);
    if (attachedFiles.length + filesArray.length > 5) {
      setFileError('You can upload a maximum of 5 files.');
      return;
    }

    const validExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.txt', '.zip', '.docx', '.csv', '.json'];
    for (const file of filesArray) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!validExtensions.includes(ext)) {
        setFileError(`File type "${ext}" is not supported. Supported: JPG, PNG, PDF, ZIP, TXT, DOCX.`);
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setFileError(`File "${file.name}" exceeds the 15MB limit.`);
        return;
      }
    }

    setAttachedFiles((prev) => [...prev, ...filesArray]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !email || !country || !projectTitle || !projectDescription || !businessProblem) {
      showToast('Please fill in all required fields marked with *', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('customerName', customerName.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('country', country.trim());
      if (businessName) formData.append('businessName', businessName.trim());

      formData.append('projectTitle', projectTitle.trim());
      formData.append('projectCategory', projectCategory);
      formData.append('projectDescription', projectDescription.trim());
      formData.append('businessProblem', businessProblem.trim());
      formData.append('requiredFeatures', JSON.stringify(requiredFeatures));

      if (preferredTech) formData.append('preferredTech', preferredTech.trim());
      if (referenceUrls) formData.append('referenceUrls', referenceUrls.trim());
      if (expectedPagesOrModules) formData.append('expectedPagesOrModules', expectedPagesOrModules.trim());
      if (userRolesAndDashboards) formData.append('userRolesAndDashboards', userRolesAndDashboards.trim());
      if (thirdPartyIntegrations) formData.append('thirdPartyIntegrations', thirdPartyIntegrations.trim());
      if (trafficAndScalability) formData.append('trafficAndScalability', trafficAndScalability.trim());
      if (designStylePreference) formData.append('designStylePreference', designStylePreference);
      if (targetLaunchDate) formData.append('targetLaunchDate', targetLaunchDate);
      formData.append('budgetRangeUSD', budgetRangeUSD);
      if (additionalRequirements) formData.append('additionalRequirements', additionalRequirements.trim());

      attachedFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await api.submitCustomRequest(formData);
      setSubmissionResult({
        requestId: res.requestId,
        clientAccessToken: res.clientAccessToken,
        request: res.customRequest,
      });

      showToast(`Custom project request ${res.requestId} submitted successfully!`, 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      showToast(err.message || 'Failed to submit request. Please verify inputs.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, type: 'id' | 'token') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 3000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 3000);
    }
    showToast('Copied to clipboard!', 'info');
  };

  // SUCCESS CONFIRMATION VIEW
  if (submissionResult) {
    const portalUrl = `${window.location.origin}/#client-portal?requestId=${submissionResult.requestId}&token=${submissionResult.clientAccessToken}`;

    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Custom Project Request Received
            </h1>
            <p className="mt-3 text-sm text-slate-300">
              Thank you, <span className="text-white font-semibold">{submissionResult.request.customerName}</span>. Your project specification for <span className="text-cyan-400 font-medium">"{submissionResult.request.projectTitle}"</span> has been securely registered with our architecture lead.
            </p>
          </div>

          {/* Reference Credentials Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Unique Project Request ID</p>
                <p className="text-xl font-mono font-bold text-cyan-400">{submissionResult.requestId}</p>
              </div>
              <button
                onClick={() => copyToClipboard(submissionResult.requestId, 'id')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedId ? 'Copied ID' : 'Copy Request ID'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Client Access Token</p>
                <p className="text-xs font-mono text-slate-400 break-all">{submissionResult.clientAccessToken}</p>
                <p className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Save this key or bookmark the link below. It securely unlocks your client portal.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(submissionResult.clientAccessToken, 'token')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedToken ? 'Copied Token' : 'Copy Token'}
              </button>
            </div>
          </div>

          {/* Next Steps Explanation */}
          <div className="space-y-4 mb-8 bg-slate-950/50 rounded-2xl p-6 border border-slate-800/60">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              What Happens Next? (12–24 Hour Review Window)
            </h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-white">Senior Architecture Evaluation:</strong> Our engineering leads evaluate your requested stack, modules, concurrency requirements, and integrations to plan milestones and deliverables.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-white">Formal Negotiated Quotation:</strong> We prepare a binding studio quotation outlining total USD price, payment milestone schedule, deliverables, and estimated delivery dates.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-white">Interactive Deal Acceptance:</strong> You can review, discuss adjustments via your client portal message thread, or formally accept the deal with digital signing.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">4</span>
                <div>
                  <strong className="text-white">No Upfront Payment Required Now:</strong> You only pay for Milestone 1 after you review and formally accept the agreed quotation.
                </div>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigateToClientPortal(submissionResult.requestId, submissionResult.clientAccessToken)}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 text-slate-950 hover:from-cyan-300 hover:to-indigo-200 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition"
            >
              <span>Open Customer Portal Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage('home')}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-white transition border border-slate-700"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN REQUEST FORM VIEW
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Bespoke Engineering & Scaled Software Systems
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Request a Custom Project
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
          For SaaS platforms, marketplaces, enterprise portals, AI software, and custom applications that exceed standard website packages. Submit your project requirements to receive a formal negotiated quotation and milestone delivery roadmap.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>No upfront payment required to submit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>12–24h Senior Architect review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>Private & confidential specification</span>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm space-y-10">
        
        {/* Section 1: Client Information */}
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">1</span>
            Client & Contact Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work or Personal Email <span className="text-cyan-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Country / Region <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United Kingdom, United States, Germany, UAE"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Company / Organization Name <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Nexus Global Technologies Ltd."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Project Classification & Description */}
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">2</span>
            Project Scope & Business Problem
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Project Title <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Multi-Tenant Healthcare Telemedicine SaaS"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Project Category <span className="text-cyan-400">*</span>
                </label>
                <select
                  value={projectCategory}
                  onChange={(e) => setProjectCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-400 transition"
                >
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Detailed Project Description & Vision <span className="text-cyan-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Explain the full vision of the platform, who the end users are, primary workflows, and key business logic..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Business Problem to Solve <span className="text-cyan-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={businessProblem}
                onChange={(e) => setBusinessProblem(e.target.value)}
                placeholder="What operational bottleneck, manual inefficiency, revenue opportunity, or technical deficiency does this software solve?"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Features & Technical Architecture */}
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">3</span>
            Required Features & Modules
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-2">
                Click to add popular enterprise modules or type custom requirements:
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_FEATURES.map((feat) => {
                  const isSelected = requiredFeatures.includes(feat);
                  return (
                    <button
                      type="button"
                      key={feat}
                      onClick={() => toggleFeature(feat)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '} {feat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Feature Add Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customFeatureInput}
                onChange={(e) => setCustomFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomFeature();
                  }
                }}
                placeholder="Add custom feature (e.g. Automated PDF receipt generator)..."
                className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={addCustomFeature}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700"
              >
                Add Feature
              </button>
            </div>

            {/* Selected features list */}
            {requiredFeatures.length > 0 && (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Selected Modules ({requiredFeatures.length}):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {requiredFeatures.map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-cyan-300 text-xs"
                    >
                      <span>{f}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(f)}
                        className="text-slate-500 hover:text-red-400 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  User Roles & Dashboard Types
                </label>
                <input
                  type="text"
                  value={userRolesAndDashboards}
                  onChange={(e) => setUserRolesAndDashboards(e.target.value)}
                  placeholder="e.g. Super Admin, Vendor, Client, Support Staff"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Expected Modules or View Count
                </label>
                <input
                  type="text"
                  value={expectedPagesOrModules}
                  onChange={(e) => setExpectedPagesOrModules(e.target.value)}
                  placeholder="e.g. 8–12 Screens / Workflows"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Architecture, Integrations & Scale */}
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">4</span>
            Technical Preferences & Scalability
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Preferred Technologies (If known)
              </label>
              <input
                type="text"
                value={preferredTech}
                onChange={(e) => setPreferredTech(e.target.value)}
                placeholder="e.g. React, TypeScript, Node.js, PostgreSQL, Redis"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Third-Party Integrations
              </label>
              <input
                type="text"
                value={thirdPartyIntegrations}
                onChange={(e) => setThirdPartyIntegrations(e.target.value)}
                placeholder="e.g. Stripe, Twilio SMS, SendGrid, Salesforce, Webhooks"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Reference Websites or Competitor URLs
              </label>
              <input
                type="text"
                value={referenceUrls}
                onChange={(e) => setReferenceUrls(e.target.value)}
                placeholder="https://example.com, https://competitor.io"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Expected Traffic & Scalability Requirements
              </label>
              <input
                type="text"
                value={trafficAndScalability}
                onChange={(e) => setTrafficAndScalability(e.target.value)}
                placeholder="e.g. 100,000 monthly visits, 50 concurrent transactions"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Design, Budget & Timeline */}
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">5</span>
            Budget Range, Style & Target Launch Date
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Budget Range (USD) <span className="text-cyan-400">*</span>
              </label>
              <select
                value={budgetRangeUSD}
                onChange={(e) => setBudgetRangeUSD(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-400 transition"
              >
                {BUDGET_RANGES.map((b) => (
                  <option key={b} value={b} className="bg-slate-900">
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Preferred Design Style
              </label>
              <select
                value={designStylePreference}
                onChange={(e) => setDesignStylePreference(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-400 transition"
              >
                {DESIGN_STYLES.map((s) => (
                  <option key={s} value={s} className="bg-slate-900">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Launch Date
              </label>
              <input
                type="date"
                value={targetLaunchDate}
                onChange={(e) => setTargetLaunchDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Additional Specific Requirements or Constraints
            </label>
            <textarea
              rows={2}
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              placeholder="Any security compliances (HIPAA, GDPR, SOC2), localization needs, or external deadlines..."
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
        </div>

        {/* Section 6: File Attachments */}
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">6</span>
            Specifications, Wireframes & Diagrams
          </h2>

          <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-6 text-center transition bg-slate-950/40">
            <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-200">
              Drag & drop specification files, or click below to browse
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports JPG, PNG, PDF, ZIP, TXT, DOCX (Up to 15MB each, max 5 files)
            </p>
            <label className="mt-4 inline-block">
              <span className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition">
                Select Files
              </span>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf,.txt,.zip,.docx,.csv,.json"
                className="hidden"
              />
            </label>
          </div>

          {fileError && (
            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fileError}
            </p>
          )}

          {attachedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold text-slate-400">Attached Files ({attachedFiles.length}):</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="truncate text-slate-200">{file.name}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 space-y-0.5">
            <p className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Secure 256-bit encryption. No payment commitment at submission.
            </p>
            <p className="text-slate-500">
              A binding quotation with milestone schedule will be delivered to your customer portal.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 text-slate-950 hover:from-cyan-300 hover:to-indigo-200 shadow-xl shadow-cyan-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2 shrink-0"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Submitting Specification...</span>
              </>
            ) : (
              <>
                <span>Submit Custom Project Request</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
