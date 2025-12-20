import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { defaultDarkTheme, defaultLightTheme, createDefaultCustomTheme } from '../../models/Theme';
import { stackClientApp } from '../../config/stack';
import { SocialFooter } from '../SocialFooter/SocialFooter';
import { ThemeEditorModal } from '../ThemeEditorModal/ThemeEditorModal';
import styles from './UserMenu.module.css';

export const UserMenu = () => {
  const { user } = useAuth();
  const { currentTheme, customTheme, setTheme, previewTheme, saveCustomTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [showConfigure, setShowConfigure] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch user profile for custom profile image
  const { profile } = useUserProfile(user?.id || '');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleLogout = async () => {
    await stackClientApp.signOut();
    setIsOpen(false);
    navigate('/');
  };

  const handleThemeChange = async (themeId: 'dark' | 'light' | 'custom') => {
    if (themeId === 'dark') {
      await setTheme(defaultDarkTheme, user?.id);
      setShowConfigure(false);
    } else if (themeId === 'light') {
      await setTheme(defaultLightTheme, user?.id);
      setShowConfigure(false);
    } else {
      // Custom theme selected - show configure button
      setShowConfigure(true);
      if (customTheme) {
        await setTheme(customTheme, user?.id);
      } else if (user) {
        // Create default custom theme
        const newCustomTheme = createDefaultCustomTheme(user.id);
        await setTheme(newCustomTheme, user.id);
      }
    }
  };

  const handleOpenEditor = () => {
    setShowThemeEditor(true);
    setIsOpen(false);
  };

  const handleSaveTheme = async (theme: typeof currentTheme) => {
    if (!user) return;
    await saveCustomTheme(theme, user.id);
    await setTheme(theme, user.id);
  };

  const getActiveThemeType = () => {
    if (currentTheme.id === 'dark') return 'dark';
    if (currentTheme.id === 'light') return 'light';
    return 'custom';
  };

  const profileImage = profile?.profileImageUrl || user?.profileImageUrl || null;
  const themeToEdit = customTheme || (user ? createDefaultCustomTheme(user.id) : defaultDarkTheme);

  return (
    <>
      <div className={styles.userMenu} ref={menuRef}>
        <button 
          className={styles.menuButton}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className={styles.avatar}>
            {profileImage ? (
              <img src={profileImage} alt="Profile" className={styles.avatarImage} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user?.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className={styles.hamburger}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        {isOpen && (
          <div className={styles.dropdown}>
            <div className={styles.menuSection}>
              <Link to={`/profile/${user?.id}`} className={styles.menuItem} onClick={() => setIsOpen(false)}>
                Profile
              </Link>
              <Link to="/requests" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                My requests
              </Link>
              <Link to="/orders" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                My orders
              </Link>
              <Link to="/characters" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                Characters
              </Link>
              <Link to="/saved" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                Saved
              </Link>
              <Link to="/artist-dashboard" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                Artist dashboard
              </Link>
              <Link to="/settings" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                Settings
              </Link>
              <Link to="/help" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                Help
              </Link>
              <button className={styles.menuItem} onClick={handleLogout}>
                Log out
              </button>
            </div>

            <div className={styles.themeSection}>
              <div className={styles.themeSectionTitle}>Theme</div>
              <div className={styles.themeSlider}>
                <button
                  className={`${styles.themeOption} ${getActiveThemeType() === 'dark' ? styles.themeActive : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                  <span>Dark</span>
                </button>
                
                <button
                  className={`${styles.themeOption} ${getActiveThemeType() === 'light' ? styles.themeActive : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                  <span>Light</span>
                </button>
                
                <button
                  className={`${styles.themeOption} ${getActiveThemeType() === 'custom' ? styles.themeActive : ''}`}
                  onClick={() => handleThemeChange('custom')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                  </svg>
                  <span>Custom</span>
                </button>
              </div>

              {showConfigure && (
                <button className={styles.configureBtn} onClick={handleOpenEditor}>
                  Configure Custom Theme
                </button>
              )}
            </div>

            <SocialFooter />
          </div>
        )}
      </div>

      <ThemeEditorModal
        isOpen={showThemeEditor}
        theme={themeToEdit}
        onClose={() => setShowThemeEditor(false)}
        onSave={handleSaveTheme}
        onPreview={previewTheme}
      />
    </>
  );
};