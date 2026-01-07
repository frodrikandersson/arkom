import { Portfolio } from '../../models/Portfolio';
import { YouTubeEmbed } from '../common/YouTubeEmbed';
import { SensitiveMediaOverlay } from '../common/SensitiveMediaOverlay';
import { useMediaCarousel } from '../../hooks/useMediaCarousel';
import styles from './PortfolioViewModal.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServiceById } from '../../services/serviceService';
import { Service } from '../../models';

interface PortfolioViewModalProps {
  portfolio: Portfolio;
  onClose: () => void;
}

export const PortfolioViewModal = ({ portfolio, onClose }: PortfolioViewModalProps) => {
  const navigate = useNavigate();
  const media = portfolio.media || [];
  const [linkedService, setLinkedService] = useState<Service | null>(null);

  const {
    selectedMediaIndex,
    currentMedia,
    goToPrevious,
    goToNext,
    selectMedia,
    handleKeyDown,
  } = useMediaCarousel(media);

  // Load linked service if exists
  useEffect(() => {
    const loadService = async () => {
      if (portfolio.linkedToCommission && portfolio.commissionServiceId) {
        try {
          const { service } = await getServiceById(portfolio.commissionServiceId);
          setLinkedService(service);
        } catch (error) {
          console.error('Failed to load linked service:', error);
        }
      }
    };
    loadService();
  }, [portfolio.linkedToCommission, portfolio.commissionServiceId]);

  const handleServiceClick = () => {
    if (linkedService) {
      // Close the portfolio modal first
      onClose();
      // Navigate to the user's profile with services tab and service ID
      navigate(`/profile/${linkedService.userId}?tab=services&serviceId=${linkedService.id}`);
    }
  };

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
        <div className={styles.infoSection}>
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
          {/* Service Link Button */}
          <div className={styles.serviceButtonSection}>
            {linkedService && (
              <button className={styles.serviceButton} onClick={handleServiceClick}>
                <svg className={styles.serviceIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <span className={styles.serviceButtonText}>
                  Request this Service
                </span>
                <span className={styles.servicePrice}>
                  From €{((linkedService.requestingProcess === 'custom_proposal' ? linkedService.basePrice : linkedService.fixedPrice) / 100).toFixed(2)}
                </span>
              </button>
            )}
          </div>
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
