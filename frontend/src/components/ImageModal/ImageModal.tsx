import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './ImageModal.module.css';

interface ImageModalProps {
  imageUrl: string;
  fileName?: string;
  onClose: () => void;
}

export const ImageModal = ({ imageUrl, fileName, onClose }: ImageModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleDownload = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/messages/download-url?fileUrl=${encodeURIComponent(imageUrl)}&fileName=${encodeURIComponent(fileName || 'download')}`
      );
      const data = await response.json();
      
      if (data.downloadUrl) {
        const a = document.createElement('a');
        a.href = data.downloadUrl;
        a.download = fileName || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.fileName}>{fileName || 'Image'}</span>
          <div className={styles.actions}>
            <button className={styles.downloadBtn} onClick={handleDownload} title="Download">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            <button className={styles.closeBtn} onClick={onClose} title="Close">×</button>
          </div>
        </div>
        <div className={styles.imageContainer}>
          <img src={imageUrl} alt={fileName} className={styles.image} />
        </div>
      </div>
    </div>,
    document.body
  );
};