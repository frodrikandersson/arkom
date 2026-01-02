import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Portfolio } from '../../models/Portfolio';
import { FILE_RULES } from '../../../../backend/src/config/fileConstraints';
import { YouTubeModal } from './YouTubeModal';
import { YouTubeEmbed } from '../common/YouTubeEmbed';
import { usePortfolioForm } from '../../hooks/usePortfolioForm';
import styles from './ArtworkUploadModal.module.css';

interface ArtworkUploadModalProps {
  onClose: () => void;
  onUploadComplete?: () => void;
  existingPortfolio?: Portfolio | null;
}

export const ArtworkUploadModal = ({ onClose, onUploadComplete, existingPortfolio }: ArtworkUploadModalProps) => {
  const { user } = useAuth();
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  
  const {
    formData,
    mediaItems,
    uploading,
    handleImageAdd,
    handleYouTubeAdd,
    handleRemoveMedia,
    toggleMediaSensitiveContent,
    toggleMediaSensitiveType,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleFileDrop,
    handleDragOverDrop,
    handleInputChange,
    submitPortfolio,
  } = usePortfolioForm(existingPortfolio);

  const handleUpload = async () => {
    if (!user?.id) return;
    
    try {
      await submitPortfolio(user.id);
      alert(existingPortfolio ? 'Portfolio updated successfully!' : 'Portfolio uploaded successfully!');
      onUploadComplete?.();
      onClose();
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || `Failed to ${existingPortfolio ? 'update' : 'upload'} portfolio`);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeBtn}>
          ×
        </button>

        <h2 className={styles.title}>
          {existingPortfolio ? 'Edit Portfolio Piece' : 'Upload Portfolio Piece'}
        </h2>
        <p className={styles.description}>
          Share your creations with the community.
        </p>

        {/* Media Section */}
        <div className={styles.section}>
          <label className={styles.sectionTitle}>Media</label>
          <p className={styles.sectionDescription}>
            {FILE_RULES.PORTFOLIO_MEDIA.description}, or YouTube links (public or unlisted)
          </p>

          <div 
            className={styles.mediaBox}
            onDrop={handleFileDrop}
            onDragOver={handleDragOverDrop}
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
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
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
                        onClick={() => handleRemoveMedia(item.id!)}
                        className={styles.deleteMediaBtn}
                      >
                        ×
                      </button>
                    </div>

                    {/* Sensitive Content Controls */}
                    <div className={styles.mediaSensitiveControls}>
                      <label className={styles.mediaCheckboxLabel}>
                        <input
                          type="checkbox"
                          checked={item.hasSensitiveContent || false}
                          onChange={() => toggleMediaSensitiveContent(item.id!)}
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
                              onChange={() => toggleMediaSensitiveType(item.id!, 'gore')}
                              className={styles.smallCheckbox}
                            />
                            Gore
                          </label>
                          <label className={styles.smallCheckboxLabel}>
                            <input
                              type="checkbox"
                              checked={item.sensitiveContentTypes?.includes('sexual_nudity_18+') || false}
                              onChange={() => toggleMediaSensitiveType(item.id!, 'sexual_nudity_18+')}
                              className={styles.smallCheckbox}
                            />
                            18+
                          </label>
                          <label className={styles.smallCheckboxLabel}>
                            <input
                              type="checkbox"
                              checked={item.sensitiveContentTypes?.includes('other') || false}
                              onChange={() => toggleMediaSensitiveType(item.id!, 'other')}
                              className={styles.smallCheckbox}
                            />
                            Other
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.mediaActions}>
              <label className={styles.addButton}>
                <input
                  type="file"
                  accept={FILE_RULES.PORTFOLIO_MEDIA.accept}
                  multiple
                  onChange={handleImageAdd}
                  className={styles.hiddenInput}
                />
                <span className={styles.cameraIcon}>📷</span>
              </label>
              
              <button
                type="button"
                onClick={() => setShowYouTubeModal(true)}
                className={styles.addButton}
              >
                <span className={styles.youtubeIcon}>▶</span>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Give your portfolio piece a title"
            className={styles.input}
            maxLength={100}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your work..."
            className={styles.textarea}
            maxLength={1000}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Tags (comma-separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            placeholder="digital, portrait, fantasy"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Status</label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value as 'draft' | 'published')}
            className={styles.select}
          >
            <option value="draft">Draft (not visible to others)</option>
            <option value="published">Published (visible to everyone)</option>
          </select>
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || mediaItems.length === 0 || !formData.title}
          className={styles.uploadBtn}
        >
          {uploading 
            ? (existingPortfolio ? 'Updating...' : 'Uploading...') 
            : (existingPortfolio ? 'Update Portfolio' : 'Upload Portfolio')
          }
        </button>

        {showYouTubeModal && (
          <YouTubeModal
            onClose={() => setShowYouTubeModal(false)}
            onSave={handleYouTubeAdd}
          />
        )}
      </div>
    </div>
  );
};
