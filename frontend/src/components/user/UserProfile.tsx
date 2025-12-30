import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArtworkGrid } from '../portfolio/ArtworkGrid';
import { useUserProfile } from '../../hooks/useUserProfile';
import { getOrCreateConversation } from '../../services/userService';
import { OnOpenChatFunction } from '../../models';
import styles from './UserProfile.module.css';
import { constructSocialUrl } from '../../utils/socialLinks';

interface UserProfileProps {
  userId: string;
  onOpenChat: OnOpenChatFunction;
}

export const UserProfile = ({ userId, onOpenChat }: UserProfileProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, isLoading, error } = useUserProfile(userId);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleStartConversation = async () => {
    if (!user || !userId || !profile) return;

    try {
      const data = await getOrCreateConversation(user.id, userId);
      
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
          profile.profileImageUrl,
          profile.username
        );
        // Navigate back to home so chat window is visible
        navigate('/');
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
              {Object.entries(profile.socialLinks).map(([platform, link]) => {
                const url = constructSocialUrl(link);
                if (!url) return null;
                
                return (
                  <a 
                    key={platform}
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1).replace(/_/g, ' ')}
                  </a>
                );
              })}
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
