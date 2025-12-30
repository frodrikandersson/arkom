import { useState, useCallback } from 'react';
import { api } from '../utils/apiClient';

export const usePortfolioOperations = () => {
  const [deleting, setDeleting] = useState(false);

  const deletePortfolio = useCallback(async (portfolioId: number) => {
    try {
      setDeleting(true);
      await api.delete(`/api/portfolio/${portfolioId}`);
      return { success: true };
    } catch (error: any) {
      console.error('Delete error:', error);
      throw error;
    } finally {
      setDeleting(false);
    }
  }, []);

  return {
    deleting,
    deletePortfolio,
  };
};
