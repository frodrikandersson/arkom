import { useState, useEffect } from 'react';
import { getUserArtworks } from '../services/artworkService';
import { Artwork } from '../models';

export const useArtworkGrid = (userId: string, isOwnProfile: boolean) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtworks();
  }, [userId]);

  const loadArtworks = async () => {
    try {
      setLoading(true);
      const data = await getUserArtworks({
        userId,
        includePrivate: isOwnProfile,
        requesterId: isOwnProfile ? userId : undefined,
      });
      setArtworks(data.artworks || []);
    } catch (error) {
      console.error('Failed to load artworks:', error);
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
