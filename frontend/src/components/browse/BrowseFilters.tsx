import { useRef, useEffect } from 'react';
import { Catalogue, Category, SubCategoryFilter } from '../../models';
import { FilterState } from '../../hooks/useBrowseFilters';
import styles from './BrowseFilters.module.css';

interface BrowseFiltersProps {
  catalogues: Catalogue[];
  categories: Category[];
  availableFilters: SubCategoryFilter[];
  filters: FilterState;
  isDropdownOpen: boolean;
  onCategoryChange: (id: number | null) => void;
  onToggleOption: (optionId: number) => void;
  onClearFilters: () => void;
  onToggleDropdown: (catalogueId?: number) => void;
  onCloseDropdown: () => void;
  hasActiveFilters: boolean;
  loadingCategories?: boolean;
  loadingFilters?: boolean;
}

export const BrowseFilters = ({
  catalogues,
  categories,
  availableFilters,
  filters,
  isDropdownOpen,
  onCategoryChange,
  onToggleOption,
  onClearFilters,
  onToggleDropdown,
  onCloseDropdown,
  hasActiveFilters,
  loadingCategories,
  loadingFilters,
}: BrowseFiltersProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const catalogueRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Calculate dropdown arrow position
  useEffect(() => {
    if (filters.catalogueId && isDropdownOpen && dropdownRef.current) {
      const catalogueButton = catalogueRefs.current.get(filters.catalogueId);
      if (catalogueButton) {
        const buttonRect = catalogueButton.getBoundingClientRect();
        const containerRect = dropdownRef.current.parentElement?.getBoundingClientRect();
        if (containerRect) {
          const arrowLeft = buttonRect.left - containerRect.left + buttonRect.width / 2;
          dropdownRef.current.style.setProperty('--arrow-left', `${arrowLeft}px`);
        }
      }
    }
  }, [filters.catalogueId, isDropdownOpen]);

  const selectedCatalogue = catalogues.find(c => c.id === filters.catalogueId);
  const selectedCategory = categories.find(c => c.id === filters.categoryId);

  return (
    <div className={styles.container}>
      {/* Catalogue Cards */}
      <div className={styles.catalogueGrid}>
        {catalogues.map(catalogue => (
          <button
            key={catalogue.id}
            ref={(el) => {
              if (el) catalogueRefs.current.set(catalogue.id, el);
            }}
            className={`${styles.catalogueCard} ${filters.catalogueId === catalogue.id ? styles.active : ''}`}
            onClick={() => onToggleDropdown(catalogue.id)}
          >
            <span className={styles.catalogueName}>{catalogue.name}</span>
            <svg
              className={`${styles.catalogueArrow} ${filters.catalogueId === catalogue.id && isDropdownOpen ? styles.rotated : ''}`}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        ))}
      </div>

      {/* Expandable Dropdown */}
      {filters.catalogueId && isDropdownOpen && (
        <div className={styles.dropdown} ref={dropdownRef}>
          <div className={styles.dropdownArrow} />

          {/* Dropdown Header */}
          <div className={styles.dropdownHeader}>
            <h3 className={styles.dropdownTitle}>
              {selectedCatalogue?.name}
              {selectedCategory && (
                <span className={styles.breadcrumb}> / {selectedCategory.name}</span>
              )}
            </h3>
            {hasActiveFilters && (
              <button className={styles.clearButton} onClick={onClearFilters}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Clear all
              </button>
            )}
          </div>

          {/* Categories */}
          <div className={styles.categorySection}>
            {loadingCategories ? (
              <div className={styles.loadingText}>Loading categories...</div>
            ) : categories.length > 0 ? (
              <div className={styles.categoryGrid}>
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`${styles.categoryCard} ${filters.categoryId === category.id ? styles.active : ''}`}
                    onClick={() => onCategoryChange(filters.categoryId === category.id ? null : category.id)}
                  >
                    <span className={styles.categoryName}>{category.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.emptyText}>No categories in this catalogue</div>
            )}
          </div>

          {/* Sub-category Filters */}
          {filters.categoryId && (
            <div className={styles.subCategorySection}>
              {loadingFilters ? (
                <div className={styles.loadingText}>Loading filters...</div>
              ) : availableFilters.length > 0 ? (
                <div className={styles.subCategoryGrid}>
                  {availableFilters.map(filter => (
                    <div key={filter.id} className={styles.filterBlock}>
                      <h4 className={styles.filterTitle}>{filter.name}</h4>
                      <div className={styles.optionGrid}>
                        {filter.options
                          .filter(opt => opt.isActive)
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map(option => (
                            <button
                              key={option.id}
                              className={`${styles.optionButton} ${
                                filters.subCategorySelections.includes(option.id) ? styles.selected : ''
                              }`}
                              onClick={() => onToggleOption(option.id)}
                            >
                              <span className={styles.optionCheckbox}>
                                {filters.subCategorySelections.includes(option.id) && (
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                )}
                              </span>
                              {option.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyText}>No filters available for this category</div>
              )}
            </div>
          )}

          {/* Hide Dropdown Button */}
          <button
            className={styles.hideButton}
            onClick={onCloseDropdown}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
            Hide filters
          </button>
        </div>
      )}

      {/* Divider */}
      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        {hasActiveFilters && (
          <span className={styles.dividerText}>
            Filtering by: {selectedCatalogue?.name}
            {selectedCategory && ` / ${selectedCategory.name}`}
            {filters.subCategorySelections.length > 0 && ` (+${filters.subCategorySelections.length} options)`}
          </span>
        )}
        <div className={styles.dividerLine} />
      </div>
    </div>
  );
};
