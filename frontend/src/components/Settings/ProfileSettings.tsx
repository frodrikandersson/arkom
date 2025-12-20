import { useAuth } from '../../contexts/AuthContext';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import styles from './ProfileSettings.module.css';

export const ProfileSettings = () => {
  const { user } = useAuth();
  const {
    loading,
    saving,
    profileData,
    profilePreview,
    bannerPreview,
    profileInputRef,
    bannerInputRef,
    handleInputChange,
    handleSocialLinkChange,
    handleProfileImageChange,
    handleBannerImageChange,
    setProfilePreview,
    setBannerPreview,
    saveProfile,
  } = useProfileSettings(user?.id || null);

  if (!user) return null;

  if (loading) {
    return (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile Settings</h2>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Profile Settings</h2>
      <p className={styles.description}>
        Customize how your profile appears to other users.
      </p>

      <div className={styles.imageSection}>
        <label className={styles.label}>Banner Image</label>
        <div className={styles.bannerPreviewContainer}>
          {bannerPreview || profileData.bannerImageUrl ? (
            <img
              src={bannerPreview || profileData.bannerImageUrl}
              alt="Banner preview"
              className={styles.bannerPreview}
            />
          ) : (
            <div className={styles.bannerPlaceholder}>No banner image</div>
          )}
        </div>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          onChange={handleBannerImageChange}
          className={styles.fileInput}
        />
        {bannerPreview && (
          <button onClick={() => setBannerPreview(null)} className={styles.cancelBtn}>
            Cancel
          </button>
        )}
      </div>

      <div className={styles.imageSection}>
        <label className={styles.label}>Profile Image</label>
        <div className={styles.profilePreviewContainer}>
          {profilePreview || profileData.profileImageUrl ? (
            <img
              src={profilePreview || profileData.profileImageUrl}
              alt="Profile preview"
              className={styles.profilePreview}
            />
          ) : (
            <div className={styles.profilePlaceholder}>
              {user.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
        <input
          ref={profileInputRef}
          type="file"
          accept="image/*"
          onChange={handleProfileImageChange}
          className={styles.fileInput}
        />
        {profilePreview && (
          <button onClick={() => setProfilePreview(null)} className={styles.cancelBtn}>
            Cancel
          </button>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Username</label>
        <input
          type="text"
          value={profileData.username}
          onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
          placeholder="your_username"
          className={styles.input}
          maxLength={20}
        />
        <div className={styles.hint}>
          3-20 characters, letters, numbers, underscores and hyphens only
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Display Name</label>
        <input
          type="text"
          value={profileData.displayName}
          onChange={(e) => handleInputChange('displayName', e.target.value)}
          placeholder="Your display name"
          className={styles.input}
          maxLength={50}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Bio</label>
        <textarea
          value={profileData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Tell others about yourself..."
          className={styles.textarea}
          maxLength={500}
          rows={4}
        />
        <div className={styles.charCount}>
          {profileData.bio.length}/500
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Location</label>
        <input
          type="text"
          value={profileData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          placeholder="City, Country"
          className={styles.input}
          maxLength={100}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Social Links</label>
        <div className={styles.hint} style={{ marginBottom: '0.75rem' }}>
          Enter just your username/handle for each platform
        </div>
        <div className={styles.socialLinks}>
          <div className={styles.socialLinkItem}>
            <span className={styles.socialPrefix}>twitter.com/</span>
            <input
              type="text"
              value={profileData.socialLinks.twitter?.replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\//, '') || ''}
              onChange={(e) => {
                const handle = e.target.value.replace(/^@/, '');
                handleSocialLinkChange('twitter', handle ? `https://twitter.com/${handle}` : '');
              }}
              placeholder="username"
              className={styles.input}
            />
          </div>
          <div className={styles.socialLinkItem}>
            <span className={styles.socialPrefix}>instagram.com/</span>
            <input
              type="text"
              value={profileData.socialLinks.instagram?.replace(/^https?:\/\/(www\.)?instagram\.com\//, '') || ''}
              onChange={(e) => {
                const handle = e.target.value.replace(/^@/, '');
                handleSocialLinkChange('instagram', handle ? `https://instagram.com/${handle}` : '');
              }}
              placeholder="username"
              className={styles.input}
            />
          </div>
          <div className={styles.socialLinkItem}>
            <span className={styles.socialPrefix}>artstation.com/</span>
            <input
              type="text"
              value={profileData.socialLinks.artstation?.replace(/^https?:\/\/(www\.)?artstation\.com\//, '') || ''}
              onChange={(e) => {
                const handle = e.target.value;
                handleSocialLinkChange('artstation', handle ? `https://artstation.com/${handle}` : '');
              }}
              placeholder="username"
              className={styles.input}
            />
          </div>
          <div className={styles.socialLinkItem}>
            <label className={styles.socialPrefix}>Website:</label>
            <input
              type="url"
              value={profileData.socialLinks.website || ''}
              onChange={(e) => handleSocialLinkChange('website', e.target.value)}
              placeholder="https://yoursite.com"
              className={styles.input}
            />
          </div>
        </div>
      </div>
      
      <button
        onClick={saveProfile}
        disabled={saving}
        className={styles.saveBtn}
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
};
