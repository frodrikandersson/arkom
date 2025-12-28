import { useState, useCallback } from 'react';
import { config } from '../config/env';

export const usePortfolioOperations = () => {
  const [deleting, setDeleting] = useState(false);

  const deletePortfolio = useCallback(async (portfolioId: number) => {
    try {
      setDeleting(true);
      const res = await fetch(`${config.apiUrl}/api/portfolio/${portfolioId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete portfolio');
      }

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
