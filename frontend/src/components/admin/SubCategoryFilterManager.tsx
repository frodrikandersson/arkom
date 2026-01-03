import { useState, useEffect, DragEvent } from 'react';
import * as searchCategoryApi from '../../services/searchCategoryService';
import { SubCategoryFilter, SubCategoryFilterOption } from '../../models';
import styles from './AdminManager.module.css';

export const SubCategoryFilterManager = () => {
  const [filters, setFilters] = useState<SubCategoryFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFilterId, setExpandedFilterId] = useState<number | null>(null);
  
  // Filter states
  const [editingFilterId, setEditingFilterId] = useState<number | null>(null);
  const [editFilterName, setEditFilterName] = useState('');
  const [creatingFilter, setCreatingFilter] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [draggedFilterIndex, setDraggedFilterIndex] = useState<number | null>(null);
  
  // Option states
  const [editingOptionId, setEditingOptionId] = useState<number | null>(null);
  const [editOptionName, setEditOptionName] = useState('');
  const [creatingOptionForFilter, setCreatingOptionForFilter] = useState<number | null>(null);
  const [newOptionName, setNewOptionName] = useState('');
  const [draggedOptionIndex, setDraggedOptionIndex] = useState<number | null>(null);

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const data = await searchCategoryApi.getSubCategoryFilters();
      setFilters(data);
    } catch (error) {
      console.error('Failed to load filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filterId: number) => {
    setExpandedFilterId(expandedFilterId === filterId ? null : filterId);
  };

  // Filter drag-drop handlers
  const handleFilterDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedFilterIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleFilterDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleFilterDrop = async (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();

    if (draggedFilterIndex === null || draggedFilterIndex === dropIndex) {
      setDraggedFilterIndex(null);
      return;
    }

    const newFilters = [...filters];
    const draggedItem = newFilters[draggedFilterIndex];

    newFilters.splice(draggedFilterIndex, 1);
    newFilters.splice(dropIndex, 0, draggedItem);

    setFilters(newFilters);
    setDraggedFilterIndex(null);

    try {
      for (let index = 0; index < newFilters.length; index++) {
        const filter = newFilters[index];
        if (filter.sortOrder !== index) {
          await searchCategoryApi.updateSubCategoryFilter(filter.id, { sortOrder: index });
        }
      }
    } catch (error) {
      console.error('Failed to update filter sort order:', error);
      alert('Failed to update sort order. Reloading...');
      await loadFilters();
    }
  };

  // Option drag-drop handlers
  const handleOptionDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedOptionIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation(); // Prevent triggering filter drag
  };

  const handleOptionDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleOptionDrop = async (e: DragEvent<HTMLDivElement>, dropIndex: number, filterId: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedOptionIndex === null || draggedOptionIndex === dropIndex) {
      setDraggedOptionIndex(null);
      return;
    }

    const filter = filters.find(f => f.id === filterId);
    if (!filter) return;

    const newOptions = [...filter.options];
    const draggedItem = newOptions[draggedOptionIndex];

    newOptions.splice(draggedOptionIndex, 1);
    newOptions.splice(dropIndex, 0, draggedItem);

    // Update local state
    const updatedFilters = filters.map(f => 
      f.id === filterId ? { ...f, options: newOptions } : f
    );
    setFilters(updatedFilters);
    setDraggedOptionIndex(null);

    try {
      for (let index = 0; index < newOptions.length; index++) {
        const option = newOptions[index];
        if (option.sortOrder !== index) {
          await searchCategoryApi.updateSubCategoryFilterOption(option.id, { sortOrder: index });
        }
      }
    } catch (error) {
      console.error('Failed to update option sort order:', error);
      alert('Failed to update sort order. Reloading...');
      await loadFilters();
    }
  };

  // Filter CRUD
  const handleEditFilter = (filter: SubCategoryFilter) => {
    setEditingFilterId(filter.id);
    setEditFilterName(filter.name);
  };

  const handleSaveFilter = async (id: number) => {
    try {
      await searchCategoryApi.updateSubCategoryFilter(id, { name: editFilterName });
      setEditingFilterId(null);
      await loadFilters();
    } catch (error) {
      console.error('Failed to update filter:', error);
      alert('Failed to update filter');
    }
  };

  const handleDeleteFilter = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all its options.`)) {
      return;
    }
    try {
      await searchCategoryApi.deleteSubCategoryFilter(id);
      await loadFilters();
    } catch (error) {
      console.error('Failed to delete filter:', error);
      alert('Failed to delete filter');
    }
  };

  const handleCreateFilter = async () => {
    if (!newFilterName.trim()) {
      alert('Please enter a filter name');
      return;
    }
    try {
      await searchCategoryApi.createSubCategoryFilter({ 
        name: newFilterName, 
        sortOrder: filters.length 
      });
      setCreatingFilter(false);
      setNewFilterName('');
      await loadFilters();
    } catch (error) {
      console.error('Failed to create filter:', error);
      alert('Failed to create filter');
    }
  };

  // Option CRUD
  const handleEditOption = (option: SubCategoryFilterOption) => {
    setEditingOptionId(option.id);
    setEditOptionName(option.name);
  };

  const handleSaveOption = async (id: number) => {
    try {
      await searchCategoryApi.updateSubCategoryFilterOption(id, { name: editOptionName });
      setEditingOptionId(null);
      await loadFilters();
    } catch (error) {
      console.error('Failed to update option:', error);
      alert('Failed to update option');
    }
  };

  const handleDeleteOption = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    try {
      await searchCategoryApi.deleteSubCategoryFilterOption(id);
      await loadFilters();
    } catch (error) {
      console.error('Failed to delete option:', error);
      alert('Failed to delete option');
    }
  };

  const handleCreateOption = async (filterId: number) => {
    if (!newOptionName.trim()) {
      alert('Please enter an option name');
      return;
    }
    const filter = filters.find(f => f.id === filterId);
    const sortOrder = filter?.options.length || 0;
    
    try {
      await searchCategoryApi.createSubCategoryFilterOption({ 
        filterId,
        name: newOptionName, 
        sortOrder 
      });
      setCreatingOptionForFilter(null);
      setNewOptionName('');
      await loadFilters();
    } catch (error) {
      console.error('Failed to create option:', error);
      alert('Failed to create option');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading sub-category filters...</div>;
  }

  return (
    <div className={styles.manager}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className={styles.title} style={{ margin: 0 }}>Sub-Category Filters</h2>
        <button 
          onClick={() => setCreatingFilter(true)} 
          className={styles.saveBtn}
          disabled={creatingFilter}
        >
          + Add Filter
        </button>
      </div>

      {creatingFilter && (
        <div className={styles.item} style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={newFilterName}
            onChange={(e) => setNewFilterName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFilter()}
            placeholder="Enter filter name (e.g. Subject, Type)"
            className={styles.input}
            autoFocus
          />
          <div className={styles.actions}>
            <button onClick={handleCreateFilter} className={styles.saveBtn}>
              Save
            </button>
            <button onClick={() => { setCreatingFilter(false); setNewFilterName(''); }} className={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <div className={styles.filterList}>
        {filters.map((filter, filterIndex) => (
          <div 
            key={filter.id} 
            className={styles.filterItem}
            draggable={editingFilterId !== filter.id}
            onDragStart={(e) => handleFilterDragStart(e, filterIndex)}
            onDragOver={handleFilterDragOver}
            onDrop={(e) => handleFilterDrop(e, filterIndex)}
            style={{ cursor: editingFilterId === filter.id ? 'default' : 'move' }}
          >
            {editingFilterId === filter.id ? (
              <div className={styles.filterHeader}>
                <input
                  type="text"
                  value={editFilterName}
                  onChange={(e) => setEditFilterName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveFilter(filter.id)}
                  className={styles.input}
                  autoFocus
                  style={{ flex: 1 }}
                />
                <div className={styles.actions}>
                  <button onClick={() => handleSaveFilter(filter.id)} className={styles.saveBtn}>
                    Save
                  </button>
                  <button onClick={() => setEditingFilterId(null)} className={styles.cancelBtn}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.filterHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, cursor: 'pointer' }} onClick={() => toggleFilter(filter.id)}>
                  <span className={styles.arrow}>{expandedFilterId === filter.id ? '▼' : '▶'}</span>
                  <span className={styles.filterName}>{filter.name}</span>
                </div>
                <div className={styles.actions}>
                  <button onClick={() => handleEditFilter(filter)} className={styles.editBtn}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteFilter(filter.id, filter.name)} className={styles.deleteBtn}>
                    Delete
                  </button>
                </div>
              </div>
            )}
            
            {expandedFilterId === filter.id && (
              <div className={styles.optionsList}>
                {creatingOptionForFilter === filter.id && (
                  <div className={styles.optionItem} style={{ marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={newOptionName}
                      onChange={(e) => setNewOptionName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateOption(filter.id)}
                      placeholder="Enter option name"
                      className={styles.input}
                      autoFocus
                      style={{ flex: 1 }}
                    />
                    <div className={styles.actions}>
                      <button onClick={() => handleCreateOption(filter.id)} className={styles.saveBtn}>
                        Save
                      </button>
                      <button onClick={() => { setCreatingOptionForFilter(null); setNewOptionName(''); }} className={styles.cancelBtn}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {filter.options.map((option, optionIndex) => (
                  <div 
                    key={option.id} 
                    className={styles.optionItem}
                    draggable={editingOptionId !== option.id}
                    onDragStart={(e) => handleOptionDragStart(e, optionIndex)}
                    onDragOver={handleOptionDragOver}
                    onDrop={(e) => handleOptionDrop(e, optionIndex, filter.id)}
                    style={{ cursor: editingOptionId === option.id ? 'default' : 'move' }}
                  >
                    {editingOptionId === option.id ? (
                      <>
                        <input
                          type="text"
                          value={editOptionName}
                          onChange={(e) => setEditOptionName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveOption(option.id)}
                          className={styles.input}
                          autoFocus
                          style={{ flex: 1 }}
                        />
                        <div className={styles.actions}>
                          <button onClick={() => handleSaveOption(option.id)} className={styles.saveBtn}>
                            Save
                          </button>
                          <button onClick={() => setEditingOptionId(null)} className={styles.cancelBtn}>
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className={styles.optionName}>{option.name}</span>
                        <div className={styles.actions}>
                          <button onClick={() => handleEditOption(option)} className={styles.editBtn}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteOption(option.id, option.name)} className={styles.deleteBtn}>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <button 
                  onClick={() => setCreatingOptionForFilter(filter.id)}
                  className={styles.addBtn + ' ' + styles.addOptionBtn}
                  disabled={creatingOptionForFilter === filter.id}
                >
                  + Add Option
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
