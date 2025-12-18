import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile } from '../../models';
import styles from './ProfileSettings.module.css';

export const ProfileSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState<UserProfile>({
        id: '',
        username: '',
        displayName: '',
        bio: '',
        location: '',
        profileImageUrl: '',
        bannerImageUrl: '',
        socialLinks: {},
    });

    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const profileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
        loadProfileData();
        }
    }, [user]);

    const loadProfileData = async () => {
        if (!user) return;

        try {
        setLoading(true);
        const res = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/profile/${user.id}`
        );
        const data = await res.json();

        if (data.profile) {
            setProfileData({
            id: data.profile.id,
            username: data.profile.username || '',
            displayName: data.profile.displayName || '',
            bio: data.profile.bio || '',
            location: data.profile.location || '',
            profileImageUrl: data.profile.profileImageUrl || '',
            bannerImageUrl: data.profile.bannerImageUrl || '',
            socialLinks: data.profile.socialLinks || {},
            });
        }

        } catch (err) {
        console.error('Failed to load profile data:', err);
        } finally {
        setLoading(false);
        }
    };

    const handleInputChange = (field: keyof UserProfile, value: string) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handleSocialLinkChange = (platform: string, value: string) => {
        setProfileData(prev => ({
        ...prev,
        socialLinks: {
            ...prev.socialLinks,
            [platform]: value || undefined,
        },
        }));
    };

    const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        }
    };

    const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setBannerPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        }
    };

    const uploadProfileImage = async () => {
        if (!user || !profileInputRef.current?.files?.[0]) return;

        const formData = new FormData();
        formData.append('image', profileInputRef.current.files[0]);

        try {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/${user.id}/profile-image`,
            {
            method: 'POST',
            body: formData,
            }
        );

        if (res.ok) {
            const data = await res.json();
            setProfileData(prev => ({ ...prev, profileImageUrl: data.profileImageUrl }));
            setProfilePreview(null);
            if (profileInputRef.current) {
            profileInputRef.current.value = '';
            }
        } else {
            alert('Failed to upload profile image');
        }
        } catch (err) {
        console.error('Failed to upload profile image:', err);
        alert('Failed to upload profile image');
        }
    };

    const uploadBannerImage = async () => {
        if (!user || !bannerInputRef.current?.files?.[0]) return;

        const formData = new FormData();
        formData.append('image', bannerInputRef.current.files[0]);

        try {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/${user.id}/banner-image`,
            {
            method: 'POST',
            body: formData,
            }
        );

        if (res.ok) {
            const data = await res.json();
            setProfileData(prev => ({ ...prev, bannerImageUrl: data.bannerImageUrl }));
            setBannerPreview(null);
            if (bannerInputRef.current) {
            bannerInputRef.current.value = '';
            }
        } else {
            alert('Failed to upload banner image');
        }
        } catch (err) {
        console.error('Failed to upload banner image:', err);
        alert('Failed to upload banner image');
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        if (profileData.bio.length > 500) {
        alert('Bio must be 500 characters or less');
        return;
        }

        try {
        setSaving(true);

        if (profilePreview && profileInputRef.current?.files?.[0]) {
            await uploadProfileImage();
        }
        if (bannerPreview && bannerInputRef.current?.files?.[0]) {
            await uploadBannerImage();
        }

        const res = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/${user.id}/profile`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: profileData.username,
                    displayName: profileData.displayName,
                    bio: profileData.bio,
                    location: profileData.location,
                    socialLinks: profileData.socialLinks,
                }),
            }
        );

        if (res.ok) {
            alert('Profile updated successfully!');
            await loadProfileData();
        } else {
            alert('Failed to update profile');
        }
        } catch (err) {
            console.error('Failed to save profile:', err);
            alert('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

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
            <div className={styles.socialLinks}>
            <input
                type="url"
                value={profileData.socialLinks.twitter || ''}
                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                placeholder="Twitter/X URL"
                className={styles.input}
            />
            <input
                type="url"
                value={profileData.socialLinks.instagram || ''}
                onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                placeholder="Instagram URL"
                className={styles.input}
            />
            <input
                type="url"
                value={profileData.socialLinks.artstation || ''}
                onChange={(e) => handleSocialLinkChange('artstation', e.target.value)}
                placeholder="ArtStation URL"
                className={styles.input}
            />
            <input
                type="url"
                value={profileData.socialLinks.website || ''}
                onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                placeholder="Personal website URL"
                className={styles.input}
            />
            </div>
        </div>

        <button
            onClick={handleSaveProfile}
            disabled={saving}
            className={styles.saveBtn}
        >
            {saving ? 'Saving...' : 'Save Profile'}
        </button>
        </div>
    );
};
