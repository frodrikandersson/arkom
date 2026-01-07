import { useState, useEffect, DragEvent } from 'react';
import * as searchCategoryApi from '../../services/searchCategoryService';
import { Catalogue, Category, SubCategoryFilter } from '../../models';
import styles from './AdminManager.module.css';

export const CategoryManager = () => {
    const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
    const [selectedCatalogueId, setSelectedCatalogueId] = useState<number | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [allFilters, setAllFilters] = useState<SubCategoryFilter[]>([]);
    const [categoryFilters, setCategoryFilters] = useState<Map<number, any[]>>(new Map());
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);

    useEffect(() => {
        loadCatalogues();
        loadAllFilters();
    }, []);

    useEffect(() => {
        if (selectedCatalogueId) {
            loadCategories(selectedCatalogueId);
        }
    }, [selectedCatalogueId]);

    const loadCatalogues = async () => {
        try {
            const data = await searchCategoryApi.getCatalogues();
            setCatalogues(data);
            if (data.length > 0) {
                setSelectedCatalogueId(data[0].id);
            }
        } catch (error) {
            console.error('Failed to load catalogues:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAllFilters = async () => {
        try {
            const data = await searchCategoryApi.getSubCategoryFilters();
            setAllFilters(data);
        } catch (error) {
            console.error('Failed to load filters:', error);
        }
    };

    const loadCategories = async (catalogueId: number) => {
        try {
            const data = await searchCategoryApi.getCategoriesByCatalogue(catalogueId);
            setCategories(data);
            
            // Load filters for each category
            const filtersMap = new Map();
            for (const category of data) {
                const filters = await searchCategoryApi.getCategoryFilters(category.id);
                filtersMap.set(category.id, filters);
            }
            setCategoryFilters(filtersMap);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const handleToggleExpand = (categoryId: number) => {
        setExpandedCategoryId(expandedCategoryId === categoryId ? null : categoryId);
    };

    const handleAssignFilter = async (categoryId: number, filterId: number) => {
        try {
            await searchCategoryApi.assignFilterToCategory(categoryId, filterId);
            const filters = await searchCategoryApi.getCategoryFilters(categoryId);
            setCategoryFilters(new Map(categoryFilters.set(categoryId, filters)));
        } catch (error) {
            console.error('Failed to assign filter:', error);
            alert('Failed to assign filter. It may already be assigned.');
        }
    };

    const handleRemoveFilter = async (categoryId: number, filterId: number) => {
        if (!confirm('Remove this filter from the category?')) {
            return;
        }
        try {
            await searchCategoryApi.removeFilterFromCategory(categoryId, filterId);
            const filters = await searchCategoryApi.getCategoryFilters(categoryId);
            setCategoryFilters(new Map(categoryFilters.set(categoryId, filters)));
        } catch (error) {
            console.error('Failed to remove filter:', error);
            alert('Failed to remove filter');
        }
    };

    const handleEdit = (category: Category) => {
        setEditingId(category.id);
        setEditName(category.name);
    };

    const handleSave = async (id: number) => {
        try {
            await searchCategoryApi.updateCategory(id, { name: editName });
            setEditingId(null);
            if (selectedCatalogueId) {
                await loadCategories(selectedCatalogueId);
            }
        } catch (error) {
            console.error('Failed to update category:', error);
            alert('Failed to update category');
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }
        try {
            await searchCategoryApi.deleteCategory(id);
            if (selectedCatalogueId) {
                await loadCategories(selectedCatalogueId);
            }
        } catch (error) {
            console.error('Failed to delete category:', error);
            alert('Failed to delete category');
        }
    };

    const handleCreate = async () => {
        if (!newName.trim()) {
            alert('Please enter a category name');
            return;
        }
        if (!selectedCatalogueId) {
            alert('Please select a catalogue');
            return;
        }
        try {
            await searchCategoryApi.createCategory({ 
                catalogueId: selectedCatalogueId,
                name: newName, 
                sortOrder: categories.length 
            });
            setCreating(false);
            setNewName('');
            await loadCategories(selectedCatalogueId);
        } catch (error) {
            console.error('Failed to create category:', error);
            alert('Failed to create category');
        }
    };

    const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            return;
        }

        const newCategories = [...categories];
        const draggedItem = newCategories[draggedIndex];

        newCategories.splice(draggedIndex, 1);
        newCategories.splice(dropIndex, 0, draggedItem);

        // Optimistically update UI
        setCategories(newCategories);
        setDraggedIndex(null);

        // Update sort orders on backend sequentially to avoid auth issues
        try {
            for (let index = 0; index < newCategories.length; index++) {
                const cat = newCategories[index];
                if (cat.sortOrder !== index) {
                    await searchCategoryApi.updateCategory(cat.id, { sortOrder: index });
                }
            }
        } catch (error) {
            console.error('Failed to update sort order:', error);
            alert('Failed to update sort order. Reloading...');
            if (selectedCatalogueId) {
                await loadCategories(selectedCatalogueId);
            }
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading categories...</div>;
    }

    return (
        <div className={styles.manager}>
            <h2 className={styles.title}>Categories</h2>
            
            <select
                value={selectedCatalogueId || ''}
                onChange={(e) => setSelectedCatalogueId(parseInt(e.target.value))}
                className={styles.select}
            >
                <option value="">Select catalogue...</option>
                {catalogues.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                        {cat.name}
                    </option>
                ))}
            </select>

            {selectedCatalogueId && (
                <>
                    <div className={styles.addCategoryRow}>
                        <button 
                            onClick={() => setCreating(true)} 
                            className={styles.addBtn}
                            disabled={creating}
                        >
                            + Add Category
                        </button>
                    </div>

                    {creating && (
                        <div className={`${styles.item} ${styles.categoryContainer}`}>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Enter category name"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                className={styles.input}
                                autoFocus
                            />
                            <div className={styles.actions}>
                                <button onClick={handleCreate} className={styles.saveBtn}>
                                    Save
                                </button>
                                <button 
                                    onClick={() => { setCreating(false); setNewName(''); }} 
                                    className={styles.cancelBtn}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className={styles.list}>
                        {categories.map((category, index) => {
                            const assignedFilters = categoryFilters.get(category.id) || [];
                            const assignedFilterIds = new Set(assignedFilters.map((f: any) => f.id));
                            const availableFilters = allFilters.filter(f => !assignedFilterIds.has(f.id));
                            const isExpanded = expandedCategoryId === category.id;
                            const isDraggable = editingId !== category.id && !isExpanded;

                            return (
                                <div key={category.id} className={styles.categoryContainer}>
                                    <div
                                        className={`${styles.item} ${isDraggable ? styles.itemDraggable : styles.itemNoDrag}`}
                                        draggable={isDraggable}
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, index)}
                                    >
                                        {editingId === category.id ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSave(category.id)}
                                                    className={styles.input}
                                                    autoFocus
                                                />
                                                <div className={styles.actions}>
                                                    <button onClick={() => handleSave(category.id)} className={styles.saveBtn}>
                                                        Save
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className={styles.cancelBtn}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className={styles.categoryNameWrapper}>
                                                    <span className={styles.name}>{category.name}</span>
                                                    <button
                                                        onClick={() => handleToggleExpand(category.id)}
                                                        className={styles.expandButton}
                                                    >
                                                        {isExpanded ? '▼' : '▶'} Filters ({assignedFilters.length})
                                                    </button>
                                                </div>
                                                <div className={styles.actions}>
                                                    <button onClick={() => handleEdit(category)} className={styles.editBtn}>
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(category.id, category.name)} className={styles.deleteBtn}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {isExpanded && (
                                        <div className={styles.filtersPanel}>
                                            <h4 className={styles.filtersSectionTitle}>
                                                Assigned Filters:
                                            </h4>
                                            {assignedFilters.length === 0 ? (
                                                <div className={styles.filtersEmpty}>
                                                    No filters assigned yet
                                                </div>
                                            ) : (
                                                <div className={styles.assignedFiltersGrid}>
                                                    {assignedFilters.map((filter: any) => (
                                                        <div key={filter.id} className={styles.assignedFilterTag}>
                                                            {filter.name}
                                                            <button
                                                                onClick={() => handleRemoveFilter(category.id, filter.id)}
                                                                className={styles.removeFilterButton}
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <h4 className={styles.filtersSectionTitle}>
                                                Available Filters:
                                            </h4>
                                            {availableFilters.length === 0 ? (
                                                <div className={styles.filtersEmpty}>
                                                    All filters have been assigned
                                                </div>
                                            ) : (
                                                <div className={styles.availableFiltersGrid}>
                                                    {availableFilters.map((filter) => (
                                                        <button
                                                            key={filter.id}
                                                            onClick={() => handleAssignFilter(category.id, filter.id)}
                                                            className={styles.availableFilterButton}
                                                        >
                                                            + {filter.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};
