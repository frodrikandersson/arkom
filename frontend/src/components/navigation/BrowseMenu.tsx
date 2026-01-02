// frontend/src/components/navigation/BrowseMenu.tsx
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import styles from './BrowseMenu.module.css';

export const BrowseMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
      });
    }
  }, [isOpen]);

  return (
    <div className={styles.browseMenu} ref={menuRef}>
      <button 
        ref={buttonRef}
        className={styles.browseButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        Browse
        <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>▼</span>
      </button>
      
      {isOpen && createPortal(
        <div className={styles.dropdown} style={dropdownStyle}>
          <Link to="/commissions" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
            Commissions
          </Link>
          <Link to="/store" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
            Store
          </Link>
        </div>,
        document.body
      )}
    </div>
  );
};
