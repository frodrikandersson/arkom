import { useState } from 'react';
import { reportUser, blockUser } from '../services/userService';

type ReportType = 'spam' | 'harassment' | 'inappropriate' | 'scam' | 'other';

export const useReport = (
  reporterId: string | null,
  reportedUserId: string,
  conversationId: number | null,
  onSuccess?: () => void
) => {
  const [reportType, setReportType] = useState<ReportType>('spam');
  const [description, setDescription] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reporterId) return;

    setIsSubmitting(true);
    try {
      await reportUser(
        reporterId,
        reportedUserId,
        reportType,
        description || null,
        conversationId
      );

      if (alsoBlock) {
        await blockUser(reporterId, reportedUserId, reportType);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    reportType,
    setReportType,
    description,
    setDescription,
    alsoBlock,
    setAlsoBlock,
    isSubmitting,
    handleSubmit,
  };
};
