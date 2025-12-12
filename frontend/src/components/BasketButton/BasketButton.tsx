import { useLocation } from 'react-router-dom';
import styles from './BasketButton.module.css';

interface BasketButtonProps {
  itemCount?: number;
}

export const BasketButton = ({ itemCount = 0 }: BasketButtonProps) => {
  const location = useLocation();
  
  // Only show on store page or if basket has items
  const shouldShow = location.pathname === '/store' || itemCount > 0;
  
  if (!shouldShow) return null;

  return (
    <button className={styles.button}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 2L11 8M15 2L13 8M4.5 8H19.5L18 18H6L4.5 8Z"/>
      </svg>
      {itemCount > 0 && (
        <span className={styles.badge}>{itemCount}</span>
      )}
    </button>
  );
};