import React, { useState } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { initialFaqs, initialServiceCategories } from '../../data/initialData';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Zap,
  Globe2,
  Clock,
  Layers,
  Code2,
  FileText,
  ChevronDown,
  Sparkles,
  ExternalLink,
  CreditCard,
  Building2,
  ShoppingBag,
  Home,
  CalendarCheck,
  BookOpen,
  Rocket,
  Smartphone,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { packages, portfolio, selectPackageAndOrder, setCurrentPage, settings, cashbackPromo, setIsAndroidModalOpen } = useAgency();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Icon mapping for categories
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
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Promotion Announcement Banner if enabled */}
      {cashbackPromo?.enabled && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 border-b border-cyan-500/30 py-2.5 px-4 text-center text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-cyan-200 font-medium">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-bounce" />
            <span>
              Active Weekly Promotion: Verified client orders eligible for 50% cashback awards (Terms apply).
            </span>
            <button
              onClick={() => setCurrentPage('services')}
              className="underline text-white font-semibold hover:text-cyan-300 ml-1"
            >
              Learn More
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-36 overflow-hidden">
        {/* Subtle grid and glowing radial gradients */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[400px] h-[250px] bg-indigo-500/10 blur-[110px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-medium">Direct Bank & Wire Settlement • No Hidden Gateway Surcharges</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Engineered Web Development for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
                Ambitious Businesses
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Custom-built websites, e-commerce storefronts, and bespoke web platforms crafted to your exact operational specifications. Transparent packages, manual payment verification, and clean source code delivery.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setCurrentPage('order')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 hover:from-cyan-300 hover:to-indigo-200 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/35 transition active:scale-[0.98]"
              >
                <span>Get a Website</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage('services')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
              >
                <span>Explore Packages from $149</span>
              </button>

              <button
                onClick={() => setIsAndroidModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition shadow-lg shadow-emerald-500/10"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Android App (APK / PWA)</span>
              </button>
            </div>

            {/* Key specs highlight */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto text-left">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <p className="text-xs text-slate-400">Starting Price</p>
                <p className="text-lg font-bold text-white font-mono">$149 USD</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <p className="text-xs text-slate-400">Fast Turnaround</p>
                <p className="text-lg font-bold text-white">3–5 Days</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <p className="text-xs text-slate-400">Code Quality</p>
                <p className="text-lg font-bold text-white">TypeScript / React</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <p className="text-xs text-slate-400">Ownership</p>
                <p className="text-lg font-bold text-white">100% Client</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Packages Section */}
      <section className="py-20 bg-slate-900/50 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Transparent Pricing
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Website Packages for Every Scale
            </h3>
            <p className="text-slate-400 text-sm mt-3">
              Clear scope, fixed pricing, and predictable timelines. All package rates are centrally configured and guaranteed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => {
              const isPopular = pkg.popular;
              return (
                <div
                  key={pkg.id}
                  className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 ${
                    isPopular
                      ? 'bg-slate-900 border-2 border-cyan-500/80 shadow-2xl shadow-cyan-500/10'
                      : 'bg-slate-950/80 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-md">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                        {pkg.category}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {pkg.deliveryTime}
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-white mb-2">{pkg.name}</h4>
                    <p className="text-xs text-slate-400 mb-5 min-h-[36px]">{pkg.tagline}</p>

                    {/* Price */}
                    <div className="mb-6 pb-6 border-b border-slate-800">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs text-slate-400">
                          {pkg.isStartingAt ? 'Starting at' : 'Flat rate'}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                          ${pkg.price.toLocaleString()}
                        </span>
                        <span className="text-xs font-medium text-slate-400">USD</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {pkg.pagesDescription}
                      </p>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2.5 text-xs text-slate-300 mb-6">
                      <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wide">
                        Included Deliverables
                      </p>
                      {pkg.includedFeatures.slice(0, 5).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 space-y-2">
                    <button
                      onClick={() => selectPackageAndOrder(pkg.id)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1.5 ${
                        isPopular
                          ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      <span>Select Package</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-[10px] text-center text-slate-400">
                      Includes {pkg.revisions}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => setCurrentPage('services')}
              className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5 underline"
            >
              <span>View full technical breakdown & package comparison table</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Services Overview Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Capabilities & Focus
            </h2>
            <h3 className="text-3xl font-bold text-white tracking-tight">
              Website Solutions Across Industry Verticals
            </h3>
            <p className="text-slate-400 text-sm mt-3">
              We engineer tailor-made digital storefronts, portals, and web architectures matched to commercial goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialServiceCategories.map((service) => (
              <div
                key={service.id}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  {getCategoryIcon(service.icon)}
                </div>
                <h4 className="text-base font-bold text-white mb-2">{service.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{service.description}</p>
                <div className="space-y-1.5 pt-3 border-t border-slate-800/80 mb-5">
                  {service.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => selectPackageAndOrder(service.suggestedPackage)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 group-hover:translate-x-1 transition"
                >
                  <span>Order with recommended package</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Workflow Section */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              End-to-End Delivery
            </h2>
            <h3 className="text-3xl font-bold text-white tracking-tight">
              How Our Process Works
            </h3>
            <p className="text-slate-400 text-sm mt-3">
              A transparent, milestone-driven development process with complete auditability at every stage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                step: '01',
                title: 'Select & Brief',
                desc: 'Pick your package and specify your required pages, design preferences, and branding requirements.',
              },
              {
                step: '02',
                title: 'Order Ref & Bank Wire',
                desc: 'Receive your unique non-sequential Order Reference and direct manual bank transfer instructions.',
              },
              {
                step: '03',
                title: 'Upload Receipt',
                desc: 'Submit your bank receipt or transfer confirmation slip through our private, secure proof portal.',
              },
              {
                step: '04',
                title: 'Finance Verification',
                desc: 'Our finance team verifies the transfer against bank statements before development begins.',
              },
              {
                step: '05',
                title: 'Build & Deploy',
                desc: 'Full engineering cycle, revision rounds, client staging review, and final production launch.',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="relative p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-slate-900 inline-block mb-3 border border-slate-800">
                    STEP {step.step}
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-4 rounded-xl bg-slate-900/80 border border-slate-800 max-w-3xl mx-auto flex items-start gap-3 text-xs text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-0.5">Strict Financial Verification Standard</p>
              <p className="text-slate-400">
                Work begins only after incoming funds are verified by an authorized finance administrator. Uploaded screenshots alone do not trigger automated approval, ensuring full commercial security for both client and studio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Preview Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                Workmanship & Quality
              </h2>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                Featured Showcases & Demos
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Clearly labelled interactive demo concepts and custom architecture showcases.
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('portfolio')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              <span>Explore All Filterable Projects</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {portfolio.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden hover:border-slate-700 transition flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-slate-950">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-950/90 text-cyan-300 border border-slate-800">
                    {item.isSample ? 'Agency Showcase Demo' : 'Client Project'}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
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

                  <button
                    onClick={() => setCurrentPage('portfolio')}
                    className="w-full py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 hover:text-white rounded-lg transition"
                  >
                    View Project Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section (Truthful Claims Only) */}
      <section className="py-20 bg-slate-900/60 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Our Commitment
            </h2>
            <h3 className="text-3xl font-bold text-white tracking-tight">
              Why Partner with GlobalWeb Studio
            </h3>
            <p className="text-slate-400 text-sm mt-3">
              We build long-term relationships through technical competence, direct accountability, and honest commercial practices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Truthful Claims & Zero Fakes</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                We never invent testimonials, fictional client endorsements, or fake sales records. You deal directly with professional engineers and transparent specifications.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Code2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Modern Clean Architecture</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                All websites are engineered using modern TypeScript, responsive React components, and semantic standards for high lighthouse performance and easy future maintainability.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Direct Bank & Wire Rates</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                By utilizing direct bank and transfer rails (Askari Bank, wire transfer, Wise), we bypass expensive processor fees and pass those substantial cost savings directly into package value.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Common Questions
            </h2>
            <h3 className="text-3xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h3>
            <p className="text-slate-400 text-sm mt-2">
              Clear answers regarding our ordering flow, manual payment verification, and delivery process.
            </p>
          </div>

          <div className="space-y-3">
            {initialFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-900/60 border border-slate-800/80 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-semibold text-sm sm:text-base text-white flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-cyan-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Build Your New Website?
          </h3>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Choose from our transparent packages or request a bespoke quotation. Our team will guide your project from initial wireframe to live production launch.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setCurrentPage('order')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-xl shadow-cyan-500/20 transition active:scale-[0.98]"
            >
              <span>Start Your Order Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage('contact')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
            >
              Contact Our Engineers
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
