import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArtworkGrid } from '../ArtworkGrid/ArtworkGrid';
import { UserProfile as UserProfileData } from '../../models';

import styles from './UserProfile.module.css';

interface UserProfileProps {
  userId: string;
  onOpenChat: (conversationId: number, otherUserId: string, otherUserName?: string, otherUserAvatar?: string) => void;
}

export const UserProfile = ({ userId, onOpenChat }: UserProfileProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    if (!user || !userId || !profile) return;

    try {
      // Get or create conversation without sending a message
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/messages/get-or-create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            otherUserId: userId,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (isMobile) {
          // On mobile, navigate to home and trigger mobile message dropdown
          navigate('/', { 
            state: { 
              openMobileChat: true,
              conversationId: data.conversationId,
              otherUserId: userId,
              otherUserName: profile.displayName,
              otherUserAvatar: profile.profileImageUrl
            } 
          });
        } else {
          // On desktop, open the chat window
          onOpenChat(
            data.conversationId,
            userId,
            profile.displayName,
            profile.profileImageUrl
          );
          // Navigate back to home so chat window is visible
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Start conversation error:', err);
      alert('Failed to open chat. Please try again.');
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
      {/* Banner Image */}
      {profile.bannerImageUrl && (
        <div className={styles.banner}>
          <img src={profile.bannerImageUrl} alt="Profile banner" />
        </div>
      )}

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
          <p className={styles.userId}>@{profile.username || userId.slice(0, 8)}</p>
          {profile.location && (
            <p className={styles.location}>{profile.location}</p>
          )}
          {/* Social Links */}
          {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
            <div className={styles.socialLinks}>
              {profile.socialLinks.twitter && (
                <a 
                  href={profile.socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  Twitter
                </a>
              )}
              {profile.socialLinks.instagram && (
                <a 
                  href={profile.socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  Instagram
                </a>
              )}
              {profile.socialLinks.artstation && (
                <a 
                  href={profile.socialLinks.artstation} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  ArtStation
                </a>
              )}
              {profile.socialLinks.website && (
                <a 
                  href={profile.socialLinks.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  Website
                </a>
              )}
            </div>
          )}
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
        <ArtworkGrid userId={userId} isOwnProfile={isOwnProfile} />
      </div>

    </div>
  );
};
