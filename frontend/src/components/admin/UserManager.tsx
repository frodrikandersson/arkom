import { useState, useEffect } from 'react';
import * as adminService from '../../services/adminService';
import styles from './AdminManager.module.css';
import { AdminUser } from '../../models';

export const UserManager = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (searchQuery?: string) => {
    try {
      const data = await adminService.getAllUsers(searchQuery);
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(search);
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'remove' : 'grant'} admin access for this user?`)) {
      return;
    }

    try {
      await adminService.updateUserAdminStatus(userId, !currentStatus);
      await loadUsers(search);
    } catch (error) {
      console.error('Failed to update admin status:', error);
      alert('Failed to update admin status');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading users...</div>;
  }

  return (
    <div className={styles.manager}>
      <h2 className={styles.title}>User Management</h2>

      <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, display name, email, or ID..."
            className={styles.input}
            style={{ flex: 1 }}
          />
          <button type="submit" className={styles.saveBtn}>
            Search
          </button>
          {search && (
            <button 
              type="button" 
              onClick={() => { setSearch(''); loadUsers(); }} 
              className={styles.cancelBtn}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      <div className={styles.list}>
        {users.map((user) => {
          const displayName = user.displayName || user.username || user.email || 'Anonymous';
          
          return (
            <div key={user.userId} className={styles.item}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  {user.profileImageUrl && (
                    <img 
                      src={user.profileImageUrl} 
                      alt={displayName} 
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  )}
                  <strong className={styles.name}>
                    {displayName}
                  </strong>
                  {user.isAdmin && (
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.125rem 0.5rem', 
                      backgroundColor: '#4CAF50', 
                      color: 'white', 
                      borderRadius: '12px' 
                    }}>
                      Admin
                    </span>
                  )}
                </div>
                {user.email && (user.displayName || user.username) && (
                  <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                    {user.email}
                  </div>
                )}
                {user.username && (
                  <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                    @{user.username}
                  </div>
                )}
                {user.bio && (
                  <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {user.bio}
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.25rem' }}>
                  ID: {user.userId}
                </div>
              </div>
              <div className={styles.actions}>
                <button 
                  onClick={() => handleToggleAdmin(user.userId, user.isAdmin)}
                  className={user.isAdmin ? styles.deleteBtn : styles.saveBtn}
                >
                  {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {users.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
          No users found
        </div>
      )}
    </div>
  );
};
