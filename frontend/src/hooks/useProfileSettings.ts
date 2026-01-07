import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getUserProfile, 
  uploadProfileImage, 
  uploadBannerImage, 
  updateUserProfile,
  UpdateProfileData 
} from '../services/userService';
import { SocialLink, UserProfile } from '../models';

export const useProfileSettings = (userId: string | null, refreshUser?: () => Promise<void>) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>('');
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
  const isInitialLoadRef = useRef(true);

  const loadProfileData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
      
    const scrollY = window.scrollY;

    try {
      setLoading(true);
      const data = await getUserProfile(userId);

      if (data.profile) {
        // Convert old format social links to new format if needed
        let socialLinks = data.profile.socialLinks || {};
        const convertedLinks: Record<string, { domain: string; handle: string }> = {};

        for (const [key, value] of Object.entries(socialLinks) as [string, string | { domain: string; handle: string }][]) {
          if (typeof value === 'string') {
            // Old format - convert URL string to domain + handle
            try {
              const urlObj = new URL(value.startsWith('http') ? value : `https://${value}`);
              convertedLinks[key] = {
                domain: urlObj.hostname.replace('www.', ''),
                handle: urlObj.pathname.slice(1) || '',
              };
            } catch {
              // If URL parsing fails, treat as plain handle
              convertedLinks[key] = { domain: '', handle: value };
            } 
          } else if (
            typeof value === 'object' &&
            value !== null &&
            'domain' in value &&
            'handle' in value
          ) {
            // Already in new format
            convertedLinks[key] = {
              domain: value.domain,
              handle: value.handle,
            };
          }
        }

        setProfileData({
          id: data.profile.id,
          username: data.profile.username || '',
          displayName: data.profile.displayName || '',
          bio: data.profile.bio || '',
          location: data.profile.location || '',
          profileImageUrl: data.profile.profileImageUrl || '',
          bannerImageUrl: data.profile.bannerImageUrl || '',
          socialLinks: convertedLinks,
        });
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
      
      // Only restore scroll if this was NOT the initial load
      if (!isInitialLoadRef.current) {
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollY);
        });
      }
      
      // Mark that initial load is complete
      isInitialLoadRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (key: string, domain: string, handle: string) => {
    setProfileData(prev => {
      const newLinks = { ...prev.socialLinks };
      
      // If both are empty, delete the entry
      if (!domain.trim() && !handle.trim()) {
        delete newLinks[key];
      } else {
        // Otherwise, keep it with whatever values we have (even if one is empty)
        newLinks[key] = { domain: domain.trim(), handle: handle.trim() };
      }
      
      return {
        ...prev,
        socialLinks: newLinks,
      };
    });
  };

  const addSocialLink = () => {
    // Find a unique key for the new link
    let keyCounter = 1;
    let tempKey = `social_link_${keyCounter}`;
    while (tempKey in profileData.socialLinks) {
      keyCounter++;
      tempKey = `social_link_${keyCounter}`;
    }
    
    setProfileData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [tempKey]: { domain: '', handle: '' },
      },
    }));
  };

  const removeSocialLink = (platform: string) => {
    setProfileData(prev => {
      const newLinks = { ...prev.socialLinks };
      delete newLinks[platform];
      return {
        ...prev,
        socialLinks: newLinks,
      };
    });
  };

  const renameSocialLink = (oldPlatform: string, newPlatform: string, value: { domain: string; handle: string }) => {
    // Only update if platform name actually changed
    if (oldPlatform === newPlatform) return;

    setProfileData(prev => {
      const newLinks = { ...prev.socialLinks };
      delete newLinks[oldPlatform];
      if (newPlatform.trim()) {
        newLinks[newPlatform] = value;
      }
      return {
        ...prev,
        socialLinks: newLinks,
      };
    });
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

    // Validate social links - both domain and handle must be filled
    const invalidLinks = Object.entries(profileData.socialLinks).filter(
      ([_, link]) => !link.domain.trim() || !link.handle.trim()
    );
    
    if (invalidLinks.length > 0) {
      alert('Please fill in both domain and handle for all social links, or remove incomplete ones.');
      return;
    }

    const scrollY = window.scrollY;
    let needsReload = false;

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
        needsReload = true; // Need to reload to get full image data
        // Refresh auth context so header updates
        await refreshUser?.();
      }

      if (bannerPreview && bannerInputRef.current?.files?.[0]) {
        const data = await uploadBannerImage(userId, bannerInputRef.current.files[0]);
        setProfileData(prev => ({ ...prev, bannerImageUrl: data.bannerImageUrl }));
        setBannerPreview(null);
        if (bannerInputRef.current) {
          bannerInputRef.current.value = '';
        }
        needsReload = true; // Need to reload to get full image data
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
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000); 
      
      // Only reload if we uploaded images
      if (needsReload) {
        isInitialLoadRef.current = true;
        await loadProfileData();
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollY);
        });
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      setMessage('Failed to save profile');
    } finally {
      setSaving(false);
    }
  }, [userId, profileData, profilePreview, bannerPreview, loadProfileData]);

  
  const saveSocialLink = useCallback(async (platform: string, link: SocialLink) => {
    if (!userId) return;

    try {
      setSaving(true);
      
      // Update profile data with new social link
      const updateData: UpdateProfileData = {
        username: profileData.username,
        displayName: profileData.displayName,
        bio: profileData.bio,
        location: profileData.location,
        socialLinks: {
          ...profileData.socialLinks,
          [platform]: link
        },
      };

      await updateUserProfile(userId, updateData);
      } catch (err) {
        console.error('Failed to save social link:', err);
        alert('Failed to save social link');
        // Reload on error to restore correct state
        await loadProfileData();
      } finally {
        setSaving(false);
    }
  }, [userId, profileData, loadProfileData]);

  const removeSocialLinkAndSave = useCallback(async (platform: string) => {
    if (!userId) return;

    try {
      setSaving(true);
      
      const newLinks = { ...profileData.socialLinks };
      delete newLinks[platform];
      
      // Update profile data without the deleted social link
      const updateData: UpdateProfileData = {
        username: profileData.username,
        displayName: profileData.displayName,
        bio: profileData.bio,
        location: profileData.location,
        socialLinks: newLinks,
      };

      await updateUserProfile(userId, updateData);
      // Don't call loadProfileData - local state already updated by removeSocialLink
    } catch (err) {
      console.error('Failed to delete social link:', err);
      alert('Failed to delete social link');
      // Reload on error to restore correct state
      await loadProfileData();
    } finally {
      setSaving(false);
    }
  }, [userId, profileData, loadProfileData]);



  return {
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
    addSocialLink,
    removeSocialLink,
    renameSocialLink,
    handleProfileImageChange,
    handleBannerImageChange,
    setProfilePreview,
    setBannerPreview,
    saveProfile,
    saveSocialLink,
    removeSocialLinkAndSave,
  };

};
