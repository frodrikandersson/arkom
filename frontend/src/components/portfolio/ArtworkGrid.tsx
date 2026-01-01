import { useState } from 'react';
import { useArtworkGrid } from '../../hooks/usePortfolios';
import { Portfolio } from '../../models/Portfolio';
import { YouTubeEmbed } from '../common/YouTubeEmbed';
import { PortfolioViewModal } from '../modals/PortfolioViewModal';
import styles from './ArtworkGrid.module.css';

interface ArtworkGridProps {
  userId: string;
  isOwnProfile?: boolean;
  onArtworkClick?: (portfolio: Portfolio) => void;
}

export const ArtworkGrid = ({ userId, isOwnProfile = false, onArtworkClick }: ArtworkGridProps) => {
  const { artworks, loading } = useArtworkGrid(userId, isOwnProfile);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

  const handleCardClick = (portfolio: Portfolio) => {
    if (isOwnProfile && onArtworkClick) {
      onArtworkClick(portfolio);
    } else {
      setSelectedPortfolio(portfolio);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading portfolio...</div>
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          {isOwnProfile 
            ? 'No portfolio pieces yet. Upload your first piece!' 
            : 'No published portfolio to display.'}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {artworks.map((portfolio) => {
          const firstMedia = portfolio.media?.[0];
          const thumbnailUrl = firstMedia?.thumbnailUrl || firstMedia?.fileUrl;
          const isYouTube = firstMedia?.mediaType === 'youtube' && firstMedia?.youtubeUrl;

          return (
            <div
              key={portfolio.id}
              className={styles.artworkCard}
              onClick={() => handleCardClick(portfolio)}
            >
              <div className={styles.imageContainer}>
                {isYouTube ? (
                  <YouTubeEmbed
                    url={firstMedia.youtubeUrl as string}
                    alt={portfolio.title}
                    className={styles.image}
                  />
                ) : thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={portfolio.title}
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.noImage}>No image</div>
                )}
                {portfolio.status === 'draft' && isOwnProfile && (
                  <div className={styles.privateBadge}>Draft</div>
                )}
                {portfolio.hasSensitiveContent && (
                  <div className={styles.sensitiveBadge}>Sensitive</div>
                )}
              </div>
              <div className={styles.info}>
                <h3 className={styles.title}>{portfolio.title}</h3>
                {portfolio.description && (
                  <p className={styles.description}>{portfolio.description}</p>
                )}
                <div className={styles.meta}>
                  <span className={styles.type}>
                    {portfolio.media?.length || 0} {portfolio.media?.length === 1 ? 'item' : 'items'}
                  </span>
                  <span className={styles.views}>{portfolio.viewCount} views</span>
                </div>
                {portfolio.tags && portfolio.tags.length > 0 && (
                  <div className={styles.tags}>
                    {portfolio.tags.map((tag, index) => (
                      <span key={index} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedPortfolio && (
        <PortfolioViewModal
          portfolio={selectedPortfolio}
          onClose={() => setSelectedPortfolio(null)}
        />
      )}
    </div>
  );
};
