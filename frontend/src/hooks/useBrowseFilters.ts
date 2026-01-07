import { useState, useEffect, useCallback, useMemo } from 'react';
import { Catalogue, Category, SubCategoryFilter } from '../models';
import { getCatalogues, getCategoriesByCatalogue, getSubCategoryFilters, getCategoryFilters } from '../services/searchCategoryService';

export interface FilterState {
  catalogueId: number | null;
  categoryId: number | null;
  subCategorySelections: number[];
}

export interface UseBrowseFiltersReturn {
  // Data
  catalogues: Catalogue[];
  categories: Category[];
  availableFilters: SubCategoryFilter[];

  // Filter state
  filters: FilterState;

  // Dropdown visibility state
  isDropdownOpen: boolean;

  // Actions
  setCatalogueId: (id: number | null) => void;
  setCategoryId: (id: number | null) => void;
  toggleSubCategoryOption: (optionId: number) => void;
  clearFilters: () => void;
  toggleDropdown: (catalogueId?: number) => void;
  closeDropdown: () => void;

  // Loading states
  loadingCatalogues: boolean;
  loadingCategories: boolean;
  loadingFilters: boolean;

  // Helpers
  hasActiveFilters: boolean;
  selectedCatalogue: Catalogue | null;
  selectedCategory: Category | null;
}

export const useBrowseFilters = (): UseBrowseFiltersReturn => {
  // Data state
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allFilters, setAllFilters] = useState<SubCategoryFilter[]>([]);
  const [categoryFilterIds, setCategoryFilterIds] = useState<number[]>([]);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    catalogueId: null,
    categoryId: null,
    subCategorySelections: [],
  });

  // Dropdown visibility state (separate from filter state)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Loading states
  const [loadingCatalogues, setLoadingCatalogues] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Load catalogues on mount
  useEffect(() => {
    const loadCatalogues = async () => {
      try {
        setLoadingCatalogues(true);
        const data = await getCatalogues();
        setCatalogues(data.filter(c => c.isActive));
      } catch (error) {
        console.error('Failed to load catalogues:', error);
      } finally {
        setLoadingCatalogues(false);
      }
    };
    loadCatalogues();
  }, []);

  // Load all filters on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const data = await getSubCategoryFilters();
        setAllFilters(data.filter(f => f.isActive));
      } catch (error) {
        console.error('Failed to load filters:', error);
      }
    };
    loadFilters();
  }, []);

  // Load categories when catalogue changes
  useEffect(() => {
    if (!filters.catalogueId) {
      setCategories([]);
      return;
    }

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await getCategoriesByCatalogue(filters.catalogueId!);
        setCategories(data.filter(c => c.isActive));
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, [filters.catalogueId]);

  // Load category-specific filters when category changes
  useEffect(() => {
    if (!filters.categoryId) {
      setCategoryFilterIds([]);
      return;
    }

    const loadCategoryFilters = async () => {
      try {
        setLoadingFilters(true);
        const data = await getCategoryFilters(filters.categoryId!);
        setCategoryFilterIds(data.map((f: any) => f.filterId || f.id));
      } catch (error) {
        console.error('Failed to load category filters:', error);
      } finally {
        setLoadingFilters(false);
      }
    };
    loadCategoryFilters();
  }, [filters.categoryId]);

  // Filter available sub-category filters based on selected category
  const availableFilters = useMemo(() => {
    if (!filters.categoryId || categoryFilterIds.length === 0) {
      return [];
    }
    return allFilters.filter(f => categoryFilterIds.includes(f.id));
  }, [allFilters, categoryFilterIds, filters.categoryId]);

  // Actions
  const setCatalogueId = useCallback((id: number | null) => {
    setFilters(prev => ({
      ...prev,
      catalogueId: id,
      categoryId: null, // Reset category when catalogue changes
      subCategorySelections: [], // Reset sub-category selections
    }));
    // Open dropdown when selecting a catalogue
    if (id !== null) {
      setIsDropdownOpen(true);
    }
  }, []);

  const setCategoryId = useCallback((id: number | null) => {
    setFilters(prev => ({
      ...prev,
      categoryId: id,
      subCategorySelections: [], // Reset sub-category selections when category changes
    }));
  }, []);

  const toggleSubCategoryOption = useCallback((optionId: number) => {
    setFilters(prev => ({
      ...prev,
      subCategorySelections: prev.subCategorySelections.includes(optionId)
        ? prev.subCategorySelections.filter(id => id !== optionId)
        : [...prev.subCategorySelections, optionId],
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      catalogueId: null,
      categoryId: null,
      subCategorySelections: [],
    });
    setIsDropdownOpen(false);
  }, []);

  // Toggle dropdown for a specific catalogue
  const toggleDropdown = useCallback((catalogueId?: number) => {
    if (catalogueId !== undefined) {
      // If clicking a different catalogue, switch to it and open
      if (filters.catalogueId !== catalogueId) {
        setFilters(prev => ({
          ...prev,
          catalogueId: catalogueId,
          categoryId: null,
          subCategorySelections: [],
        }));
        setIsDropdownOpen(true);
      } else {
        // If clicking the same catalogue, toggle dropdown
        setIsDropdownOpen(prev => !prev);
      }
    } else {
      setIsDropdownOpen(prev => !prev);
    }
  }, [filters.catalogueId]);

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  // Helpers
  const hasActiveFilters = filters.catalogueId !== null ||
    filters.categoryId !== null ||
    filters.subCategorySelections.length > 0;

  const selectedCatalogue = catalogues.find(c => c.id === filters.catalogueId) || null;
  const selectedCategory = categories.find(c => c.id === filters.categoryId) || null;

  return {
    catalogues,
    categories,
    availableFilters,
    filters,
    isDropdownOpen,
    setCatalogueId,
    setCategoryId,
    toggleSubCategoryOption,
    clearFilters,
    toggleDropdown,
    closeDropdown,
    loadingCatalogues,
    loadingCategories,
    loadingFilters,
    hasActiveFilters,
    selectedCatalogue,
    selectedCategory,
  };
};
