import styles from './ShopSidebar.module.css';

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

interface ShopSidebarProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ShopSidebar = ({ 
  activeSection, 
  onSectionChange, 
  isOpen,
  onClose 
}: ShopSidebarProps) => {
  const handleItemClick = (section: SidebarSection) => {
    onSectionChange(section);
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.sidebarHeader}>
        <button 
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close menu"
        >
          ×
        </button>
      </div>

      <nav className={styles.nav}>
        <button
          className={`${styles.navItem} ${activeSection === 'portfolio' ? styles.active : ''}`}
          onClick={() => handleItemClick('portfolio')}
        >
          Portfolio
        </button>

        <button
          className={`${styles.navItem} ${activeSection === 'wallet' ? styles.active : ''}`}
          onClick={() => handleItemClick('wallet')}
        >
          Wallet
        </button>

        <div className={styles.divider} />

        <button
          className={`${styles.navItem} ${activeSection === 'commissions' ? styles.active : ''}`}
          onClick={() => handleItemClick('commissions')}
        >
          Commissions
        </button>

        <button
          className={`${styles.navItem} ${activeSection === 'services' ? styles.active : ''}`}
          onClick={() => handleItemClick('services')}
        >
          Services
        </button>

        <button
          className={`${styles.navItem} ${activeSection === 'workflows' ? styles.active : ''}`}
          onClick={() => handleItemClick('workflows')}
        >
          Workflows
        </button>

        <button
          className={`${styles.navItem} ${activeSection === 'forms' ? styles.active : ''}`}
          onClick={() => handleItemClick('forms')}
        >
          Forms
        </button>

        <button
          className={`${styles.navItem} ${activeSection === 'policies' ? styles.active : ''}`}
          onClick={() => handleItemClick('policies')}
        >
          Policies
        </button>

        <div className={styles.divider} />

        <button
          className={`${styles.navItem} ${activeSection === 'orders' ? styles.active : ''}`}
          onClick={() => handleItemClick('orders')}
        >
          Orders
        </button>

        <button
          className={`${styles.navItem} ${activeSection === 'products' ? styles.active : ''}`}
          onClick={() => handleItemClick('products')}
        >
          Products
        </button>

        <button
          className={`${styles.navItem} ${activeSection === 'bundles' ? styles.active : ''}`}
          onClick={() => handleItemClick('bundles')}
        >
          Bundles
        </button>
      </nav>
    </aside>
  );
};
