import { api } from '../utils/apiClient';

export const checkAdminStatus = async (): Promise<boolean> => {
  try {
    const response = await api.get<{ success: boolean; isAdmin: boolean }>('/api/admin/check');
    return response.isAdmin;
  } catch (error) {
    return false;
  }
};
