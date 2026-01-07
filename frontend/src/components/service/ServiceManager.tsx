import { useAuth } from '../../contexts/AuthContext';
import { CategoryModal } from '../modals/CategoryModal';
import { ServiceModal } from '../modals/ServiceModal';
import { useServiceManager } from '../../hooks/useServiceManager';
import { createService, uploadServiceMedia, getSensitiveContentTypeIds, getUserServices, updateService, deleteService } from '../../services/serviceService';
import styles from './ServiceManager.module.css';
import { useState, useEffect, useCallback } from 'react';
import { Service } from '../../models';

export const ServiceManager = () => {
  const { user } = useAuth();
  const {
    categories,
    loading,
    showCategoryModal,
    editingCategory,
    openCreateCategoryModal,
    closeCategoryModal,
    saveCategory,
    editCategory,
    deleteCategory,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useServiceManager(user?.id || '');

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | number | undefined>(undefined);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Load services
  const loadServices = useCallback(async () => {
    if (!user?.id) return;

    setLoadingServices(true);
    try {
      const { services: fetchedServices } = await getUserServices();
      setServices(fetchedServices);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoadingServices(false);
    }
  }, [user?.id]);

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleCreateService = (categoryId?: string | number) => {
    setSelectedCategoryId(categoryId);
    setEditingService(null);
    setShowServiceModal(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setSelectedCategoryId(service.categoryId ?? undefined);
    setShowServiceModal(true);
  };

  const handleStatusChange = async (serviceId: number, newStatus: string) => {
    try {
      await updateService(serviceId, { status: newStatus });
      // Update local state
      setServices(prev => prev.map(s =>
        s.id === serviceId ? { ...s, status: newStatus } : s
      ));
    } catch (error) {
      console.error('Failed to update service status:', error);
    }
  };

  const handleSaveService = async (serviceData: any) => {
    if (!user?.id) return;

    try {
      // Extract media items before sending
      const { mediaItems, ...serviceInfo } = serviceData;

      let serviceId: number;

      if (editingService) {
        // Update existing service
        await updateService(editingService.id, serviceInfo);
        serviceId = editingService.id;
      } else {
        // Create new service
        const { service } = await createService(serviceInfo);
        serviceId = service.id;
      }

      // Only upload NEW media items (those without existingMediaId)
      if (mediaItems && mediaItems.length > 0) {
        const newMediaItems = mediaItems.filter((item: any) => !item.existingMediaId);

        for (const mediaItem of newMediaItems) {
          const sensitiveContentTypeIds = mediaItem.hasSensitiveContent && mediaItem.sensitiveContentTypes
            ? await getSensitiveContentTypeIds(mediaItem.sensitiveContentTypes)
            : [];

          await uploadServiceMedia(serviceId, mediaItem, sensitiveContentTypeIds);
        }
      }

      alert(editingService ? 'Service updated successfully!' : 'Service created successfully!');
      setShowServiceModal(false);
      setEditingService(null);
      // Refresh services list
      await loadServices();
    } catch (error: any) {
      console.error('Error saving service:', error);
      alert(error.response?.data?.message || 'Failed to save service');
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading categories...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header with action buttons */}
      <div className={styles.header}>
        <div className={styles.actions}>
          <button 
            onClick={openCreateCategoryModal}
            className={styles.categoryButton}
          >
            + Category
          </button>
          <button 
            onClick={() => handleCreateService()}
            className={styles.serviceButton}
          >
            + Service
          </button>
        </div>
      </div>

      {/* Categories list */}
      <div className={styles.categoriesList}>
        {categories.map((category, index) => (
          <div
            key={category.id}
            className={styles.categoryCard}
            draggable={category.id !== 'other'}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            {/* Category header */}
            <div className={styles.categoryHeader}>
              <h3 className={styles.categoryName}>{category.name}</h3>
              
              <div className={styles.categoryControls}>
                {/* Edit button */}
                {category.id !== 'other' && (
                  <button
                    onClick={() => editCategory(category.id)}
                    className={styles.iconButton}
                    title="Edit category"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                )}

                {/* Add service button */}
                <button
                  onClick={() => handleCreateService(category.id)}
                  className={styles.addServiceButton}
                >
                  + Service
                </button>

                {/* Delete button */}
                {category.id !== 'other' && (
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className={styles.iconButton}
                    title="Delete category"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}

                {/* Drag handle */}
                {category.id !== 'other' && (
                  <div className={styles.dragHandle} title="Drag to reorder">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Services will be listed here */}
            <div className={styles.servicesContainer}>
              {loadingServices ? (
                <p className={styles.emptyState}>Loading services...</p>
              ) : services.filter(s => s.categoryId === category.id || (s.categoryId === null && category.id === 'other')).length > 0 ? (
                services
                  .filter(s => s.categoryId === category.id || (s.categoryId === null && category.id === 'other'))
                  .map((service) => (
                    <div
                      key={service.id}
                      className={styles.serviceCard}
                      draggable
                      onDragStart={() => {/* TODO: handle drag */}}
                      onClick={() => handleEditService(service)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Service thumbnail */}
                      <div className={styles.serviceThumbnail}>
                        {service.media && service.media.length > 0 ? (
                          <img
                            src={service.media[0].fileUrl || service.media[0].thumbnailUrl || ''}
                            alt={service.title}
                            className={styles.thumbnailImage}
                          />
                        ) : (
                          <div className={styles.placeholderThumbnail}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Service title */}
                      <h4 className={styles.serviceName}>{service.title}</h4>

                      {/* Service price */}
                      <div className={styles.servicePrice}>
                        From €{((service.requestingProcess === 'custom_proposal' ? service.basePrice : service.fixedPrice) / 100).toFixed(2)}
                      </div>

                      {/* Status dropdown */}
                      <select
                        className={styles.statusDropdown}
                        value={service.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(service.id, e.target.value)}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="WAITLIST">WAITLIST</option>
                        <option value="CLOSED">CLOSED</option>
                        <option value="UNLISTED">UNLISTED</option>
                        <option value="DRAFT">DRAFT</option>
                      </select>

                      {/* Copy link button */}
                      <button
                        className={styles.iconButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          const serviceUrl = `${window.location.origin}/service/${service.id}`;
                          navigator.clipboard.writeText(serviceUrl);
                          alert('Link copied to clipboard!');
                        }}
                        title="Copy service link"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                      </button>

                      {/* Delete button */}
                      <button
                        className={styles.iconButton}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this service?')) {
                            try {
                              await deleteService(service.id);
                              setServices(prev => prev.filter(s => s.id !== service.id));
                            } catch (error) {
                              console.error('Failed to delete service:', error);
                              alert('Failed to delete service');
                            }
                          }
                        }}
                        title="Delete service"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>

                      {/* Drag handle */}
                      <div className={styles.dragHandle} title="Drag to reorder">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="9" cy="5" r="1"/>
                          <circle cx="9" cy="12" r="1"/>
                          <circle cx="9" cy="19" r="1"/>
                          <circle cx="15" cy="5" r="1"/>
                          <circle cx="15" cy="12" r="1"/>
                          <circle cx="15" cy="19" r="1"/>
                        </svg>
                      </div>
                    </div>
                  ))
              ) : (
                <p className={styles.emptyState}>No services yet</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          onClose={closeCategoryModal}
          onSave={saveCategory}
          existingName={editingCategory?.name}
          title={editingCategory ? 'Edit Category' : 'Create Category'}
        />
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <ServiceModal
          onClose={() => {
            setShowServiceModal(false);
            setEditingService(null);
          }}
          onSave={handleSaveService}
          defaultCategoryId={selectedCategoryId}
          categories={categories}
          existingService={editingService}
        />
      )}
    </div>
  );
};
