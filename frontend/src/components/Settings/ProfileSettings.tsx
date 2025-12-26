import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import styles from './ProfileSettings.module.css';
import { AddSocialLinkModal } from '../AddSocialLinkModal/AddSocialLinkModal';
import { SocialIcon } from '../SocialIcon/SocialIcon';

export const ProfileSettings = () => {
  const { user } = useAuth();
  const {
    loading,
    saving,
    message,
    profileData,
    profilePreview,
    bannerPreview,
    profileInputRef,
    bannerInputRef,
    handleInputChange,
    handleSocialLinkChange,
    removeSocialLink,
    handleProfileImageChange,
    handleBannerImageChange,
    setProfilePreview,
    setBannerPreview,
    saveProfile,
    saveSocialLink,
    removeSocialLinkAndSave,
  } = useProfileSettings(user?.id || null);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);


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
        
        {/* Display saved links */}
        <div className={styles.savedLinksContainer}>
          {Object.entries(profileData.socialLinks).map(([platform, link]) => (
            <div key={platform} className={styles.savedLinkBox}>
              <div className={styles.linkLogo}>
                <SocialIcon domain={link.domain} size={20} />
              </div>

              <div className={styles.linkInfo}>
                <div className={styles.linkDomain}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</div>
                <div className={styles.linkUrl}>https://{link.domain}/{link.handle}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  removeSocialLink(platform);  // Remove from local state first
                  removeSocialLinkAndSave(platform);  // Then save to backend
                }}
                className={styles.deleteBtn}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowAddLinkModal(true)}
          className={styles.addLinkBtn}
        >
          + Add Link
        </button>
      </div>

      {/* Add Link Modal */}
      <AddSocialLinkModal
        isOpen={showAddLinkModal}
        onClose={() => setShowAddLinkModal(false)}
        onSave={async (platform, link) => {
          handleSocialLinkChange(platform, link.domain, link.handle);
          await saveSocialLink(platform, link);
          setShowAddLinkModal(false);
        }}
      />

      <button
        onClick={saveProfile}
        disabled={saving}
        className={styles.saveBtn}
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>

      {message && (
        <div className={styles.message}>{message}</div>
      )}
    </div>
  );
};
