import { Link } from 'react-router-dom';
import styles from './Logo.module.css';

export const Logo = () => {
  return (
    <Link to="/" className={styles.logo}>
      <svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 24L14 8L20 24M10 19H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M28 24V8H34C36 8 38 10 38 12C38 14 36 16 34 16H28M34 16L38 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M46 24V8M46 16L54 8M46 16L54 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="68" cy="16" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M82 24V8L88 16L94 8V24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </Link>
  );
};