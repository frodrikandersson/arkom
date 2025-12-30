import { Portfolio } from '../../models/Portfolio';
import { usePortfolioOperations } from '../../hooks/usePortfolioOperations';
import styles from './PortfolioEditModal.module.css';

interface PortfolioEditModalProps {
  portfolio: Portfolio;
  onClose: () => void;
  onDelete: () => void;
}

export const PortfolioEditModal = ({ portfolio, onClose, onDelete }: PortfolioEditModalProps) => {
  const { deleting, deletePortfolio } = usePortfolioOperations();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${portfolio.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deletePortfolio(portfolio.id);
      alert('Portfolio deleted successfully');
      onDelete();
    } catch (error: any) {
      alert(error.message || 'Failed to delete portfolio');
    }
  };

  const firstMedia = portfolio.media?.[0];
  const imageUrl = firstMedia?.fileUrl;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          ×
        </button>

        <h2 className={styles.title}>{portfolio.title}</h2>

        {imageUrl && (
          <div className={styles.imageContainer}>
            <img src={imageUrl} alt={portfolio.title} className={styles.image} />
          </div>
        )}

        <div className={styles.details}>
          {portfolio.description && (
            <p className={styles.description}>{portfolio.description}</p>
          )}

          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <strong>Status:</strong> {portfolio.status === 'draft' ? 'Draft' : 'Published'}
            </div>
            <div className={styles.metaItem}>
              <strong>Media:</strong> {portfolio.media?.length || 0} items
            </div>
            <div className={styles.metaItem}>
              <strong>Views:</strong> {portfolio.viewCount}
            </div>
            <div className={styles.metaItem}>
              <strong>Likes:</strong> {portfolio.likeCount}
            </div>
          </div>

          {portfolio.tags && portfolio.tags.length > 0 && (
            <div className={styles.tags}>
              {portfolio.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {portfolio.hasSensitiveContent && (
            <div className={styles.warning}>
              ⚠️ Contains sensitive content
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Portfolio'}
          </button>
        </div>
      </div>
    </>
  );
};
