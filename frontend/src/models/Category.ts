export interface Catalogue {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Category {
  id: number;
  catalogueId: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface SubCategoryFilterOption {
  id: number;
  filterId: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface SubCategoryFilter {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  options: SubCategoryFilterOption[];
}

export interface SearchCategoryData {
  isDiscoverable: boolean;
  catalogueId: number | null;
  categoryId: number | null;
  subCategorySelections: number[];
}