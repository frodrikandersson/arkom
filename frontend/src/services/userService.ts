import { config } from '../config/env';
import { UserSearchResult, UserProfile, SocialLinks, BlockedUser } from '../models';

export interface UserSearchResponse {
  users: UserSearchResult[];
}

export interface UserProfileResponse {
  profile: UserProfile;
}

export interface ConversationResponse {
  conversationId: number;
}

export interface UpdateProfileData {
  username: string;
  displayName: string;
  bio: string;
  location: string;
  socialLinks: SocialLinks;
}

export interface BlockedUsersResponse {
  blockedUsers: BlockedUser[];
}

export const searchUsers = async (query: string, userId?: string): Promise<UserSearchResponse> => {
  const queryParams = new URLSearchParams({
    q: query,
    ...(userId && { userId }),
  });
  
  const res = await fetch(`${config.apiUrl}/api/users/search?${queryParams}`);
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to search users');
  }
  
  return data;
};

export const getUserProfile = async (userId: string): Promise<UserProfileResponse> => {
  const res = await fetch(`${config.apiUrl}/api/users/profile/${userId}`);
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Profile not found');
  }
  
  return data;
};

export const getOrCreateConversation = async (
  userId: string,
  otherUserId: string
): Promise<ConversationResponse> => {
  const res = await fetch(`${config.apiUrl}/api/messages/get-or-create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, otherUserId }),
  });
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create conversation');
  }
  
  return data;
};

export const uploadProfileImage = async (userId: string, imageFile: File): Promise<{ profileImageUrl: string }> => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const res = await fetch(`${config.apiUrl}/api/users/${userId}/profile-image`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload profile image');
  }

  return data;
};

export const uploadBannerImage = async (userId: string, imageFile: File): Promise<{ bannerImageUrl: string }> => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const res = await fetch(`${config.apiUrl}/api/users/${userId}/banner-image`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload banner image');
  }

  return data;
};

export const updateUserProfile = async (userId: string, profileData: UpdateProfileData): Promise<void> => {
  const res = await fetch(`${config.apiUrl}/api/users/${userId}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to update profile');
  }

  return data;
};

export const getBlockedUsers = async (userId: string): Promise<BlockedUsersResponse> => {
  const res = await fetch(`${config.apiUrl}/api/users/${userId}/blocked`);
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load blocked users');
  }

  // Fetch user details for each blocked user
  const usersWithDetails = await Promise.all(
    data.blockedUsers.map(async (blocked: BlockedUser) => {
      try {
        const userRes = await getUserProfile(blocked.blockedUserId);
        return {
          ...blocked,
          displayName: userRes.profile?.displayName || 'Unknown User',
          profileImageUrl: userRes.profile?.profileImageUrl,
        };
      } catch {
        return {
          ...blocked,
          displayName: 'Unknown User',
        };
      }
    })
  );

  return { blockedUsers: usersWithDetails };
};

export const unblockUser = async (userId: string, blockedUserId: string): Promise<void> => {
  const res = await fetch(`${config.apiUrl}/api/users/unblock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, blockedUserId }),
  });
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to unblock user');
  }
};

export const reportUser = async (
  reporterId: string,
  reportedUserId: string,
  reportType: string,
  description: string | null,
  conversationId: number | null
): Promise<void> => {
  const res = await fetch(`${config.apiUrl}/api/users/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reporterId,
      reportedUserId,
      reportType,
      description,
      conversationId,
    }),
  });
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit report');
  }
};

export const blockUser = async (
  userId: string,
  blockedUserId: string,
  reason: string
): Promise<void> => {
  const res = await fetch(`${config.apiUrl}/api/users/block`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      blockedUserId,
      reason,
    }),
  });
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to block user');
  }
};
