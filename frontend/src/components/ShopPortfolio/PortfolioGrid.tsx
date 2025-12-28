import { useEffect, useState } from 'react';
import { Portfolio } from '../../models/Portfolio';
import { getUserPortfolios } from '../../services/portfolioService';
import styles from './PortfolioGrid.module.css';

interface PortfolioGridProps {
  userId: string;
  refreshKey?: number;
  onPortfolioClick: (portfolio: Portfolio) => void;
}

export const PortfolioGrid = ({ userId, refreshKey, onPortfolioClick }: PortfolioGridProps) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolios();
  }, [userId, refreshKey]);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const data = await getUserPortfolios({ userId });
      setPortfolios(data.portfolios || []);
    } catch (error) {
      console.error('Failed to load portfolios:', error);
      setPortfolios([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading portfolios...</div>;
  }

  if (portfolios.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No portfolio pieces yet. Upload your first piece above!</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Your Portfolio ({portfolios.length})</h3>
      <div className={styles.grid}>
        {portfolios.map((portfolio) => {
          const firstMedia = portfolio.media?.[0];
          const thumbnailUrl = firstMedia?.thumbnailUrl || firstMedia?.fileUrl;

          return (
            <div
              key={portfolio.id}
              className={styles.card}
              onClick={() => onPortfolioClick(portfolio)}
            >
              <div className={styles.imageContainer}>
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt={portfolio.title} className={styles.image} />
                ) : (
                  <div className={styles.noImage}>No image</div>
                )}
                {portfolio.status === 'draft' && (
                  <div className={styles.draftBadge}>Draft</div>
                )}
                {portfolio.hasSensitiveContent && (
                  <div className={styles.sensitiveBadge}>Sensitive</div>
                )}
              </div>
              <div className={styles.info}>
                <h4 className={styles.portfolioTitle}>{portfolio.title}</h4>
                <div className={styles.meta}>
                  <span>{portfolio.media?.length || 0} items</span>
                  <span>{portfolio.viewCount} views</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
