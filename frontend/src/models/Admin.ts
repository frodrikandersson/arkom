export interface AdminUser {
  id: number;
  userId: string;
  username: string | null;
  displayName: string | null;
  email: string | null;
  isAdmin: boolean;
  bio: string | null;
  location: string | null;
  profileImageUrl: string | null;
  updatedAt: Date;
}
