// frontend/src/components/service/ServiceManager.tsx
import { useAuth } from '../../contexts/AuthContext';
import { CategoryModal } from '../modals/CategoryModal';
import { ServiceModal } from '../modals/ServiceModal';
import { useServiceManager } from '../../hooks/useServiceManager';
import styles from './ServiceManager.module.css';
import { useState } from 'react';

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

  const handleCreateService = (categoryId?: string | number) => {
    setSelectedCategoryId(categoryId);
    setShowServiceModal(true);
  };

  const handleSaveService = (serviceData: any) => {
    console.log('Save service:', serviceData);
    // TODO: Implement service save logic
    setShowServiceModal(false);
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
              <p className={styles.emptyState}>No services yet</p>
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
          onClose={() => setShowServiceModal(false)}
          onSave={handleSaveService}
          defaultCategoryId={selectedCategoryId}
          categories={categories}
        />
      )}
    </div>
  );
};
