import { useAuth } from '../../contexts/AuthContext';
import { useArtworkUpload } from '../../hooks/useArtworkUpload';
import { FILE_RULES } from '../../../../backend/src/config/fileConstraints';

import styles from './ArtworkUpload.module.css';

interface ArtworkUploadProps {
  onUploadComplete?: () => void;
}

export const ArtworkUpload = ({ onUploadComplete }: ArtworkUploadProps) => {
  const { user } = useAuth();
  const {
    uploading,
    preview,
    formData,
    fileInputRef,
    handleFileChange,
    handleInputChange,
    toggleSensitiveType,
    handleUpload,
    setPreview,
  } = useArtworkUpload(user?.id || null, onUploadComplete);

  if (!user) return null;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Upload Portfolio Piece</h2>
      <p className={styles.description}>
        Share your creations with the community.
      </p>

      {preview && (
        <div className={styles.previewContainer}>
          <img src={preview} alt="Preview" className={styles.preview} />
          <button onClick={() => setPreview(null)} className={styles.removeBtn}>
            Remove
          </button>
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.label}>Image File *</label>
        <input
          ref={fileInputRef}
          type="file"
          accept={FILE_RULES.PORTFOLIO_MEDIA.accept}
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        <small className={styles.hint}>{FILE_RULES.PORTFOLIO_MEDIA.description}</small>
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
        disabled={uploading || !preview || !formData.title}
        className={styles.uploadBtn}
      >
        {uploading ? 'Uploading...' : 'Upload Portfolio'}
      </button>
    </div>
  );
};
