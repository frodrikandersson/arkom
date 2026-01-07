import { useState, useCallback, useEffect } from 'react';
import { Portfolio, PortfolioMediaUpload, PortfolioFormData, SensitiveContentType } from '../models/Portfolio';
import {
  getSensitiveContentTypeIds,
  uploadPortfolioMedia,
  updatePortfolioMediaSensitiveContent,
  updatePortfolioMediaSortOrder,
  deletePortfolioMedia,
  createPortfolio,
  updatePortfolio,
} from '../services/portfolioService';

export const usePortfolioForm = (existingPortfolio?: Portfolio | null) => {
  const [uploading, setUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<PortfolioMediaUpload[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<PortfolioFormData>({
    status: 'draft',
    linkedToCommission: false,
    commissionServiceId: undefined,
    hasSensitiveContent: false,
    sensitiveContentTypes: [],
    title: '',
    description: '',
    tags: '',
    media: [],
  });

  // Load existing portfolio data if editing
  useEffect(() => {
    if (existingPortfolio) {
      setFormData({
        status: existingPortfolio.status,
        linkedToCommission: existingPortfolio.linkedToCommission,
        commissionServiceId: existingPortfolio.commissionServiceId,
        hasSensitiveContent: existingPortfolio.hasSensitiveContent,
        sensitiveContentTypes: existingPortfolio.sensitiveContentTypes || [],
        title: existingPortfolio.title,
        description: existingPortfolio.description || '',
        tags: existingPortfolio.tags?.join(', ') || '',
        media: [],
      });

      if (existingPortfolio.media && existingPortfolio.media.length > 0) {
        const loadedMedia: PortfolioMediaUpload[] = existingPortfolio.media.map((m) => ({
          id: m.id.toString(),
          mediaType: m.mediaType,
          preview: m.fileUrl,
          youtubeUrl: m.youtubeUrl,
          sortOrder: m.sortOrder,
          hasSensitiveContent: m.hasSensitiveContent || false,
          sensitiveContentTypes: m.sensitiveContentTypes || [],
        }));
        setMediaItems(loadedMedia);
      }
    }
  }, [existingPortfolio]);

  const handleImageAdd = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file, index) => {
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
  }, [mediaItems.length]);

  const handleYouTubeAdd = useCallback((url: string) => {
    const mediaItem: PortfolioMediaUpload = {
      id: `new-yt-${Date.now()}`,
      mediaType: 'youtube',
      youtubeUrl: url,
      sortOrder: mediaItems.length,
      hasSensitiveContent: false,
      sensitiveContentTypes: [],
    };
    setMediaItems(prev => [...prev, mediaItem]);
  }, [mediaItems.length]);

  const handleRemoveMedia = useCallback(async (id: string) => {
    const mediaItem = mediaItems.find(m => m.id === id);
    
    if (existingPortfolio && mediaItem && !id.startsWith('new-')) {
      try {
        await deletePortfolioMedia(id);
      } catch (error) {
        console.error('Failed to delete media:', error);
        alert('Failed to delete media from server');
        return;
      }
    }
    
    setMediaItems(prev => prev.filter(item => item.id !== id));
  }, [mediaItems, existingPortfolio]);

  const toggleMediaSensitiveContent = useCallback((mediaId: string) => {
    setMediaItems(prev =>
      prev.map(item =>
        item.id === mediaId
          ? { 
              ...item, 
              hasSensitiveContent: !item.hasSensitiveContent, 
              sensitiveContentTypes: !item.hasSensitiveContent ? item.sensitiveContentTypes : [] 
            }
          : item
      )
    );
  }, []);

  const toggleMediaSensitiveType = useCallback((mediaId: string, type: SensitiveContentType) => {
    setMediaItems(prev =>
      prev.map(item => {
        if (item.id !== mediaId) return item;
        
        const types = item.sensitiveContentTypes?.includes(type)
          ? item.sensitiveContentTypes.filter(t => t !== type)
          : [...(item.sensitiveContentTypes || []), type];
        
        return {
          ...item,
          sensitiveContentTypes: types,
          hasSensitiveContent: types.length > 0,
        };
      })
    );
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

  const handleInputChange = useCallback((field: keyof PortfolioFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const submitPortfolio = useCallback(async (userId: string) => {
    if (mediaItems.length === 0 || !formData.title) {
      throw new Error('Please provide a title and select at least one media item');
    }

    setUploading(true);

    try {
      let portfolioId: number;
      const hasAnySensitiveMedia = mediaItems.some(m => m.hasSensitiveContent);

      if (existingPortfolio) {
        await updatePortfolio(existingPortfolio.id, {
          title: formData.title,
          description: formData.description,
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
          status: formData.status,
          linkedToCommission: formData.linkedToCommission,
          commissionServiceId: formData.commissionServiceId,
          hasSensitiveContent: hasAnySensitiveMedia,
          sensitiveContentTypeIds: [],
        });
        portfolioId = existingPortfolio.id;
      } else {
        const { portfolio } = await createPortfolio({
          userId,
          title: formData.title,
          description: formData.description,
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
          status: formData.status,
          linkedToCommission: formData.linkedToCommission,
          commissionServiceId: formData.commissionServiceId,
          hasSensitiveContent: hasAnySensitiveMedia,
          sensitiveContentTypeIds: [],
        });
        portfolioId = portfolio.id;
      }

      // Upload new media items
      const newMediaItems = mediaItems.filter(item => item.id?.startsWith('new-'));
      
      for (const mediaItem of newMediaItems) {
        const sensitiveContentTypeIds = mediaItem.hasSensitiveContent && mediaItem.sensitiveContentTypes
          ? await getSensitiveContentTypeIds(mediaItem.sensitiveContentTypes)
          : [];

        await uploadPortfolioMedia(portfolioId, mediaItem, sensitiveContentTypeIds);
      }

      // Update existing media items
      if (existingPortfolio) {
        const existingMediaItems = mediaItems.filter(item => !item.id?.startsWith('new-'));
        
        for (const mediaItem of existingMediaItems) {
          await updatePortfolioMediaSortOrder(mediaItem.id!, mediaItem.sortOrder);
          
          const sensitiveContentTypeIds = mediaItem.hasSensitiveContent && mediaItem.sensitiveContentTypes
            ? await getSensitiveContentTypeIds(mediaItem.sensitiveContentTypes)
            : [];
          
          await updatePortfolioMediaSensitiveContent(
            mediaItem.id!,
            mediaItem.hasSensitiveContent || false,
            sensitiveContentTypeIds
          );
        }
      }

      return portfolioId;
    } finally {
      setUploading(false);
    }
  }, [mediaItems, formData, existingPortfolio]);

  return {
    formData,
    mediaItems,
    uploading,
    draggedIndex,
    handleImageAdd,
    handleYouTubeAdd,
    handleRemoveMedia,
    toggleMediaSensitiveContent,
    toggleMediaSensitiveType,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleFileDrop,
    handleDragOverDrop,
    handleInputChange,
    submitPortfolio,
  };
};
