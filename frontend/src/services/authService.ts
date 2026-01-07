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

// Password reset functions
export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  error?: string;
}

export const requestPasswordReset = async (email: string): Promise<PasswordResetResponse> => {
  return api.post<PasswordResetResponse>('/api/auth/forgot-password', { email });
};

export const resetPassword = async (token: string, password: string): Promise<PasswordResetResponse> => {
  return api.post<PasswordResetResponse>('/api/auth/reset-password', { token, password });
};

export const validateResetToken = async (token: string): Promise<ValidateTokenResponse> => {
  return api.get<ValidateTokenResponse>(`/api/auth/reset-password/${token}`);
};
