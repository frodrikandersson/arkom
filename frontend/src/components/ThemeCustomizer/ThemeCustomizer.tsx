import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { defaultDarkTheme, defaultLightTheme, type Theme } from '../../models/Theme';
import { ColorPickerModal } from '../ColorPickerModal/ColorPickerModal';
import styles from './ThemeCustomizer.module.css';

export const ThemeCustomizer = () => {
  const { user } = useAuth();
  const { currentTheme, customThemes, setTheme, addCustomTheme, updateCustomTheme, deleteCustomTheme } = useTheme();
  const [isCreating, setIsCreating] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedColorKey, setSelectedColorKey] = useState<keyof Theme['colors'] | null>(null);

  const allThemes = [defaultDarkTheme, defaultLightTheme, ...customThemes];

  const startCreateTheme = () => {
    setEditingTheme({
      id: `custom-${Date.now()}`,
      name: 'My Custom Theme',
      colors: { ...currentTheme.colors },
    });
    setIsCreating(true);
  };

  const startEditTheme = (theme: Theme) => {
    setEditingTheme({ ...theme });
    setIsCreating(false);
  };

  const saveTheme = async () => {
    if (!editingTheme) return;

    if (isCreating) {
      await addCustomTheme(editingTheme, user?.id);
    } else {
      await updateCustomTheme(editingTheme);
    }

    setEditingTheme(null);
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingTheme(null);
    setIsCreating(false);
  };

  const openColorPicker = (key: keyof Theme['colors']) => {
    setSelectedColorKey(key);
    setColorPickerOpen(true);
  };

  const handleColorSave = (color: string) => {
    if (!editingTheme || !selectedColorKey) return;
    setEditingTheme({
      ...editingTheme,
      colors: {
        ...editingTheme.colors,
        [selectedColorKey]: color,
      },
    });
  };

  const updateName = (name: string) => {
    if (!editingTheme) return;
    setEditingTheme({
      ...editingTheme,
      name,
    });
  };

  const colorLabels: Record<keyof Theme['colors'], string> = {
    background: 'Background',
    foreground: 'Foreground',
    card: 'Card',
    cardBorder: 'Card Border',
    text: 'Text',
    textSecondary: 'Secondary Text',
    accent: 'Accent',
    accentHover: 'Accent Hover',
    error: 'Error',
    success: 'Success',
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Theme Customizer</h2>

      {!user && (
        <div className={styles.warning}>
          <p>⚠️ Sign in to save themes across devices</p>
        </div>
      )}

      {/* Theme Selector */}
      {!editingTheme && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Select Theme</h3>
          <div className={styles.themeGrid}>
            {allThemes.map((theme) => (
              <div
                key={theme.id}
                className={`${styles.themeCard} ${currentTheme.id === theme.id ? styles.active : ''}`}
                onClick={() => setTheme(theme)}
              >
                <div className={styles.themeName}>{theme.name}</div>
                <div className={styles.colorPreview}>
                  <div style={{ backgroundColor: theme.colors.background }} />
                  <div style={{ backgroundColor: theme.colors.accent }} />
                  <div style={{ backgroundColor: theme.colors.card }} />
                </div>
                {!['dark', 'light'].includes(theme.id) && (
                  <div className={styles.themeActions}>
                    <button onClick={(e) => { e.stopPropagation(); startEditTheme(theme); }}>
                      Edit
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteCustomTheme(theme.id); }}
                      className={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className={styles.createBtn} onClick={startCreateTheme}>
            Create Custom Theme
          </button>
        </div>
      )}

      {/* Theme Editor */}
      {editingTheme && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {isCreating ? 'Create New Theme' : 'Edit Theme'}
          </h3>

          <div className={styles.nameInput}>
            <label>Theme Name</label>
            <input
              type="text"
              value={editingTheme.name}
              onChange={(e) => updateName(e.target.value)}
            />
          </div>

          <div className={styles.colorGrid}>
            {(Object.keys(editingTheme.colors) as Array<keyof Theme['colors']>).map((colorKey) => (
              <div key={colorKey} className={styles.colorBlock}>
                <label>{colorLabels[colorKey]}</label>
                <div 
                  className={styles.colorDisplay}
                  style={{ backgroundColor: editingTheme.colors[colorKey] }}
                  onClick={() => openColorPicker(colorKey)}
                />
                <div className={styles.hexDisplay}>
                  {editingTheme.colors[colorKey]}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.editorActions}>
            <button className={styles.saveBtn} onClick={saveTheme}>
              {isCreating ? 'Create Theme' : 'Save Changes'}
            </button>
            <button className={styles.cancelBtn} onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Color Picker Modal */}
      {selectedColorKey && editingTheme && (
        <ColorPickerModal
          isOpen={colorPickerOpen}
          currentColor={editingTheme.colors[selectedColorKey]}
          colorLabel={colorLabels[selectedColorKey]}
          onClose={() => setColorPickerOpen(false)}
          onSave={handleColorSave}
        />
      )}
    </div>
  );
};