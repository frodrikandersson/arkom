import { api } from '../utils/apiClient';
import { CreateCategoryData, ServiceCategory, SortOrderUpdate, SubCategoryFilter, SubCategoryFilterOption, UpdateCategoryData } from '../models';



export const getCategories = async (): Promise<ServiceCategory[]> => {
  const response = await api.get<{ success: boolean; categories: ServiceCategory[] }>('/api/service/categories');
  return response.categories;
};

export const createCategory = async (data: CreateCategoryData): Promise<ServiceCategory> => {
  const response = await api.post<{ success: boolean; category: ServiceCategory }>('/api/service/categories', data);
  return response.category;
};

export const updateCategory = async (id: number, data: UpdateCategoryData): Promise<ServiceCategory> => {
  const response = await api.put<{ success: boolean; category: ServiceCategory }>(`/api/service/categories/${id}`, data);
  return response.category;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/api/service/categories/${id}`);
};

export const updateCategorySortOrder = async (updates: SortOrderUpdate[]): Promise<void> => {
  await api.put('/api/service/categories/sort-order', { updates });
};

// Sub-category filter CRUD
export const createSubCategoryFilter = async (data: { name: string; sortOrder: number }): Promise<SubCategoryFilter> => {
  const response = await api.post<{ success: boolean; filter: SubCategoryFilter }>('/api/search-categories/sub-category-filters', data);
  return response.filter;
};

export const updateSubCategoryFilter = async (id: number, data: { name?: string; sortOrder?: number; isActive?: boolean }): Promise<SubCategoryFilter> => {
  const response = await api.put<{ success: boolean; filter: SubCategoryFilter }>(`/api/search-categories/sub-category-filters/${id}`, data);
  return response.filter;
};

export const deleteSubCategoryFilter = async (id: number): Promise<void> => {
  await api.delete(`/api/search-categories/sub-category-filters/${id}`);
};

// Sub-category filter option CRUD
export const createSubCategoryFilterOption = async (data: { filterId: number; name: string; sortOrder: number }): Promise<SubCategoryFilterOption> => {
  const response = await api.post<{ success: boolean; option: SubCategoryFilterOption }>('/api/search-categories/sub-category-filter-options', data);
  return response.option;
};

export const updateSubCategoryFilterOption = async (id: number, data: { name?: string; sortOrder?: number; isActive?: boolean }): Promise<SubCategoryFilterOption> => {
  const response = await api.put<{ success: boolean; option: SubCategoryFilterOption }>(`/api/search-categories/sub-category-filter-options/${id}`, data);
  return response.option;
};

export const deleteSubCategoryFilterOption = async (id: number): Promise<void> => {
  await api.delete(`/api/search-categories/sub-category-filter-options/${id}`);
};
