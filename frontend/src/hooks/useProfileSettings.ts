import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getUserProfile, 
  uploadProfileImage, 
  uploadBannerImage, 
  updateUserProfile,
  UpdateProfileData 
} from '../services/userService';
import { UserProfile } from '../models';

export const useProfileSettings = (userId: string | null) => {
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

  const loadProfileData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getUserProfile(userId);

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
  }, [userId]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

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

  const saveProfile = useCallback(async () => {
    if (!userId) return;

    if (profileData.bio.length > 500) {
      alert('Bio must be 500 characters or less');
      return;
    }

    try {
      setSaving(true);

      // Upload images if changed
      if (profilePreview && profileInputRef.current?.files?.[0]) {
        const data = await uploadProfileImage(userId, profileInputRef.current.files[0]);
        setProfileData(prev => ({ ...prev, profileImageUrl: data.profileImageUrl }));
        setProfilePreview(null);
        if (profileInputRef.current) {
          profileInputRef.current.value = '';
        }
      }

      if (bannerPreview && bannerInputRef.current?.files?.[0]) {
        const data = await uploadBannerImage(userId, bannerInputRef.current.files[0]);
        setProfileData(prev => ({ ...prev, bannerImageUrl: data.bannerImageUrl }));
        setBannerPreview(null);
        if (bannerInputRef.current) {
          bannerInputRef.current.value = '';
        }
      }

      // Update profile data
      const updateData: UpdateProfileData = {
        username: profileData.username,
        displayName: profileData.displayName,
        bio: profileData.bio,
        location: profileData.location,
        socialLinks: profileData.socialLinks,
      };

      await updateUserProfile(userId, updateData);
      alert('Profile updated successfully!');
      await loadProfileData();
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  }, [userId, profileData, profilePreview, bannerPreview, loadProfileData]);

  return {
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
  };
};
