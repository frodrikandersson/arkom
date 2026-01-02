import { useState, useCallback } from 'react';
import { PortfolioMedia } from '../models/Portfolio';

export const useMediaCarousel = (media: PortfolioMedia[]) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const goToPrevious = useCallback(() => {
    setSelectedMediaIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  }, [media.length]);

  const goToNext = useCallback(() => {
    setSelectedMediaIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  }, [media.length]);

  const selectMedia = useCallback((index: number) => {
    setSelectedMediaIndex(index);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, onClose: () => void) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') onClose();
  }, [goToPrevious, goToNext]);

  return {
    selectedMediaIndex,
    currentMedia: media[selectedMediaIndex],
    goToPrevious,
    goToNext,
    selectMedia,
    handleKeyDown,
  };
};
