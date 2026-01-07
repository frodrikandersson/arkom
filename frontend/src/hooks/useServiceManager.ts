import { useState, useCallback, useEffect } from 'react';
import * as serviceCategoryApi from '../services/serviceCategoryService';
import { ServiceCategory } from '../models';


export const useServiceManager = (userId: string) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([
    { id: 'other', name: 'Other', sortOrder: 0 }
  ]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [loading, setLoading] = useState(false);

  // Load categories from backend
  const loadCategories = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const fetchedCategories = await serviceCategoryApi.getCategories();
      setCategories([
        { id: 'other', name: 'Other', sortOrder: 0 },
        ...fetchedCategories
      ]);
    } catch (error) {
      console.error('Failed to load categories:', error);
      alert('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreateCategoryModal = useCallback(() => {
    setEditingCategory(null);
    setShowCategoryModal(true);
  }, []);

  const closeCategoryModal = useCallback(() => {
    setShowCategoryModal(false);
    setEditingCategory(null);
  }, []);

  const saveCategory = useCallback(async (name: string) => {
    try {
      if (editingCategory && editingCategory.id !== 'other') {
        // Update existing category
        const updated = await serviceCategoryApi.updateCategory(editingCategory.id as number, { name });
        setCategories(prev =>
          prev.map(cat =>
            cat.id === editingCategory.id ? updated : cat
          )
        );
      } else {
        // Create new category
        const newCategory = await serviceCategoryApi.createCategory({
          name,
          sortOrder: categories.length
        });
        setCategories(prev => [...prev, newCategory]);
      }
      closeCategoryModal();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      alert(error.message || 'Failed to save category');
      throw error;
    }
  }, [editingCategory, categories.length, closeCategoryModal]);

  const editCategory = useCallback((categoryId: string | number) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      setEditingCategory(category);
      setShowCategoryModal(true);
    }
  }, [categories]);

  const deleteCategory = useCallback(async (categoryId: string | number) => {
    if (categoryId === 'other') return; // Can't delete default category
    
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await serviceCategoryApi.deleteCategory(categoryId as number);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      alert(error.message || 'Failed to delete category');
      throw error;
    }
  }, []);

  const handleDragStart = useCallback((index: number) => {
    if (categories[index].id === 'other') return; // Can't drag default category
    setDraggedIndex(index);
  }, [categories]);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    if (categories[index].id === 'other') return; // Can't reorder over default

    const newCategories = [...categories];
    const draggedItem = newCategories[draggedIndex];
    newCategories.splice(draggedIndex, 1);
    newCategories.splice(index, 0, draggedItem);

    setCategories(newCategories.map((cat, idx) => ({ ...cat, sortOrder: idx })));
    setDraggedIndex(index);
  }, [draggedIndex, categories]);

  const handleDragEnd = useCallback(async () => {
    setDraggedIndex(null);
    
    // Save new sort order to backend
    try {
      const updates = categories
        .filter(cat => cat.id !== 'other' && typeof cat.id === 'number')
        .map((cat, idx) => ({
          id: cat.id as number,
          sortOrder: idx + 1 // +1 because 'other' is at 0
        }));
      
      if (updates.length > 0) {
        await serviceCategoryApi.updateCategorySortOrder(updates);
      }
    } catch (error) {
      console.error('Failed to update sort order:', error);
      // Reload to get correct order from server
      await loadCategories();
    }
  }, [categories, loadCategories]);

  return {
    categories,
    loading,
    showCategoryModal,
    editingCategory,
    draggedIndex,
    openCreateCategoryModal,
    closeCategoryModal,
    saveCategory,
    editCategory,
    deleteCategory,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};
