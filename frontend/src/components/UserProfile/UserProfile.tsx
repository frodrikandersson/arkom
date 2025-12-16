import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './UserProfile.module.css';

interface UserProfileProps {
  userId: string;
}

interface ProfileData {
  id: string;
  displayName: string;
  profileImageUrl?: string;
  bio?: string;
}

export const UserProfile = ({ userId }: UserProfileProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/profile/${userId}`
        );
        
        if (!response.ok) {
          throw new Error('Profile not found');
        }
        
        const data = await response.json();
        setProfile(data.profile);
      } catch (err) {
        console.error('Fetch profile error:', err);
        setError('Unable to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleStartConversation = async () => {
    if (!user || !userId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/messages/send`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: user.id,
            recipientId: userId,
            content: '',
          }),
        }
      );

      if (response.ok) {
        navigate('/messages');
      }
    } catch (err) {
      console.error('Start conversation error:', err);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading profile...</div>;
  }

  if (error || !profile) {
    return (
      <div className={styles.error}>
        <h2>Profile Not Found</h2>
        <p>{error || 'This user does not exist'}</p>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          Back to Home
        </button>
      </div>
    );
  }

  const isOwnProfile = user?.id === userId;

  return (
    <div className={styles.profileCard}>
      <div className={styles.header}>
        <div className={styles.avatarLarge}>
          {profile.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt={profile.displayName} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className={styles.info}>
          <h1 className={styles.displayName}>{profile.displayName}</h1>
          <p className={styles.userId}>@{userId}</p>
        </div>
      </div>

      {profile.bio && (
        <div className={styles.bio}>
          <h2>About</h2>
          <p>{profile.bio}</p>
        </div>
      )}

      {!isOwnProfile && user && (
        <div className={styles.actions}>
          <button onClick={handleStartConversation} className={styles.messageButton}>
            Send Message
          </button>
        </div>
      )}

      {isOwnProfile && (
        <div className={styles.actions}>
          <button onClick={() => navigate('/settings')} className={styles.editButton}>
            Edit Profile
          </button>
        </div>
      )}

      <div className={styles.portfolio}>
        <h2>Portfolio</h2>
        <div className={styles.emptyState}>
          <p>No artwork uploaded yet</p>
        </div>
      </div>
    </div>
  );
};