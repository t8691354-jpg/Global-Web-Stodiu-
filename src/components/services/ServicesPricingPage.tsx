import React, { useState } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { initialServiceCategories } from '../../data/initialData';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  RotateCcw,
  FileText,
  ShieldCheck,
  Building2,
  Rocket,
  ShoppingBag,
  Home,
  CalendarCheck,
  BookOpen,
  Code2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const ServicesPricingPage: React.FC = () => {
  const { packages, selectPackageAndOrder, setCurrentPage, navigateToCustomRequest } = useAgency();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="w-5 h-5 text-cyan-400" />;
      case 'Rocket': return <Rocket className="w-5 h-5 text-cyan-400" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-cyan-400" />;
      case 'Home': return <Home className="w-5 h-5 text-cyan-400" />;
      case 'CalendarCheck': return <CalendarCheck className="w-5 h-5 text-cyan-400" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-cyan-400" />;
      default: return <Code2 className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-cyan-400 mb-4 font-semibold uppercase tracking-wider">
            Packages & Scope
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Transparent Website Packages
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Every package is engineered with clean code, dedicated design, and direct developer communication. Pick your package to configure your requirements and initiate your order.
          </p>
        </div>

        {/* Detailed Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {packages.map((pkg) => {
            const isPopular = pkg.popular;
            return (
              <div
                key={pkg.id}
                className={`flex flex-col justify-between rounded-2xl p-6 transition-all relative ${
                  isPopular
                    ? 'bg-slate-900/90 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/10'
                    : 'bg-slate-950 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-400 text-slate-950">
                    Recommended
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                      {pkg.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {pkg.deliveryTime}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1.5">{pkg.name}</h3>
                  <p className="text-xs text-slate-400 mb-4 min-h-[44px]">{pkg.tagline}</p>

                  {/* Pricing Block */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 mb-5">
                    <span className="text-[11px] text-slate-400 block mb-0.5">
                      {pkg.isStartingAt ? 'Starting at' : 'Fixed investment'}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-white font-mono">
                        ${pkg.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">USD</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{pkg.pagesDescription}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{pkg.revisions}</span>
                      </div>
                    </div>
                  </div>

                  {/* Included Deliverables */}
                  <div className="space-y-2 mb-6">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                      Included in Package:
                    </p>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {pkg.includedFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Clear Exclusions for Transparency */}
                  {pkg.excludedFeatures && pkg.excludedFeatures.length > 0 && (
                    <div className="space-y-2 mb-6 p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Package Exclusions:
                      </p>
                      <ul className="space-y-1.5 text-[11px] text-slate-400">
                        {pkg.excludedFeatures.map((excl, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                            <span className="leading-snug">{excl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800">
                  {pkg.id === 'custom' ? (
                    <button
                      onClick={() => navigateToCustomRequest({ projectTitle: 'Custom Website Architecture', category: 'Custom Web Application' })}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-400 to-indigo-300 text-slate-950 hover:from-cyan-300 hover:to-indigo-200 shadow-lg shadow-cyan-500/20"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Request Custom Deal</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => selectPackageAndOrder(pkg.id)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1.5 ${
                        isPopular
                          ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      <span>Select Package</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Industry Service Categories */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Industry Verticals
            </h2>
            <h3 className="text-3xl font-bold text-white tracking-tight">
              Website Solutions by Business Type
            </h3>
            <p className="text-slate-400 text-sm mt-2">
              Explore how our packages apply to specific commercial requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialServiceCategories.map((cat) => (
              <div
                key={cat.id}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-4">
                  {getCategoryIcon(cat.icon)}
                </div>
                <h4 className="text-base font-bold text-white mb-1.5">{cat.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{cat.description}</p>
                <div className="space-y-1 mb-5">
                  <p className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
                    Core Deliverables
                  </p>
                  {cat.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-1 h-1 rounded-full bg-cyan-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => selectPackageAndOrder(cat.suggestedPackage)}
                  className="w-full py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-center"
                >
                  Configure & Order This Solution
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="text-2xl font-bold text-white">Full Feature Comparison Matrix</h3>
            <p className="text-xs text-slate-400 mt-1">
              Direct side-by-side technical evaluation across all studio packages.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Feature / Specification</th>
                  <th className="py-3 px-4">Starter ($149)</th>
                  <th className="py-3 px-4">Business ($349)</th>
                  <th className="py-3 px-4">E-Commerce ($699)</th>
                  <th className="py-3 px-4">Custom ($1,500+)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Total Custom Pages</td>
                  <td className="py-3 px-4">1–3 Pages</td>
                  <td className="py-3 px-4">7–10 Pages</td>
                  <td className="py-3 px-4">Full Store Catalog</td>
                  <td className="py-3 px-4">Custom Scope</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Turnaround Window</td>
                  <td className="py-3 px-4 font-mono">3–5 Days</td>
                  <td className="py-3 px-4 font-mono">7–10 Days</td>
                  <td className="py-3 px-4 font-mono">12–16 Days</td>
                  <td className="py-3 px-4 font-mono">Milestone Based</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Revision Iterations</td>
                  <td className="py-3 px-4">2 Rounds</td>
                  <td className="py-3 px-4">4 Rounds</td>
                  <td className="py-3 px-4">5 Rounds</td>
                  <td className="py-3 px-4">Collaborative Cycles</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Mobile Responsiveness</td>
                  <td className="py-3 px-4 text-emerald-400">Included</td>
                  <td className="py-3 px-4 text-emerald-400">Included</td>
                  <td className="py-3 px-4 text-emerald-400">Included</td>
                  <td className="py-3 px-4 text-emerald-400">Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Contact & Inquiry Form</td>
                  <td className="py-3 px-4 text-emerald-400">Standard Form</td>
                  <td className="py-3 px-4 text-emerald-400">Lead Routing + Uploads</td>
                  <td className="py-3 px-4 text-emerald-400">Inquiry & Checkout Forms</td>
                  <td className="py-3 px-4 text-emerald-400">Bespoke Portal Forms</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">E-Commerce & Cart</td>
                  <td className="py-3 px-4 text-slate-500">—</td>
                  <td className="py-3 px-4 text-slate-500">—</td>
                  <td className="py-3 px-4 text-emerald-400">Full Cart + Bank Checkout</td>
                  <td className="py-3 px-4 text-emerald-400">Custom Architecture</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Post-Launch Support</td>
                  <td className="py-3 px-4">14 Days</td>
                  <td className="py-3 px-4">30 Days</td>
                  <td className="py-3 px-4">45 Days</td>
                  <td className="py-3 px-4">60 Days Dedicated</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Action</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => selectPackageAndOrder('starter')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold"
                    >
                      Select $149
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => selectPackageAndOrder('business')}
                      className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold"
                    >
                      Select $349
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => selectPackageAndOrder('ecommerce')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold"
                    >
                      Select $699
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => selectPackageAndOrder('custom')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold"
                    >
                      Select Custom
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
