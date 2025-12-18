export type ArtworkType = '2d' | '3d' | 'image';

export interface Artwork {
  id: number;
  userId: string;
  title: string;
  description: string | null;
  fileUrl: string;
  thumbnailUrl: string | null;
  fileType: ArtworkType;
  tags: string[] | null;
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArtworkUploadData {
  title: string;
  description: string;
  fileType: ArtworkType;
  tags: string;
  isPublic: boolean;
}
