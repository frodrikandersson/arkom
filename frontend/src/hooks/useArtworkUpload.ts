import { useState, useRef, useCallback } from 'react';
import { PortfolioFormData, SensitiveContentType, CreatePortfolioResponse } from '../models/Portfolio';
import { api } from '../utils/apiClient';

export const useArtworkUpload = (userId: string | null, onUploadComplete?: () => void) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<PortfolioFormData>({
    status: 'draft',
    linkedToCommission: false,
    hasSensitiveContent: false,
    sensitiveContentTypes: [],
    title: '',
    description: '',
    tags: '',
    media: [],
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

  const handleInputChange = (field: keyof PortfolioFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSensitiveType = (type: SensitiveContentType) => {
    setFormData(prev => {
      const types = prev.sensitiveContentTypes.includes(type)
        ? prev.sensitiveContentTypes.filter(t => t !== type)
        : [...prev.sensitiveContentTypes, type];
      
      return {
        ...prev,
        sensitiveContentTypes: types,
        hasSensitiveContent: types.length > 0,
      };
    });
  };

  const resetForm = () => {
    setFormData({
      status: 'draft',
      linkedToCommission: false,
      hasSensitiveContent: false,
      sensitiveContentTypes: [],
      title: '',
      description: '',
      tags: '',
      media: [],
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

      // Create portfolio first
      const portfolioPayload = {
        userId,
        title: formData.title,
        description: formData.description,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        status: formData.status,
        linkedToCommission: formData.linkedToCommission,
        hasSensitiveContent: formData.hasSensitiveContent,
        sensitiveContentTypeIds: [],
      };

      const { portfolio } = await api.post<CreatePortfolioResponse>('/api/portfolio', portfolioPayload);

      // Upload media file
      const formDataUpload = new FormData();
      formDataUpload.append('file', fileInputRef.current.files[0]);

      await api.uploadFile(`/api/portfolio/${portfolio.id}/media`, formDataUpload);

      alert('Portfolio uploaded successfully!');
      resetForm();
      onUploadComplete?.();
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload portfolio');
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
    toggleSensitiveType,
    handleUpload,
    setPreview,
    resetForm,
  };
};
