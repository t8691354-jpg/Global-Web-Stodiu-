import React, { useState } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { api } from '../../services/api';
import { initialFaqs } from '../../data/initialData';
import {
  Mail,
  MapPin,
  Clock,
  Phone,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, showToast } = useAgency();

  const [form, setForm] = useState({
    name: '',
    email: '',
    country: '',
    businessType: 'Corporate / SME',
    serviceRequired: 'Business Website',
    budgetRange: '$300 – $600 USD',
    projectDescription: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!form.name.trim() || !form.email.trim() || !form.projectDescription.trim()) {
      setErrorMessage('Please provide your name, email, and project description.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitContact(form);
      setSubmittedSuccess(true);
      showToast('Thank you! Your project inquiry has been received.', 'success');
      setForm({
        name: '',
        email: '',
        country: '',
        businessType: 'Corporate / SME',
        serviceRequired: 'Business Website',
        budgetRange: '$300 – $600 USD',
        projectDescription: '',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send message. Please try again.');
      showToast(err.message || 'Failed to submit inquiry', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-cyan-400 mb-4 font-semibold uppercase tracking-wider">
            Inquiries & Consultation
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Contact GlobalWeb Studio
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Discuss your upcoming website build, custom technical specifications, or timeline requirements with our engineering team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Contact Details & Studio Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <span>Direct Studio Contacts</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We handle development inquiries for clients globally. All inquiries are reviewed directly by our project leads.
              </p>

              <div className="space-y-4 pt-2 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      General & Inquiries
                    </span>
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="text-white hover:text-cyan-400 font-medium transition"
                    >
                      {settings.contactEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Operating Hours
                    </span>
                    <span className="text-white font-medium">{settings.workingHours}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Studio Headquarters
                    </span>
                    <span className="text-white font-medium">{settings.headquarters}</span>
                  </div>
                </div>

                {settings.phone && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <Phone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Telephone
                      </span>
                      <span className="text-white font-medium">{settings.phone}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Anti-Spam & Confidentiality</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Inquiries are encrypted and protected by strict server-side rate limits. Your project details and contact data are never shared with third parties.
              </p>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-2">Request a Project Consultation</h3>
              <p className="text-xs text-slate-400 mb-6">
                Fill in your project scope below for a detailed feasibility review and timeline estimate.
              </p>

              {submittedSuccess ? (
                <div className="p-8 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Inquiry Successfully Transmitted</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you for contacting GlobalWeb Studio. A senior developer will evaluate your project requirements and respond within 12–24 business hours.
                  </p>
                  <button
                    onClick={() => setSubmittedSuccess(false)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Your Full Name <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Work / Contact Email <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="s.jenkins@company.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Country of Operation
                      </label>
                      <input
                        type="text"
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        placeholder="e.g. United Kingdom, UAE, USA"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Business / Organization Type
                      </label>
                      <select
                        value={form.businessType}
                        onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                      >
                        <option value="Corporate / SME">Corporate / SME</option>
                        <option value="Startup / Technology">Startup / Technology</option>
                        <option value="E-Commerce Retailer">E-Commerce Retailer</option>
                        <option value="Real Estate / Property">Real Estate / Property</option>
                        <option value="Healthcare / Clinic">Healthcare / Clinic</option>
                        <option value="Restaurant / Hospitality">Restaurant / Hospitality</option>
                        <option value="Sole Proprietor">Sole Proprietor</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Service Required
                      </label>
                      <select
                        value={form.serviceRequired}
                        onChange={(e) => setForm({ ...form, serviceRequired: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                      >
                        <option value="Starter Website ($149)">Starter Website ($149)</option>
                        <option value="Business Website ($349)">Business Website ($349)</option>
                        <option value="E-commerce Website ($699)">E-commerce Website ($699)</option>
                        <option value="Custom Web Application ($1,500+)">Custom Web Application ($1,500+)</option>
                        <option value="Technical Consultation">Technical Consultation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Allocated Budget Range
                      </label>
                      <select
                        value={form.budgetRange}
                        onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                      >
                        <option value="Under $200 USD">Under $200 USD (Starter tier)</option>
                        <option value="$300 – $600 USD">$300 – $600 USD (Business tier)</option>
                        <option value="$600 – $1,200 USD">$600 – $1,200 USD (E-Commerce tier)</option>
                        <option value="$1,500+ USD">$1,500+ USD (Custom Application tier)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Project Description & Requirements <span className="text-cyan-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.projectDescription}
                      onChange={(e) => setForm({ ...form, projectDescription: e.target.value })}
                      placeholder="Outline your website objectives, target number of pages, branding assets, and any specific interactive features required..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Transmitting Inquiry...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Project Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="max-w-4xl mx-auto pt-8 border-t border-slate-900">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white">Inquiry & Payment FAQs</h3>
            <p className="text-xs text-slate-400 mt-1">
              Key operational details regarding commercial invoicing, bank settlement, and production timelines.
            </p>
          </div>

          <div className="space-y-3">
            {initialFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-semibold text-sm text-white flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-cyan-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
