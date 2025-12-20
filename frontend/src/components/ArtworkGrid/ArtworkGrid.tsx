import { useArtworkGrid } from '../../hooks/useArtworkGrid';
import { Artwork } from '../../models';
import styles from './ArtworkGrid.module.css';

interface ArtworkGridProps {
  userId: string;
  isOwnProfile?: boolean;
  onArtworkClick?: (artwork: Artwork) => void;
}

export const ArtworkGrid = ({ userId, isOwnProfile = false, onArtworkClick }: ArtworkGridProps) => {
  const { artworks, loading } = useArtworkGrid(userId, isOwnProfile);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading artworks...</div>
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          {isOwnProfile 
            ? 'No artworks yet. Upload your first piece!' 
            : 'No public artworks to display.'}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {artworks.map((artwork) => (
          <div
            key={artwork.id}
            className={styles.artworkCard}
            onClick={() => onArtworkClick?.(artwork)}
          >
            <div className={styles.imageContainer}>
              <img
                src={artwork.thumbnailUrl || artwork.fileUrl}
                alt={artwork.title}
                className={styles.image}
              />
              {!artwork.isPublic && isOwnProfile && (
                <div className={styles.privateBadge}>Private</div>
              )}
            </div>
            <div className={styles.info}>
              <h3 className={styles.title}>{artwork.title}</h3>
              {artwork.description && (
                <p className={styles.description}>{artwork.description}</p>
              )}
              <div className={styles.meta}>
                <span className={styles.type}>{artwork.fileType.toUpperCase()}</span>
                <span className={styles.views}>{artwork.viewCount} views</span>
              </div>
              {artwork.tags && artwork.tags.length > 0 && (
                <div className={styles.tags}>
                  {artwork.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
