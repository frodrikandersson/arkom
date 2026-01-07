import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './AuthButtons.module.css';

interface AuthButtonsProps {
  isLoggedIn: boolean;
  userName?: string | null;
}

export const AuthButtons = ({ isLoggedIn, userName }: AuthButtonsProps) => {
  const { resetToDefault } = useTheme();

  const handleSignOut = () => {
    resetToDefault(); // Reset to default theme on logout
    localStorage.removeItem('auth_token');
    window.location.href = '/';
  };

  if (isLoggedIn) {
    return (
      <div className={styles.container}>
        <p className={styles.welcome}>Welcome, {userName || 'User'}!</p>
        <button className={styles.signOutButton} onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.authLinks}>
        <Link to="/login" className={styles.authLink}>Sign In</Link>
        <span className={styles.separator}>|</span>
        <Link to="/signup" className={styles.authLink}>Sign Up</Link>
      </div>
    </div>
  );
};