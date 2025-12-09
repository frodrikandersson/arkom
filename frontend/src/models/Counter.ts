// src/models/Counter.ts
export interface LeaderboardEntry {
  user_id: string;
  count: number;
  display_name: string | null;
  primary_email: string | null;
}

export interface CounterResponse {
  count: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}