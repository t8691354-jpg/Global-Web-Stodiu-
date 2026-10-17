import React from 'react';
import { AgencyProvider, useAgency } from './context/AgencyContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { HomePage } from './components/home/HomePage';
import { ServicesPricingPage } from './components/services/ServicesPricingPage';
import { PortfolioPage } from './components/portfolio/PortfolioPage';
import { AboutPage } from './components/about/AboutPage';
import { ContactPage } from './components/contact/ContactPage';
import { OrderFormPage } from './components/order/OrderFormPage';
import { PaymentInstructionsPage } from './components/payment/PaymentInstructionsPage';
import { TrackOrderPage } from './components/order/TrackOrderPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CustomProjectRequestPage } from './components/custom/CustomProjectRequestPage';
import { ClientPortalPage } from './components/custom/ClientPortalPage';
import { QuotationViewPage } from './components/custom/QuotationViewPage';
import { PricingCatalogPage } from './components/catalog/PricingCatalogPage';
import { AndroidAppModal } from './components/common/AndroidAppModal';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { PWAInstallButton } from './components/common/PWAInstallButton';
import { OfflineIndicator } from './components/common/OfflineIndicator';

const MainContent: React.FC = () => {
  const { currentPage, isAndroidModalOpen, setIsAndroidModalOpen } = useAgency();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-['Plus_Jakarta_Sans'] pb-16 md:pb-0">
      <OfflineIndicator />
      {/* Android PWA Install Top Notification Bar */}
      <PWAInstallButton variant="banner" onOpenAndroidHub={() => setIsAndroidModalOpen(true)} />

      <Navbar />

      <main className="flex-1">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'services' && <ServicesPricingPage />}
        {currentPage === 'catalog' && <PricingCatalogPage />}
        {currentPage === 'portfolio' && <PortfolioPage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'order' && <OrderFormPage />}
        {currentPage === 'payment-instructions' && <PaymentInstructionsPage />}
        {currentPage === 'track-order' && <TrackOrderPage />}
        {currentPage === 'custom-request' && <CustomProjectRequestPage />}
        {currentPage === 'client-portal' && <ClientPortalPage />}
        {currentPage === 'quotation-view' && <QuotationViewPage />}
        {currentPage === 'admin' && <AdminDashboard />}
      </main>

      {/* Show footer on all pages except inside the specialized admin dashboard */}
      {currentPage !== 'admin' && <Footer />}

      {/* Android Mobile Ergonomic Bottom Navigation Bar */}
      {currentPage !== 'admin' && (
        <MobileBottomNav onOpenAndroidHub={() => setIsAndroidModalOpen(true)} />
      )}

      {/* Android Application Hub Modal */}
      <AndroidAppModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AgencyProvider>
      <MainContent />
    </AgencyProvider>
  );
}
