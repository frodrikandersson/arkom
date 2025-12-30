import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserSearch } from '../../hooks/useUserSearch';
import styles from './UserSearch.module.css';

export const UserSearch = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { results, isLoading } = useUserSearch(query, user?.id);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update isOpen based on query
  useEffect(() => {
    if (!query.trim()) {
      setIsOpen(false);
    } else if (results.length > 0 || !isLoading) {
      setIsOpen(true);
    }
  }, [query, results, isLoading]);

  const handleSelectUser = (userId: string) => {
    navigate(`/profile/${userId}`);
    setQuery('');
    setIsOpen(false);
  };


  return (
    <div className={styles.searchContainer} ref={searchRef}>
      <div className={styles.searchInput}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {isLoading ? (
            <div className={styles.loading}>Searching...</div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <button
                key={result.id}
                className={styles.resultItem}
                onClick={() => handleSelectUser(result.id)}
              >
                <div className={styles.avatar}>
                  {result.profileImageUrl ? (
                    <img src={result.profileImageUrl} alt={result.displayName} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {result.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{result.displayName}</span>
                  {result.username && (
                    <span className={styles.userHandle}>@{result.username}</span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className={styles.noResults}>No users found</div>
          )}
        </div>
      )}
    </div>
  );
};