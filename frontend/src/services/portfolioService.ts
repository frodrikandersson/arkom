import { api } from '../utils/apiClient';
import { Portfolio, GetPortfoliosResponse } from '../models/Portfolio';

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
