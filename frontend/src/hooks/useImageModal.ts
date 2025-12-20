import { useEffect } from 'react';
import { getDownloadUrl } from '../services/messageService';

export const useImageModal = (onClose: () => void) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleDownload = async (imageUrl: string, fileName?: string) => {
    try {
      const data = await getDownloadUrl(imageUrl, fileName || 'download');
      
      if (data.downloadUrl) {
        const a = document.createElement('a');
        a.href = data.downloadUrl;
        a.download = fileName || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return {
    handleDownload,
  };
};
