import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useReport } from '../../hooks/useReport';
import styles from './ReportModal.module.css';

interface ReportModalProps {
  reportedUserId: string;
  reportedUserName: string;
  conversationId?: number;
  onClose: () => void;
}

export const ReportModal = ({
  reportedUserId,
  reportedUserName,
  conversationId,
  onClose,
}: ReportModalProps) => {
  const { user } = useAuth();
  const {
    reportType,
    setReportType,
    description,
    setDescription,
    alsoBlock,
    setAlsoBlock,
    isSubmitting,
    handleSubmit,
  } = useReport(user?.id || null, reportedUserId, conversationId || null, onClose);

  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Report User</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.subtitle}>
            Report {reportedUserName} for inappropriate behavior
          </p>

          <div className={styles.formGroup}>
            <label className={styles.label}>Reason *</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className={styles.select}
              disabled={isSubmitting}
            >
              <option value="spam">Spam or Bot Activity</option>
              <option value="harassment">Harassment or Bullying</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="scam">Scam or Fraud</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Additional Details (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context..."
              className={styles.textarea}
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />
            <div className={styles.charCount}>{description.length}/500</div>
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={alsoBlock}
                onChange={(e) => setAlsoBlock(e.target.checked)}
                className={styles.checkbox}
                disabled={isSubmitting}
              />
              Also block this user
            </label>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
