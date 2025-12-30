import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
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
    setHexInput(newColor.toUpperCase());
  };

  const handleHexInputChange = (value: string) => {
    let formatted = value.toUpperCase();
    if (!formatted.startsWith('#')) {
      formatted = '#' + formatted;
    }
    setHexInput(formatted);
    
    // Validate hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(formatted)) {
      setColor(formatted);
    }
  };

  const handleSave = () => {
    // Ensure valid hex before saving
    if (/^#[0-9A-Fa-f]{6}$/.test(hexInput)) {
      onSave(hexInput);
      onClose();
    }
  };

const [mouseDownInside, setMouseDownInside] = useState(false);

const handleOverlayMouseDown = (e: React.MouseEvent) => {
  // Check if mouse down started outside the modal
  if (e.target === e.currentTarget) {
    setMouseDownInside(false);
  }
};

const handleOverlayMouseUp = (e: React.MouseEvent) => {
  // Only close if mouse down started outside AND mouse up is also outside
  if (e.target === e.currentTarget && !mouseDownInside) {
    onClose();
  }
  setMouseDownInside(false);
};

const handleModalMouseDown = () => {
  // Mark that mouse down happened inside modal
  setMouseDownInside(true);
};



  if (!isOpen) return null;

  const presetColors = [
    '#000000', '#FFFFFF', '#1F1F1F', '#F5F5F5',
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#008080', '#FFC0CB', '#A52A2A', '#FFD700',
    '#00D9FF', '#00FF88', '#FF4444', '#B46BDF',
  ];

  return (
    <div 
      className={styles.overlay} 
      onMouseDown={handleOverlayMouseDown}
      onMouseUp={handleOverlayMouseUp}
    >
      <div className={styles.modal} onMouseDown={handleModalMouseDown}>
        <div className={styles.header}>
          <h3>{colorLabel}</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          {/* Modern color picker */}
          <div className={styles.pickerWrapper}>
            <HexColorPicker color={color} onChange={handleColorChange} />
          </div>

          {/* Hex input */}
          <div className={styles.hexInputWrapper}>
            <label>Hex Code</label>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexInputChange(e.target.value)}
              placeholder="#000000"
              maxLength={7}
              className={styles.hexInput}
            />
          </div>

          {/* Quick color presets */}
          <div className={styles.presets}>
            <div className={styles.presetsLabel}>Quick Colors</div>
            <div className={styles.presetGrid}>
              {presetColors.map((preset) => (
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