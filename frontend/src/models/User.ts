export interface SocialLink {
  domain: string;
  handle: string;
}

export interface SocialLinks {
  [key: string]: SocialLink;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  location: string;
  profileImageUrl: string;
  bannerImageUrl: string;
  socialLinks: SocialLinks;
  portfolioCount?: number;
  memberSince?: Date;
}

export interface UserSettings {
  id: number;
  userId: string;
  username: string | null;
  timezone: string;
  displayName: string | null;
  bio: string | null;
  location: string | null;
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
  socialLinks: SocialLinks | null;
  updatedAt: Date;
}

export interface BlockedUser {
  id: number;
  blockedUserId: string;
  reason: string | null;
  blockedAt: Date;
  displayName?: string;
  profileImageUrl?: string;
}

export interface UserReport {
  id: number;
  reporterId: string;
  reportedUserId: string;
  reportType: 'spam' | 'harassment' | 'inappropriate' | 'scam' | 'other';
  description: string | null;
  conversationId: number | null;
  messageId: number | null;
  status: 'pending' | 'reviewed' | 'resolved';
  reportedAt: Date;
}

export interface UserSearchResult {
  id: string;
  username?: string;
  displayName: string;
  profileImageUrl?: string;
}

