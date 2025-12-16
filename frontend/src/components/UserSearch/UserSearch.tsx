import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UserSearch.module.css';

interface SearchResult {
  id: string;
  displayName: string;
  profileImageUrl?: string;
}

export const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  // Search users
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/search?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setResults(data.users || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [query]);

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
            results.map((user) => (
              <button
                key={user.id}
                className={styles.resultItem}
                onClick={() => handleSelectUser(user.id)}
              >
                <div className={styles.avatar}>
                  {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt={user.displayName} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className={styles.userName}>{user.displayName}</span>
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