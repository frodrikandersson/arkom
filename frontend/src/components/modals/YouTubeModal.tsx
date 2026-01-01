import { useState } from 'react';
import styles from './YouTubeModal.module.css';

interface YouTubeModalProps {
  onClose: () => void;
  onSave: (url: string) => void;
}

export const YouTubeModal = ({ onClose, onSave }: YouTubeModalProps) => {
  const [url, setUrl] = useState('');

  const handleSave = () => {
    if (url.trim()) {
      onSave(url.trim());
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button onClick={onClose} className={styles.cancelBtn}>Cancel</button>
          <h2 className={styles.title}>YouTube Embed</h2>
          <button onClick={handleSave} className={styles.saveBtn} disabled={!url.trim()}>Save</button>
        </div>

        <div className={styles.content}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={styles.input}
            autoFocus
          />

          <div className={styles.instructions}>
            <p className={styles.instructionsTitle}>How to:</p>
            <ol className={styles.instructionsList}>
              <li>Go to the YouTube video you want to add</li>
              <li>Copy the video URL</li>
              <li>Paste it above</li>
              <li>Click save</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
