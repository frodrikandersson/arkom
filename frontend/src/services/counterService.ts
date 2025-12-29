import { api } from '../utils/apiClient';
import type { CounterResponse, LeaderboardResponse, DashboardResponse } from '../models/Counter';

export const getDashboard = async (userId: string): Promise<DashboardResponse> => {
  return api.get<DashboardResponse>(`/api/counter/dashboard/${userId}`);
};

export const getLeaderboard = async (): Promise<LeaderboardResponse> => {
  return api.get<LeaderboardResponse>('/api/counter/leaderboard');
};

export const getUserCounter = async (userId: string): Promise<CounterResponse> => {
  return api.get<CounterResponse>(`/api/counter/${userId}`);
};

export const incrementUserCounter = async (userId: string): Promise<CounterResponse> => {
  return api.post<CounterResponse>(`/api/counter/${userId}/increment`);
};
