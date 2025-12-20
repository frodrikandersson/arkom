import { config } from '../config/env';
import { ArtworkUploadData, Artwork } from '../models';

export interface UploadArtworkResponse {
  artwork: {
    id: number;
    userId: string;
    title: string;
    description: string;
    imageUrl: string;
    fileType: string;
    tags: string;
    isPublic: boolean;
    createdAt: Date;
  };
}

export interface GetUserArtworksParams {
  userId: string;
  includePrivate?: boolean;
  requesterId?: string;
}

export const uploadArtwork = async (
  userId: string,
  artworkData: ArtworkUploadData,
  imageFile: File
): Promise<UploadArtworkResponse> => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('title', artworkData.title);
  formData.append('description', artworkData.description);
  formData.append('fileType', artworkData.fileType);
  formData.append('tags', artworkData.tags);
  formData.append('isPublic', artworkData.isPublic.toString());

  const res = await fetch(`${config.apiUrl}/api/artworks/${userId}/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload artwork');
  }

  return data;
};

export const getUserArtworks = async (params: GetUserArtworksParams): Promise<{ artworks: Artwork[] }> => {
  const queryParams = new URLSearchParams();
  if (params.includePrivate) {
    queryParams.append('includePrivate', 'true');
  }
  if (params.requesterId) {
    queryParams.append('requesterId', params.requesterId);
  }

  const res = await fetch(`${config.apiUrl}/api/artworks/user/${params.userId}?${queryParams}`);
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load artworks');
  }
  
  return data;
};

