import { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { BrowseMenu } from '../navigation/BrowseMenu';
import { UserSearch } from '../user/UserSearch';
import { BasketButton } from '../navigation/BasketButton';
import { MessageButton } from '../messaging/MessageButton';
import { AlertButton } from '../navigation/AlertButton';
import { UserMenu } from '../user/UserMenu';
import { useAuth } from '../../contexts/AuthContext';
import { OnOpenChatFunction } from '../../models';
import styles from './Header.module.css';

interface HeaderProps {
  basketCount?: number;
  messageCount?: number;
  onOpenChat: OnOpenChatFunction;
}

export const Header = ({ 
  basketCount = 0, 
  messageCount = 0,
  onOpenChat,
}: HeaderProps) => {
  const { isLoggedIn } = useAuth();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Close mobile search when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && showMobileSearch) {
        setShowMobileSearch(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showMobileSearch]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Left side */}
        <div className={styles.left}>
          <Logo />
          <BrowseMenu />
          <div className={styles.desktopSearch}>
            <UserSearch />
          </div>
        </div>

        {/* Right side */}
        <div className={styles.right}>
          {/* Mobile search button */}
          <button
            className={styles.mobileSearchButton}
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            aria-label="Toggle search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {isLoggedIn && (
            <div className={styles.desktopOnly}>
              <BasketButton itemCount={basketCount} />
              <MessageButton unreadCount={messageCount} onOpenChat={onOpenChat} />
              <AlertButton onOpenChat={onOpenChat} />
              <UserMenu />
            </div>
          )}
          
          {!isLoggedIn && (
            <div className={styles.authButtons}>
              <a href="/handler/sign-in" className={styles.signInButton}>Sign In</a>
              <a href="/handler/sign-up" className={styles.signUpButton}>Sign Up</a>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search bar (shown below header when toggled) */}
      {showMobileSearch && (
        <div className={styles.mobileSearchContainer}>
          <UserSearch />
        </div>
      )}
    </header>
  );
};
