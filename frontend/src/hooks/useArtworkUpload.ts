import { useState, useRef, useCallback } from 'react';
import { uploadArtwork } from '../services/artworkService';
import { ArtworkUploadData } from '../models';

export const useArtworkUpload = (userId: string | null, onUploadComplete?: () => void) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<ArtworkUploadData>({
    title: '',
    description: '',
    fileType: '2d',
    tags: '',
    isPublic: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      fileType: '2d',
      tags: '',
      isPublic: true,
    });
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = useCallback(async () => {
    if (!userId || !fileInputRef.current?.files?.[0] || !formData.title) {
      alert('Please provide a title and select an image');
      return;
    }

    try {
      setUploading(true);
      await uploadArtwork(userId, formData, fileInputRef.current.files[0]);
      alert('Artwork uploaded successfully!');
      resetForm();
      onUploadComplete?.();
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload artwork');
    } finally {
      setUploading(false);
    }
  }, [userId, formData, onUploadComplete]);

  return {
    uploading,
    preview,
    formData,
    fileInputRef,
    handleFileChange,
    handleInputChange,
    handleUpload,
    setPreview,
  };
};
