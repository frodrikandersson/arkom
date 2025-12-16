import { BasketButton } from '../BasketButton/BasketButton';
import { MessageButton } from '../MessageButton/MessageButton';
import { AlertButton } from '../AlertButton/AlertButton';
import { UserMenu } from '../UserMenu/UserMenu';
import { useAuth } from '../../contexts/AuthContext';
import styles from './MobileNav.module.css';

interface MobileNavProps {
  basketCount?: number;
  messageCount?: number;
  alertCount?: number;
  onOpenChat: (conversationId: number, otherUserId: string, otherUserName?: string, otherUserAvatar?: string) => void;
}

export const MobileNav = ({ basketCount = 0, messageCount = 0, alertCount = 0, onOpenChat }: MobileNavProps) => {
  const { isLoggedIn } = useAuth();

  return (
    <nav className={styles.mobileNav}>
      <div className={styles.navItems}>
        {isLoggedIn ? (
          <>
            <BasketButton itemCount={basketCount} />
            <MessageButton unreadCount={messageCount} onOpenChat={onOpenChat} />
            <AlertButton alertCount={alertCount} />
            <UserMenu />
          </>
        ) : (
          <>
            <a href="/handler/sign-in" className={styles.authLink}>Sign In</a>
            <a href="/handler/sign-up" className={styles.authLink}>Sign Up</a>
          </>
        )}
      </div>
    </nav>
  );
};