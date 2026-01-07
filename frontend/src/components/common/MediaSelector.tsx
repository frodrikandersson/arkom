import { useState } from 'react';
import { PortfolioMediaUpload, SensitiveContentType } from '../../models/Portfolio';
import { FILE_RULES } from '../../../../backend/src/config/fileConstraints';
import { YouTubeModal } from '../modals/YouTubeModal';
import { YouTubeEmbed } from './YouTubeEmbed';
import styles from './MediaSelector.module.css';

interface MediaSelectorProps {
  mediaItems: PortfolioMediaUpload[];
  onMediaAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onYouTubeAdd: (url: string) => void;
  onMediaRemove: (id: string) => void;
  onToggleSensitiveContent?: (mediaId: string) => void;
  onToggleSensitiveType?: (mediaId: string, type: SensitiveContentType) => void;
  onDragStart?: (index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: () => void;
  onFileDrop?: (e: React.DragEvent) => void;
  onDragOverDrop?: (e: React.DragEvent) => void;
  maxItems?: number;
  showSensitiveControls?: boolean;
  description?: string;
}

export const MediaSelector = ({
  mediaItems,
  onMediaAdd,
  onYouTubeAdd,
  onMediaRemove,
  onToggleSensitiveContent,
  onToggleSensitiveType,
  onDragStart,
  onDragOver,
  onDragEnd,
  onFileDrop,
  onDragOverDrop,
  maxItems,
  showSensitiveControls = false,
  description,
}: MediaSelectorProps) => {
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);

  const handleYouTubeSave = (url: string) => {
    onYouTubeAdd(url);
    setShowYouTubeModal(false);
  };

  const isMaxReached = maxItems !== undefined && mediaItems.length >= maxItems;

  return (
    <div className={styles.container}>
      {description && (
        <p className={styles.description}>{description}</p>
      )}

      <div
        className={styles.mediaBox}
        onDrop={onFileDrop}
        onDragOver={onDragOverDrop}
      >
        {mediaItems.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Drag & drop media here or click the buttons below</p>
          </div>
        ) : (
          <div className={styles.mediaGrid}>
            {mediaItems.map((item, index) => (
              <div
                key={item.id}
                className={styles.mediaItem}
                draggable={onDragStart !== undefined}
                onDragStart={() => onDragStart?.(index)}
                onDragOver={(e) => onDragOver?.(e, index)}
                onDragEnd={onDragEnd}
              >
                {/* Media Preview */}
                <div className={styles.mediaPreviewContainer}>
                  {item.mediaType === 'image' && item.preview && (
                    <img src={item.preview} alt="Preview" className={styles.mediaPreview} />
                  )}
                  {item.mediaType === 'youtube' && (
                    <div className={styles.youtubePreview}>
                      {item.youtubeUrl ? (
                        <YouTubeEmbed
                          url={item.youtubeUrl}
                          alt="YouTube preview"
                          className={styles.mediaPreview}
                        />
                      ) : (
                        <>
                          <span>▶</span>
                          <p>YouTube</p>
                        </>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => onMediaRemove(item.id!)}
                    className={styles.deleteMediaBtn}
                    type="button"
                  >
                    ×
                  </button>
                </div>

                {/* Sensitive Content Controls */}
                {showSensitiveControls && onToggleSensitiveContent && onToggleSensitiveType && (
                  <div className={styles.mediaSensitiveControls}>
                    <label className={styles.mediaCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={item.hasSensitiveContent || false}
                        onChange={() => onToggleSensitiveContent(item.id!)}
                        className={styles.checkbox}
                      />
                      Sensitive
                    </label>

                    {item.hasSensitiveContent && (
                      <div className={styles.mediaCheckboxGroup}>
                        <label className={styles.smallCheckboxLabel}>
                          <input
                            type="checkbox"
                            checked={item.sensitiveContentTypes?.includes('gore') || false}
                            onChange={() => onToggleSensitiveType(item.id!, 'gore')}
                            className={styles.smallCheckbox}
                          />
                          Gore
                        </label>
                        <label className={styles.smallCheckboxLabel}>
                          <input
                            type="checkbox"
                            checked={item.sensitiveContentTypes?.includes('sexual_nudity_18+') || false}
                            onChange={() => onToggleSensitiveType(item.id!, 'sexual_nudity_18+')}
                            className={styles.smallCheckbox}
                          />
                          18+
                        </label>
                        <label className={styles.smallCheckboxLabel}>
                          <input
                            type="checkbox"
                            checked={item.sensitiveContentTypes?.includes('other') || false}
                            onChange={() => onToggleSensitiveType(item.id!, 'other')}
                            className={styles.smallCheckbox}
                          />
                          Other
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={styles.mediaActions}>
          <label className={`${styles.addButton} ${isMaxReached ? styles.disabled : ''}`}>
            <input
              type="file"
              accept={FILE_RULES.PORTFOLIO_MEDIA.accept}
              multiple
              onChange={onMediaAdd}
              className={styles.hiddenInput}
              disabled={isMaxReached}
            />
            <span className={styles.cameraIcon}>📷</span>
          </label>

          <button
            type="button"
            onClick={() => setShowYouTubeModal(true)}
            className={`${styles.addButton} ${isMaxReached ? styles.disabled : ''}`}
            disabled={isMaxReached}
          >
            <span className={styles.youtubeIcon}>▶</span>
          </button>

          {maxItems && (
            <span className={styles.itemCount}>
              {mediaItems.length} / {maxItems}
            </span>
          )}
        </div>
      </div>

      {showYouTubeModal && (
        <YouTubeModal
          onClose={() => setShowYouTubeModal(false)}
          onSave={handleYouTubeSave}
        />
      )}
    </div>
  );
};
