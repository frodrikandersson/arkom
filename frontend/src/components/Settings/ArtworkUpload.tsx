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
    handleUpload,
    setPreview,
  } = useArtworkUpload(user?.id || null, onUploadComplete);

  if (!user) return null;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Upload Artwork</h2>
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
        <label className={styles.label}>Image File</label>
        <input
          ref={fileInputRef}
          type="file"
          accept={FILE_RULES.ARTWORK_PORTFOLIO.accept}
          onChange={handleFileChange}
          className={styles.fileInput}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Give your artwork a title"
          className={styles.input}
          maxLength={100}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe your artwork..."
          className={styles.textarea}
          maxLength={1000}
          rows={3}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Type</label>
        <select
          value={formData.fileType}
          onChange={(e) => handleInputChange('fileType', e.target.value)}
          className={styles.select}
        >
          <option value="2d">2D Art</option>
          <option value="3d">3D Art</option>
          <option value="image">Photography</option>
        </select>
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
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) => handleInputChange('isPublic', e.target.checked)}
            className={styles.checkbox}
          />
          Make this artwork public
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading || !preview || !formData.title}
        className={styles.uploadBtn}
      >
        {uploading ? 'Uploading...' : 'Upload Artwork'}
      </button>
    </div>
  );
};
