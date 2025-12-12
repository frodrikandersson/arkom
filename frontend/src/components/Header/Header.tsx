import { Logo } from '../Logo/Logo';
import { BrowseMenu } from '../BrowseMenu/BrowseMenu';
import { BasketButton } from '../BasketButton/BasketButton';
import { MessageButton } from '../MessageButton/MessageButton';
import { AlertButton } from '../AlertButton/AlertButton';
import { UserMenu } from '../UserMenu/UserMenu';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Header.module.css';

interface HeaderProps {
  basketCount?: number;
  messageCount?: number;
  alertCount?: number;
}

export const Header = ({ 
  basketCount = 0, 
  messageCount = 0, 
  alertCount = 0 
}: HeaderProps) => {
  const { isLoggedIn } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Left side */}
        <div className={styles.left}>
          <Logo />
          <BrowseMenu />
        </div>

        {/* Right side */}
        <div className={styles.right}>
          {isLoggedIn && (
            <>
              <BasketButton itemCount={basketCount} />
              <MessageButton unreadCount={messageCount} />
              <AlertButton alertCount={alertCount} />
              <UserMenu />
            </>
          )}
          
          {!isLoggedIn && (
            <div className={styles.authButtons}>
              <a href="/handler/sign-in" className={styles.signInButton}>Sign In</a>
              <a href="/handler/sign-up" className={styles.signUpButton}>Sign Up</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};