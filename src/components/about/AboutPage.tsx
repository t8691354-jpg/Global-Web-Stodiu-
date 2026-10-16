import React from 'react';
import { useAgency } from '../../context/AgencyContext';
import {
  Code2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Cpu,
  Layers,
  HeartHandshake,
  Compass,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { setCurrentPage, settings } = useAgency();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-cyan-400 mb-4 font-semibold uppercase tracking-wider">
            About Our Studio
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Engineered with Integrity & Precision
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            {settings.businessName} is an international web engineering practice built on technical rigor, transparent pricing, and verifiable deliverables.
          </p>
        </div>

        {/* Studio Philosophy & Truthful Stance */}
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 mb-12 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <span>Our Founding Principles</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            The web agency landscape is unfortunately saturated with synthetic client testimonials, fake five-star reviews, and automated card billing gimmicks. At GlobalWeb Studio, we hold ourselves to a strict standard of commercial honesty:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1.5">
                Authentic Portfolio Previews
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                All showcase designs on our site are clearly designated as agency demo concepts or verified client commissions. We do not invent fictional enterprise brands or fabricated revenue claims.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1.5">
                Direct Banking & Settlement
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                By accepting payment through Askari Bank transfer, SWIFT/IBAN wire, and verified remittance services, we avoid third-party card processing markups, maintaining direct accounting records for every transaction.
              </p>
            </div>
          </div>
        </div>

        {/* Development Process Breakdown */}
        <div className="mb-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-bold text-white">Our Engineering Workflow</h3>
            <p className="text-xs text-slate-400 mt-1">
              From requirement intake to production server deployment.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                step: 'Phase 1: Architecture & Structural Scoping',
                desc: 'We review your business vertical, target audience, brand typography, and functional needs. We outline semantic page structures and user navigation pathways.',
              },
              {
                step: 'Phase 2: Payment Receipt & Verification Gate',
                desc: 'Your order is recorded with status "Awaiting Payment". Upon receiving your bank confirmation, our finance desk verifies the funds against our account statement before allocating engineering resources.',
              },
              {
                step: 'Phase 3: Front-End & Responsive Layout Construction',
                desc: 'We build your website using modern TypeScript and responsive CSS. Components are tested across modern desktop displays, tablets, and smartphones.',
              },
              {
                step: 'Phase 4: Revision Iterations & Quality Assurance',
                desc: 'You receive a staging preview link to test all forms, typography, and interactive components within the agreed package revision rounds.',
              },
              {
                step: 'Phase 5: Production Deployment & Asset Handover',
                desc: 'We assist with DNS configuration, SSL setup, and deployment to your chosen hosting infrastructure. 100% of source code is delivered directly to you.',
              },
            ].map((phase, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  0{idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">{phase.step}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack Grid */}
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 mb-14">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>Modern Production Technology Stack</span>
          </h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            We avoid fragile templates and bloated page-builder plugins that slow down loading speeds. We construct high-performance, accessible web applications using current industry standards:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-bold text-white block">React 19</span>
              <span className="text-slate-400">Component architecture</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-bold text-white block">TypeScript</span>
              <span className="text-slate-400">Strict type safety</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-bold text-white block">Tailwind CSS</span>
              <span className="text-slate-400">Responsive utilities</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-bold text-white block">Node.js & Express</span>
              <span className="text-slate-400">Secure backend APIs</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <button
            onClick={() => setCurrentPage('order')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-xl shadow-cyan-500/20 transition"
          >
            <span>Start Your Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
