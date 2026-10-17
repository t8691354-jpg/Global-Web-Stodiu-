import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useAgency } from '../../context/AgencyContext';
import {
  Smartphone,
  CheckCircle2,
  Download,
  X,
  Layers,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe2,
  Terminal,
  Code2,
} from 'lucide-react';

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const { showToast } = useAgency();
  const [activeTab, setActiveTab] = useState<'direct_install' | 'apk_guide' | 'features'>('direct_install');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
      onClose();
    }
  };

  const copyCapacitorCommands = () => {
    const cmds = `npm install @capacitor/core @capacitor/android
npx cap init "GlobalWeb Studio" com.globalwebstudio.app --web-dir dist
npm run build
npx cap add android
npx cap open android`;
    navigator.clipboard.writeText(cmds);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider mb-1">
              Android Application Hub
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              GlobalWeb Studio Android App
            </h3>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('direct_install')}
            className={`py-2 px-3 rounded-lg font-semibold transition ${
              activeTab === 'direct_install'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1-Tap Install (PWA)
          </button>
          <button
            onClick={() => setActiveTab('apk_guide')}
            className={`py-2 px-3 rounded-lg font-semibold transition ${
              activeTab === 'apk_guide'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            APK / Play Store Build
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`py-2 px-3 rounded-lg font-semibold transition ${
              activeTab === 'features'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Native Features
          </button>
        </div>

        {/* TAB 1: 1-Tap Direct Install */}
        {activeTab === 'direct_install' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Zero-Download Android Installation (WebAPK)
              </h4>
              <p className="text-slate-400 leading-relaxed">
                You can install this app directly onto any Android phone or tablet without needing Google Play Store downloads. Android generates a native <strong className="text-white">WebAPK</strong> with an icon on your home screen and in your app drawer.
              </p>
            </div>

            {/* Urdu / Roman Urdu Instructions */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Smartphone className="w-4 h-4" />
                <span>Android Phone Guide (Urdu / Roman Urdu):</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Yeh complete Android App hai! Apne Android mobile par chalane ke liye:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                <li>Apne Android phone mein Google Chrome ya Samsung Internet kholain.</li>
                <li>Upar 3 dots (⋮) par tap karein aur <strong className="text-emerald-400">"Install app"</strong> ya <strong className="text-emerald-400">"Add to Home screen"</strong> dabayein.</li>
                <li>App aapke phone ke desktop/menu par real Android app ki tarah aa jayegi aur offline bhi chalegi.</li>
                <li>Play Store ke liye APK compile karni ho toh ooper <strong>APK / Play Store Build</strong> tab dekhein.</li>
              </ul>
            </div>

            {/* QR Code and Quick Install Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.href : 'https://globalwebstudio.app'
                  )}&color=34d399&bgcolor=0f172a`}
                  alt="Scan to open on Android"
                  className="w-32 h-32 rounded-lg shadow-md mb-2"
                />
                <span className="text-[10px] text-slate-400">Scan with Android Camera</span>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-white text-xs">Open on your Android device:</h5>
                <p className="text-[11px] text-slate-400">
                  Scan the QR code with your phone or copy the direct URL to open and install instantly:
                </p>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('Link copied to clipboard! Open it in Chrome on your Android phone.', 'success');
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copy App Link</span>
                </button>

                {isInstallable && (
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install On This Device Now</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-400 text-[11px]">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Runs in full-screen standalone mode without URL bar.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Works offline via service worker caching.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APK / Google Play Store Build Guide */}
        {activeTab === 'apk_guide' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Compile Standalone Native Android APK (.apk / .aab)
              </h4>
              <p className="text-slate-400 leading-relaxed">
                This project is pre-configured with <strong className="text-white">Capacitor configuration (`capacitor.config.json`)</strong>. You can compile a signed Android `.apk` or `.aab` package for Google Play Store distribution using standard Android Studio tools.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                <span>Terminal Commands:</span>
                <button
                  onClick={copyCapacitorCommands}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode ? 'Copied!' : 'Copy Commands'}</span>
                </button>
              </div>
              <pre className="text-[11px] text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed p-1">
{`# 1. Install Capacitor Android runtime
npm install @capacitor/core @capacitor/android

# 2. Build production assets
npm run build

# 3. Add Android platform & open in Android Studio
npx cap add android
npx cap open android`}
              </pre>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1 text-slate-400">
              <p className="font-semibold text-slate-200">What Android Studio does:</p>
              <p>In Android Studio, click <strong className="text-white">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> to generate the installable `.apk` file ready to install on any Android phone.</p>
            </div>
          </div>
        )}

        {/* TAB 3: Native Features */}
        {activeTab === 'features' && (
          <div className="space-y-3 text-xs text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Smartphone className="w-4 h-4" />
                  <span>Standalone Native Display</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Hides browser tabs, toolbars, and URL inputs. Renders with full viewport presence like native Kotlin/Java apps.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Zap className="w-4 h-4" />
                  <span>Offline Service Worker</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Pre-caches all code bundles, icons, and styling for lightning-fast loads even with poor or zero connectivity.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-indigo-400 font-bold">
                  <Layers className="w-4 h-4" />
                  <span>Mobile Bottom Navigation Bar</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Engineered with an ergonomic bottom navigation bar tailored for single-thumb mobile operation.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure Local & Private Storage</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Client tokens and private verification receipts remain secure on device with cryptographic validation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[10px]">
            Package: com.globalwebstudio.app • v1.0.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-white"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
