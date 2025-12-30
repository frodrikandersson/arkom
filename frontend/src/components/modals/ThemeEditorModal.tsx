import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Theme } from '../../models/Theme';
import { ColorPickerModal } from './ColorPickerModal';
import styles from './ThemeEditorModal.module.css';

interface ThemeEditorModalProps {
  isOpen: boolean;
  theme: Theme;
  onClose: () => void;
  onSave: (theme: Theme) => Promise<void>;
  onPreview: (theme: Theme) => void; // Live preview
}

export const ThemeEditorModal = ({ isOpen, theme, onClose, onSave, onPreview }: ThemeEditorModalProps) => {
  const [editingTheme, setEditingTheme] = useState<Theme>(theme);
  const [originalTheme, setOriginalTheme] = useState<Theme>(theme);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedColorKey, setSelectedColorKey] = useState<keyof Theme['colors'] | null>(null);
  const [saving, setSaving] = useState(false);

  // Store original theme when modal opens
  useEffect(() => {
    if (isOpen) {
      setOriginalTheme(theme);
      setEditingTheme(theme);
    }
  }, [isOpen, theme]);

  // Apply live preview whenever editingTheme changes
  useEffect(() => {
    if (isOpen) {
      onPreview(editingTheme);
    }
  }, [editingTheme, isOpen]);

  const openColorPicker = (key: keyof Theme['colors']) => {
    setSelectedColorKey(key);
    setColorPickerOpen(true);
  };

  const handleColorSave = (color: string) => {
    if (!selectedColorKey) return;
    setEditingTheme({
      ...editingTheme,
      colors: {
        ...editingTheme.colors,
        [selectedColorKey]: color,
      },
    });
  };

  const updateName = (name: string) => {
    setEditingTheme({
      ...editingTheme,
      name,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(editingTheme);
      onClose();
    } catch (err) {
      console.error('Failed to save theme:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Revert to original theme
    onPreview(originalTheme);
    onClose();
  };

  const handleReset = () => {
    const defaultDarkTheme: Theme = {
      id: editingTheme.id,
      name: editingTheme.name,
      colors: {
        background: '#0A0A0A',
        foreground: '#1F1F1F',
        card: '#151515',
        cardBorder: '#2A2A2A',
        text: '#FFFFFF',
        textSecondary: '#888888',
        accent: '#00D9FF',
        accentHover: '#00B8D9',
        error: '#FF4444',
        success: '#00FF88',
      },
    };
    setEditingTheme(defaultDarkTheme);
  };


  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
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

  if (!isOpen) return null;

  const modalContent = (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Customize Your Theme</h2>
          <button className={styles.closeBtn} onClick={handleCancel}>×</button>
        </div>

        <div className={styles.content}>
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
        </div>

        <div className={styles.actions}>
          <button className={styles.resetBtn} onClick={handleReset}>
            Reset to Default
          </button>
          <div className={styles.actionButtons}>
            <button className={styles.cancelBtn} onClick={handleCancel}>
              Cancel
            </button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Theme'}
            </button>
          </div>
        </div>


        {/* Color Picker Modal */}
        {selectedColorKey && (
          <ColorPickerModal
            isOpen={colorPickerOpen}
            currentColor={editingTheme.colors[selectedColorKey]}
            colorLabel={colorLabels[selectedColorKey]}
            onClose={() => setColorPickerOpen(false)}
            onSave={handleColorSave}
          />
        )}
      </div>
    </div>
  );

  // Render modal at document root using portal
  return createPortal(modalContent, document.body);
};