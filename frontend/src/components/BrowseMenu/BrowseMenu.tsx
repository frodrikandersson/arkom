import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './BrowseMenu.module.css';

export const BrowseMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.browseMenu} ref={menuRef}>
      <button 
        className={styles.browseButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        Browse
        <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className={styles.dropdown}>
          <Link to="/commissions" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
            Commissions
          </Link>
          <Link to="/store" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
            Store
          </Link>
        </div>
      )}
    </div>
  );
};