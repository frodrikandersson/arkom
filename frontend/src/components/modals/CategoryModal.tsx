import { useState, useEffect } from 'react';
import styles from './CategoryModal.module.css';

interface CategoryModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
  existingName?: string;
  title?: string;
}

export const CategoryModal = ({ onClose, onSave, existingName = '', title = 'Create Category' }: CategoryModalProps) => {
  const [categoryName, setCategoryName] = useState(existingName);

  useEffect(() => {
    setCategoryName(existingName);
  }, [existingName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onSave(categoryName.trim());
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.content}>
            <label className={styles.label}>
              Category Name
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
                className={styles.input}
                autoFocus
                maxLength={50}
              />
            </label>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={!categoryName.trim()}
            >
              {existingName ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
