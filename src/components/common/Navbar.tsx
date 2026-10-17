import React, { useState } from 'react';
import { useAgency, NavigationPage } from '../../context/AgencyContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Globe,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  Smartphone,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentPage, setCurrentPage, settings, isAdminLoggedIn, setIsAndroidModalOpen } = useAgency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; page: NavigationPage }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Services & Pricing', page: 'services' },
    { label: 'Custom Projects', page: 'custom-request' },
    { label: 'Portfolio', page: 'portfolio' },
    { label: 'Client Portal', page: 'client-portal' },
    { label: 'About Us', page: 'about' },
    { label: 'Contact & FAQ', page: 'contact' },
    { label: 'Track Order', page: 'track-order' },
  ];

  const handleNav = (page: NavigationPage) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-[2px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Globe className="w-5 h-5 text-cyan-400 transition-transform group-hover:rotate-12" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
                {settings.businessName || 'GlobalWeb Studio'}
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              </span>
              <p className="text-[11px] font-medium tracking-wide uppercase text-slate-400">
                International Web Engineering
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.page;
              return (
                <button
                  key={link.page}
                  onClick={() => handleNav(link.page)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'text-cyan-400 bg-slate-900 border border-slate-800'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop CTA & App Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <PWAInstallButton onOpenAndroidHub={() => setIsAndroidModalOpen(true)} />

            {isAdminLoggedIn ? (
              <button
                onClick={() => handleNav('admin')}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Panel (Active)
              </button>
            ) : (
              <button
                onClick={() => handleNav('admin')}
                className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded transition"
                title="Finance & Staff Verification Portal"
              >
                Staff Portal
              </button>
            )}

            <button
              onClick={() => handleNav('order')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 hover:from-cyan-300 hover:to-indigo-200 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/35 transition active:scale-[0.98]"
            >
              <span>Get a Website</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => handleNav('order')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-950 bg-cyan-400"
            >
              Order
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNav(link.page)}
              className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium flex items-center justify-between ${
                currentPage === link.page
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                  : 'text-slate-300 hover:bg-slate-900/60'
              }`}
            >
              <span>{link.label}</span>
              {currentPage === link.page && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
            </button>
          ))}
          <div className="pt-4 border-t border-slate-900 space-y-2">
            <button
              onClick={() => {
                setIsAndroidModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 shadow-md"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Install Android App (APK / PWA)</span>
            </button>
            <button
              onClick={() => handleNav('order')}
              className="w-full py-3 rounded-xl text-center font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 shadow-lg"
            >
              Start Your Website Order
            </button>
            <button
              onClick={() => handleNav('admin')}
              className="w-full py-2.5 text-xs text-center text-slate-400 hover:text-slate-200"
            >
              {isAdminLoggedIn ? 'Return to Admin Dashboard' : 'Staff & Finance Verification Login'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
