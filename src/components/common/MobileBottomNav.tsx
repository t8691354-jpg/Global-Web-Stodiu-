import React from 'react';
import { useAgency, NavigationPage } from '../../context/AgencyContext';
import {
  Home,
  Layers,
  Sparkles,
  UserCheck,
  Smartphone,
  ShieldCheck,
  Search,
  CreditCard,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenAndroidHub: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenAndroidHub }) => {
  const { currentPage, setCurrentPage, isAdminLoggedIn } = useAgency();

  const navItems = [
    { page: 'home' as NavigationPage, label: 'Home', icon: Home },
    { page: 'services' as NavigationPage, label: 'Packages', icon: CreditCard },
    { page: 'custom-request' as NavigationPage, label: 'Custom', icon: Sparkles },
    { page: 'client-portal' as NavigationPage, label: 'Portal', icon: UserCheck },
    {
      page: (isAdminLoggedIn ? 'admin' : 'android') as any,
      label: isAdminLoggedIn ? 'Admin' : 'Android App',
      icon: isAdminLoggedIn ? ShieldCheck : Smartphone,
      isSpecial: true,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 pb-safe">
      <div className="grid grid-cols-5 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;

          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.isSpecial && !isAdminLoggedIn) {
                  onOpenAndroidHub();
                } else {
                  setCurrentPage(item.page as NavigationPage);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : item.isSpecial && !isAdminLoggedIn
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive
                    ? 'bg-cyan-500/15 scale-110'
                    : item.isSpecial && !isAdminLoggedIn
                    ? 'bg-emerald-500/15 animate-pulse'
                    : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 line-clamp-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
