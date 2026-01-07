import { useState, useEffect, useMemo } from 'react';
import { getServicesByType, ServiceWithOwner } from '../services/serviceService';
import { ServiceViewModal } from '../components/modals/ServiceViewModal';
import { BrowseFilters } from '../components/browse/BrowseFilters';
import { useBrowseFilters } from '../hooks/useBrowseFilters';
import styles from './BrowsePage.module.css';

export const StorePage = () => {
  const [services, setServices] = useState<ServiceWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceWithOwner | null>(null);

  const {
    catalogues,
    categories,
    availableFilters,
    filters,
    isDropdownOpen,
    setCategoryId,
    toggleSubCategoryOption,
    clearFilters,
    toggleDropdown,
    closeDropdown,
    hasActiveFilters,
    loadingCategories,
    loadingFilters,
  } = useBrowseFilters();

  useEffect(() => {
    const loadServices = async () => {
      try {
        const { services: fetchedServices } = await getServicesByType('instant_order');
        setServices(fetchedServices);
      } catch (err) {
        console.error('Failed to load store items:', err);
        setError('Failed to load store items');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // Filter services based on selected filters
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const searchData = service.searchCategoryData;

      // If no filters are active, show all discoverable services
      if (!hasActiveFilters) {
        return searchData?.isDiscoverable !== false;
      }

      // Must be discoverable
      if (searchData?.isDiscoverable === false) {
        return false;
      }

      // Filter by catalogue
      if (filters.catalogueId && searchData?.catalogueId !== filters.catalogueId) {
        return false;
      }

      // Filter by category
      if (filters.categoryId && searchData?.categoryId !== filters.categoryId) {
        return false;
      }

      // Filter by sub-category options (if any selected, service must have at least one)
      if (filters.subCategorySelections.length > 0) {
        const serviceSelections = searchData?.subCategorySelections || [];
        const hasMatchingOption = filters.subCategorySelections.some(
          optionId => serviceSelections.includes(optionId)
        );
        if (!hasMatchingOption) {
          return false;
        }
      }

      return true;
    });
  }, [services, filters, hasActiveFilters]);

  const handleServiceClick = (service: ServiceWithOwner) => {
    setSelectedService(service);
  };

  const handleCloseModal = () => {
    setSelectedService(null);
  };

  const handleRequestService = () => {
    // TODO: Implement instant order flow
    console.log('Order service:', selectedService?.id);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading store...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Store</h1>
        <p className={styles.subtitle}>Ready-made items, instant delivery</p>
      </div>

      <BrowseFilters
        catalogues={catalogues}
        categories={categories}
        availableFilters={availableFilters}
        filters={filters}
        isDropdownOpen={isDropdownOpen}
        onCategoryChange={setCategoryId}
        onToggleOption={toggleSubCategoryOption}
        onClearFilters={clearFilters}
        onToggleDropdown={toggleDropdown}
        onCloseDropdown={closeDropdown}
        hasActiveFilters={hasActiveFilters}
        loadingCategories={loadingCategories}
        loadingFilters={loadingFilters}
      />

      {filteredServices.length === 0 ? (
        <div className={styles.empty}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <p>
            {hasActiveFilters
              ? 'No store items match your filters'
              : 'No store items available at the moment'}
          </p>
          {hasActiveFilters && (
            <button className={styles.clearFiltersButton} onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={styles.serviceCard}
              onClick={() => handleServiceClick(service)}
            >
              <div className={styles.thumbnail}>
                {service.media && service.media.length > 0 ? (
                  <img
                    src={service.media[0].fileUrl || service.media[0].thumbnailUrl || ''}
                    alt={service.title}
                  />
                ) : (
                  <div className={styles.placeholderThumbnail}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className={styles.cardContent}>
                <div className={styles.ownerInfo}>
                  <div className={styles.ownerAvatar}>
                    {service.shopOwner.profileImageUrl ? (
                      <img src={service.shopOwner.profileImageUrl} alt={service.shopOwner.displayName} />
                    ) : (
                      <span>{service.shopOwner.displayName?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <span className={styles.ownerName}>@{service.shopOwner.username}</span>
                </div>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <p className={styles.price}>
                  <span>€{(service.fixedPrice / 100).toFixed(2)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedService && (
        <ServiceViewModal
          service={selectedService}
          shopOwner={selectedService.shopOwner}
          onClose={handleCloseModal}
          onRequestService={handleRequestService}
        />
      )}
    </div>
  );
};
