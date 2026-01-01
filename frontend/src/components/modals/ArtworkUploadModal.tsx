import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Portfolio, PortfolioMediaUpload, PortfolioFormData, SensitiveContentType, CreatePortfolioResponse } from '../../models/Portfolio';
import { FILE_RULES } from '../../../../backend/src/config/fileConstraints';
import { api } from '../../utils/apiClient';
import { YouTubeModal } from './YouTubeModal';
import styles from './ArtworkUploadModal.module.css';
import { YouTubeEmbed } from '../common/YouTubeEmbed';

interface ArtworkUploadModalProps {
  onClose: () => void;
  onUploadComplete?: () => void;
  existingPortfolio?: Portfolio | null; // Optional existing portfolio for editing
}

export const ArtworkUploadModal = ({ onClose, onUploadComplete, existingPortfolio }: ArtworkUploadModalProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<PortfolioMediaUpload[]>([]);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<PortfolioFormData>({
    status: 'draft',
    linkedToCommission: false,
    hasSensitiveContent: false,
    sensitiveContentTypes: [],
    title: '',
    description: '',
    tags: '',
    media: [],
  });

  // Load existing portfolio data if editing
  useEffect(() => {
    if (existingPortfolio) {
      setFormData({
        status: existingPortfolio.status,
        linkedToCommission: existingPortfolio.linkedToCommission,
        hasSensitiveContent: existingPortfolio.hasSensitiveContent,
        sensitiveContentTypes: existingPortfolio.sensitiveContentTypes || [],
        title: existingPortfolio.title,
        description: existingPortfolio.description || '',
        tags: existingPortfolio.tags?.join(', ') || '',
        media: [],
      });

      // Load existing media
      if (existingPortfolio.media && existingPortfolio.media.length > 0) {
        const loadedMedia: PortfolioMediaUpload[] = existingPortfolio.media.map((m) => ({
          id: m.id.toString(),
          mediaType: m.mediaType,
          preview: m.fileUrl, // Use the actual file URL as preview
          youtubeUrl: m.youtubeUrl,
          sortOrder: m.sortOrder,
          // Don't include 'file' since we're not re-uploading existing images
        }));
        setMediaItems(loadedMedia);
      }
    }
  }, [existingPortfolio]);

  // Handle image file selection
  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const mediaItem: PortfolioMediaUpload = {
          id: `new-${Date.now()}-${index}`,
          mediaType: 'image',
          file,
          preview: reader.result as string,
          sortOrder: mediaItems.length + index,
        };
        
        setMediaItems(prev => [...prev, mediaItem]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle YouTube URL
  const handleYouTubeAdd = (url: string) => {
    const mediaItem: PortfolioMediaUpload = {
      id: `new-yt-${Date.now()}`,
      mediaType: 'youtube',
      youtubeUrl: url,
      sortOrder: mediaItems.length,
    };
    
    setMediaItems(prev => [...prev, mediaItem]);
  };

  // Remove media item
  const handleRemoveMedia = async (id: string) => {
    const mediaItem = mediaItems.find(m => m.id === id);
    
    // If it's an existing media item (has numeric ID), delete it from the server
    if (existingPortfolio && mediaItem && !id.startsWith('new-')) {
      try {
        await api.delete(`/api/portfolio/media/${id}`);
      } catch (error) {
        console.error('Failed to delete media:', error);
        alert('Failed to delete media from server');
        return;
      }
    }
    
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...mediaItems];
    const draggedItem = newItems[draggedIndex];
    
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    // Update sort orders
    newItems.forEach((item, idx) => {
      item.sortOrder = idx;
    });
    
    setMediaItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // File drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    
    if (files.length > 0) {
      const input = document.createElement('input');
      const dt = new DataTransfer();
      
      Array.from(files).forEach(file => dt.items.add(file));
      input.files = dt.files;
      
      handleImageAdd({ target: input } as any);
    }
  };

  const handleDragOverDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleInputChange = (field: keyof PortfolioFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSensitiveType = (type: SensitiveContentType) => {
    setFormData(prev => {
      const types = prev.sensitiveContentTypes.includes(type)
        ? prev.sensitiveContentTypes.filter(t => t !== type)
        : [...prev.sensitiveContentTypes, type];
      
      return {
        ...prev,
        sensitiveContentTypes: types,
        hasSensitiveContent: types.length > 0,
      };
    });
  };

  const handleUpload = useCallback(async () => {
    if (!user?.id || mediaItems.length === 0 || !formData.title) {
      alert('Please provide a title and select at least one media item');
      return;
    }

    try {
      setUploading(true);

      let portfolioId: number;

      if (existingPortfolio) {
        // Update existing portfolio
        const portfolioPayload = {
          title: formData.title,
          description: formData.description,
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
          status: formData.status,
          linkedToCommission: formData.linkedToCommission,
          hasSensitiveContent: formData.hasSensitiveContent,
          sensitiveContentTypeIds: [],
        };

        await api.put(`/api/portfolio/${existingPortfolio.id}`, portfolioPayload);
        portfolioId = existingPortfolio.id;
      } else {
        // Create new portfolio
        const portfolioPayload = {
          userId: user.id,
          title: formData.title,
          description: formData.description,
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
          status: formData.status,
          linkedToCommission: formData.linkedToCommission,
          hasSensitiveContent: formData.hasSensitiveContent,
          sensitiveContentTypeIds: [],
        };

        const { portfolio } = await api.post<CreatePortfolioResponse>('/api/portfolio', portfolioPayload);
        portfolioId = portfolio.id;
      }

      // Upload new media items (those with 'new-' prefix)
      const newMediaItems = mediaItems.filter(item => item.id?.startsWith('new-'));
      
      for (const mediaItem of newMediaItems) {
        if (mediaItem.mediaType === 'image' && mediaItem.file) {
          // Upload image file
          const formDataUpload = new FormData();
          formDataUpload.append('file', mediaItem.file);
          formDataUpload.append('sortOrder', mediaItem.sortOrder.toString());

          await api.uploadFile(`/api/portfolio/${portfolioId}/media`, formDataUpload);
        } else if (mediaItem.mediaType === 'youtube' && mediaItem.youtubeUrl) {
          // Upload YouTube URL using the same endpoint
          const formDataUpload = new FormData();
          formDataUpload.append('youtubeUrl', mediaItem.youtubeUrl);
          formDataUpload.append('sortOrder', mediaItem.sortOrder.toString());

          await api.uploadFile(`/api/portfolio/${portfolioId}/media`, formDataUpload);
        }
      }

      // Update sort order for existing media items
      if (existingPortfolio) {
        const existingMediaItems = mediaItems.filter(item => !item.id?.startsWith('new-'));
        
        for (const mediaItem of existingMediaItems) {
          await api.put(`/api/portfolio/media/${mediaItem.id}`, {
            sortOrder: mediaItem.sortOrder,
          });
        }
      }

      alert(existingPortfolio ? 'Portfolio updated successfully!' : 'Portfolio uploaded successfully!');
      onUploadComplete?.();
      onClose();
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || `Failed to ${existingPortfolio ? 'update' : 'upload'} portfolio`);
    } finally {
      setUploading(false);
    }
  }, [user, mediaItems, formData, onUploadComplete, onClose, existingPortfolio]);


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
            onDrop={handleDrop}
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

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.hasSensitiveContent}
              onChange={(e) => handleInputChange('hasSensitiveContent', e.target.checked)}
              className={styles.checkbox}
            />
            Contains sensitive content
          </label>
        </div>

        {formData.hasSensitiveContent && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Sensitive Content Types</label>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.sensitiveContentTypes.includes('gore')}
                  onChange={() => toggleSensitiveType('gore')}
                  className={styles.checkbox}
                />
                Gore
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.sensitiveContentTypes.includes('sexual_nudity_18+')}
                  onChange={() => toggleSensitiveType('sexual_nudity_18+')}
                  className={styles.checkbox}
                />
                Sexual/Nudity (18+)
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.sensitiveContentTypes.includes('other')}
                  onChange={() => toggleSensitiveType('other')}
                  className={styles.checkbox}
                />
                Other
              </label>
            </div>
          </div>
        )}

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
