import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Smartphone, Download, CheckCircle2, Sparkles, X, Layers, ExternalLink } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'hero' | 'banner' | 'mobile_drawer';
  className?: string;
  onOpenAndroidHub?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'navbar',
  className = '',
  onOpenAndroidHub,
}) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [isPrompting, setIsPrompting] = useState(false);

  // If already installed and opened as native standalone app, show small verified indicator or return null
  if (isInstalled) {
    if (variant === 'banner') return null;
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Android App Active</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      setIsPrompting(true);
      try {
        await install();
      } finally {
        setIsPrompting(false);
      }
    } else if (onOpenAndroidHub) {
      onOpenAndroidHub();
    }
  };

  if (variant === 'hero') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-slate-950 hover:from-emerald-300 hover:to-cyan-300 shadow-xl shadow-emerald-500/20 active:scale-95 transition ${className}`}
      >
        <Smartphone className="w-4 h-4 text-slate-950" />
        <span>Install Android App (APK / PWA)</span>
      </button>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/50 border-y border-emerald-500/30 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-200">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white">GlobalWeb Studio Android App Available:</span>{' '}
              <span className="text-slate-300">
                Install directly on your Android phone or tablet for instant access, offline mode & native full-screen.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleClick}
              className="px-4 py-1.5 rounded-xl font-bold text-xs bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isInstallable ? 'Install Now' : 'Android App Hub'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Navbar default
  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition ${className}`}
      title="Install GlobalWeb Studio as Android App"
    >
      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
      <span>Install Android App</span>
    </button>
  );
};
