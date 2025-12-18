import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ArtworkUploadData } from '../../models';
import styles from './ArtworkUpload.module.css';

interface ArtworkUploadProps {
  onUploadComplete?: () => void;
}

export const ArtworkUpload = ({ onUploadComplete }: ArtworkUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<ArtworkUploadData>({
    title: '',
    description: '',
    fileType: '2d',
    tags: '',
    isPublic: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpload = async () => {
    if (!user || !fileInputRef.current?.files?.[0] || !formData.title) {
      alert('Please provide a title and select an image');
      return;
    }

    try {
      setUploading(true);

      const uploadData = new FormData();
      uploadData.append('image', fileInputRef.current.files[0]);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('fileType', formData.fileType);
      uploadData.append('tags', formData.tags);
      uploadData.append('isPublic', formData.isPublic.toString());

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/artworks/${user.id}/upload`,
        {
          method: 'POST',
          body: uploadData,
        }
      );

      if (res.ok) {
        alert('Artwork uploaded successfully!');
        // Reset form
        setFormData({
          title: '',
          description: '',
          fileType: '2d',
          tags: '',
          isPublic: true,
        });
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onUploadComplete?.();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to upload artwork');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload artwork');
    } finally {
      setUploading(false);
    }
  };

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
          accept="image/*"
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
