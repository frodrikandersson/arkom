export interface CreateCategoryData {
  name: string;
  sortOrder: number;
}

export interface UpdateCategoryData {
  name: string;
}

export interface SortOrderUpdate {
  id: number;
  sortOrder: number;
}

export interface ServiceCategory {
  id: number | string;
  name: string;
  sortOrder: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}