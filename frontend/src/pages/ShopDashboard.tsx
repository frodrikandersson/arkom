import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShopSidebar } from '../components/portfolio/ShopSidebar';
import styles from './ShopDashboard.module.css';
import { PortfolioManager } from '../components/portfolio/PortfolioManager';
import { ServiceManager } from '../components/service/ServiceManager';

type SidebarSection = 
  | 'portfolio'
  | 'wallet'
  | 'commissions'
  | 'services'
  | 'workflows'
  | 'forms'
  | 'policies'
  | 'orders'
  | 'products'
  | 'bundles';

export const ShopDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionFromUrl = searchParams.get('section') as SidebarSection | null;
  
  const [activeSection, setActiveSection] = useState<SidebarSection>(
    sectionFromUrl && isValidSection(sectionFromUrl) ? sectionFromUrl : 'portfolio'
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Validate section is a valid type
  function isValidSection(section: string): section is SidebarSection {
    return ['portfolio', 'wallet', 'commissions', 'services', 'workflows', 'forms', 'policies', 'orders', 'products', 'bundles'].includes(section);
  }

  // Update URL when section changes
  useEffect(() => {
    setSearchParams({ section: activeSection }, { replace: true });
  }, [activeSection, setSearchParams]);

  const handleSectionChange = (section: SidebarSection) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'portfolio':
        return <PortfolioManager />;
      case 'wallet':
        return <div className={styles.placeholder}>Wallet Content</div>;
      case 'commissions':
        return <div className={styles.placeholder}>Commissions Content</div>;
      case 'services':
        return <ServiceManager />;
      case 'workflows':
        return <div className={styles.placeholder}>Workflows Content</div>;
      case 'forms':
        return <div className={styles.placeholder}>Forms Content</div>;
      case 'policies':
        return <div className={styles.placeholder}>Policies Content</div>;
      case 'orders':
        return <div className={styles.placeholder}>Orders Content</div>;
      case 'products':
        return <div className={styles.placeholder}>Products Content</div>;
      case 'bundles':
        return <div className={styles.placeholder}>Bundles Content</div>;
      default:
        return <div className={styles.placeholder}>Select a section</div>;
    }
  };

  return (
    <div className={styles.shopDashboard}>
      {/* Mobile menu button */}
      <button
        className={styles.mobileMenuBtn}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Sidebar */}
      <ShopSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className={styles.overlay} 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
};
