import { AuthResponse, CurrentUserResponse, LoginRequest, RegisterRequest } from '../models';
import { api } from '../utils/apiClient';

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  return api.post<AuthResponse>('/api/auth/login', data);
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  return api.post<AuthResponse>('/api/auth/register', data);
};

export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  return api.get<CurrentUserResponse>('/api/auth/me');
};

export const logout = (): void => {
  localStorage.removeItem('auth_token');
};
