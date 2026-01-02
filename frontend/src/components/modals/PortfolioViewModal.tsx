// frontend/src/components/modals/PortfolioViewModal.tsx
import { Portfolio } from '../../models/Portfolio';
import { YouTubeEmbed } from '../common/YouTubeEmbed';
import { SensitiveMediaOverlay } from '../common/SensitiveMediaOverlay';
import { useMediaCarousel } from '../../hooks/useMediaCarousel';
import styles from './PortfolioViewModal.module.css';

interface PortfolioViewModalProps {
  portfolio: Portfolio;
  onClose: () => void;
}

export const PortfolioViewModal = ({ portfolio, onClose }: PortfolioViewModalProps) => {
  const media = portfolio.media || [];
  const {
    selectedMediaIndex,
    currentMedia,
    goToPrevious,
    goToNext,
    selectMedia,
    handleKeyDown,
  } = useMediaCarousel(media);

  return (
    <div className={styles.overlay} onClick={onClose} onKeyDown={(e) => handleKeyDown(e, onClose)} tabIndex={0}>
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
              <>
                <YouTubeEmbed
                  url={currentMedia.youtubeUrl}
                  alt={portfolio.title}
                  className={styles.mediaContent}
                />
                {/* Show overlay if media is sensitive */}
                {currentMedia.hasSensitiveContent && currentMedia.sensitiveContentTypes && currentMedia.sensitiveContentTypes.length > 0 && (
                  <SensitiveMediaOverlay sensitiveContentTypes={currentMedia.sensitiveContentTypes} />
                )}
              </>
            ) : currentMedia?.fileUrl ? (
              <>
                <img
                  src={currentMedia.fileUrl}
                  alt={portfolio.title}
                  className={styles.mediaContent}
                />
                {/* Show overlay if media is sensitive */}
                {currentMedia.hasSensitiveContent && currentMedia.sensitiveContentTypes && currentMedia.sensitiveContentTypes.length > 0 && (
                  <SensitiveMediaOverlay sensitiveContentTypes={currentMedia.sensitiveContentTypes} />
                )}
              </>
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

        {/* Media Counter */}
        {media.length > 1 && (
          <div className={styles.mediaCounter}>
            {selectedMediaIndex + 1} / {media.length}
          </div>
        )}

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
                  onClick={() => selectMedia(index)}
                >
                  {item.mediaType === 'youtube' ? (
                    item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={`Media ${index + 1}`} />
                    ) : (
                      <div className={styles.noThumbnail}>▶</div>
                    )
                  ) : item.fileUrl ? (
                    <img src={item.fileUrl} alt={`Media ${index + 1}`} />
                  ) : (
                    <div className={styles.noThumbnail}>?</div>
                  )}
                  {/* Show mosaic overlay if thumbnail media is sensitive */}
                  {item.hasSensitiveContent && item.sensitiveContentTypes && item.sensitiveContentTypes.length > 0 && (
                    <SensitiveMediaOverlay 
                        sensitiveContentTypes={item.sensitiveContentTypes} 
                        showRevealButton={false} 
                        compact={true}

                    />
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
