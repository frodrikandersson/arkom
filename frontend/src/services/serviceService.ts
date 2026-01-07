import { api } from '../utils/apiClient';
import { PortfolioMediaUpload, SensitiveContentType } from '../models/Portfolio';
import { CreateServiceData, Service } from '../models';



// Get sensitive content type IDs from types
export const getSensitiveContentTypeIds = async (types: SensitiveContentType[]): Promise<number[]> => {
  try {
    const { types: allTypes } = await api.get<{ success: boolean; types: { id: number; type: SensitiveContentType }[] }>('/api/portfolio/sensitive-content-types');
    return types.map(t => allTypes.find(at => at.type === t)?.id).filter(id => id !== undefined) as number[];
  } catch (error) {
    console.error('Failed to get sensitive content type IDs:', error);
    return [];
  }
};

// Create a new service
export const createService = async (serviceData: CreateServiceData): Promise<{ success: boolean; service: Service; message: string }> => {
  return api.post<{ success: boolean; service: Service; message: string }>('/api/services', serviceData);
};

// Upload service media (handles both images and YouTube URLs)
export const uploadServiceMedia = async (
  serviceId: number,
  mediaItem: PortfolioMediaUpload,
  sensitiveContentTypeIds: number[]
): Promise<void> => {
  const formData = new FormData();

  if (mediaItem.mediaType === 'youtube') {
    formData.append('youtubeUrl', mediaItem.youtubeUrl || '');
  } else if (mediaItem.file) {
    formData.append('file', mediaItem.file);
  }

  formData.append('sortOrder', mediaItem.sortOrder.toString());
  formData.append('hasSensitiveContent', mediaItem.hasSensitiveContent ? 'true' : 'false');

  if (sensitiveContentTypeIds.length > 0) {
    formData.append('sensitiveContentTypeIds', JSON.stringify(sensitiveContentTypeIds));
  }

  await api.uploadFile(`/api/services/${serviceId}/media`, formData);
};

// Get all services for the current user
export const getUserServices = async (): Promise<{ success: boolean; services: Service[] }> => {
  return api.get<{ success: boolean; services: Service[] }>('/api/services');
};

// Service with shop owner info (returned from browse endpoints)
export interface ServiceWithOwner extends Service {
  shopOwner: {
    id: string;
    displayName: string;
    username: string;
    profileImageUrl: string | null;
  };
  searchCategoryData: Service['searchCategoryData'];
}

// Get services by type for browse pages (custom_proposal or instant_order)
export const getServicesByType = async (type: 'custom_proposal' | 'instant_order'): Promise<{ success: boolean; services: ServiceWithOwner[] }> => {
  return api.get<{ success: boolean; services: ServiceWithOwner[] }>(`/api/services/browse/${type}`);
};

// Get all services for a specific user (public)
export const getServicesByUserId = async (userId: string): Promise<{ success: boolean; services: Service[] }> => {
  return api.get<{ success: boolean; services: Service[] }>(`/api/services/user/${userId}`);
};

// Get a specific service by ID
export const getServiceById = async (serviceId: number): Promise<{ success: boolean; service: Service }> => {
  return api.get<{ success: boolean; service: Service }>(`/api/services/${serviceId}`);
};

// Update a service
export const updateService = async (serviceId: number, data: { status?: string }): Promise<{ success: boolean; service: Service }> => {
  return api.put<{ success: boolean; service: Service }>(`/api/services/${serviceId}`, data);
};

// Delete a service
export const deleteService = async (serviceId: number): Promise<void> => {
  await api.delete(`/api/services/${serviceId}`);
};

// Delete service media
export const deleteServiceMedia = async (mediaId: number): Promise<void> => {
  await api.delete(`/api/services/media/${mediaId}`);
};
