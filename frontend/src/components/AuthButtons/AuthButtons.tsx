import { stackClientApp } from '../../config/stack';
import styles from './AuthButtons.module.css';

interface AuthButtonsProps {
  isLoggedIn: boolean;
  userName?: string | null;
}

export const AuthButtons = ({ isLoggedIn, userName }: AuthButtonsProps) => {
  if (isLoggedIn) {
    return (
      <div className={styles.container}>
        <p className={styles.welcome}>Welcome, {userName || 'User'}!</p>
        <button className={styles.signOutButton} onClick={() => stackClientApp.signOut()}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.authLinks}>
        <a href="/handler/sign-in" className={styles.authLink}>Sign In</a>
        <span className={styles.separator}>|</span>
        <a href="/handler/sign-up" className={styles.authLink}>Sign Up</a>
      </div>
    </div>
  );
};