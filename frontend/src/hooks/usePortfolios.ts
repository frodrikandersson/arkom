import { useState, useEffect } from 'react';
import { getUserPortfolios } from '../services/portfolioService';
import { Portfolio } from '../models/index';

export const useArtworkGrid = (userId: string, isOwnProfile: boolean) => {
  const [artworks, setArtworks] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtworks();
  }, [userId]);

  const loadArtworks = async () => {
    try {
      setLoading(true);
      
      // If own profile, fetch all (including drafts), otherwise only published
      const data = await getUserPortfolios({
        userId,
        status: isOwnProfile ? undefined : 'published',
      });
      
      setArtworks(data.portfolios || []);
    } catch (error) {
      console.error('Failed to load portfolios:', error);
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    artworks,
    loading,
  };
};
