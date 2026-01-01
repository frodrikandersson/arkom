import { useState } from 'react';
import { Portfolio } from '../../models/Portfolio';
import { YouTubeEmbed } from '../common/YouTubeEmbed';
import styles from './PortfolioViewModal.module.css';

interface PortfolioViewModalProps {
  portfolio: Portfolio;
  onClose: () => void;
}

export const PortfolioViewModal = ({ portfolio, onClose }: PortfolioViewModalProps) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const media = portfolio.media || [];
  const currentMedia = media[selectedMediaIndex];

  const goToPrevious = () => {
    setSelectedMediaIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const goToNext = () => {
    setSelectedMediaIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        {/* Main Media Display */}
        <div className={styles.mainMediaContainer}>
          {media.length > 1 && (
            <button className={styles.navArrowLeft} onClick={goToPrevious}>
              ‹
            </button>
          )}

          <div className={styles.mainMedia}>
            {currentMedia?.mediaType === 'youtube' && currentMedia?.youtubeUrl ? (
              <YouTubeEmbed
                url={currentMedia.youtubeUrl}
                alt={portfolio.title}
                className={styles.mediaContent}
              />
            ) : currentMedia?.fileUrl ? (
              <img
                src={currentMedia.fileUrl}
                alt={portfolio.title}
                className={styles.mediaContent}
              />
            ) : (
              <div className={styles.noMedia}>No media available</div>
            )}
          </div>

          {media.length > 1 && (
            <button className={styles.navArrowRight} onClick={goToNext}>
              ›
            </button>
          )}
        </div>

        {/* Portfolio Info */}
        <div className={styles.info}>
          <h2 className={styles.title}>{portfolio.title}</h2>
          {portfolio.description && (
            <p className={styles.description}>{portfolio.description}</p>
          )}
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

        {/* Thumbnail Strip */}
        {media.length > 1 && (
          <div className={styles.thumbnailSection}>
            <button
              className={styles.thumbnailArrowLeft}
              onClick={goToPrevious}
              disabled={selectedMediaIndex === 0}
            >
              ‹
            </button>

            <div className={styles.thumbnailStrip}>
              {media.map((item, index) => (
                <div
                  key={item.id}
                  className={`${styles.thumbnail} ${
                    index === selectedMediaIndex ? styles.thumbnailActive : ''
                  }`}
                  onClick={() => setSelectedMediaIndex(index)}
                >
                  {item.mediaType === 'youtube' && item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={`Media ${index + 1}`} />
                  ) : item.fileUrl ? (
                    <img src={item.fileUrl} alt={`Media ${index + 1}`} />
                  ) : (
                    <div className={styles.noThumbnail}>?</div>
                  )}
                  {item.mediaType === 'youtube' && (
                    <div className={styles.youtubeIndicator}>▶</div>
                  )}
                </div>
              ))}
            </div>

            <button
              className={styles.thumbnailArrowRight}
              onClick={goToNext}
              disabled={selectedMediaIndex === media.length - 1}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
