// frontend/src/services/userService.ts (REFACTORED)

import { api } from '../utils/apiClient';
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
  return api.get<UserSearchResponse>('/api/users/search', {
    q: query,
    ...(userId && { userId }),
  });
};

export const getUserProfile = async (userId: string): Promise<UserProfileResponse> => {
  return api.get<UserProfileResponse>(`/api/users/profile/${userId}`);
};

export const getOrCreateConversation = async (
  userId: string,
  otherUserId: string
): Promise<ConversationResponse> => {
  return api.post<ConversationResponse>('/api/messages/get-or-create', {
    userId,
    otherUserId,
  });
};

export const uploadProfileImage = async (userId: string, imageFile: File): Promise<{ profileImageUrl: string }> => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return api.uploadFile<{ profileImageUrl: string }>(`/api/users/${userId}/profile-image`, formData);
};

export const uploadBannerImage = async (userId: string, imageFile: File): Promise<{ bannerImageUrl: string }> => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return api.uploadFile<{ bannerImageUrl: string }>(`/api/users/${userId}/banner-image`, formData);
};

export const updateUserProfile = async (userId: string, profileData: UpdateProfileData): Promise<void> => {
  return api.put<void>(`/api/users/${userId}/profile`, profileData);
};

export const getBlockedUsers = async (userId: string): Promise<BlockedUsersResponse> => {
  const data = await api.get<BlockedUsersResponse>(`/api/users/${userId}/blocked`);
  
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
  return api.post<void>('/api/users/unblock', { userId, blockedUserId });
};

export const reportUser = async (
  reporterId: string,
  reportedUserId: string,
  reportType: string,
  description: string | null,
  conversationId: number | null
): Promise<void> => {
  return api.post<void>('/api/users/report', {
    reporterId,
    reportedUserId,
    reportType,
    description,
    conversationId,
  });
};

export const blockUser = async (
  userId: string,
  blockedUserId: string,
  reason: string
): Promise<void> => {
  return api.post<void>('/api/users/block', {
    userId,
    blockedUserId,
    reason,
  });
};
