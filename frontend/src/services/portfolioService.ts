import { api } from '../utils/apiClient';
import { CreatePortfolioData, Portfolio, PortfolioMediaUpload, SensitiveContentType, UpdatePortfolioData } from '../models/Portfolio';

export interface GetUserPortfoliosParams {
  userId: string;
  status?: 'draft' | 'published';
  limit?: number;
  offset?: number;
}

// Get portfolios for a user
export const getUserPortfolios = async (params: GetUserPortfoliosParams): Promise<{ success: boolean; portfolios: Portfolio[]; total: number }> => {
  const queryParams: Record<string, string> = {};

  if (params.status) queryParams.status = params.status;
  if (params.limit) queryParams.limit = params.limit.toString();
  if (params.offset) queryParams.offset = params.offset.toString();

  return api.get<{ success: boolean; portfolios: Portfolio[]; total: number }>(
    `/api/portfolio/user/${params.userId}`,
    queryParams
  );
};

// Get a single portfolio by ID
export const getPortfolio = async (portfolioId: number): Promise<{ success: boolean; portfolio: Portfolio }> => {
  return api.get<{ success: boolean; portfolio: Portfolio }>(`/api/portfolio/${portfolioId}`);
};

// Get sensitive content type IDs from types
export const getSensitiveContentTypeIds = async (types: SensitiveContentType[]): Promise<number[]> => {
  try {
    const data = await api.get<{ success: boolean; types: { id: number; type: SensitiveContentType }[] }>(
      '/api/portfolio/sensitive-content-types'
    );
    return types
      .map((t) => data.types.find((at) => at.type === t)?.id)
      .filter((id): id is number => id !== undefined);
  } catch (error) {
    console.error('Failed to get sensitive content type IDs:', error);
    return [];
  }
};

// Create a new portfolio
export const createPortfolio = async (data: CreatePortfolioData): Promise<{ success: boolean; portfolio: Portfolio; message?: string }> => {
  return api.post<{ success: boolean; portfolio: Portfolio; message?: string }>(
    '/api/portfolio',
    data
  );
};

// Update an existing portfolio
export const updatePortfolio = async (portfolioId: number, data: UpdatePortfolioData): Promise<void> => {
  await api.put(`/api/portfolio/${portfolioId}`, data);
};

// Delete a portfolio
export const deletePortfolio = async (portfolioId: number): Promise<void> => {
  await api.delete(`/api/portfolio/${portfolioId}`);
};

// Upload media to a portfolio
export const uploadPortfolioMedia = async (
  portfolioId: number,
  mediaItem: PortfolioMediaUpload,
  sensitiveContentTypeIds: number[]
): Promise<void> => {
  const formData = new FormData();

  if (mediaItem.mediaType === 'image' && mediaItem.file) {
    formData.append('file', mediaItem.file);
  } else if (mediaItem.mediaType === 'youtube' && mediaItem.youtubeUrl) {
    formData.append('youtubeUrl', mediaItem.youtubeUrl);
  }

  formData.append('sortOrder', mediaItem.sortOrder.toString());
  formData.append('hasSensitiveContent', mediaItem.hasSensitiveContent ? 'true' : 'false');

  if (sensitiveContentTypeIds.length > 0) {
    formData.append('sensitiveContentTypeIds', JSON.stringify(sensitiveContentTypeIds));
  }

  await api.uploadFile(`/api/portfolio/${portfolioId}/media`, formData);
};

// Update portfolio media sensitive content
export const updatePortfolioMediaSensitiveContent = async (
  mediaId: string,
  hasSensitiveContent: boolean,
  sensitiveContentTypeIds: number[]
): Promise<void> => {
  await api.put(`/api/portfolio/media/${mediaId}/sensitive-content`, {
    hasSensitiveContent,
    sensitiveContentTypeIds,
  });
};

// Update portfolio media sort order
export const updatePortfolioMediaSortOrder = async (mediaId: string, sortOrder: number): Promise<void> => {
  await api.put(`/api/portfolio/media/${mediaId}`, { sortOrder });
};

// Delete portfolio media
export const deletePortfolioMedia = async (mediaId: string): Promise<void> => {
  await api.delete(`/api/portfolio/media/${mediaId}`);
};
