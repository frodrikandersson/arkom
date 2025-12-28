import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Portfolio } from '../../models/Portfolio';
import { ArtworkUpload } from './ArtworkUpload';
import { PortfolioGrid } from './PortfolioGrid.tsx';
import { PortfolioEditModal } from './PortfolioEditModal.tsx';
import styles from './PortfolioManager.module.css';

export const PortfolioManager = () => {
  const { user } = useAuth();
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePortfolioClick = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
  };

  const handleCloseModal = () => {
    setSelectedPortfolio(null);
  };

  const handlePortfolioUpdated = () => {
    setRefreshKey(prev => prev + 1); // Force refresh
    setSelectedPortfolio(null);
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <ArtworkUpload onUploadComplete={() => setRefreshKey(prev => prev + 1)} />
      
      <div className={styles.divider} />
      
      <PortfolioGrid
        userId={user.id}
        refreshKey={refreshKey}
        onPortfolioClick={handlePortfolioClick}
      />

      {selectedPortfolio && (
        <PortfolioEditModal
          portfolio={selectedPortfolio}
          onClose={handleCloseModal}
          onDelete={handlePortfolioUpdated}
        />
      )}
    </div>
  );
};
