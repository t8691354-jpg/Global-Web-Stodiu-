import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      const timer = setTimeout(() => setWasOffline(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !wasOffline) return null;

  return (
    <div
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-2xl transition-all duration-300 ${
        isOnline
          ? 'bg-emerald-500 text-slate-950 animate-bounce'
          : 'bg-amber-500 text-slate-950 animate-pulse'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-3.5 h-3.5" />
          <span>Back Online — Synced</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode — Cached data active</span>
        </>
      )}
    </div>
  );
};
