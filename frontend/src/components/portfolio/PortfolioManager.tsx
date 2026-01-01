import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Portfolio } from '../../models/Portfolio';
import { ArtworkUploadModal } from '../modals/ArtworkUploadModal.tsx';
import { PortfolioGrid } from './PortfolioGrid.tsx';
import styles from './PortfolioManager.module.css';

export const PortfolioManager = () => {
  const { user } = useAuth();
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePortfolioClick = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
  };

  const handleCloseModal = () => {
    setSelectedPortfolio(null);
    setShowUploadModal(false);
  };

  const handlePortfolioUpdated = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseModal();
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Portfolio</h1>
        <button 
          onClick={() => setShowUploadModal(true)}
          className={styles.uploadButton}
        >
          + Upload
        </button>
      </div>
      
      <PortfolioGrid
        userId={user.id}
        refreshKey={refreshKey}
        onPortfolioClick={handlePortfolioClick}
      />

      {(showUploadModal || selectedPortfolio) && (
        <ArtworkUploadModal
          onClose={handleCloseModal}
          onUploadComplete={handlePortfolioUpdated}
          existingPortfolio={selectedPortfolio}
        />
      )}
    </div>
  );
};
