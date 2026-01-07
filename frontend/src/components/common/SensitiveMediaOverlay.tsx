import { useState } from 'react';
import { SensitiveContentType } from '../../models/Portfolio';
import styles from './SensitiveMediaOverlay.module.css';

interface SensitiveMediaOverlayProps {
  sensitiveContentTypes: SensitiveContentType[];
  onReveal?: () => void;
  showRevealButton?: boolean; // Default true for modal, false for grid
  compact?: boolean; // For very small thumbnails - just show icon
}

export const SensitiveMediaOverlay = ({ 
  sensitiveContentTypes, 
  onReveal,
  showRevealButton = true,
  compact = false
}: SensitiveMediaOverlayProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRevealed(true);
    onReveal?.();
  };

  if (isRevealed) return null;

  const typeLabels = sensitiveContentTypes.map(type => {
    switch (type) {
      case 'gore': return 'Gore';
      case 'sexual_nudity_18+': return '18+';
      case 'other': return 'Sensitive';
      default: return 'Sensitive';
    }
  });

  // For grid view, create a short label (e.g., "Gore, 18+" or just "Sensitive")
  const gridLabel = typeLabels.length > 0 ? typeLabels.join(', ') : 'Sensitive';

  return (
    <div 
      className={styles.overlay} 
      onMouseEnter={() => showRevealButton && setIsHovering(true)} 
      onMouseLeave={() => showRevealButton && setIsHovering(false)}
    >
      <div className={styles.mosaicEffect} />
      
      {/* Compact view - just warning symbol */}
      {!showRevealButton && compact && (
        <div className={styles.compactContent}>
          <div className={styles.compactIcon}>⚠</div>
        </div>
      )}
      
      {/* Grid view - show actual content types */}
      {!showRevealButton && !compact && (
        <div className={styles.gridContent}>
          <div className={styles.gridLabel}>{gridLabel}</div>
        </div>
      )}
      
      {/* Modal view - full details with hover reveal */}
      {showRevealButton && (
        <>
          <div className={`${styles.content} ${isHovering ? styles.contentVisible : ''}`}>
            <h3 className={styles.title}>Sensitive Content</h3>
            <div className={styles.types}>
              {typeLabels.map((label, index) => (
                <span key={index} className={styles.typeTag}>{label}</span>
              ))}
            </div>
            <p className={styles.message}>This media contains sensitive content</p>
          </div>
          {isHovering && (
            <button onClick={handleReveal} className={styles.revealButton}>Show Content</button>
          )}
        </>
      )}
    </div>
  );
};
