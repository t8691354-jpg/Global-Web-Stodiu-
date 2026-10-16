import React, { useState, useMemo } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { WebsitePackage } from '../../types';
import {
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Layers,
  ArrowUpDown,
  Building,
  Info,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  Server,
  Zap,
} from 'lucide-react';

export const PricingCatalogPage: React.FC = () => {
  const { packages, selectPackageAndOrder, navigateToCustomRequest, setCurrentPage } = useAgency();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Default ascending: $80 first, $2M last
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);
  const [onlyEnterprise, setOnlyEnterprise] = useState<boolean>(false);

  // Modal details
  const [selectedPackageDetails, setSelectedPackageDetails] = useState<WebsitePackage | null>(null);

  // Available categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    packages.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [packages]);

  // Filter & sort logic
  const filteredPackages = useMemo(() => {
    return packages
      .filter((pkg) => {
        // Search
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = pkg.name.toLowerCase().includes(term);
          const matchDesc = pkg.description?.toLowerCase().includes(term);
          const matchTagline = pkg.tagline?.toLowerCase().includes(term);
          const matchCat = pkg.category?.toLowerCase().includes(term);
          if (!matchName && !matchDesc && !matchTagline && !matchCat) return false;
        }

        // Tier
        if (selectedTier !== 'all') {
          if (pkg.tier !== selectedTier) return false;
        }

        // Category
        if (selectedCategory !== 'all') {
          if (pkg.category !== selectedCategory) return false;
        }

        // Price range
        if (priceRange !== 'all') {
          if (priceRange === 'under-500' && pkg.price >= 500) return false;
          if (priceRange === '500-2500' && (pkg.price < 500 || pkg.price > 2500)) return false;
          if (priceRange === '2500-25000' && (pkg.price < 2500 || pkg.price > 25000)) return false;
          if (priceRange === '25000-150000' && (pkg.price < 25000 || pkg.price > 150000)) return false;
          if (priceRange === '150000-plus' && pkg.price < 150000) return false;
        }

        // Featured & Enterprise
        if (onlyFeatured && !pkg.isFeatured && !pkg.popular) return false;
        if (onlyEnterprise && !pkg.isEnterprise && pkg.price < 100000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'asc') return a.price - b.price;
        return b.price - a.price;
      });
  }, [packages, searchTerm, selectedTier, selectedCategory, priceRange, sortOrder, onlyFeatured, onlyEnterprise]);

  const handleRequestPackage = (pkg: WebsitePackage) => {
    if (pkg.price >= 10000 || pkg.isStartingAt || pkg.isEnterprise) {
      // Direct to custom project request prefilled
      navigateToCustomRequest({
        projectTitle: `${pkg.name} Implementation`,
        projectCategory: pkg.category,
        budgetRangeUSD: pkg.isStartingAt ? `Starting at $${pkg.price.toLocaleString()} USD` : `$${pkg.price.toLocaleString()} USD`,
        projectDescription: pkg.description || pkg.tagline,
        requiredFeatures: pkg.includedFeatures,
      });
    } else {
      // Standard order flow
      selectPackageAndOrder(pkg.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <button onClick={() => setCurrentPage('home')} className="hover:text-white transition">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-cyan-400 font-semibold">Project Pricing Catalog</span>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-cyan-400 mb-4 font-semibold uppercase tracking-wider">
            Comprehensive Digital Catalog • $80 to $2,000,000 USD
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Project Pricing & Architecture Catalog
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Browse our full spectrum of engineered web solutions from entry-level single pages to multi-million-dollar global digital ecosystems. Displayed in ascending price order.
          </p>
        </div>

        {/* Custom Project Callout Card */}
        <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-indigo-950/40 border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Need Bespoke Architecture or Negotiated Deal?</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Build a Custom Project Request
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Have complex enterprise software, customized database schemas, multi-sided marketplaces, or large-scale integrations? Submit your requirements for a formal, milestone-based quotation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => navigateToCustomRequest()}
              className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 transition shadow-lg shadow-cyan-500/20 text-center"
            >
              Request a Custom Project
            </button>
            <button
              onClick={() => setCurrentPage('client-portal')}
              className="px-5 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-slate-900 hover:bg-slate-850 border border-slate-800 transition text-center"
            >
              Client Request Portal
            </button>
          </div>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="mb-8 p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects by name, keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Tier Filter */}
            <div>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Project Tiers</option>
                <option value="affordable">Affordable Projects ($80 – $999)</option>
                <option value="growing">Growing Business ($1,200 – $100k)</option>
                <option value="enterprise">Enterprise Platforms ($150k – $2M)</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Price Ranges</option>
                <option value="under-500">Under $500 USD</option>
                <option value="500-2500">$500 – $2,500 USD</option>
                <option value="2500-25000">$2,500 – $25,000 USD</option>
                <option value="25000-150000">$25,000 – $150,000 USD</option>
                <option value="150000-plus">$150,000 – $2,000,000 USD</option>
              </select>
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center justify-between transition"
              >
                <span>Price: {sortOrder === 'asc' ? 'Lowest First ($80 → $2M)' : 'Highest First ($2M → $80)'}</span>
                <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Secondary filter toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setOnlyFeatured(!onlyFeatured)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  onlyFeatured
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                ★ Featured Projects Only
              </button>
              <button
                onClick={() => setOnlyEnterprise(!onlyEnterprise)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  onlyEnterprise
                    ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚡ Enterprise ($100k - $2M) Only
              </button>
            </div>

            <span className="text-slate-400 font-mono text-[11px]">
              Showing {filteredPackages.length} of {packages.length} projects
            </span>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredPackages.map((pkg, idx) => {
            const isMillionDollar = pkg.price >= 1000000;
            const isEnterprise = pkg.isEnterprise || pkg.price >= 100000;
            const isFeatured = pkg.isFeatured || pkg.popular;

            return (
              <div
                key={pkg.id}
                className={`flex flex-col justify-between rounded-2xl p-6 transition-all relative ${
                  isMillionDollar
                    ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/60 shadow-2xl shadow-amber-500/10'
                    : isEnterprise
                    ? 'bg-slate-900/90 border border-indigo-500/40 shadow-xl shadow-indigo-950/20'
                    : isFeatured
                    ? 'bg-slate-900/80 border-2 border-cyan-500/70 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/50 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Badges */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {pkg.category}
                    </span>
                    {isMillionDollar && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">
                        7-Figure Enterprise
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {pkg.deliveryTime}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-1.5 leading-snug">{pkg.name}</h3>
                  <p className="text-xs text-slate-400 mb-4 min-h-[38px] leading-relaxed">
                    {pkg.tagline}
                  </p>

                  {/* Price Block */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {pkg.isStartingAt ? 'Starting at' : 'Fixed Investment'}
                      </span>
                      {pkg.tier && (
                        <span className="text-[10px] uppercase font-bold text-slate-500">
                          {pkg.tier}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                        isMillionDollar ? 'text-amber-300' : 'text-white'
                      }`}>
                        ${pkg.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">USD</span>
                    </div>
                    {pkg.idealClient && (
                      <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                        <strong className="text-slate-300">Ideal for:</strong> {pkg.idealClient}
                      </p>
                    )}
                  </div>

                  {/* Included Deliverables preview */}
                  <div className="space-y-2 mb-6">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Key Deliverables:
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {pkg.includedFeatures.slice(0, 4).map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedPackageDetails(pkg)}
                      className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition text-center"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleRequestPackage(pkg)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1 ${
                        isMillionDollar
                          ? 'bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 shadow-md'
                          : isEnterprise
                          ? 'bg-gradient-to-r from-indigo-400 to-cyan-400 text-slate-950 font-bold'
                          : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md shadow-cyan-500/20'
                      }`}
                    >
                      <span>Request Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-center text-slate-500">
                    {pkg.price >= 10000 || pkg.isStartingAt
                      ? 'Requires personalized quotation & milestone agreement'
                      : 'Fixed package order available'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal for Package Details & Enterprise Overview */}
        {selectedPackageDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {selectedPackageDetails.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Delivery: {selectedPackageDetails.deliveryTime}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedPackageDetails.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">{selectedPackageDetails.tagline}</p>
                </div>

                <button
                  onClick={() => setSelectedPackageDetails(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Price Callout */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">
                    {selectedPackageDetails.isStartingAt ? 'Starting At Investment:' : 'Standard Package Price:'}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      ${selectedPackageDetails.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">USD</span>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <span className="block font-semibold text-white">{selectedPackageDetails.pagesDescription}</span>
                  <span>{selectedPackageDetails.revisions}</span>
                </div>
              </div>

              {/* Full Description */}
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>{selectedPackageDetails.description}</p>
              </div>

              {/* Included Deliverables */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Included Features & Deliverables:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {selectedPackageDetails.includedFeatures.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exclusions */}
              {selectedPackageDetails.excludedFeatures && selectedPackageDetails.excludedFeatures.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <h4 className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                    Package Exclusions & Out of Scope:
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-400 list-disc pl-4">
                    {selectedPackageDetails.excludedFeatures.map((excl, i) => (
                      <li key={i}>{excl}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Million-Dollar Enterprise Overview */}
              {selectedPackageDetails.enterpriseOverview && (
                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-4">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <Shield className="w-4 h-4" />
                    <span>Enterprise Architecture & Implementation Overview</span>
                  </div>

                  {selectedPackageDetails.enterpriseOverview.modules && (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-300 uppercase mb-1.5">
                        Enterprise Core Modules:
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
                        {selectedPackageDetails.enterpriseOverview.modules.map((mod, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            <span>{mod}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedPackageDetails.enterpriseOverview.securityAndScalability && (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-300 uppercase mb-1">
                        Security & Concurrency Scalability:
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {selectedPackageDetails.enterpriseOverview.securityAndScalability}
                      </p>
                    </div>
                  )}

                  {selectedPackageDetails.enterpriseOverview.infrastructurePlan && (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-300 uppercase mb-1">
                        Infrastructure Plan:
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {selectedPackageDetails.enterpriseOverview.infrastructurePlan}
                      </p>
                    </div>
                  )}

                  {selectedPackageDetails.enterpriseOverview.implementationPhases && (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-300 uppercase mb-1.5">
                        Phased Implementation Roadmap:
                      </p>
                      <ol className="space-y-1 text-xs text-slate-400 list-decimal pl-4">
                        {selectedPackageDetails.enterpriseOverview.implementationPhases.map((phase, i) => (
                          <li key={i}>{phase}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {selectedPackageDetails.enterpriseOverview.supportAndSLA && (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-300 uppercase mb-1">
                        Support Terms & Hypercare SLA:
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {selectedPackageDetails.enterpriseOverview.supportAndSLA}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setSelectedPackageDetails(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const target = selectedPackageDetails;
                    setSelectedPackageDetails(null);
                    handleRequestPackage(target);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 transition shadow-lg shadow-cyan-500/20"
                >
                  {selectedPackageDetails.price >= 10000 || selectedPackageDetails.isStartingAt
                    ? 'Request Custom Scoping & Quotation'
                    : 'Configure & Order This Package'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
