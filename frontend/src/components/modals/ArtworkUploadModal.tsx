import { useAuth } from '../../contexts/AuthContext';
import { Portfolio } from '../../models/Portfolio';
import { MediaSelector } from '../common/MediaSelector';
import { usePortfolioForm } from '../../hooks/usePortfolioForm';
import styles from './ArtworkUploadModal.module.css';
import { useEffect, useState } from 'react';
import { getUserServices } from '../../services/serviceService';
import { Service } from '../../models';

interface ArtworkUploadModalProps {
  onClose: () => void;
  onUploadComplete?: () => void;
  existingPortfolio?: Portfolio | null;
}

export const ArtworkUploadModal = ({ onClose, onUploadComplete, existingPortfolio }: ArtworkUploadModalProps) => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);

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

  // Load user's services
  useEffect(() => {
    const loadServices = async () => {
      try {
        const { services: fetchedServices } = await getUserServices();
        // Show all services (not just OPEN ones) for portfolio linking
        setServices(fetchedServices);
      } catch (error) {
        console.error('Failed to load services:', error);
      }
    };
    loadServices();
  }, []);

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
          <MediaSelector
            mediaItems={mediaItems}
            onMediaAdd={handleImageAdd}
            onYouTubeAdd={handleYouTubeAdd}
            onMediaRemove={handleRemoveMedia}
            onToggleSensitiveContent={toggleMediaSensitiveContent}
            onToggleSensitiveType={toggleMediaSensitiveType}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onFileDrop={handleFileDrop}
            onDragOverDrop={handleDragOverDrop}
            showSensitiveControls={true}
            description="Max 8MB each, JPG, PNG, GIF, WEBP, or YouTube links (public or unlisted)"
          />
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

        {/* Service Connection */}
        <div className={styles.formGroup}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={formData.linkedToCommission}
              onChange={(e) => handleInputChange('linkedToCommission', e.target.checked)}
            />
            <span>Link to a service</span>
          </label>
          {formData.linkedToCommission && (
            <select
              value={formData.commissionServiceId || ''}
              onChange={(e) => handleInputChange('commissionServiceId', e.target.value ? Number(e.target.value) : undefined)}
              className={styles.select}
            >
              <option value="">Select a service...</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          )}
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
      </div>
    </div>
  );
};
