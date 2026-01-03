import { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import { CatalogueManager } from '../components/admin/CatalogueManager';
import { CategoryManager } from '../components/admin/CategoryManager';
import { SubCategoryFilterManager } from '../components/admin/SubCategoryFilterManager';
import { UserManager } from '../components/admin/UserManager';
import styles from './AdminDashboard.module.css';

type AdminTab = 'catalogues' | 'categories' | 'subcategories' | 'users' | 'reports';

export const AdminDashboard = () => {
  const { isAdmin, loading } = useAdmin();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as AdminTab | null;
  
  const [activeTab, setActiveTab] = useState<AdminTab>(
    tabFromUrl && ['catalogues', 'categories', 'subcategories', 'users', 'reports'].includes(tabFromUrl) 
      ? tabFromUrl 
      : 'catalogues'
  );

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'catalogues' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('catalogues')}
        >
          Catalogues
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'categories' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('categories')}
        >
          Categories
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'subcategories' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('subcategories')}
        >
          SubCategory Filters
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('users')}
        >
          Users
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'reports' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('reports')}
        >
          Reports
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'catalogues' && <CatalogueManager />}
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'subcategories' && <SubCategoryFilterManager />}
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'reports' && <div className={styles.placeholder}>Reports management coming soon...</div>}
      </div>
    </div>
  );
};
