import { Link } from 'react-router-dom';
import styles from './Logo.module.css';

export const Logo = () => {
  return (
    <Link to="/" className={styles.logo}>
      <img src="/logo.svg" alt="Arkom" className={styles.logoImage} />
    </Link>
  );
};