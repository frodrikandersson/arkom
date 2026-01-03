import { Catalogue, Category, SubCategoryFilter, SubCategoryFilterOption } from '../models';
import { api } from '../utils/apiClient';



export const getCatalogues = async (): Promise<Catalogue[]> => {
  const response = await api.get<{ success: boolean; catalogues: Catalogue[] }>('/api/search-categories/catalogues');
  return response.catalogues;
};

export const getCategoriesByCatalogue = async (catalogueId: number): Promise<Category[]> => {
  const response = await api.get<{ success: boolean; categories: Category[] }>(`/api/search-categories/catalogues/${catalogueId}/categories`);
  return response.categories;
};

export const getSubCategoryFilters = async (): Promise<SubCategoryFilter[]> => {
  const response = await api.get<{ success: boolean; filters: SubCategoryFilter[] }>('/api/search-categories/sub-category-filters');
  return response.filters;
};

export const createCatalogue = async (data: { name: string; sortOrder: number }): Promise<Catalogue> => {
  const response = await api.post<{ success: boolean; catalogue: Catalogue }>('/api/search-categories/catalogues', data);
  return response.catalogue;
};

export const updateCatalogue = async (id: number, data: { name?: string; sortOrder?: number; isActive?: boolean }): Promise<Catalogue> => {
  const response = await api.put<{ success: boolean; catalogue: Catalogue }>(`/api/search-categories/catalogues/${id}`, data);
  return response.catalogue;
};

export const deleteCatalogue = async (id: number): Promise<void> => {
  await api.delete(`/api/search-categories/catalogues/${id}`);
};

export const createCategory = async (data: { catalogueId: number; name: string; sortOrder: number }): Promise<Category> => {
  const response = await api.post<{ success: boolean; category: Category }>('/api/search-categories/categories', data);
  return response.category;
};

export const updateCategory = async (id: number, data: { name?: string; sortOrder?: number; isActive?: boolean }): Promise<Category> => {
  const response = await api.put<{ success: boolean; category: Category }>(`/api/search-categories/categories/${id}`, data);
  return response.category;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/api/search-categories/categories/${id}`);
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

// Category-Filter assignments
export const getCategoryFilters = async (categoryId: number) => {
  const response = await api.get<{ success: boolean; filters: any[] }>(
    `/api/search-categories/categories/${categoryId}/filters`
  );
  return response.filters;
};

export const assignFilterToCategory = async (categoryId: number, filterId: number) => {
  const response = await api.post<{ success: boolean; assignment: any }>(
    '/api/search-categories/categories/filters/assign',
    { categoryId, filterId }
  );
  return response.assignment;
};

export const removeFilterFromCategory = async (categoryId: number, filterId: number) => {
  await api.delete(
    `/api/search-categories/categories/${categoryId}/filters/${filterId}`
  );
};
