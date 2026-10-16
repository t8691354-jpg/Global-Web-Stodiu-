import React, { useState } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { PortfolioItem } from '../../types';
import {
  Filter,
  ExternalLink,
  Layers,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Monitor,
  Smartphone,
  ShieldAlert,
} from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const { portfolio, selectPackageAndOrder, setCurrentPage } = useAgency();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalItem, setActiveModalItem] = useState<PortfolioItem | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'business', label: 'Business & Corporate' },
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'real_estate', label: 'Real Estate' },
    { id: 'restaurants', label: 'Dining & Hospitality' },
    { id: 'services', label: 'Service Businesses' },
    { id: 'custom', label: 'Custom Web Apps' },
  ];

  const filteredItems =
    selectedCategory === 'all'
      ? portfolio
      : portfolio.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-cyan-400 mb-4 font-semibold uppercase tracking-wider">
            Curated Showcase
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Studio Portfolio & Demos
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Inspect our design standards, component architecture, and responsive layouts. In accordance with our truthful advertising policy, all projects are clearly marked as studio demo showcases or verified private client contracts.
          </p>

          <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 max-w-xl mx-auto flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Interactive demonstrations built using our production React & Tailwind component stack.</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition overflow-hidden group"
            >
              <div>
                {/* Image & Badge */}
                <div className="relative h-56 overflow-hidden bg-slate-950">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-950/90 text-cyan-300 border border-slate-800 backdrop-blur-md">
                    {item.isSample ? 'Studio Showcase Demo' : 'Custom Build'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="uppercase text-[10px] font-bold tracking-wider text-cyan-400">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-1.5 mb-5 pt-3 border-t border-slate-800/80">
                    <p className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
                      Architectural Highlights:
                    </p>
                    {item.keyFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 border-t border-slate-800/60 mt-4 flex items-center gap-3">
                <button
                  onClick={() => setActiveModalItem(item)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Demo Details</span>
                </button>
                <button
                  onClick={() => selectPackageAndOrder('business')}
                  className="py-2.5 px-3 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
                  title="Build similar website"
                >
                  Order Similar
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm">No showcases currently in this category.</p>
          </div>
        )}

        {/* Demo Detail Modal */}
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {activeModalItem.isSample ? 'Interactive Showcase Concept' : 'Verified Build'}
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wider">
                  {activeModalItem.category.replace('_', ' ')}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">
                {activeModalItem.title}
              </h2>

              <div className="rounded-xl overflow-hidden mb-6 border border-slate-800">
                <img
                  src={activeModalItem.imageUrl}
                  alt={activeModalItem.title}
                  className="w-full h-64 object-cover"
                />
              </div>

              <div className="space-y-4 mb-6 text-sm text-slate-300 leading-relaxed">
                <p>{activeModalItem.description}</p>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Key Deliverables Implemented in Demo
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {activeModalItem.keyFeatures.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 text-xs text-slate-400">
                  <p className="font-semibold text-slate-300 mb-1">Architecture & Tech Stack:</p>
                  <p>React 19, TypeScript, Tailwind CSS, Responsive Flexbox/Grid, Semantic SEO Tags.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 transition"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    setActiveModalItem(null);
                    selectPackageAndOrder('business');
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 transition shadow-md shadow-cyan-500/20"
                >
                  Order Website with This Architecture
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
