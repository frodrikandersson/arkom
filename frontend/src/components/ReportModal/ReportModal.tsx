import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './ReportModal.module.css';

interface ReportModalProps {
  isOpen: boolean;
  reportedUserId: string;
  reportedUserName: string;
  conversationId?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportModal = ({
  isOpen,
  reportedUserId,
  reportedUserName,
  conversationId,
  onClose,
  onSuccess,
}: ReportModalProps) => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportTypes = [
    { value: 'spam', label: 'Spam' },
    { value: 'harassment', label: 'Harassment or Bullying' },
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'scam', label: 'Scam or Fraud' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async () => {
    if (!user || !reportType) return;

    setIsSubmitting(true);

    try {
      // Submit report
      const reportRes = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/report`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reporterId: user.id,
            reportedUserId,
            reportType,
            description: description.trim() || null,
            conversationId: conversationId || null,
          }),
        }
      );

      if (!reportRes.ok) {
        throw new Error('Failed to submit report');
      }

      // Also block if checkbox is checked
      if (alsoBlock) {
        const blockRes = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/block`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              blockedUserId: reportedUserId,
              reason: `Blocked while reporting for: ${reportType}`,
            }),
          }
        );

        if (!blockRes.ok) {
          console.error('Failed to block user');
        }
      }

      alert(`Thank you for your report. We'll review it shortly.${alsoBlock ? ' User has been blocked.' : ''}`);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Report error:', err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Report @{reportedUserName}</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          <p className={styles.description}>
            Help us understand what's happening. Your report is anonymous.
          </p>

          <div className={styles.field}>
            <label>Why are you reporting this user?</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className={styles.select}
            >
              <option value="">Select a reason...</option>
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Additional details (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more context about this report..."
              className={styles.textarea}
              rows={4}
              maxLength={500}
            />
            <div className={styles.charCount}>{description.length}/500</div>
          </div>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={alsoBlock}
              onChange={(e) => setAlsoBlock(e.target.checked)}
            />
            <span>Also block this user</span>
          </label>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!reportType || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
