import { AdminUser } from '../models';
import { api } from '../utils/apiClient';

export const checkAdminStatus = async (): Promise<boolean> => {
  try {
    const response = await api.get<{ success: boolean; isAdmin: boolean }>('/api/admin/status');
    return response.isAdmin;
  } catch (error) {
    return false;
  }
};

export const getAllUsers = async (search?: string): Promise<AdminUser[]> => {
  const queryParams = search ? { search } : undefined;
  const response = await api.get<{ success: boolean; users: AdminUser[] }>(
    '/api/admin/users',
    queryParams
  );
  return response.users;
};

export const updateUserAdminStatus = async (userId: string, isAdmin: boolean): Promise<AdminUser> => {
  const response = await api.patch<{ success: boolean; user: AdminUser }>(
    `/api/admin/users/${userId}/admin`,
    { isAdmin }
  );
  return response.user;
};

