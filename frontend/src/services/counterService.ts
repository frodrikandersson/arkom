import { config } from '../config/env';
import type { CounterResponse, LeaderboardResponse } from '../models/Counter';

export const getLeaderboard = async (): Promise<LeaderboardResponse> => {
  const res = await fetch(`${config.apiUrl}/api/counter/leaderboard`);
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch leaderboard');
  }
  
  return data;
};

export const getUserCounter = async (userId: string): Promise<CounterResponse> => {
  const res = await fetch(`${config.apiUrl}/api/counter/${userId}`);
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch counter');
  }
  
  return data;
};

export const incrementUserCounter = async (userId: string): Promise<CounterResponse> => {
  const res = await fetch(`${config.apiUrl}/api/counter/${userId}/increment`, {
    method: 'POST',
  });
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to increment counter');
  }
  
  return data;
};