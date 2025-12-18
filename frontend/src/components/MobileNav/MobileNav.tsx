import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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

export const MobileNav = ({ 
  basketCount = 0, 
  messageCount = 0, 
  alertCount = 0,
  onOpenChat 
}: MobileNavProps) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const [shouldOpenMobileChat, setShouldOpenMobileChat] = useState(false);

  // Check if we should auto-open mobile chat from navigation state
  useEffect(() => {
    if (location.state?.openMobileChat) {
      setShouldOpenMobileChat(true);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  if (!isLoggedIn) return null;

  return (
    <nav className={styles.mobileNav}>
      <div className={styles.navItems}>
        {isLoggedIn ? (
          <>
            <BasketButton itemCount={basketCount} />
            <MessageButton 
              unreadCount={messageCount} 
              onOpenChat={onOpenChat}
              autoOpen={shouldOpenMobileChat}
              autoOpenData={location.state?.openMobileChat ? {
                conversationId: location.state.conversationId,
                otherUserId: location.state.otherUserId,
                otherUserName: location.state.otherUserName,
                otherUserAvatar: location.state.otherUserAvatar,
              } : undefined}
            />
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
