import { config } from '../config/env';
import { Portfolio, GetPortfoliosResponse } from '../models/Portfolio';

export interface GetUserPortfoliosParams {
  userId: string;
  status?: 'draft' | 'published';
  limit?: number;
  offset?: number;
}

/**
 * Get portfolios for a specific user
 */
export const getUserPortfolios = async (params: GetUserPortfoliosParams): Promise<GetPortfoliosResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.status) {
    queryParams.append('status', params.status);
  }
  if (params.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params.offset) {
    queryParams.append('offset', params.offset.toString());
  }

  const res = await fetch(
    `${config.apiUrl}/api/portfolio/user/${params.userId}?${queryParams}`
  );
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load portfolios');
  }
  
  return data;
};

/**
 * Get a single portfolio by ID
 */
export const getPortfolio = async (portfolioId: number): Promise<{ success: boolean; portfolio: Portfolio }> => {
  const res = await fetch(`${config.apiUrl}/api/portfolio/${portfolioId}`);
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load portfolio');
  }
  
  return data;
};
