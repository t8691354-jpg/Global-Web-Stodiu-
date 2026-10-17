import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WebsitePackage,
  PortfolioItem,
  PaymentMethodConfig,
  AgencySettings,
  Order,
  PackageId,
} from '../types';
import { api, PublicConfigResponse } from '../services/api';
import {
  initialAgencySettings,
  initialPackages,
  initialPortfolioItems,
  initialPaymentMethods,
} from '../data/initialData';

export type NavigationPage =
  | 'home'
  | 'services'
  | 'catalog'
  | 'portfolio'
  | 'about'
  | 'contact'
  | 'order'
  | 'payment-instructions'
  | 'track-order'
  | 'custom-request'
  | 'client-portal'
  | 'quotation-view'
  | 'admin';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AgencyContextType {
  currentPage: NavigationPage;
  setCurrentPage: (page: NavigationPage) => void;
  selectedPackageId: PackageId | null;
  selectPackageAndOrder: (pkgId: PackageId) => void;
  currentOrder: Order | null;
  currentOrderToken: string | null;
  setConfirmedOrder: (order: Order, token: string) => void;
  activeOrderLookupRef: string;
  setActiveOrderLookupRef: (ref: string) => void;

  // Custom project & Quotation state
  activeRequestId: string;
  setActiveRequestId: (id: string) => void;
  activeQuotationId: string;
  setActiveQuotationId: (id: string) => void;
  prefilledCustomProject: any;
  setPrefilledCustomProject: (data: any) => void;
  navigateToCustomRequest: (prefillData?: any) => void;
  navigateToQuotation: (quotationId: string, token?: string) => void;
  navigateToClientPortal: (requestId?: string, token?: string) => void;

  settings: AgencySettings;
  packages: WebsitePackage[];
  portfolio: PortfolioItem[];
  paymentMethods: PaymentMethodConfig[];
  cashbackPromo: PublicConfigResponse['cashbackPromo'] | null;
  refreshConfig: () => Promise<void>;

  adminUser: any | null;
  isAdminLoggedIn: boolean;
  setAdminLoggedInUser: (user: any | null) => void;
  adminLogout: () => Promise<void>;

  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  isAndroidModalOpen: boolean;
  setIsAndroidModalOpen: (open: boolean) => void;
}

const AgencyContext = createContext<AgencyContextType | undefined>(undefined);

export const AgencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [selectedPackageId, setSelectedPackageId] = useState<PackageId | null>('business');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [currentOrderToken, setCurrentOrderToken] = useState<string | null>(null);
  const [activeOrderLookupRef, setActiveOrderLookupRef] = useState<string>('');

  const [settings, setSettings] = useState<AgencySettings>(initialAgencySettings);
  const [packages, setPackages] = useState<WebsitePackage[]>(initialPackages);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(initialPortfolioItems);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(initialPaymentMethods);
  const [cashbackPromo, setCashbackPromo] = useState<PublicConfigResponse['cashbackPromo'] | null>(null);

  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshConfig = async () => {
    try {
      const config = await api.getConfig();
      if (config.settings) setSettings(config.settings);
      if (config.packages && config.packages.length > 0) setPackages(config.packages);
      if (config.paymentMethods) setPaymentMethods(config.paymentMethods);
      if (config.cashbackPromo) setCashbackPromo(config.cashbackPromo);
    } catch {
      // Fallback gracefully to default data
    }

    try {
      const portfolioData = await api.getPortfolio();
      if (portfolioData && portfolioData.length > 0) setPortfolio(portfolioData);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    refreshConfig();
    api.checkAdminAuth().then((user) => {
      if (user) setAdminUser(user);
    });

    // Handle browser hash navigation if present
    const hash = window.location.hash.replace('#', '');
    if (['home', 'services', 'portfolio', 'about', 'contact', 'order', 'payment-instructions', 'track-order', 'admin'].includes(hash)) {
      setCurrentPage(hash as NavigationPage);
    }
  }, []);

  const [activeRequestId, setActiveRequestId] = useState<string>('');
  const [activeQuotationId, setActiveQuotationId] = useState<string>('');
  const [prefilledCustomProject, setPrefilledCustomProject] = useState<any>(null);

  const selectPackageAndOrder = (pkgId: PackageId) => {
    setSelectedPackageId(pkgId);
    setCurrentPage('order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCustomRequest = (prefillData?: any) => {
    if (prefillData) setPrefilledCustomProject(prefillData);
    setCurrentPage('custom-request');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToQuotation = (quotationId: string, token?: string) => {
    setActiveQuotationId(quotationId);
    if (token) setCurrentOrderToken(token);
    setCurrentPage('quotation-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToClientPortal = (requestId?: string, token?: string) => {
    if (requestId) setActiveRequestId(requestId);
    if (token) setCurrentOrderToken(token);
    setCurrentPage('client-portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setConfirmedOrder = (order: Order, token: string) => {
    setCurrentOrder(order);
    setCurrentOrderToken(token);
    setActiveOrderLookupRef(order.orderRef);
    setCurrentPage('payment-instructions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = async () => {
    await api.adminLogout();
    setAdminUser(null);
    showToast('Logged out from admin panel.', 'info');
    setCurrentPage('home');
  };

  return (
    <AgencyContext.Provider
      value={{
        currentPage,
        setCurrentPage: (page) => {
          setCurrentPage(page);
          window.location.hash = page;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        selectedPackageId,
        selectPackageAndOrder,
        currentOrder,
        currentOrderToken,
        setConfirmedOrder,
        activeOrderLookupRef,
        setActiveOrderLookupRef,
        activeRequestId,
        setActiveRequestId,
        activeQuotationId,
        setActiveQuotationId,
        prefilledCustomProject,
        setPrefilledCustomProject,
        navigateToCustomRequest,
        navigateToQuotation,
        navigateToClientPortal,
        settings,
        packages,
        portfolio,
        paymentMethods,
        cashbackPromo,
        refreshConfig,
        adminUser,
        isAdminLoggedIn: !!adminUser,
        setAdminLoggedInUser: setAdminUser,
        adminLogout: handleAdminLogout,
        toasts,
        showToast,
        dismissToast,
        isAndroidModalOpen,
        setIsAndroidModalOpen,
      }}
    >
      {children}
    </AgencyContext.Provider>
  );
};

export const useAgency = () => {
  const context = useContext(AgencyContext);
  if (!context) {
    throw new Error('useAgency must be used within an AgencyProvider');
  }
  return context;
};
