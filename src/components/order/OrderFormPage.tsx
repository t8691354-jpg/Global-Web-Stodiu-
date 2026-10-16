import React, { useState, useEffect } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { api } from '../../services/api';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  RotateCcw,
  AlertCircle,
  FileText,
  Lock,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

export const OrderFormPage: React.FC = () => {
  const { packages, selectedPackageId, selectPackageAndOrder, setConfirmedOrder, showToast, setCurrentPage } = useAgency();

  // Selected package object
  const activePackage = packages.find((p) => p.id === selectedPackageId) || packages[1] || packages[0];

  const [form, setForm] = useState({
    customerName: '',
    email: '',
    country: '',
    businessName: '',
    packageId: activePackage.id,
    projectRequirements: '',
    preferredDeliveryDate: '',
    additionalNotes: '',
  });

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Feature presets to select easily
  const commonFeatureOptions = [
    'Mobile Responsive Design',
    'Interactive Contact Form with Validation',
    'SEO Meta Tags & Sitemap Generation',
    'Google Analytics / Meta Pixel Setup',
    'Content Management / Blog Structure',
    'Shopping Cart & Product Catalog',
    'Manual Bank Wire Instructions Checkout',
    'Social Media Links & WhatsApp Chat Button',
    'Custom Domain & Web Hosting Setup Assistance',
  ];

  useEffect(() => {
    setForm((prev) => ({ ...prev, packageId: activePackage.id }));
    // Auto check features from package
    setSelectedFeatures(activePackage.includedFeatures.slice(0, 4));
  }, [activePackage]);

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!form.customerName.trim() || !form.email.trim() || !form.country.trim() || !form.projectRequirements.trim()) {
      setErrorMessage('Please fill in your name, email, country, and project brief.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.createOrder({
        customerName: form.customerName,
        email: form.email,
        country: form.country,
        businessName: form.businessName,
        packageId: form.packageId,
        projectRequirements: form.projectRequirements,
        requiredFeatures: selectedFeatures,
        preferredDeliveryDate: form.preferredDeliveryDate,
        additionalNotes: form.additionalNotes,
      });

      showToast(`Order ${response.orderRef} created successfully!`, 'success');
      // Pass the created order and secure clientAccessToken to the confirmation / manual payment instructions page
      setConfirmedOrder(response.order, response.clientAccessToken);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit order. Please check your connection.');
      showToast(err.message || 'Error creating order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-8">
          <button onClick={() => setCurrentPage('home')} className="hover:text-white transition">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <button onClick={() => setCurrentPage('services')} className="hover:text-white transition">
            Packages
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-cyan-400 font-semibold">Start Order</span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Configure Your Website Order
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Provide your project specifications below. Once submitted, you will receive an official non-sequential Order Reference and direct manual bank transfer instructions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Order Configuration Form */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Package Switcher */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Selected Website Package
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {packages.map((pkg) => {
                      const isSelected = form.packageId === pkg.id;
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, packageId: pkg.id });
                            selectPackageAndOrder(pkg.id);
                          }}
                          className={`p-3 rounded-xl text-left border transition text-xs ${
                            isSelected
                              ? 'bg-slate-800 border-cyan-400 shadow-md shadow-cyan-500/10'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                          }`}
                        >
                          <span className="font-bold block text-white">{pkg.name}</span>
                          <span className="font-mono text-cyan-400 font-semibold block mt-1">
                            ${pkg.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="pt-2 border-t border-slate-800/80 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Client & Organization Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Your Full Name <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.customerName}
                        onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                        placeholder="e.g. David Richardson"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Notification Email <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="d.richardson@business.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Country of Operation <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        placeholder="e.g. Canada, Germany, Singapore"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Business Name <span className="text-slate-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={form.businessName}
                        onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                        placeholder="e.g. Richardson & Co."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="pt-2 border-t border-slate-800/80 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Project Scope & Brief
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Detailed Project Requirements <span className="text-cyan-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.projectRequirements}
                      onChange={(e) => setForm({ ...form, projectRequirements: e.target.value })}
                      placeholder="Describe what your business does, your primary objectives, pages needed, visual aesthetic preferences (colors/typography), and any reference websites you admire..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Required Functional Features
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {commonFeatureOptions.map((feat, idx) => {
                        const checked = selectedFeatures.includes(feat);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleFeature(feat)}
                            className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition ${
                              checked
                                ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px] ${
                                checked ? 'bg-cyan-400 text-slate-950 font-bold' : 'border border-slate-700'
                              }`}
                            >
                              {checked && '✓'}
                            </span>
                            <span className="leading-tight">{feat}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Target Launch Date <span className="text-slate-500">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        value={form.preferredDeliveryDate}
                        onChange={(e) => setForm({ ...form, preferredDeliveryDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Reference Links / Notes <span className="text-slate-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={form.additionalNotes}
                        onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
                        placeholder="Link to design file, logo folder, or assets"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-slate-800/80">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 hover:from-cyan-300 hover:to-indigo-200 transition shadow-xl shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Generating Unique Order Reference...</span>
                    ) : (
                      <>
                        <span>Submit Order & View Bank Instructions</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-2.5">
                    Submitting this form creates your order in "Awaiting Payment" status. No funds are deducted automatically.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary & Package Details Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 sticky top-28 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Order Summary
                </span>
                <span className="text-xs text-slate-400">Step 1 of 3</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-1">{activePackage.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {activePackage.tagline}
                </p>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Package Invoiced Amount:</span>
                    <span className="text-2xl font-extrabold text-white font-mono">
                      ${activePackage.price.toLocaleString()} USD
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>Delivery Window:</span>
                    <span className="text-slate-200 font-semibold">{activePackage.deliveryTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Revisions:</span>
                    <span className="text-slate-200 font-semibold">{activePackage.revisions}</span>
                  </div>
                </div>
              </div>

              {/* What happens next explanation */}
              <div className="space-y-3 pt-2 text-xs">
                <h4 className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Transparent Next Steps:</span>
                </h4>
                <ol className="space-y-2 text-slate-400 pl-4 list-decimal">
                  <li>A unique non-sequential reference (e.g. GWS-2026-XXXXX) is created.</li>
                  <li>You receive Askari Bank and wire transfer instructions.</li>
                  <li>You make the transfer and upload your receipt in our secure proof portal.</li>
                  <li>Our finance team manually validates the transfer against our bank statement before work commences.</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Direct Transfer Security</span>
                </div>
                <p>
                  No payment gateway or card storage is used. You retain complete control over your banking transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
