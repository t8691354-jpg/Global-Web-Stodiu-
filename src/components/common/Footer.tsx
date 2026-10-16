import React from 'react';
import { useAgency, NavigationPage } from '../../context/AgencyContext';
import {
  Globe,
  Mail,
  Clock,
  MapPin,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentPage, settings, packages, selectPackageAndOrder } = useAgency();

  const handleNav = (page: NavigationPage) => {
    setCurrentPage(page);
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => handleNav('home')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                {settings.businessName}
              </span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              An international digital studio dedicated to clean, reliable, and high-performance website engineering. We build dedicated commercial storefronts, landing pages, and web apps with transparent milestone delivery.
            </p>

            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{settings.headquarters}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{settings.workingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="hover:text-cyan-400 transition"
                >
                  {settings.contactEmail}
                </a>
              </div>
            </div>

            {/* Truth in Advertising Notice */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 leading-snug">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                <span>Transparent Business Policy</span>
              </div>
              We strictly decline to publish invented testimonials, synthetic ratings, or fake sales figures. All portfolio previews are clearly distinguished between live demo showcases and verified bespoke client builds.
            </div>
          </div>

          {/* Website Packages */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Web Packages
            </p>
            <ul className="space-y-2 text-xs">
              {packages.map((pkg) => (
                <li key={pkg.id}>
                  <button
                    onClick={() => selectPackageAndOrder(pkg.id)}
                    className="hover:text-cyan-400 transition flex items-center justify-between w-full text-left"
                  >
                    <span>{pkg.name}</span>
                    <span className="font-mono text-slate-500 font-semibold">
                      ${pkg.price}
                    </span>
                  </button>
                </li>
              ))}
              <li className="pt-2 border-t border-slate-900">
                <button
                  onClick={() => handleNav('services')}
                  className="text-cyan-400 hover:text-cyan-300 transition text-xs font-medium"
                >
                  Compare All Specifications →
                </button>
              </li>
            </ul>
          </div>

          {/* Client Navigation */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Client Center
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleNav('custom-request')}
                  className="hover:text-cyan-400 transition text-cyan-300 font-semibold"
                >
                  Request a Custom Project
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('client-portal')}
                  className="hover:text-cyan-400 transition"
                >
                  Customer Project Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('order')}
                  className="hover:text-cyan-400 transition"
                >
                  Order a Website
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('track-order')}
                  className="hover:text-cyan-400 transition"
                >
                  Track Existing Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('payment-instructions')}
                  className="hover:text-cyan-400 transition"
                >
                  Manual Bank Instructions
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('portfolio')}
                  className="hover:text-cyan-400 transition"
                >
                  Portfolio & Showcases
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-cyan-400 transition"
                >
                  Our Development Process
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-cyan-400 transition"
                >
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Payment & Security Info */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Payment & Compliance
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              We operate exclusively through direct bank transfers and international wire services to ensure complete commercial transparency without third-party card processing markups.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Supported Rails</span>
              </div>
              <p className="text-slate-400">
                Askari Bank transfer, SWIFT/IBAN wire, Wise, Remitly, & Western Union.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => handleNav('admin')}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Staff & Finance Portal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {settings.businessName}. All rights reserved. International web development contracts.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => handleNav('contact')} className="hover:text-slate-300">
              Privacy & Data Policy
            </button>
            <span>•</span>
            <button onClick={() => handleNav('contact')} className="hover:text-slate-300">
              Contract Terms
            </button>
            <span>•</span>
            <button onClick={() => handleNav('admin')} className="hover:text-cyan-400">
              Admin Login
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
