import { useState } from 'react';
import { ShopSidebar } from '../components/portfolio/ShopSidebar';
import styles from './ShopDashboard.module.css';
import { PortfolioManager } from '../components/portfolio/PortfolioManager';

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
  const [activeSection, setActiveSection] = useState<SidebarSection>('portfolio');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'portfolio':
        return <PortfolioManager />;
      case 'wallet':
        return <div className={styles.placeholder}>Wallet Content</div>;
      case 'commissions':
        return <div className={styles.placeholder}>Commissions Content</div>;
      case 'services':
        return <div className={styles.placeholder}>Services Content</div>;
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
        onSectionChange={(section) => {
          setActiveSection(section);
          setSidebarOpen(false); // Close sidebar on mobile after selection
        }}
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
