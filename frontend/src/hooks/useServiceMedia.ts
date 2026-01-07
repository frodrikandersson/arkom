import { useState, useCallback } from 'react';
import { PortfolioMediaUpload } from '../models/Portfolio';

export const useServiceMedia = (maxItems: number = 12) => {
  const [mediaItems, setMediaItems] = useState<PortfolioMediaUpload[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleImageAdd = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = maxItems - mediaItems.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    filesToAdd.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const mediaItem: PortfolioMediaUpload = {
          id: `new-${Date.now()}-${index}`,
          mediaType: 'image',
          file,
          preview: reader.result as string,
          sortOrder: mediaItems.length + index,
          hasSensitiveContent: false,
          sensitiveContentTypes: [],
        };
        setMediaItems(prev => [...prev, mediaItem]);
      };
      reader.readAsDataURL(file);
    });
  }, [mediaItems.length, maxItems]);

  const handleYouTubeAdd = useCallback((url: string) => {
    if (mediaItems.length >= maxItems) return;

    const mediaItem: PortfolioMediaUpload = {
      id: `new-yt-${Date.now()}`,
      mediaType: 'youtube',
      youtubeUrl: url,
      sortOrder: mediaItems.length,
      hasSensitiveContent: false,
      sensitiveContentTypes: [],
    };
    setMediaItems(prev => [...prev, mediaItem]);
  }, [mediaItems.length, maxItems]);

  const handleRemoveMedia = useCallback((id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    setMediaItems(prev => {
      const newItems = [...prev];
      const draggedItem = newItems[draggedIndex];

      newItems.splice(draggedIndex, 1);
      newItems.splice(index, 0, draggedItem);

      newItems.forEach((item, idx) => {
        item.sortOrder = idx;
      });

      return newItems;
    });
    setDraggedIndex(index);
  }, [draggedIndex]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    if (files.length > 0) {
      const input = document.createElement('input');
      const dt = new DataTransfer();

      Array.from(files).forEach(file => dt.items.add(file));
      input.files = dt.files;

      handleImageAdd({ target: input } as any);
    }
  }, [handleImageAdd]);

  const handleDragOverDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const toggleMediaSensitiveContent = useCallback((id: string) => {
    setMediaItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          hasSensitiveContent: !item.hasSensitiveContent,
          sensitiveContentTypes: !item.hasSensitiveContent ? [] : item.sensitiveContentTypes,
        };
      }
      return item;
    }));
  }, []);

  const toggleMediaSensitiveType = useCallback((id: string, type: 'gore' | 'sexual_nudity_18+' | 'other') => {
    setMediaItems(prev => prev.map(item => {
      if (item.id === id) {
        const types = item.sensitiveContentTypes || [];
        const hasType = types.includes(type);
        return {
          ...item,
          sensitiveContentTypes: hasType
            ? types.filter(t => t !== type)
            : [...types, type],
        };
      }
      return item;
    }));
  }, []);

  return {
    mediaItems,
    setMediaItems,
    handleImageAdd,
    handleYouTubeAdd,
    handleRemoveMedia,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleFileDrop,
    handleDragOverDrop,
    toggleMediaSensitiveContent,
    toggleMediaSensitiveType,
  };
};
