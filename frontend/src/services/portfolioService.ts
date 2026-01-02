import { api } from '../utils/apiClient';
import { Portfolio, GetPortfoliosResponse, PortfolioMediaUpload, SensitiveContentType, CreatePortfolioResponse } from '../models/Portfolio';

export interface GetUserPortfoliosParams {
  userId: string;
  status?: 'draft' | 'published';
  limit?: number;
  offset?: number;
}

export const getUserPortfolios = async (params: GetUserPortfoliosParams): Promise<GetPortfoliosResponse> => {
  const queryParams: Record<string, string> = {};
  
  if (params.status) queryParams.status = params.status;
  if (params.limit) queryParams.limit = params.limit.toString();
  if (params.offset) queryParams.offset = params.offset.toString();

  return api.get<GetPortfoliosResponse>(`/api/portfolio/user/${params.userId}`, queryParams);
};

export const getPortfolio = async (portfolioId: number): Promise<{ success: boolean; portfolio: Portfolio }> => {
  return api.get<{ success: boolean; portfolio: Portfolio }>(`/api/portfolio/${portfolioId}`);
};

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

// Upload media to portfolio
export const uploadPortfolioMedia = async (portfolioId: number, mediaItem: PortfolioMediaUpload, sensitiveContentTypeIds: number[]): Promise<void> => {
  const formDataUpload = new FormData();
  
  if (mediaItem.mediaType === 'image' && mediaItem.file) {
    formDataUpload.append('file', mediaItem.file);
  } else if (mediaItem.mediaType === 'youtube' && mediaItem.youtubeUrl) {
    formDataUpload.append('youtubeUrl', mediaItem.youtubeUrl);
  }
  
  formDataUpload.append('sortOrder', mediaItem.sortOrder.toString());
  formDataUpload.append('hasSensitiveContent', mediaItem.hasSensitiveContent ? 'true' : 'false');
  
  if (sensitiveContentTypeIds.length > 0) {
    formDataUpload.append('sensitiveContentTypeIds', JSON.stringify(sensitiveContentTypeIds));
  }

  await api.uploadFile(`/api/portfolio/${portfolioId}/media`, formDataUpload);
};

// Update existing portfolio media sensitive content
export const updatePortfolioMediaSensitiveContent = async (mediaId: string, hasSensitiveContent: boolean, sensitiveContentTypeIds: number[]): Promise<void> => {
  await api.put(`/api/portfolio/media/${mediaId}/sensitive-content`, {
    hasSensitiveContent,
    sensitiveContentTypeIds,
  });
};

// Update portfolio media sort order
export const updatePortfolioMediaSortOrder = async (mediaId: string, sortOrder: number): Promise<void> => {
  await api.put(`/api/portfolio/media/${mediaId}`, {
    sortOrder,
  });
};

// Delete portfolio media
export const deletePortfolioMedia = async (mediaId: string): Promise<void> => {
  await api.delete(`/api/portfolio/media/${mediaId}`);
};

// Create new portfolio
export const createPortfolio = async (data: {
  userId: string;
  title: string;
  description: string;
  tags: string[];
  status: 'draft' | 'published';
  linkedToCommission: boolean;
  hasSensitiveContent: boolean;
  sensitiveContentTypeIds: number[];
}): Promise<CreatePortfolioResponse> => {
  return api.post<CreatePortfolioResponse>('/api/portfolio', data);
};

// Update existing portfolio
export const updatePortfolio = async (portfolioId: number, data: {
  title: string;
  description: string;
  tags: string[];
  status: 'draft' | 'published';
  linkedToCommission: boolean;
  hasSensitiveContent: boolean;
  sensitiveContentTypeIds: number[];
}): Promise<void> => {
  await api.put(`/api/portfolio/${portfolioId}`, data);
};
