import { useState, useEffect } from 'react';
import * as searchCategoryApi from '../../services/searchCategoryService';
import { Catalogue, Category, SearchCategoryData, SubCategoryFilter } from '../../models';
import styles from './SearchCategoryModal.module.css';

interface SearchCategoryModalProps {
  onClose: () => void;
  onSave: (data: SearchCategoryData) => void;
  initialData?: SearchCategoryData;
}

export const SearchCategoryModal = ({ onClose, onSave, initialData }: SearchCategoryModalProps) => {
  const [isDiscoverable, setIsDiscoverable] = useState(initialData?.isDiscoverable ?? true);
  const [catalogueId, setCatalogueId] = useState<number | null>(initialData?.catalogueId ?? null);
  const [categoryId, setCategoryId] = useState<number | null>(initialData?.categoryId ?? null);
  const [subCategorySelections, setSubCategorySelections] = useState<number[]>(initialData?.subCategorySelections ?? []);

  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<SubCategoryFilter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (catalogueId) {
      loadCategories(catalogueId);
    } else {
      setCategories([]);
      setCategoryId(null);
    }
  }, [catalogueId]);

  useEffect(() => {
    if (categoryId) {
      loadSubCategoryFilters(categoryId);
    } else {
      setFilters([]);
      setSubCategorySelections([]);
    }
  }, [categoryId]);

  const loadData = async () => {
    try {
      const cataloguesData = await searchCategoryApi.getCatalogues();
      setCatalogues(cataloguesData);

      // If initial data has catalogueId, load its categories
      if (initialData?.catalogueId) {
        const categoriesData = await searchCategoryApi.getCategoriesByCatalogue(initialData.catalogueId);
        setCategories(categoriesData);
      }

      // If initial data has categoryId, load its filters
      if (initialData?.categoryId) {
        const filtersData = await searchCategoryApi.getCategoryFilters(initialData.categoryId);
        setFilters(filtersData);
      }
    } catch (error) {
      console.error('Failed to load search category data:', error);
      alert('Failed to load search categories');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async (catalogueId: number) => {
    try {
      const categoriesData = await searchCategoryApi.getCategoriesByCatalogue(catalogueId);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadSubCategoryFilters = async (categoryId: number) => {
    try {
      const filtersData = await searchCategoryApi.getCategoryFilters(categoryId);
      setFilters(filtersData);
    } catch (error) {
      console.error('Failed to load subcategory filters:', error);
    }
  };

  const handleSave = () => {
    if (!catalogueId || !categoryId) {
      alert('Please select both catalogue and category');
      return;
    }

    onSave({
      isDiscoverable,
      catalogueId,
      categoryId,
      subCategorySelections,
    });
  };

  const toggleSubCategoryOption = (optionId: number) => {
    setSubCategorySelections(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  if (loading) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
          <h2 className={styles.title}>Choose search category</h2>
          <button className={styles.saveBtn} onClick={handleSave}>
            Save
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Discoverable toggle */}
          <div className={styles.row}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={isDiscoverable}
                onChange={(e) => setIsDiscoverable(e.target.checked)}
                className={styles.checkbox}
              />
              <span>{isDiscoverable ? 'Discoverable in marketplace' : 'Hidden in marketplace'}</span>
            </label>
          </div>

          {/* Catalogue dropdown */}
          <div className={styles.row}>
            <label className={styles.label}>Choose Main Catalogue/category</label>
            <select
              value={catalogueId ?? ''}
              onChange={(e) => setCatalogueId(e.target.value ? parseInt(e.target.value) : null)}
              className={styles.select}
            >
              <option value="">Select catalogue...</option>
              {catalogues.map((catalogue) => (
                <option key={catalogue.id} value={catalogue.id}>
                  {catalogue.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category dropdown */}
          {catalogueId && (
            <div className={styles.row}>
              <label className={styles.label}>Choose category</label>
              <select
                value={categoryId ?? ''}
                onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                className={styles.select}
              >
                <option value="">Select category...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sub-category filters */}
          {categoryId && filters.length > 0 && (
            <div className={styles.filtersSection}>
              <h3 className={styles.filtersTitle}>Sub-category filters</h3>
              {filters.map((filter) => (
                <div key={filter.id} className={styles.filterGroup}>
                  <label className={styles.filterLabel}>{filter.name}</label>
                  <div className={styles.filterOptions}>
                    {filter.options.map((option) => (
                      <label key={option.id} className={styles.optionLabel}>
                        <input
                          type="checkbox"
                          checked={subCategorySelections.includes(option.id)}
                          onChange={() => toggleSubCategoryOption(option.id)}
                          className={styles.checkbox}
                        />
                        <span>{option.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
