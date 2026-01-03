import { useState, useEffect, DragEvent } from 'react';
import * as searchCategoryApi from '../../services/searchCategoryService';
import { Catalogue } from '../../models';
import styles from './AdminManager.module.css';

export const CatalogueManager = () => {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    loadCatalogues();
  }, []);

  const loadCatalogues = async () => {
    try {
      const data = await searchCategoryApi.getCatalogues();
      setCatalogues(data);
    } catch (error) {
      console.error('Failed to load catalogues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (catalogue: Catalogue) => {
    setEditingId(catalogue.id);
    setEditName(catalogue.name);
  };

  const handleSave = async (id: number) => {
    try {
      await searchCategoryApi.updateCatalogue(id, { name: editName });
      setEditingId(null);
      await loadCatalogues();
    } catch (error) {
      console.error('Failed to update catalogue:', error);
      alert('Failed to update catalogue');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all associated categories.`)) {
      return;
    }
    try {
      await searchCategoryApi.deleteCatalogue(id);
      await loadCatalogues();
    } catch (error) {
      console.error('Failed to delete catalogue:', error);
      alert('Failed to delete catalogue');
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      alert('Please enter a catalogue name');
      return;
    }
    try {
      await searchCategoryApi.createCatalogue({ 
        name: newName, 
        sortOrder: catalogues.length 
      });
      setCreating(false);
      setNewName('');
      await loadCatalogues();
    } catch (error) {
      console.error('Failed to create catalogue:', error);
      alert('Failed to create catalogue');
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

    const newCatalogues = [...catalogues];
    const draggedItem = newCatalogues[draggedIndex];
    
    newCatalogues.splice(draggedIndex, 1);
    newCatalogues.splice(dropIndex, 0, draggedItem);

    // Optimistically update UI
    setCatalogues(newCatalogues);
    setDraggedIndex(null);

    // Update sort orders on backend sequentially to avoid auth issues
    try {
      for (let index = 0; index < newCatalogues.length; index++) {
        const cat = newCatalogues[index];
        if (cat.sortOrder !== index) {
          await searchCategoryApi.updateCatalogue(cat.id, { sortOrder: index });
        }
      }
    } catch (error) {
      console.error('Failed to update sort order:', error);
      alert('Failed to update sort order. Reloading...');
      await loadCatalogues(); // Reload on error to restore correct order
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading catalogues...</div>;
  }

  return (
    <div className={styles.manager}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className={styles.title} style={{ margin: 0 }}>Catalogues</h2>
        <button 
          onClick={() => setCreating(true)} 
          className={styles.saveBtn}
          disabled={creating}
        >
          + Add Catalogue
        </button>
      </div>

      {creating && (
        <div className={styles.item} style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Enter catalogue name"
            className={styles.input}
            autoFocus
          />
          <div className={styles.actions}>
            <button onClick={handleCreate} className={styles.saveBtn}>
              Save
            </button>
            <button onClick={() => { setCreating(false); setNewName(''); }} className={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className={styles.list}>
        {catalogues.map((catalogue, index) => (
          <div
            key={catalogue.id}
            className={styles.item}
            draggable={editingId !== catalogue.id}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            style={{ cursor: editingId === catalogue.id ? 'default' : 'move' }}
          >
            {editingId === catalogue.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave(catalogue.id)}
                  className={styles.input}
                  autoFocus
                />
                <div className={styles.actions}>
                  <button onClick={() => handleSave(catalogue.id)} className={styles.saveBtn}>
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className={styles.cancelBtn}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className={styles.name}>{catalogue.name}</span>
                <div className={styles.actions}>
                  <button onClick={() => handleEdit(catalogue)} className={styles.editBtn}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(catalogue.id, catalogue.name)} className={styles.deleteBtn}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
