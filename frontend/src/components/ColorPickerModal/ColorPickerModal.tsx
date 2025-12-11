import { useState, useEffect } from 'react';
import styles from './ColorPickerModal.module.css';

interface ColorPickerModalProps {
  isOpen: boolean;
  currentColor: string;
  colorLabel: string;
  onClose: () => void;
  onSave: (color: string) => void;
}

export const ColorPickerModal = ({ 
  isOpen, 
  currentColor, 
  colorLabel, 
  onClose, 
  onSave 
}: ColorPickerModalProps) => {
  const [color, setColor] = useState(currentColor);
  const [hexInput, setHexInput] = useState(currentColor);

  useEffect(() => {
    setColor(currentColor);
    setHexInput(currentColor);
  }, [currentColor, isOpen]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    setHexInput(newColor);
  };

  const handleHexInputChange = (value: string) => {
    setHexInput(value);
    
    // Validate hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setColor(value);
    }
  };

  const handleSave = () => {
    // Ensure valid hex before saving
    if (/^#[0-9A-Fa-f]{6}$/.test(hexInput)) {
      onSave(hexInput);
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>{colorLabel}</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          {/* Large color preview */}
          <div className={styles.previewLarge} style={{ backgroundColor: color }} />

          {/* Native color picker */}
          <div className={styles.pickerWrapper}>
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              className={styles.colorPicker}
            />
          </div>

          {/* Hex input */}
          <div className={styles.hexInputWrapper}>
            <label>Hex Code</label>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexInputChange(e.target.value.toUpperCase())}
              placeholder="#000000"
              maxLength={7}
              className={styles.hexInput}
            />
          </div>

          {/* Quick color presets */}
          <div className={styles.presets}>
            <div className={styles.presetsLabel}>Quick Colors</div>
            <div className={styles.presetGrid}>
              {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
                '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#FFA500',
                '#800080', '#008080', '#FFC0CB', '#A52A2A', '#FFD700'].map((preset) => (
                <button
                  key={preset}
                  className={styles.presetColor}
                  style={{ backgroundColor: preset }}
                  onClick={() => handleColorChange(preset)}
                  title={preset}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.saveBtn} onClick={handleSave}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};